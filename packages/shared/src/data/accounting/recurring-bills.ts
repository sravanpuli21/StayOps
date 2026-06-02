import { HOTELS } from '../hotels';

export type RecurringFrequency = 'monthly' | 'quarterly' | 'annual' | 'biweekly';

export interface RecurringBill {
  id: string;
  hotelId: string;
  vendorId: string;
  category: string;
  frequency: RecurringFrequency;
  expectedAmount: number;
  expectedDay: number;          // day of month
  variancePct: number;          // alert threshold
  lastPaidIso?: string;
  lastPaidAmount?: number;
  status: 'on-track' | 'missing' | 'over-budget' | 'duplicate-charge';
  active: boolean;
}

const TEMPLATES: Array<Omit<RecurringBill, 'id' | 'hotelId' | 'lastPaidIso' | 'lastPaidAmount' | 'status'>> = [
  { vendorId: 'v-georgia-power',  category: 'Utilities · Electric', frequency: 'monthly', expectedAmount: 4200, expectedDay: 12, variancePct: 15, active: true },
  { vendorId: 'v-comcast',        category: 'IT & Telecom',         frequency: 'monthly', expectedAmount: 850,  expectedDay: 5,  variancePct: 5,  active: true },
  { vendorId: 'v-state-farm',     category: 'Insurance',            frequency: 'monthly', expectedAmount: 1900, expectedDay: 1,  variancePct: 3,  active: true },
  { vendorId: 'v-orkin',          category: 'R&M · Pest Control',   frequency: 'monthly', expectedAmount: 220,  expectedDay: 15, variancePct: 10, active: true },
  { vendorId: 'v-otis',           category: 'R&M · Elevator',       frequency: 'quarterly', expectedAmount: 1450, expectedDay: 20, variancePct: 8,  active: true },
  { vendorId: 'v-hilton-franchise', category: 'Mgmt & Franchise Fees', frequency: 'monthly', expectedAmount: 6800, expectedDay: 8, variancePct: 5, active: true },
  { vendorId: 'v-cintas',         category: 'Linen Service',        frequency: 'monthly', expectedAmount: 2100, expectedDay: 22, variancePct: 12, active: true },
  { vendorId: 'v-waste-mgmt',     category: 'Utilities · Waste',    frequency: 'monthly', expectedAmount: 480,  expectedDay: 25, variancePct: 8,  active: true },
];

function statusFor(idx: number, hotelIdx: number): RecurringBill['status'] {
  // Sprinkle realistic alerts: some missing, some over-budget, mostly on-track
  if (idx === 0 && hotelIdx % 5 === 0) return 'over-budget';
  if (idx === 1 && hotelIdx % 7 === 0) return 'missing';
  if (idx === 6 && hotelIdx % 9 === 0) return 'duplicate-charge';
  return 'on-track';
}

export const RECURRING_BILLS: RecurringBill[] = HOTELS.flatMap((hotel, hIdx) =>
  TEMPLATES.map((t, i) => {
    const status = statusFor(i, hIdx);
    return {
      id: `rec-${hotel.id}-${i}`,
      hotelId: hotel.id,
      ...t,
      lastPaidIso: status === 'missing' ? undefined : '2026-04-' + String(t.expectedDay).padStart(2, '0'),
      lastPaidAmount: status === 'missing' ? undefined :
        status === 'over-budget' ? Math.round(t.expectedAmount * 1.32 * 100) / 100 :
        status === 'duplicate-charge' ? t.expectedAmount * 2 :
        t.expectedAmount,
      status,
    };
  }),
);
