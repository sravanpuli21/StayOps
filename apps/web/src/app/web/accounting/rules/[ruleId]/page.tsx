'use client';

import { use, useMemo, useState, Suspense } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { SEED_RICH_RULES, getEntity, ruleMatches } from '@hos/shared/accounting-os';
import { card, money, Badge, EmptyState, PURPLE, fmtDate } from '../../_ui';
import { riskFor, RISK_LABEL } from '../_data';

const TABS = ['Overview', 'Conditions', 'Actions', 'Safety', 'Matched Lines', 'Performance', 'Activity Log'];

function Inner({ ruleId }: { ruleId: string }) {
  const rule = SEED_RICH_RULES.find((r) => r.id === ruleId);
  const [tab, setTab] = useState('Overview');
  const matches = useMemo(() => rule ? ruleMatches(rule) : [], [rule]);

  if (!rule) return <div className="max-w-3xl mx-auto flex flex-col gap-4"><Back /><EmptyState title="Rule not found." /></div>;

  const { risk, behavior } = riskFor(rule);
  const rl = RISK_LABEL[risk];
  const a = rule.actions;
  const cond = rule.conditions[0];

  return (
    <div className="max-w-[1200px] mx-auto flex flex-col gap-5">
      <Back />
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold" style={{ color: '#222' }}>{rule.name}</h1>
          <p className="text-sm" style={{ color: '#929292' }}>{rule.scope === 'global' ? 'Global Rule' : `Hotel-Level · ${getEntity(rule.hotelId!)?.hotelName}`} · {rule.source === 'both' ? 'Bank & Credit Card' : rule.source}</p>
          <div className="flex items-center gap-1.5 mt-1.5">
            {rule.scope === 'global' ? <Badge label="Global" fg={PURPLE} bg="#ece4fb" /> : <Badge label="Hotel-Level" fg="#1d4ed8" bg="#dbeafe" />}
            {rule.status === 'active' ? <Badge label="Active" fg="#15803d" bg="#dcfce7" /> : <Badge label={rule.status} fg="#6a6a6a" bg="#f0f0f0" />}
            <Badge label={rl.label} fg={rl.fg} bg={rl.bg} />
            <Badge label={behavior} fg={behavior === 'Review Required' ? '#b45309' : '#15803d'} bg={behavior === 'Review Required' ? '#fef3c7' : '#dcfce7'} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <Card label="Scope" value={rule.scope === 'global' ? 'Global' : 'Hotel-Level'} />
        <Card label="Risk Level" value={rl.label} />
        <Card label="Matched" value={String(matches.length)} />
        <Card label="Accuracy" value="95%" />
        <Card label="Priority" value={String(rule.priority)} />
        <Card label="Review" value={behavior === 'Review Required' ? 'Yes' : 'No'} />
      </div>

      <div className="flex gap-1 overflow-x-auto" style={{ borderBottom: '1px solid #dddddd' }}>
        {TABS.map((t) => <button key={t} onClick={() => setTab(t)} className="px-3 py-2 text-xs font-semibold whitespace-nowrap" style={{ color: tab === t ? PURPLE : '#6a6a6a', borderBottom: tab === t ? `2px solid ${PURPLE}` : '2px solid transparent' }}>{t}</button>)}
      </div>

      {tab === 'Overview' && (
        <div className="rounded-2xl p-5" style={card}>
          <p className="text-sm" style={{ color: '#222' }}>When a statement line {cond ? `has ${cond.field.toLowerCase()} that ${cond.operator.toLowerCase()} “${cond.value}”` : 'matches'}, StayOps suggests {a.setVendorName ? `${a.setVendorName} as the vendor, ` : ''}{a.setCategoryName ?? a.setTransactionType} as the category{a.setDepartment ? `, and ${a.setDepartment} as the department` : ''}.</p>
          <p className="text-sm mt-2" style={{ color: '#6a6a6a' }}>{rule.scope === 'global' ? 'This rule applies across all HOS hotel entities. Vendors remain hotel-specific.' : `This rule applies only to ${getEntity(rule.hotelId!)?.hotelName} and overrides global rules.`}</p>
        </div>
      )}
      {tab === 'Conditions' && (
        <div className="rounded-2xl p-5" style={card}>
          {rule.conditions.map((c, i) => <p key={i} className="text-sm font-mono" style={{ color: '#222' }}>{i === 0 ? 'IF' : (rule.conditionLogic === 'all' ? 'AND' : 'OR')} {c.field} {c.operator} “{c.value}”</p>)}
        </div>
      )}
      {tab === 'Actions' && (
        <div className="rounded-2xl p-5 grid grid-cols-2 gap-x-4 gap-y-2" style={card}>
          <Info k="Resolution Type" v={a.setTransactionType ?? 'Create Accounting Transaction'} />
          <Info k="Vendor" v={a.setVendorName ?? '—'} />
          <Info k="Category" v={a.setCategoryName ?? '—'} />
          <Info k="Department" v={a.setDepartment ?? '—'} />
          <Info k="Receipt" v={a.receipt === 'over-amount' ? `Over $${a.receiptOver}` : a.receipt === 'always' ? 'Always' : 'Not required'} />
          <Info k="Vendor Handling" v={rule.vendorHandling} />
        </div>
      )}
      {tab === 'Safety' && (
        <div className="rounded-2xl p-5 grid grid-cols-2 gap-x-4 gap-y-2" style={card}>
          <Info k="Risk Level" v={rl.label} /><Info k="Application Behavior" v={behavior} />
          <Info k="Posting Behavior" v="Never Auto-Post (V1)" /><Info k="Auto-code eligible" v={behavior.includes('Auto-Code') ? 'Yes' : 'No'} />
        </div>
      )}
      {tab === 'Matched Lines' && (
        matches.length === 0 ? <EmptyState title="No matched lines." /> : (
          <div className="overflow-x-auto rounded-2xl" style={card}>
            <table className="w-full text-sm border-collapse">
              <thead><tr style={{ background: '#f7f7f7', borderBottom: '1px solid #dddddd' }}>{['Hotel', 'Description', 'Amount', 'Suggested Category', 'Result'].map((h) => <th key={h} className="text-[10px] font-semibold uppercase tracking-wide py-2.5 px-3 whitespace-nowrap" style={{ color: '#6a6a6a', textAlign: h === 'Amount' ? 'right' : 'left' }}>{h}</th>)}</tr></thead>
              <tbody>
                {matches.slice(0, 20).map((t) => (
                  <tr key={t.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td className="py-2 px-3 text-xs" style={{ color: '#6a6a6a' }}>{getEntity(t.hotelId)?.propertyCode}</td>
                    <td className="py-2 px-3 text-sm" style={{ color: '#222' }}>{t.description}</td>
                    <td className="py-2 px-3 text-xs text-right" style={{ color: t.amount < 0 ? '#b91c1c' : '#15803d' }}>{money(Math.abs(t.amount))}</td>
                    <td className="py-2 px-3 text-xs" style={{ color: '#6a6a6a' }}>{a.setCategoryName ?? '—'}</td>
                    <td className="py-2 px-3">{behavior === 'Review Required' ? <Badge label="Review Required" fg="#b45309" bg="#fef3c7" /> : <Badge label="Auto-Coded" fg="#15803d" bg="#dcfce7" />}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
      {tab === 'Performance' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card label="Total Matches" value={String(matches.length)} />
          <Card label="Accepted" value={String(Math.round(matches.length * 0.93))} />
          <Card label="Changed" value={String(Math.round(matches.length * 0.05))} />
          <Card label="Accuracy" value="95%" />
        </div>
      )}
      {tab === 'Activity Log' && <EmptyState title="Rule activity" body="Created, edited, tested, applied, and conflict events appear here." />}
    </div>
  );
}

function Back() { return <Link href="/web/accounting/rules" className="inline-flex items-center gap-1 text-sm self-start" style={{ color: '#6a6a6a' }}><ArrowLeft className="w-4 h-4" /> Rules</Link>; }
function Card({ label, value }: { label: string; value: string }) { return <div className="p-3.5" style={card}><p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: '#929292' }}>{label}</p><p className="text-base font-bold mt-0.5" style={{ color: '#222' }}>{value}</p></div>; }
function Info({ k, v }: { k: string; v: string }) { return <div><p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: '#929292' }}>{k}</p><p className="text-sm" style={{ color: '#222' }}>{v}</p></div>; }

export default function RuleDetailPage({ params }: { params: Promise<{ ruleId: string }> }) {
  const { ruleId } = use(params);
  return <Suspense fallback={null}><Inner ruleId={decodeURIComponent(ruleId)} /></Suspense>;
}
