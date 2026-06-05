'use client';

import Link from 'next/link';
import { getEntity } from '@hos/shared/accounting-os';
import { useAcctOs } from '../../_context';
import { useAcctState } from '../../_store';
import { blockerRows } from '../../_recon';
import { card, Badge } from '../../_ui';
import { ReconTabs, SummaryCard } from '../_shared';

export default function BlockersPage() {
  const { selection } = useAcctOs();
  const store = useAcctState();
  const rows = blockerRows(store, selection.kind === 'hotel' ? selection.hotelId : undefined);

  const count = (type: string) => rows.filter((r) => r.type === type).reduce((n, r) => n + r.count, 0);

  return (
    <div className="max-w-[1400px] mx-auto flex flex-col gap-5">
      <ReconTabs />
      <div><h1 className="text-xl font-bold" style={{ color: '#222' }}>Reconciliation Blockers</h1><p className="text-sm" style={{ color: '#929292' }}>Resolve issues that prevent accounts from being reconciled.</p></div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <SummaryCard label="Unposted Transactions" value={count('Transactions Not Posted')} accent="#b91c1c" />
        <SummaryCard label="Missing Categories" value={count('Missing Category')} accent="#b45309" />
        <SummaryCard label="Duplicate Warnings" value={count('Duplicate Warning')} accent="#b45309" />
        <SummaryCard label="Missing Statements" value={count('Statement Missing')} accent="#b45309" />
        <SummaryCard label="Missing Receipts" value={count('Missing Receipt')} accent="#b45309" />
        <SummaryCard label="Total Blockers" value={rows.length} accent={rows.length ? '#b91c1c' : '#15803d'} />
      </div>

      {rows.length === 0 ? (
        <div className="rounded-2xl p-12 text-center" style={{ ...card, borderStyle: 'dashed' }}>
          <p className="text-base font-semibold" style={{ color: '#222' }}>No reconciliation blockers.</p>
          <p className="text-sm mt-1" style={{ color: '#6a6a6a' }}>All accounts are ready for reconciliation or already reconciled.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl" style={card}>
          <table className="w-full text-sm border-collapse">
            <thead><tr style={{ background: '#f7f7f7', borderBottom: '1px solid #dddddd' }}>{['Hotel', 'Account/Card', 'Blocker Type', 'Count', 'Month', 'Severity', 'Message', 'Action'].map((h, i) => <th key={h} className="text-[10px] font-semibold uppercase tracking-wide py-2.5 px-3 whitespace-nowrap" style={{ color: '#6a6a6a', textAlign: i === 3 ? 'center' : 'left' }}>{h}</th>)}</tr></thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="hover:bg-[#fafafa]" style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td className="py-2.5 px-3 text-sm whitespace-nowrap" style={{ color: '#222' }}>{getEntity(r.acct.hotelId)?.hotelName}</td>
                  <td className="py-2.5 px-3 text-sm" style={{ color: '#222' }}>{r.acct.name}</td>
                  <td className="py-2.5 px-3 text-xs" style={{ color: '#3f3f3f' }}>{r.type}</td>
                  <td className="py-2.5 px-3 text-center text-xs" style={{ color: '#3f3f3f' }}>{r.count}</td>
                  <td className="py-2.5 px-3 text-xs" style={{ color: '#6a6a6a' }}>{r.acct.statementMonth}</td>
                  <td className="py-2.5 px-3"><Badge label={r.severity === 'high' ? 'High' : 'Warning'} fg={r.severity === 'high' ? '#b91c1c' : '#b45309'} bg={r.severity === 'high' ? '#fee2e2' : '#fef3c7'} /></td>
                  <td className="py-2.5 px-3 text-xs" style={{ color: '#6a6a6a', maxWidth: 280 }}>{r.message}</td>
                  <td className="py-2.5 px-3"><Link href={r.href} className="text-xs font-semibold whitespace-nowrap" style={{ color: '#6a4ec0' }}>{r.action}</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
