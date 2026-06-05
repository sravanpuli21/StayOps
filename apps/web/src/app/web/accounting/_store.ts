'use client';

/**
 * StayOps Accounting OS — interactive engine (in-session, localStorage-backed).
 *
 * The seed data (transactions, accounts, close status) is immutable. This store
 * holds everything the accountant DOES during a demo so every click is real and
 * persists across refresh:
 *   - imported statement batches (new transactions added on upload)
 *   - transaction edits: vendor / category / department / status / receipt / splits
 *   - posted journal entries
 *   - reconciliation progress + completion
 *   - month-close completion
 *   - created rules, vendors, documents
 *   - an activity/audit log
 *
 * Reset-friendly: a single resetAccountingOs() clears it back to seed.
 */
import { useSyncExternalStore } from 'react';
import {
  ACCT_TRANSACTIONS, type AcctTransaction, type TxStatus, type ReceiptStatus,
  type Department, type RichRule,
} from '@hos/shared/accounting-os';

export interface JournalLine { account: string; debit: number; credit: number; memo?: string }
export interface JournalEntry {
  id: string;
  txId: string;
  hotelId: string;
  number: string;
  dateIso: string;
  source: string;
  createdBy: string;
  lines: JournalLine[];
}
export interface SplitLine { id: string; category: string; department: Department; amount: number; memo?: string }
export interface TxEdit {
  vendor?: string;
  category?: string;
  department?: Department;
  memo?: string;
  status?: TxStatus;
  receipt?: ReceiptStatus;
  splits?: SplitLine[];
  receiptName?: string;
}
export interface ImportBatch {
  id: string;
  hotelId: string;
  accountId: string;
  source: 'bank' | 'credit-card';
  month: string;
  count: number;
  duplicates: number;
  uploadedIso: string;
}
export interface AcctRule {
  id: string;
  name: string;
  appliesTo: 'all' | 'one';
  hotelId?: string;
  source: 'bank' | 'credit-card' | 'both';
  contains: string;
  setVendor?: string;
  setCategory?: string;
  setDepartment?: Department;
  requireReceipt: boolean;
  timesApplied: number;
  active: boolean;
}
export interface NewVendor { name: string; category: string; department: Department; appliesTo: 'all' | 'one'; notes?: string }
export interface AcctDoc { id: string; name: string; type: string; hotelId: string; vendor?: string; dateIso: string; uploadedBy: string }
export interface ActivityEntry { id: string; ts: string; actor: string; action: string; hotelId?: string; detail?: string }

interface ReconState { cleared: string[]; finished: boolean; finishedIso?: string }

/* ── Hotel Entity control-center state ────────────────────────────────── */
export interface EntityFields {
  legalEntity: string; hotelName: string; address: string; phone: string;
  rooms: number; taxId: string; propertyCode: string; openingDate: string;
  manager: string; managerEmail?: string; managerPhone?: string;
  city: string; state: string; county?: string; zip?: string;
  status: 'active' | 'setup-pending' | 'inactive' | 'archived';
}
export interface NewBankAccount {
  id: string; hotelId: string; name: string; bank: string; type: string;
  last4: string; openingBalance: number; openingDate: string; coa: string; active: boolean;
}
export interface NewCreditCard {
  id: string; hotelId: string; name: string; issuer: string; last4: string;
  cardHolder: string; creditLimit: number; openingBalance: number; openingDate: string;
  closingDay?: number; dueDay?: number; coa: string; active: boolean;
}
export interface EntityUser {
  id: string; hotelId: string; name: string; email: string; role: string; accessLevel: string;
}
export interface OpeningBalance { hotelId: string; date: string; entered: boolean }

interface AcctOsState {
  addedTx: AcctTransaction[];               // from uploads
  edits: Record<string, TxEdit>;            // txId → edits
  journals: JournalEntry[];
  batches: ImportBatch[];
  rules: AcctRule[];
  vendors: NewVendor[];
  docs: AcctDoc[];
  recon: Record<string, ReconState>;        // accountId → state
  closed: string[];                          // `${hotelId}:${month}` closed
  activity: ActivityEntry[];
  jeCounter: number;
  // Entity control center
  newEntities: EntityFields[];               // entities created via the wizard
  entityEdits: Record<string, Partial<EntityFields>>; // hotelId → edited fields
  addedBank: NewBankAccount[];
  addedCards: NewCreditCard[];
  entityUsers: EntityUser[];
  coaApplied: string[];                      // hotelIds with COA template applied
  openingBalances: Record<string, OpeningBalance>; // hotelId → opening balance state
  entityActivity: Array<ActivityEntry & { recordType?: string; before?: string; after?: string }>;
  // Vendors (hotel-specific)
  newVendors: VendorRecord[];
  vendorEdits: Record<string, Partial<VendorRecord>>;
  mergedVendors: string[];                    // vendorIds merged away (hidden)
  // Chart of Accounts (per-hotel)
  coaAccounts: CoaAccountRecord[];            // custom accounts created per hotel
  coaEdits: Record<string, Partial<CoaAccountRecord>>; // `${hotelId}:${code}` → edits
  coaInactive: string[];                      // `${hotelId}:${code}` made inactive
  coaMappings: Record<string, string>;        // bank/card/vendor record id → account code
  coaOpening: Record<string, CoaOpeningState>; // hotelId → opening balance worksheet
  // Rules engine (deep module)
  richRules: RichRuleRecord[];                // created rich rules
  ruleEdits: Record<string, Partial<RichRuleRecord>>; // ruleId → edits (status, priority, actions…)
  ignoredSuggestions: string[];               // suggestion ids dismissed
  resolvedConflicts: string[];                // conflict ids resolved
  ruleActivity: RuleActivityEntry[];
  // Reconciliation (deep module) — keyed by `${accountId}:${month}`
  reconRecords: Record<string, ReconRecord>;
  reconAdjustments: ReconAdjustment[];
  reconActivity: ReconActivityEntry[];
  // Reports
  favoriteReports: string[];                 // report ids starred
  savedReports: SavedReport[];
}

const KEY = 'stayops.acctos.state';
const listeners = new Set<() => void>();
let cache: AcctOsState | null = null;

const empty: AcctOsState = {
  addedTx: [], edits: {}, journals: [], batches: [], rules: SEED_RULES(), vendors: [],
  docs: [], recon: {}, closed: [], activity: [], jeCounter: 1000,
  newEntities: [], entityEdits: {}, addedBank: [], addedCards: [], entityUsers: [],
  coaApplied: [], openingBalances: {}, entityActivity: [],
  newVendors: [], vendorEdits: {}, mergedVendors: [],
  coaAccounts: [], coaEdits: {}, coaInactive: [], coaMappings: {}, coaOpening: {},
  richRules: [], ruleEdits: {}, ignoredSuggestions: [], resolvedConflicts: [], ruleActivity: [],
  reconRecords: {}, reconAdjustments: [], reconActivity: [],
  favoriteReports: [], savedReports: [],
};

function SEED_RULES(): AcctRule[] {
  return [
    { id: 'rule-hd', name: 'Home Depot → R&M', appliesTo: 'all', source: 'both', contains: 'HOME DEPOT', setVendor: 'HOME DEPOT', setCategory: 'Repairs & Maintenance', setDepartment: 'Engineering', requireReceipt: true, timesApplied: 34, active: true },
    { id: 'rule-ga', name: 'Georgia Power → Utilities', appliesTo: 'all', source: 'bank', contains: 'GEORGIA POWER', setVendor: 'GEORGIA POWER', setCategory: 'Utilities', setDepartment: 'Engineering', requireReceipt: false, timesApplied: 12, active: true },
    { id: 'rule-exp', name: 'Expedia → OTA Commissions', appliesTo: 'all', source: 'bank', contains: 'EXPEDIA', setVendor: 'EXPEDIA', setCategory: 'OTA Commissions', setDepartment: 'Sales', requireReceipt: false, timesApplied: 21, active: true },
  ];
}

function read(): AcctOsState {
  if (cache) return cache;
  if (typeof window === 'undefined') return empty;
  try {
    const raw = localStorage.getItem(KEY);
    cache = raw ? { ...empty, ...(JSON.parse(raw) as AcctOsState) } : { ...empty };
  } catch { cache = { ...empty }; }
  return cache!;
}
function write(next: AcctOsState) {
  cache = next;
  try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* ignore */ }
  listeners.forEach((l) => l());
}
function nowIso() { return new Date().toISOString(); }
function log(s: AcctOsState, action: string, hotelId?: string, detail?: string): ActivityEntry[] {
  return [{ id: `act-${Date.now()}-${Math.floor(performance.now())}`, ts: nowIso(), actor: 'Sanjay Narsee', action, hotelId, detail }, ...s.activity].slice(0, 200);
}

/* ── Derived: full transaction list (seed + added) with edits applied ──── */
export function allTransactions(s: AcctOsState): AcctTransaction[] {
  const merged = [...s.addedTx, ...ACCT_TRANSACTIONS];
  return merged.map((t) => {
    const e = s.edits[t.id];
    if (!e) return t;
    return {
      ...t,
      vendor: e.vendor ?? t.vendor,
      category: e.category ?? t.category,
      department: e.department ?? t.department,
      memo: e.memo ?? t.memo,
      status: e.status ?? t.status,
      receipt: e.receipt ?? t.receipt,
    };
  });
}

/* ── Mutations ────────────────────────────────────────────────────────── */
export function importStatement(batch: Omit<ImportBatch, 'id' | 'uploadedIso'>, rows: AcctTransaction[]) {
  const s = read();
  const id = `imp-${Date.now()}`;
  const full: ImportBatch = { ...batch, id, uploadedIso: nowIso() };
  write({
    ...s,
    addedTx: [...rows.map((r) => ({ ...r, importBatchId: id })), ...s.addedTx],
    batches: [full, ...s.batches],
    activity: log(s, 'Uploaded statement', batch.hotelId, `${batch.count} transactions imported`),
  });
  return id;
}

export function editTx(txId: string, patch: TxEdit, hotelId?: string, note?: string) {
  const s = read();
  write({ ...s, edits: { ...s.edits, [txId]: { ...s.edits[txId], ...patch } }, activity: note ? log(s, note, hotelId, txId) : s.activity });
}

export function postTransaction(tx: AcctTransaction, lines: JournalLine[]) {
  const s = read();
  const num = `JE-${s.jeCounter + 1}`;
  const je: JournalEntry = { id: `je-${tx.id}`, txId: tx.id, hotelId: tx.hotelId, number: num, dateIso: tx.dateIso, source: tx.source === 'bank' ? 'Bank' : 'Credit Card', createdBy: 'Sanjay Narsee', lines };
  write({
    ...s,
    edits: { ...s.edits, [tx.id]: { ...s.edits[tx.id], status: 'posted' } },
    journals: [je, ...s.journals.filter((j) => j.txId !== tx.id)],
    jeCounter: s.jeCounter + 1,
    activity: log(s, 'Posted transaction', tx.hotelId, `${num} · ${tx.description}`),
  });
  return je;
}

export function setReconCleared(accountId: string, txIds: string[]) {
  const s = read();
  write({ ...s, recon: { ...s.recon, [accountId]: { ...(s.recon[accountId] ?? { cleared: [], finished: false }), cleared: txIds } } });
}
export function finishReconciliation(accountId: string, hotelId: string, accountName: string) {
  const s = read();
  write({
    ...s,
    recon: { ...s.recon, [accountId]: { cleared: s.recon[accountId]?.cleared ?? [], finished: true, finishedIso: nowIso() } },
    activity: log(s, 'Reconciled account', hotelId, accountName),
  });
}
export function closeMonth(hotelId: string, month: string, hotelName: string) {
  const s = read();
  const key = `${hotelId}:${month}`;
  write({ ...s, closed: [...new Set([...s.closed, key])], activity: log(s, 'Closed month', hotelId, `${month} · ${hotelName}`) });
}
export function reopenMonth(hotelId: string, month: string) {
  const s = read();
  write({ ...s, closed: s.closed.filter((k) => k !== `${hotelId}:${month}`), activity: log(s, 'Reopened month', hotelId, month) });
}
export function saveRule(rule: Omit<AcctRule, 'id' | 'timesApplied' | 'active'>) {
  const s = read();
  const r: AcctRule = { ...rule, id: `rule-${Date.now()}`, timesApplied: 0, active: true };
  write({ ...s, rules: [r, ...s.rules], activity: log(s, 'Created rule', rule.hotelId, rule.name) });
}
export function addVendor(v: NewVendor) {
  const s = read();
  write({ ...s, vendors: [v, ...s.vendors], activity: log(s, 'Added vendor', undefined, v.name) });
}
export function addDoc(d: Omit<AcctDoc, 'id'>) {
  const s = read();
  write({ ...s, docs: [{ ...d, id: `doc-${Date.now()}` }, ...s.docs], activity: log(s, 'Uploaded document', d.hotelId, d.name) });
}
export function resetAccountingOs() { write({ ...empty, rules: SEED_RULES() }); }

/* ── Entity control-center mutations ──────────────────────────────────── */
function logEntity(s: AcctOsState, action: string, hotelId: string, opts: { detail?: string; recordType?: string; before?: string; after?: string } = {}) {
  return [{ id: `ent-${Date.now()}-${Math.floor(performance.now())}`, ts: nowIso(), actor: 'Sanjay Narsee', action, hotelId, ...opts }, ...s.entityActivity].slice(0, 300);
}

export function createEntity(e: EntityFields, extras: { bank?: NewBankAccount[]; cards?: NewCreditCard[]; users?: EntityUser[]; applyCoa?: boolean }) {
  const s = read();
  write({
    ...s,
    newEntities: [e, ...s.newEntities],
    addedBank: [...(extras.bank ?? []), ...s.addedBank],
    addedCards: [...(extras.cards ?? []), ...s.addedCards],
    entityUsers: [...(extras.users ?? []), ...s.entityUsers],
    coaApplied: extras.applyCoa ? [...new Set([...s.coaApplied, e.propertyCode])] : s.coaApplied,
    entityActivity: logEntity(s, 'Entity Created', e.propertyCode, { detail: e.hotelName, recordType: 'Entity' }),
  });
}
export function editEntity(hotelId: string, patch: Partial<EntityFields>, note?: string) {
  const s = read();
  write({ ...s, entityEdits: { ...s.entityEdits, [hotelId]: { ...s.entityEdits[hotelId], ...patch } }, entityActivity: logEntity(s, 'Entity Updated', hotelId, { detail: note, recordType: 'Entity' }) });
}
export function addBankAccount(a: NewBankAccount) {
  const s = read();
  write({ ...s, addedBank: [a, ...s.addedBank], entityActivity: logEntity(s, 'Bank Account Added', a.hotelId, { detail: `${a.name} · ••${a.last4}`, recordType: 'Bank Account', after: a.name }) });
}
export function addCreditCard(c: NewCreditCard) {
  const s = read();
  write({ ...s, addedCards: [c, ...s.addedCards], entityActivity: logEntity(s, 'Credit Card Added', c.hotelId, { detail: `${c.name} · ••${c.last4}`, recordType: 'Credit Card', after: c.name }) });
}
export function assignEntityUser(u: EntityUser) {
  const s = read();
  write({ ...s, entityUsers: [u, ...s.entityUsers], entityActivity: logEntity(s, 'User Access Added', u.hotelId, { detail: `${u.name} · ${u.role}`, recordType: 'User' }) });
}
export function applyCoaTemplate(hotelId: string, template: string) {
  const s = read();
  write({ ...s, coaApplied: [...new Set([...s.coaApplied, hotelId])], entityActivity: logEntity(s, 'Setting Changed', hotelId, { detail: `Applied ${template}`, recordType: 'Chart of Accounts' }) });
}
export function saveOpeningBalances(hotelId: string, date: string) {
  const s = read();
  write({ ...s, openingBalances: { ...s.openingBalances, [hotelId]: { hotelId, date, entered: true } }, entityActivity: logEntity(s, 'Setting Changed', hotelId, { detail: 'Opening balances entered', recordType: 'Opening Balance' }) });
}

/* ── Vendor mutations (hotel-specific) ────────────────────────────────── */
export interface VendorRecord {
  id: string; hotelId: string; name: string; legalName?: string; type: string;
  defaultCategory?: string; defaultDepartment?: string; email?: string; phone?: string;
  status: string; createdFrom: string;
}
export function createVendor(v: VendorRecord) {
  const s = read();
  write({ ...s, newVendors: [v, ...s.newVendors], vendorEdits: s.vendorEdits, entityActivity: logEntity(s, 'Vendor Created', v.hotelId, { detail: `${v.name}`, recordType: 'Vendor' }) });
}
export function editVendor(vendorId: string, hotelId: string, patch: Partial<VendorRecord>, note?: string) {
  const s = read();
  write({ ...s, vendorEdits: { ...s.vendorEdits, [vendorId]: { ...s.vendorEdits[vendorId], ...patch } }, entityActivity: logEntity(s, 'Vendor Edited', hotelId, { detail: note, recordType: 'Vendor' }) });
}
export function mergeVendors(keepId: string, dropId: string, hotelId: string, note: string) {
  const s = read();
  write({ ...s, mergedVendors: [...s.mergedVendors, dropId], entityActivity: logEntity(s, 'Vendor Merged', hotelId, { detail: note, recordType: 'Vendor' }) });
}

/* ── Chart of Accounts mutations (per-hotel) ──────────────────────────── */
export interface CoaAccountRecord {
  hotelId: string;
  code: string;
  name: string;
  type: string;          // CoaFullType
  detailType: string;
  parent?: string;
  reportSection: string;
  description?: string;
  status: 'active' | 'inactive';
  openingBalance?: number;
  openingBalanceDate?: string;
}
export interface CoaOpeningState {
  hotelId: string;
  date: string;
  notes?: string;
  lines: Record<string, { debit: number; credit: number; memo?: string }>; // code → amounts
  posted: boolean;
  postedIso?: string;
}

export function createAccount(a: CoaAccountRecord) {
  const s = read();
  write({ ...s, coaAccounts: [a, ...s.coaAccounts], entityActivity: logEntity(s, 'Account Created', a.hotelId, { detail: `${a.code} ${a.name}`, recordType: 'Account', after: a.name }) });
}
export function editAccount(hotelId: string, code: string, patch: Partial<CoaAccountRecord>, note?: string) {
  const s = read();
  const key = `${hotelId}:${code}`;
  write({ ...s, coaEdits: { ...s.coaEdits, [key]: { ...s.coaEdits[key], ...patch } }, entityActivity: logEntity(s, 'Account Edited', hotelId, { detail: note ?? code, recordType: 'Account' }) });
}
export function setAccountStatus(hotelId: string, code: string, active: boolean) {
  const s = read();
  const key = `${hotelId}:${code}`;
  const coaInactive = active ? s.coaInactive.filter((k) => k !== key) : [...new Set([...s.coaInactive, key])];
  write({ ...s, coaInactive, entityActivity: logEntity(s, active ? 'Account Reactivated' : 'Account Made Inactive', hotelId, { detail: code, recordType: 'Account' }) });
}
export function setCoaMapping(recordId: string, accountCode: string, hotelId: string, label: string) {
  const s = read();
  write({ ...s, coaMappings: { ...s.coaMappings, [recordId]: accountCode }, entityActivity: logEntity(s, 'Mapping Changed', hotelId, { detail: `${label} → ${accountCode}`, recordType: 'Mapping', after: accountCode }) });
}
export function saveCoaOpening(hotelId: string, state: Omit<CoaOpeningState, 'hotelId' | 'posted'>, post: boolean) {
  const s = read();
  const prev = s.coaOpening[hotelId];
  const next: CoaOpeningState = { hotelId, ...state, posted: post || (prev?.posted ?? false), postedIso: post ? nowIso() : prev?.postedIso };
  write({ ...s, coaOpening: { ...s.coaOpening, [hotelId]: next }, openingBalances: post ? { ...s.openingBalances, [hotelId]: { hotelId, date: state.date, entered: true } } : s.openingBalances, entityActivity: logEntity(s, post ? 'Opening Balance Posted' : 'Opening Balance Saved', hotelId, { detail: `As of ${state.date}`, recordType: 'Opening Balance' }) });
}

/* ── Rules engine mutations (deep module) ─────────────────────────────── */
export type RichRuleRecord = RichRule;
export interface RuleActivityEntry { id: string; ts: string; actor: string; ruleId: string; ruleName: string; scope: string; hotelId?: string; action: string; before?: string; after?: string; detail?: string }

function logRule(s: AcctOsState, action: string, rule: { id: string; name: string; scope: string; hotelId?: string }, opts: { before?: string; after?: string; detail?: string } = {}) {
  return [{ id: `ra-${Date.now()}-${Math.floor(performance.now())}`, ts: nowIso(), actor: 'Sanjay Narsee', ruleId: rule.id, ruleName: rule.name, scope: rule.scope, hotelId: rule.hotelId, action, ...opts }, ...s.ruleActivity].slice(0, 300);
}

export function createRichRule(rule: RichRuleRecord, opts: { matched?: number } = {}) {
  const s = read();
  write({ ...s, richRules: [rule, ...s.richRules], ruleActivity: logRule(s, 'Rule Created', rule, { detail: opts.matched != null ? `${opts.matched} transactions matched in preview` : undefined }) });
}
export function editRichRule(ruleId: string, base: { name: string; scope: string; hotelId?: string }, patch: Partial<RichRuleRecord>, note?: string) {
  const s = read();
  write({ ...s, ruleEdits: { ...s.ruleEdits, [ruleId]: { ...s.ruleEdits[ruleId], ...patch } }, ruleActivity: logRule(s, 'Rule Edited', { id: ruleId, ...base }, { detail: note }) });
}
export function setRuleStatus(ruleId: string, base: { name: string; scope: string; hotelId?: string }, status: RichRule['status']) {
  const s = read();
  const action = status === 'disabled' ? 'Rule Disabled' : status === 'active' ? 'Rule Enabled' : 'Rule Edited';
  write({ ...s, ruleEdits: { ...s.ruleEdits, [ruleId]: { ...s.ruleEdits[ruleId], status } }, ruleActivity: logRule(s, action, { id: ruleId, ...base }, { after: status }) });
}
export function setRulePriority(ruleId: string, base: { name: string; scope: string; hotelId?: string }, priority: number, before: number) {
  const s = read();
  write({ ...s, ruleEdits: { ...s.ruleEdits, [ruleId]: { ...s.ruleEdits[ruleId], priority } }, ruleActivity: logRule(s, 'Rule Priority Changed', { id: ruleId, ...base }, { before: String(before), after: String(priority) }) });
}
export function logRuleApplied(base: { id: string; name: string; scope: string; hotelId?: string }, count: number) {
  const s = read();
  write({ ...s, ruleActivity: logRule(s, 'Rule Applied to Existing', base, { detail: `${count} transactions updated` }) });
}
export function logRuleTested(base: { id: string; name: string; scope: string; hotelId?: string }, count: number) {
  const s = read();
  write({ ...s, ruleActivity: logRule(s, 'Rule Tested', base, { detail: `${count} matches found` }) });
}
export function ignoreSuggestion(id: string, name: string) {
  const s = read();
  write({ ...s, ignoredSuggestions: [...new Set([...s.ignoredSuggestions, id])], ruleActivity: logRule(s, 'Suggested Rule Ignored', { id, name, scope: 'global' }) });
}
export function resolveConflict(id: string, detail: string) {
  const s = read();
  write({ ...s, resolvedConflicts: [...new Set([...s.resolvedConflicts, id])], ruleActivity: logRule(s, 'Rule Conflict Resolved', { id, name: detail, scope: 'global' }, { detail }) });
}

/* ── Reconciliation mutations (deep module) ───────────────────────────── */
export type ReconRecordStatus = 'in-progress' | 'reconciled' | 'reopened';
export interface ReconRecord {
  id: string;                 // `${accountId}:${month}`
  accountId: string;
  hotelId: string;
  kind: 'bank' | 'card';
  accountName: string;
  month: string;              // "2026-05"
  startDate: string;
  endDate: string;
  beginningBalance: number;
  endingBalance: number;      // statement ending / statement balance
  cleared: string[];          // cleared txIds
  status: ReconRecordStatus;
  startedIso: string;
  finishedIso?: string;
  finishedBy?: string;
  reopenReason?: string;
}
export interface ReconAdjustment { id: string; accountId: string; hotelId: string; date: string; amount: number; category: string; reason: string; memo?: string }
export interface ReconActivityEntry { id: string; ts: string; actor: string; hotelId: string; accountId: string; accountName: string; action: string; before?: string; after?: string; detail?: string }

export const reconKey = (accountId: string, month: string) => `${accountId}:${month}`;

function logRecon(s: AcctOsState, action: string, r: { hotelId: string; accountId: string; accountName: string }, opts: { before?: string; after?: string; detail?: string } = {}) {
  return [{ id: `rc-${Date.now()}-${Math.floor(performance.now())}`, ts: nowIso(), actor: 'Sanjay Narsee', hotelId: r.hotelId, accountId: r.accountId, accountName: r.accountName, action, ...opts }, ...s.reconActivity].slice(0, 300);
}

export function startReconciliation(rec: Omit<ReconRecord, 'id' | 'cleared' | 'status' | 'startedIso'> & { cleared?: string[] }) {
  const s = read();
  const id = reconKey(rec.accountId, rec.month);
  const existing = s.reconRecords[id];
  const full: ReconRecord = { ...rec, id, cleared: rec.cleared ?? existing?.cleared ?? [], status: existing?.status === 'reconciled' ? 'reconciled' : 'in-progress', startedIso: existing?.startedIso ?? nowIso(), finishedIso: existing?.finishedIso, finishedBy: existing?.finishedBy };
  write({ ...s, reconRecords: { ...s.reconRecords, [id]: full }, reconActivity: existing ? s.reconActivity : logRecon(s, 'Reconciliation Started', rec, { detail: `${rec.accountName} · ${rec.month}` }) });
  return id;
}
export function setReconClearedRich(id: string, cleared: string[]) {
  const s = read();
  const rec = s.reconRecords[id];
  if (!rec) return;
  write({ ...s, reconRecords: { ...s.reconRecords, [id]: { ...rec, cleared } } });
}
export function saveReconProgress(id: string) {
  const s = read();
  const rec = s.reconRecords[id];
  if (!rec) return;
  write({ ...s, reconActivity: logRecon(s, 'Progress Saved', rec, { detail: `${rec.cleared.length} cleared` }) });
}
export function editReconStatement(id: string, patch: Partial<ReconRecord>) {
  const s = read();
  const rec = s.reconRecords[id];
  if (!rec) return;
  write({ ...s, reconRecords: { ...s.reconRecords, [id]: { ...rec, ...patch } }, reconActivity: logRecon(s, 'Statement Details Edited', rec) });
}
export function finishReconciliationRich(id: string) {
  const s = read();
  const rec = s.reconRecords[id];
  if (!rec) return;
  const finished: ReconRecord = { ...rec, status: 'reconciled', finishedIso: nowIso(), finishedBy: 'Sanjay Narsee' };
  // also mark the legacy per-account recon finished so banking/dashboards reflect it
  write({
    ...s,
    reconRecords: { ...s.reconRecords, [id]: finished },
    recon: { ...s.recon, [rec.accountId]: { cleared: rec.cleared, finished: true, finishedIso: nowIso() } },
    reconActivity: logRecon(s, 'Reconciliation Completed', rec, { detail: `${rec.accountName} · ${rec.month} · difference $0.00` }),
  });
}
export function reopenReconciliation(id: string, reason: string) {
  const s = read();
  const rec = s.reconRecords[id];
  if (!rec) return;
  write({
    ...s,
    reconRecords: { ...s.reconRecords, [id]: { ...rec, status: 'reopened', reopenReason: reason } },
    recon: { ...s.recon, [rec.accountId]: { ...(s.recon[rec.accountId] ?? { cleared: rec.cleared }), finished: false } },
    reconActivity: logRecon(s, 'Reconciliation Reopened', rec, { detail: reason }),
  });
}
export function createReconAdjustment(adj: Omit<ReconAdjustment, 'id'>, accountName: string) {
  const s = read();
  const a: ReconAdjustment = { ...adj, id: `adj-${Date.now()}` };
  write({ ...s, reconAdjustments: [a, ...s.reconAdjustments], reconActivity: logRecon(s, 'Adjustment Created', { hotelId: adj.hotelId, accountId: adj.accountId, accountName }, { detail: `${adj.reason} · $${Math.abs(adj.amount).toFixed(2)}` }) });
}

/* ── Reports mutations ────────────────────────────────────────────────── */
export interface SavedReport { id: string; name: string; type: string; scope: string; filters: string; createdBy: string; lastRun: string }
export function toggleFavoriteReport(id: string) {
  const s = read();
  const fav = s.favoriteReports.includes(id) ? s.favoriteReports.filter((x) => x !== id) : [...s.favoriteReports, id];
  write({ ...s, favoriteReports: fav });
}
export function saveReport(rep: Omit<SavedReport, 'id'>) {
  const s = read();
  write({ ...s, savedReports: [{ ...rep, id: `sr-${Date.now()}` }, ...s.savedReports] });
}
export function deleteSavedReport(id: string) {
  const s = read();
  write({ ...s, savedReports: s.savedReports.filter((r) => r.id !== id) });
}

/* ── Reads ────────────────────────────────────────────────────────────── */
export function useAcctState(): AcctOsState {
  return useSyncExternalStore((cb) => { listeners.add(cb); return () => listeners.delete(cb); }, read, () => empty);
}
export const isClosed = (s: AcctOsState, hotelId: string, month: string) => s.closed.includes(`${hotelId}:${month}`);
