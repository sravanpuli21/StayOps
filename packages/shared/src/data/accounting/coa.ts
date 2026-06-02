import type { ChartOfAccount } from '../../types/accounting';

export const CHART_OF_ACCOUNTS: ChartOfAccount[] = [
  // 1xxx Assets
  { id: 'acc-1010', number: '1010', name: 'Cash – Operating',           type: 'asset', usaliDept: 'balance-sheet' },
  { id: 'acc-1020', number: '1020', name: 'Cash – Reserve / FF&E',      type: 'asset', usaliDept: 'balance-sheet' },
  { id: 'acc-1100', number: '1100', name: 'Accounts Receivable',        type: 'asset', usaliDept: 'balance-sheet' },
  { id: 'acc-1200', number: '1200', name: 'Inventory – F&B',            type: 'asset', usaliDept: 'balance-sheet' },
  { id: 'acc-1210', number: '1210', name: 'Inventory – Operating Supplies', type: 'asset', usaliDept: 'balance-sheet' },
  { id: 'acc-1500', number: '1500', name: 'Property, Plant & Equipment',type: 'asset', usaliDept: 'balance-sheet' },

  // 2xxx Liabilities
  { id: 'acc-2010', number: '2010', name: 'Accounts Payable',           type: 'liability', usaliDept: 'balance-sheet' },
  { id: 'acc-2050', number: '2050', name: 'Credit Card Payable',        type: 'liability', usaliDept: 'balance-sheet' },
  { id: 'acc-2100', number: '2100', name: 'Accrued Payroll',            type: 'liability', usaliDept: 'balance-sheet' },
  { id: 'acc-2110', number: '2110', name: 'Payroll Taxes Payable',      type: 'liability', usaliDept: 'balance-sheet' },
  { id: 'acc-2200', number: '2200', name: 'Sales Tax Payable',          type: 'liability', usaliDept: 'balance-sheet' },
  { id: 'acc-2210', number: '2210', name: 'Occupancy Tax Payable',      type: 'liability', usaliDept: 'balance-sheet' },
  { id: 'acc-2500', number: '2500', name: 'Mortgage Payable',           type: 'liability', usaliDept: 'balance-sheet' },

  // 3xxx Equity
  { id: 'acc-3000', number: '3000', name: 'Owner Equity',               type: 'equity', usaliDept: 'balance-sheet' },
  { id: 'acc-3100', number: '3100', name: 'Retained Earnings',          type: 'equity', usaliDept: 'balance-sheet' },

  // 4xxx Revenue
  { id: 'acc-4100', number: '4100', name: 'Rooms Revenue',              type: 'revenue', usaliDept: 'rooms' },
  { id: 'acc-4110', number: '4110', name: 'Allowances & Adjustments',   type: 'revenue', usaliDept: 'rooms' },
  { id: 'acc-4200', number: '4200', name: 'F&B Revenue – Restaurant',   type: 'revenue', usaliDept: 'fb' },
  { id: 'acc-4210', number: '4210', name: 'F&B Revenue – Banquet',      type: 'revenue', usaliDept: 'fb' },
  { id: 'acc-4220', number: '4220', name: 'F&B Revenue – Mini-bar',     type: 'revenue', usaliDept: 'fb' },
  { id: 'acc-4300', number: '4300', name: 'Other Operated Revenue',     type: 'revenue', usaliDept: 'other-op' },
  { id: 'acc-4310', number: '4310', name: 'Parking Revenue',            type: 'revenue', usaliDept: 'other-op' },
  { id: 'acc-4320', number: '4320', name: 'Telephone Revenue',          type: 'revenue', usaliDept: 'other-op' },

  // 5xxx Departmental Expenses
  { id: 'acc-5100', number: '5100', name: 'Rooms – Wages & Benefits',   type: 'expense', usaliDept: 'rooms' },
  { id: 'acc-5110', number: '5110', name: 'Rooms – Linen',              type: 'expense', usaliDept: 'rooms' },
  { id: 'acc-5120', number: '5120', name: 'Rooms – Guest Supplies',     type: 'expense', usaliDept: 'rooms' },
  { id: 'acc-5130', number: '5130', name: 'Rooms – Cleaning Supplies',  type: 'expense', usaliDept: 'rooms' },
  { id: 'acc-5210', number: '5210', name: 'Rooms – OTA Commission',     type: 'expense', usaliDept: 'rooms' },
  { id: 'acc-5220', number: '5220', name: 'Rooms – Travel Agent Commission', type: 'expense', usaliDept: 'rooms' },
  { id: 'acc-5300', number: '5300', name: 'F&B – Wages & Benefits',     type: 'expense', usaliDept: 'fb' },
  { id: 'acc-5310', number: '5310', name: 'F&B – Cost of Sales',        type: 'expense', usaliDept: 'fb' },
  { id: 'acc-5320', number: '5320', name: 'F&B – Supplies',             type: 'expense', usaliDept: 'fb' },
  { id: 'acc-5400', number: '5400', name: 'Other Op – Wages',           type: 'expense', usaliDept: 'other-op' },

  // 6xxx Undistributed Operating
  { id: 'acc-6100', number: '6100', name: 'A&G – Wages & Benefits',     type: 'expense', usaliDept: 'undistributed' },
  { id: 'acc-6110', number: '6110', name: 'A&G – Office Supplies',      type: 'expense', usaliDept: 'undistributed' },
  { id: 'acc-6120', number: '6120', name: 'A&G – Bank & Credit Card Fees', type: 'expense', usaliDept: 'undistributed' },
  { id: 'acc-6200', number: '6200', name: 'IT & Telecom',               type: 'expense', usaliDept: 'undistributed' },
  { id: 'acc-6300', number: '6300', name: 'Sales & Marketing',          type: 'expense', usaliDept: 'undistributed' },
  { id: 'acc-6400', number: '6400', name: 'Utilities – Electric',       type: 'expense', usaliDept: 'undistributed' },
  { id: 'acc-6410', number: '6410', name: 'Utilities – Gas',            type: 'expense', usaliDept: 'undistributed' },
  { id: 'acc-6420', number: '6420', name: 'Utilities – Water & Sewer',  type: 'expense', usaliDept: 'undistributed' },
  { id: 'acc-6430', number: '6430', name: 'Utilities – Waste',          type: 'expense', usaliDept: 'undistributed' },
  { id: 'acc-6500', number: '6500', name: 'Repairs & Maintenance',      type: 'expense', usaliDept: 'undistributed' },

  // 7xxx Fixed Charges
  { id: 'acc-7100', number: '7100', name: 'Property Tax',               type: 'expense', usaliDept: 'fixed' },
  { id: 'acc-7200', number: '7200', name: 'Insurance',                  type: 'expense', usaliDept: 'fixed' },
  { id: 'acc-7300', number: '7300', name: 'Mgmt & Franchise Fees',      type: 'expense', usaliDept: 'fixed' },
  { id: 'acc-7400', number: '7400', name: 'Lease / Rent',               type: 'expense', usaliDept: 'fixed' },

  // 8xxx Non-Operating
  { id: 'acc-8100', number: '8100', name: 'Interest Expense',           type: 'expense', usaliDept: 'non-op' },
  { id: 'acc-8200', number: '8200', name: 'Depreciation',               type: 'expense', usaliDept: 'non-op' },
];

export const ACCOUNT_BY_ID = new Map(CHART_OF_ACCOUNTS.map((a) => [a.id, a]));
export const getAccountById = (id: string) => ACCOUNT_BY_ID.get(id);
