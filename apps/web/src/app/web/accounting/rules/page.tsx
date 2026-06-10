'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Wand2, ArrowDown, Plus, ArrowRight, AlertTriangle, Sparkles, GitMerge, ShieldAlert,
  ListChecks, TrendingUp, Building2,
} from 'lucide-react';
import { getEntity, SEED_RICH_RULES, type RichRule } from '@hos/shared/accounting-os';
import { useAcctOs } from '../_context';
import { hotelLabel } from '../_domain';
import { card, Badge, PageHeader, PURPLE } from '../_ui';
import { SummaryCard, SectionHeader } from '../dashboard/_components';
import { ruleRows, rulesSummary, ruleCoverage, HIGH_RISK_ITEMS } from './_data';
import { RuleTableRow } from './_RuleRow';

export default function RulesPage() {
  const { selection } = useAcctOs();
  const hotelId = selection.kind === 'hotel' ? selection.hotelId : undefined;
  return <RulesView hotelId={hotelId} />;
}

function RulesView({ hotelId }: { hotelId?: string }) {
  const router = useRouter();
  const { selectHotel } = useAcctOs();
  const sum = useMemo(() => rulesSummary(hotelId), [hotelId]);
  const rows = useMemo(() => ruleRows(hotelId).sort((a, b) => b.matched - a.matched), [hotelId]);
  const coverage = useMemo(() => ruleCoverage(), []);

  return (
    <div className="max-w-[1500px] mx-auto flex flex-col gap-5">
      <PageHeader
        scope={hotelId ? hotelLabel(hotelId).name : 'All Hotels'} scopeFg={hotelId ? '#1d4ed8' : PURPLE} scopeBg={hotelId ? '#dbeafe' : '#ece4fb'}
        title={hotelId ? `Rules for ${hotelLabel(hotelId).name}` : 'Rules'}
        subtitle={hotelId ? 'Hotel-level rules override global rules for this hotel.' : 'Create global and hotel-level rules that help code, review, and reconcile statement activity.'}
        actions={
          <>
            <Link href="/web/accounting/rules/new" className="h-9 px-3.5 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5" style={{ background: PURPLE, color: '#fff' }}><Plus className="w-4 h-4" /> Create Rule</Link>
            <Link href="/web/accounting/rules/suggested" className="h-9 px-3 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5" style={{ background: '#fff', border: '1px solid #dddddd', color: '#6a6a6a' }}><Sparkles className="w-3.5 h-3.5" /> Suggested</Link>
            <Link href="/web/accounting/rules/tester" className="h-9 px-3 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5" style={{ background: '#fff', border: '1px solid #dddddd', color: '#6a6a6a' }}><ListChecks className="w-3.5 h-3.5" /> Rule Tester</Link>
          </>
        }
      />

      {/* Priority strip */}
      <div className="rounded-xl p-3.5 flex items-center gap-3 flex-wrap" style={{ background: '#f6f4fd', border: '1px solid #e3d9fb' }}>
        <div className="flex items-center gap-2 text-xs font-semibold" style={{ color: PURPLE }}>
          <Badge label="1. Hotel-level" fg="#1d4ed8" bg="#dbeafe" /> <ArrowDown className="w-3 h-3 rotate-[-90deg]" /> <Badge label="2. Global" fg={PURPLE} bg="#ece4fb" /> <ArrowDown className="w-3 h-3 rotate-[-90deg]" /> <Badge label="3. System suggestion" fg="#6a6a6a" bg="#f0f0f0" />
        </div>
        <p className="text-xs" style={{ color: '#6a6a6a' }}>Hotel-level rules override global rules. Vendors stay hotel-specific even when a global rule sets a name. High-risk rules require review — nothing auto-posts in V1.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <SummaryCard icon={<Wand2 className="w-4 h-4" />} value={String(sum.total)} label="Total Rules" subtext="Global & hotel-level" tone="neutral" href="/web/accounting/rules/all" />
        <SummaryCard icon={<Building2 className="w-4 h-4" />} value={String(sum.global)} label="Global Rules" subtext="Across all hotels" tone="brand" href="/web/accounting/rules/global" />
        <SummaryCard icon={<Building2 className="w-4 h-4" />} value={String(sum.hotelLevel)} label="Hotel-Level Rules" subtext="Per hotel" tone="brand" href="/web/accounting/rules/hotel-level" />
        <SummaryCard icon={<ListChecks className="w-4 h-4" />} value={String(sum.active)} label="Active Rules" subtext="Evaluating lines" tone="good" href="/web/accounting/rules/all" />
        <SummaryCard icon={<Sparkles className="w-4 h-4" />} value={String(sum.suggested)} label="Suggested Rules" subtext="From repeated patterns" tone="brand" href="/web/accounting/rules/suggested" />
        <SummaryCard icon={<GitMerge className="w-4 h-4" />} value={String(sum.conflicts)} label="Conflicts" subtext="Different suggestions" tone={sum.conflicts ? 'warning' : 'good'} href="/web/accounting/rules/conflicts" />
        <SummaryCard icon={<ShieldAlert className="w-4 h-4" />} value={String(sum.reviewRequired)} label="Review Required" subtext="High-risk matches" tone={sum.reviewRequired ? 'warning' : 'good'} href="/web/accounting/rules/high-risk" />
        <SummaryCard icon={<TrendingUp className="w-4 h-4" />} value={sum.matchedThisPeriod.toLocaleString()} label="Matched This Period" subtext="Lines affected" tone="neutral" />
      </div>

      {/* High-risk activity */}
      <section className="flex flex-col gap-3">
        <SectionHeader title="High-Risk Rule Activity" subtitle="Rules found transactions that need accountant review before posting." action={<Link href="/web/accounting/rules/high-risk" className="text-xs font-semibold inline-flex items-center gap-1" style={{ color: PURPLE }}>View All <ArrowRight className="w-3 h-3" /></Link>} />
        <div className="grid md:grid-cols-2 gap-3">
          {HIGH_RISK_ITEMS.map((it, i) => (
            <div key={i} className="p-4 rounded-2xl flex items-start gap-3" style={card}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#fef3c7', color: '#b45309' }}><AlertTriangle className="w-4 h-4" /></div>
              <div className="flex-1"><p className="text-sm font-bold" style={{ color: '#222' }}>{it.rule}</p><p className="text-xs mt-0.5" style={{ color: '#222' }}>{it.transaction}</p><p className="text-[11px] mt-0.5" style={{ color: '#929292' }}>{it.reason}</p></div>
              <Link href="/web/accounting/reconciliation-workbench" className="text-[11px] font-semibold whitespace-nowrap self-center" style={{ color: PURPLE }}>{it.action}</Link>
            </div>
          ))}
        </div>
      </section>

      {/* Top rules this period */}
      <section className="flex flex-col gap-3">
        <SectionHeader title="Top Rules This Period" action={<Link href="/web/accounting/rules/all" className="text-xs font-semibold inline-flex items-center gap-1" style={{ color: PURPLE }}>All Rules <ArrowRight className="w-3 h-3" /></Link>} />
        <div className="overflow-x-auto rounded-2xl" style={card}>
          <table className="w-full text-sm border-collapse">
            <thead><tr style={{ background: '#f7f7f7', borderBottom: '1px solid #dddddd' }}>
              {['Rule', 'Scope', 'Sets', 'Risk', 'Review', 'Matched', 'Accuracy', 'Status', ''].map((h) => (
                <th key={h} className="text-[10px] font-semibold uppercase tracking-wide py-2.5 px-2.5 whitespace-nowrap" style={{ color: '#6a6a6a', textAlign: ['Matched', 'Accuracy'].includes(h) ? 'right' : 'left' }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {rows.slice(0, 12).map((r) => <RuleTableRow key={r.rule.id} r={r} onOpen={() => router.push(`/web/accounting/rules/${r.rule.id}`)} />)}
            </tbody>
          </table>
        </div>
      </section>

      {/* Coverage by hotel (all-hotels only) */}
      {!hotelId && (
        <section className="flex flex-col gap-3">
          <SectionHeader title="Rule Coverage by Hotel" subtitle="How many rules are active for each hotel and how often they help." />
          <div className="overflow-x-auto rounded-2xl" style={card}>
            <table className="w-full text-sm border-collapse">
              <thead><tr style={{ background: '#f7f7f7', borderBottom: '1px solid #dddddd' }}>
                {['Hotel', 'Code', 'Global', 'Hotel-Level', 'Matched', 'Corrected', 'Review', 'Conflicts', 'Accuracy', ''].map((h) => (
                  <th key={h} className="text-[10px] font-semibold uppercase tracking-wide py-2.5 px-2.5 whitespace-nowrap" style={{ color: '#6a6a6a', textAlign: ['Global', 'Hotel-Level', 'Matched', 'Corrected', 'Review', 'Conflicts', 'Accuracy'].includes(h) ? 'right' : 'left' }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {coverage.map((c) => {
                  const h = getEntity(c.hotelId)!;
                  return (
                    <tr key={c.hotelId} className="hover:bg-[#fafafa] cursor-pointer" style={{ borderBottom: '1px solid #f0f0f0' }} onClick={() => { selectHotel(c.hotelId); router.push('/web/accounting/rules'); }}>
                      <td className="py-2.5 px-2.5 text-sm truncate max-w-[180px]" style={{ color: '#222' }}>{h.hotelName}</td>
                      <td className="py-2.5 px-2.5 text-xs font-mono" style={{ color: '#6a6a6a' }}>{h.propertyCode}</td>
                      <td className="py-2.5 px-2.5 text-xs text-right" style={{ color: '#6a6a6a' }}>{c.global}</td>
                      <td className="py-2.5 px-2.5 text-xs text-right" style={{ color: '#6a6a6a' }}>{c.hotelLevel}</td>
                      <td className="py-2.5 px-2.5 text-xs text-right" style={{ color: '#222' }}>{c.matched}</td>
                      <td className="py-2.5 px-2.5 text-xs text-right" style={{ color: '#6a6a6a' }}>{c.corrected}</td>
                      <td className="py-2.5 px-2.5 text-xs text-right" style={{ color: c.reviewRequired ? '#b45309' : '#929292' }}>{c.reviewRequired}</td>
                      <td className="py-2.5 px-2.5 text-xs text-right" style={{ color: c.conflicts ? '#b91c1c' : '#929292' }}>{c.conflicts || '—'}</td>
                      <td className="py-2.5 px-2.5 text-xs text-right font-semibold" style={{ color: '#15803d' }}>{c.accuracy}%</td>
                      <td className="py-2.5 px-2.5 text-right"><span className="text-xs font-semibold" style={{ color: PURPLE }}>Open</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}

