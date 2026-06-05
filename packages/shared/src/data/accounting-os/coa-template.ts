/**
 * StayOps Accounting OS — Hotel Standard Chart of Accounts template.
 *
 * This is the full, deep account structure that gets applied to each hotel
 * entity. Every hotel has its OWN copy of these accounts (own balances, own
 * mappings) — this is only the template they start from. Kept separate from the
 * legacy simple `HOTEL_COA` (which the transaction seed/journal builder use by
 * account NAME) so neither breaks the other.
 */

export type CoaFullType =
  | 'Asset' | 'Liability' | 'Equity' | 'Revenue'
  | 'COGS' | 'Expense' | 'Other Income' | 'Other Expense';

export interface CoaTemplateAccount {
  code: string;
  name: string;
  type: CoaFullType;
  detailType: string;
  parent?: string;          // parent account code
  reportSection: string;
  isHeader?: boolean;       // grouping/parent account
  required?: boolean;       // part of the required setup
  systemLocked?: boolean;   // cannot delete / cannot change type
}

/** Accounts that are system-critical: cannot be deleted, type cannot change. */
export const SYSTEM_LOCKED_CODES = [
  '1010', '1020', '1030', '2100', '2210', '2220', '3010', '3020',
  '3100', '3200', '4000', '6210', '6650', '8010',
];

const SYS = (code: string) => SYSTEM_LOCKED_CODES.includes(code);

/** Report section a given account type rolls up into. */
export function reportSectionFor(type: CoaFullType, detailType?: string): string {
  switch (type) {
    case 'Asset': return ['Fixed Asset', 'Accumulated Depreciation', 'Other Asset'].includes(detailType ?? '') ? 'Fixed Assets' : 'Current Assets';
    case 'Liability': return ['Loan Payable', 'Long Term Liability'].includes(detailType ?? '') ? 'Long-Term Liabilities' : 'Current Liabilities';
    case 'Equity': return 'Equity';
    case 'Revenue': return 'Revenue';
    case 'COGS': return 'Cost of Goods Sold';
    case 'Expense': return 'Operating Expenses';
    case 'Other Income': return 'Other Income';
    case 'Other Expense': return 'Other Expenses';
  }
}

/** Detail type options per account type (drives the Add Account form). */
export const COA_DETAIL_TYPES: Record<CoaFullType, string[]> = {
  Asset: ['Bank', 'Accounts Receivable', 'Inventory', 'Prepaid Expense', 'Fixed Asset', 'Accumulated Depreciation', 'Other Current Asset', 'Other Asset'],
  Liability: ['Accounts Payable', 'Credit Card', 'Sales Tax Payable', 'Occupancy Tax Payable', 'Payroll Liability', 'Loan Payable', 'Due To Related Entity', 'Other Current Liability', 'Long Term Liability'],
  Equity: ['Owner Contribution', 'Owner Draw', 'Retained Earnings', 'Current Year Earnings', 'Distribution', 'Other Equity'],
  Revenue: ['Room Revenue', 'F&B Revenue', 'Event Revenue', 'Market Revenue', 'Parking Revenue', 'Pet Fees', 'Laundry Revenue', 'No Show Revenue', 'Cancellation Revenue', 'Misc Guest Revenue', 'Other Revenue'],
  COGS: ['Food Cost', 'Beverage Cost', 'Market Cost', 'Other Cost of Goods Sold'],
  Expense: ['Payroll', 'Housekeeping Supplies', 'Guest Supplies', 'Cleaning Supplies', 'Repairs and Maintenance', 'Engineering Supplies', 'Utilities', 'Internet and Cable', 'Insurance', 'Franchise Fees', 'OTA Commissions', 'Credit Card Processing Fees', 'Laundry', 'Linen', 'Pest Control', 'Landscaping', 'Security', 'Software', 'Accounting', 'Legal', 'Bank Fees', 'Office Supplies', 'Other Expense'],
  'Other Income': ['Interest Income', 'Other Income'],
  'Other Expense': ['Interest Expense', 'Depreciation', 'Amortization', 'Other Expense'],
};

export const COA_FULL_TYPES: CoaFullType[] = ['Asset', 'Liability', 'Equity', 'Revenue', 'COGS', 'Expense', 'Other Income', 'Other Expense'];

export const COA_TYPE_LABEL: Record<CoaFullType, string> = {
  Asset: 'Assets', Liability: 'Liabilities', Equity: 'Equity', Revenue: 'Revenue',
  COGS: 'Cost of Goods Sold', Expense: 'Expenses', 'Other Income': 'Other Income', 'Other Expense': 'Other Expenses',
};

// Compact builder: [code, name, detailType, parent?, isHeader?]
type Row = [string, string, string, string?, boolean?];
const A = (type: CoaFullType, rows: Row[]): CoaTemplateAccount[] =>
  rows.map(([code, name, detailType, parent, isHeader]) => ({
    code, name, type, detailType, parent, isHeader,
    reportSection: reportSectionFor(type, detailType),
    systemLocked: SYS(code),
    required: SYS(code) || !!isHeader,
  }));

export const COA_TEMPLATE: CoaTemplateAccount[] = [
  ...A('Asset', [
    ['1000', 'Bank Accounts', 'Bank', undefined, true],
    ['1010', 'Operating Checking', 'Bank', '1000'],
    ['1020', 'Payroll Checking', 'Bank', '1000'],
    ['1030', 'Reserve Account', 'Bank', '1000'],
    ['1040', 'Savings Account', 'Bank', '1000'],
    ['1100', 'Accounts Receivable', 'Accounts Receivable', undefined, true],
    ['1110', 'Guest Receivables', 'Accounts Receivable', '1100'],
    ['1120', 'OTA Receivables', 'Accounts Receivable', '1100'],
    ['1130', 'Credit Card Receivables', 'Accounts Receivable', '1100'],
    ['1200', 'Inventory', 'Inventory', undefined, true],
    ['1210', 'Market Inventory', 'Inventory', '1200'],
    ['1220', 'Food Inventory', 'Inventory', '1200'],
    ['1230', 'Beverage Inventory', 'Inventory', '1200'],
    ['1240', 'Operating Supplies Inventory', 'Inventory', '1200'],
    ['1300', 'Prepaid Expenses', 'Prepaid Expense', undefined, true],
    ['1310', 'Prepaid Insurance', 'Prepaid Expense', '1300'],
    ['1320', 'Prepaid Franchise Fees', 'Prepaid Expense', '1300'],
    ['1330', 'Prepaid Software', 'Prepaid Expense', '1300'],
    ['1340', 'Deposits', 'Other Current Asset', '1300'],
    ['1500', 'Fixed Assets', 'Fixed Asset', undefined, true],
    ['1510', 'Furniture and Fixtures', 'Fixed Asset', '1500'],
    ['1520', 'Equipment', 'Fixed Asset', '1500'],
    ['1530', 'Building Improvements', 'Fixed Asset', '1500'],
    ['1540', 'Vehicles', 'Fixed Asset', '1500'],
    ['1550', 'Computer and Technology Equipment', 'Fixed Asset', '1500'],
    ['1590', 'Accumulated Depreciation', 'Accumulated Depreciation', '1500'],
  ]),
  ...A('Liability', [
    ['2000', 'Accounts Payable', 'Accounts Payable'],
    ['2100', 'Credit Cards Payable', 'Credit Card', undefined, true],
    ['2110', 'Corporate Card Payable', 'Credit Card', '2100'],
    ['2120', 'GM Card Payable', 'Credit Card', '2100'],
    ['2200', 'Taxes Payable', 'Other Current Liability', undefined, true],
    ['2210', 'Sales Tax Payable', 'Sales Tax Payable', '2200'],
    ['2220', 'Occupancy Tax Payable', 'Occupancy Tax Payable', '2200'],
    ['2230', 'Tourism Tax Payable', 'Other Current Liability', '2200'],
    ['2240', 'State Tax Payable', 'Other Current Liability', '2200'],
    ['2300', 'Payroll Liabilities', 'Payroll Liability', undefined, true],
    ['2310', 'Payroll Taxes Payable', 'Payroll Liability', '2300'],
    ['2320', 'Employee Benefits Payable', 'Payroll Liability', '2300'],
    ['2330', 'Accrued Payroll', 'Payroll Liability', '2300'],
    ['2400', 'Loans Payable', 'Loan Payable', undefined, true],
    ['2410', 'Mortgage Loan Payable', 'Loan Payable', '2400'],
    ['2420', 'Equipment Loan Payable', 'Loan Payable', '2400'],
    ['2430', 'Vehicle Loan Payable', 'Loan Payable', '2400'],
    ['2440', 'Line of Credit', 'Loan Payable', '2400'],
    ['2500', 'Related Party Liabilities', 'Due To Related Entity', undefined, true],
    ['2510', 'Due To Management Company', 'Due To Related Entity', '2500'],
    ['2520', 'Due To Related Entity', 'Due To Related Entity', '2500'],
    ['2530', 'Due To Owner', 'Due To Related Entity', '2500'],
    ['2600', 'Accrued Expenses', 'Other Current Liability', undefined, true],
    ['2610', 'Accrued Utilities', 'Other Current Liability', '2600'],
    ['2620', 'Accrued Franchise Fees', 'Other Current Liability', '2600'],
    ['2630', 'Accrued Interest', 'Other Current Liability', '2600'],
  ]),
  ...A('Equity', [
    ['3000', 'Owner Equity', 'Other Equity', undefined, true],
    ['3010', 'Owner Contribution', 'Owner Contribution', '3000'],
    ['3020', 'Owner Draw', 'Owner Draw', '3000'],
    ['3030', 'Owner Distribution', 'Distribution', '3000'],
    ['3100', 'Retained Earnings', 'Retained Earnings'],
    ['3200', 'Current Year Earnings', 'Current Year Earnings'],
  ]),
  ...A('Revenue', [
    ['4000', 'Room Revenue', 'Room Revenue', undefined, true],
    ['4010', 'Transient Room Revenue', 'Room Revenue', '4000'],
    ['4020', 'Group Room Revenue', 'Room Revenue', '4000'],
    ['4030', 'Corporate Room Revenue', 'Room Revenue', '4000'],
    ['4040', 'Extended Stay Revenue', 'Room Revenue', '4000'],
    ['4100', 'Other Guest Revenue', 'Misc Guest Revenue', undefined, true],
    ['4110', 'Parking Revenue', 'Parking Revenue', '4100'],
    ['4120', 'Pet Fee Revenue', 'Pet Fees', '4100'],
    ['4130', 'Laundry Revenue', 'Laundry Revenue', '4100'],
    ['4140', 'Market Revenue', 'Market Revenue', '4100'],
    ['4150', 'Late Checkout Revenue', 'Misc Guest Revenue', '4100'],
    ['4160', 'Early Check-In Revenue', 'Misc Guest Revenue', '4100'],
    ['4170', 'No Show Revenue', 'No Show Revenue', '4100'],
    ['4180', 'Cancellation Revenue', 'Cancellation Revenue', '4100'],
    ['4190', 'Miscellaneous Guest Revenue', 'Misc Guest Revenue', '4100'],
    ['4200', 'Food and Beverage Revenue', 'F&B Revenue', undefined, true],
    ['4210', 'Restaurant Revenue', 'F&B Revenue', '4200'],
    ['4220', 'Bar Revenue', 'F&B Revenue', '4200'],
    ['4230', 'Banquet Revenue', 'F&B Revenue', '4200'],
    ['4240', 'Catering Revenue', 'F&B Revenue', '4200'],
    ['4300', 'Other Operating Revenue', 'Other Revenue', undefined, true],
    ['4310', 'Meeting Room Revenue', 'Event Revenue', '4300'],
    ['4320', 'Resort Fee Revenue', 'Other Revenue', '4300'],
    ['4330', 'Service Charge Revenue', 'Other Revenue', '4300'],
  ]),
  ...A('COGS', [
    ['5000', 'Cost of Goods Sold', 'Other Cost of Goods Sold', undefined, true],
    ['5010', 'Food Cost', 'Food Cost', '5000'],
    ['5020', 'Beverage Cost', 'Beverage Cost', '5000'],
    ['5030', 'Market Cost of Goods Sold', 'Market Cost', '5000'],
  ]),
  ...A('Expense', [
    ['6000', 'Payroll Expenses', 'Payroll', undefined, true],
    ['6010', 'Management Payroll', 'Payroll', '6000'],
    ['6020', 'Front Office Payroll', 'Payroll', '6000'],
    ['6030', 'Housekeeping Payroll', 'Payroll', '6000'],
    ['6040', 'Engineering Payroll', 'Payroll', '6000'],
    ['6050', 'Kitchen Payroll', 'Payroll', '6000'],
    ['6060', 'Payroll Taxes', 'Payroll', '6000'],
    ['6070', 'Employee Benefits', 'Payroll', '6000'],
    ['6080', 'Contract Labor', 'Payroll', '6000'],
    ['6100', 'Housekeeping Expenses', 'Housekeeping Supplies', undefined, true],
    ['6110', 'Housekeeping Supplies', 'Housekeeping Supplies', '6100'],
    ['6120', 'Guest Supplies', 'Guest Supplies', '6100'],
    ['6130', 'Cleaning Supplies', 'Cleaning Supplies', '6100'],
    ['6140', 'Laundry Expense', 'Laundry', '6100'],
    ['6150', 'Linen Expense', 'Linen', '6100'],
    ['6160', 'Uniforms', 'Housekeeping Supplies', '6100'],
    ['6200', 'Engineering and Maintenance', 'Repairs and Maintenance', undefined, true],
    ['6210', 'Repairs and Maintenance', 'Repairs and Maintenance', '6200'],
    ['6220', 'Engineering Supplies', 'Engineering Supplies', '6200'],
    ['6230', 'Small Tools and Equipment', 'Engineering Supplies', '6200'],
    ['6240', 'HVAC Repairs', 'Repairs and Maintenance', '6200'],
    ['6250', 'Plumbing Repairs', 'Repairs and Maintenance', '6200'],
    ['6260', 'Electrical Repairs', 'Repairs and Maintenance', '6200'],
    ['6270', 'Elevator Maintenance', 'Repairs and Maintenance', '6200'],
    ['6300', 'Utilities', 'Utilities', undefined, true],
    ['6310', 'Electricity', 'Utilities', '6300'],
    ['6320', 'Gas', 'Utilities', '6300'],
    ['6330', 'Water and Sewer', 'Utilities', '6300'],
    ['6340', 'Trash Removal', 'Utilities', '6300'],
    ['6350', 'Internet and Cable', 'Internet and Cable', '6300'],
    ['6360', 'Telephone', 'Internet and Cable', '6300'],
    ['6400', 'Franchise and Brand Expenses', 'Franchise Fees', undefined, true],
    ['6410', 'Franchise Fees', 'Franchise Fees', '6400'],
    ['6420', 'Brand Marketing Fees', 'Franchise Fees', '6400'],
    ['6430', 'Reservation Fees', 'Franchise Fees', '6400'],
    ['6440', 'Loyalty Program Fees', 'Franchise Fees', '6400'],
    ['6450', 'Quality Assurance Fees', 'Franchise Fees', '6400'],
    ['6500', 'Sales and Marketing', 'OTA Commissions', undefined, true],
    ['6510', 'OTA Commissions', 'OTA Commissions', '6500'],
    ['6520', 'Booking.com Commission', 'OTA Commissions', '6500'],
    ['6530', 'Expedia Commission', 'OTA Commissions', '6500'],
    ['6540', 'Advertising', 'Other Expense', '6500'],
    ['6550', 'Digital Marketing', 'Other Expense', '6500'],
    ['6560', 'Travel Agent Commission', 'OTA Commissions', '6500'],
    ['6600', 'Administrative and General', 'Office Supplies', undefined, true],
    ['6610', 'Office Supplies', 'Office Supplies', '6600'],
    ['6620', 'Software Subscriptions', 'Software', '6600'],
    ['6630', 'Accounting Fees', 'Accounting', '6600'],
    ['6640', 'Legal Fees', 'Legal', '6600'],
    ['6650', 'Bank Fees', 'Bank Fees', '6600'],
    ['6660', 'Credit Card Processing Fees', 'Credit Card Processing Fees', '6600'],
    ['6670', 'Licenses and Permits', 'Other Expense', '6600'],
    ['6680', 'Postage and Printing', 'Office Supplies', '6600'],
    ['6700', 'Property Operations', 'Insurance', undefined, true],
    ['6710', 'Insurance', 'Insurance', '6700'],
    ['6720', 'Property Tax', 'Other Expense', '6700'],
    ['6730', 'Pest Control', 'Pest Control', '6700'],
    ['6740', 'Landscaping', 'Landscaping', '6700'],
    ['6750', 'Security', 'Security', '6700'],
    ['6760', 'Fire Safety', 'Other Expense', '6700'],
    ['6770', 'Waste Management', 'Other Expense', '6700'],
    ['6800', 'Food and Beverage Expenses', 'Other Expense', undefined, true],
    ['6810', 'Kitchen Supplies', 'Other Expense', '6800'],
    ['6820', 'Restaurant Supplies', 'Other Expense', '6800'],
    ['6830', 'Bar Supplies', 'Other Expense', '6800'],
    ['6840', 'Menu and Printing', 'Other Expense', '6800'],
    ['6850', 'F&B Equipment Repairs', 'Repairs and Maintenance', '6800'],
    ['6900', 'Other Operating Expenses', 'Other Expense', undefined, true],
    ['6910', 'Travel Expense', 'Other Expense', '6900'],
    ['6920', 'Meals and Entertainment', 'Other Expense', '6900'],
    ['6930', 'Training', 'Other Expense', '6900'],
    ['6940', 'Dues and Subscriptions', 'Other Expense', '6900'],
    ['6990', 'Miscellaneous Expense', 'Other Expense', '6900'],
  ]),
  ...A('Other Income', [
    ['7000', 'Other Income', 'Other Income', undefined, true],
    ['7010', 'Interest Income', 'Interest Income', '7000'],
    ['7020', 'Insurance Proceeds', 'Other Income', '7000'],
    ['7030', 'Rebate Income', 'Other Income', '7000'],
    ['7040', 'Vendor Refunds', 'Other Income', '7000'],
  ]),
  ...A('Other Expense', [
    ['8000', 'Other Expenses', 'Other Expense', undefined, true],
    ['8010', 'Interest Expense', 'Interest Expense', '8000'],
    ['8020', 'Depreciation Expense', 'Depreciation', '8000'],
    ['8030', 'Amortization Expense', 'Amortization', '8000'],
    ['8040', 'Gain or Loss on Asset Disposal', 'Other Expense', '8000'],
    ['8050', 'Prior Period Adjustment', 'Other Expense', '8000'],
  ]),
];

export const TEMPLATE_ACCOUNT_COUNT = COA_TEMPLATE.length;

/** Counts of accounts by type — drives the template summary card. */
export function coaTemplateSummary() {
  const by = (t: CoaFullType) => COA_TEMPLATE.filter((a) => a.type === t).length;
  return {
    total: COA_TEMPLATE.length,
    assets: by('Asset'),
    liabilities: by('Liability'),
    equity: by('Equity'),
    revenue: by('Revenue'),
    cogs: by('COGS'),
    expenses: by('Expense'),
    otherIncome: by('Other Income'),
    otherExpense: by('Other Expense'),
    required: COA_TEMPLATE.filter((a) => a.required).length,
    system: COA_TEMPLATE.filter((a) => a.systemLocked).length,
  };
}

/** The COA templates Sanjay can choose from (one real, others as variants). */
export interface CoaTemplateMeta {
  id: string;
  name: string;
  hotelType: string;
  accounts: number;
  appliedHotels: number;
  lastUpdated: string;
  status: 'active' | 'draft' | 'archived';
  primary?: boolean;
}
export const COA_TEMPLATES: CoaTemplateMeta[] = [
  { id: 'hotel-standard', name: 'Hotel Standard COA', hotelType: 'All Hotel Types', accounts: COA_TEMPLATE.length, appliedHotels: 14, lastUpdated: '2026-04-18', status: 'active', primary: true },
  { id: 'limited-service', name: 'Limited Service Hotel COA', hotelType: 'Limited Service', accounts: 112, appliedHotels: 0, lastUpdated: '2026-03-02', status: 'draft' },
  { id: 'full-service', name: 'Full Service Hotel COA', hotelType: 'Full Service', accounts: 168, appliedHotels: 0, lastUpdated: '2026-03-02', status: 'draft' },
  { id: 'extended-stay', name: 'Extended Stay Hotel COA', hotelType: 'Extended Stay', accounts: 121, appliedHotels: 0, lastUpdated: '2026-02-10', status: 'draft' },
];
