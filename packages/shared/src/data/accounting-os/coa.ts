/**
 * Standard Hotel Chart of Accounts — applied as a template to every entity.
 * Simple, operator-friendly account names.
 */
export type AcctType = 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense' | 'COGS';

export interface CoaAccount {
  code: string;
  name: string;
  type: AcctType;
  detailType?: string;
  parent?: string;
}

export const HOTEL_COA: CoaAccount[] = [
  // Assets
  { code: '1000', name: 'Bank Accounts', type: 'Asset', detailType: 'Bank' },
  { code: '1010', name: 'Operating Checking', type: 'Asset', detailType: 'Bank', parent: '1000' },
  { code: '1020', name: 'Payroll Checking', type: 'Asset', detailType: 'Bank', parent: '1000' },
  { code: '1030', name: 'Reserve Account', type: 'Asset', detailType: 'Bank', parent: '1000' },
  { code: '1100', name: 'Accounts Receivable', type: 'Asset', detailType: 'A/R' },
  { code: '1200', name: 'Inventory', type: 'Asset', detailType: 'Current Asset' },
  { code: '1300', name: 'Prepaid Expenses', type: 'Asset', detailType: 'Current Asset' },
  { code: '1500', name: 'Furniture & Fixtures', type: 'Asset', detailType: 'Fixed Asset' },
  { code: '1510', name: 'Equipment', type: 'Asset', detailType: 'Fixed Asset' },
  { code: '1520', name: 'Building Improvements', type: 'Asset', detailType: 'Fixed Asset' },
  { code: '1590', name: 'Accumulated Depreciation', type: 'Asset', detailType: 'Fixed Asset' },
  // Liabilities
  { code: '2000', name: 'Accounts Payable', type: 'Liability', detailType: 'A/P' },
  { code: '2100', name: 'Credit Cards Payable', type: 'Liability', detailType: 'Credit Card' },
  { code: '2200', name: 'Sales Tax Payable', type: 'Liability' },
  { code: '2210', name: 'Occupancy Tax Payable', type: 'Liability' },
  { code: '2300', name: 'Payroll Liabilities', type: 'Liability' },
  { code: '2400', name: 'Loan Payable', type: 'Liability', detailType: 'Long Term' },
  { code: '2500', name: 'Due To Related Entity', type: 'Liability' },
  // Equity
  { code: '3000', name: 'Owner Contribution', type: 'Equity' },
  { code: '3100', name: 'Owner Draw', type: 'Equity' },
  { code: '3200', name: 'Retained Earnings', type: 'Equity' },
  { code: '3300', name: 'Current Year Earnings', type: 'Equity' },
  // Revenue
  { code: '4000', name: 'Room Revenue', type: 'Revenue' },
  { code: '4010', name: 'F&B Revenue', type: 'Revenue' },
  { code: '4020', name: 'Parking Revenue', type: 'Revenue' },
  { code: '4030', name: 'Pet Fees', type: 'Revenue' },
  { code: '4040', name: 'Laundry Revenue', type: 'Revenue' },
  { code: '4050', name: 'Cancellation Revenue', type: 'Revenue' },
  { code: '4060', name: 'No Show Revenue', type: 'Revenue' },
  { code: '4070', name: 'Market Revenue', type: 'Revenue' },
  { code: '4080', name: 'Misc Guest Revenue', type: 'Revenue' },
  // Expenses
  { code: '5000', name: 'Payroll Expense', type: 'Expense' },
  { code: '5100', name: 'Housekeeping Supplies', type: 'Expense' },
  { code: '5110', name: 'Guest Supplies', type: 'Expense' },
  { code: '5120', name: 'Cleaning Supplies', type: 'Expense' },
  { code: '5200', name: 'Repairs & Maintenance', type: 'Expense' },
  { code: '5210', name: 'Engineering Supplies', type: 'Expense' },
  { code: '5300', name: 'Laundry Expense', type: 'Expense' },
  { code: '5310', name: 'Linen Expense', type: 'Expense' },
  { code: '5400', name: 'Utilities', type: 'Expense' },
  { code: '5410', name: 'Internet & Cable', type: 'Expense' },
  { code: '5500', name: 'Franchise Fees', type: 'Expense' },
  { code: '5510', name: 'OTA Commissions', type: 'Expense' },
  { code: '5520', name: 'Credit Card Processing Fees', type: 'Expense' },
  { code: '5600', name: 'Insurance', type: 'Expense' },
  { code: '5610', name: 'Property Tax', type: 'Expense' },
  { code: '5700', name: 'Pest Control', type: 'Expense' },
  { code: '5710', name: 'Landscaping', type: 'Expense' },
  { code: '5720', name: 'Security', type: 'Expense' },
  { code: '5800', name: 'Software Subscriptions', type: 'Expense' },
  { code: '5810', name: 'Accounting Fees', type: 'Expense' },
  { code: '5820', name: 'Legal Fees', type: 'Expense' },
  { code: '5900', name: 'Bank Fees', type: 'Expense' },
  { code: '5910', name: 'Office Supplies', type: 'Expense' },
];

export const COA_TYPES: AcctType[] = ['Asset', 'Liability', 'Equity', 'Revenue', 'Expense', 'COGS'];

export const DEPARTMENTS = [
  'Front Office', 'Housekeeping', 'Engineering', 'Kitchen', 'Laundry', 'Sales', 'Admin', 'Ownership', 'General',
] as const;
export type Department = typeof DEPARTMENTS[number];

/** Vendor name → suggested {category account name, department}. Drives auto-categorization. */
export const VENDOR_SUGGESTIONS: Record<string, { category: string; department: Department }> = {
  'HOME DEPOT':           { category: 'Repairs & Maintenance', department: 'Engineering' },
  'LOWES':                { category: 'Repairs & Maintenance', department: 'Engineering' },
  'US FOODS':             { category: 'F&B Revenue', department: 'Kitchen' },
  'SYSCO':                { category: 'F&B Revenue', department: 'Kitchen' },
  'COMCAST':              { category: 'Internet & Cable', department: 'Admin' },
  'GEORGIA POWER':        { category: 'Utilities', department: 'Engineering' },
  'WATER UTILITY':        { category: 'Utilities', department: 'Engineering' },
  'HILTON FRANCHISE FEE': { category: 'Franchise Fees', department: 'Admin' },
  'MARRIOTT FRANCHISE FEE': { category: 'Franchise Fees', department: 'Admin' },
  'BOOKING.COM':          { category: 'OTA Commissions', department: 'Sales' },
  'EXPEDIA':              { category: 'OTA Commissions', department: 'Sales' },
  'STRIPE PAYOUT':        { category: 'Room Revenue', department: 'Front Office' },
  'PMS DEPOSIT':          { category: 'Room Revenue', department: 'Front Office' },
  'PAYROLL ACH':          { category: 'Payroll Expense', department: 'Admin' },
  'INSURANCE PAYMENT':    { category: 'Insurance', department: 'Admin' },
  'PEST CONTROL':         { category: 'Pest Control', department: 'Engineering' },
  'LANDSCAPING SERVICE':  { category: 'Landscaping', department: 'Engineering' },
  'LINEN SERVICE':        { category: 'Linen Expense', department: 'Housekeeping' },
  'OFFICE DEPOT':         { category: 'Office Supplies', department: 'Admin' },
  'AMAZON BUSINESS':      { category: 'Guest Supplies', department: 'Housekeeping' },
};

export const VENDOR_NAMES = Object.keys(VENDOR_SUGGESTIONS);
