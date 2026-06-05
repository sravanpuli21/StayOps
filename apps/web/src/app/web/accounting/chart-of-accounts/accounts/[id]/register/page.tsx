'use client';

import { use, Suspense } from 'react';
import Link from 'next/link';
import { ArrowLeft, Download } from 'lucide-react';
import { getEntity, txForHotel } from '@hos/shared/accounting-os';
import { useAcctOs } from '../../../../_context';
import { useAcctState } from '../../../../_store';
import { oneAccount } from '../../../../_coa';
import { card, money, fmtDate } from '../../../../_ui';
import { TypeBadge } from '../../../_shared';

function Inner({ code }: { code: string }) {
  const { selection } = useAcctOs();
  const store = useAcctState();
  const hotelId = selection.kind === 'hotel' ? selection.hotelId : '';
  const a = hotelId ? oneAccount(store, hotelId, code) : undefined;
  const h = getEntity(hotelId);

  if (!a) return (
    <div className="max-w-5xl mx-auto flex flex-col gap-4"><Back code={code} /><div className="rounded-2xl p-10 text-center text-sm" style={{ border: '1px dashed #dddddd', background: '#fff', color: '#929292' }}>Select a hotel from the top bar to view this register.</div></div>
  );

  const txs = [...txForHotel(hotelId).filter((t) => t.category === a.name)].reverse();
  let running = a.openingBalance ?? 0;
  const totalDebit = txs.filter((t) => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);
  const totalCredit = txs.filter((t) => t.amount >= 0).reduce((s, t) => s + Math.abs(t.amount), 0);

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-4">
      <Back code={code} />
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap"><h1 className="text-xl font-bold" style={{ color: '#222' }}>Register · {a.code} {a.name}</h1><TypeBadge type={a.type} /></div>
        <button className="h-9 px-3 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5" style={{ background: '#fff', border: '1px solid #dddddd', color: '#6a6a6a' }}><Download className="w-3.5 h-3.5" /> Export Account Activity</button>
      </div>
      <p className="text-sm" style={{ color: '#929292' }}>{h?.hotelName} · All posted activity for this account, with a running balance.</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[['Opening Balance', money(a.openingBalance ?? 0)], ['Total Debits', money(totalDebit)], ['Total Credits', money(totalCredit)], ['Current Balance', money(running + totalDebit + totalCredit)]].map(([l, v]) => (
          <div key={l} className="p-3" style={card}><p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: '#929292' }}>{l}</p><p className="text-base font-bold mt-0.5" style={{ color: '#222' }}>{v}</p></div>
        ))}
      </div>

      {txs.length === 0 ? (
        <div className="rounded-2xl p-10 text-center text-sm" style={{ border: '1px dashed #dddddd', background: '#fff', color: '#929292' }}>No activity for this account yet.</div>
      ) : (
        <div className="overflow-x-auto rounded-2xl" style={card}>
          <table className="w-full text-sm border-collapse">
            <thead><tr style={{ background: '#f7f7f7', borderBottom: '1px solid #dddddd' }}>{['Date', 'Source', 'Transaction', 'Memo', 'Debit', 'Credit', 'Balance', 'JE', 'Actions'].map((c, i) => <th key={c} className="text-[10px] font-semibold uppercase tracking-wide py-2.5 px-3 whitespace-nowrap" style={{ color: '#6a6a6a', textAlign: i >= 4 && i <= 6 ? 'right' : 'left' }}>{c}</th>)}</tr></thead>
            <tbody>
              {txs.map((t, i) => { const debit = t.amount < 0; running += Math.abs(t.amount); return (
                <tr key={t.id} style={{ borderBottom: i < txs.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                  <td className="py-2.5 px-3 text-xs" style={{ color: '#6a6a6a' }}>{fmtDate(t.dateIso)}</td>
                  <td className="py-2.5 px-3 text-xs" style={{ color: '#6a6a6a' }}>{t.source === 'bank' ? 'Bank' : 'Card'}</td>
                  <td className="py-2.5 px-3 text-sm" style={{ color: '#222' }}>{t.description}</td>
                  <td className="py-2.5 px-3 text-xs" style={{ color: '#929292' }}>{t.memo ?? '—'}</td>
                  <td className="py-2.5 px-3 text-xs text-right" style={{ color: '#222' }}>{debit ? money(Math.abs(t.amount)) : '—'}</td>
                  <td className="py-2.5 px-3 text-xs text-right" style={{ color: '#222' }}>{!debit ? money(Math.abs(t.amount)) : '—'}</td>
                  <td className="py-2.5 px-3 text-xs text-right font-semibold" style={{ color: '#222' }}>{money(running)}</td>
                  <td className="py-2.5 px-3 text-xs font-mono" style={{ color: '#6a4ec0' }}>JE-{1000 + i}</td>
                  <td className="py-2.5 px-3"><Link href="/web/accounting/transactions" className="text-xs font-semibold" style={{ color: '#6a4ec0' }}>View</Link></td>
                </tr>
              ); })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Back({ code }: { code: string }) { return <Link href={`/web/accounting/chart-of-accounts/accounts/${code}`} className="inline-flex items-center gap-1 text-sm" style={{ color: '#6a6a6a' }}><ArrowLeft className="w-4 h-4" /> Account Detail</Link>; }

export default function RegisterPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <Suspense fallback={null}><Inner code={id} /></Suspense>;
}
