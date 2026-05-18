import { REVENUE_DATA } from './revenue';

export type MixBucket = 'room' | 'fb' | 'retail' | 'events' | 'other';

export interface MixLine {
  chargeType: string;
  bucket: MixBucket;
  amount: number;
}

export interface MixBucketBreakdown {
  bucket: MixBucket;
  label: string;
  total: number;
  lines: MixLine[];
}

export const MIX_BUCKET_LABELS: Record<MixBucket, string> = {
  room:   'Rooms',
  fb:     'Restaurant',
  retail: 'Market',
  events: 'Events',
  other:  'Other',
};

/**
 * Canonical mapping: OnQ / PMS charge type → revenue-mix bucket.
 * Mirrors the user's explicit ask (breakfast → F&B, meeting hall → events,
 * room upgrade → rooms, laundry / pet / cleaning / late checkout / early
 * arrival / valet parking / cancellation → other, etc.).
 */
export const CHARGE_TO_BUCKET: Record<string, MixBucket> = {
  // Rooms
  'Guest Room':                         'room',
  'Guest Room Honors':                  'room',
  'Room Upgrade':                       'room',
  'No Show Room Revenue':               'room',
  'Late Cancel Room Revenue':           'room',

  // F&B
  'Add-on Breakfast':                   'fb',
  'Suite Shop Food':                    'fb',
  'Suite Shop Beverage':                'fb',

  // Retail
  'Suite Shop Sundry':                  'retail',
  'Suite Shop Video':                   'retail',

  // Events
  'Meeting Room':                       'events',

  // Other
  'Pet Fee':                            'other',
  'Cleaning Fee':                       'other',
  'Cancellation Charge':                'other',
  'Late Check Out Charges':             'other',
  'Late Departure':                     'other',
  'Early Departure Fee':                'other',
  'Early Arrival':                      'other',
  'Add-on Early Arrival':               'other',
  'Valet Parking':                      'other',
  'Add-on Valet Parking':               'other',
  'Self Parking':                       'other',
  'Coin Laundry':                       'other',
  'Valet Laundry':                      'other',
  'Premium Internet Access':            'other',
  'Telephone-LD':                       'other',
  'Vending Machine Revenue':            'other',
  'Misc Revenue':                       'other',
};

/**
 * Per-bucket line-item distribution. Percentages sum to 1.0 per bucket.
 * Real data would come from PMS charge-line ingestion; this mock distribution
 * lets the drill-down show realistic line-item totals derived from each
 * hotel's existing `revenueMix` aggregate in REVENUE_DATA.
 */
const BUCKET_DISTRIBUTION: Record<MixBucket, Array<{ chargeType: string; pct: number }>> = {
  room: [
    { chargeType: 'Guest Room',                 pct: 0.87 },
    { chargeType: 'Guest Room Honors',          pct: 0.08 },
    { chargeType: 'Room Upgrade',               pct: 0.02 },
    { chargeType: 'No Show Room Revenue',       pct: 0.02 },
    { chargeType: 'Late Cancel Room Revenue',   pct: 0.01 },
  ],
  fb: [
    { chargeType: 'Suite Shop Food',            pct: 0.44 },
    { chargeType: 'Suite Shop Beverage',        pct: 0.46 },
    { chargeType: 'Add-on Breakfast',           pct: 0.10 },
  ],
  retail: [
    { chargeType: 'Suite Shop Sundry',          pct: 0.92 },
    { chargeType: 'Suite Shop Video',           pct: 0.08 },
  ],
  events: [
    { chargeType: 'Meeting Room',               pct: 1.00 },
  ],
  other: [
    { chargeType: 'Pet Fee',                    pct: 0.22 },
    { chargeType: 'Cleaning Fee',               pct: 0.14 },
    { chargeType: 'Valet Parking',              pct: 0.14 },
    { chargeType: 'Cancellation Charge',        pct: 0.11 },
    { chargeType: 'Late Check Out Charges',     pct: 0.09 },
    { chargeType: 'Premium Internet Access',    pct: 0.08 },
    { chargeType: 'Coin Laundry',               pct: 0.07 },
    { chargeType: 'Early Arrival',              pct: 0.05 },
    { chargeType: 'Vending Machine Revenue',    pct: 0.05 },
    { chargeType: 'Telephone-LD',               pct: 0.03 },
    { chargeType: 'Misc Revenue',               pct: 0.02 },
  ],
};

/**
 * Return the five-bucket mix breakdown for a single hotel, with per-bucket
 * line items. Amounts roll up to each bucket's total in REVENUE_DATA,
 * scaled by the optional period multiplier (1 = one day / "yesterday").
 */
export function getMixBreakdownForHotel(hotelId: string, multiplier = 1): MixBucketBreakdown[] {
  const rev = REVENUE_DATA.find((r) => r.hotelId === hotelId);
  if (!rev) return [];

  const totals: Record<MixBucket, number> = {
    room:   Math.round(rev.revenueMix.room   * multiplier),
    fb:     Math.round(rev.revenueMix.fb     * multiplier),
    retail: Math.round(rev.revenueMix.retail * multiplier),
    events: Math.round(rev.revenueMix.events * multiplier),
    other:  Math.round(rev.revenueMix.other  * multiplier),
  };

  const buckets: MixBucket[] = ['room', 'fb', 'retail', 'events', 'other'];
  return buckets.map((bucket) => {
    const total = totals[bucket];
    const dist = BUCKET_DISTRIBUTION[bucket];
    // Distribute with rounding, fixing any rounding drift into the largest line.
    const lines: MixLine[] = dist.map((d) => ({
      chargeType: d.chargeType,
      bucket,
      amount: Math.round(total * d.pct),
    }));
    const drift = total - lines.reduce((s, l) => s + l.amount, 0);
    if (lines.length > 0 && drift !== 0) {
      const largest = lines.reduce((a, b) => (a.amount > b.amount ? a : b));
      largest.amount += drift;
    }
    return { bucket, label: MIX_BUCKET_LABELS[bucket], total, lines };
  });
}

/**
 * Aggregate the mix breakdown across multiple hotels — same bucket totals
 * summed, same line-item charge types summed across the set.
 * Multiplier scales each hotel's totals by the active date period.
 */
export function aggregateMixBreakdown(hotelIds: string[], multiplier = 1): MixBucketBreakdown[] {
  const buckets: MixBucket[] = ['room', 'fb', 'retail', 'events', 'other'];
  return buckets.map((bucket) => {
    const perHotel = hotelIds.map((id) => getMixBreakdownForHotel(id, multiplier).find((b) => b.bucket === bucket));
    const total = perHotel.reduce((s, b) => s + (b?.total ?? 0), 0);
    const linesByCharge = new Map<string, number>();
    for (const pb of perHotel) {
      if (!pb) continue;
      for (const line of pb.lines) {
        linesByCharge.set(line.chargeType, (linesByCharge.get(line.chargeType) ?? 0) + line.amount);
      }
    }
    const lines: MixLine[] = Array.from(linesByCharge.entries())
      .map(([chargeType, amount]) => ({ chargeType, bucket, amount }))
      .sort((a, b) => b.amount - a.amount);
    return { bucket, label: MIX_BUCKET_LABELS[bucket], total, lines };
  });
}
