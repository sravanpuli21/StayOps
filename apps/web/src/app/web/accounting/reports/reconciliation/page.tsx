'use client';

import { getEntity } from '@hos/shared/accounting-os';
import { useAcctOs } from '../../_context';
import { useAcctState } from '../../_store';
import { reconAccounts, statusForAccount, differenceForAccount, computeMath, reconTransactions } from '../../_recon';
import { card, money, Badge } from '../../_ui';
import { ReconStatusBadge } from '../../reconciliation/_shared';
import { ReportTabs, ReportHeader, FilterBar, ReportMeta } from '../_shell';

export default function ReconReportsPage() {
  const { selection } = useAcctOs();
  const single = selection.kind === 'hotel';
  const store = useAcctState();
  const accts = reconAccounts(store, single ? selection.hotelId : undefined);

  return (
    <div className="max-w-[1400px] mx-auto flex flex-col gap-4">
      <ReportTabs />
      <ReportHeader id="recon-reports" title="Reconciliation Summary" subtitle="Statement vs cleared balance for every bank account and credit card." scopeLabel={single ? getEntity(selection.hotelId)?.hotelName ?? '' : 'All Hotels'} />
      <FilterBar scope={single ? 'Selected Hotel' : 'All Hotels'} hotelId={single ? selection.hotelId : undefined} />

      <div className="rounded-2xl overflow-hidden" style={card}>
        <div className="px-5 py-4" style={{ borderBottom: '1px solid #f0f0f0' }}><h2 className="text-base font-bold" style={{ color: '#222' }}>Reconciliation Summary</h2><ReportMeta company={single ? getEntity(selection.hotelId)?.hotelName ?? '' : 'All Hotels'} period="May 2026" /></div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead><tr style={{ background: '#f7f7f7', borderBottom: '1px solid #dddddd' }}>{['Hotel', 'Account/Card', 'Type', 'Statement Balance', 'Cleared Balance', 'Difference', 'Status'].map((h, i) => <th key={h} className="text-[10px] font-semibold uppercase tracking-wide py-2.5 px-3 whitespace-nowrap" style={{ color: '#6a6a6a', textAlign: i >= 3 && i <= 5 ? 'right' : 'left' }}>{h}</th>)}</tr></thead>
            <tbody>
              {accts.map((a) => { const st = statusForAccount(store, a); const diff = differenceForAccount(store, a); const m = computeMath(a, reconTransactions(a.id), new Set()); return (
                <tr key={a.id} style={{ borderBottom: '1px solid #f7f7f7' }}>
                  <td className="py-2 px-3 text-sm whitespace-nowrap" style={{ color: '#222' }}>{getEntity(a.hotelId)?.propertyCode}</td>
                  <td className="py-2 px-3 text-sm" style={{ color: '#222' }}>{a.name} {a.last4}</td>
                  <td className="py-2 px-3 text-xs" style={{ color: '#6a6a6a' }}>{a.kind === 'bank' ? 'Bank' : 'Credit Card'}</td>
                  <td className="py-2 px-3 text-right text-xs" style={{ color: '#3f3f3f' }}>{money(m.statementBalance)}</td>
                  <td className="py-2 px-3 text-right text-xs" style={{ color: '#3f3f3f' }}>{money(m.statementBalance - diff)}</td>
                  <td className="py-2 px-3 text-right text-xs font-semibold" style={{ color: diff ? '#b91c1c' : '#15803d' }}>{money(Math.abs(diff))}</td>
                  <td className="py-2 px-3"><ReconStatusBadge status={st} /></td>
                </tr>
              ); })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
