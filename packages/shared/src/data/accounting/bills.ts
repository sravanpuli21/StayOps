import type { Bill, BillStatus } from '../../types/accounting';
import { HOTELS } from '../hotels';
import { VENDORS } from './vendors';

const TODAY = '2026-05-04';

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

function addDays(iso: string, days: number): string {
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + days));
  return dt.toISOString().slice(0, 10);
}

const BILL_VENDORS = VENDORS.filter((v) =>
  ['utility', 'food', 'maintenance', 'franchise', 'tech', 'insurance', 'tax', 'supplies'].includes(v.category),
);

export const BILLS: Bill[] = HOTELS.flatMap((hotel) => {
  const r = rng(hotel.id.charCodeAt(0) * 31337 + 3);
  const out: Bill[] = [];

  // ~4 open + 2 overdue + 8 paid per hotel
  for (let i = 0; i < 14; i++) {
    const v = BILL_VENDORS[Math.floor(r() * BILL_VENDORS.length)];
    const termsDays = v.terms === 'Due on Receipt' ? 0 : v.terms === 'Net 7' ? 7 : v.terms === 'Net 15' ? 15 : v.terms === 'Net 30' ? 30 : 60;
    const billDaysAgo = Math.floor(r() * 75);
    const billDateIso = addDays(TODAY, -billDaysAgo);
    const dueDateIso = addDays(billDateIso, termsDays);
    const amount = Math.round((250 + r() * 6800) * 100) / 100;

    let status: BillStatus = 'open';
    let paidIso: string | undefined;
    if (i < 8) {
      status = 'paid';
      paidIso = addDays(billDateIso, termsDays - 2 + Math.floor(r() * 5));
    } else if (dueDateIso < TODAY) {
      status = 'overdue';
    } else {
      status = 'open';
    }

    out.push({
      id: `bill-${hotel.id}-${i}`,
      hotelId: hotel.id,
      vendorId: v.id,
      billNumber: `INV-${1000 + i + (hotel.id.charCodeAt(0) % 100)}`,
      billDateIso,
      dueDateIso,
      amount,
      status,
      accountId: v.defaultAccountId,
      paidIso,
    });
  }
  return out;
});

export const daysOverdue = (bill: Bill, today = TODAY): number => {
  if (bill.status !== 'overdue') return 0;
  const [y1, m1, d1] = bill.dueDateIso.split('-').map(Number);
  const [y2, m2, d2] = today.split('-').map(Number);
  const due = Date.UTC(y1, m1 - 1, d1);
  const now = Date.UTC(y2, m2 - 1, d2);
  return Math.max(0, Math.round((now - due) / 86400000));
};
