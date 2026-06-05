'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CreditCard } from 'lucide-react';
import { getEntity } from '@hos/shared/accounting-os';
import { useAcctOs } from '../../_context';
import { useAcctState } from '../../_store';
import { reconAccounts, statusForAccount, differenceForAccount, computeMath, reconTransactions } from '../../_recon';
import { card, Badge, money } from '../../_ui';
import { ReconTabs, ReconStatusBadge, actionFor } from '../_shared';
import { StartFlow } from '../_StartFlow';

export default function CardReconPage() {
  const { selection } = useAcctOs();
  const router = useRouter();
  const store = useAcctState();
  const [start, setStart] = useState<string | null>(null);
  const single = selection.kind === 'hotel';
  const accts = reconAccounts(store, single ? selection.hotelId : undefined).filter((a) => a.kind === 'card');

  const go = (id: string, status: string) => {
    if (status === 'reconciled') { router.push(`/web/accounting/reconciliation/${encodeURIComponent(`${id}:2026-05`)}/report`); return; }
    const key = `${id}:2026-05`;
    if (store.reconRecords[key]) router.push(`/web/accounting/reconciliation/${encodeURIComponent(key)}`);
    else setStart(id);
  };

  return (
    <div className="max-w-[1400px] mx-auto flex flex-col gap-5">
      <ReconTabs />
      <div className="flex items-center gap-2">
        <CreditCard className="w-5 h-5" style={{ color: '#6a4ec0' }} />
        <div><h1 className="text-xl font-bold" style={{ color: '#222' }}>Credit Card Reconciliation</h1><p className="text-sm" style={{ color: '#929292' }}>Reconcile credit card statements for {single ? getEntity(selection.hotelId)?.hotelName : 'each hotel entity'}.</p></div>
      </div>

      {accts.length === 0 ? (
        <Empty />
      ) : single ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {accts.map((a) => { const st = statusForAccount(store, a); const diff = differenceForAccount(store, a); const m = computeMath(a, reconTransactions(a.id), new Set()); return (
            <div key={a.id} className="p-5 flex flex-col gap-2" style={card}>
              <div><p className="font-bold text-sm" style={{ color: '#222' }}>{a.name}</p><p className="text-xs" style={{ color: '#929292' }}>{a.institution} · {a.last4}</p></div>
              <div className="flex flex-col gap-0.5 text-xs" style={{ color: '#6a6a6a' }}>
                <span>Last Reconciled: {a.lastReconciled ?? '—'}</span>
                <span>Statement Balance: <b style={{ color: '#222' }}>{money(m.statementBalance)}</b></span>
                <span>Difference: <b style={{ color: diff ? '#b91c1c' : '#15803d' }}>{money(Math.abs(diff))}</b></span>
              </div>
              <ReconStatusBadge status={st} />
              <div className="flex gap-2 mt-1">
                <button onClick={() => go(a.id, st)} className="flex-1 h-9 rounded-xl text-xs font-semibold" style={{ background: '#6a4ec0', color: '#fff' }}>{actionFor(st)}</button>
                <a href="/web/accounting/credit-cards" className="flex-1 h-9 leading-9 text-center rounded-xl text-xs font-semibold" style={{ background: '#f7f7f7', border: '1px solid #dddddd', color: '#6a6a6a' }}>View Payments</a>
              </div>
            </div>
          ); })}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl" style={card}>
          <table className="w-full text-sm border-collapse">
            <thead><tr style={{ background: '#f7f7f7', borderBottom: '1px solid #dddddd' }}>{['Hotel', 'Code', 'Credit Card', 'Issuer', 'Last 4', 'Statement', 'Statement Bal.', 'Cleared Bal.', 'Difference', 'Status', 'Action'].map((h, i) => <th key={h} className="text-[10px] font-semibold uppercase tracking-wide py-2.5 px-3 whitespace-nowrap" style={{ color: '#6a6a6a', textAlign: i >= 6 && i <= 8 ? 'right' : 'left' }}>{h}</th>)}</tr></thead>
            <tbody>
              {accts.map((a) => { const st = statusForAccount(store, a); const diff = differenceForAccount(store, a); const m = computeMath(a, reconTransactions(a.id), new Set()); return (
                <tr key={a.id} className="hover:bg-[#fafafa]" style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td className="py-2.5 px-3 font-medium whitespace-nowrap" style={{ color: '#222' }}>{getEntity(a.hotelId)?.hotelName}</td>
                  <td className="py-2.5 px-3 text-xs font-mono" style={{ color: '#6a6a6a' }}>{getEntity(a.hotelId)?.propertyCode}</td>
                  <td className="py-2.5 px-3 text-sm" style={{ color: '#222' }}>{a.name}</td>
                  <td className="py-2.5 px-3 text-xs" style={{ color: '#6a6a6a' }}>{a.institution}</td>
                  <td className="py-2.5 px-3 text-xs font-mono" style={{ color: '#6a6a6a' }}>••{a.last4}</td>
                  <td className="py-2.5 px-3 text-xs" style={{ color: '#6a6a6a' }}>{a.statementUploaded ? a.statementMonth : <span style={{ color: '#b45309' }}>Missing</span>}</td>
                  <td className="py-2.5 px-3 text-xs text-right" style={{ color: '#3f3f3f' }}>{money(m.statementBalance)}</td>
                  <td className="py-2.5 px-3 text-xs text-right" style={{ color: '#3f3f3f' }}>{money(m.statementBalance - diff)}</td>
                  <td className="py-2.5 px-3 text-xs text-right" style={{ color: diff ? '#b91c1c' : '#15803d' }}>{money(Math.abs(diff))}</td>
                  <td className="py-2.5 px-3"><ReconStatusBadge status={st} /></td>
                  <td className="py-2.5 px-3"><button onClick={() => go(a.id, st)} className="text-xs font-semibold" style={{ color: '#6a4ec0' }}>{actionFor(st)}</button></td>
                </tr>
              ); })}
            </tbody>
          </table>
        </div>
      )}

      {start && <StartFlow preAccountId={start} onClose={() => setStart(null)} />}
    </div>
  );
}

function Empty() { return <div className="rounded-2xl p-12 text-center" style={{ ...card, borderStyle: 'dashed' }}><p className="text-base font-semibold" style={{ color: '#222' }}>No credit cards available to reconcile.</p><p className="text-sm mt-1" style={{ color: '#6a6a6a' }}>Add a credit card before starting reconciliation.</p></div>; }
