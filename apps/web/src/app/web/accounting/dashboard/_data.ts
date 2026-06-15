/**
 * StayOps Accounting OS (v2) — Dashboard data layer.
 *
 * Pure derivations over the store that the command-center dashboard consumes:
 *   - per-hotel close status + checklist (shared with Month Close)
 *   - statement-to-books pipeline counts (uploaded → reconciled)
 *   - priority task list ("Today's Accounting Work")
 *   - exceptions / red flags (payroll fee, cc-payment, tax, loan, dup, timing…)
 *   - account-wise reconciliation rows with per-account cycle dates
 *   - cash & card position from POSTED journal lines only
 *   - recent activity (from the store audit log)
 *
 * Accounting rules honored here:
 *   - financial/cash numbers use POSTED data only; unposted lines are "work left"
 *   - reconciliation difference uses cleared/selected transactions
 *   - month-close status depends on real blockers
 */
import {
  HOTEL_ENTITIES, getEntity, bankAccountsForHotel, creditCardsForHotel,
} from '@hos/shared/accounting-os';
import type { Store2 } from '../_store2';
import {
  allSessionRows, allImports, liveLines, manualMetrics, type SessionRow, type LiveLine,
} from '../_recon2';
import { postedJournalLines } from '../reports/_reports';
import { accountCycle } from '../_cycle';
import { payrollGuidance, resolutionLabel, RECON_MONTH, hotelLabel, ACCOUNTANT, type StatementType } from '../_domain';
import type { CloseStatus } from '../_ui';
import { isClosed } from '../_store2';

/* ── Per-hotel close status + checklist ───────────────────────────────── */
export interface ChecklistItem { label: string; done: boolean; remaining?: number; action?: string }
export interface HotelClose {
  hotelId: string;
  rows: SessionRow[];
  checklist: ChecklistItem[];
  status: CloseStatus;
  closed: boolean;
  canClose: boolean;
  needsCoding: number;
  readyToPost: number;
  missingReceipts: number;
  difference: number;
  reconciledCount: number;
  totalAccounts: number;
}

export function closeForHotel(store: Store2, hotelId: string): HotelClose {
  const rows = allSessionRows(store, hotelId);
  const bankUploaded = rows.some((r) => r.imp.statementType === 'bank');
  const cardUploaded = rows.some((r) => r.imp.statementType === 'credit-card');
  const needsCoding = rows.reduce((s, r) => s + r.counts.needsCoding, 0);
  const readyToPost = rows.reduce((s, r) => s + r.counts.readyToPost, 0);
  const missingReceipts = rows.reduce((s, r) => s + r.counts.missingReceipts, 0);
  const allResolved = rows.every((r) => r.counts.needsCoding === 0);
  const allPosted = rows.every((r) => r.counts.needsCoding === 0 && r.counts.readyToPost === 0);
  const receiptsOk = missingReceipts === 0;
  const noDupes = rows.every((r) => r.blockerCount === 0 || r.status === 'reconciled');
  const reconciled = rows.length > 0 && rows.every((r) => r.status === 'reconciled');
  const diffZero = rows.every((r) => Math.abs(r.math.difference) < 0.005);
  const difference = rows.reduce((s, r) => s + (r.status === 'difference-found' ? Math.abs(r.math.difference) : 0), 0);
  const closed = isClosed(store, hotelId, RECON_MONTH);

  const checklist: ChecklistItem[] = [
    { label: 'Bank statements uploaded', done: bankUploaded },
    { label: 'Credit card statements uploaded', done: cardUploaded },
    { label: 'All statement lines resolved', done: allResolved, remaining: needsCoding, action: 'Code Lines' },
    { label: 'All transactions posted', done: allPosted, remaining: readyToPost, action: 'Post' },
    { label: 'Required receipts attached', done: receiptsOk, remaining: missingReceipts, action: 'Review Receipts' },
    { label: 'Duplicates resolved', done: noDupes },
    { label: 'Bank reconciliations complete', done: rows.filter((r) => r.imp.statementType === 'bank').every((r) => r.status === 'reconciled') && bankUploaded },
    { label: 'Credit card reconciliations complete', done: rows.filter((r) => r.imp.statementType === 'credit-card').every((r) => r.status === 'reconciled') && cardUploaded },
    { label: 'Reports reviewed', done: reconciled },
    { label: 'Ready to close', done: reconciled && receiptsOk && diffZero && allPosted },
  ];

  let status: CloseStatus;
  if (closed) status = 'closed';
  else if (!bankUploaded || rows.length === 0) status = 'not-started';
  else if (reconciled && receiptsOk && diffZero && allPosted) status = 'ready-to-close';
  else if (difference > 0 || needsCoding > 0 || missingReceipts > 0) status = 'blocked';
  else status = 'in-progress';

  return {
    hotelId, rows, checklist, status, closed, canClose: checklist.every((c) => c.done),
    needsCoding, readyToPost, missingReceipts, difference,
    reconciledCount: rows.filter((r) => r.status === 'reconciled').length, totalAccounts: rows.length,
  };
}

export function portfolioClose(store: Store2) {
  return HOTEL_ENTITIES.map((h) => closeForHotel(store, h.id));
}

/* ── Statement-to-books pipeline ──────────────────────────────────────── */
export interface PipelineStage { key: string; label: string; count: number; href: string }
export function pipelineCounts(store: Store2, hotelId?: string): PipelineStage[] {
  const imps = allImports(store, hotelId);
  let uploaded = 0, needsCoding = 0, readyToPost = 0, posted = 0, cleared = 0, reconciled = 0;
  imps.forEach((imp) => {
    liveLines(store, imp.id).forEach((l) => {
      if (l.status === 'excluded') return;
      uploaded++;
      if (l.status === 'imported' || l.status === 'suggested' || l.status === 'needs-coding') needsCoding++;
      if (l.status === 'ready-to-post' || l.status === 'coded') readyToPost++;
      if (l.posted) posted++;
      if (l.cleared) cleared++;
      if (l.status === 'reconciled') reconciled++;
    });
  });
  const wb = '/web/accounting/reconciliation-workbench';
  return [
    { key: 'uploaded', label: 'Uploaded', count: uploaded, href: '/web/accounting/statements' },
    { key: 'needs-coding', label: 'Needs Coding', count: needsCoding, href: `${wb}?tab=active` },
    { key: 'ready-to-post', label: 'Ready to Post', count: readyToPost, href: `${wb}?tab=active` },
    { key: 'posted', label: 'Posted', count: posted, href: '/web/accounting/transactions' },
    { key: 'cleared', label: 'Cleared', count: cleared, href: `${wb}?tab=active` },
    { key: 'reconciled', label: 'Reconciled', count: reconciled, href: `${wb}?tab=completed` },
  ];
}

/* ── Priority tasks: "Today's Accounting Work" ────────────────────────── */
export type Priority = 'critical' | 'high' | 'medium' | 'low';
export interface DashTask {
  priority: Priority;
  title: string;
  hotelId: string;
  account: string;
  issue: string;
  why: string;
  actionLabel: string;
  href: string;
}
const PRIORITY_RANK: Record<Priority, number> = { critical: 0, high: 1, medium: 2, low: 3 };

export function dashboardTasks(store: Store2, hotelId?: string, limit = 8): DashTask[] {
  const rows = allSessionRows(store, hotelId);
  const wb = '/web/accounting/reconciliation-workbench';
  const tasks: DashTask[] = [];
  rows.forEach((r) => {
    const acct = `${r.imp.accountName} ••${r.imp.accountLast4}`;
    const open = `${wb}/${r.id}${r.imp.mode === 'classic' ? '?mode=classic' : ''}`;
    if (r.status === 'difference-found') tasks.push({ priority: 'critical', title: 'Resolve reconciliation difference', hotelId: r.imp.hotelId, account: acct, issue: `Difference: $${Math.abs(r.math.difference).toFixed(2)}`, why: 'Reconciliation cannot be finished until the difference is zero.', actionLabel: 'Open Difference', href: open });
    if (r.counts.needsCoding > 0) tasks.push({ priority: 'high', title: 'Code statement lines', hotelId: r.imp.hotelId, account: acct, issue: `${r.counts.needsCoding} lines need coding`, why: 'Uncoded lines cannot be posted or cleared.', actionLabel: 'Code Lines', href: open });
    if (r.counts.missingReceipts > 0) tasks.push({ priority: 'high', title: 'Attach missing receipts', hotelId: r.imp.hotelId, account: acct, issue: `${r.counts.missingReceipts} missing receipts`, why: 'Required receipts are blocking charges from posting.', actionLabel: 'Review Receipts', href: open });
    const dupes = liveLines(store, r.id).filter((l) => l.suggestedResolution === 'duplicate' && !l.coding && l.status !== 'excluded').length;
    if (dupes > 0) tasks.push({ priority: 'medium', title: 'Review possible duplicates', hotelId: r.imp.hotelId, account: acct, issue: `${dupes} possible duplicate${dupes === 1 ? '' : 's'}`, why: 'Duplicates can overstate expenses and break reconciliation.', actionLabel: 'Review Duplicates', href: open });
    if (r.status === 'ready-to-reconcile') tasks.push({ priority: 'low', title: 'Finish reconciliation', hotelId: r.imp.hotelId, account: acct, issue: 'Difference is $0.00', why: 'This account is ready — finishing it unblocks month close.', actionLabel: 'Finish', href: open });
  });
  return tasks.sort((a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]).slice(0, limit);
}

/* ── Exceptions / red flags ───────────────────────────────────────────── */
export type ExceptionSeverity = 'critical' | 'warning';
export interface DashException {
  severity: ExceptionSeverity;
  kind: string;
  title: string;
  transaction: string;
  amount: number;
  hotelId: string;
  why: string;
  actionLabel: string;
  href: string;
}
export function dashboardExceptions(store: Store2, hotelId?: string, limit = 8): DashException[] {
  const out: DashException[] = [];
  const wb = '/web/accounting/reconciliation-workbench';
  allImports(store, hotelId).forEach((imp) => {
    const open = `${wb}/${imp.id}${imp.mode === 'classic' ? '?mode=classic' : ''}`;
    liveLines(store, imp.id).forEach((l) => {
      if (l.coding || l.posted || l.status === 'excluded' || l.status === 'reconciled') return;
      const pg = payrollGuidance(l.rawDescription, l.amount);
      if (pg.isPayrollRelated && pg.kind === 'fee') {
        out.push({ severity: 'warning', kind: 'payroll', title: 'Small payroll-provider charge', transaction: `${l.rawDescription} $${Math.abs(l.amount).toFixed(2)}`, amount: l.amount, hotelId: imp.hotelId, why: 'This may be a payroll subscription/fee, not payroll wages.', actionLabel: 'Review Coding', href: open });
      } else if (l.suggestedResolution === 'cc-payment') {
        out.push({ severity: 'critical', kind: 'cc-payment', title: 'Credit card payment may be miscategorized', transaction: `${l.rawDescription} $${Math.abs(l.amount).toFixed(2)}`, amount: l.amount, hotelId: imp.hotelId, why: 'Credit card payments should reduce Credit Cards Payable, not become an expense.', actionLabel: 'Fix Coding', href: open });
      } else if (l.suggestedResolution === 'tax-payment') {
        out.push({ severity: 'warning', kind: 'tax', title: 'Tax payment needs review', transaction: `${l.rawDescription} $${Math.abs(l.amount).toFixed(2)}`, amount: l.amount, hotelId: imp.hotelId, why: 'Tax payments should reduce a tax payable liability, not be an expense.', actionLabel: 'Review Coding', href: open });
      } else if (l.suggestedResolution === 'loan-payment') {
        out.push({ severity: 'warning', kind: 'loan', title: 'Loan payment must be split', transaction: `${l.rawDescription} $${Math.abs(l.amount).toFixed(2)}`, amount: l.amount, hotelId: imp.hotelId, why: 'Split principal and interest before posting.', actionLabel: 'Review Coding', href: open });
      } else if (l.status === 'timing-difference' || (l.dateIso > imp.endDate)) {
        out.push({ severity: 'warning', kind: 'timing', title: 'Possible T+2 timing difference', transaction: `${l.rawDescription} $${Math.abs(l.amount).toFixed(2)}`, amount: l.amount, hotelId: imp.hotelId, why: 'Activity near statement end may settle after the statement date.', actionLabel: 'Mark Timing Difference', href: open });
      } else if (l.suggestedResolution === 'duplicate') {
        out.push({ severity: 'warning', kind: 'duplicate', title: 'Possible duplicate transaction', transaction: `${l.rawDescription} $${Math.abs(l.amount).toFixed(2)}`, amount: l.amount, hotelId: imp.hotelId, why: 'Duplicates can overstate expenses and break reconciliation.', actionLabel: 'Review Duplicates', href: open });
      }
    });
  });
  const order: Record<ExceptionSeverity, number> = { critical: 0, warning: 1 };
  return out.sort((a, b) => order[a.severity] - order[b.severity]).slice(0, limit);
}

/* ── Account-wise reconciliation rows (with cycle dates) ──────────────── */
export interface ReconDashRow {
  hotelId: string;
  accountId: string;
  accountName: string;
  last4: string;
  type: StatementType;
  lastReconciledThrough: string;
  statementEnd: string;
  beginningBalance: number;
  statementEndingBalance: number;
  clearedBalance: number;
  difference: number;
  status: SessionRow['status'] | 'not-started';
  sessionId?: string;
  classic: boolean;
}
export function reconDashRows(store: Store2, hotelId?: string): ReconDashRow[] {
  const out: ReconDashRow[] = [];
  const hotels = hotelId ? [hotelId] : HOTEL_ENTITIES.map((h) => h.id);
  const rows = allSessionRows(store, hotelId);
  hotels.forEach((hid) => {
    const banks = bankAccountsForHotel(hid).map((b) => ({ id: b.id, name: b.name, last4: b.last4, type: 'bank' as StatementType, beg: b.openingBalance, t: b.type }));
    const cards = creditCardsForHotel(hid).map((c) => ({ id: c.id, name: c.name, last4: c.last4, type: 'credit-card' as StatementType, beg: 0, t: 'Credit Card' }));
    [...banks, ...cards].forEach((a) => {
      const session = rows.find((r) => r.imp.accountId === a.id);
      const cyc = accountCycle(a.name, a.t, a.type, a.beg);
      if (session) {
        out.push({
          hotelId: hid, accountId: a.id, accountName: a.name, last4: a.last4, type: a.type,
          lastReconciledThrough: session.imp.lastReconciledThrough ?? cyc.lastReconciledThrough,
          statementEnd: session.imp.endDate, beginningBalance: session.imp.beginningBalance,
          statementEndingBalance: session.imp.endingBalance, clearedBalance: session.math.clearedBalance,
          difference: session.math.difference, status: session.status, sessionId: session.id, classic: session.imp.mode === 'classic',
        });
      } else {
        out.push({
          hotelId: hid, accountId: a.id, accountName: a.name, last4: a.last4, type: a.type,
          lastReconciledThrough: cyc.lastReconciledThrough, statementEnd: cyc.statementEnd,
          beginningBalance: a.beg, statementEndingBalance: a.beg, clearedBalance: a.beg, difference: 0,
          status: 'not-started', classic: false,
        });
      }
    });
  });
  return out;
}

/* ── Cash & card position (POSTED data only) ──────────────────────────── */
export interface CashRow {
  hotelId: string;
  operating: number;
  payroll: number;
  reserve: number;
  totalCash: number;
  cardBalance: number;
  netCash: number;
}
export function cashPosition(store: Store2, hotelId?: string): CashRow[] {
  const hotels = hotelId ? [hotelId] : HOTEL_ENTITIES.map((h) => h.id);
  const posted = postedJournalLines(store, hotelId);
  return hotels.map((hid) => {
    const banks = bankAccountsForHotel(hid);
    const cards = creditCardsForHotel(hid);
    // Posted-data view: start from opening balance and apply posted journal lines hitting that account name.
    const balFor = (name: string, opening: number) => {
      const lines = posted.filter((l) => l.hotelId === hid && l.account === name);
      const delta = lines.reduce((s, l) => s + l.debit - l.credit, 0); // asset: debit increases
      return Math.round((opening + delta) * 100) / 100;
    };
    const operating = banks.filter((b) => b.type === 'Operating Checking').reduce((s, b) => s + balFor(b.name, b.openingBalance), 0);
    const payroll = banks.filter((b) => b.type === 'Payroll Checking').reduce((s, b) => s + balFor(b.name, b.openingBalance), 0);
    const reserve = banks.filter((b) => b.type === 'Reserve').reduce((s, b) => s + balFor(b.name, b.openingBalance), 0);
    const totalCash = Math.round((operating + payroll + reserve) * 100) / 100;
    const cardBalance = cards.reduce((s, c) => s + c.currentBalance, 0);
    return { hotelId: hid, operating, payroll, reserve, totalCash, cardBalance, netCash: Math.round((totalCash - cardBalance) * 100) / 100 };
  });
}

/* ── Recent activity ──────────────────────────────────────────────────────
 * Real store activity (what the accountant did this session) takes precedence.
 * On a fresh browser the store is empty, so we synthesize a believable feed from
 * the seed (recent uploads, postings, completed reconciliations) — the demo
 * never shows an empty activity panel. */
export interface ActivityItem { id: string; actor: string; action: string; detail?: string; hotelId?: string; hotelName?: string; ts: string }
export function recentActivity(store: Store2, hotelId?: string, limit = 8): ActivityItem[] {
  const real = store.activity
    .filter((a) => !hotelId || a.hotelId === hotelId)
    .slice(0, limit)
    .map((a) => ({ ...a, hotelName: a.hotelId ? hotelLabel(a.hotelId).name : undefined }));
  if (real.length >= 3) return real;

  // Synthesize from the seed so the panel is populated for the demo.
  const seeded: ActivityItem[] = [];
  const rows = allSessionRows(store, hotelId);
  let n = 0;
  const stamp = (i: number) => `2026-06-09T${String(9 + (i % 8)).padStart(2, '0')}:${String((i * 13) % 60).padStart(2, '0')}:00Z`;
  rows.filter((r) => r.status === 'reconciled').slice(0, 3).forEach((r) => {
    seeded.push({ id: `sa-rec-${n}`, actor: ACCOUNTANT, action: 'Reconciliation completed', detail: `${r.imp.accountName} · ${r.imp.month}`, hotelId: r.imp.hotelId, hotelName: hotelLabel(r.imp.hotelId).name, ts: stamp(n++) });
  });
  rows.filter((r) => r.counts.posted + r.counts.cleared > 0).slice(0, 3).forEach((r) => {
    seeded.push({ id: `sa-post-${n}`, actor: ACCOUNTANT, action: 'Posted and cleared lines', detail: `${r.counts.cleared + r.counts.reconciled} cleared · ${r.imp.accountName}`, hotelId: r.imp.hotelId, hotelName: hotelLabel(r.imp.hotelId).name, ts: stamp(n++) });
  });
  rows.slice(0, 4).forEach((r) => {
    seeded.push({ id: `sa-up-${n}`, actor: ACCOUNTANT, action: 'Uploaded statement', detail: `${r.imp.fileName}`, hotelId: r.imp.hotelId, hotelName: hotelLabel(r.imp.hotelId).name, ts: stamp(n++) });
  });
  return [...real, ...seeded].slice(0, limit);
}

/* ── Portfolio alert (top of dashboard) ───────────────────────────────── */
export interface DashAlert { severity: 'critical' | 'warning' | 'info'; title: string; message: string }
export function dashboardAlert(store: Store2, hotelId?: string): DashAlert | null {
  const closes = hotelId ? [closeForHotel(store, hotelId)] : portfolioClose(store);
  const blocked = closes.filter((c) => c.status === 'blocked').length;
  const diffs = closes.reduce((s, c) => s + (c.difference > 0 ? 1 : 0), 0);
  const missing = closes.reduce((s, c) => s + c.missingReceipts, 0);
  if (blocked > 0) return { severity: 'critical', title: `${blocked} hotel${blocked === 1 ? '' : 's'} have month close blockers`, message: 'Uncoded statement lines, missing receipts, and reconciliation differences are preventing the period close.' };
  if (diffs > 0) return { severity: 'critical', title: `${diffs} reconciliation${diffs === 1 ? ' has' : 's have'} a difference`, message: 'At least one account does not match its statement. Resolve the difference to finish reconciliation.' };
  if (missing > 0) return { severity: 'warning', title: `${missing} required receipt${missing === 1 ? ' is' : 's are'} missing`, message: 'Missing receipts may block posting and month close.' };
  return null;
}
