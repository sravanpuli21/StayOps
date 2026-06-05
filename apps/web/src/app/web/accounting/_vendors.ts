import { ACCT_VENDOR_RECORDS, type AcctVendorRecord } from '@hos/shared/accounting-os';
import type { VendorRecord } from './_store';

interface StoreLike {
  newVendors: VendorRecord[];
  vendorEdits: Record<string, Partial<VendorRecord>>;
  mergedVendors: string[];
}

/** All vendor records (seed + created), edits applied, merged ones hidden. */
export function allVendors(store: StoreLike): AcctVendorRecord[] {
  const created: AcctVendorRecord[] = store.newVendors.map((v) => ({
    id: v.id, hotelId: v.hotelId, name: v.name, legalName: v.legalName,
    type: (v.type as any) || 'Supplier', defaultCategory: v.defaultCategory,
    defaultDepartment: v.defaultDepartment as any, email: v.email, phone: v.phone,
    status: (v.status as any) || 'active', createdFrom: (v.createdFrom as any) || 'Manual',
    spendMonth: 0, spendLastMonth: 0, spendYtd: 0, txCount: 0, missingReceipts: 0, ruleCount: 0, lastUsed: '2026-05-01',
  }));
  return [...created, ...ACCT_VENDOR_RECORDS]
    .filter((v) => !store.mergedVendors.includes(v.id))
    .map((v) => {
      const e = store.vendorEdits[v.id];
      return e ? { ...v, ...e } as AcctVendorRecord : v;
    });
}

export function vendorsForHotelLive(store: StoreLike, hotelId: string): AcctVendorRecord[] {
  return allVendors(store).filter((v) => v.hotelId === hotelId);
}
export function oneVendor(store: StoreLike, id: string): AcctVendorRecord | undefined {
  return allVendors(store).find((v) => v.id === id);
}

/** Duplicate suggestions WITHIN the same hotel only (normalized name match). */
export function duplicateGroups(store: StoreLike): Array<{ hotelId: string; a: AcctVendorRecord; b: AcctVendorRecord; reason: string }> {
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z]/g, '').replace(/^the/, '');
  const out: Array<{ hotelId: string; a: AcctVendorRecord; b: AcctVendorRecord; reason: string }> = [];
  const byHotel = new Map<string, AcctVendorRecord[]>();
  for (const v of allVendors(store)) { const arr = byHotel.get(v.hotelId) ?? []; arr.push(v); byHotel.set(v.hotelId, arr); }
  for (const [hotelId, vs] of byHotel) {
    for (let i = 0; i < vs.length; i++) for (let j = i + 1; j < vs.length; j++) {
      if (norm(vs[i].name) === norm(vs[j].name)) out.push({ hotelId, a: vs[i], b: vs[j], reason: 'Same vendor name' });
    }
  }
  return out;
}
