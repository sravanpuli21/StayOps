'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, AlertTriangle, Lock, X } from 'lucide-react';
import { HOTEL_CLOSE_STATUS, getEntity, closeForHotel } from '@hos/shared/accounting-os';
import { useAcctOs } from '../_context';
import { useAcctState, allTransactions, isClosed, closeMonth, reopenMonth } from '../_store';
import { card, Badge, CLOSE_STATUS, fmtMonth } from '../_ui';

const MONTH = '2026-05';

export default function MonthClosePage() {
  const { selection, selectHotel } = useAcctOs();
  if (selection.kind === 'hotel') return <SingleClose hotelId={selection.hotelId} />;
  return <AllClose onOpen={selectHotel} />;
}

function AllClose({ onOpen }: { onOpen: (id: string) => void }) {
  const state = useAcctState();
  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-5">
      <div className="flex items-center gap-2">
        <Badge label="All Hotels" fg="#6a4ec0" bg="#ece4fb" />
        <div><h1 className="text-xl font-bold" style={{ color: '#222' }}>Month Close · {fmtMonth(MONTH)}</h1><p className="text-sm" style={{ color: '#929292' }}>Complete monthly tasks before locking each hotel&rsquo;s books.</p></div>
      </div>
      <div className="overflow-x-auto rounded-2xl" style={card}>
        <table className="w-full text-sm border-collapse">
          <thead><tr style={{ background: '#f7f7f7', borderBottom: '1px solid #dddddd' }}>
            {['Hotel', 'Code', 'Bank', 'Card', 'Reviewed', 'Receipts', 'Reconciled', 'Status', 'Action'].map((h, i) => <th key={h} className="text-[11px] font-semibold uppercase tracking-wide py-2.5 px-3 whitespace-nowrap" style={{ color: '#6a6a6a', textAlign: i >= 2 && i <= 6 ? 'center' : 'left' }}>{h}</th>)}
          </tr></thead>
          <tbody>
            {HOTEL_CLOSE_STATUS.map((c, i) => {
              const h = getEntity(c.hotelId)!;
              const closed = isClosed(state, c.hotelId, MONTH);
              const cs = CLOSE_STATUS[closed ? 'closed' : c.status];
              return (
                <tr key={c.hotelId} className="hover:bg-[#fafafa]" style={{ borderBottom: i < HOTEL_CLOSE_STATUS.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                  <td className="py-2.5 px-3"><p className="font-medium" style={{ color: '#222' }}>{h.hotelName}</p></td>
                  <td className="py-2.5 px-3 text-xs font-mono" style={{ color: '#6a6a6a' }}>{h.propertyCode}</td>
                  <Tick ok={c.bankUploaded} /><Tick ok={c.ccUploaded} /><Tick ok={c.txReviewed} /><Tick ok={c.receiptsComplete} /><Tick ok={c.reconciled} />
                  <td className="py-2.5 px-3"><Badge label={cs.label} fg={cs.fg} bg={cs.bg} /></td>
                  <td className="py-2.5 px-3"><button onClick={() => onOpen(c.hotelId)} className="text-xs font-semibold" style={{ color: '#6a4ec0' }}>{closed ? 'View' : 'Continue Close'}</button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SingleClose({ hotelId }: { hotelId: string }) {
  const state = useAcctState();
  const h = getEntity(hotelId)!;
  const c = closeForHotel(hotelId)!;
  const txs = allTransactions(state).filter((t) => t.hotelId === hotelId);
  const closed = isClosed(state, hotelId, MONTH);
  const [confirm, setConfirm] = useState(false);

  const toReview = txs.filter((t) => t.status === 'needs-review' || t.status === 'uncategorized').length;
  const missing = txs.filter((t) => t.receipt === 'missing').length;

  const items = [
    { label: 'Bank statements uploaded', ok: c.bankUploaded, href: '/web/accounting/banking', action: 'Upload Missing Statements' },
    { label: 'Credit card statements uploaded', ok: c.ccUploaded, href: '/web/accounting/credit-cards', action: 'Upload Statement' },
    { label: 'All transactions reviewed', ok: toReview === 0, href: '/web/accounting/transactions?tab=needs-review', action: `Review ${toReview} transactions` },
    { label: 'All transactions categorized', ok: toReview === 0, href: '/web/accounting/transactions?tab=uncategorized', action: 'Categorize' },
    { label: 'Duplicate warnings resolved', ok: txs.filter((t) => t.status === 'duplicate').length === 0, href: '/web/accounting/transactions?tab=duplicate', action: 'Resolve duplicates' },
    { label: 'Required receipts attached', ok: missing === 0, href: '/web/accounting/transactions?tab=missing', action: `Attach ${missing} receipts` },
    { label: 'Bank accounts reconciled', ok: c.reconciled, href: '/web/accounting/reconciliation', action: 'Reconcile' },
    { label: 'Credit cards reconciled', ok: c.reconciled, href: '/web/accounting/reconciliation', action: 'Reconcile' },
    { label: 'P&L reviewed', ok: false, href: '/web/accounting/reports', action: 'Review P&L' },
    { label: 'Balance Sheet reviewed', ok: false, href: '/web/accounting/reports', action: 'Review Balance Sheet' },
    { label: 'Cash Flow reviewed', ok: false, href: '/web/accounting/reports', action: 'Review Cash Flow' },
    { label: 'General Ledger reviewed', ok: false, href: '/web/accounting/reports', action: 'Review GL' },
  ];
  const allDone = items.every((it) => it.ok);

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-5">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <div className="flex items-center gap-2"><Badge label="One Hotel" fg="#1d4ed8" bg="#dbeafe" /><h1 className="text-xl font-bold" style={{ color: '#222' }}>{fmtMonth(MONTH)} Close Checklist</h1></div>
          <p className="text-sm mt-0.5" style={{ color: '#929292' }}>{h.hotelName} · {h.legalEntity}</p>
        </div>
        {closed && <Badge label="Closed" fg="#15803d" bg="#dcfce7" />}
      </div>

      {closed ? (
        <div className="p-8 flex flex-col items-center text-center gap-3" style={card}>
          <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: '#dcfce7' }}><Lock className="w-7 h-7" style={{ color: '#15803d' }} /></div>
          <p className="text-base font-bold" style={{ color: '#222' }}>{fmtMonth(MONTH)} is closed for {h.hotelName}.</p>
          <p className="text-sm" style={{ color: '#6a6a6a' }}>Transactions in this month are locked unless reopened.</p>
          <button onClick={() => reopenMonth(hotelId, MONTH)} className="h-9 px-4 rounded-xl text-xs font-semibold mt-1" style={{ background: '#fef3c7', color: '#b45309' }}>Reopen Month</button>
        </div>
      ) : (
        <>
          <div className="rounded-2xl overflow-hidden" style={card}>
            {items.map((it, i) => (
              <div key={it.label} className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: i < items.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: it.ok ? '#dcfce7' : '#fef3c7' }}>
                  {it.ok ? <Check className="w-3.5 h-3.5" style={{ color: '#15803d' }} /> : <AlertTriangle className="w-3.5 h-3.5" style={{ color: '#b45309' }} />}
                </div>
                <div className="flex-1"><p className="text-sm" style={{ color: '#222' }}>{it.label}</p><p className="text-[11px]" style={{ color: it.ok ? '#15803d' : '#b45309' }}>{it.ok ? 'Complete' : 'Needs attention'}</p></div>
                {!it.ok && <Link href={it.href} className="text-xs font-semibold whitespace-nowrap" style={{ color: '#6a4ec0' }}>{it.action}</Link>}
              </div>
            ))}
          </div>
          <button onClick={() => setConfirm(true)} disabled={!allDone} className="h-11 rounded-xl text-sm font-bold" style={{ background: allDone ? '#15803d' : '#dddddd', color: '#fff' }}>Close Month</button>
          {!allDone && <p className="text-xs text-center" style={{ color: '#929292' }}>This month cannot be closed until all checklist items are complete.</p>}
        </>
      )}

      {confirm && (
        <div className="fixed inset-0 z-[55] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.4)' }} onClick={() => setConfirm(false)}>
          <div className="w-full max-w-md rounded-2xl" style={{ background: '#fff', border: '1px solid #dddddd' }} onClick={(e) => e.stopPropagation()}>
            <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid #f0f0f0' }}><h2 className="text-base font-bold" style={{ color: '#222' }}>Close {fmtMonth(MONTH)}?</h2><button onClick={() => setConfirm(false)}><X className="w-5 h-5" style={{ color: '#6a6a6a' }} /></button></div>
            <div className="px-5 py-4"><p className="text-sm" style={{ color: '#3f3f3f', lineHeight: 1.5 }}>You are about to close {fmtMonth(MONTH)} for <span className="font-semibold">{h.hotelName}</span>. After closing, transactions in this month cannot be edited unless the month is reopened by an authorized user.</p></div>
            <div className="px-5 py-4 flex justify-end gap-2" style={{ borderTop: '1px solid #f0f0f0' }}>
              <button onClick={() => setConfirm(false)} className="h-9 px-3 rounded-xl text-xs font-semibold" style={{ background: '#f7f7f7', border: '1px solid #dddddd', color: '#6a6a6a' }}>Cancel</button>
              <button onClick={() => { closeMonth(hotelId, MONTH, h.hotelName); setConfirm(false); }} className="h-9 px-4 rounded-xl text-xs font-semibold" style={{ background: '#15803d', color: '#fff' }}>Close Month</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Tick({ ok }: { ok: boolean }) { return <td className="py-2.5 px-3 text-center"><span style={{ color: ok ? '#15803d' : '#c1c1c1' }}>{ok ? '✓' : '—'}</span></td>; }
