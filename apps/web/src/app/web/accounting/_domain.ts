/**
 * StayOps Accounting OS (v2) — Statement-to-Books domain model.
 *
 * The whole product turns on ONE artifact: a bank/credit-card STATEMENT, and the
 * LINES inside it. Each line travels a lifecycle (imported → suggested → coded →
 * posted → cleared → reconciled) and, when posted, becomes a balanced journal
 * entry in that hotel's books. Reconciliation is the workflow of taking every
 * raw line all the way to "posted, cleared, and proven against the statement."
 *
 * This file is the immutable seed: the statements that have been uploaded and the
 * raw lines inside them, plus the rule/AI suggestion attached to each line.
 * Everything the accountant DOES (coding, posting, clearing, finishing) lives in
 * the interactive store (`_store2.ts`) and is layered on top of this seed.
 *
 * Sign convention (consistent with v1):
 *   bank  → amount > 0 = Money In,  amount < 0 = Money Out
 *   card  → amount < 0 = Charge,    amount > 0 = Credit / Payment
 */
import {
  HOTEL_ENTITIES, ACCT_BANK_ACCOUNTS, ACCT_CREDIT_CARDS, getEntity,
} from '@hos/shared/accounting-os';

export const RECON_MONTH = '2026-05';
export const ACCOUNTANT = 'Sanjay Narsee';

/* ── Enums ────────────────────────────────────────────────────────────── */
export type StatementType = 'bank' | 'credit-card';

export type ResolutionType =
  | 'create-transaction' | 'match-existing' | 'transfer' | 'cc-payment' | 'split'
  | 'owner-contribution' | 'owner-draw' | 'loan-payment' | 'tax-payment'
  | 'asset-purchase' | 'refund' | 'duplicate' | 'timing-difference' | 'needs-investigation';

export const RESOLUTION_TYPES: { key: ResolutionType; label: string; hint: string }[] = [
  { key: 'create-transaction', label: 'Create Accounting Transaction', hint: 'Normal expense, revenue deposit, bank fee, card charge.' },
  { key: 'match-existing', label: 'Match Existing Transaction', hint: 'Already entered in the books — link, don’t duplicate.' },
  { key: 'transfer', label: 'Transfer Between Accounts', hint: 'Operating → Payroll, Operating → Reserve, etc.' },
  { key: 'cc-payment', label: 'Credit Card Payment', hint: 'Bank payment to Amex / Chase. Not an expense.' },
  { key: 'split', label: 'Split Transaction', hint: 'One line, multiple categories.' },
  { key: 'owner-contribution', label: 'Owner Contribution', hint: 'Owner deposits money into the hotel account.' },
  { key: 'owner-draw', label: 'Owner Draw', hint: 'Owner withdraws money from the hotel account.' },
  { key: 'loan-payment', label: 'Loan Payment', hint: 'Split principal, interest, fees — not all expense.' },
  { key: 'tax-payment', label: 'Tax Payment', hint: 'Clears a tax payable liability. Not an expense.' },
  { key: 'asset-purchase', label: 'Asset Purchase', hint: 'Capitalize equipment, furniture, improvements.' },
  { key: 'refund', label: 'Refund or Credit', hint: 'Vendor refund or credit-card credit.' },
  { key: 'duplicate', label: 'Duplicate or Exclude', hint: 'No accounting entry — keep in the audit trail.' },
  { key: 'timing-difference', label: 'Timing Difference', hint: 'Deposit in transit, outstanding check, pending ACH.' },
  { key: 'needs-investigation', label: 'Needs Investigation', hint: 'Cannot decide yet — assign and follow up.' },
];
export const resolutionLabel = (k: ResolutionType) => RESOLUTION_TYPES.find((r) => r.key === k)?.label ?? k;

export type TxnType = 'Expense' | 'Revenue Deposit' | 'Bank Fee' | 'Payroll' | 'Credit Card Fee' | 'Refund or Credit' | 'Other';
export const TXN_TYPES: TxnType[] = ['Expense', 'Revenue Deposit', 'Bank Fee', 'Payroll', 'Credit Card Fee', 'Refund or Credit', 'Other'];

export const DEPARTMENTS = ['Front Office', 'Housekeeping', 'Engineering', 'Kitchen', 'Laundry', 'Sales', 'Admin', 'Ownership', 'General'] as const;
export type Dept = typeof DEPARTMENTS[number];

export const TIMING_TYPES = ['Deposit in Transit', 'Outstanding Payment', 'Pending ACH', 'Pending Card Batch', 'Other'] as const;
export const TAX_TYPES = ['Sales Tax', 'Occupancy Tax', 'Tourism Tax', 'State Tax', 'Other'] as const;
export const INVESTIGATION_REASONS = ['Missing receipt', 'Unknown vendor', 'Amount mismatch', 'Possible wrong hotel', 'Need manager explanation', 'Need bank support', 'Need CPA review'] as const;
export const EXCLUDE_REASONS = ['Duplicate', 'Imported by mistake', 'Personal transaction', 'Bank error', 'Test transaction', 'Other'] as const;
export const INVESTIGATION_ASSIGNEES = ['Rushabh (GM)', 'Adreene Allen (GM)', 'April Mcclendon (GM)', 'CPA — Patel & Co.', 'Bookkeeper'] as const;

/* ── Status unions (label maps live in _ui.tsx) ───────────────────────── */
export type LineStatus =
  | 'imported' | 'suggested' | 'needs-coding' | 'coded' | 'ready-to-post'
  | 'posted' | 'cleared' | 'reconciled'
  | 'needs-support' | 'duplicate' | 'excluded' | 'timing-difference' | 'needs-investigation';
export type ReceiptStatus2 = 'not-required' | 'required' | 'missing' | 'requested' | 'attached' | 'approved' | 'rejected';
export type StatementStatus =
  | 'uploaded' | 'needs-mapping' | 'preview-ready' | 'imported' | 'in-review'
  | 'ready-to-reconcile' | 'reconciled' | 'failed' | 'reversed';
export type SessionStatus =
  | 'not-started' | 'needs-coding' | 'in-review' | 'ready-to-post'
  | 'difference-found' | 'ready-to-reconcile' | 'reconciled' | 'blocked';

/* ── Models ───────────────────────────────────────────────────────────── */
export interface StatementImport {
  id: string;                 // also the workbench session id
  hotelId: string;
  statementType: StatementType;
  accountId: string;
  accountName: string;
  accountLast4: string;
  institution: string;
  sourceAccountCode: string;  // COA code of the bank/card (e.g. 1010, 2110)
  cardHolder?: string;
  month: string;
  startDate: string;
  endDate: string;
  beginningBalance: number;
  endingBalance: number;      // statement ending balance / statement balance
  fileName: string;
  uploadedBy: string;
  uploadedIso: string;
  seedStatus: StatementStatus;
  paymentDueDate?: string;    // cards
  // Statement source / reconciliation mode (real-world: not everyone imports CSV)
  source?: StatementSource;
  mode?: ReconMode;
  // Per-account cycle (NOT forced to month-end)
  lastReconciledThrough?: string;
  lastReconciledBalance?: number;
  pdfName?: string;           // attached PDF/printed statement, manual mode
  notes?: string;
}

export type StatementSource = 'csv' | 'pdf-printed' | 'existing' | 'manual';
export type ReconMode = 'statement-line' | 'classic';

export const STATEMENT_SOURCES: { key: StatementSource; label: string; hint: string }[] = [
  { key: 'csv', label: 'Upload CSV Statement', hint: 'Import statement lines and code each one.' },
  { key: 'pdf-printed', label: 'Use PDF or Printed Statement', hint: 'Attach the PDF; select matching transactions manually.' },
  { key: 'existing', label: 'Use Existing Imported Transactions', hint: 'Reconcile against transactions already in StayOps.' },
  { key: 'manual', label: 'Manual Entry', hint: 'Enter ending balance and select transactions by hand.' },
];

export interface StatementLineSeed {
  id: string;
  importId: string;
  hotelId: string;
  statementType: StatementType;
  accountId: string;
  dateIso: string;
  postedDateIso: string;
  rawDescription: string;
  normalizedDescription: string;
  referenceNumber?: string;
  amount: number;             // signed
  direction: 'in' | 'out';
  suggestedResolution: ResolutionType;
  suggestedVendor?: string;
  suggestedCategoryCode?: string;
  suggestedCategoryName?: string;
  suggestedDepartment?: Dept;
  suggestedTxnType?: TxnType;
  receiptRequirement: ReceiptStatus2;  // 'required' | 'not-required'
  ruleId?: string;
  ruleScope?: 'global' | 'hotel_level';
  ruleName?: string;
  confidence: number;
  seedStatus: LineStatus;
  seedPosted: boolean;
  seedCleared: boolean;
}

/* ── COA account codes used by the journal builder + pickers ──────────── */
export const CODE = {
  operating: '1010', payroll: '1020', reserve: '1030',
  ccPayable: '2100', corporateCard: '2110', gmCard: '2120',
  salesTax: '2210', occTax: '2220', tourismTax: '2230', stateTax: '2240',
  loanPayable: '2410', interest: '8010',
  ownerContribution: '3010', ownerDraw: '3020',
  roomRevenue: '4000', otherRevenue: '4320',
  rm: '6210', guestSupplies: '6120', engSupplies: '6220', utilities: '6310',
  internet: '6350', franchise: '6410', ota: '6510', payrollExp: '6000',
  insurance: '6710', pest: '6730', landscaping: '6740', linen: '6150',
  office: '6610', bankFees: '6650', ccProcessing: '6660',
  software: '6620', payrollProcessing: '6660', payrollTaxPayable: '2310', accounting: '6630',
  furniture: '1510', equipment: '1520', vendorRefund: '7040',
} as const;

/* Vendor keyword → coding suggestion. Drives the rule/AI suggestion card. */
interface Suggest { vendor: string; type: TxnType; code: string; cat: string; dept: Dept; receiptOver?: number; }
const VENDOR_SUGGEST: Record<string, Suggest> = {
  'HOME DEPOT':        { vendor: 'Home Depot', type: 'Expense', code: CODE.rm, cat: 'Repairs and Maintenance', dept: 'Engineering', receiptOver: 250 },
  'LOWES':             { vendor: "Lowe's", type: 'Expense', code: CODE.rm, cat: 'Repairs and Maintenance', dept: 'Engineering', receiptOver: 250 },
  'AMAZON BUSINESS':   { vendor: 'Amazon Business', type: 'Expense', code: CODE.guestSupplies, cat: 'Guest Supplies', dept: 'Housekeeping', receiptOver: 250 },
  'OFFICE DEPOT':      { vendor: 'Office Depot', type: 'Expense', code: CODE.office, cat: 'Office Supplies', dept: 'Admin', receiptOver: 250 },
  'COMCAST':           { vendor: 'Comcast Business', type: 'Expense', code: CODE.internet, cat: 'Internet and Cable', dept: 'Admin' },
  'GEORGIA POWER':     { vendor: 'Georgia Power', type: 'Expense', code: CODE.utilities, cat: 'Electricity', dept: 'Engineering' },
  'BOOKING.COM':       { vendor: 'Booking.com', type: 'Expense', code: CODE.ota, cat: 'OTA Commissions', dept: 'Sales' },
  'EXPEDIA':           { vendor: 'Expedia', type: 'Expense', code: CODE.ota, cat: 'OTA Commissions', dept: 'Sales' },
  'PEST CONTROL':      { vendor: 'Pest Control Vendor', type: 'Expense', code: CODE.pest, cat: 'Pest Control', dept: 'Engineering' },
  'LANDSCAPING':       { vendor: 'Landscaping Service', type: 'Expense', code: CODE.landscaping, cat: 'Landscaping', dept: 'Engineering' },
  'LINEN SERVICE':     { vendor: 'Linen Service', type: 'Expense', code: CODE.linen, cat: 'Linen Expense', dept: 'Housekeeping' },
  'INSURANCE':         { vendor: 'Insurance Co.', type: 'Expense', code: CODE.insurance, cat: 'Insurance', dept: 'Admin' },
};
const EXPENSE_KEYS = Object.keys(VENDOR_SUGGEST);

/* ── Deterministic RNG ────────────────────────────────────────────────── */
function seeded(str: string) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  let s = (h >>> 0) || 7;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 0xffffffff; };
}
const round = (n: number) => Math.round(n * 100) / 100;
const day = (m: string, d: number) => `${m}-${String(Math.max(1, Math.min(28, d))).padStart(2, '0')}`;

/* ── Build statement imports for May 2026 ─────────────────────────────── */
function bankCode(type: string): string {
  if (type === 'Operating Checking') return CODE.operating;
  if (type === 'Payroll Checking') return CODE.payroll;
  if (type === 'Reserve') return CODE.reserve;
  return CODE.operating;
}

/** A believable working set: operating checking + one card per hotel, plus a few
 *  extra accounts, for May 2026. ~40 statements across 16 hotels. */
export const STATEMENT_IMPORTS: StatementImport[] = (() => {
  const out: StatementImport[] = [];
  HOTEL_ENTITIES.forEach((h, hi) => {
    const r = seeded(h.id + 'stmt');
    const banks = ACCT_BANK_ACCOUNTS.filter((a) => a.hotelId === h.id);
    const cards = ACCT_CREDIT_CARDS.filter((c) => c.hotelId === h.id);
    // operating checking always; payroll/reserve occasionally
    const chosenBanks = banks.filter((b) => b.type === 'Operating Checking' || (b.type === 'Payroll Checking' && r() > 0.6) || (b.type === 'Reserve' && r() > 0.7));
    const chosenCards = cards.filter((_, i) => i === 0 || r() > 0.5);

    chosenBanks.forEach((b) => {
      const rr = seeded(b.id + 'imp');
      // status spread across portfolio
      const roll = rr();
      let st: StatementStatus = 'imported';
      if (hi % 7 === 0) st = 'reconciled';
      else if (b.type === 'Operating Checking' && roll > 0.55) st = 'in-review';
      else if (roll > 0.85) st = 'needs-mapping';
      else if (roll > 0.7) st = 'ready-to-reconcile';
      out.push({
        id: `stmt-${b.id}-${RECON_MONTH}`,
        hotelId: h.id, statementType: 'bank', accountId: b.id, accountName: b.name,
        accountLast4: b.last4, institution: b.bank, sourceAccountCode: bankCode(b.type),
        month: RECON_MONTH, startDate: `${RECON_MONTH}-01`, endDate: `${RECON_MONTH}-31`,
        beginningBalance: b.openingBalance,
        endingBalance: 0, // filled after lines generated
        fileName: `${b.bank.toLowerCase().replace(/\s+/g, '-')}-${b.type.split(' ')[0].toLowerCase()}-may-2026.csv`,
        uploadedBy: ACCOUNTANT, uploadedIso: `2026-06-0${1 + (hi % 5)}T09:${10 + (hi % 40)}:00Z`,
        seedStatus: st,
      });
    });
    chosenCards.forEach((c) => {
      const rr = seeded(c.id + 'imp');
      const roll = rr();
      let st: StatementStatus = 'imported';
      if (hi % 7 === 0) st = 'reconciled';
      else if (roll > 0.6) st = 'in-review';
      else if (roll > 0.85) st = 'needs-mapping';
      out.push({
        id: `stmt-${c.id}-${RECON_MONTH}`,
        hotelId: h.id, statementType: 'credit-card', accountId: c.id, accountName: c.name,
        accountLast4: c.last4, institution: c.issuer, sourceAccountCode: c.name.includes('GM') ? CODE.gmCard : CODE.corporateCard,
        cardHolder: c.cardHolder,
        month: RECON_MONTH, startDate: `${RECON_MONTH}-01`, endDate: `${RECON_MONTH}-31`,
        beginningBalance: 0,
        endingBalance: 0,
        fileName: `${c.issuer.toLowerCase()}-${c.name.split(' ')[0].toLowerCase()}-may-2026.csv`,
        uploadedBy: ACCOUNTANT, uploadedIso: `2026-06-0${1 + (hi % 5)}T11:${10 + (hi % 40)}:00Z`,
        seedStatus: st, paymentDueDate: `2026-06-${15 + (hi % 10)}`,
      });
    });
  });
  // backfill ending balances from generated lines. NOTE: call generate(imp)
  // directly — seedLinesFor() would touch STATEMENT_IMPORTS (still initializing
  // here) and _lineCache (declared below), causing a temporal-dead-zone error.
  out.forEach((imp) => {
    const lines = generate(imp);
    const net = lines.reduce((s, l) => s + l.amount, 0);
    if (imp.statementType === 'bank') imp.endingBalance = round(imp.beginningBalance + net);
    else {
      // card statement balance = charges - credits (positive owed)
      const charges = lines.filter((l) => l.amount < 0).reduce((s, l) => s + Math.abs(l.amount), 0);
      const credits = lines.filter((l) => l.amount > 0).reduce((s, l) => s + l.amount, 0);
      imp.endingBalance = round(imp.beginningBalance + charges - credits);
    }
  });
  return out;
})();

export const getImport = (id: string) => STATEMENT_IMPORTS.find((s) => s.id === id);

/* ── Generate the raw lines for a statement (memoized) ────────────────── */
const _lineCache: Record<string, StatementLineSeed[]> = {};

export function seedLinesFor(importId: string): StatementLineSeed[] {
  if (_lineCache[importId]) return _lineCache[importId];
  const imp = STATEMENT_IMPORTS.find((s) => s.id === importId);
  if (!imp) return [];
  const lines = generate(imp);
  _lineCache[importId] = lines;
  return lines;
}

function generate(imp: StatementImport): StatementLineSeed[] {
  const r = seeded(imp.id + 'lines');
  const lines: StatementLineSeed[] = [];
  const reconciled = imp.seedStatus === 'reconciled';
  let i = 0;

  const push = (partial: Omit<StatementLineSeed, 'id' | 'importId' | 'hotelId' | 'statementType' | 'accountId' | 'normalizedDescription' | 'postedDateIso' | 'seedPosted' | 'seedCleared'> & { normalized?: string }) => {
    const posted = reconciled || (partial.seedStatus === 'posted' || partial.seedStatus === 'cleared' || partial.seedStatus === 'reconciled');
    const cleared = reconciled || partial.seedStatus === 'cleared' || partial.seedStatus === 'reconciled';
    lines.push({
      id: `${imp.id}-l${i}`,
      importId: imp.id, hotelId: imp.hotelId, statementType: imp.statementType, accountId: imp.accountId,
      normalizedDescription: partial.normalized ?? normalize(partial.rawDescription),
      postedDateIso: partial.dateIso,
      seedPosted: posted, seedCleared: cleared,
      ...partial,
    });
    i++;
  };

  const initStatus = (hasRule: boolean): LineStatus => {
    if (reconciled) return 'reconciled';
    const roll = r();
    if (roll > 0.82) return 'cleared';
    if (roll > 0.7) return 'posted';
    return hasRule ? 'suggested' : 'needs-coding';
  };

  if (imp.statementType === 'bank') {
    const isOperating = imp.sourceAccountCode === CODE.operating;
    // Special, teaching lines on the operating checking statement
    if (isOperating) {
      push({
        dateIso: day(imp.month, 5), rawDescription: 'AMEX EPAYMENT ACH', referenceNumber: `ACH${1000 + Math.floor(r() * 8999)}`,
        amount: -round(3500 + r() * 4000), direction: 'out',
        suggestedResolution: 'cc-payment', suggestedTxnType: 'Other', receiptRequirement: 'not-required',
        confidence: 0.93, ruleName: 'Card payment pattern', seedStatus: initStatus(true),
      });
      push({
        dateIso: day(imp.month, 9), rawDescription: 'GA DOR OCCUPANCY TAX PMT', referenceNumber: `TAX${1000 + Math.floor(r() * 8999)}`,
        amount: -round(4200 + r() * 5000), direction: 'out',
        suggestedResolution: 'tax-payment', suggestedCategoryCode: CODE.occTax, suggestedCategoryName: 'Occupancy Tax Payable',
        receiptRequirement: 'not-required', confidence: 0.9, ruleName: 'Tax payment pattern', seedStatus: initStatus(true),
      });
      push({
        dateIso: day(imp.month, 12), rawDescription: 'LOAN PAYMENT - COMMERCIAL MTG', referenceNumber: `LN${1000 + Math.floor(r() * 8999)}`,
        amount: -round(9000 + r() * 6000), direction: 'out',
        suggestedResolution: 'loan-payment', suggestedCategoryCode: CODE.loanPayable, suggestedCategoryName: 'Mortgage Loan Payable',
        receiptRequirement: 'not-required', confidence: 0.88, ruleName: 'Loan payment pattern', seedStatus: initStatus(true),
      });
      push({
        dateIso: day(imp.month, 15), rawDescription: 'ONLINE TRANSFER TO RESERVE', referenceNumber: `TRF${1000 + Math.floor(r() * 8999)}`,
        amount: -round(5000 + r() * 8000), direction: 'out',
        suggestedResolution: 'transfer', receiptRequirement: 'not-required',
        confidence: 0.86, ruleName: 'Transfer pattern', seedStatus: initStatus(true),
      });
      push({
        dateIso: day(imp.month, 2), rawDescription: 'PMS DEPOSIT - STRIPE PAYOUT', referenceNumber: `DEP${1000 + Math.floor(r() * 8999)}`,
        amount: round(4000 + r() * 9000), direction: 'in',
        suggestedResolution: 'create-transaction', suggestedTxnType: 'Revenue Deposit',
        suggestedCategoryCode: CODE.roomRevenue, suggestedCategoryName: 'Room Revenue', suggestedDepartment: 'Front Office',
        suggestedVendor: 'Stripe Payout', receiptRequirement: 'not-required', confidence: 0.84,
        ruleName: 'STRIPE PAYOUT → Room Revenue', ruleScope: 'global', ruleId: 'gr-stripe', seedStatus: initStatus(true),
      });
      push({
        dateIso: day(imp.month, 27), rawDescription: 'BANK SERVICE FEE', amount: -round(20 + r() * 60), direction: 'out',
        suggestedResolution: 'create-transaction', suggestedTxnType: 'Bank Fee',
        suggestedCategoryCode: CODE.bankFees, suggestedCategoryName: 'Bank Fees', suggestedDepartment: 'Admin',
        suggestedVendor: imp.institution, receiptRequirement: 'not-required', confidence: 0.95,
        ruleName: 'BANK SERVICE FEE → Bank Fees', ruleScope: 'global', ruleId: 'gr-bankfee', seedStatus: initStatus(true),
      });
      // a payroll ACH
      push({
        dateIso: day(imp.month, 20), rawDescription: 'PAYROLL ACH - PAYCHEX', amount: -round(12000 + r() * 14000), direction: 'out',
        suggestedResolution: 'create-transaction', suggestedTxnType: 'Payroll',
        suggestedCategoryCode: CODE.payrollExp, suggestedCategoryName: 'Payroll Expenses', suggestedDepartment: 'Admin',
        suggestedVendor: 'Paychex', receiptRequirement: 'not-required', confidence: 0.9,
        ruleName: 'PAYROLL → Payroll Expense', ruleScope: 'global', ruleId: 'gr-payroll', seedStatus: initStatus(true),
      });
      // Small payroll-PROVIDER fee — must NOT auto-classify as payroll wages.
      push({
        dateIso: day(imp.month, 6), rawDescription: 'GUSTO PAYROLL', referenceNumber: `SUB${1000 + Math.floor(r() * 8999)}`,
        amount: -round(23 + r() * 30), direction: 'out',
        suggestedResolution: 'create-transaction', suggestedTxnType: 'Expense',
        suggestedCategoryCode: CODE.software, suggestedCategoryName: 'Software Subscriptions', suggestedDepartment: 'Admin',
        suggestedVendor: 'Gusto', receiptRequirement: 'not-required', confidence: 0.62,
        ruleName: 'Small payroll-provider charge — confirm: fee, subscription, tax, or wages', seedStatus: 'needs-coding',
      });
      // T+2 timing difference — deposit recorded but not yet on the statement.
      push({
        dateIso: day(imp.month, 31), rawDescription: 'PMS DEPOSIT - MERCHANT BATCH', referenceNumber: `DEP${1000 + Math.floor(r() * 8999)}`,
        amount: round(2400 + r() * 5000), direction: 'in',
        suggestedResolution: 'timing-difference', suggestedTxnType: 'Revenue Deposit',
        suggestedCategoryCode: CODE.roomRevenue, suggestedCategoryName: 'Room Revenue', suggestedDepartment: 'Front Office',
        suggestedVendor: 'PMS Deposit', receiptRequirement: 'not-required', confidence: 0.7,
        ruleName: 'Recorded May 31, settles June 2 — Deposit in Transit', seedStatus: 'timing-difference',
      });
    }
    // Fill with normal expenses + a couple deposits
    const n = (isOperating ? 6 : 9) + Math.floor(r() * 5);
    for (let k = 0; k < n; k++) {
      const inflow = isOperating && r() > 0.8;
      if (inflow) {
        push({
          dateIso: day(imp.month, 1 + Math.floor(r() * 27)), rawDescription: 'PMS DEPOSIT', referenceNumber: `DEP${1000 + Math.floor(r() * 8999)}`,
          amount: round(1500 + r() * 7000), direction: 'in',
          suggestedResolution: 'create-transaction', suggestedTxnType: 'Revenue Deposit',
          suggestedCategoryCode: CODE.roomRevenue, suggestedCategoryName: 'Room Revenue', suggestedDepartment: 'Front Office',
          suggestedVendor: 'PMS Deposit', receiptRequirement: 'not-required', confidence: 0.8, seedStatus: initStatus(false),
        });
      } else {
        addExpense(push, r, imp, initStatus);
      }
    }
    // a possible duplicate
    if (isOperating && r() > 0.4) {
      const amt = -round(150 + r() * 400);
      push({
        dateIso: day(imp.month, 18), rawDescription: 'HOME DEPOT #1247', referenceNumber: `${5000 + Math.floor(r() * 4000)}`,
        amount: amt, direction: 'out', suggestedResolution: 'duplicate',
        suggestedVendor: 'Home Depot', suggestedCategoryCode: CODE.rm, suggestedCategoryName: 'Repairs and Maintenance', suggestedDepartment: 'Engineering',
        receiptRequirement: 'required', confidence: 0.72, ruleName: 'Possible duplicate of posted line', seedStatus: reconciled ? 'reconciled' : 'duplicate',
      });
    }
  } else {
    // Credit card: mostly charges, one credit
    const n = 8 + Math.floor(r() * 6);
    for (let k = 0; k < n; k++) addExpense(push, r, imp, initStatus, true);
    // a credit / refund
    if (r() > 0.4) {
      push({
        dateIso: day(imp.month, 22), rawDescription: 'AMAZON BUSINESS REFUND', amount: round(40 + r() * 220), direction: 'in',
        suggestedResolution: 'refund', suggestedVendor: 'Amazon Business', suggestedCategoryCode: CODE.guestSupplies, suggestedCategoryName: 'Guest Supplies',
        suggestedDepartment: 'Housekeeping', receiptRequirement: 'not-required', confidence: 0.78, seedStatus: initStatus(false),
      });
    }
  }
  return lines;
}

function addExpense(
  push: (p: any) => void, r: () => number, imp: StatementImport,
  initStatus: (hasRule: boolean) => LineStatus, card = false,
) {
  const key = EXPENSE_KEYS[Math.floor(r() * EXPENSE_KEYS.length)];
  const sug = VENDOR_SUGGEST[key];
  const amt = -round((card ? 25 : 60) + r() * (card ? 900 : 2200));
  const needsReceipt = sug.receiptOver != null && Math.abs(amt) > sug.receiptOver;
  // Cambria has a hotel-level Amazon rule → Guest Supplies (override)
  const hotelRule = imp.hotelId === 'GA989' && key === 'AMAZON BUSINESS';
  push({
    dateIso: day(imp.month, 1 + Math.floor(r() * 27)),
    rawDescription: `${key}${card ? '' : ` #${1000 + Math.floor(r() * 8999)}`}`,
    referenceNumber: `${4000 + Math.floor(r() * 5000)}`,
    amount: amt, direction: 'out',
    suggestedResolution: 'create-transaction', suggestedTxnType: 'Expense',
    suggestedCategoryCode: sug.code, suggestedCategoryName: sug.cat, suggestedDepartment: sug.dept,
    suggestedVendor: sug.vendor,
    receiptRequirement: needsReceipt ? 'required' : 'not-required',
    confidence: round(0.7 + r() * 0.28),
    ruleName: hotelRule ? 'Amazon → Guest Supplies for Cambria' : `${key} → ${sug.cat}`,
    ruleScope: hotelRule ? 'hotel_level' : 'global',
    ruleId: hotelRule ? 'hr-cambria-amazon' : undefined,
    seedStatus: initStatus(true),
  });
}

function normalize(raw: string): string {
  return raw.replace(/#\d+/g, '').replace(/\bACH\b|\bPMT\b|\bPAYMENT\b/gi, '').replace(/\s+/g, ' ').trim()
    .split(' ').map((w) => w.charAt(0) + w.slice(1).toLowerCase()).join(' ');
}

/* ── Book transactions for a MANUAL / classic reconciliation ──────────────
 * In manual mode the accountant reconciles against transactions that already
 * exist in StayOps (book transactions), checking the ones that appear on the
 * paper/PDF statement. We seed a realistic mix: most in-period and already
 * coded+posted (just need checking), a couple uncategorized (need inline
 * coding), one duplicate, and one T+2 timing item dated AFTER the statement end
 * (so it must NOT be cleared, and carries forward). The returned ending balance
 * is the sum of in-period activity so the demo can reach a $0.00 difference. */
export function genBookTransactions(opts: {
  sessionId: string; hotelId: string; statementType: StatementType; accountId: string;
  start: string; end: string; beginningBalance: number;
}): { lines: StatementLineSeed[]; suggestedEndingBalance: number } {
  const r = seeded(opts.sessionId + 'book');
  const isCard = opts.statementType === 'credit-card';
  const lines: StatementLineSeed[] = [];
  let i = 0;
  const endDay = Number(opts.end.slice(8, 10)) || 28;
  const startMonth = opts.start.slice(0, 7);

  const mk = (p: Partial<StatementLineSeed> & { rawDescription: string; amount: number; dateIso: string; suggestedResolution: ResolutionType; seedStatus: LineStatus; seedPosted: boolean; seedCleared: boolean }) => {
    lines.push({
      id: `${opts.sessionId}-l${i}`, importId: opts.sessionId, hotelId: opts.hotelId, statementType: opts.statementType, accountId: opts.accountId,
      postedDateIso: p.dateIso, normalizedDescription: normalize(p.rawDescription), direction: p.amount < 0 ? 'out' : 'in',
      referenceNumber: `${4000 + Math.floor(r() * 5000)}`, receiptRequirement: 'not-required', confidence: 0.8,
      ...p,
    } as StatementLineSeed);
    i++;
  };
  const inPeriodDay = () => `${startMonth}-${String(1 + Math.floor(r() * Math.max(1, endDay - 1))).padStart(2, '0')}`;

  // Already coded + posted book transactions (just need checking on the statement).
  const coded = isCard
    ? [['AMAZON BUSINESS', CODE.guestSupplies, 'Guest Supplies', 'Housekeeping'], ['HOME DEPOT', CODE.rm, 'Repairs and Maintenance', 'Engineering'], ['OFFICE DEPOT', CODE.office, 'Office Supplies', 'Admin']]
    : [['GEORGIA POWER', CODE.utilities, 'Electricity', 'Engineering'], ['COMCAST', CODE.internet, 'Internet and Cable', 'Admin'], ['PMS DEPOSIT', CODE.roomRevenue, 'Room Revenue', 'Front Office']];
  const nCoded = 4 + Math.floor(r() * 3);
  for (let k = 0; k < nCoded; k++) {
    const [v, code, cat, dept] = coded[k % coded.length] as [string, string, string, Dept];
    const inflow = v === 'PMS DEPOSIT';
    const amt = inflow ? round(2000 + r() * 6000) : -round((isCard ? 40 : 80) + r() * 1400);
    mk({ rawDescription: `${v}${isCard ? '' : ` #${1000 + Math.floor(r() * 8999)}`}`, amount: amt, dateIso: inPeriodDay(),
      suggestedResolution: 'create-transaction', suggestedTxnType: (inflow ? 'Revenue Deposit' : 'Expense') as TxnType,
      suggestedVendor: v, suggestedCategoryCode: code, suggestedCategoryName: cat, suggestedDepartment: dept,
      seedStatus: 'posted', seedPosted: true, seedCleared: false });
  }
  // Uncategorized book transactions (selected → needs category inline).
  for (let k = 0; k < 2; k++) {
    mk({ rawDescription: isCard ? 'SQ *MISC VENDOR' : `CHECK #${2000 + Math.floor(r() * 800)}`, amount: -round(60 + r() * 600), dateIso: inPeriodDay(),
      suggestedResolution: 'create-transaction', suggestedTxnType: 'Expense', receiptRequirement: 'not-required',
      seedStatus: 'needs-coding', seedPosted: false, seedCleared: false });
  }
  // A duplicate of the first coded line.
  if (lines[0]) {
    mk({ rawDescription: lines[0].rawDescription, amount: lines[0].amount, dateIso: lines[0].dateIso,
      suggestedResolution: 'duplicate', suggestedVendor: lines[0].suggestedVendor, suggestedCategoryCode: lines[0].suggestedCategoryCode, suggestedCategoryName: lines[0].suggestedCategoryName,
      receiptRequirement: 'not-required', confidence: 0.7, ruleName: 'Same date, amount, and description as another book transaction',
      seedStatus: 'needs-coding', seedPosted: false, seedCleared: false });
  }
  // In-period activity total (the duplicate is NOT counted — it's not really on the statement).
  const inPeriodTotal = lines.filter((l) => l.suggestedResolution !== 'duplicate').reduce((s, l) => s + l.amount, 0);

  // T+2 timing item dated AFTER the statement end — must NOT be cleared.
  const timingDay = `${opts.end.slice(0, 7)}-${String(Math.min(28, endDay + 2)).padStart(2, '0')}`;
  mk({ rawDescription: isCard ? 'PENDING CARD BATCH' : 'PMS DEPOSIT - MERCHANT BATCH', amount: round(2000 + r() * 4000), dateIso: timingDay,
    suggestedResolution: 'timing-difference', suggestedTxnType: 'Revenue Deposit', suggestedVendor: 'PMS Deposit',
    suggestedCategoryCode: CODE.roomRevenue, suggestedCategoryName: 'Room Revenue', suggestedDepartment: 'Front Office',
    receiptRequirement: 'not-required', confidence: 0.7, ruleName: 'Dated after statement end — possible Deposit in Transit',
    seedStatus: 'timing-difference', seedPosted: false, seedCleared: false });

  const suggestedEndingBalance = isCard
    ? round(opts.beginningBalance + (-inPeriodTotal))  // charges increase owed
    : round(opts.beginningBalance + inPeriodTotal);
  return { lines, suggestedEndingBalance };
}

/** Days between two ISO dates (b - a). */
export function daysBetween(a: string, b: string): number {
  const [ay, am, ad] = a.split('-').map(Number); const [by, bm, bd] = b.split('-').map(Number);
  return Math.round((Date.UTC(by, bm - 1, bd) - Date.UTC(ay, am - 1, ad)) / 86400000);
}

/* ── Per-scope statement queries ──────────────────────────────────────── */
export const importsForHotel = (hotelId?: string) => hotelId ? STATEMENT_IMPORTS.filter((s) => s.hotelId === hotelId) : STATEMENT_IMPORTS;

/* ── Hotel display helper ─────────────────────────────────────────────── */
export function hotelLabel(hotelId: string) {
  const h = getEntity(hotelId);
  return { name: h?.hotelName ?? hotelId, legal: h?.legalEntity ?? '', code: h?.propertyCode ?? '', manager: h?.manager ?? '' };
}

/* ── Payroll exception logic ──────────────────────────────────────────────
 * "Payroll" in a description does NOT mean payroll wages. A small recurring
 * charge from a payroll provider is a software/processing fee, not wages.
 * Never auto-post payroll-related transactions in V1 — always require review. */
export interface PayrollGuidance {
  isPayrollRelated: boolean;
  kind: 'fee' | 'wages' | 'tax' | 'clearing' | 'none';
  suggestionCode?: string;
  suggestionName?: string;
  warning?: string;
  requireReview: boolean;
}
export function payrollGuidance(description: string, amount: number): PayrollGuidance {
  const d = description.toUpperCase();
  const isPayroll = /PAYROLL|GUSTO|PAYCHEX|ADP|QUICKBOOKS PAYROLL|RIPPLING/.test(d);
  if (!isPayroll) return { isPayrollRelated: false, kind: 'none', requireReview: false };
  const abs = Math.abs(amount);
  if (/TAX/.test(d)) {
    return { isPayrollRelated: true, kind: 'tax', suggestionCode: CODE.payrollTaxPayable, suggestionName: 'Payroll Taxes Payable', warning: 'This looks like a payroll TAX payment. It should reduce payroll tax liability, not be wages expense.', requireReview: true };
  }
  if (abs < 100) {
    return { isPayrollRelated: true, kind: 'fee', suggestionCode: CODE.software, suggestionName: 'Software Subscriptions', warning: 'This is a small payroll-provider charge. Confirm whether it is a payroll fee, subscription, tax payment, or payroll run before posting.', requireReview: true };
  }
  return { isPayrollRelated: true, kind: 'wages', suggestionCode: CODE.payrollExp, suggestionName: 'Payroll Expenses', warning: 'This appears to be payroll wages. Confirm against a payroll report and split wages / employer tax / liabilities before posting.', requireReview: true };
}

/* ── Smart Add-Missing suggestions ─────────────────────────────────────────
 * As the accountant types a description, surface matches from:
 *   1. RECENT transactions on this account — real amount (nearest the entered
 *      date) and the coding already used, so a repeat charge fills in exactly.
 *   2. The known vendor catalog — typical coding + a representative amount.
 * Everything autofilled stays editable. */
export interface TxnSuggestion {
  source: 'recent' | 'vendor';
  description: string;        // what to put in the Description field
  vendor?: string;
  txnType: TxnType;
  direction: 'in' | 'out';
  amount: number;            // signed suggested amount (always editable)
  categoryCode?: string;
  categoryName?: string;
  department?: Dept;
  hint: string;              // small explainer under the row
}

interface RecentTxn { description: string; vendor?: string; amount: number; dateIso: string; categoryCode?: string; categoryName?: string; department?: Dept; txnType?: TxnType }

const median = (xs: number[]) => { if (!xs.length) return 0; const s = [...xs].sort((a, b) => a - b); const m = Math.floor(s.length / 2); return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
const cleanDesc = (raw: string) => raw.replace(/#\d+/g, '').replace(/\s+/g, ' ').trim();

export function suggestTransactions(query: string, recent: RecentTxn[], asOfDate: string, max = 6): TxnSuggestion[] {
  const q = query.trim().toUpperCase();
  if (q.length < 2) return [];
  const out: TxnSuggestion[] = [];
  const seenDesc = new Set<string>();

  // 1. Recent transactions on this account whose description/vendor matches.
  const matches = recent.filter((t) => t.description.toUpperCase().includes(q) || (t.vendor ?? '').toUpperCase().includes(q));
  // Group by normalized description so repeats collapse to one suggestion.
  const groups = new Map<string, RecentTxn[]>();
  matches.forEach((t) => { const key = cleanDesc(t.description).toUpperCase(); (groups.get(key) ?? groups.set(key, []).get(key)!).push(t); });
  for (const [, group] of groups) {
    // Amount = the occurrence nearest the entered date (else most recent).
    const nearest = [...group].sort((a, b) => Math.abs(daysBetween(a.dateIso, asOfDate)) - Math.abs(daysBetween(b.dateIso, asOfDate)))[0];
    const desc = cleanDesc(nearest.description);
    if (seenDesc.has(desc.toUpperCase())) continue;
    seenDesc.add(desc.toUpperCase());
    out.push({
      source: 'recent', description: desc, vendor: nearest.vendor,
      txnType: nearest.txnType ?? (nearest.amount > 0 ? 'Revenue Deposit' : 'Expense'),
      direction: nearest.amount < 0 ? 'out' : 'in', amount: round(nearest.amount),
      categoryCode: nearest.categoryCode, categoryName: nearest.categoryName, department: nearest.department,
      hint: group.length > 1 ? `Seen ${group.length}× on this account · nearest ${nearest.dateIso}` : `Recent on this account · ${nearest.dateIso}`,
    });
    if (out.length >= max) return out;
  }

  // 2. Vendor catalog matches (typical coding + representative amount).
  for (const key of EXPENSE_KEYS) {
    const sug = VENDOR_SUGGEST[key];
    if (!key.includes(q) && !sug.vendor.toUpperCase().includes(q)) continue;
    if (seenDesc.has(sug.vendor.toUpperCase())) continue;
    seenDesc.add(sug.vendor.toUpperCase());
    // Representative amount from this vendor's recent activity, else a typical default.
    const vendorAmts = recent.filter((t) => (t.vendor ?? '').toUpperCase() === sug.vendor.toUpperCase() || t.description.toUpperCase().includes(key)).map((t) => Math.abs(t.amount));
    const typical = vendorAmts.length ? median(vendorAmts) : (sug.receiptOver ? sug.receiptOver + 50 : 200);
    out.push({
      source: 'vendor', description: sug.vendor, vendor: sug.vendor, txnType: sug.type, direction: 'out',
      amount: -round(typical), categoryCode: sug.code, categoryName: sug.cat, department: sug.dept,
      hint: `Known vendor · typically ${sug.cat}`,
    });
    if (out.length >= max) return out;
  }
  return out;
}
