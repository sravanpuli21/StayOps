'use client';

import { useState } from 'react';
import { HOTEL_ENTITIES, getEntity, ACCT_BANK_ACCOUNTS, ACCT_TRANSACTIONS } from '@hos/shared/accounting-os';
import { useAcctOs } from '../../_context';
import { card, money, fmtDate, Badge } from '../../_ui';
import { cashPosition } from '../_reports';
import { ReportTabs, ReportHeader, FilterBar, ReportMeta } from '../_shell';

const VIEWS = ['Cash Position by Hotel', 'Bank Register'] as const;

export default function BankingReportsPage() {
  const { selection } = useAcctOs();
  const single = selection.kind === 'hotel';
  const [view, setView] = useState<typeof VIEWS[number]>(single ? 'Bank Register' : 'Cash Position by Hotel');
  const ids = HOTEL_ENTITIES.slice(0, 8).map((h) => h.id);
  const cash = cashPosition(ids);

  const hotelId = single ? selection.hotelId : ids[0];
  const acct = ACCT_BANK_ACCOUNTS.find((a) => a.hotelId === hotelId && a.type === 'Operating Checking') ?? ACCT_BANK_ACCOUNTS.find((a) => a.hotelId === hotelId);
  const regTxs = acct ? ACCT_TRANSACTIONS.filter((t) => t.accountId === acct.id).slice(0, 12) : [];
  let bal = acct?.openingBalance ?? 0;

  return (
    <div className="max-w-[1400px] mx-auto flex flex-col gap-4">
      <ReportTabs />
      <ReportHeader id="bank-reports" title="Banking Reports" subtitle="Cash position, bank register, statement history, and reconciliation." scopeLabel={single ? getEntity(selection.hotelId)?.hotelName ?? '' : 'All Hotels'} />
      <FilterBar scope={single ? 'Selected Hotel' : 'All Hotels'} hotelId={single ? selection.hotelId : undefined} />
      <div className="flex gap-1 overflow-x-auto" style={{ borderBottom: '1px solid #dddddd' }}>
        {VIEWS.map((v) => <button key={v} onClick={() => setView(v)} className="px-3 py-2 text-xs font-semibold whitespace-nowrap" style={{ color: view === v ? '#6a4ec0' : '#6a6a6a', borderBottom: view === v ? '2px solid #6a4ec0' : '2px solid transparent' }}>{v}</button>)}
      </div>

      <div className="rounded-2xl overflow-hidden" style={card}>
        {view === 'Cash Position by Hotel' ? (
          <>
            <div className="px-5 py-4" style={{ borderBottom: '1px solid #f0f0f0' }}><h2 className="text-base font-bold" style={{ color: '#222' }}>Cash Position by Hotel</h2><ReportMeta company="All HOS Hotels" period="As of May 31, 2026" /></div>
            <div className="overflow-x-auto"><table className="w-full text-sm border-collapse">
              <thead><tr style={{ background: '#f7f7f7', borderBottom: '1px solid #dddddd' }}>{['Hotel', 'Code', 'Operating Checking', 'Payroll Checking', 'Reserve Account', 'Total Cash'].map((h, i) => <th key={h} className="text-[10px] font-semibold uppercase tracking-wide py-2.5 px-3 whitespace-nowrap" style={{ color: '#6a6a6a', textAlign: i >= 2 ? 'right' : 'left' }}>{h}</th>)}</tr></thead>
              <tbody>
                {cash.rows.map((r) => (
                  <tr key={r.id} style={{ borderBottom: '1px solid #f7f7f7' }}>
                    <td className="py-2 px-3 font-medium whitespace-nowrap" style={{ color: '#222' }}>{getEntity(r.id)?.hotelName}</td>
                    <td className="py-2 px-3 text-xs font-mono" style={{ color: '#6a6a6a' }}>{getEntity(r.id)?.propertyCode}</td>
                    <td className="py-2 px-3 text-right text-xs" style={{ color: '#3f3f3f' }}>{money(r.op)}</td>
                    <td className="py-2 px-3 text-right text-xs" style={{ color: '#3f3f3f' }}>{money(r.pay)}</td>
                    <td className="py-2 px-3 text-right text-xs" style={{ color: '#3f3f3f' }}>{money(r.res)}</td>
                    <td className="py-2 px-3 text-right text-xs font-semibold" style={{ color: '#222' }}>{money(r.total)}</td>
                  </tr>
                ))}
                <tr style={{ background: '#fafafa', borderTop: '1px solid #dddddd' }}><td className="py-2.5 px-3 font-bold" colSpan={2} style={{ color: '#222' }}>Total</td><td className="py-2.5 px-3 text-right font-bold" style={{ color: '#222' }}>{money(cash.totals.op)}</td><td className="py-2.5 px-3 text-right font-bold" style={{ color: '#222' }}>{money(cash.totals.pay)}</td><td className="py-2.5 px-3 text-right font-bold" style={{ color: '#222' }}>{money(cash.totals.res)}</td><td className="py-2.5 px-3 text-right font-bold" style={{ color: '#222' }}>{money(cash.totals.total)}</td></tr>
              </tbody>
            </table></div>
          </>
        ) : (
          <>
            <div className="px-5 py-4" style={{ borderBottom: '1px solid #f0f0f0' }}><h2 className="text-base font-bold" style={{ color: '#222' }}>Bank Register</h2><ReportMeta company={`${getEntity(hotelId)?.hotelName} · ${acct?.name}`} period="May 2026" /></div>
            <div className="overflow-x-auto"><table className="w-full text-sm border-collapse">
              <thead><tr style={{ background: '#f7f7f7', borderBottom: '1px solid #dddddd' }}>{['Date', 'Description', 'Vendor/Payee', 'Money In', 'Money Out', 'Balance', 'Status'].map((h, i) => <th key={h} className="text-[10px] font-semibold uppercase tracking-wide py-2.5 px-3 whitespace-nowrap" style={{ color: '#6a6a6a', textAlign: i >= 3 && i <= 5 ? 'right' : 'left' }}>{h}</th>)}</tr></thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #f7f7f7', background: '#fcfcfc' }}><td className="py-2 px-3 text-xs" style={{ color: '#6a6a6a' }}>May 01</td><td className="py-2 px-3 text-sm font-medium" style={{ color: '#222' }}>Beginning Balance</td><td colSpan={3}></td><td className="py-2 px-3 text-right text-xs font-semibold" style={{ color: '#222' }}>{money(bal)}</td><td className="py-2 px-3"><Badge label="Reconciled" fg="#15803d" bg="#dcfce7" /></td></tr>
                {regTxs.map((t) => { bal += t.amount; return (
                  <tr key={t.id} style={{ borderBottom: '1px solid #f7f7f7' }}>
                    <td className="py-2 px-3 text-xs" style={{ color: '#6a6a6a' }}>{fmtDate(t.dateIso)}</td>
                    <td className="py-2 px-3 text-sm" style={{ color: '#222' }}>{t.description}</td>
                    <td className="py-2 px-3 text-xs" style={{ color: '#6a6a6a' }}>{t.vendor ?? '—'}</td>
                    <td className="py-2 px-3 text-right text-xs" style={{ color: '#15803d' }}>{t.amount > 0 ? money(t.amount) : ''}</td>
                    <td className="py-2 px-3 text-right text-xs" style={{ color: '#b91c1c' }}>{t.amount < 0 ? money(Math.abs(t.amount)) : ''}</td>
                    <td className="py-2 px-3 text-right text-xs font-semibold" style={{ color: '#222' }}>{money(bal)}</td>
                    <td className="py-2 px-3"><Badge label={t.status === 'posted' ? 'Cleared' : 'Uncleared'} fg={t.status === 'posted' ? '#15803d' : '#6a6a6a'} bg={t.status === 'posted' ? '#dcfce7' : '#f0f0f0'} /></td>
                  </tr>
                ); })}
              </tbody>
            </table></div>
          </>
        )}
      </div>
    </div>
  );
}
