'use client';

import { useMemo, useState } from 'react';
import { X } from 'lucide-react';
import type { BankAccount, BankImportRow } from '@hos/shared';
import { formatCurrency } from '@hos/shared';

interface Props {
  open: boolean;
  onClose: () => void;
  bankAccount: BankAccount | null;
  rows: BankImportRow[];
}

export function ReconcileSheet({ open, onClose, bankAccount, rows }: Props) {
  const [cleared, setCleared] = useState<Set<string>>(new Set());

  const totals = useMemo(() => {
    let credits = 0;
    let debits = 0;
    for (const r of rows) {
      if (cleared.has(r.id)) {
        if (r.amount > 0) credits += r.amount;
        else debits += Math.abs(r.amount);
      }
    }
    return { credits, debits };
  }, [rows, cleared]);

  if (!open || !bankAccount) return null;

  const target = bankAccount.statementBalance;
  const reconciledBookBalance = bankAccount.bookBalance - totals.debits + totals.credits - rows.filter((r) => !cleared.has(r.id)).reduce((s, r) => s + r.amount, 0);
  const diff = Math.round((reconciledBookBalance - target) * 100) / 100;
  const isBalanced = Math.abs(diff) < 0.01;

  const toggle = (id: string) => {
    setCleared((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const checkAll = () => setCleared(new Set(rows.map((r) => r.id)));
  const clearAll = () => setCleared(new Set());

  return (
    <div className="fixed inset-0 z-50 flex justify-end" style={{ background: 'rgba(0,0,0,0.4)' }}>
      <aside
        className="bg-white h-full w-full max-w-2xl flex flex-col"
        style={{ borderLeft: '1px solid #dddddd' }}
      >
        <div className="px-6 py-4 flex items-start justify-between" style={{ borderBottom: '1px solid #dddddd' }}>
          <div>
            <p className="text-xs font-bold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>Reconcile</p>
            <h3 className="text-base font-bold" style={{ color: '#222222' }}>{bankAccount.name}</h3>
            <p className="text-xs mt-0.5" style={{ color: '#929292' }}>
              Last reconciled {bankAccount.lastReconciledIso ?? '—'} · ending ····{bankAccount.last4}
            </p>
          </div>
          <button onClick={onClose} className="text-[#6a6a6a] hover:text-[#222222]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-4 grid grid-cols-3 gap-3" style={{ borderBottom: '1px solid #dddddd', background: '#f7f7f7' }}>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>Statement Balance</p>
            <p className="text-base font-bold mt-0.5" style={{ color: '#222222' }}>{formatCurrency(target)}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>Book Balance (cleared)</p>
            <p className="text-base font-bold mt-0.5" style={{ color: '#222222' }}>{formatCurrency(reconciledBookBalance)}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>Difference</p>
            <p className="text-base font-bold mt-0.5" style={{ color: isBalanced ? '#15803d' : '#b91c1c' }}>
              {diff >= 0 ? '+' : ''}{formatCurrency(diff)}
            </p>
          </div>
        </div>

        <div className="px-6 py-3 flex items-center justify-between gap-2" style={{ borderBottom: '1px solid #dddddd' }}>
          <p className="text-xs font-semibold" style={{ color: '#6a6a6a' }}>{cleared.size} of {rows.length} cleared</p>
          <div className="flex gap-2">
            <button type="button" onClick={checkAll} className="text-xs font-semibold px-3 py-1 rounded-full" style={{ border: '1px solid #dddddd', color: '#3f3f3f' }}>Check all</button>
            <button type="button" onClick={clearAll} className="text-xs font-semibold px-3 py-1 rounded-full" style={{ border: '1px solid #dddddd', color: '#3f3f3f' }}>Clear all</button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {rows.map((r, i) => (
            <label
              key={r.id}
              className="flex items-center gap-3 px-6 py-3 cursor-pointer hover:bg-[#fafafa]"
              style={{ borderBottom: i < rows.length - 1 ? '1px solid #f0f0f0' : 'none' }}
            >
              <input type="checkbox" checked={cleared.has(r.id)} onChange={() => toggle(r.id)} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium" style={{ color: '#222222' }}>{r.description}</p>
                <p className="text-xs mt-0.5" style={{ color: '#929292' }}>{r.dateIso}</p>
              </div>
              <p className="text-sm font-semibold" style={{ color: r.amount >= 0 ? '#15803d' : '#b91c1c' }}>
                {r.amount >= 0 ? '+' : ''}{formatCurrency(r.amount)}
              </p>
            </label>
          ))}
        </div>

        <div className="px-6 py-4 flex justify-end gap-3" style={{ borderTop: '1px solid #dddddd' }}>
          <button type="button" onClick={onClose} className="text-xs font-semibold px-4 py-2 rounded-full" style={{ border: '1px solid #dddddd', color: '#3f3f3f' }}>Cancel</button>
          <button
            type="button"
            disabled={!isBalanced}
            onClick={() => alert('Demo only — would mark this period reconciled.')}
            className="text-xs font-semibold px-4 py-2 rounded-full transition-colors"
            style={{
              background: isBalanced ? '#15803d' : '#f0f0f0',
              color: isBalanced ? '#ffffff' : '#929292',
              cursor: isBalanced ? 'pointer' : 'not-allowed',
            }}
          >
            Finish reconciliation
          </button>
        </div>
      </aside>
    </div>
  );
}
