'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ShieldAlert } from 'lucide-react';
import { card, Badge, PageHeader, EmptyState, PURPLE } from '../../_ui';
import { ruleRows, RISK_LABEL } from '../_data';

export default function HighRiskRulesPage() {
  const router = useRouter();
  const rows = useMemo(() => ruleRows().filter((r) => r.risk === 'high' || r.risk === 'critical' || r.behavior === 'Review Required'), []);
  return (
    <div className="max-w-[1200px] mx-auto flex flex-col gap-5">
      <Link href="/web/accounting/rules" className="inline-flex items-center gap-1 text-sm self-start" style={{ color: '#6a6a6a' }}><ArrowLeft className="w-4 h-4" /> Rules</Link>
      <PageHeader scope="All Hotels" title="High-Risk Rules" subtitle="Rules that require accountant review before posting." />
      {rows.length === 0 ? <EmptyState icon={<ShieldAlert className="w-8 h-8" />} title="No high-risk rule matches waiting." body="Payroll, tax, loan, card payment, owner, and transfer activity is clear." /> : (
        <div className="overflow-x-auto rounded-2xl" style={card}>
          <table className="w-full text-sm border-collapse">
            <thead><tr style={{ background: '#f7f7f7', borderBottom: '1px solid #dddddd' }}>{['Rule', 'Risk Type', 'Scope', 'Review Reason', 'Matched', 'Status', ''].map((h) => <th key={h} className="text-[10px] font-semibold uppercase tracking-wide py-2.5 px-3 whitespace-nowrap" style={{ color: '#6a6a6a', textAlign: h === 'Matched' ? 'right' : 'left' }}>{h}</th>)}</tr></thead>
            <tbody>
              {rows.map((r) => {
                const rl = RISK_LABEL[r.risk];
                const t = r.rule.actions.setTransactionType ?? 'Expense';
                const reason = t === 'Credit Card Payment' ? 'Should reduce Credit Cards Payable, not expense.' : t === 'Payroll' ? 'May be wages, tax, fee, or subscription — confirm before posting.' : t === 'Loan Payment' ? 'Requires principal and interest split.' : t === 'Transfer' ? 'Should not affect P&L.' : 'Requires accountant review before posting.';
                return (
                  <tr key={r.rule.id} className="hover:bg-[#fafafa] cursor-pointer" style={{ borderBottom: '1px solid #f0f0f0' }} onClick={() => router.push(`/web/accounting/rules/${r.rule.id}`)}>
                    <td className="py-2.5 px-3 text-sm font-medium" style={{ color: '#222' }}>{r.rule.name}</td>
                    <td className="py-2.5 px-3 text-xs" style={{ color: '#6a6a6a' }}>{t}</td>
                    <td className="py-2.5 px-3">{r.rule.scope === 'global' ? <Badge label="Global" fg={PURPLE} bg="#ece4fb" /> : <Badge label="Hotel-Level" fg="#1d4ed8" bg="#dbeafe" />}</td>
                    <td className="py-2.5 px-3 text-[11px]" style={{ color: '#929292' }}>{reason}</td>
                    <td className="py-2.5 px-3 text-xs text-right" style={{ color: '#222' }}>{r.matched}</td>
                    <td className="py-2.5 px-3"><Badge label={rl.label} fg={rl.fg} bg={rl.bg} /></td>
                    <td className="py-2.5 px-3 text-right"><span className="text-xs font-semibold" style={{ color: PURPLE }}>Review</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
