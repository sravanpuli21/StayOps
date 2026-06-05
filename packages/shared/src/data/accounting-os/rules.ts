/**
 * StayOps Accounting OS — Rules engine data model + seed.
 *
 * Two scopes:
 *  - global       → applies across all 16 HOS hotels
 *  - hotel_level  → applies to ONE hotel; overrides global for that hotel
 *
 * Vendors stay hotel-specific in V1 even when a global rule sets a vendor NAME:
 * the rule carries a vendor *name template*, never a shared vendor record.
 *
 * Priority: hotel-level rules always run before global rules; within a scope the
 * lower priority number runs first.
 */
import { ACCT_TRANSACTIONS } from './transactions';
import { HOTEL_ENTITIES } from './entities';

export type RuleScope = 'global' | 'hotel_level';
export type RuleSource = 'bank' | 'credit_card' | 'both';
export type RuleStatus = 'active' | 'disabled' | 'draft' | 'needs_review' | 'conflict';

export type CondField = 'Description' | 'Amount' | 'Source' | 'Bank Account' | 'Credit Card' | 'Card Holder' | 'Vendor' | 'Transaction Date' | 'Money Direction' | 'Import Batch' | 'Hotel Entity' | 'Property Code';
export type CondOperator = 'Contains' | 'Does not contain' | 'Starts with' | 'Ends with' | 'Equals' | 'Does not equal' | 'Greater than' | 'Less than' | 'Between' | 'Before' | 'After' | 'Day of month equals';

export interface RuleCondition {
  field: CondField;
  operator: CondOperator;
  value: string;
  value2?: string;            // for Between
  logical?: 'AND' | 'OR';
}

export type TxType = 'Expense' | 'Revenue Deposit' | 'Transfer' | 'Credit Card Payment' | 'Owner Contribution' | 'Owner Draw' | 'Owner Expense' | 'Loan Payment' | 'Bank Fee' | 'Payroll' | 'Asset Purchase' | 'Refund or Credit' | 'Other';
export type ReceiptRule = 'no-change' | 'not-required' | 'always' | 'over-amount' | 'card-only';
export type ApprovalBehavior = 'suggest' | 'auto-categorize' | 'auto-approve' | 'never-auto';
export type ApplyTo = 'future' | 'existing-unposted' | 'existing-batch' | 'all-unposted';
export type VendorHandling = 'use-existing' | 'create-missing' | 'suggest-only';

export interface RuleActions {
  setTransactionType?: TxType;
  setVendorName?: string;
  setCategoryAccountCode?: string;   // hotel account code
  setTemplateAccountCode?: string;   // global rules: template code
  setCategoryName?: string;          // human label for category
  setDepartment?: string;
  receipt?: ReceiptRule;
  receiptOver?: number;
  memo?: string;
  tag?: string;
  approval?: ApprovalBehavior;
}

export interface RichRule {
  id: string;
  scope: RuleScope;
  hotelId?: string;            // required for hotel_level
  name: string;
  source: RuleSource;
  priority: number;
  status: RuleStatus;
  conditions: RuleCondition[];
  conditionLogic: 'all' | 'any';
  actions: RuleActions;
  vendorHandling: VendorHandling;
  applyTo: ApplyTo;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

const C = (field: CondField, operator: CondOperator, value: string, value2?: string): RuleCondition => ({ field, operator, value, value2 });

/* ── Seed: representative deep rule set ───────────────────────────────── */
// Global rules (apply to all hotels).
const GLOBAL: RichRule[] = [
  {
    id: 'gr-home-depot', scope: 'global', name: 'HOME DEPOT to Repairs & Maintenance', source: 'both', priority: 2, status: 'active',
    conditions: [C('Description', 'Contains', 'HOME DEPOT')], conditionLogic: 'all',
    actions: { setTransactionType: 'Expense', setVendorName: 'Home Depot', setTemplateAccountCode: '6210', setCategoryName: 'Repairs and Maintenance', setDepartment: 'Engineering', receipt: 'over-amount', receiptOver: 250, approval: 'auto-categorize' },
    vendorHandling: 'use-existing', applyTo: 'future', createdBy: 'Sanjay Narsee', createdAt: '2026-01-12', updatedAt: '2026-04-02',
  },
  {
    id: 'gr-comcast', scope: 'global', name: 'COMCAST to Internet & Cable', source: 'both', priority: 3, status: 'active',
    conditions: [C('Description', 'Contains', 'COMCAST')], conditionLogic: 'all',
    actions: { setTransactionType: 'Expense', setVendorName: 'Comcast Business', setTemplateAccountCode: '6350', setCategoryName: 'Internet and Cable', setDepartment: 'General', receipt: 'not-required', approval: 'auto-categorize' },
    vendorHandling: 'use-existing', applyTo: 'future', createdBy: 'Sanjay Narsee', createdAt: '2026-01-15', updatedAt: '2026-03-20',
  },
  {
    id: 'gr-booking', scope: 'global', name: 'BOOKING.COM to OTA Commissions', source: 'both', priority: 3, status: 'active',
    conditions: [C('Description', 'Contains', 'BOOKING.COM')], conditionLogic: 'all',
    actions: { setTransactionType: 'Expense', setVendorName: 'Booking.com', setTemplateAccountCode: '6510', setCategoryName: 'OTA Commissions', setDepartment: 'Sales', receipt: 'not-required', approval: 'auto-categorize' },
    vendorHandling: 'use-existing', applyTo: 'future', createdBy: 'Sanjay Narsee', createdAt: '2026-01-15', updatedAt: '2026-02-28',
  },
  {
    id: 'gr-expedia', scope: 'global', name: 'EXPEDIA to OTA Commissions', source: 'both', priority: 4, status: 'active',
    conditions: [C('Description', 'Contains', 'EXPEDIA')], conditionLogic: 'all',
    actions: { setTransactionType: 'Expense', setVendorName: 'Expedia', setTemplateAccountCode: '6530', setCategoryName: 'Expedia Commission', setDepartment: 'Sales', receipt: 'not-required', approval: 'auto-categorize' },
    vendorHandling: 'use-existing', applyTo: 'future', createdBy: 'Sanjay Narsee', createdAt: '2026-01-16', updatedAt: '2026-02-28',
  },
  {
    id: 'gr-payroll', scope: 'global', name: 'PAYROLL ACH to Payroll Expense', source: 'bank', priority: 2, status: 'active',
    conditions: [C('Description', 'Contains', 'PAYROLL')], conditionLogic: 'all',
    actions: { setTransactionType: 'Payroll', setTemplateAccountCode: '6000', setCategoryName: 'Payroll Expenses', setDepartment: 'Admin', receipt: 'not-required', approval: 'auto-categorize' },
    vendorHandling: 'suggest-only', applyTo: 'future', createdBy: 'Sanjay Narsee', createdAt: '2026-01-10', updatedAt: '2026-01-10',
  },
  {
    id: 'gr-bankfee', scope: 'global', name: 'BANK SERVICE FEE to Bank Fees', source: 'bank', priority: 5, status: 'active',
    conditions: [C('Description', 'Contains', 'BANK SERVICE FEE')], conditionLogic: 'all',
    actions: { setTransactionType: 'Bank Fee', setTemplateAccountCode: '6650', setCategoryName: 'Bank Fees', setDepartment: 'Admin', receipt: 'not-required', approval: 'auto-categorize' },
    vendorHandling: 'suggest-only', applyTo: 'future', createdBy: 'Sanjay Narsee', createdAt: '2026-01-18', updatedAt: '2026-01-18',
  },
  {
    id: 'gr-georgia-power', scope: 'global', name: 'GEORGIA POWER to Utilities', source: 'bank', priority: 3, status: 'active',
    conditions: [C('Description', 'Contains', 'GEORGIA POWER')], conditionLogic: 'all',
    actions: { setTransactionType: 'Expense', setVendorName: 'Georgia Power', setTemplateAccountCode: '6310', setCategoryName: 'Electricity', setDepartment: 'Engineering', receipt: 'not-required', approval: 'auto-categorize' },
    vendorHandling: 'use-existing', applyTo: 'future', createdBy: 'Sanjay Narsee', createdAt: '2026-01-20', updatedAt: '2026-01-20',
  },
  {
    id: 'gr-amazon', scope: 'global', name: 'AMAZON to Office Supplies', source: 'both', priority: 6, status: 'active',
    conditions: [C('Description', 'Contains', 'AMAZON')], conditionLogic: 'all',
    actions: { setTransactionType: 'Expense', setVendorName: 'Amazon Business', setTemplateAccountCode: '6610', setCategoryName: 'Office Supplies', setDepartment: 'Admin', receipt: 'over-amount', receiptOver: 250, approval: 'auto-categorize' },
    vendorHandling: 'use-existing', applyTo: 'future', createdBy: 'Sanjay Narsee', createdAt: '2026-02-01', updatedAt: '2026-02-01',
  },
  {
    id: 'gr-stripe', scope: 'global', name: 'STRIPE PAYOUT to Room Revenue', source: 'bank', priority: 4, status: 'active',
    conditions: [C('Description', 'Contains', 'STRIPE'), C('Money Direction', 'Equals', 'Money In')], conditionLogic: 'all',
    actions: { setTransactionType: 'Revenue Deposit', setTemplateAccountCode: '4000', setCategoryName: 'Room Revenue', setDepartment: 'Front Office', receipt: 'not-required', approval: 'auto-categorize' },
    vendorHandling: 'suggest-only', applyTo: 'future', createdBy: 'Sanjay Narsee', createdAt: '2026-02-04', updatedAt: '2026-02-04',
  },
  {
    id: 'gr-linen-old', scope: 'global', name: 'LINEN SERVICE to Linen Expense', source: 'both', priority: 7, status: 'disabled',
    conditions: [C('Description', 'Contains', 'LINEN')], conditionLogic: 'all',
    actions: { setTransactionType: 'Expense', setVendorName: 'Linen Service', setTemplateAccountCode: '6150', setCategoryName: 'Linen Expense', setDepartment: 'Housekeeping', receipt: 'not-required', approval: 'suggest' },
    vendorHandling: 'use-existing', applyTo: 'future', createdBy: 'Sanjay Narsee', createdAt: '2025-12-20', updatedAt: '2026-03-01',
  },
];

// Hotel-level rules (override global for their hotel).
const HOTEL: RichRule[] = [
  {
    id: 'hr-cambria-amazon', scope: 'hotel_level', hotelId: 'GA989', name: 'Amazon to Guest Supplies for Cambria', source: 'both', priority: 1, status: 'active',
    conditions: [C('Description', 'Contains', 'AMAZON')], conditionLogic: 'all',
    actions: { setTransactionType: 'Expense', setVendorName: 'Amazon Business', setCategoryAccountCode: '6120', setCategoryName: 'Guest Supplies', setDepartment: 'Housekeeping', receipt: 'over-amount', receiptOver: 250, approval: 'auto-categorize' },
    vendorHandling: 'use-existing', applyTo: 'future', createdBy: 'Sanjay Narsee', createdAt: '2026-02-10', updatedAt: '2026-02-10',
  },
  {
    id: 'hr-btr-entergy', scope: 'hotel_level', hotelId: HOTEL_ENTITIES.find((h) => h.propertyCode.startsWith('BTR'))?.id ?? HOTEL_ENTITIES[5].id, name: 'Entergy to Utilities for BTRCI', source: 'bank', priority: 1, status: 'active',
    conditions: [C('Description', 'Contains', 'ENTERGY')], conditionLogic: 'all',
    actions: { setTransactionType: 'Expense', setVendorName: 'Entergy', setCategoryAccountCode: '6310', setCategoryName: 'Electricity', setDepartment: 'General', receipt: 'not-required', approval: 'auto-categorize' },
    vendorHandling: 'use-existing', applyTo: 'future', createdBy: 'Sanjay Narsee', createdAt: '2026-02-12', updatedAt: '2026-02-12',
  },
  {
    id: 'hr-savgw-hilton', scope: 'hotel_level', hotelId: 'SAVGW', name: 'Hilton Franchise Fee for SAVGW', source: 'both', priority: 1, status: 'active',
    conditions: [C('Description', 'Contains', 'HILTON')], conditionLogic: 'all',
    actions: { setTransactionType: 'Expense', setVendorName: 'Hilton Franchise Fee', setCategoryAccountCode: '6410', setCategoryName: 'Franchise Fees', setDepartment: 'General', receipt: 'not-required', approval: 'auto-categorize' },
    vendorHandling: 'use-existing', applyTo: 'future', createdBy: 'Sanjay Narsee', createdAt: '2026-02-14', updatedAt: '2026-02-14',
  },
  {
    id: 'hr-cambria-parking', scope: 'hotel_level', hotelId: 'GA989', name: 'Parking Deposit to Parking Revenue', source: 'bank', priority: 2, status: 'active',
    conditions: [C('Description', 'Contains', 'PARKING DEPOSIT'), C('Money Direction', 'Equals', 'Money In')], conditionLogic: 'all',
    actions: { setTransactionType: 'Revenue Deposit', setCategoryAccountCode: '4110', setCategoryName: 'Parking Revenue', setDepartment: 'Front Office', receipt: 'not-required', approval: 'auto-categorize' },
    vendorHandling: 'suggest-only', applyTo: 'future', createdBy: 'Sanjay Narsee', createdAt: '2026-02-16', updatedAt: '2026-02-16',
  },
  {
    id: 'hr-savvy-sysco', scope: 'hotel_level', hotelId: 'SAVVY', name: 'Sysco to Food Cost for Cotton Sail', source: 'both', priority: 1, status: 'active',
    conditions: [C('Description', 'Contains', 'SYSCO')], conditionLogic: 'all',
    actions: { setTransactionType: 'Expense', setVendorName: 'Sysco', setCategoryAccountCode: '5010', setCategoryName: 'Food Cost', setDepartment: 'Kitchen', receipt: 'over-amount', receiptOver: 500, approval: 'auto-categorize' },
    vendorHandling: 'use-existing', applyTo: 'future', createdBy: 'Sanjay Narsee', createdAt: '2026-03-01', updatedAt: '2026-03-01',
  },
  {
    id: 'hr-ga989-draft', scope: 'hotel_level', hotelId: 'GA989', name: 'Valet Tips Clearing (draft)', source: 'bank', priority: 5, status: 'draft',
    conditions: [C('Description', 'Contains', 'VALET')], conditionLogic: 'all',
    actions: { setTransactionType: 'Other', setDepartment: 'Front Office', approval: 'suggest' },
    vendorHandling: 'suggest-only', applyTo: 'future', createdBy: 'Sanjay Narsee', createdAt: '2026-03-10', updatedAt: '2026-03-10',
  },
];

export const SEED_RICH_RULES: RichRule[] = [...HOTEL, ...GLOBAL];

/* ── Portfolio-level headline numbers (across all 16 hotels) ──────────── */
export const RULES_PORTFOLIO = {
  total: 148,
  global: 42,
  hotelLevel: 106,
  active: 132,
  disabled: 16,
  suggested: 24,
  conflicts: 5,
  matchedThisMonth: 1842,
};

/** Does a transaction match a rule's primary description condition? */
export function txMatchesRule(rule: RichRule, tx: { description: string; source: string; amount: number; hotelId: string }): boolean {
  if (rule.scope === 'hotel_level' && rule.hotelId !== tx.hotelId) return false;
  if (rule.source !== 'both') {
    const txSource = tx.source === 'credit-card' ? 'credit_card' : 'bank';
    if (rule.source !== txSource) return false;
  }
  const results = rule.conditions.map((c) => matchCond(c, tx));
  return rule.conditionLogic === 'any' ? results.some(Boolean) : results.every(Boolean);
}

function matchCond(c: RuleCondition, tx: { description: string; amount: number }): boolean {
  const desc = tx.description.toUpperCase();
  const val = c.value.toUpperCase();
  switch (c.field) {
    case 'Description':
      if (c.operator === 'Contains') return desc.includes(val);
      if (c.operator === 'Does not contain') return !desc.includes(val);
      if (c.operator === 'Starts with') return desc.startsWith(val);
      if (c.operator === 'Ends with') return desc.endsWith(val);
      if (c.operator === 'Equals') return desc === val;
      return desc.includes(val);
    case 'Amount': {
      const n = Math.abs(tx.amount);
      if (c.operator === 'Greater than') return n > Number(c.value);
      if (c.operator === 'Less than') return n < Number(c.value);
      if (c.operator === 'Between') return n >= Number(c.value) && n <= Number(c.value2 ?? c.value);
      return n === Number(c.value);
    }
    case 'Money Direction':
      return c.value.toLowerCase().includes('in') ? tx.amount > 0 : tx.amount < 0;
    default:
      return true;
  }
}

/** All seed transactions a rule would match (across the portfolio). */
export function ruleMatches(rule: RichRule) {
  return ACCT_TRANSACTIONS.filter((t) => txMatchesRule(rule, t));
}
