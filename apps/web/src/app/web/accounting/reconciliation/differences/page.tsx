'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, AlertTriangle } from 'lucide-react';
import { getEntity } from '@hos/shared/accounting-os';
import { useAcctOs } from '../../_context';
import { useAcctState, startReconciliation, createReconAdjustment } from '../../_store';
import { differenceRows, reconTransactions, computeMath, RECON_MONTH, type DifferenceRow } from '../../_recon';
import { card, Badge, money } from '../../_ui';
import { ReconTabs, SummaryCard } from '../_shared';

export default function DifferencesPage() {
  const { selection } = useAcctOs();
  const router = useRouter();
  const store = useAcctState();
  const [adjFor, setAdjFor] = useState<DifferenceRow | null>(null);
  const rows = differenceRows(store, selection.kind === 'hotel' ? selection.hotelId : undefined);
  const bankDiffs = rows.filter((r) => r.acct.kind === 'bank');
  const cardDiffs = rows.filter((r) => r.acct.kind === 'card');
  const high = rows.filter((r) => Math.abs(r.difference) > 100);

  const openWorkspace = (r: DifferenceRow) => {
    const key = `${r.acct.id}:${RECON_MONTH}`;
    if (!store.reconRecords[key]) {
      const txs = reconTransactions(r.acct.id);
      const m = computeMath(r.acct, txs, new Set());
      startReconciliation({ accountId: r.acct.id, hotelId: r.acct.hotelId, kind: r.acct.kind, accountName: r.acct.name, month: RECON_MONTH, startDate: '2026-05-01', endDate: '2026-05-31', beginningBalance: r.acct.beginningBalance, endingBalance: m.statementBalance });
    }
    router.push(`/web/accounting/reconciliation/${encodeURIComponent(key)}`);
  };

  return (
    <div className="max-w-[1400px] mx-auto flex flex-col gap-5">
      <ReconTabs />
      <div><h1 className="text-xl font-bold" style={{ color: '#222' }}>Reconciliation Differences</h1><p className="text-sm" style={{ color: '#929292' }}>Review accounts and cards where the cleared balance does not match the statement balance.</p></div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <SummaryCard label="Total Differences" value={rows.length} accent={rows.length ? '#b91c1c' : '#15803d'} />
        <SummaryCard label="Bank Differences" value={bankDiffs.length} />
        <SummaryCard label="Credit Card Differences" value={cardDiffs.length} />
        <SummaryCard label="High Difference" value={high.length} accent={high.length ? '#b91c1c' : '#15803d'} />
        <SummaryCard label="Small Difference" value={rows.length - high.length} />
        <SummaryCard label="Oldest Open" value={rows.length ? 'May 2026' : '—'} />
      </div>

      {rows.length === 0 ? (
        <div className="rounded-2xl p-12 text-center" style={{ ...card, borderStyle: 'dashed' }}>
          <p className="text-base font-semibold" style={{ color: '#222' }}>No reconciliation differences.</p>
          <p className="text-sm mt-1" style={{ color: '#6a6a6a' }}>All in-progress reconciliations currently match their statement balances.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl" style={card}>
          <table className="w-full text-sm border-collapse">
            <thead><tr style={{ background: '#f7f7f7', borderBottom: '1px solid #dddddd' }}>{['Hotel', 'Account/Card', 'Type', 'Statement', 'Statement Bal.', 'Cleared Bal.', 'Difference', 'Possible Reason', 'Action'].map((h, i) => <th key={h} className="text-[10px] font-semibold uppercase tracking-wide py-2.5 px-3 whitespace-nowrap" style={{ color: '#6a6a6a', textAlign: i >= 4 && i <= 6 ? 'right' : 'left' }}>{h}</th>)}</tr></thead>
            <tbody>
              {rows.map((r) => { const txs = reconTransactions(r.acct.id); const m = computeMath(r.acct, txs, new Set()); return (
                <tr key={r.acct.id} className="hover:bg-[#fafafa]" style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td className="py-2.5 px-3 text-sm" style={{ color: '#222' }}>{getEntity(r.acct.hotelId)?.hotelName}</td>
                  <td className="py-2.5 px-3 text-sm" style={{ color: '#222' }}>{r.acct.name} <span className="text-xs" style={{ color: '#929292' }}>••{r.acct.last4}</span></td>
                  <td className="py-2.5 px-3 text-xs" style={{ color: '#6a6a6a' }}>{r.acct.kind === 'bank' ? 'Bank' : 'Credit Card'}</td>
                  <td className="py-2.5 px-3 text-xs" style={{ color: '#6a6a6a' }}>{r.acct.statementMonth}</td>
                  <td className="py-2.5 px-3 text-xs text-right" style={{ color: '#3f3f3f' }}>{money(m.statementBalance)}</td>
                  <td className="py-2.5 px-3 text-xs text-right" style={{ color: '#3f3f3f' }}>{money(m.statementBalance - r.difference)}</td>
                  <td className="py-2.5 px-3 text-xs text-right font-semibold" style={{ color: '#b91c1c' }}>{money(Math.abs(r.difference))}</td>
                  <td className="py-2.5 px-3 text-xs" style={{ color: '#6a6a6a' }}>{r.reason}</td>
                  <td className="py-2.5 px-3"><div className="flex gap-2 whitespace-nowrap"><button onClick={() => openWorkspace(r)} className="text-xs font-semibold" style={{ color: '#6a4ec0' }}>Open Workspace</button><button onClick={() => setAdjFor(r)} className="text-xs font-semibold" style={{ color: '#929292' }}>Add Adjustment</button></div></td>
                </tr>
              ); })}
            </tbody>
          </table>
        </div>
      )}

      {adjFor && <AdjustmentModal row={adjFor} onClose={() => setAdjFor(null)} />}
    </div>
  );
}

function AdjustmentModal({ row, onClose }: { row: DifferenceRow; onClose: () => void }) {
  const [amount, setAmount] = useState(String(Math.abs(row.difference)));
  const [category, setCategory] = useState('');
  const [reason, setReason] = useState('');
  const [memo, setMemo] = useState('');
  const [error, setError] = useState('');

  const create = () => {
    if (!amount) { setError('Adjustment amount is required.'); return; }
    if (!category) { setError('Adjustment account is required.'); return; }
    if (!reason) { setError('Adjustment reason is required.'); return; }
    createReconAdjustment({ accountId: row.acct.id, hotelId: row.acct.hotelId, date: '2026-05-31', amount: Number(amount), category, reason, memo }, row.acct.name);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[55] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.4)' }} onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl flex flex-col" style={{ background: '#fff', border: '1px solid #dddddd' }} onClick={(e) => e.stopPropagation()}>
        <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid #f0f0f0' }}><h2 className="text-base font-bold" style={{ color: '#222' }}>Add Adjustment</h2><button onClick={onClose}><X className="w-5 h-5" style={{ color: '#6a6a6a' }} /></button></div>
        <div className="px-5 py-4 flex flex-col gap-3">
          <div className="px-3 py-2 rounded-lg text-xs flex items-start gap-2" style={{ background: '#fef3c7', color: '#b45309' }}><AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />Adjustments should only be used after confirming the statement and transactions are correct.</div>
          <Field label="Account"><p className="text-sm" style={{ color: '#222' }}>{row.acct.name} · {getEntity(row.acct.hotelId)?.hotelName}</p></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Adjustment Date"><input type="date" defaultValue="2026-05-31" className={inp} /></Field>
            <Field label="Amount *"><input value={amount} onChange={(e) => setAmount(e.target.value)} className={inp} /></Field>
          </div>
          <Field label="Category *"><select value={category} onChange={(e) => setCategory(e.target.value)} className={inp}><option value="">Select…</option><option>Bank Fees</option><option>Interest Income</option><option>Miscellaneous Expense</option><option>Prior Period Adjustment</option></select></Field>
          <Field label="Reason *"><input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Unrecorded bank fee" className={inp} /></Field>
          <Field label="Memo"><input value={memo} onChange={(e) => setMemo(e.target.value)} className={inp} /></Field>
          {error && <p className="text-xs" style={{ color: '#b91c1c' }}>{error}</p>}
        </div>
        <div className="px-5 py-4 flex justify-end gap-2" style={{ borderTop: '1px solid #f0f0f0' }}><button onClick={onClose} className="h-9 px-4 rounded-xl text-xs font-semibold" style={{ background: '#f7f7f7', border: '1px solid #dddddd', color: '#6a6a6a' }}>Cancel</button><button onClick={create} className="h-9 px-5 rounded-xl text-xs font-semibold" style={{ background: '#6a4ec0', color: '#fff' }}>Create Adjustment</button></div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <div className="flex flex-col gap-1"><label className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>{label}</label>{children}</div>; }
const inp = 'h-9 px-2.5 rounded-lg text-sm w-full border border-[#dddddd] bg-white text-[#222]';
