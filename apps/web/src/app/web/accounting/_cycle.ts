/**
 * StayOps Accounting OS (v2) — per-account statement CYCLES.
 *
 * Reconciliation is NOT forced to calendar month-end. Every bank account and
 * credit card has its own statement cycle, its own last-reconciled date, and its
 * own ending balance carried forward as the next beginning balance. Real example
 * cycles (from the spec):
 *
 *   Operating Checking  → ends May 31   (last reconciled Apr 30)
 *   Payroll Checking    → ends May 28   (last reconciled Apr 28)
 *   Reserve Account     → ends Jun 3    (last reconciled May 3)
 *   Corporate Card      → ends Jun 15   (last reconciled May 15)
 *   GM Card             → ends Jun 22   (last reconciled May 22)
 *
 * The beginning balance for a new reconciliation comes from the previous
 * reconciliation's ending balance (or an opening balance if none exists).
 */
import type { StatementType } from './_domain';

export interface AccountCycle {
  lastReconciledThrough: string;   // ISO date
  lastReconciledBalance: number;   // = beginning balance for the new period
  statementStart: string;          // ISO
  statementEnd: string;            // ISO — NOT necessarily month-end
  cycleDay: number;                // day of month the statement closes
  frequency: 'monthly';
}

/** Cycle anchor per account flavour: [closeDay, monthOffset]. monthOffset 0 = May, 1 = early June. */
function anchor(name: string, type: string, statementType: StatementType): { closeDay: number; endMonth: '2026-05' | '2026-06'; lastDay: number; lastMonth: '2026-04' | '2026-05' } {
  if (statementType === 'credit-card') {
    if (/gm/i.test(name)) return { closeDay: 22, endMonth: '2026-06', lastDay: 22, lastMonth: '2026-05' };
    return { closeDay: 15, endMonth: '2026-06', lastDay: 15, lastMonth: '2026-05' }; // Corporate Card
  }
  if (/payroll/i.test(name) || type === 'Payroll Checking') return { closeDay: 28, endMonth: '2026-05', lastDay: 28, lastMonth: '2026-04' };
  if (/reserve/i.test(name) || type === 'Reserve') return { closeDay: 3, endMonth: '2026-06', lastDay: 3, lastMonth: '2026-05' };
  return { closeDay: 31, endMonth: '2026-05', lastDay: 30, lastMonth: '2026-04' }; // Operating Checking
}

function addDay(iso: string, days: number): string {
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + days));
  return `${dt.getUTCFullYear()}-${String(dt.getUTCMonth() + 1).padStart(2, '0')}-${String(dt.getUTCDate()).padStart(2, '0')}`;
}

export function accountCycle(name: string, type: string, statementType: StatementType, beginningBalance: number): AccountCycle {
  const a = anchor(name, type, statementType);
  const lastReconciledThrough = `${a.lastMonth}-${String(a.lastDay).padStart(2, '0')}`;
  const statementStart = addDay(lastReconciledThrough, 1);
  const statementEnd = `${a.endMonth}-${String(a.closeDay).padStart(2, '0')}`;
  return {
    lastReconciledThrough,
    lastReconciledBalance: beginningBalance,
    statementStart,
    statementEnd,
    cycleDay: a.closeDay,
    frequency: 'monthly',
  };
}

/** Validate a user-entered statement period against the last reconciled date. */
export function validatePeriod(lastReconciledThrough: string, start: string): { kind: 'ok' | 'overlap' | 'gap'; message?: string } {
  if (!start || !lastReconciledThrough) return { kind: 'ok' };
  const expected = addDay(lastReconciledThrough, 1);
  if (start < expected) return { kind: 'overlap', message: 'This statement period overlaps with the previous reconciliation. Please confirm the statement dates.' };
  if (start > expected) return { kind: 'gap', message: 'There is a gap between the last reconciled date and this statement start date.' };
  return { kind: 'ok' };
}
