import type { AuditEntry } from '../../types/accounting';
import { LEDGER_TRANSACTIONS } from './transactions';
import { BILLS } from './bills';

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

const ACTORS = ['Sanjay Narsee', 'Kris Patel', 'Harshal Patel', 'Auto-import', 'Lena Park CPA'];

function ts(dateIso: string, r: () => number): string {
  const h = 8 + Math.floor(r() * 12);
  const m = Math.floor(r() * 60);
  const s = Math.floor(r() * 60);
  return `${dateIso}T${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}Z`;
}

const r = rng(424242);
const out: AuditEntry[] = [];

// Statement upload events — one per source kind per recent month
const STATEMENT_DATES = ['2026-04-30', '2026-04-15', '2026-04-01', '2026-03-30', '2026-03-15'];
let n = 0;
for (const d of STATEMENT_DATES) {
  out.push({
    id: `audit-up-${n++}`,
    actorName: ACTORS[Math.floor(r() * 2)],
    action: 'upload',
    targetType: 'statement',
    targetId: `stmt-${d}`,
    timestampIso: ts(d, r),
    notes: `Bank statement uploaded · 12 hotels · ${20 + Math.floor(r() * 30)} rows`,
  });
}

// Categorize / edit / attach-receipt events on a sample of transactions
const sampleTxs = LEDGER_TRANSACTIONS.filter((t) => t.amount < 0).slice(0, 35);
for (const t of sampleTxs) {
  const action = (['categorize', 'edit', 'attach-receipt'] as const)[Math.floor(r() * 3)];
  let entry: AuditEntry = {
    id: `audit-${action}-${n++}`,
    actorName: 'Sanjay Narsee',
    action,
    targetType: 'transaction',
    targetId: t.id,
    hotelId: t.hotelId,
    timestampIso: ts(t.dateIso, r),
  };
  if (action === 'categorize') {
    entry.fieldChanged = 'accountId';
    entry.oldValue = 'acc-6500';
    entry.newValue = t.accountId;
  } else if (action === 'edit') {
    entry.fieldChanged = 'memo';
    entry.oldValue = t.memo;
    entry.newValue = `${t.memo} · clarified`;
    entry.notes = 'Memo clarified for CPA review';
  } else {
    entry.notes = 'Receipt attached · OCR matched vendor + amount';
  }
  out.push(entry);
}

// Reconciliation events — one per closed month per a few accounts
for (let i = 0; i < 12; i++) {
  out.push({
    id: `audit-recon-${n++}`,
    actorName: 'Sanjay Narsee',
    action: 'reconcile',
    targetType: 'period',
    targetId: `2026-04`,
    hotelId: ['SAVMT', 'SAVGW', 'SAVVY', 'BQKCY'][i % 4],
    timestampIso: ts('2026-04-30', r),
    notes: `Reconciled through 2026-04-30 · diff $0.00`,
  });
}

// Period close events
out.push({
  id: `audit-close-${n++}`,
  actorName: 'Sanjay Narsee',
  action: 'close-period',
  targetType: 'period',
  targetId: '2026-03',
  timestampIso: ts('2026-04-08', r),
  notes: 'March 2026 closed · 16 hotels · 0 exceptions',
});
out.push({
  id: `audit-close-${n++}`,
  actorName: 'Sanjay Narsee',
  action: 'close-period',
  targetType: 'period',
  targetId: '2026-02',
  timestampIso: ts('2026-03-08', r),
  notes: 'February 2026 closed · 16 hotels · 2 exceptions (missing receipts at SAVMT)',
});
// Reopen
out.push({
  id: `audit-reopen-${n++}`,
  actorName: 'Sanjay Narsee',
  action: 'reopen-period',
  targetType: 'period',
  targetId: '2026-02',
  timestampIso: ts('2026-03-22', r),
  reason: 'Late vendor invoice from Otis Elevator received after close',
  notes: 'Reopened to record $1,450 elevator service · re-closed same day',
});

// Bill approval events
const sampleBills = BILLS.filter((b) => b.status !== 'paid').slice(0, 12);
for (const b of sampleBills) {
  out.push({
    id: `audit-app-${n++}`,
    actorName: ['Kris Patel', 'Sanjay Narsee', 'Harshal Patel'][Math.floor(r() * 3)],
    action: 'approve',
    targetType: 'bill',
    targetId: b.id,
    hotelId: b.hotelId,
    timestampIso: ts(b.billDateIso, r),
    notes: `Approved for payment · ${b.billNumber}`,
  });
}

export const AUDIT_LOG: AuditEntry[] = out
  .sort((a, b) => (a.timestampIso > b.timestampIso ? -1 : 1));

export const auditForTransaction = (txId: string): AuditEntry[] =>
  AUDIT_LOG.filter((e) => e.targetType === 'transaction' && e.targetId === txId);
