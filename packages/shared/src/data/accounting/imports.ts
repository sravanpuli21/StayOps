import type { BankImportRow, CreditCardImportRow, PayrollImportRow, OtaRemittanceRow } from '../../types/accounting';
import { HOTELS } from '../hotels';
import { VENDORS } from './vendors';

// Deterministic seeded RNG so the demo data is identical on every reload.
function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

function isoDate(y: number, m: number, d: number): string {
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

// Generate dates across a 3-month window ending 2026-05-04 (matches FROZEN_TODAY of demo).
const WINDOW_DAYS = 92;
const TODAY_Y = 2026;
const TODAY_M = 5;
const TODAY_D = 4;

function dateOffset(daysBack: number): string {
  // Compute date by stepping back through fixed month lengths for the demo window.
  const months: Array<[number, number]> = [
    [2026, 5], [2026, 4], [2026, 3], [2026, 2],
  ];
  const lens = [31, 30, 31, 28];
  let remaining = daysBack;
  let dayOfMonth = TODAY_D;
  let mIdx = 0;
  while (remaining > 0) {
    if (remaining < dayOfMonth) {
      dayOfMonth -= remaining;
      remaining = 0;
    } else {
      remaining -= dayOfMonth;
      mIdx += 1;
      dayOfMonth = lens[mIdx];
    }
  }
  const [y, m] = months[mIdx];
  return isoDate(y, m, Math.max(1, dayOfMonth));
}

// ---- BANK IMPORTS ---------------------------------------------------------

const BANK_VENDORS = VENDORS.filter((v) =>
  ['utility', 'food', 'supplies', 'maintenance', 'insurance', 'tax', 'franchise', 'tech'].includes(v.category),
);

export const BANK_IMPORT_ROWS: BankImportRow[] = HOTELS.flatMap((hotel) => {
  const r = rng(hotel.id.charCodeAt(0) * 7919 + 11);
  let balance = 50000 + Math.floor(r() * 40000);
  const out: BankImportRow[] = [];

  // ~30 transactions per hotel over 3 months
  for (let i = 0; i < 30; i++) {
    const daysBack = Math.floor(r() * WINDOW_DAYS);
    const isDeposit = r() < 0.35;
    if (isDeposit) {
      const amount = Math.round((4000 + r() * 18000) * 100) / 100;
      balance += amount;
      out.push({
        id: `bk-${hotel.id}-${i}`,
        bankAccountId: `bank-${hotel.id}-ops`,
        hotelId: hotel.id,
        dateIso: dateOffset(daysBack),
        description: `Deposit – Daily settlement ${dateOffset(daysBack)}`,
        amount,
        runningBalance: balance,
        matchedTxId: i % 4 === 0 ? null : `tx-${hotel.id}-bk-${i}`,
      });
    } else {
      const v = BANK_VENDORS[Math.floor(r() * BANK_VENDORS.length)];
      const amount = -Math.round((150 + r() * 4800) * 100) / 100;
      balance += amount;
      out.push({
        id: `bk-${hotel.id}-${i}`,
        bankAccountId: `bank-${hotel.id}-ops`,
        hotelId: hotel.id,
        dateIso: dateOffset(daysBack),
        description: `${v.name} – ACH payment`,
        amount,
        runningBalance: balance,
        matchedTxId: i % 5 === 0 ? null : `tx-${hotel.id}-bk-${i}`,
      });
    }
  }
  return out.sort((a, b) => (a.dateIso > b.dateIso ? -1 : 1));
});

// ---- CREDIT CARD IMPORTS --------------------------------------------------

const CC_VENDORS = VENDORS.filter((v) =>
  ['supplies', 'food', 'tech', 'maintenance'].includes(v.category),
);

export const CC_IMPORT_ROWS: CreditCardImportRow[] = HOTELS.flatMap((hotel) => {
  const r = rng(hotel.id.charCodeAt(0) * 104729 + 41);
  const out: CreditCardImportRow[] = [];
  for (let i = 0; i < 18; i++) {
    const daysBack = Math.floor(r() * WINDOW_DAYS);
    const v = CC_VENDORS[Math.floor(r() * CC_VENDORS.length)];
    const amount = Math.round((40 + r() * 800) * 100) / 100;
    out.push({
      id: `cc-${hotel.id}-${i}`,
      bankAccountId: `bank-${hotel.id}-cc`,
      hotelId: hotel.id,
      dateIso: dateOffset(daysBack),
      description: `${v.name.toUpperCase()} ${daysBack < 14 ? 'PENDING' : ''}`.trim(),
      amount,
      cardLast4: String(2000 + (hotel.id.charCodeAt(0) * 13) % 8000).slice(-4),
      matchedTxId: i % 6 === 0 ? null : `tx-${hotel.id}-cc-${i}`,
    });
  }
  return out.sort((a, b) => (a.dateIso > b.dateIso ? -1 : 1));
});

// ---- PAYROLL IMPORTS ------------------------------------------------------

const SAMPLE_NAMES = [
  'Maria Garcia', 'James Wilson', 'Aisha Patel', 'Robert Chen', 'Linda Rodriguez',
  'David Kim', 'Sarah Thompson', 'Carlos Martinez', 'Jennifer Lee', 'Michael Brown',
];

export const PAYROLL_IMPORT_ROWS: PayrollImportRow[] = HOTELS.flatMap((hotel) => {
  const r = rng(hotel.id.charCodeAt(0) * 99991 + 7);
  const out: PayrollImportRow[] = [];
  // 6 biweekly periods × 8 employees per hotel = 48 rows/hotel
  const periods = ['2026-02-15', '2026-03-01', '2026-03-15', '2026-04-01', '2026-04-15', '2026-04-30'];
  for (const periodEnd of periods) {
    for (let e = 0; e < 8; e++) {
      const name = SAMPLE_NAMES[(hotel.id.charCodeAt(0) + e) % SAMPLE_NAMES.length];
      const department: PayrollImportRow['department'] =
        e < 3 ? 'rooms' : e < 5 ? 'fb' : e < 7 ? 'maintenance' : 'admin';
      const gross = Math.round((1100 + r() * 1400) * 100) / 100;
      const taxes = Math.round(gross * 0.18 * 100) / 100;
      const employerTaxes = Math.round(gross * 0.085 * 100) / 100;
      out.push({
        id: `pr-${hotel.id}-${periodEnd}-${e}`,
        hotelId: hotel.id,
        periodEndIso: periodEnd,
        employeeName: name,
        department,
        gross,
        taxes,
        netPay: Math.round((gross - taxes) * 100) / 100,
        employerTaxes,
      });
    }
  }
  return out;
});

// ---- OTA REMITTANCES ------------------------------------------------------

const OTAS: Array<'Expedia' | 'Booking.com' | 'Agoda'> = ['Expedia', 'Booking.com', 'Agoda'];

export const OTA_REMITTANCE_ROWS: OtaRemittanceRow[] = HOTELS.flatMap((hotel) => {
  const r = rng(hotel.id.charCodeAt(0) * 7549 + 19);
  const out: OtaRemittanceRow[] = [];
  // ~3 months × 3 OTAs × ~4 weekly remittances ≈ 12 rows/hotel
  for (let i = 0; i < 12; i++) {
    const daysBack = Math.floor(r() * WINDOW_DAYS);
    const ota = OTAS[i % OTAS.length];
    const reservationCount = 4 + Math.floor(r() * 18);
    const grossBookings = Math.round((reservationCount * (140 + r() * 80)) * 100) / 100;
    const commissionRate = ota === 'Expedia' ? 0.18 : ota === 'Booking.com' ? 0.16 : 0.17;
    const commission = Math.round(grossBookings * commissionRate * 100) / 100;
    const taxesCollected = Math.round(grossBookings * 0.13 * 100) / 100;
    const netPayout = Math.round((grossBookings - commission) * 100) / 100;
    out.push({
      id: `ota-${hotel.id}-${i}`,
      hotelId: hotel.id,
      dateIso: dateOffset(daysBack),
      otaName: ota,
      reservationCount,
      grossBookings,
      commission,
      taxesCollected,
      netPayout,
      matchedTxId: i % 5 === 0 ? null : `tx-${hotel.id}-ota-${i}`,
    });
  }
  return out.sort((a, b) => (a.dateIso > b.dateIso ? -1 : 1));
});
