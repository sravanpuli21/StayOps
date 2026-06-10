'use client';

/**
 * StayOps Accounting OS (v2) — interactive engine (localStorage-backed).
 *
 * The seed (`_domain.ts`) is immutable. This store holds everything the
 * accountant DOES during the session so every click is real and persists across
 * refresh:
 *   - statements uploaded (new imports + their lines)
 *   - coding decisions per statement line (resolution type + fields)
 *   - posted journal entries
 *   - cleared statement lines + finished reconciliations
 *   - receipts attached / requested, investigation assignments
 *   - month-close completion
 *   - an activity / audit log
 *
 * resetAccounting2() clears it back to seed.
 */
import { useSyncExternalStore } from 'react';
import type { JLine } from './_journal';
import type {
  ResolutionType, TxnType, Dept, ReceiptStatus2, StatementType, StatementLineSeed, StatementImport,
} from './_domain';
import { ACCOUNTANT } from './_domain';

/* ── Records ──────────────────────────────────────────────────────────── */
export interface CodingDecision {
  lineId: string;
  resolution: ResolutionType;
  txnType?: TxnType;
  vendor?: string;
  categoryCode?: string;
  categoryName?: string;
  department?: Dept;
  memo?: string;
  receipt?: ReceiptStatus2;
  receiptName?: string;
  // resolution-specific extras (free-form, validated at build time)
  extra?: Record<string, string | number>;
  splits?: { id: string; categoryName: string; categoryCode?: string; department?: Dept; amount: number; memo?: string }[];
  ready?: boolean;            // "Save and Mark Ready"
  investigationAssignee?: string;
  investigationReason?: string;
  excludeReason?: string;
  codedBy: string;
  codedAt: string;
}

export interface JournalEntry2 {
  id: string;
  lineId: string;
  hotelId: string;
  number: string;
  dateIso: string;
  sourceType: StatementType;
  memo?: string;
  lines: JLine[];
  createdBy: string;
  postedIso: string;
}

export interface AddedLine extends StatementLineSeed {}

export interface ActivityEntry2 { id: string; ts: string; actor: string; action: string; hotelId?: string; sessionId?: string; lineId?: string; detail?: string }

interface SessionState { finished: boolean; finishedIso?: string; finishedBy?: string; reopenReason?: string }

interface Store2 {
  addedImports: StatementImport[];
  addedLines: AddedLine[];
  coding: Record<string, CodingDecision>;     // lineId → decision
  journals: JournalEntry2[];
  posted: string[];                            // lineIds posted (in addition to coding)
  cleared: Record<string, string[]>;           // sessionId → cleared lineIds
  sessions: Record<string, SessionState>;      // sessionId → finish state
  closed: string[];                            // `${hotelId}:${month}`
  docs: Array<{ id: string; name: string; hotelId: string; lineId?: string; uploadedBy: string; ts: string }>;
  activity: ActivityEntry2[];
  jeCounter: number;
  manuallyExcluded: string[];                  // lineIds explicitly excluded
}

const KEY = 'stayops.acctos2.state';
const listeners = new Set<() => void>();
let cache: Store2 | null = null;

const empty: Store2 = {
  addedImports: [], addedLines: [], coding: {}, journals: [], posted: [],
  cleared: {}, sessions: {}, closed: [], docs: [], activity: [], jeCounter: 4200, manuallyExcluded: [],
};

function read(): Store2 {
  if (cache) return cache;
  if (typeof window === 'undefined') return empty;
  try {
    const raw = localStorage.getItem(KEY);
    cache = raw ? { ...empty, ...(JSON.parse(raw) as Store2) } : { ...empty };
  } catch { cache = { ...empty }; }
  return cache!;
}
function write(next: Store2) {
  cache = next;
  try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* ignore */ }
  listeners.forEach((l) => l());
}
function nowIso() { try { return new Date().toISOString(); } catch { return '2026-06-09T12:00:00Z'; } }
function uid(p: string) { return `${p}-${Math.random().toString(36).slice(2, 9)}`; }
function log(s: Store2, action: string, opts: { hotelId?: string; sessionId?: string; lineId?: string; detail?: string } = {}): ActivityEntry2[] {
  return [{ id: uid('act'), ts: nowIso(), actor: ACCOUNTANT, action, ...opts }, ...s.activity].slice(0, 300);
}

/* ── Mutations: upload ────────────────────────────────────────────────── */
export function importStatement(imp: StatementImport, lines: AddedLine[]) {
  const s = read();
  write({
    ...s,
    addedImports: [imp, ...s.addedImports],
    addedLines: [...lines, ...s.addedLines],
    activity: log(s, 'Uploaded statement', { hotelId: imp.hotelId, sessionId: imp.id, detail: `${lines.length} lines · ${imp.accountName}` }),
  });
}

/* ── Mutations: manual reconciliation ─────────────────────────────────────
 * Start a reconciliation against existing book transactions (no CSV). The
 * session is a StatementImport with mode 'classic'; its "lines" are book
 * transactions for the account. */
export function startManualReconciliation(imp: StatementImport, lines: AddedLine[]) {
  const s = read();
  write({
    ...s,
    addedImports: [imp, ...s.addedImports.filter((i) => i.id !== imp.id)],
    addedLines: [...lines, ...s.addedLines.filter((l) => l.importId !== imp.id)],
    activity: log(s, 'Started reconciliation', { hotelId: imp.hotelId, sessionId: imp.id, detail: `${imp.accountName} · ${imp.source ?? 'manual'} · through ${imp.endDate}` }),
  });
}

/** Add a transaction that's on the statement but missing in StayOps. Optionally post + clear it. */
export function addMissingTransaction(line: AddedLine, opts: { post?: boolean; clear?: boolean; je?: { lines: JLine[]; memo?: string } }) {
  const s = read();
  const sessionId = line.importId;
  let journals = s.journals;
  let jeCounter = s.jeCounter;
  let coding = s.coding;
  let posted = s.posted;
  if (opts.post && opts.je) {
    const number = `JE-${jeCounter + 1}`;
    journals = [{ id: uid('je'), lineId: line.id, hotelId: line.hotelId, number, dateIso: line.dateIso, sourceType: line.statementType, memo: opts.je.memo, lines: opts.je.lines, createdBy: ACCOUNTANT, postedIso: nowIso() }, ...journals];
    jeCounter += 1;
    posted = [...new Set([...posted, line.id])];
    coding = { ...coding, [line.id]: { lineId: line.id, resolution: 'create-transaction', categoryName: line.suggestedCategoryName, categoryCode: line.suggestedCategoryCode, department: line.suggestedDepartment, vendor: line.suggestedVendor, ready: true, codedBy: ACCOUNTANT, codedAt: nowIso() } };
  }
  const cleared = opts.clear ? { ...s.cleared, [sessionId]: [...new Set([...(s.cleared[sessionId] ?? []), line.id])] } : s.cleared;
  write({
    ...s,
    addedLines: [line, ...s.addedLines],
    journals, jeCounter, coding, posted, cleared,
    activity: log(s, 'Added missing transaction', { hotelId: line.hotelId, sessionId, lineId: line.id, detail: line.rawDescription }),
  });
}

/* ── Mutations: coding ────────────────────────────────────────────────── */
export function saveCoding(d: Omit<CodingDecision, 'codedBy' | 'codedAt'>, note?: string) {
  const s = read();
  const full: CodingDecision = { ...d, codedBy: ACCOUNTANT, codedAt: nowIso() };
  write({ ...s, coding: { ...s.coding, [d.lineId]: full }, activity: log(s, note ?? 'Saved coding', { lineId: d.lineId }) });
}

export function postLine(d: Omit<CodingDecision, 'codedBy' | 'codedAt'>, je: { hotelId: string; dateIso: string; sourceType: StatementType; lines: JLine[]; memo?: string }, clear: boolean, sessionId: string) {
  const s = read();
  const full: CodingDecision = { ...d, codedBy: ACCOUNTANT, codedAt: nowIso() };
  const number = `JE-${s.jeCounter + 1}`;
  const entry: JournalEntry2 = { id: uid('je'), lineId: d.lineId, hotelId: je.hotelId, number, dateIso: je.dateIso, sourceType: je.sourceType, memo: je.memo, lines: je.lines, createdBy: ACCOUNTANT, postedIso: nowIso() };
  const clearedForSession = clear ? [...new Set([...(s.cleared[sessionId] ?? []), d.lineId])] : (s.cleared[sessionId] ?? []);
  write({
    ...s,
    coding: { ...s.coding, [d.lineId]: full },
    journals: [entry, ...s.journals.filter((j) => j.lineId !== d.lineId)],
    posted: [...new Set([...s.posted, d.lineId])],
    cleared: { ...s.cleared, [sessionId]: clearedForSession },
    jeCounter: s.jeCounter + 1,
    activity: log(s, clear ? 'Posted and cleared line' : 'Posted line to books', { hotelId: je.hotelId, sessionId, lineId: d.lineId, detail: `${number} · ${je.lines.length} journal lines` }),
  });
  return entry;
}

export function matchExisting(d: Omit<CodingDecision, 'codedBy' | 'codedAt'>, sessionId: string, hotelId: string) {
  // Matched lines clear without a new journal entry.
  const s = read();
  const full: CodingDecision = { ...d, codedBy: ACCOUNTANT, codedAt: nowIso() };
  write({
    ...s,
    coding: { ...s.coding, [d.lineId]: full },
    cleared: { ...s.cleared, [sessionId]: [...new Set([...(s.cleared[sessionId] ?? []), d.lineId])] },
    activity: log(s, 'Matched existing transaction', { hotelId, sessionId, lineId: d.lineId }),
  });
}

export function excludeLine(d: Omit<CodingDecision, 'codedBy' | 'codedAt'>, sessionId: string, hotelId: string) {
  const s = read();
  const full: CodingDecision = { ...d, codedBy: ACCOUNTANT, codedAt: nowIso() };
  write({
    ...s,
    coding: { ...s.coding, [d.lineId]: full },
    manuallyExcluded: [...new Set([...s.manuallyExcluded, d.lineId])],
    cleared: { ...s.cleared, [sessionId]: [...new Set([...(s.cleared[sessionId] ?? []), d.lineId])] },
    activity: log(s, 'Excluded line', { hotelId, sessionId, lineId: d.lineId, detail: d.excludeReason }),
  });
}

/* ── Mutations: clearing ──────────────────────────────────────────────── */
export function toggleCleared(sessionId: string, lineId: string) {
  const s = read();
  const cur = new Set(s.cleared[sessionId] ?? []);
  cur.has(lineId) ? cur.delete(lineId) : cur.add(lineId);
  write({ ...s, cleared: { ...s.cleared, [sessionId]: [...cur] } });
}
export function setCleared(sessionId: string, lineIds: string[]) {
  const s = read();
  write({ ...s, cleared: { ...s.cleared, [sessionId]: lineIds } });
}

/* ── Mutations: receipts + investigation ──────────────────────────────── */
export function attachReceipt(lineId: string, name: string, hotelId: string) {
  const s = read();
  const existing = s.coding[lineId];
  const next: CodingDecision = existing
    ? { ...existing, receipt: 'attached', receiptName: name }
    : { lineId, resolution: 'create-transaction', receipt: 'attached', receiptName: name, codedBy: ACCOUNTANT, codedAt: nowIso() };
  write({ ...s, coding: { ...s.coding, [lineId]: next }, docs: [{ id: uid('doc'), name, hotelId, lineId, uploadedBy: ACCOUNTANT, ts: nowIso() }, ...s.docs], activity: log(s, 'Receipt attached', { hotelId, lineId, detail: name }) });
}
export function requestReceipt(lineId: string, assignee: string, hotelId: string) {
  const s = read();
  const existing = s.coding[lineId];
  const next: CodingDecision = existing ? { ...existing, receipt: 'requested' } : { lineId, resolution: 'create-transaction', receipt: 'requested', codedBy: ACCOUNTANT, codedAt: nowIso() };
  write({ ...s, coding: { ...s.coding, [lineId]: next }, activity: log(s, 'Receipt requested', { hotelId, lineId, detail: `Assigned to ${assignee}` }) });
}

/* ── Mutations: reconciliation finish / reopen ────────────────────────── */
export function finishReconciliation(sessionId: string, hotelId: string, detail: string) {
  const s = read();
  write({ ...s, sessions: { ...s.sessions, [sessionId]: { finished: true, finishedIso: nowIso(), finishedBy: ACCOUNTANT } }, activity: log(s, 'Reconciliation completed', { hotelId, sessionId, detail }) });
}
export function reopenReconciliation(sessionId: string, hotelId: string, reason: string) {
  const s = read();
  write({ ...s, sessions: { ...s.sessions, [sessionId]: { finished: false, reopenReason: reason } }, activity: log(s, 'Reconciliation reopened', { hotelId, sessionId, detail: reason }) });
}

/* ── Mutations: month close ───────────────────────────────────────────── */
export function closeMonth(hotelId: string, month: string, detail: string) {
  const s = read();
  write({ ...s, closed: [...new Set([...s.closed, `${hotelId}:${month}`])], activity: log(s, 'Closed month', { hotelId, detail }) });
}
export function reopenMonth(hotelId: string, month: string) {
  const s = read();
  write({ ...s, closed: s.closed.filter((k) => k !== `${hotelId}:${month}`), activity: log(s, 'Reopened month', { hotelId, detail: month }) });
}

export function resetAccounting2() { write({ ...empty }); }

/* ── Reads ────────────────────────────────────────────────────────────── */
export function useStore2(): Store2 {
  return useSyncExternalStore((cb) => { listeners.add(cb); return () => listeners.delete(cb); }, read, () => empty);
}
export const isClosed = (s: Store2, hotelId: string, month: string) => s.closed.includes(`${hotelId}:${month}`);
export type { Store2 };
