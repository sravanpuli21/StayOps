'use client';

import { HOTEL_ENTITIES, getEntity } from '@hos/shared/accounting-os';
import { useAcctOs } from '../../_context';
import { card, money, Badge } from '../../_ui';
import { trialBalance } from '../_reports';
import { ReportTabs, ReportHeader, FilterBar, ReportMeta } from '../_shell';

export default function TrialBalancePage() {
  const { selection } = useAcctOs();
  const single = selection.kind === 'hotel';
  const hotelId = single ? selection.hotelId : HOTEL_ENTITIES[2].id;
  const h = getEntity(hotelId);
  const { rows, totalDebit, totalCredit, balanced } = trialBalance(hotelId);

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-4">
      <ReportTabs />
      <ReportHeader id="trial-balance" title="Trial Balance" subtitle="Debit and credit balances for all accounts." scopeLabel={h?.hotelName ?? ''} />
      <FilterBar scope={single ? 'Selected Hotel' : 'All Hotels'} hotelId={hotelId} />

      <div className="rounded-2xl overflow-hidden" style={card}>
        <div className="px-5 py-4 flex items-start justify-between flex-wrap gap-2" style={{ borderBottom: '1px solid #f0f0f0' }}>
          <div><h2 className="text-base font-bold" style={{ color: '#222' }}>Trial Balance</h2><ReportMeta company={h?.hotelName ?? ''} period="As of May 31, 2026" /></div>
          <Badge label={balanced ? 'Balanced' : 'Not Balanced'} fg={balanced ? '#15803d' : '#b91c1c'} bg={balanced ? '#dcfce7' : '#fee2e2'} />
        </div>
        <table className="w-full text-sm border-collapse">
          <thead><tr style={{ background: '#f7f7f7', borderBottom: '1px solid #dddddd' }}>{['Code', 'Account Name', 'Debit', 'Credit'].map((hd, i) => <th key={hd} className="text-[10px] font-semibold uppercase tracking-wide py-2.5 px-4" style={{ color: '#6a6a6a', textAlign: i >= 2 ? 'right' : 'left' }}>{hd}</th>)}</tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.code} style={{ borderBottom: '1px solid #f7f7f7' }}>
                <td className="py-2 px-4 text-xs font-mono" style={{ color: '#6a6a6a' }}>{r.code}</td>
                <td className="py-2 px-4 text-sm" style={{ color: '#222' }}>{r.name}</td>
                <td className="py-2 px-4 text-right text-xs" style={{ color: '#3f3f3f' }}>{r.debit ? money(r.debit) : ''}</td>
                <td className="py-2 px-4 text-right text-xs" style={{ color: '#3f3f3f' }}>{r.credit ? money(r.credit) : ''}</td>
              </tr>
            ))}
            <tr style={{ background: '#fafafa', borderTop: '1px solid #dddddd' }}>
              <td className="py-2.5 px-4 font-bold" style={{ color: '#222' }} colSpan={2}>Total</td>
              <td className="py-2.5 px-4 text-right font-bold" style={{ color: '#222' }}>{money(totalDebit)}</td>
              <td className="py-2.5 px-4 text-right font-bold" style={{ color: '#222' }}>{money(totalCredit)}</td>
            </tr>
          </tbody>
        </table>
        {!balanced && <div className="px-5 py-2.5 text-xs" style={{ background: '#fef2f2', color: '#b91c1c' }}>Trial balance is not balanced.</div>}
      </div>
    </div>
  );
}
