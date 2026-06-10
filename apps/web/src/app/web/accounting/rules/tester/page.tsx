'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Play } from 'lucide-react';
import { SEED_RICH_RULES, getEntity, ruleMatches } from '@hos/shared/accounting-os';
import { card, money, Badge, PageHeader, inputStyle, PURPLE } from '../../_ui';
import { riskFor } from '../_data';

export default function RuleTesterPage() {
  const [ruleId, setRuleId] = useState(SEED_RICH_RULES[0]?.id ?? '');
  const [ran, setRan] = useState(false);
  const rule = SEED_RICH_RULES.find((r) => r.id === ruleId);
  const matches = ran && rule ? ruleMatches(rule) : [];
  const behavior = rule ? riskFor(rule).behavior : '';

  return (
    <div className="max-w-[1200px] mx-auto flex flex-col gap-5">
      <Link href="/web/accounting/rules" className="inline-flex items-center gap-1 text-sm self-start" style={{ color: '#6a6a6a' }}><ArrowLeft className="w-4 h-4" /> Rules</Link>
      <PageHeader scope="All Hotels" title="Rule Tester" subtitle="Test rules against existing statement lines before applying them." />
      <div className="rounded-2xl p-4 flex items-end gap-3 flex-wrap" style={card}>
        <div className="flex flex-col gap-1.5 flex-1 min-w-[260px]">
          <label className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>Select Rule</label>
          <select value={ruleId} onChange={(e) => { setRuleId(e.target.value); setRan(false); }} className="h-9 px-2.5 rounded-lg text-sm" style={inputStyle}>{SEED_RICH_RULES.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}</select>
        </div>
        <button onClick={() => setRan(true)} className="h-9 px-4 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5" style={{ background: PURPLE, color: '#fff' }}><Play className="w-3.5 h-3.5" /> Run Test</button>
      </div>

      {ran && rule && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            <Stat label="Lines Checked" value="2,846" /><Stat label="Matched" value={String(matches.length)} accent="#222" />
            <Stat label="Would Suggest" value={behavior === 'Review Required' ? '0' : String(matches.length)} />
            <Stat label="Review Required" value={behavior === 'Review Required' ? String(matches.length) : '0'} accent="#b45309" />
            <Stat label="Conflicts" value="0" /><Stat label="Mapping Missing" value="0" accent="#15803d" />
          </div>
          <div className="overflow-x-auto rounded-2xl" style={card}>
            <table className="w-full text-sm border-collapse">
              <thead><tr style={{ background: '#f7f7f7', borderBottom: '1px solid #dddddd' }}>{['Hotel', 'Description', 'Amount', 'Suggested', 'Result'].map((h) => <th key={h} className="text-[10px] font-semibold uppercase tracking-wide py-2.5 px-3 whitespace-nowrap" style={{ color: '#6a6a6a', textAlign: h === 'Amount' ? 'right' : 'left' }}>{h}</th>)}</tr></thead>
              <tbody>
                {matches.slice(0, 25).map((t) => (
                  <tr key={t.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td className="py-2 px-3 text-xs" style={{ color: '#6a6a6a' }}>{getEntity(t.hotelId)?.propertyCode}</td>
                    <td className="py-2 px-3 text-sm" style={{ color: '#222' }}>{t.description}</td>
                    <td className="py-2 px-3 text-xs text-right" style={{ color: '#222' }}>{money(Math.abs(t.amount))}</td>
                    <td className="py-2 px-3 text-xs" style={{ color: '#6a6a6a' }}>{rule.actions.setCategoryName ?? '—'}</td>
                    <td className="py-2 px-3">{behavior === 'Review Required' ? <Badge label="Review Required" fg="#b45309" bg="#fef3c7" /> : <Badge label="Would Suggest" fg="#1d4ed8" bg="#dbeafe" />}</td>
                  </tr>
                ))}
                {matches.length === 0 && <tr><td colSpan={5} className="py-8 text-center text-xs" style={{ color: '#929292' }}>No matching lines for this rule.</td></tr>}
              </tbody>
            </table>
          </div>
          <p className="text-xs" style={{ color: '#929292' }}>Rules never apply to posted, reconciled, or closed-period transactions.</p>
        </>
      )}
    </div>
  );
}

function Stat({ label, value, accent = '#222' }: { label: string; value: string; accent?: string }) { return <div className="p-3.5" style={card}><p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: '#929292' }}>{label}</p><p className="text-lg font-bold mt-0.5" style={{ color: accent }}>{value}</p></div>; }
