'use client';

import { useState } from 'react';
import Link from 'next/link';
import { HOTEL_ENTITIES, getEntity } from '@hos/shared/accounting-os';
import { useAcctOs } from '../../_context';
import { card, money, fmtDate } from '../../_ui';
import { generalLedger } from '../_reports';
import { ReportTabs, ReportHeader, FilterBar, ReportMeta } from '../_shell';

const ACCOUNTS = ['Repairs and Maintenance', 'Payroll Expense', 'Utilities', 'Room Revenue', 'OTA Commissions'];

export default function GeneralLedgerPage() {
  const { selection } = useAcctOs();
  const single = selection.kind === 'hotel';
  const hotelId = single ? selection.hotelId : HOTEL_ENTITIES[2].id;
  const h = getEntity(hotelId);
  const [account, setAccount] = useState('Repairs and Maintenance');
  const rows = generalLedger(hotelId, account);

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-4">
      <ReportTabs />
      <ReportHeader id="general-ledger" title="General Ledger" subtitle="Every journal entry line by account." scopeLabel={h?.hotelName ?? ''} />
      <FilterBar scope={single ? 'Selected Hotel' : 'All Hotels'} hotelId={hotelId} extra={
        <div className="flex flex-col gap-1"><label className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: '#929292' }}>Account</label><select value={account} onChange={(e) => setAccount(e.target.value)} className="h-9 px-2.5 rounded-lg text-xs border border-[#dddddd] bg-white text-[#3f3f3f]">{ACCOUNTS.map((a) => <option key={a} value={a}>{a}</option>)}</select></div>
      } />

      <div className="rounded-2xl overflow-hidden" style={card}>
        <div className="px-5 py-4" style={{ borderBottom: '1px solid #f0f0f0' }}>
          <h2 className="text-base font-bold" style={{ color: '#222' }}>General Ledger</h2>
          <ReportMeta company={`${h?.hotelName} · 6210 ${account}`} period="May 1, 2026 to May 31, 2026" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead><tr style={{ background: '#f7f7f7', borderBottom: '1px solid #dddddd' }}>{['Date', 'Journal Entry', 'Source', 'Description', 'Debit', 'Credit', 'Balance'].map((hd, i) => <th key={hd} className="text-[10px] font-semibold uppercase tracking-wide py-2.5 px-4 whitespace-nowrap" style={{ color: '#6a6a6a', textAlign: i >= 4 ? 'right' : 'left' }}>{hd}</th>)}</tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.je} style={{ borderBottom: '1px solid #f7f7f7' }}>
                  <td className="py-2 px-4 text-xs" style={{ color: '#6a6a6a' }}>{fmtDate(r.date)}</td>
                  <td className="py-2 px-4"><Link href="/web/accounting/transactions" className="text-xs font-mono font-semibold" style={{ color: '#6a4ec0' }}>{r.je}</Link></td>
                  <td className="py-2 px-4 text-xs" style={{ color: '#6a6a6a' }}>{r.source}</td>
                  <td className="py-2 px-4 text-sm" style={{ color: '#222' }}>{r.description}</td>
                  <td className="py-2 px-4 text-right text-xs" style={{ color: '#3f3f3f' }}>{r.debit ? money(r.debit) : ''}</td>
                  <td className="py-2 px-4 text-right text-xs" style={{ color: '#3f3f3f' }}>{r.credit ? money(r.credit) : ''}</td>
                  <td className="py-2 px-4 text-right text-xs font-semibold" style={{ color: '#222' }}>{money(r.balance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 text-[11px]" style={{ color: '#b0b0b0', borderTop: '1px solid #f0f0f0' }}>Click a journal entry number or description to open the source transaction.</div>
      </div>
    </div>
  );
}
