import { ACCT_VENDOR_RECORDS } from '@hos/shared/accounting-os';
export { bankMappingRows, cardMappingRows, accountsForHotel, type MappingRow } from '../../_coa';

/** Vendor default mapping rows for the given hotels (hotel-specific vendors). */
export function vendorMapStub(hotelIds: string[]): Array<{ vendor: string; hotelId: string; category: string; department: string; status: 'mapped' | 'missing' | 'needs-review' }> {
  return ACCT_VENDOR_RECORDS
    .filter((v) => hotelIds.includes(v.hotelId))
    .slice(0, 16)
    .map((v) => ({
      vendor: v.name,
      hotelId: v.hotelId,
      category: v.defaultCategory ?? 'Not set',
      department: v.defaultDepartment ?? 'Not set',
      status: v.defaultCategory ? 'mapped' : 'missing',
    }));
}
