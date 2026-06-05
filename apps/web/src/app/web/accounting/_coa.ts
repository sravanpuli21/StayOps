import {
  COA_TEMPLATE, type CoaTemplateAccount, type CoaFullType,
  ACCT_TRANSACTIONS, HOTEL_ENTITIES,
  bankAccountsForHotel, creditCardsForHotel,
} from '@hos/shared/accounting-os';
import type { CoaAccountRecord, CoaOpeningState } from './_store';

interface StoreLike {
  coaAccounts: CoaAccountRecord[];
  coaEdits: Record<string, Partial<CoaAccountRecord>>;
  coaInactive: string[];
  coaMappings: Record<string, string>;
  coaApplied: string[];
  coaOpening: Record<string, CoaOpeningState>;
}

/** A live account = template account (or custom), edits applied, status resolved, usage computed. */
export interface LiveAccount {
  hotelId: string;
  code: string;
  name: string;
  type: CoaFullType;
  detailType: string;
  parent?: string;
  reportSection: string;
  description?: string;
  status: 'active' | 'inactive' | 'system-locked';
  systemLocked: boolean;
  required: boolean;
  isHeader: boolean;
  custom: boolean;
  // usage
  balance: number;
  txCount: number;
  jeCount: number;
  usedBy: string[];           // 'Bank Account' | 'Credit Card' | 'Vendor Default' | 'Transaction' | 'Journal Entry' | 'Report'
  openingBalance?: number;
}

// Deterministic pseudo-random from a string seed (stable per hotel+code).
function seed(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return (h >>> 0) / 0xffffffff;
}

/** Live accounts for one hotel: template + custom, edits + inactive applied, usage computed. */
export function accountsForHotel(store: StoreLike, hotelId: string): LiveAccount[] {
  const txs = ACCT_TRANSACTIONS.filter((t) => t.hotelId === hotelId);
  const banks = bankAccountsForHotel(hotelId);
  const cards = creditCardsForHotel(hotelId);

  const fromTemplate: LiveAccount[] = COA_TEMPLATE.map((a) => buildLive(store, hotelId, a, txs, banks, cards));
  const custom: LiveAccount[] = store.coaAccounts
    .filter((a) => a.hotelId === hotelId)
    .map((a) => buildLive(store, hotelId, {
      code: a.code, name: a.name, type: a.type as CoaFullType, detailType: a.detailType,
      parent: a.parent, reportSection: a.reportSection, required: false, systemLocked: false,
    }, txs, banks, cards, true));

  return [...fromTemplate, ...custom].sort((a, b) => (a.code < b.code ? -1 : 1));
}

function buildLive(
  store: StoreLike, hotelId: string, a: CoaTemplateAccount,
  txs: typeof ACCT_TRANSACTIONS, banks: ReturnType<typeof bankAccountsForHotel>,
  cards: ReturnType<typeof creditCardsForHotel>, custom = false,
): LiveAccount {
  const key = `${hotelId}:${a.code}`;
  const edit = store.coaEdits[key] ?? {};
  const name = edit.name ?? a.name;
  const inactive = store.coaInactive.includes(key);

  // Usage: transactions categorized to this account NAME (seed links by name).
  const acctTxs = txs.filter((t) => t.category === name);
  const txCount = acctTxs.length;
  const balance = acctTxs.reduce((s, t) => s + Math.abs(t.amount), 0);

  const usedBy: string[] = [];
  // Bank/card mapping: by COA name match OR explicit store mapping.
  const mappedBank = banks.some((b) => store.coaMappings[b.id] === a.code) || (a.detailType === 'Bank' && a.code === '1010');
  const mappedCard = cards.some((c) => store.coaMappings[c.id] === a.code) || a.code === '2100';
  if (mappedBank) usedBy.push('Bank Account');
  if (mappedCard) usedBy.push('Credit Card');
  if (txCount > 0) { usedBy.push('Transaction'); usedBy.push('Journal Entry'); }
  if (a.type === 'Expense' && txCount > 0) usedBy.push('Vendor Default');
  if (!a.isHeader) usedBy.push('Report');

  // Opening balance: deterministic for balance-bearing template accounts.
  const hasOpening = !a.isHeader && seed(key) > 0.55;
  const openingBalance = hasOpening ? Math.round(seed(key + 'ob') * 50_000) : undefined;

  const systemLocked = !!a.systemLocked;
  const status: LiveAccount['status'] = systemLocked && !inactive ? 'system-locked' : inactive ? 'inactive' : 'active';

  return {
    hotelId, code: a.code, name,
    type: (edit.type as CoaFullType) ?? a.type,
    detailType: edit.detailType ?? a.detailType,
    parent: a.parent,
    reportSection: edit.reportSection ?? a.reportSection,
    description: edit.description,
    status, systemLocked, required: !!a.required, isHeader: !!a.isHeader, custom,
    balance: Math.round(balance), txCount,
    jeCount: txCount, usedBy: [...new Set(usedBy)],
    openingBalance,
  };
}

export function oneAccount(store: StoreLike, hotelId: string, code: string): LiveAccount | undefined {
  return accountsForHotel(store, hotelId).find((a) => a.code === code);
}

/** Summary cards for a single hotel. */
export function hotelCoaSummary(store: StoreLike, hotelId: string) {
  const accts = accountsForHotel(store, hotelId).filter((a) => !a.isHeader);
  return {
    total: accts.length,
    active: accts.filter((a) => a.status !== 'inactive').length,
    inactive: accts.filter((a) => a.status === 'inactive').length,
    custom: accts.filter((a) => a.custom).length,
    withBalance: accts.filter((a) => a.balance > 0).length,
    mappingIssues: mappingIssuesForHotel(store, hotelId).length,
  };
}

/** Bank/card mapping issues for a hotel (unmapped or needs review). */
export interface MappingRow {
  recordId: string; hotelId: string; kind: 'bank' | 'card';
  name: string; institution: string; last4: string;
  currentCode: string | null; currentName: string | null;
  status: 'mapped' | 'missing' | 'needs-review';
}
export function bankMappingRows(store: StoreLike, hotelId: string): MappingRow[] {
  return bankAccountsForHotel(hotelId).map((b, i) => {
    const explicit = store.coaMappings[b.id];
    const defaultCode = b.type === 'Operating Checking' ? '1010' : b.type === 'Payroll Checking' ? '1020' : b.type === 'Reserve' ? '1030' : '1040';
    const code = explicit ?? (i === 0 || b.type !== 'Reserve' ? defaultCode : null);
    const name = code ? (accountsForHotel(store, hotelId).find((a) => a.code === code)?.name ?? null) : null;
    return { recordId: b.id, hotelId, kind: 'bank', name: b.name, institution: b.bank, last4: b.last4, currentCode: code, currentName: name, status: code ? 'mapped' : 'missing' };
  });
}
export function cardMappingRows(store: StoreLike, hotelId: string): MappingRow[] {
  return creditCardsForHotel(hotelId).map((c) => {
    const explicit = store.coaMappings[c.id];
    const code = explicit ?? (c.name.includes('GM') ? '2120' : '2110');
    const name = accountsForHotel(store, hotelId).find((a) => a.code === code)?.name ?? null;
    return { recordId: c.id, hotelId, kind: 'card', name: c.name, institution: c.issuer, last4: c.last4, currentCode: code, currentName: name, status: 'mapped' };
  });
}
function mappingIssuesForHotel(store: StoreLike, hotelId: string): MappingRow[] {
  return bankMappingRows(store, hotelId).filter((r) => r.status !== 'mapped');
}

/* ── Portfolio (all hotels) setup status ──────────────────────────────── */
export interface HotelCoaSetup {
  hotelId: string;
  templateApplied: boolean;
  totalAccounts: number;
  customAccounts: number;
  missingRequired: number;
  bankMapped: boolean;
  cardMapped: boolean;
  openingStatus: 'entered' | 'missing' | 'draft';
  status: 'Complete' | 'Needs Template' | 'Needs Mapping' | 'Needs Opening Balance' | 'Needs Review';
}

// 2 hotels intentionally "missing" COA for the demo (per spec: 14 applied / 2 missing).
const MISSING_COA_HOTELS = HOTEL_ENTITIES.slice(-2).map((h) => h.id);

export function coaSetupForHotel(store: StoreLike, hotelId: string): HotelCoaSetup {
  const applied = store.coaApplied.includes(hotelId) || !MISSING_COA_HOTELS.includes(hotelId);
  const accts = applied ? accountsForHotel(store, hotelId).filter((a) => !a.isHeader) : [];
  const customAccounts = accts.filter((a) => a.custom).length;
  const banks = bankMappingRows(store, hotelId);
  const bankMapped = banks.length > 0 && banks.every((r) => r.status === 'mapped');
  const cardMapped = cardMappingRows(store, hotelId).every((r) => r.status === 'mapped');
  const ob = store.coaOpening[hotelId];
  const openingStatus: HotelCoaSetup['openingStatus'] = ob?.posted ? 'entered' : ob ? 'draft' : (seed(hotelId + 'ob') > 0.4 ? 'entered' : 'missing');
  const missingRequired = applied ? 0 : COA_TEMPLATE.filter((a) => a.required).length;

  let status: HotelCoaSetup['status'] = 'Complete';
  if (!applied) status = 'Needs Template';
  else if (!bankMapped) status = 'Needs Mapping';
  else if (openingStatus === 'missing') status = 'Needs Opening Balance';
  else if (customAccounts > 0 && seed(hotelId + 'rev') > 0.7) status = 'Needs Review';

  return { hotelId, templateApplied: applied, totalAccounts: accts.length, customAccounts, missingRequired, bankMapped, cardMapped, openingStatus, status };
}

export function portfolioCoaSummary(store: StoreLike) {
  const setups = HOTEL_ENTITIES.map((h) => coaSetupForHotel(store, h.id));
  return {
    entities: HOTEL_ENTITIES.length,
    applied: setups.filter((s) => s.templateApplied).length,
    missing: setups.filter((s) => !s.templateApplied).length,
    custom: setups.reduce((n, s) => n + s.customAccounts, 0) + 27,
    inactive: 8,
    issues: setups.filter((s) => s.status !== 'Complete').length + 3,
    setups,
  };
}
