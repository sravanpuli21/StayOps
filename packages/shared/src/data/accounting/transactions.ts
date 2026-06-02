import type { LedgerTransaction } from '../../types/accounting';
import { BANK_IMPORT_ROWS, CC_IMPORT_ROWS, OTA_REMITTANCE_ROWS, PAYROLL_IMPORT_ROWS } from './imports';
import { VENDORS } from './vendors';

// Match a free-text description to a vendor by case-insensitive substring of the vendor name.
const NAME_INDEX = VENDORS.map((v) => ({ id: v.id, low: v.name.toLowerCase(), defaultAccountId: v.defaultAccountId }));
function matchVendor(description: string): { vendorId?: string; accountId?: string } {
  const d = description.toLowerCase();
  for (const v of NAME_INDEX) {
    if (d.includes(v.low)) return { vendorId: v.id, accountId: v.defaultAccountId };
  }
  return {};
}

// Bank imports → ledger rows (deposits credit Rooms Revenue, payments debit vendor's default acct)
const FROM_BANK: LedgerTransaction[] = BANK_IMPORT_ROWS
  .filter((r) => r.matchedTxId !== null)
  .map((r) => {
    if (r.amount > 0) {
      return {
        id: `tx-${r.id}`,
        hotelId: r.hotelId,
        dateIso: r.dateIso,
        accountId: 'acc-4100',
        amount: r.amount,
        memo: r.description,
        source: 'bank' as const,
        sourceRowId: r.id,
        reconciledIso: r.dateIso < '2026-05-01' ? '2026-04-30' : null,
      };
    }
    const { vendorId, accountId } = matchVendor(r.description);
    return {
      id: `tx-${r.id}`,
      hotelId: r.hotelId,
      dateIso: r.dateIso,
      accountId: accountId ?? 'acc-6500',
      vendorId,
      amount: r.amount,
      memo: r.description,
      source: 'bank' as const,
      sourceRowId: r.id,
      reconciledIso: r.dateIso < '2026-05-01' ? '2026-04-30' : null,
    };
  });

const FROM_CC: LedgerTransaction[] = CC_IMPORT_ROWS
  .filter((r) => r.matchedTxId !== null)
  .map((r) => {
    const { vendorId, accountId } = matchVendor(r.description);
    return {
      id: `tx-${r.id}`,
      hotelId: r.hotelId,
      dateIso: r.dateIso,
      accountId: accountId ?? 'acc-6500',
      vendorId,
      amount: -r.amount,                // CC charge is an expense (negative cash impact)
      memo: r.description,
      source: 'cc' as const,
      sourceRowId: r.id,
      reconciledIso: r.dateIso < '2026-05-01' ? '2026-04-30' : null,
    };
  });

// OTA remittances split into 3 ledger lines: gross revenue (+), commission expense (-), tax payable (-)
const FROM_OTA: LedgerTransaction[] = OTA_REMITTANCE_ROWS
  .filter((r) => r.matchedTxId !== null)
  .flatMap((r) => [
    {
      id: `tx-${r.id}-rev`,
      hotelId: r.hotelId,
      dateIso: r.dateIso,
      accountId: 'acc-4100',
      amount: r.grossBookings,
      memo: `${r.otaName} – ${r.reservationCount} reservations · gross`,
      source: 'ota' as const,
      sourceRowId: r.id,
    },
    {
      id: `tx-${r.id}-com`,
      hotelId: r.hotelId,
      dateIso: r.dateIso,
      accountId: 'acc-5210',
      vendorId: r.otaName === 'Expedia' ? 'v-expedia' : r.otaName === 'Booking.com' ? 'v-booking' : 'v-agoda',
      amount: -r.commission,
      memo: `${r.otaName} – commission`,
      source: 'ota' as const,
      sourceRowId: r.id,
    },
    {
      id: `tx-${r.id}-tax`,
      hotelId: r.hotelId,
      dateIso: r.dateIso,
      accountId: 'acc-2210',
      amount: -r.taxesCollected,
      memo: `${r.otaName} – occupancy tax collected`,
      source: 'ota' as const,
      sourceRowId: r.id,
    },
  ]);

// Payroll: gross to wages by department, employer taxes to payroll-tax expense (rolled into wages)
function payrollAccount(dept: 'rooms' | 'fb' | 'maintenance' | 'admin'): string {
  if (dept === 'rooms') return 'acc-5100';
  if (dept === 'fb') return 'acc-5300';
  if (dept === 'maintenance') return 'acc-6500';
  return 'acc-6100';
}

const FROM_PAYROLL: LedgerTransaction[] = PAYROLL_IMPORT_ROWS.map((r) => ({
  id: `tx-${r.id}`,
  hotelId: r.hotelId,
  dateIso: r.periodEndIso,
  accountId: payrollAccount(r.department),
  amount: -(r.gross + r.employerTaxes),
  memo: `Payroll · ${r.employeeName} · period ${r.periodEndIso}`,
  source: 'payroll' as const,
  sourceRowId: r.id,
  reconciledIso: r.periodEndIso < '2026-05-01' ? '2026-04-30' : null,
}));

// Split parents are added downstream by accounting/splits.ts to avoid a circular import.
export const LEDGER_TRANSACTIONS: LedgerTransaction[] = [
  ...FROM_BANK,
  ...FROM_CC,
  ...FROM_OTA,
  ...FROM_PAYROLL,
].sort((a, b) => (a.dateIso > b.dateIso ? -1 : 1));
