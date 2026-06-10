/**
 * StayOps Accounting OS (v2) — reconciliation engine.
 *
 * Combines the immutable seed (`_domain.ts`) with the interactive store
 * (`_store2.ts`) into the LIVE view the UI renders:
 *   - resolved status of every statement line (seed status, then store edits)
 *   - reconciliation math (cleared balance vs statement ending balance)
 *   - per-session rollups (needs coding / ready to post / posted / cleared / diff)
 *   - finish-reconciliation blockers, with exact messages
 *
 * One STATEMENT IMPORT == one WORKBENCH SESSION. Their ids are the same.
 */
import {
  STATEMENT_IMPORTS, seedLinesFor, getImport, type StatementImport, type StatementLineSeed,
  type LineStatus, type SessionStatus, RECON_MONTH,
} from './_domain';
import type { Store2, CodingDecision } from './_store2';

/* ── Live line: seed + store edits resolved into one object ───────────── */
export interface LiveLine extends StatementLineSeed {
  coding?: CodingDecision;
  posted: boolean;
  cleared: boolean;
  status: LineStatus;
  receipt: StatementLineSeed['receiptRequirement'];
}

function resolveLineStatus(seed: StatementLineSeed, coding: CodingDecision | undefined, posted: boolean, cleared: boolean, excluded: boolean): LineStatus {
  if (cleared && posted) return 'cleared';
  if (excluded) return 'excluded';
  if (coding) {
    if (coding.resolution === 'duplicate') return 'excluded';
    if (coding.resolution === 'timing-difference') return 'timing-difference';
    if (coding.resolution === 'needs-investigation') return 'needs-investigation';
    if (coding.resolution === 'match-existing' && cleared) return 'cleared';
    if (posted) return 'posted';
    if (coding.receipt === 'missing' || coding.receipt === 'required') {
      // coded but receipt outstanding blocks posting
      if (coding.ready) return 'needs-support';
    }
    if (coding.ready) return 'ready-to-post';
    return 'coded';
  }
  // no store coding yet → fall back to seed
  if (cleared) return 'cleared';
  if (posted) return 'posted';
  return seed.seedStatus;
}

/** All live lines for a session (statement import id). */
export function liveLines(store: Store2, sessionId: string): LiveLine[] {
  const imp = getImport2(store, sessionId);
  if (!imp) return [];
  const seeds = sessionId.startsWith('stmt-') && !store.addedImports.find((a) => a.id === sessionId)
    ? seedLinesFor(sessionId)
    : store.addedLines.filter((l) => l.importId === sessionId);
  const clearedSet = new Set(store.cleared[sessionId] ?? []);
  const finished = store.sessions[sessionId]?.finished;

  return seeds.map((seed) => {
    const coding = store.coding[seed.id];
    const posted = store.posted.includes(seed.id) || (!coding && (seed.seedStatus === 'posted' || seed.seedStatus === 'cleared' || seed.seedStatus === 'reconciled')) || seed.seedPosted && !coding;
    const cleared = clearedSet.has(seed.id) || (!coding && (seed.seedCleared || seed.seedStatus === 'cleared' || seed.seedStatus === 'reconciled'));
    const excluded = store.manuallyExcluded.includes(seed.id) || (!coding && seed.seedStatus === 'excluded') || (!coding && seed.seedStatus === 'duplicate');
    let status = resolveLineStatus(seed, coding, posted, cleared, excluded);
    if (finished && (status === 'cleared' || status === 'posted')) status = 'reconciled';
    const receipt = coding?.receipt ?? seed.receiptRequirement;
    return { ...seed, coding, posted, cleared, status, receipt };
  });
}

/** Resolve an import (session) whether it's seed or uploaded. */
export function getImport2(store: Store2, sessionId: string): StatementImport | undefined {
  return store.addedImports.find((a) => a.id === sessionId) ?? getImport(sessionId);
}

/** All imports (seed + uploaded), optionally scoped to a hotel. */
export function allImports(store: Store2, hotelId?: string): StatementImport[] {
  const all = [...store.addedImports, ...STATEMENT_IMPORTS.filter((s) => !store.addedImports.find((a) => a.id === s.id))];
  return hotelId ? all.filter((i) => i.hotelId === hotelId) : all;
}

/* ── Reconciliation math ──────────────────────────────────────────────── */
export interface ReconMath {
  beginningBalance: number;
  statementBalance: number;
  postedIn: number; postedOut: number;
  clearedIn: number; clearedOut: number;
  bookBalance: number;
  clearedBalance: number;
  difference: number;
  balanced: boolean;
}
const r2 = (n: number) => Math.round(n * 100) / 100;

export function computeMath(imp: StatementImport, lines: LiveLine[]): ReconMath {
  const isBank = imp.statementType === 'bank';
  const posted = lines.filter((l) => l.posted && l.status !== 'excluded');
  const cleared = lines.filter((l) => l.cleared && l.status !== 'excluded');

  const sumIn = (ls: LiveLine[]) => ls.filter((l) => l.amount > 0).reduce((s, l) => s + l.amount, 0);
  const sumOut = (ls: LiveLine[]) => ls.filter((l) => l.amount < 0).reduce((s, l) => s + Math.abs(l.amount), 0);

  const postedIn = r2(sumIn(posted)), postedOut = r2(sumOut(posted));
  const clearedIn = r2(sumIn(cleared)), clearedOut = r2(sumOut(cleared));

  if (isBank) {
    const bookBalance = r2(imp.beginningBalance + postedIn - postedOut);
    const clearedBalance = r2(imp.beginningBalance + clearedIn - clearedOut);
    const difference = r2(imp.endingBalance - clearedBalance);
    return { beginningBalance: imp.beginningBalance, statementBalance: imp.endingBalance, postedIn, postedOut, clearedIn, clearedOut, bookBalance, clearedBalance, difference, balanced: Math.abs(difference) < 0.005 };
  }
  // credit card: charges (out) increase owed; credits (in) reduce
  const bookBalance = r2(imp.beginningBalance + postedOut - postedIn);
  const clearedBalance = r2(imp.beginningBalance + clearedOut - clearedIn);
  const difference = r2(imp.endingBalance - clearedBalance);
  return { beginningBalance: imp.beginningBalance, statementBalance: imp.endingBalance, postedIn, postedOut, clearedIn, clearedOut, bookBalance, clearedBalance, difference, balanced: Math.abs(difference) < 0.005 };
}

/* ── Line counts for a session ────────────────────────────────────────── */
export interface SessionCounts {
  total: number;
  needsCoding: number;
  coded: number;
  readyToPost: number;
  posted: number;
  cleared: number;
  reconciled: number;
  missingReceipts: number;
  duplicates: number;
  timingDiffs: number;
  investigation: number;
  excluded: number;
}
export function sessionCounts(lines: LiveLine[]): SessionCounts {
  const is = (s: LineStatus) => lines.filter((l) => l.status === s).length;
  return {
    total: lines.length,
    needsCoding: is('needs-coding') + is('imported') + is('suggested'),
    coded: is('coded'),
    readyToPost: is('ready-to-post'),
    posted: lines.filter((l) => l.posted && !l.cleared && l.status !== 'excluded').length,
    cleared: lines.filter((l) => l.cleared && l.status !== 'excluded').length,
    reconciled: is('reconciled'),
    missingReceipts: lines.filter((l) => l.receipt === 'missing' || (l.receipt === 'required' && !l.posted)).length,
    duplicates: lines.filter((l) => l.status === 'excluded' && l.coding?.resolution !== 'duplicate' ? false : l.suggestedResolution === 'duplicate' && l.status !== 'cleared' && l.status !== 'reconciled' && l.status !== 'excluded').length,
    timingDiffs: is('timing-difference'),
    investigation: is('needs-investigation'),
    excluded: is('excluded'),
  };
}

/* ── Blockers (with exact finish messages) ────────────────────────────── */
export interface Blocker { message: string; severity: 'high' | 'warning'; lineId?: string }
export function sessionBlockers(store: Store2, sessionId: string): Blocker[] {
  const imp = getImport2(store, sessionId);
  if (!imp) return [];
  const lines = liveLines(store, sessionId);
  const m = computeMath(imp, lines);
  const c = sessionCounts(lines);
  const out: Blocker[] = [];

  const unresolved = lines.filter((l) => l.status === 'imported' || l.status === 'suggested' || l.status === 'needs-coding').length;
  if (unresolved > 0) out.push({ message: `Cannot finish because ${unresolved} line${unresolved === 1 ? '' : 's'} still need coding.`, severity: 'high' });
  if (!m.balanced) out.push({ message: `Cannot finish because the difference is ${fmtMoney(Math.abs(m.difference))}.`, severity: 'high' });
  const dupes = lines.filter((l) => l.suggestedResolution === 'duplicate' && !l.coding && l.status !== 'excluded' && l.status !== 'cleared' && l.status !== 'reconciled').length;
  if (dupes > 0) out.push({ message: `Cannot finish because ${dupes} possible duplicate${dupes === 1 ? ' is' : 's are'} unresolved.`, severity: 'high' });
  if (c.investigation > 0) out.push({ message: `Cannot finish because ${c.investigation} line${c.investigation === 1 ? ' is' : 's are'} marked Needs Investigation.`, severity: 'high' });
  if (c.missingReceipts > 0) out.push({ message: `Cannot finish because ${c.missingReceipts} required receipt${c.missingReceipts === 1 ? ' is' : 's are'} missing.`, severity: 'warning' });
  return out;
}
function fmtMoney(n: number) { return `$${Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`; }

/* ── Session status resolution ────────────────────────────────────────── */
export function sessionStatus(store: Store2, sessionId: string): SessionStatus {
  if (store.sessions[sessionId]?.finished) return 'reconciled';
  if (store.sessions[sessionId]?.reopenReason) return 'in-review';
  const lines = liveLines(store, sessionId);
  if (lines.length === 0) return 'not-started';
  const imp = getImport2(store, sessionId)!;
  const c = sessionCounts(lines);
  const allReconciled = lines.every((l) => l.status === 'reconciled');
  if (allReconciled) return 'reconciled';

  // Classic / manual: status driven by selection (cleared) + manual blockers.
  if (imp.mode === 'classic') {
    const m = manualMetrics(imp, lines);
    const mb = manualBlockers(imp, lines);
    if (m.selectedCount === 0) return 'not-started';
    if (m.uncategorizedSelected > 0) return 'needs-coding';
    if (m.balanced && mb.filter((b) => b.severity === 'high').length === 0) return 'ready-to-reconcile';
    if (!m.balanced) return 'difference-found';
    if (m.unpostedSelected > 0) return 'ready-to-post';
    return 'in-review';
  }

  const m = computeMath(imp, lines);
  const blockers = sessionBlockers(store, sessionId);
  if (c.needsCoding === lines.length) return 'not-started';
  if (blockers.some((b) => b.severity === 'high' && b.message.includes('still need coding'))) return 'needs-coding';
  if (blockers.length === 0 && m.balanced) return 'ready-to-reconcile';
  if (!m.balanced && c.needsCoding === 0) return 'difference-found';
  if (c.readyToPost > 0 && c.needsCoding === 0) return 'ready-to-post';
  if (c.needsCoding > 0) return 'needs-coding';
  return 'in-review';
}

/* ── Session summary row (used by workbench list + statement inbox) ───── */
export interface SessionRow {
  id: string;
  imp: StatementImport;
  counts: SessionCounts;
  math: ReconMath;
  status: SessionStatus;
  blockerCount: number;
}
export function sessionRow(store: Store2, sessionId: string): SessionRow | undefined {
  const imp = getImport2(store, sessionId);
  if (!imp) return undefined;
  const lines = liveLines(store, sessionId);
  // Classic / manual sessions are reconciled by SELECTION — surface the
  // selection-based difference and blockers so list & inbox rows match the
  // workbench session itself.
  const classic = imp.mode === 'classic';
  const math = classic ? toReconMath(manualMetrics(imp, lines)) : computeMath(imp, lines);
  const blockerCount = classic ? manualBlockers(imp, lines).length : sessionBlockers(store, sessionId).length;
  return { id: sessionId, imp, counts: sessionCounts(lines), math, status: sessionStatus(store, sessionId), blockerCount };
}
/** Adapt manual selection metrics to the ReconMath shape used by list rows. */
function toReconMath(m: ManualMetrics): ReconMath {
  return {
    beginningBalance: m.beginningBalance, statementBalance: m.statementBalance,
    postedIn: m.selectedIn, postedOut: m.selectedOut, clearedIn: m.selectedIn, clearedOut: m.selectedOut,
    bookBalance: m.clearedBalance, clearedBalance: m.clearedBalance, difference: m.difference, balanced: m.balanced,
  };
}
export function allSessionRows(store: Store2, hotelId?: string): SessionRow[] {
  return allImports(store, hotelId).map((i) => sessionRow(store, i.id)!).filter(Boolean);
}

/* ── Portfolio / dashboard rollups ────────────────────────────────────── */
export function portfolioSummary(store: Store2, hotelId?: string) {
  const rows = allSessionRows(store, hotelId);
  const sum = (sel: (r: SessionRow) => number) => rows.reduce((s, r) => s + sel(r), 0);
  return {
    statements: rows.length,
    linesToCode: sum((r) => r.counts.needsCoding),
    readyToPost: sum((r) => r.counts.readyToPost),
    posted: sum((r) => r.counts.posted + r.counts.cleared + r.counts.reconciled),
    cleared: sum((r) => r.counts.cleared + r.counts.reconciled),
    differences: rows.filter((r) => r.status === 'difference-found').length,
    missingReceipts: sum((r) => r.counts.missingReceipts),
    readyToReconcile: rows.filter((r) => r.status === 'ready-to-reconcile').length,
    reconciled: rows.filter((r) => r.status === 'reconciled').length,
    investigation: sum((r) => r.counts.investigation),
    timingDiffs: sum((r) => r.counts.timingDiffs),
    activeSessions: rows.filter((r) => r.status !== 'reconciled' && r.status !== 'not-started').length,
    blockers: rows.filter((r) => r.blockerCount > 0 && r.status !== 'reconciled').length,
  };
}

/* ── Manual / classic reconciliation ──────────────────────────────────────
 * In classic mode the accountant SELECTS the book transactions that appear on
 * the paper/PDF statement. "Selected" == cleared for this session. Live metrics
 * and finish-blockers reflect that selection. */
export interface ManualMetrics {
  isCard: boolean;
  beginningBalance: number;
  statementBalance: number;
  selectedIn: number;        // money in / credits
  selectedOut: number;       // money out / charges
  clearedBalance: number;
  difference: number;
  balanced: boolean;
  selectedCount: number;
  uncategorizedSelected: number;
  unpostedSelected: number;
  missingReceiptSelected: number;
  duplicates: number;
  outstanding: number;       // not selected, in/near period
  timingItems: number;
}
const round2 = (n: number) => Math.round(n * 100) / 100;
const isUncategorized = (l: LiveLine) => !(l.coding?.categoryCode ?? l.suggestedCategoryCode) && l.coding?.resolution !== 'transfer' && l.coding?.resolution !== 'cc-payment';

export function manualMetrics(imp: StatementImport, lines: LiveLine[]): ManualMetrics {
  const isCard = imp.statementType === 'credit-card';
  const selected = lines.filter((l) => l.cleared && l.status !== 'excluded');
  const selIn = round2(selected.filter((l) => l.amount > 0).reduce((s, l) => s + l.amount, 0));
  const selOut = round2(selected.filter((l) => l.amount < 0).reduce((s, l) => s + Math.abs(l.amount), 0));
  const clearedBalance = isCard ? round2(imp.beginningBalance + selOut - selIn) : round2(imp.beginningBalance + selIn - selOut);
  const difference = round2(imp.endingBalance - clearedBalance);
  return {
    isCard, beginningBalance: imp.beginningBalance, statementBalance: imp.endingBalance,
    selectedIn: selIn, selectedOut: selOut, clearedBalance, difference, balanced: Math.abs(difference) < 0.005,
    selectedCount: selected.length,
    uncategorizedSelected: selected.filter(isUncategorized).length,
    unpostedSelected: selected.filter((l) => !l.posted).length,
    missingReceiptSelected: selected.filter((l) => l.receipt === 'missing' || (l.receipt === 'required' && !l.posted)).length,
    duplicates: lines.filter((l) => l.suggestedResolution === 'duplicate' && !l.coding && l.status !== 'excluded').length,
    outstanding: lines.filter((l) => !l.cleared && l.status !== 'excluded' && l.status !== 'timing-difference').length,
    timingItems: lines.filter((l) => l.status === 'timing-difference').length,
  };
}

export function manualBlockers(imp: StatementImport, lines: LiveLine[]): Blocker[] {
  const m = manualMetrics(imp, lines);
  const out: Blocker[] = [];
  if (m.uncategorizedSelected > 0) out.push({ message: `${m.uncategorizedSelected} selected transaction${m.uncategorizedSelected === 1 ? '' : 's'} need categories before reconciliation can be finished.`, severity: 'high' });
  if (m.unpostedSelected > 0) out.push({ message: `${m.unpostedSelected} selected transaction${m.unpostedSelected === 1 ? '' : 's'} must be posted before finishing.`, severity: 'high' });
  if (!m.balanced) out.push({ message: `Difference must be $0.00 before finishing — currently ${fmtMoney(Math.abs(m.difference))}.`, severity: 'high' });
  if (m.duplicates > 0) out.push({ message: `${m.duplicates} possible duplicate${m.duplicates === 1 ? ' is' : 's are'} unresolved.`, severity: 'high' });
  if (m.missingReceiptSelected > 0) out.push({ message: `${m.missingReceiptSelected} selected transaction${m.missingReceiptSelected === 1 ? '' : 's'} need a receipt.`, severity: 'warning' });
  return out;
}

/* ── Find Difference suggestions ──────────────────────────────────────── */
export interface DiffSuggestion { issue: string; amount?: number; lineId?: string; description?: string; action: string; kind: 'select' | 'post' | 'categorize' | 'duplicate' | 'add-missing' | 'beginning' | 'timing' }
export function findDifference(imp: StatementImport, lines: LiveLine[]): DiffSuggestion[] {
  const m = manualMetrics(imp, lines);
  const diff = round2(m.difference);
  const out: DiffSuggestion[] = [];
  if (Math.abs(diff) < 0.005) return out;

  // 1. Exact-amount match among unselected lines.
  const target = Math.abs(diff);
  const exact = lines.find((l) => !l.cleared && l.status !== 'excluded' && Math.abs(Math.abs(l.amount) - target) < 0.005);
  if (exact) out.push({ issue: 'Unselected transaction matches the difference', amount: Math.abs(exact.amount), lineId: exact.id, description: exact.rawDescription, action: 'Select and clear this transaction', kind: 'select' });

  // 2. Selected but not posted.
  lines.filter((l) => l.cleared && !l.posted && l.status !== 'excluded').slice(0, 3).forEach((l) => out.push({ issue: 'Selected transaction is not posted', amount: Math.abs(l.amount), lineId: l.id, description: l.rawDescription, action: 'Post this transaction', kind: 'post' }));

  // 3. Selected but uncategorized.
  lines.filter((l) => l.cleared && isUncategorized(l) && l.status !== 'excluded').slice(0, 3).forEach((l) => out.push({ issue: 'Selected transaction has no category', amount: Math.abs(l.amount), lineId: l.id, description: l.rawDescription, action: 'Categorize this transaction', kind: 'categorize' }));

  // 4. Possible duplicate.
  const dup = lines.find((l) => l.suggestedResolution === 'duplicate' && !l.coding && l.status !== 'excluded');
  if (dup) out.push({ issue: 'Possible duplicate included', amount: Math.abs(dup.amount), lineId: dup.id, description: dup.rawDescription, action: 'Resolve this duplicate', kind: 'duplicate' });

  // 5. Beginning balance mismatch.
  if (imp.lastReconciledBalance != null && Math.abs(imp.beginningBalance - imp.lastReconciledBalance) > 0.005) {
    out.push({ issue: 'Beginning balance differs from the prior reconciliation', amount: round2(imp.beginningBalance - imp.lastReconciledBalance), action: 'Review the prior reconciliation', kind: 'beginning' });
  }

  // 6. Timing difference near statement end.
  const timing = lines.find((l) => l.status === 'timing-difference' || (l.dateIso > imp.endDate && !l.cleared));
  if (timing) out.push({ issue: 'Transaction dated near/after statement end (possible timing difference)', amount: Math.abs(timing.amount), lineId: timing.id, description: timing.rawDescription, action: 'Leave outstanding or mark timing difference', kind: 'timing' });

  // 7. No match found → suggest add missing.
  if (out.length === 0) out.push({ issue: 'No matching transaction found for the difference', amount: target, action: 'Add the missing transaction from the statement', kind: 'add-missing' });
  return out;
}

export { RECON_MONTH };
