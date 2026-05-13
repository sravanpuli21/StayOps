import type { DailyMetrics, RevenueSummary } from '../types/metrics';
import { REVENUE_DATA } from './revenue';
import { DAILY_METRICS } from './daily-metrics';

/**
 * Deterministic 90-day daily series per hotel, ending at the frozen-today
 * window. The baseline for each hotel comes from REVENUE_DATA + DAILY_METRICS
 * (their single "yesterday" snapshot), then we apply a seeded daily jitter
 * (±8% revenue, ±3pp occupancy) and a weekly cycle so dashboards have real
 * movement when the user picks "week", "month", or "YTD".
 *
 * Fully generated at module load — no DB required, repeatable across server
 * restarts so mock aggregators produce stable numbers.
 */

export const SERIES_END_DATE   = '2026-05-12';   // matches STAYOPS_FROZEN_TODAY
export const SERIES_DAYS       = 150;            // big enough for YTD in mock mode

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

function seededJitter(seed: string, spread: number): number {
  // Returns a value in [1 - spread, 1 + spread]
  const h = hash(seed);
  return 1 + ((h % 1000) / 1000 - 0.5) * 2 * spread;
}

function isoAddDays(iso: string, n: number): string {
  const d = new Date(iso + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

// Weekly cycle: Fri/Sat high, Mon/Tue low. Index: 0=Sun ... 6=Sat
const WEEKLY_MULT = [0.95, 0.88, 0.90, 0.94, 0.98, 1.09, 1.12];

function weekdayOf(iso: string): number {
  return new Date(iso + 'T00:00:00Z').getUTCDay();
}

export interface DailyRevenueRow {
  hotelId: string;
  date: string;
  roomRevenue: number;
  nonRoomRevenue: number;
  totalRevenue: number;
  occupancyPct: number;   // that day's occupancy
  adr: number;            // that day's ADR
  marketAdr: number;
  roomsSold: number;
}

export interface DailyOccupancyRow {
  hotelId: string;
  date: string;
  roomsSold: number;
  roomsOoo: number;
  occupancyPct: number;
  avgCustomerRating: number;
}

function generate() {
  const revRows: DailyRevenueRow[] = [];
  const dayRows: DailyOccupancyRow[] = [];

  for (let i = SERIES_DAYS - 1; i >= 0; i--) {
    const date = isoAddDays(SERIES_END_DATE, -i);
    const weekday = weekdayOf(date);
    const weeklyMult = WEEKLY_MULT[weekday];

    for (const base of REVENUE_DATA) {
      const dailyJitter = seededJitter(`${base.hotelId}-${date}`, 0.08);
      const occJitter   = seededJitter(`occ-${base.hotelId}-${date}`, 0.04);
      const occ = Math.max(0, Math.min(100, base.occupancyPct * weeklyMult * occJitter));
      const roomsSold = Math.round(base.totalRevenue / Math.max(base.adr, 1) * weeklyMult * dailyJitter);
      const totalRev = Math.round(base.totalRevenue * weeklyMult * dailyJitter);
      const roomRev  = Math.round(base.roomRevenue  * weeklyMult * dailyJitter);
      const nonRoom  = Math.round(base.nonRoomRevenue * weeklyMult * dailyJitter);
      const adr      = Math.round(base.adr * dailyJitter);

      revRows.push({
        hotelId: base.hotelId,
        date,
        roomRevenue: roomRev,
        nonRoomRevenue: nonRoom,
        totalRevenue: totalRev,
        occupancyPct: occ,
        adr,
        marketAdr: base.marketAdr,
        roomsSold,
      });

      const baseDm = DAILY_METRICS.find((d) => d.hotelId === base.hotelId);
      const ooo = baseDm ? Math.max(0, Math.round(baseDm.roomsOoo * seededJitter(`ooo-${base.hotelId}-${date}`, 0.6))) : 0;
      const rating = baseDm ? baseDm.avgCustomerRating + (seededJitter(`rating-${base.hotelId}-${date}`, 0.04) - 1) : 4.0;

      dayRows.push({
        hotelId: base.hotelId,
        date,
        roomsSold,
        roomsOoo: ooo,
        occupancyPct: occ,
        avgCustomerRating: Math.max(1, Math.min(5, rating)),
      });
    }
  }

  return { revRows, dayRows };
}

const { revRows, dayRows } = generate();

export const DAILY_REVENUE_SERIES: DailyRevenueRow[]   = revRows;
export const DAILY_OCCUPANCY_SERIES: DailyOccupancyRow[] = dayRows;

/** Baseline snapshot accessor — reshapes a single daily row back to the
 *  existing RevenueSummary shape if a caller wants it. Used rarely. */
export function baselineFor(hotelId: string): RevenueSummary | undefined {
  return REVENUE_DATA.find((r) => r.hotelId === hotelId);
}

/** Pass-through: tells TS `DailyMetrics` can be constructed from a
 *  DailyOccupancyRow — keeps the types aligned for aggregators. */
export type { DailyMetrics };
