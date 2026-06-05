'use client';

import { use, useState, Suspense, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft, Pencil, FlaskConical, Play, Copy, Power, MoreHorizontal, GitMerge,
} from 'lucide-react';
import { getEntity, HOTEL_ENTITIES } from '@hos/shared/accounting-os';
import { useAcctState, setRuleStatus, logRuleApplied, logRuleTested } from '../../_store';
import {
  oneRule, monthMatchCount, matchCount, lastMatched, matchedTransactions,
  conflicts, ruleSummaryText, conditionSummary, hotelsAffected,
} from '../../_rules';
import { card, Badge, money, fmtDate } from '../../_ui';
import { ScopeBadge, RuleStatusBadge, SourceLabel } from '../_shared';
import { CreateRuleModal } from '../_CreateRule';

const TABS = ['Overview', 'Conditions', 'Actions', 'Matched Transactions', 'Performance', 'Conflicts', 'Activity Log'] as const;
type Tab = typeof TABS[number];

function Inner({ id }: { id: string }) {
  const router = useRouter();
  const params = useSearchParams();
  const store = useAcctState();
  const r = oneRule(store, id);
  const [tab, setTab] = useState<Tab>((params.get('tab') as Tab) || 'Overview');
  const [editOpen, setEditOpen] = useState(params.get('edit') === '1');

  if (!r) return <div className="max-w-5xl mx-auto"><Link href="/web/accounting/rules" className="text-sm" style={{ color: '#6a6a6a' }}><ArrowLeft className="w-4 h-4 inline" /> Rules</Link><p className="mt-6 text-sm" style={{ color: '#929292' }}>Rule not found.</p></div>;

  const code = r.hotelId ? getEntity(r.hotelId)?.propertyCode : undefined;
  const base = { name: r.name, scope: r.scope, hotelId: r.hotelId };
  const matched = matchedTransactions(r);
  const ruleConflicts = conflicts(store).filter((c) => c.ruleA.id === r.id || c.ruleB.id === r.id);

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-5">
      <Link href="/web/accounting/rules/all" className="inline-flex items-center gap-1 text-sm" style={{ color: '#6a6a6a' }}><ArrowLeft className="w-4 h-4" /> Rules</Link>

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 flex-wrap"><h1 className="text-xl font-bold" style={{ color: '#222' }}>{r.name}</h1><ScopeBadge rule={r} code={code} /><RuleStatusBadge status={r.status} /></div>
          <p className="text-sm" style={{ color: '#929292' }}>{r.scope === 'global' ? 'Global Rule' : `Hotel-Level Rule · ${getEntity(r.hotelId ?? '')?.hotelName}`} · {SourceLabel(r.source)} · {r.status === 'active' ? 'Active' : r.status}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setEditOpen(true)} className="h-9 px-3 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5" style={{ background: '#fff', border: '1px solid #dddddd', color: '#6a6a6a' }}><Pencil className="w-3.5 h-3.5" /> Edit Rule</button>
          <Link href={`/web/accounting/rules/test?rule=${r.id}`} className="h-9 px-3 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5" style={{ background: '#fff', border: '1px solid #dddddd', color: '#6a6a6a' }}><FlaskConical className="w-3.5 h-3.5" /> Test Rule</Link>
          <button onClick={() => { logRuleApplied({ id: r.id, ...base }, matched.length); }} className="h-9 px-3 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5" style={{ background: '#fff', border: '1px solid #dddddd', color: '#6a6a6a' }}><Play className="w-3.5 h-3.5" /> Apply to Existing</button>
          <button onClick={() => setRuleStatus(r.id, base, r.status === 'disabled' ? 'active' : 'disabled')} className="h-9 px-3 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5" style={{ background: r.status === 'disabled' ? '#6a4ec0' : '#fff', border: '1px solid #dddddd', color: r.status === 'disabled' ? '#fff' : '#6a6a6a' }}><Power className="w-3.5 h-3.5" /> {r.status === 'disabled' ? 'Enable' : 'Disable'}</button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <SC label="Scope" value={r.scope === 'global' ? 'Global' : 'Hotel'} accent="#6a4ec0" />
        <SC label="Source" value={SourceLabel(r.source)} />
        <SC label="Matched / mo" value={String(monthMatchCount(r))} />
        <SC label="Total Matches" value={String(matchCount(r))} />
        <SC label="Last Matched" value={lastMatched(r) === '—' ? '—' : lastMatched(r).slice(5)} />
        <SC label="Conflicts" value={String(ruleConflicts.length)} accent={ruleConflicts.length ? '#b91c1c' : '#15803d'} />
        <SC label="Priority" value={String(r.priority)} />
      </div>

      <div className="flex gap-1 overflow-x-auto" style={{ borderBottom: '1px solid #dddddd' }}>
        {TABS.map((t) => <button key={t} onClick={() => setTab(t)} className="px-3.5 py-2.5 text-sm font-semibold whitespace-nowrap" style={{ color: tab === t ? '#6a4ec0' : '#6a6a6a', borderBottom: tab === t ? '2px solid #6a4ec0' : '2px solid transparent' }}>{t}</button>)}
      </div>

      {tab === 'Overview' && (
        <div className="flex flex-col gap-5">
          <Sect title="Rule Summary"><Info label="Rule Name" value={r.name} /><Info label="Scope" value={r.scope === 'global' ? 'Global' : 'Hotel-Level'} /><Info label="Applies To" value={r.scope === 'global' ? 'All HOS hotel entities' : `${getEntity(r.hotelId ?? '')?.hotelName} only`} /><Info label="Source" value={SourceLabel(r.source)} /><Info label="Priority" value={String(r.priority)} /><Info label="Status" value={r.status} /><Info label="Created By" value={r.createdBy} /><Info label="Created Date" value={fmtDate(r.createdAt)} /></Sect>
          <div className="rounded-2xl p-5" style={card}><h2 className="text-sm font-bold uppercase tracking-wide mb-2" style={{ color: '#6a6a6a' }}>What This Rule Does</h2><p className="text-sm" style={{ color: '#3f3f3f' }}>{ruleSummaryText(r)}</p></div>
          <div className="rounded-2xl p-5" style={card}><h2 className="text-sm font-bold uppercase tracking-wide mb-2" style={{ color: '#6a6a6a' }}>Scope Details</h2><p className="text-sm" style={{ color: '#3f3f3f' }}>{r.scope === 'global' ? `Applies to all ${HOTEL_ENTITIES.length} HOS hotel entities. Touches ${hotelsAffected(r)} hotels with matching activity.` : `Applies to ${getEntity(r.hotelId ?? '')?.hotelName} only. Overrides matching global rules for this hotel.`}</p>{r.scope === 'global' && <p className="text-xs mt-2 px-3 py-2 rounded-lg" style={{ background: '#fef3c7', color: '#b45309' }}>Vendors stay hotel-specific in V1. This rule sets the vendor name separately for each hotel.</p>}</div>
        </div>
      )}

      {tab === 'Conditions' && (
        <div className="rounded-2xl p-5" style={card}>
          <h2 className="text-sm font-bold uppercase tracking-wide mb-3" style={{ color: '#6a6a6a' }}>Match transactions when</h2>
          <div className="flex flex-col gap-2">{r.conditions.map((c, i) => (<div key={i} className="flex items-center gap-2"><span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded" style={{ background: '#f0f0f0', color: '#6a6a6a' }}>{i === 0 ? 'IF' : r.conditionLogic === 'any' ? 'OR' : 'AND'}</span><span className="text-sm" style={{ color: '#222' }}>{c.field} <b>{c.operator.toLowerCase()}</b> {c.value}{c.value2 ? ` and ${c.value2}` : ''}</span></div>))}</div>
          <button onClick={() => setEditOpen(true)} className="mt-4 text-xs font-semibold" style={{ color: '#6a4ec0' }}>Edit Conditions</button>
        </div>
      )}

      {tab === 'Actions' && (
        <div className="rounded-2xl p-5 flex flex-col gap-2.5" style={card}>
          <ActionRow label="Set transaction type" value={r.actions.setTransactionType} />
          <ActionRow label="Set vendor" value={r.actions.setVendorName} />
          <ActionRow label="Set category" value={r.actions.setCategoryName ? `${r.actions.setTemplateAccountCode ?? r.actions.setCategoryAccountCode ?? ''} ${r.actions.setCategoryName}`.trim() : undefined} />
          <ActionRow label="Set department" value={r.actions.setDepartment} />
          <ActionRow label="Receipt" value={r.actions.receipt === 'over-amount' ? `Require if amount over ${money(r.actions.receiptOver ?? 0)}` : r.actions.receipt === 'always' ? 'Always require' : r.actions.receipt === 'not-required' ? 'Not required' : r.actions.receipt === 'card-only' ? 'Credit card only' : 'No change'} />
          <ActionRow label="Approval" value={r.actions.approval === 'auto-categorize' ? 'Auto categorize only' : r.actions.approval} />
          <button onClick={() => setEditOpen(true)} className="mt-2 self-start text-xs font-semibold" style={{ color: '#6a4ec0' }}>Edit Actions</button>
        </div>
      )}

      {tab === 'Matched Transactions' && (
        <MatchedTab matched={matched} category={r.actions.setCategoryName} />
      )}

      {tab === 'Performance' && (
        <PerformanceTab rule={r} matched={matched} />
      )}

      {tab === 'Conflicts' && (
        <div className="flex flex-col gap-3">
          {ruleConflicts.length === 0 ? <Empty text="No conflicts found. This rule is currently applying without conflicts." /> : ruleConflicts.map((c) => (
            <div key={c.id} className="rounded-2xl p-4 flex items-center gap-3" style={card}>
              <GitMerge className="w-5 h-5" style={{ color: '#b91c1c' }} />
              <div className="flex-1"><p className="text-sm font-semibold" style={{ color: '#222' }}>{c.type}</p><p className="text-xs" style={{ color: '#929292' }}>{c.ruleA.name} (hotel-level) vs {c.ruleB.name} (global) · {c.example}</p></div>
              <Badge label="Hotel rule wins" fg="#1d4ed8" bg="#dbeafe" />
              <Link href="/web/accounting/rules/conflicts" className="text-xs font-semibold" style={{ color: '#6a4ec0' }}>Review</Link>
            </div>
          ))}
        </div>
      )}

      {tab === 'Activity Log' && (
        <div className="rounded-2xl overflow-hidden" style={card}>
          {(() => { const acts = store.ruleActivity.filter((a) => a.ruleId === r.id); return acts.length === 0
            ? <Empty text="No activity yet for this rule. Edits, tests, and applications will appear here." />
            : acts.slice(0, 20).map((a, i, arr) => (
              <div key={a.id} className="flex items-center gap-3 px-4 py-2.5" style={{ borderBottom: i < arr.length - 1 ? '1px solid #f0f0f0' : 'none' }}><span className="w-1.5 h-1.5 rounded-full" style={{ background: '#6a4ec0' }} /><span className="text-sm" style={{ color: '#222' }}>{a.action}</span>{a.detail && <span className="text-xs" style={{ color: '#929292' }}>· {a.detail}</span>}<span className="ml-auto text-[11px]" style={{ color: '#b0b0b0' }}>{fmtDate(a.ts.slice(0, 10))}</span></div>
            )); })()}
        </div>
      )}

      {editOpen && <CreateRuleModal prefill={{ scope: r.scope, hotelId: r.hotelId, name: r.name, contains: r.conditions[0]?.value, vendorName: r.actions.setVendorName, categoryName: r.actions.setCategoryName, department: r.actions.setDepartment }} onClose={() => setEditOpen(false)} />}
    </div>
  );
}

function MatchedTab({ matched, category }: { matched: ReturnType<typeof matchedTransactions>; category?: string }) {
  if (matched.length === 0) return <Empty text="No matching transactions found. Try widening the rule conditions or testing against a wider date range." />;
  return (
    <div className="overflow-x-auto rounded-2xl" style={card}>
      <table className="w-full text-sm border-collapse">
        <thead><tr style={{ background: '#f7f7f7', borderBottom: '1px solid #dddddd' }}>{['Date', 'Hotel', 'Source', 'Description', 'Amount', 'Category', 'Department', 'Rule Result', 'Status'].map((h, i) => <th key={h} className="text-[10px] font-semibold uppercase tracking-wide py-2.5 px-3 whitespace-nowrap" style={{ color: '#6a6a6a', textAlign: i === 4 ? 'right' : 'left' }}>{h}</th>)}</tr></thead>
        <tbody>
          {matched.slice(0, 40).map((t) => (
            <tr key={t.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
              <td className="py-2.5 px-3 text-xs" style={{ color: '#6a6a6a' }}>{t.dateIso.slice(5)}</td>
              <td className="py-2.5 px-3 text-xs" style={{ color: '#6a6a6a' }}>{getEntity(t.hotelId)?.propertyCode}</td>
              <td className="py-2.5 px-3 text-xs" style={{ color: '#6a6a6a' }}>{t.source === 'bank' ? 'Bank' : 'Card'}</td>
              <td className="py-2.5 px-3 text-sm" style={{ color: '#222' }}>{t.description}</td>
              <td className="py-2.5 px-3 text-xs text-right" style={{ color: t.amount < 0 ? '#b91c1c' : '#15803d' }}>{money(Math.abs(t.amount))}</td>
              <td className="py-2.5 px-3 text-xs" style={{ color: '#3f3f3f' }}>{category ?? t.category ?? '—'}</td>
              <td className="py-2.5 px-3 text-xs" style={{ color: '#6a6a6a' }}>{t.department ?? '—'}</td>
              <td className="py-2.5 px-3"><Badge label={t.status === 'posted' ? 'Skipped (posted)' : t.category === category ? 'Auto Categorized' : 'Applied'} fg={t.status === 'posted' ? '#6a6a6a' : '#15803d'} bg={t.status === 'posted' ? '#f0f0f0' : '#dcfce7'} /></td>
              <td className="py-2.5 px-3 text-xs" style={{ color: '#6a6a6a' }}>{t.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PerformanceTab({ rule, matched }: { rule: ReturnType<typeof oneRule>; matched: ReturnType<typeof matchedTransactions> }) {
  const byHotel = useMemo(() => {
    const m = new Map<string, number>();
    matched.forEach((t) => m.set(t.hotelId, (m.get(t.hotelId) ?? 0) + 1));
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  }, [matched]);
  if (!rule) return null;
  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <SC label="Total Matches" value={String(matchCount(rule))} />
        <SC label="Matches / mo" value={String(monthMatchCount(rule))} />
        <SC label="Auto Categorized" value={String(matched.filter((t) => t.status !== 'posted').length)} accent="#15803d" />
        <SC label="Changed Later" value={String(Math.round(matched.length * 0.05))} accent="#b45309" />
        <SC label="Conflicts" value="0" />
        <SC label="Last Match" value={lastMatched(rule) === '—' ? '—' : lastMatched(rule).slice(5)} />
      </div>
      <div className="rounded-2xl overflow-hidden" style={card}>
        <div className="px-5 py-3" style={{ borderBottom: '1px solid #f0f0f0' }}><h2 className="text-sm font-bold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>Matches by Hotel</h2></div>
        <table className="w-full text-sm border-collapse">
          <thead><tr style={{ background: '#f7f7f7', borderBottom: '1px solid #dddddd' }}>{['Hotel', 'Matches', 'Auto Categorized', 'Changed Later', 'Conflicts'].map((h, i) => <th key={h} className="text-[10px] font-semibold uppercase tracking-wide py-2.5 px-3" style={{ color: '#6a6a6a', textAlign: i === 0 ? 'left' : 'center' }}>{h}</th>)}</tr></thead>
          <tbody>
            {byHotel.map(([hid, n]) => (
              <tr key={hid} style={{ borderBottom: '1px solid #f0f0f0' }}>
                <td className="py-2.5 px-3 text-sm" style={{ color: '#222' }}>{getEntity(hid)?.hotelName}</td>
                <td className="py-2.5 px-3 text-center text-xs" style={{ color: '#3f3f3f' }}>{n}</td>
                <td className="py-2.5 px-3 text-center text-xs" style={{ color: '#15803d' }}>{n}</td>
                <td className="py-2.5 px-3 text-center text-xs" style={{ color: '#6a6a6a' }}>0</td>
                <td className="py-2.5 px-3 text-center text-xs" style={{ color: '#6a6a6a' }}>0</td>
              </tr>
            ))}
            {byHotel.length === 0 && <tr><td colSpan={5} className="py-6 text-center text-xs" style={{ color: '#929292' }}>No matches yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SC({ label, value, accent = '#222' }: { label: string; value: string; accent?: string }) { return <div className="p-3" style={card}><p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: '#929292' }}>{label}</p><p className="text-sm font-bold mt-0.5 truncate" style={{ color: accent }}>{value}</p></div>; }
function Sect({ title, children }: { title: string; children: React.ReactNode }) { return <div className="rounded-2xl overflow-hidden" style={card}><div className="px-5 py-3" style={{ borderBottom: '1px solid #f0f0f0' }}><h2 className="text-sm font-bold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>{title}</h2></div><div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div></div>; }
function Info({ label, value }: { label: string; value: string }) { return <div><p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: '#929292' }}>{label}</p><p className="text-sm mt-0.5 capitalize" style={{ color: '#222' }}>{value}</p></div>; }
function ActionRow({ label, value }: { label: string; value?: string }) { return <div className="flex justify-between gap-3 text-sm"><span style={{ color: '#929292' }}>{label}</span><span className="font-medium text-right" style={{ color: value ? '#222' : '#c1c1c1' }}>{value || 'No change'}</span></div>; }
function Empty({ text }: { text: string }) { return <div className="rounded-2xl p-10 text-center text-sm" style={{ border: '1px dashed #dddddd', background: '#fff', color: '#929292' }}>{text}</div>; }

export default function RuleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <Suspense fallback={null}><Inner id={id} /></Suspense>;
}
