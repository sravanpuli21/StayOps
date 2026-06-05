'use client';

/**
 * Mutable accounting state (in-session, per the demo). The seed arrays
 * (BILLS, LEDGER_TRANSACTIONS) stay immutable; this store holds OVERRIDES the
 * accountant creates — paid bills, categorized transactions — plus an in-session
 * audit log. Backed by localStorage + useSyncExternalStore so every accounting
 * page reflects the change immediately. Real persistence is a backend follow-up.
 */
import { useSyncExternalStore } from 'react';
import type { AuditEntry } from '@hos/shared';

interface BillOverride { status: 'paid'; paidIso: string }
interface TxOverride { accountId: string; categorizedIso: string }

interface AcctState {
  billOverrides: Record<string, BillOverride>;   // billId → override
  txOverrides: Record<string, TxOverride>;        // txId → override
  /** Import/review rows the accountant has categorized (rowId → accountId). */
  resolvedRows: Record<string, string>;
  audit: AuditEntry[];                            // newest first
}

const KEY = 'hos.accounting.state';
const listeners = new Set<() => void>();
let cache: AcctState | null = null;

const empty: AcctState = { billOverrides: {}, txOverrides: {}, resolvedRows: {}, audit: [] };

function read(): AcctState {
  if (cache) return cache;
  if (typeof window === 'undefined') return empty;
  try {
    const raw = localStorage.getItem(KEY);
    cache = raw ? { ...empty, ...(JSON.parse(raw) as AcctState) } : { ...empty };
  } catch {
    cache = { ...empty };
  }
  return cache!;
}

function write(next: AcctState) {
  cache = next;
  try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* ignore */ }
  listeners.forEach((l) => l());
}

function stamp(): string {
  // Deterministic-ish session timestamp; avoids importing date utils.
  return new Date().toISOString();
}

/* ── Mutations ────────────────────────────────────────────────────────── */

export function payBills(
  bills: Array<{ id: string; hotelId: string; vendorId: string; amount: number }>,
  paidIso: string,
  actor = 'Sanjay Narsee',
) {
  const s = read();
  const billOverrides = { ...s.billOverrides };
  const entries: AuditEntry[] = [];
  for (const b of bills) {
    billOverrides[b.id] = { status: 'paid', paidIso };
    entries.push({
      id: `audit-pay-${b.id}-${Date.now()}`,
      actorName: actor, action: 'approve', targetType: 'bill', targetId: b.id,
      hotelId: b.hotelId, timestampIso: stamp(),
      fieldChanged: 'status', oldValue: 'open', newValue: 'paid',
      notes: `Paid bill · $${b.amount.toFixed(2)}`,
    });
  }
  write({ ...s, billOverrides, audit: [...entries, ...s.audit] });
}

export function categorizeTx(
  tx: { id: string; hotelId: string },
  accountId: string,
  accountName: string,
  actor = 'Sanjay Narsee',
) {
  const s = read();
  const entry: AuditEntry = {
    id: `audit-cat-${tx.id}-${Date.now()}`,
    actorName: actor, action: 'categorize', targetType: 'transaction', targetId: tx.id,
    hotelId: tx.hotelId, timestampIso: stamp(),
    fieldChanged: 'accountId', newValue: accountName,
  };
  write({
    ...s,
    txOverrides: { ...s.txOverrides, [tx.id]: { accountId, categorizedIso: stamp() } },
    audit: [entry, ...s.audit],
  });
}

/** Categorize a bank/CC/payroll review row to an account (persists across refresh). */
export function resolveReviewRow(
  row: { id: string; hotelId: string; description: string },
  accountId: string,
  accountName: string,
  actor = 'Sanjay Narsee',
) {
  const s = read();
  const entry: AuditEntry = {
    id: `audit-cat-${row.id}-${Date.now()}`,
    actorName: actor, action: 'categorize', targetType: 'transaction', targetId: row.id,
    hotelId: row.hotelId, timestampIso: stamp(),
    fieldChanged: 'accountId', newValue: accountName, notes: row.description,
  };
  write({
    ...s,
    resolvedRows: { ...s.resolvedRows, [row.id]: accountId },
    audit: [entry, ...s.audit],
  });
}

/* ── Reads ────────────────────────────────────────────────────────────── */

export function useAccountingState(): AcctState {
  return useSyncExternalStore(
    (cb) => { listeners.add(cb); return () => listeners.delete(cb); },
    read,
    () => empty,
  );
}
