import { HOTEL_COA, DEPARTMENTS } from '@hos/shared/accounting-os';

export const EXPENSE_CATS = HOTEL_COA.filter((a) => a.type === 'Expense' || a.type === 'COGS' || a.type === 'Revenue').map((a) => a.name);
export const DEPTS = [...DEPARTMENTS];
export const VENDOR_TYPE_OPTIONS = ['Supplier', 'Utility', 'Franchise', 'OTA', 'Service Provider', 'Government', 'Insurance', 'Bank', 'Owner', 'Software', 'Food Supplier', 'Laundry', 'Housekeeping', 'Other'] as const;
