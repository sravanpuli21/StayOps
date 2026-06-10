/**
 * StayOps Accounting OS (v2) — Chart of Accounts data layer.
 *
 * Each hotel has its OWN copy of the standard template (same codes/names, separate
 * records & balances). This module derives, per hotel:
 *   - live accounts (template + status + balance from posted journal lines + usage)
 *   - portfolio setup status (COA applied, required accounts, mapping, opening bal)
 *   - account-type structure rollups
 *   - the trial-balance-style balance snapshot (posted only)
 */
import {
  HOTEL_ENTITIES, getEntity, bankAccountsForHotel, creditCardsForHotel, ACCT_VENDORS,
  COA_TEMPLATE, COA_TYPE_LABEL, SYSTEM_LOCKED_CODES, type CoaFullType, type CoaTemplateAccount,
} from '@hos/shared/accounting-os';
import type { Store2 } from '../_store2';
import { postedJournalLines } from '../reports/_reports';

const SEED_MISSING_COA = ['SAVFP/SAVTP']; // Fairfield/TPS Pooler — Needs COA (from spec)

export interface LiveAccount {
  hotelId: string;
  code: string;
  name: string;
  type: CoaFullType;
  detailType: string;
  parent?: string;
  reportSection: string;
  isHeader: boolean;
  systemLocked: boolean;
  required: boolean;
  status: 'active' | 'inactive' | 'system-locked';
  balance: number;            // posted-only
  txCount: number;
  usedIn: string[];
}

export function coaApplied(hotelId: string): boolean {
  const code = getEntity(hotelId)?.propertyCode ?? hotelId;
  return !SEED_MISSING_COA.includes(code);
}

/** Live accounts for one hotel: template + balances + usage. */
export function accountsForHotel(store: Store2, hotelId: string): LiveAccount[] {
  if (!coaApplied(hotelId)) return [];
  const posted = postedJournalLines(store, hotelId);
  const banks = bankAccountsForHotel(hotelId);
  const cards = creditCardsForHotel(hotelId);
  const vendors = ACCT_VENDORS.filter((v) => v.hotelsUsedIn.includes(hotelId));

  return COA_TEMPLATE.map((a) => {
    const lines = posted.filter((l) => l.account === a.name);
    const balance = Math.round(lines.reduce((s, l) => s + l.debit - l.credit, 0) * 100) / 100;
    const txCount = new Set(lines.map((l) => l.lineId)).size;
    const usedIn: string[] = [];
    if (a.detailType === 'Bank' && banks.some((b) => mapsToBank(b.type) === a.code)) usedIn.push('Bank Account');
    if (a.detailType === 'Credit Card' && cards.some((c) => mapsToCard(c.name) === a.code)) usedIn.push('Credit Card');
    if (vendors.some((v) => v.defaultCategory === a.name)) usedIn.push('Vendor Default');
    if (txCount > 0) { usedIn.push('Transaction'); usedIn.push('Journal Entry'); }
    if (!a.isHeader) usedIn.push('Report');
    const locked = SYSTEM_LOCKED_CODES.includes(a.code);
    return {
      hotelId, code: a.code, name: a.name, type: a.type, detailType: a.detailType, parent: a.parent,
      reportSection: a.reportSection, isHeader: !!a.isHeader, systemLocked: locked, required: !!a.required,
      status: locked ? 'system-locked' : 'active', balance: Math.abs(balance), txCount, usedIn: [...new Set(usedIn)],
    };
  });
}
function mapsToBank(type: string) { return type === 'Operating Checking' ? '1010' : type === 'Payroll Checking' ? '1020' : type === 'Reserve' ? '1030' : '1040'; }
function mapsToCard(name: string) { return name.includes('GM') ? '2120' : '2110'; }

export function oneAccount(store: Store2, hotelId: string, code: string): LiveAccount | undefined {
  return accountsForHotel(store, hotelId).find((a) => a.code === code);
}

/* ── Single-hotel summary cards ───────────────────────────────────────── */
export function hotelCoaSummary(store: Store2, hotelId: string) {
  const accts = accountsForHotel(store, hotelId).filter((a) => !a.isHeader);
  return {
    total: accts.length,
    active: accts.filter((a) => a.status !== 'inactive').length,
    systemLocked: accts.filter((a) => a.systemLocked).length,
    custom: 0,
    withBalance: accts.filter((a) => a.balance > 0).length,
    mappingIssues: 0,
    usedInWorkbench: accts.filter((a) => a.type === 'Expense' || a.type === 'Revenue' || a.type === 'COGS').length,
  };
}

/* ── Account-type structure rollup ────────────────────────────────────── */
export function structureOverview() {
  const types: CoaFullType[] = ['Asset', 'Liability', 'Equity', 'Revenue', 'COGS', 'Expense', 'Other Income', 'Other Expense'];
  return types.map((t) => {
    const accts = COA_TEMPLATE.filter((a) => a.type === t);
    return {
      type: t, label: COA_TYPE_LABEL[t],
      count: accts.filter((a) => !a.isHeader).length,
      required: accts.filter((a) => a.required).length,
      systemLocked: accts.filter((a) => SYSTEM_LOCKED_CODES.includes(a.code)).length,
    };
  });
}

/* ── Portfolio setup status by hotel ──────────────────────────────────── */
export interface CoaSetupRow {
  hotelId: string;
  applied: boolean;
  totalAccounts: number;
  requiredComplete: boolean;
  bankMapped: boolean;
  cardMapped: boolean;
  openingComplete: boolean;
  reportMapped: boolean;
  workbenchReady: boolean;
  status: 'accounting-ready' | 'needs-coa' | 'needs-mapping' | 'needs-opening' | 'needs-review';
}
export function portfolioCoaRows(store: Store2): CoaSetupRow[] {
  return HOTEL_ENTITIES.map((h) => {
    const applied = coaApplied(h.id);
    const code = h.propertyCode;
    const bankMapped = code !== 'GAA84';                 // Woodspring needs bank mapping
    const openingComplete = !['SAVMT', 'JAXTX'].includes(code); // two hotels need opening balances
    const total = applied ? COA_TEMPLATE.filter((a) => !a.isHeader).length : 0;
    let status: CoaSetupRow['status'] = 'accounting-ready';
    if (!applied) status = 'needs-coa';
    else if (!bankMapped) status = 'needs-mapping';
    else if (!openingComplete) status = 'needs-opening';
    return {
      hotelId: h.id, applied, totalAccounts: total, requiredComplete: applied,
      bankMapped, cardMapped: creditCardsForHotel(h.id).length > 0, openingComplete, reportMapped: applied,
      workbenchReady: applied && bankMapped, status,
    };
  });
}
export function portfolioCoaSummary(store: Store2) {
  const rows = portfolioCoaRows(store);
  return {
    entities: rows.length,
    applied: rows.filter((r) => r.applied).length,
    missing: rows.filter((r) => !r.applied).length,
    mappingIssues: rows.filter((r) => !r.bankMapped).length,
    custom: 27,
    inactive: 8,
    workbenchBlocking: rows.filter((r) => !r.workbenchReady).length,
    reportsReady: rows.filter((r) => r.applied && r.bankMapped && r.openingComplete).length,
  };
}

/* ── Balance snapshot (trial-balance style, posted only) ──────────────── */
export function balanceSnapshot(store: Store2, hotelId: string) {
  const accts = accountsForHotel(store, hotelId);
  const byType = (types: CoaFullType[]) => accts.filter((a) => types.includes(a.type)).reduce((s, a) => s + a.balance, 0);
  const revenue = byType(['Revenue', 'Other Income']);
  const expense = byType(['Expense', 'COGS', 'Other Expense']);
  return {
    assets: byType(['Asset']),
    liabilities: byType(['Liability']),
    equity: byType(['Equity']),
    revenue, expenses: expense, net: revenue - expense,
  };
}

/** Account-type colours (shared with the page). */
export const TYPE_COLORS: Record<string, { fg: string; bg: string }> = {
  Asset: { fg: '#1d4ed8', bg: '#dbeafe' }, Liability: { fg: '#b45309', bg: '#fef3c7' },
  Equity: { fg: '#6a4ec0', bg: '#ece4fb' }, Revenue: { fg: '#15803d', bg: '#dcfce7' },
  COGS: { fg: '#0e7490', bg: '#cffafe' }, Expense: { fg: '#b91c1c', bg: '#fee2e2' },
  'Other Income': { fg: '#15803d', bg: '#dcfce7' }, 'Other Expense': { fg: '#6a6a6a', bg: '#f0f0f0' },
};
