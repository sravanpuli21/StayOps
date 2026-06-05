/**
 * StayOps Accounting OS — VENDORS (V1: hotel-entity-level only).
 *
 * Every vendor record belongs to ONE hotel entity. The same vendor name (e.g.
 * "Home Depot") can exist under multiple hotels as SEPARATE records. There is no
 * global shared vendor in V1 — cross-hotel merge is not allowed.
 */
import { HOTEL_ENTITIES } from './entities';
import type { Department } from './coa';

export type VendorType =
  | 'Supplier' | 'Utility' | 'Franchise' | 'OTA' | 'Service Provider' | 'Government'
  | 'Insurance' | 'Bank' | 'Owner' | 'Employee' | 'Software' | 'Maintenance'
  | 'Food Supplier' | 'Laundry' | 'Housekeeping' | 'Other';

export type VendorStatus = 'active' | 'needs-review' | 'inactive' | 'duplicate' | 'archived';
export type CreatedFrom = 'Manual' | 'Transaction Review' | 'Import Suggestion' | 'Rule';

export interface AcctVendorRecord {
  id: string;                 // unique per (hotel, vendor)
  hotelId: string;
  name: string;
  legalName?: string;
  type: VendorType;
  defaultCategory?: string;
  defaultDepartment?: Department;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
  status: VendorStatus;
  createdFrom: CreatedFrom;
  spendMonth: number;
  spendLastMonth: number;
  spendYtd: number;
  txCount: number;
  missingReceipts: number;
  ruleCount: number;
  lastUsed: string;           // ISO
}

/** Per-hotel vendor "menu" with typical defaults. Each hotel gets its own records. */
const COMMON: Array<{ name: string; type: VendorType; category: string; dept: Department }> = [
  { name: 'Home Depot', type: 'Supplier', category: 'Repairs & Maintenance', dept: 'Engineering' },
  { name: "Lowe's", type: 'Supplier', category: 'Repairs & Maintenance', dept: 'Engineering' },
  { name: 'Comcast Business', type: 'Utility', category: 'Internet & Cable', dept: 'General' },
  { name: 'Amazon Business', type: 'Supplier', category: 'Guest Supplies', dept: 'Housekeeping' },
  { name: 'Office Depot', type: 'Supplier', category: 'Office Supplies', dept: 'Admin' },
  { name: 'Pest Control Vendor', type: 'Service Provider', category: 'Pest Control', dept: 'General' },
  { name: 'Landscaping Service', type: 'Service Provider', category: 'Landscaping', dept: 'General' },
  { name: 'Linen Service', type: 'Laundry', category: 'Linen Expense', dept: 'Housekeeping' },
];
// State-specific utility + OTA + food, so hotels look realistic.
const STATE_POWER: Record<string, string> = { GA: 'Georgia Power', FL: 'Florida Power & Light', TX: 'Oncor Electric', LA: 'Entergy' };
const BRAND_FRANCHISE = (name: string) => /hilton|hampton|home2|cambria|garden|tribute|tru/i.test(name) ? 'Hilton Franchise Fee'
  : /marriott|courtyard|residence|fairfield|four points|towneplace/i.test(name) ? 'Marriott Franchise Fee'
  : /holiday inn|ihg/i.test(name) ? 'IHG Franchise Fee'
  : /la quinta|woodspring|wyndham/i.test(name) ? 'Wyndham Franchise Fee' : 'Franchise Fee';

function seeded(seed: number) { let s = (seed >>> 0) || 3; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 0xffffffff; }; }

export const ACCT_VENDOR_RECORDS: AcctVendorRecord[] = HOTEL_ENTITIES.flatMap((h) => {
  const r = seeded(h.propertyCode.charCodeAt(0) * 17 + h.rooms);
  const list: Array<{ name: string; type: VendorType; category: string; dept: Department }> = [
    ...COMMON,
    { name: STATE_POWER[h.state] ?? 'Electric Utility', type: 'Utility', category: 'Utilities', dept: 'General' },
    { name: BRAND_FRANCHISE(h.hotelName), type: 'Franchise', category: 'Franchise Fees', dept: 'General' },
    { name: r() > 0.5 ? 'Sysco' : 'US Foods', type: 'Food Supplier', category: 'Food Supplies', dept: 'Kitchen' },
    { name: r() > 0.5 ? 'Booking.com' : 'Expedia', type: 'OTA', category: 'OTA Commissions', dept: 'Sales' },
  ];
  return list.map((v, i) => {
    const month = Math.round((300 + r() * 12_000));
    const lastMonth = Math.round(month * (0.7 + r() * 0.7));
    // A few records intentionally missing defaults / needing review for the demo.
    const missingInfo = i % 9 === 4;
    return {
      id: `vr-${h.id}-${i}`,
      hotelId: h.id,
      name: v.name,
      type: v.type,
      defaultCategory: missingInfo ? undefined : v.category,
      defaultDepartment: missingInfo ? undefined : v.dept,
      status: missingInfo ? 'needs-review' : 'active',
      createdFrom: i < 4 ? 'Transaction Review' : 'Manual',
      spendMonth: month,
      spendLastMonth: lastMonth,
      spendYtd: month * (3 + (i % 5)),
      txCount: 1 + Math.floor(r() * 18),
      missingReceipts: r() > 0.7 ? Math.floor(r() * 4) : 0,
      ruleCount: r() > 0.6 ? 1 : 0,
      lastUsed: `2026-05-${String(1 + Math.floor(r() * 27)).padStart(2, '0')}`,
    } as AcctVendorRecord;
  });
});

export const vendorsForHotel = (hotelId: string) => ACCT_VENDOR_RECORDS.filter((v) => v.hotelId === hotelId);
export const getVendorRecord = (id: string) => ACCT_VENDOR_RECORDS.find((v) => v.id === id);

export const VENDOR_TYPES: VendorType[] = ['Supplier', 'Utility', 'Franchise', 'OTA', 'Service Provider', 'Government', 'Insurance', 'Bank', 'Owner', 'Employee', 'Software', 'Maintenance', 'Food Supplier', 'Laundry', 'Housekeeping', 'Other'];

/** Portfolio rollups for the all-hotels overview. */
export const VENDOR_STATS = {
  totalRecords: ACCT_VENDOR_RECORDS.length,
  active: ACCT_VENDOR_RECORDS.filter((v) => v.status === 'active').length,
  missingInfo: ACCT_VENDOR_RECORDS.filter((v) => !v.defaultCategory || !v.defaultDepartment).length,
};
