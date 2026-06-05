'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, Globe, Building2, Lightbulb, GitMerge, ArrowRight, FlaskConical } from 'lucide-react';
import { getEntity, RULES_PORTFOLIO } from '@hos/shared/accounting-os';
import { useAcctOs } from '../_context';
import { useAcctState } from '../_store';
import { card, Badge } from '../_ui';
import {
  globalRules, hotelRules, rulesAffectingHotel, allRules, suggestions, conflicts,
  conflictsForHotel, coverageByHotel, monthMatchCount, lastMatched, hotelsAffected, actionSummary, matchedTransactions,
} from '../_rules';
import { RuleTabs, ScopeBadge, RuleStatusBadge, SummaryCard, SourceLabel } from './_shared';
import { CreateRuleModal, type CreateRulePrefill } from './_CreateRule';

export default function RulesOverviewPage() {
  const { selection, selectHotel } = useAcctOs();
  const [create, setCreate] = useState<CreateRulePrefill | null>(null);
  return (
    <div className="max-w-[1400px] mx-auto flex flex-col gap-5">
      <RuleTabs />
      {selection.kind === 'hotel'
        ? <SingleHotel hotelId={selection.hotelId} onCreate={setCreate} />
        : <AllHotels onCreate={setCreate} onPick={selectHotel} />}
      {create && <CreateRuleModal prefill={create} onClose={() => setCreate(null)} />}
    </div>
  );
}

/* ─────────── ALL HOTELS ─────────── */
function AllHotels({ onCreate, onPick }: { onCreate: (p: CreateRulePrefill) => void; onPick: (id: string) => void }) {
  const router = useRouter();
  const store = useAcctState();
  const all = allRules(store);
  const g = globalRules(store);
  const hl = hotelRules(store);
  const sug = suggestions(store);
  const cf = conflicts(store);
  const cov = coverageByHotel(store);
  const top = [...all].filter((r) => r.status === 'active').sort((a, b) => monthMatchCount(b) - monthMatchCount(a)).slice(0, 6);

  const openHotel = (id: string) => { onPick(id); router.push('/web/accounting/rules'); };

  return (
    <>
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold" style={{ color: '#222' }}>Rules</h1>
          <p className="text-sm mt-0.5" style={{ color: '#929292' }}>Create global and hotel-level rules to automatically organize bank and credit card transactions.</p>
          <p className="text-xs mt-0.5 max-w-2xl" style={{ color: '#b0b0b0' }}>Global rules apply across all hotels. Hotel-level rules apply only to one selected hotel and override global rules.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => onCreate({ scope: 'global' })} className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl text-xs font-semibold" style={{ background: '#fff', border: '1px solid #dddddd', color: '#6a6a6a' }}><Globe className="w-3.5 h-3.5" /> Create Global Rule</button>
          <button onClick={() => onCreate({ scope: 'hotel_level' })} className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl text-xs font-semibold" style={{ background: '#fff', border: '1px solid #dddddd', color: '#6a6a6a' }}><Building2 className="w-3.5 h-3.5" /> Create Hotel-Level Rule</button>
          <button onClick={() => onCreate({})} className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl text-xs font-semibold" style={{ background: '#6a4ec0', color: '#fff' }}><Plus className="w-4 h-4" /> Create Rule</button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        <SummaryCard label="Total Rules" value={RULES_PORTFOLIO.total} />
        <SummaryCard label="Global Rules" value={RULES_PORTFOLIO.global} accent="#6a4ec0" />
        <SummaryCard label="Hotel-Level" value={RULES_PORTFOLIO.hotelLevel} accent="#1d4ed8" />
        <SummaryCard label="Active" value={RULES_PORTFOLIO.active} accent="#15803d" />
        <SummaryCard label="Disabled" value={RULES_PORTFOLIO.disabled} />
        <SummaryCard label="Suggested" value={sug.length || RULES_PORTFOLIO.suggested} accent="#b45309" />
        <SummaryCard label="Conflicts" value={cf.length || RULES_PORTFOLIO.conflicts} accent="#b91c1c" />
        <SummaryCard label="Matched / mo" value={RULES_PORTFOLIO.matchedThisMonth.toLocaleString()} />
      </div>

      {/* A. Rule summary by scope */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        <ScopeSummary icon={<Globe className="w-5 h-5" />} color="#6a4ec0" bg="#ece4fb" count={g.filter((r) => r.status === 'active').length} title="Global Rules" desc="Apply across all HOS hotel entities." action="View Global Rules" href="/web/accounting/rules/global" />
        <ScopeSummary icon={<Building2 className="w-5 h-5" />} color="#1d4ed8" bg="#dbeafe" count={hl.filter((r) => r.status === 'active').length} title="Hotel-Level Rules" desc="Apply only to specific hotels." action="View Hotel-Level Rules" href="/web/accounting/rules/hotel-level" />
        <ScopeSummary icon={<Lightbulb className="w-5 h-5" />} color="#b45309" bg="#fef3c7" count={sug.length} title="Suggested Rules" desc="Repeated patterns you can turn into rules." action="View Suggestions" href="/web/accounting/rules/suggested" />
        <ScopeSummary icon={<GitMerge className="w-5 h-5" />} color="#b91c1c" bg="#fee2e2" count={cf.length} title="Conflicts" desc="Where multiple rules match the same transaction." action="Review Conflicts" href="/web/accounting/rules/conflicts" />
      </div>

      {/* B. Coverage by hotel */}
      <Section title="Rule Coverage by Hotel">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead><tr style={{ background: '#f7f7f7', borderBottom: '1px solid #dddddd' }}>{['Hotel', 'Legal Entity', 'Code', 'Hotel Rules', 'Global Applied', 'Matched / mo', 'Unmatched', 'Conflicts', 'Action'].map((h, i) => <th key={h} className="text-[10px] font-semibold uppercase tracking-wide py-2.5 px-3 whitespace-nowrap" style={{ color: '#6a6a6a', textAlign: i >= 3 && i <= 7 ? 'center' : 'left' }}>{h}</th>)}</tr></thead>
            <tbody>
              {cov.map((c) => { const h = getEntity(c.hotelId)!; return (
                <tr key={c.hotelId} className="hover:bg-[#fafafa]" style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td className="py-2.5 px-3 font-medium whitespace-nowrap" style={{ color: '#222' }}>{h.hotelName}</td>
                  <td className="py-2.5 px-3 text-xs" style={{ color: '#6a6a6a' }}>{h.legalEntity}</td>
                  <td className="py-2.5 px-3 text-xs font-mono" style={{ color: '#6a6a6a' }}>{h.propertyCode}</td>
                  <td className="py-2.5 px-3 text-center text-xs" style={{ color: '#1d4ed8' }}>{c.hotelRules}</td>
                  <td className="py-2.5 px-3 text-center text-xs" style={{ color: '#6a4ec0' }}>{c.globalApplied}</td>
                  <td className="py-2.5 px-3 text-center text-xs" style={{ color: '#3f3f3f' }}>{c.matched}</td>
                  <td className="py-2.5 px-3 text-center text-xs" style={{ color: c.unmatched ? '#b45309' : '#15803d' }}>{c.unmatched}</td>
                  <td className="py-2.5 px-3 text-center text-xs" style={{ color: c.conflicts ? '#b91c1c' : '#3f3f3f' }}>{c.conflicts || '—'}</td>
                  <td className="py-2.5 px-3"><button onClick={() => openHotel(c.hotelId)} className="text-xs font-semibold whitespace-nowrap" style={{ color: '#6a4ec0' }}>View Hotel Rules</button></td>
                </tr>
              ); })}
            </tbody>
          </table>
        </div>
      </Section>

      {/* C. Top performing rules */}
      <Section title="Top Performing Rules">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead><tr style={{ background: '#f7f7f7', borderBottom: '1px solid #dddddd' }}>{['Rule Name', 'Scope', 'Source', 'Matched / mo', 'Last Matched', 'Status', 'Action'].map((h, i) => <th key={h} className="text-[10px] font-semibold uppercase tracking-wide py-2.5 px-3 whitespace-nowrap" style={{ color: '#6a6a6a', textAlign: i === 3 ? 'center' : 'left' }}>{h}</th>)}</tr></thead>
            <tbody>
              {top.map((r) => (
                <tr key={r.id} className="hover:bg-[#fafafa] cursor-pointer" style={{ borderBottom: '1px solid #f0f0f0' }} onClick={() => router.push(`/web/accounting/rules/${r.id}`)}>
                  <td className="py-2.5 px-3 font-medium" style={{ color: '#222' }}>{r.name}</td>
                  <td className="py-2.5 px-3"><ScopeBadge rule={r} code={r.hotelId ? getEntity(r.hotelId)?.propertyCode : undefined} /></td>
                  <td className="py-2.5 px-3 text-xs" style={{ color: '#6a6a6a' }}>{SourceLabel(r.source)}</td>
                  <td className="py-2.5 px-3 text-center text-xs font-semibold" style={{ color: '#6a4ec0' }}>{monthMatchCount(r)}×</td>
                  <td className="py-2.5 px-3 text-xs" style={{ color: '#6a6a6a' }}>{lastMatched(r) === '—' ? '—' : lastMatched(r).slice(5)}</td>
                  <td className="py-2.5 px-3"><RuleStatusBadge status={r.status} /></td>
                  <td className="py-2.5 px-3"><Link href={`/web/accounting/rules/${r.id}`} className="text-xs font-semibold" style={{ color: '#6a4ec0' }}>View Rule</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* D. Rule issues */}
      <Section title="Rule Issues">
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-2">
          {[
            { sev: 'Medium', msg: `${cf.length} rules have conflicts where multiple rules match the same transactions.`, action: 'Review Conflicts', href: '/web/accounting/rules/conflicts' },
            { sev: 'Low', msg: 'Some rules match too broadly and may over-categorize.', action: 'View All Rules', href: '/web/accounting/rules/all' },
            { sev: 'Low', msg: `${RULES_PORTFOLIO.disabled} rules have not been used recently.`, action: 'View Disabled', href: '/web/accounting/rules/all' },
            { sev: 'Medium', msg: 'Some global rules are overridden by hotel-level rules.', action: 'Review Conflicts', href: '/web/accounting/rules/conflicts' },
          ].map((i, idx) => (
            <div key={idx} className="flex items-center gap-3 px-3 py-2.5 rounded-xl" style={{ background: '#f7f7f7' }}>
              <Badge label={i.sev} fg={i.sev === 'Medium' ? '#b45309' : '#6a6a6a'} bg={i.sev === 'Medium' ? '#fef3c7' : '#f0f0f0'} />
              <span className="text-sm flex-1" style={{ color: '#3f3f3f' }}>{i.msg}</span>
              <Link href={i.href} className="text-xs font-semibold whitespace-nowrap" style={{ color: '#6a4ec0' }}>{i.action}</Link>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}

/* ─────────── SINGLE HOTEL ─────────── */
function SingleHotel({ hotelId, onCreate }: { hotelId: string; onCreate: (p: CreateRulePrefill) => void }) {
  const router = useRouter();
  const store = useAcctState();
  const h = getEntity(hotelId);
  const hl = hotelRules(store, hotelId);
  const affecting = rulesAffectingHotel(store, hotelId);
  const globalsHere = affecting.filter((r) => r.scope === 'global');
  const sug = suggestions(store).filter((s) => s.scope === 'global' || s.hotelId === hotelId);
  const cf = conflictsForHotel(store, hotelId);
  const matched = affecting.filter((r) => r.status === 'active').reduce((n, r) => n + matchedTransactions(r, hotelId).length, 0);

  return (
    <>
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Badge label="One Hotel" fg="#1d4ed8" bg="#dbeafe" />
          <div><h1 className="text-xl font-bold" style={{ color: '#222' }}>Rules for {h?.hotelName}</h1><p className="text-sm" style={{ color: '#929292' }}>{h?.legalEntity} · {h?.propertyCode} · Manage rules that affect this hotel’s transactions.</p><p className="text-xs mt-0.5" style={{ color: '#b0b0b0' }}>Hotel-level rules override global rules for this hotel.</p></div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Link href="/web/accounting/rules/test" className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl text-xs font-semibold" style={{ background: '#fff', border: '1px solid #dddddd', color: '#6a6a6a' }}><FlaskConical className="w-3.5 h-3.5" /> Rule Tester</Link>
          <button onClick={() => onCreate({ scope: 'hotel_level', hotelId })} className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl text-xs font-semibold" style={{ background: '#6a4ec0', color: '#fff' }}><Plus className="w-4 h-4" /> Create Hotel-Level Rule</button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <SummaryCard label="Hotel-Level Rules" value={hl.length} accent="#1d4ed8" />
        <SummaryCard label="Global Rules Here" value={globalsHere.length} accent="#6a4ec0" />
        <SummaryCard label="Matched / mo" value={matched} />
        <SummaryCard label="Unmatched" value={Math.max(0, 18 - matched > 0 ? 18 : 4)} accent="#b45309" />
        <SummaryCard label="Suggested" value={sug.length} accent="#b45309" />
        <SummaryCard label="Conflicts" value={cf.length} accent={cf.length ? '#b91c1c' : '#15803d'} />
      </div>

      {/* A. Hotel-level rules */}
      <Section title="Hotel-Level Rules" action={<button onClick={() => onCreate({ scope: 'hotel_level', hotelId })} className="text-xs font-semibold" style={{ color: '#6a4ec0' }}>+ Create</button>}>
        <RuleMiniTable rules={hl} router={router} emptyText="No hotel-level rules for this hotel yet. Create one for transactions that need property-specific handling." />
      </Section>

      {/* B. Global rules affecting this hotel */}
      <Section title="Global Rules Affecting This Hotel">
        <RuleMiniTable rules={globalsHere.slice(0, 10)} router={router} emptyText="No global rules affect this hotel yet." />
      </Section>

      {/* C + D */}
      <div className="grid lg:grid-cols-2 gap-5">
        <Section title="Suggested Rules for This Hotel">
          <div className="p-4 flex flex-col gap-2">
            {sug.slice(0, 4).map((s) => (
              <div key={s.id} className="flex items-center gap-2"><Lightbulb className="w-4 h-4" style={{ color: '#b45309' }} /><span className="text-sm flex-1" style={{ color: '#3f3f3f' }}>{s.name}</span><Badge label={s.confidence} fg="#b45309" bg="#fef3c7" /></div>
            ))}
            {sug.length === 0 && <p className="text-xs" style={{ color: '#929292' }}>No suggested rules right now.</p>}
            <Link href="/web/accounting/rules/suggested" className="text-xs font-semibold mt-1" style={{ color: '#6a4ec0' }}>View all suggestions <ArrowRight className="w-3 h-3 inline" /></Link>
          </div>
        </Section>
        <Section title="Rule Conflicts for This Hotel">
          <div className="p-4 flex flex-col gap-2">
            {cf.map((c) => (<div key={c.id} className="flex items-center gap-2"><GitMerge className="w-4 h-4" style={{ color: '#b91c1c' }} /><span className="text-sm flex-1" style={{ color: '#3f3f3f' }}>{c.ruleA.name} overrides {c.ruleB.name}</span></div>))}
            {cf.length === 0 && <p className="text-xs" style={{ color: '#929292' }}>No rule conflicts found for this hotel.</p>}
            {cf.length > 0 && <Link href="/web/accounting/rules/conflicts" className="text-xs font-semibold mt-1" style={{ color: '#6a4ec0' }}>Review conflicts <ArrowRight className="w-3 h-3 inline" /></Link>}
          </div>
        </Section>
      </div>
    </>
  );
}

function RuleMiniTable({ rules, router, emptyText }: { rules: ReturnType<typeof allRules>; router: ReturnType<typeof useRouter>; emptyText: string }) {
  if (rules.length === 0) return <p className="px-5 py-6 text-sm" style={{ color: '#929292' }}>{emptyText}</p>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead><tr style={{ background: '#f7f7f7', borderBottom: '1px solid #dddddd' }}>{['Rule', 'When', 'Sets', 'Matched', 'Status'].map((h) => <th key={h} className="text-left text-[10px] font-semibold uppercase tracking-wide py-2.5 px-3" style={{ color: '#6a6a6a' }}>{h}</th>)}</tr></thead>
        <tbody>
          {rules.map((r) => (
            <tr key={r.id} className="hover:bg-[#fafafa] cursor-pointer" style={{ borderBottom: '1px solid #f0f0f0' }} onClick={() => router.push(`/web/accounting/rules/${r.id}`)}>
              <td className="py-2.5 px-3 font-medium" style={{ color: '#222' }}>{r.name}</td>
              <td className="py-2.5 px-3 text-xs" style={{ color: '#3f3f3f' }}>contains “{r.conditions[0]?.value}”</td>
              <td className="py-2.5 px-3 text-xs" style={{ color: '#6a6a6a' }}>{actionSummary(r)}</td>
              <td className="py-2.5 px-3 text-xs font-semibold" style={{ color: '#6a4ec0' }}>{monthMatchCount(r)}×</td>
              <td className="py-2.5 px-3"><RuleStatusBadge status={r.status} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ScopeSummary({ icon, color, bg, count, title, desc, action, href }: { icon: React.ReactNode; color: string; bg: string; count: number; title: string; desc: string; action: string; href: string }) {
  return (
    <div className="p-4 flex flex-col gap-2 rounded-2xl" style={card}>
      <div className="flex items-center gap-2"><div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: bg, color }}>{icon}</div><span className="text-2xl font-bold" style={{ color: '#222' }}>{count}</span></div>
      <div><p className="text-sm font-bold" style={{ color: '#222' }}>{title}</p><p className="text-xs" style={{ color: '#929292' }}>{desc}</p></div>
      <Link href={href} className="text-xs font-semibold mt-auto" style={{ color }}>{action} <ArrowRight className="w-3 h-3 inline" /></Link>
    </div>
  );
}
function Section({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return <div className="rounded-2xl overflow-hidden" style={card}><div className="px-5 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid #f0f0f0' }}><h2 className="text-sm font-bold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>{title}</h2>{action}</div>{children}</div>;
}
