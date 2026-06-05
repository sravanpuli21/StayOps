'use client';

import { useState } from 'react';
import { HOTEL_ENTITIES, getEntity, ACCT_CREDIT_CARDS, ACCT_TRANSACTIONS } from '@hos/shared/accounting-os';
import { useAcctOs } from '../../_context';
import { card, money, fmtDate, Badge } from '../../_ui';
import { ReportTabs, ReportHeader, FilterBar, ReportMeta } from '../_shell';

const VIEWS = ['Spend Summary', 'Missing Card Receipts'] as const;

export default function CreditCardReportsPage() {
  const { selection } = useAcctOs();
  const single = selection.kind === 'hotel';
  const hotelId = single ? selection.hotelId : HOTEL_ENTITIES[2].id;
  const [view, setView] = useState<typeof VIEWS[number]>('Spend Summary');
  const h = getEntity(hotelId);
  const cards = ACCT_CREDIT_CARDS.filter((c) => c.hotelId === hotelId);

  const spend = cards.map((c) => {
    const txs = ACCT_TRANSACTIONS.filter((t) => t.accountId === c.id);
    const charges = txs.filter((t) => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);
    const credits = txs.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0);
    const missing = txs.filter((t) => t.receipt === 'missing').length;
    return { card: c, charges: Math.round(charges), credits: Math.round(credits), net: Math.round(charges - credits), missing };
  });

  const missingRows = cards.flatMap((c) => ACCT_TRANSACTIONS.filter((t) => t.accountId === c.id && t.receipt === 'missing').map((t) => ({ t, c })));

  return (
    <div className="max-w-[1400px] mx-auto flex flex-col gap-4">
      <ReportTabs />
      <ReportHeader id="card-reports" title="Credit Card Reports" subtitle="Card spend summary, missing receipts, payments, and reconciliation." scopeLabel={h?.hotelName ?? ''} />
      <FilterBar scope={single ? 'Selected Hotel' : 'All Hotels'} hotelId={hotelId} />
      <div className="flex gap-1 overflow-x-auto" style={{ borderBottom: '1px solid #dddddd' }}>
        {VIEWS.map((v) => <button key={v} onClick={() => setView(v)} className="px-3 py-2 text-xs font-semibold whitespace-nowrap" style={{ color: view === v ? '#6a4ec0' : '#6a6a6a', borderBottom: view === v ? '2px solid #6a4ec0' : '2px solid transparent' }}>{v}</button>)}
      </div>

      <div className="rounded-2xl overflow-hidden" style={card}>
        {view === 'Spend Summary' ? (
          <>
            <div className="px-5 py-4" style={{ borderBottom: '1px solid #f0f0f0' }}><h2 className="text-base font-bold" style={{ color: '#222' }}>Credit Card Spend Summary</h2><ReportMeta company={h?.hotelName ?? ''} period="May 2026" /></div>
            <table className="w-full text-sm border-collapse">
              <thead><tr style={{ background: '#f7f7f7', borderBottom: '1px solid #dddddd' }}>{['Card', 'Card Holder', 'Charges', 'Credits', 'Net Spend', 'Missing Receipts', 'Status'].map((hd, i) => <th key={hd} className="text-[10px] font-semibold uppercase tracking-wide py-2.5 px-3 whitespace-nowrap" style={{ color: '#6a6a6a', textAlign: i >= 2 && i <= 5 ? 'right' : 'left' }}>{hd}</th>)}</tr></thead>
              <tbody>
                {spend.map((s) => (
                  <tr key={s.card.id} style={{ borderBottom: '1px solid #f7f7f7' }}>
                    <td className="py-2 px-3 text-sm" style={{ color: '#222' }}>{s.card.name} {s.card.last4}</td>
                    <td className="py-2 px-3 text-xs" style={{ color: '#6a6a6a' }}>{s.card.cardHolder}</td>
                    <td className="py-2 px-3 text-right text-xs" style={{ color: '#3f3f3f' }}>{money(s.charges)}</td>
                    <td className="py-2 px-3 text-right text-xs" style={{ color: '#3f3f3f' }}>{money(s.credits)}</td>
                    <td className="py-2 px-3 text-right text-xs font-semibold" style={{ color: '#222' }}>{money(s.net)}</td>
                    <td className="py-2 px-3 text-right text-xs" style={{ color: s.missing ? '#b91c1c' : '#15803d' }}>{s.missing}</td>
                    <td className="py-2 px-3"><Badge label={s.missing ? 'In Review' : 'Clean'} fg={s.missing ? '#b45309' : '#15803d'} bg={s.missing ? '#fef3c7' : '#dcfce7'} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        ) : (
          <>
            <div className="px-5 py-4" style={{ borderBottom: '1px solid #f0f0f0' }}><h2 className="text-base font-bold" style={{ color: '#222' }}>Missing Card Receipts</h2><ReportMeta company={h?.hotelName ?? ''} period="May 2026" /></div>
            {missingRows.length === 0 ? <p className="p-6 text-sm" style={{ color: '#929292' }}>No missing card receipts for this hotel.</p> : (
              <table className="w-full text-sm border-collapse">
                <thead><tr style={{ background: '#f7f7f7', borderBottom: '1px solid #dddddd' }}>{['Date', 'Card', 'Card Holder', 'Vendor', 'Amount', 'Status'].map((hd, i) => <th key={hd} className="text-[10px] font-semibold uppercase tracking-wide py-2.5 px-3 whitespace-nowrap" style={{ color: '#6a6a6a', textAlign: i === 4 ? 'right' : 'left' }}>{hd}</th>)}</tr></thead>
                <tbody>{missingRows.slice(0, 20).map(({ t, c }) => (
                  <tr key={t.id} style={{ borderBottom: '1px solid #f7f7f7' }}>
                    <td className="py-2 px-3 text-xs" style={{ color: '#6a6a6a' }}>{fmtDate(t.dateIso)}</td>
                    <td className="py-2 px-3 text-xs" style={{ color: '#222' }}>{c.name} {c.last4}</td>
                    <td className="py-2 px-3 text-xs" style={{ color: '#6a6a6a' }}>{c.cardHolder}</td>
                    <td className="py-2 px-3 text-xs" style={{ color: '#3f3f3f' }}>{t.vendor ?? t.description}</td>
                    <td className="py-2 px-3 text-right text-xs" style={{ color: '#222' }}>{money(Math.abs(t.amount))}</td>
                    <td className="py-2 px-3"><Badge label="Missing" fg="#b91c1c" bg="#fee2e2" /></td>
                  </tr>
                ))}</tbody>
              </table>
            )}
          </>
        )}
      </div>
    </div>
  );
}
