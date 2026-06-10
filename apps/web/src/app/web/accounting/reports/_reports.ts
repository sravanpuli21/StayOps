/**
 * StayOps Accounting OS (v2) — report derivation.
 *
 * Reports use ONLY posted accounting data. A statement line that's imported but
 * not posted does not affect the P&L, balance sheet, or trial balance — and the
 * report surfaces a warning telling the accountant how many lines are unposted.
 * Every number drills back to the journal entries → source statement lines.
 */
import { COA_TEMPLATE } from '@hos/shared/accounting-os';
import type { Store2 } from '../_store2';
import { allImports, liveLines } from '../_recon2';

export interface PostedLine {
  account: string; code?: string; debit: number; credit: number;
  hotelId: string; sessionId: string; lineId: string; description: string; dateIso: string;
}

/** Every posted journal line across the (optionally scoped) portfolio. */
export function postedJournalLines(store: Store2, hotelId?: string): PostedLine[] {
  const out: PostedLine[] = [];
  allImports(store, hotelId).forEach((imp) => {
    liveLines(store, imp.id).forEach((l) => {
      if (!l.posted || l.status === 'excluded') return;
      const je = store.journals.find((j) => j.lineId === l.id);
      if (je) {
        je.lines.forEach((jl) => out.push({ account: jl.account, code: jl.code, debit: jl.debit, credit: jl.credit, hotelId: l.hotelId, sessionId: imp.id, lineId: l.id, description: l.rawDescription, dateIso: l.dateIso }));
      } else {
        // seed-posted line with no explicit JE → synthesize from category + cash
        const cat = l.coding?.categoryName ?? l.suggestedCategoryName ?? (l.amount > 0 ? 'Room Revenue' : 'Office Supplies');
        const amt = Math.abs(l.amount);
        const cash = imp.statementType === 'credit-card' ? 'Credit Cards Payable' : imp.accountName;
        if (l.amount > 0) { out.push({ account: cash, debit: amt, credit: 0, hotelId: l.hotelId, sessionId: imp.id, lineId: l.id, description: l.rawDescription, dateIso: l.dateIso }); out.push({ account: cat, debit: 0, credit: amt, hotelId: l.hotelId, sessionId: imp.id, lineId: l.id, description: l.rawDescription, dateIso: l.dateIso }); }
        else { out.push({ account: cat, debit: amt, credit: 0, hotelId: l.hotelId, sessionId: imp.id, lineId: l.id, description: l.rawDescription, dateIso: l.dateIso }); out.push({ account: cash, debit: 0, credit: amt, hotelId: l.hotelId, sessionId: imp.id, lineId: l.id, description: l.rawDescription, dateIso: l.dateIso }); }
      }
    });
  });
  return out;
}

/** Count of statement lines that are still unposted (drives the report warning). */
export function unpostedCount(store: Store2, hotelId?: string): number {
  let n = 0;
  allImports(store, hotelId).forEach((imp) => {
    liveLines(store, imp.id).forEach((l) => { if (!l.posted && l.status !== 'excluded' && l.status !== 'timing-difference') n++; });
  });
  return n;
}

const typeOf = (account: string): string => COA_TEMPLATE.find((a) => a.name === account)?.type ?? '';

export interface PnlRow { account: string; amount: number; lineIds: string[] }
export interface Pnl { revenue: PnlRow[]; expenses: PnlRow[]; totalRevenue: number; totalExpense: number; net: number }

export function buildPnl(store: Store2, hotelId?: string): Pnl {
  const lines = postedJournalLines(store, hotelId);
  const revAgg: Record<string, PnlRow> = {};
  const expAgg: Record<string, PnlRow> = {};
  lines.forEach((l) => {
    const t = typeOf(l.account);
    if (t === 'Revenue' || t === 'Other Income') {
      const r = (revAgg[l.account] ??= { account: l.account, amount: 0, lineIds: [] });
      r.amount += l.credit - l.debit; if (!r.lineIds.includes(l.lineId)) r.lineIds.push(l.lineId);
    } else if (t === 'Expense' || t === 'COGS' || t === 'Other Expense') {
      const r = (expAgg[l.account] ??= { account: l.account, amount: 0, lineIds: [] });
      r.amount += l.debit - l.credit; if (!r.lineIds.includes(l.lineId)) r.lineIds.push(l.lineId);
    }
  });
  const revenue = Object.values(revAgg).filter((r) => Math.abs(r.amount) > 0.005).sort((a, b) => b.amount - a.amount);
  const expenses = Object.values(expAgg).filter((r) => Math.abs(r.amount) > 0.005).sort((a, b) => b.amount - a.amount);
  const totalRevenue = revenue.reduce((s, r) => s + r.amount, 0);
  const totalExpense = expenses.reduce((s, r) => s + r.amount, 0);
  return { revenue, expenses, totalRevenue, totalExpense, net: totalRevenue - totalExpense };
}

/** Resolve lineIds → drill-down rows (description + source session). */
export function drilldown(store: Store2, lineIds: string[], hotelId?: string) {
  const lines = postedJournalLines(store, hotelId);
  const seen = new Set<string>();
  return lineIds.map((id) => {
    const jl = lines.find((l) => l.lineId === id && !seen.has(l.lineId));
    if (!jl || seen.has(id)) return null;
    seen.add(id);
    return jl;
  }).filter(Boolean) as PostedLine[];
}

export const REPORT_LIST = [
  { key: 'profit-loss', name: 'Profit & Loss', desc: 'Revenue and expenses from posted journal entries.' },
  { key: 'balance-sheet', name: 'Balance Sheet', desc: 'Assets, liabilities, and equity positions.' },
  { key: 'trial-balance', name: 'Trial Balance', desc: 'Every account’s debit/credit balance.' },
  { key: 'cash-flow', name: 'Cash Flow', desc: 'Cash movement across bank accounts.' },
  { key: 'general-ledger', name: 'General Ledger', desc: 'All posted journal entry lines.' },
  { key: 'reconciliation', name: 'Reconciliation Report', desc: 'Cleared balances proven against statements.' },
];
