import {
  ACCT_BANK_ACCOUNTS, ACCT_CREDIT_CARDS, HOTEL_ENTITIES,
  ACCT_TRANSACTIONS, getEntity, type AcctTransaction,
} from '@hos/shared/accounting-os';
import type { ReconRecord } from './_store';

export const RECON_MONTH = '2026-05';

interface StoreLike {
  reconRecords: Record<string, ReconRecord>;
  recon: Record<string, { cleared: string[]; finished: boolean }>;
  closed: string[];
  addedBank: Array<{ id: string; hotelId: string; name: string; bank: string; last4: string; openingBalance: number }>;
  addedCards: Array<{ id: string; hotelId: string; name: string; issuer: string; last4: string; openingBalance: number }>;
}

export type ReconUiStatus = 'not-started' | 'in-progress' | 'difference' | 'ready-to-finish' | 'reconciled' | 'blocked' | 'reopened';

export interface ReconAccount {
  id: string;
  hotelId: string;
  kind: 'bank' | 'card';
  name: string;
  institution: string;
  last4: string;
  cardHolder?: string;
  beginningBalance: number;
  statementBalance: number;     // ending balance / statement balance
  statementMonth: string;
  statementUploaded: boolean;
  lastReconciled: string | null;
}

// Deterministic pseudo-random per id, for stable mock numbers.
function seed(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return (h >>> 0) / 0xffffffff;
}

/** All reconcilable accounts (bank + card), seed + added. */
export function reconAccounts(store: StoreLike, hotelId?: string): ReconAccount[] {
  const banks: ReconAccount[] = ACCT_BANK_ACCOUNTS.map((a) => ({
    id: a.id, hotelId: a.hotelId, kind: 'bank', name: a.name, institution: a.bank, last4: a.last4,
    beginningBalance: a.openingBalance, statementBalance: a.currentBalance, statementMonth: a.lastStatementMonth ?? RECON_MONTH,
    statementUploaded: a.lastStatementMonth === RECON_MONTH, lastReconciled: a.reconStatus === 'reconciled' ? '2026-04' : null,
  }));
  const cards: ReconAccount[] = ACCT_CREDIT_CARDS.map((c) => ({
    id: c.id, hotelId: c.hotelId, kind: 'card', name: c.name, institution: c.issuer, last4: c.last4, cardHolder: c.cardHolder,
    beginningBalance: 0, statementBalance: c.currentBalance, statementMonth: c.lastStatementMonth ?? RECON_MONTH,
    statementUploaded: c.lastStatementMonth === RECON_MONTH, lastReconciled: c.reconStatus === 'reconciled' ? '2026-04' : null,
  }));
  const addedB: ReconAccount[] = store.addedBank.map((a) => ({ id: a.id, hotelId: a.hotelId, kind: 'bank', name: a.name, institution: a.bank, last4: a.last4, beginningBalance: a.openingBalance, statementBalance: a.openingBalance, statementMonth: RECON_MONTH, statementUploaded: false, lastReconciled: null }));
  const addedC: ReconAccount[] = store.addedCards.map((c) => ({ id: c.id, hotelId: c.hotelId, kind: 'card', name: c.name, institution: c.issuer, last4: c.last4, beginningBalance: 0, statementBalance: c.openingBalance, statementMonth: RECON_MONTH, statementUploaded: false, lastReconciled: null }));
  const all = [...banks, ...cards, ...addedB, ...addedC];
  return hotelId ? all.filter((a) => a.hotelId === hotelId) : all;
}

export function oneReconAccount(store: StoreLike, accountId: string): ReconAccount | undefined {
  return reconAccounts(store).find((a) => a.id === accountId);
}

/** Transactions for an account in the statement month. */
export function reconTransactions(accountId: string): AcctTransaction[] {
  return ACCT_TRANSACTIONS.filter((t) => t.accountId === accountId);
}

/* ── Reconciliation math ──────────────────────────────────────────────── */
export interface ReconMath {
  beginningBalance: number;
  clearedIn: number;     // money in / credits
  clearedOut: number;    // money out / charges
  clearedBalance: number;
  statementBalance: number;
  difference: number;
  balanced: boolean;
}

/**
 * Compute cleared-balance math. For demo realism, "the statement ending balance"
 * is set so that clearing EVERY posted transaction yields difference $0.00.
 */
export function computeMath(acct: ReconAccount, txs: AcctTransaction[], clearedIds: Set<string>): ReconMath {
  const cleared = txs.filter((t) => clearedIds.has(t.id));
  if (acct.kind === 'bank') {
    const clearedIn = cleared.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0);
    const clearedOut = cleared.filter((t) => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);
    const clearedBalance = acct.beginningBalance + clearedIn - clearedOut;
    // statement ending balance = beginning + ALL posted net (so full-clear → $0 diff)
    const allIn = txs.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0);
    const allOut = txs.filter((t) => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);
    const statementBalance = round(acct.beginningBalance + allIn - allOut);
    const difference = round(statementBalance - clearedBalance);
    return { beginningBalance: acct.beginningBalance, clearedIn: round(clearedIn), clearedOut: round(clearedOut), clearedBalance: round(clearedBalance), statementBalance, difference, balanced: Math.abs(difference) < 0.005 };
  }
  // credit card: charges (money out) increase balance, credits reduce
  const clearedCharges = cleared.filter((t) => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);
  const clearedCredits = cleared.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const clearedBalance = acct.beginningBalance + clearedCharges - clearedCredits;
  const allCharges = txs.filter((t) => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);
  const allCredits = txs.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const statementBalance = round(acct.beginningBalance + allCharges - allCredits);
  const difference = round(statementBalance - clearedBalance);
  return { beginningBalance: acct.beginningBalance, clearedIn: round(clearedCredits), clearedOut: round(clearedCharges), clearedBalance: round(clearedBalance), statementBalance, difference, balanced: Math.abs(difference) < 0.005 };
}
function round(n: number) { return Math.round(n * 100) / 100; }

/* ── Blockers per account ─────────────────────────────────────────────── */
export interface Blocker { type: string; severity: 'high' | 'warning'; count: number; message: string; action: string; href: string }
export function blockersForAccount(store: StoreLike, acct: ReconAccount): Blocker[] {
  const txs = reconTransactions(acct.id);
  const out: Blocker[] = [];
  const unposted = txs.filter((t) => t.status !== 'posted').length;
  const dupes = txs.filter((t) => t.duplicate).length;
  const missingCat = txs.filter((t) => !t.category && t.status !== 'posted').length;
  const missingReceipt = txs.filter((t) => t.receipt === 'missing').length;
  if (!acct.statementUploaded) out.push({ type: 'Statement Missing', severity: 'high', count: 1, message: `No ${acct.statementMonth} statement uploaded for ${acct.name}.`, action: 'Upload Statement', href: acct.kind === 'bank' ? `/web/accounting/banking/upload?hotel=${acct.hotelId}` : `/web/accounting/credit-cards/upload?hotel=${acct.hotelId}` });
  if (unposted > 0) out.push({ type: 'Transactions Not Posted', severity: 'high', count: unposted, message: `${unposted} transactions must be posted before reconciliation can be finished.`, action: 'Review Transactions', href: '/web/accounting/transactions' });
  if (dupes > 0) out.push({ type: 'Duplicate Warning', severity: 'warning', count: dupes, message: `${dupes} possible duplicate transactions may affect the cleared balance.`, action: 'Resolve Duplicates', href: '/web/accounting/transactions' });
  if (missingCat > 0) out.push({ type: 'Missing Category', severity: 'warning', count: missingCat, message: `${missingCat} transactions are missing a category.`, action: 'Review Transactions', href: '/web/accounting/transactions' });
  if (acct.kind === 'card' && missingReceipt > 0) out.push({ type: 'Missing Receipt', severity: 'warning', count: missingReceipt, message: `${missingReceipt} transactions are missing receipts but already posted.`, action: 'Review Transactions', href: '/web/accounting/transactions' });
  return out;
}

/* ── Status resolution for an account ─────────────────────────────────── */
export function statusForAccount(store: StoreLike, acct: ReconAccount): ReconUiStatus {
  const key = `${acct.id}:${acct.statementMonth}`;
  const rec = store.reconRecords[key];
  const legacyFinished = store.recon[acct.id]?.finished;
  if (rec?.status === 'reopened') return 'reopened';
  if (rec?.status === 'reconciled' || legacyFinished) return 'reconciled';
  const blockers = blockersForAccount(store, acct);
  if (blockers.some((b) => b.severity === 'high')) return 'blocked';
  if (rec?.status === 'in-progress') {
    const txs = reconTransactions(acct.id);
    const m = computeMath(acct, txs, new Set(rec.cleared));
    if (m.balanced && blockers.length === 0) return 'ready-to-finish';
    return m.difference !== 0 ? 'difference' : 'in-progress';
  }
  return 'not-started';
}

/** Difference amount for an in-progress/blocked account (0 if reconciled/not started). */
export function differenceForAccount(store: StoreLike, acct: ReconAccount): number {
  const key = `${acct.id}:${acct.statementMonth}`;
  const rec = store.reconRecords[key];
  const txs = reconTransactions(acct.id);
  if (rec) return computeMath(acct, txs, new Set(rec.cleared)).difference;
  // synthetic difference for some not-started accounts to make the demo realistic
  const s = statusForAccount(store, acct);
  if (s === 'reconciled') return 0;
  return seed(acct.id) > 0.8 ? round2(seed(acct.id + 'd') * 400) : 0;
}
function round2(n: number) { return Math.round(n * 100) / 100; }

/* ── Portfolio + per-hotel summaries ──────────────────────────────────── */
export function portfolioReconSummary(store: StoreLike) {
  const all = reconAccounts(store);
  const statuses = all.map((a) => statusForAccount(store, a));
  return {
    total: all.length,
    reconciled: statuses.filter((s) => s === 'reconciled').length,
    inProgress: statuses.filter((s) => s === 'in-progress' || s === 'ready-to-finish').length,
    notStarted: statuses.filter((s) => s === 'not-started').length,
    difference: statuses.filter((s) => s === 'difference').length,
    blocked: statuses.filter((s) => s === 'blocked').length,
    missingStatements: all.filter((a) => !a.statementUploaded).length,
    readyForClose: HOTEL_ENTITIES.filter((h) => reconAccounts(store, h.id).every((a) => statusForAccount(store, a) === 'reconciled')).length,
  };
}

export function hotelReconSummary(store: StoreLike, hotelId: string) {
  const all = reconAccounts(store, hotelId);
  const statuses = all.map((a) => statusForAccount(store, a));
  const blocked = statuses.some((s) => s === 'blocked');
  const allDone = all.length > 0 && statuses.every((s) => s === 'reconciled');
  return {
    total: all.length,
    reconciled: statuses.filter((s) => s === 'reconciled').length,
    inProgress: statuses.filter((s) => s === 'in-progress' || s === 'ready-to-finish').length,
    difference: statuses.filter((s) => s === 'difference').length,
    missingStatements: all.filter((a) => !a.statementUploaded).length,
    monthClose: allDone ? 'Ready' : blocked ? 'Blocked' : 'In Progress',
  };
}

/** Per-hotel rollup row for the all-hotels table. */
export function hotelReconRows(store: StoreLike) {
  return HOTEL_ENTITIES.map((h) => {
    const accts = reconAccounts(store, h.id);
    const statuses = accts.map((a) => statusForAccount(store, a));
    return {
      hotelId: h.id,
      banks: accts.filter((a) => a.kind === 'bank').length,
      cards: accts.filter((a) => a.kind === 'card').length,
      reconciled: statuses.filter((s) => s === 'reconciled').length,
      inProgress: statuses.filter((s) => s === 'in-progress' || s === 'ready-to-finish').length,
      difference: statuses.filter((s) => s === 'difference').length,
      missing: accts.filter((a) => !a.statementUploaded).length,
      closeImpact: statuses.every((s) => s === 'reconciled') ? 'Ready' : statuses.some((s) => s === 'blocked') ? 'Blocked' : 'Pending',
    };
  });
}

/* ── Differences list ─────────────────────────────────────────────────── */
export interface DifferenceRow { acct: ReconAccount; difference: number; reason: string }
export function differenceRows(store: StoreLike, hotelId?: string): DifferenceRow[] {
  return reconAccounts(store, hotelId)
    .map((a) => ({ acct: a, difference: differenceForAccount(store, a), status: statusForAccount(store, a) }))
    .filter((r) => r.status === 'difference' || (r.status !== 'reconciled' && Math.abs(r.difference) > 0.005))
    .map((r) => ({ acct: r.acct, difference: r.difference, reason: r.difference > 100 ? 'Missing transaction or duplicate' : 'Transaction not posted or wrong amount' }));
}

/* ── Blockers list (all accounts) ─────────────────────────────────────── */
export interface BlockerRow extends Blocker { acct: ReconAccount }
export function blockerRows(store: StoreLike, hotelId?: string): BlockerRow[] {
  return reconAccounts(store, hotelId).flatMap((a) => blockersForAccount(store, a).map((b) => ({ ...b, acct: a })));
}

/* ── History: finished + reopened recon records ───────────────────────── */
export function reconHistory(store: StoreLike, hotelId?: string) {
  return Object.values(store.reconRecords)
    .filter((r) => (r.status === 'reconciled' || r.status === 'reopened') && (!hotelId || r.hotelId === hotelId))
    .sort((a, b) => (b.finishedIso ?? '').localeCompare(a.finishedIso ?? ''));
}
