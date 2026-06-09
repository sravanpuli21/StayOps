/**
 * Deterministic mock metrics — the Phase-1 demo data layer.
 *
 * The regional dashboards (Harshal) read revenue / labour / daily rows from the
 * Postgres API. In local dev / a fresh deploy the DB is empty, so those screens
 * have nothing to show and can't react to the hotel + date filters. This module
 * synthesizes realistic per-hotel, per-DAY numbers from the seeded baselines,
 * so every hotel × date-range combination produces believable, self-consistent
 * figures with NO backend.
 *
 * Design rules:
 *  - Deterministic: same (hotel, date) → same numbers, every render. No RNG.
 *  - Per-day: a window is the SUM of its days (revenue, rooms, hours, payroll)
 *    while ratios (occupancy %, ADR, CSAT) are room-night weighted averages —
 *    so "Today" < "This Week" < "MTD" < "YTD" naturally, and a single day on a
 *    weekend reads differently from a Tuesday.
 *  - Anchored to the seeded baseline so a hotel's character (a strong ADR house
 *    vs a budget one) carries through.
 */
import { REVENUE_DATA } from './revenue';
import { HOTELS } from './hotels';
import type {
  ApiRevenueSummary, ApiLabourMetrics, ApiDailyMetrics, RevenueAgg,
  ApiRevenueBreakdown,
} from '../api';

type DeptName = 'Housekeeping' | 'Front Desk' | 'Maintenance' | 'Kitchen' | 'Market' | 'Event Space';

/* Stable hash → [0,1) from a string. Same input → same output. */
function hash01(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 100000) / 100000;
}

/** Each day of the week has a demand shape (Fri/Sat peak, midweek dip). */
const DOW_OCC_FACTOR = [0.92, 0.9, 0.94, 0.98, 1.06, 1.12, 1.0]; // Sun..Sat
const DOW_ADR_FACTOR = [0.96, 0.95, 0.98, 1.0, 1.05, 1.1, 1.02];

function enumerateDays(from: string, to: string): string[] {
  const out: string[] = [];
  const start = new Date(`${from}T00:00:00Z`);
  const end = new Date(`${to}T00:00:00Z`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) return [from];
  // Cap at 366 days so a stray wide window can't blow up.
  for (let d = new Date(start), n = 0; d <= end && n < 366; d.setUTCDate(d.getUTCDate() + 1), n++) {
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}

function deriveHealth(occPct: number): 'green' | 'amber' | 'red' {
  if (occPct >= 85) return 'green';
  if (occPct >= 75) return 'amber';
  return 'red';
}

/** One synthetic day for one hotel — the atomic unit everything sums from. */
interface DayMetric {
  occPct: number;
  adr: number;
  roomsSold: number;
  roomsAvailable: number;
  totalRevenue: number;
  roomRevenue: number;
  mix: { room: number; fb: number; retail: number; events: number; other: number };
  roomsOoo: number;
  csat: number;
  scheduledHours: number;
  clockedHours: number;
  overtimeHours: number;
  payrollCost: number;
}

const PROPERTY_MIX: Record<'full' | 'limited' | 'extended', { room: number; fb: number; retail: number; events: number; other: number }> = {
  full:     { room: 0.72, fb: 0.10, retail: 0.09, events: 0.06, other: 0.03 },
  limited:  { room: 0.82, fb: 0.05, retail: 0.08, events: 0.02, other: 0.03 },
  extended: { room: 0.78, fb: 0.05, retail: 0.10, events: 0.04, other: 0.03 },
};

function dayMetric(hotelId: string, date: string): DayMetric {
  const base = REVENUE_DATA.find((r) => r.hotelId === hotelId);
  const hotel = HOTELS.find((h) => h.id === hotelId);
  const rooms = hotel?.rooms ?? 100;

  // Baseline character from the seed (or sane defaults for hotels w/o a seed row).
  const baseOcc = base?.occupancyPct ?? 80;
  const baseAdr = base?.adr ?? 140;
  const marketAdr = base?.marketAdr ?? Math.round(baseAdr * 0.97);

  const dow = new Date(`${date}T00:00:00Z`).getUTCDay();
  const noise = hash01(`${hotelId}:${date}`);          // 0..1, per hotel-day
  const noise2 = hash01(`${date}:${hotelId}:b`);

  // Occupancy: baseline × day-of-week shape × small daily noise, clamped sane.
  const occRaw = baseOcc * DOW_OCC_FACTOR[dow] * (0.95 + noise * 0.12);
  const occPct = Math.max(38, Math.min(99, Math.round(occRaw * 10) / 10));

  const adr = Math.max(70, Math.round(baseAdr * DOW_ADR_FACTOR[dow] * (0.97 + noise2 * 0.08)));

  const roomsSold = Math.max(0, Math.round(rooms * (occPct / 100)));
  const roomRevenue = roomsSold * adr;

  // Property type drives the revenue mix split.
  const ptype: 'full' | 'limited' | 'extended' =
    (REVENUE_DATA.find((r) => r.hotelId === hotelId) && (rooms > 110 ? 'full' : 'limited')) || 'limited';
  const ratios = PROPERTY_MIX[ptype];
  // roomRevenue is the room slice; gross it up to a total via the room ratio.
  const totalRevenue = Math.round(roomRevenue / ratios.room);
  const mix = {
    room: roomRevenue,
    fb: Math.round(totalRevenue * ratios.fb),
    retail: Math.round(totalRevenue * ratios.retail),
    events: Math.round(totalRevenue * ratios.events),
    other: Math.round(totalRevenue * ratios.other),
  };

  // Out-of-order rooms: usually 0-2, occasionally a spike (deterministic).
  const roomsOoo = noise > 0.86 ? Math.round(1 + noise * 4) : noise > 0.6 ? 1 : 0;

  // CSAT 3.6–4.9, gently correlated to occupancy pressure (busier ⇒ slightly lower).
  const csat = Math.round((4.85 - (occPct - 80) * 0.012 + (noise2 - 0.5) * 0.5) * 10) / 10;

  // Labour: scheduled hours scale with rooms sold; clocked drifts ±, payroll from blended wage.
  const scheduledHours = Math.round(roomsSold * 1.05 + rooms * 0.35);
  const varianceFactor = (noise - 0.45) * 0.16;            // -7%..+9%
  const clockedHours = Math.max(0, Math.round(scheduledHours * (1 + varianceFactor)));
  const overtimeHours = clockedHours > scheduledHours ? Math.round((clockedHours - scheduledHours) * 0.6) : 0;
  const blendedWage = 19 + noise2 * 6;                     // $19–25/hr blended
  const payrollCost = Math.round(clockedHours * blendedWage + overtimeHours * blendedWage * 0.5);

  const roomsAvailable = rooms - roomsOoo;

  return {
    occPct, adr, roomsSold, roomsAvailable, totalRevenue, roomRevenue, mix,
    roomsOoo, csat, scheduledHours, clockedHours, overtimeHours, payrollCost,
  };
}

/* Department split for labour (sums to the hotel total). */
const DEPT_SPLIT: Array<{ name: DeptName; share: number }> = [
  { name: 'Housekeeping', share: 0.40 },
  { name: 'Front Desk',   share: 0.22 },
  { name: 'Maintenance',  share: 0.10 },
  { name: 'Kitchen',      share: 0.14 },
  { name: 'Market',       share: 0.08 },
  { name: 'Event Space',  share: 0.06 },
];

/* ── Public generators — same signatures the API query layer returns ─────── */

export function mockRevenueRows(hotelIds: string[], from: string, to: string, agg: RevenueAgg = 'today'): ApiRevenueSummary[] {
  const days = enumerateDays(from, to);
  return hotelIds.map((hotelId) => {
    const ds = days.map((d) => dayMetric(hotelId, d));
    const roomsSold = ds.reduce((s, m) => s + m.roomsSold, 0);
    const totalRevenue = ds.reduce((s, m) => s + m.totalRevenue, 0);
    const roomRevenue = ds.reduce((s, m) => s + m.roomRevenue, 0);
    const mix = ds.reduce((a, m) => ({
      room: a.room + m.mix.room, fb: a.fb + m.mix.fb, retail: a.retail + m.mix.retail,
      events: a.events + m.mix.events, other: a.other + m.mix.other,
    }), { room: 0, fb: 0, retail: 0, events: 0, other: 0 });
    // Room-night weighted occupancy + ADR across the window.
    const roomsAvail = ds.reduce((s, m) => s + m.roomsAvailable, 0);
    const occupancyPct = roomsAvail > 0 ? Math.round((roomsSold / roomsAvail) * 1000) / 10 : 0;
    const adr = roomsSold > 0 ? Math.round(roomRevenue / roomsSold) : (REVENUE_DATA.find((r) => r.hotelId === hotelId)?.adr ?? 140);
    const base = REVENUE_DATA.find((r) => r.hotelId === hotelId);
    const marketAdr = base?.marketAdr ?? Math.round(adr * 0.97);
    return {
      hotelId,
      occupancyPct,
      adr,
      revPar: Math.round(adr * (occupancyPct / 100)),
      totalRevenue,
      roomRevenue,
      nonRoomRevenue: Math.max(0, totalRevenue - roomRevenue),
      revenueMix: mix,
      marketAdr,
      health: deriveHealth(occupancyPct),
    };
  });
}

export function mockLabourRows(hotelIds: string[], from: string, to: string): ApiLabourMetrics[] {
  const days = enumerateDays(from, to);
  return hotelIds.map((hotelId) => {
    const ds = days.map((d) => dayMetric(hotelId, d));
    const scheduledHours = ds.reduce((s, m) => s + m.scheduledHours, 0);
    const clockedHours = ds.reduce((s, m) => s + m.clockedHours, 0);
    const overtimeHours = ds.reduce((s, m) => s + m.overtimeHours, 0);
    const payrollCost = ds.reduce((s, m) => s + m.payrollCost, 0);
    const variance = clockedHours - scheduledHours;
    const departments = DEPT_SPLIT.map((d) => {
      const sched = Math.round(scheduledHours * d.share);
      const clocked = Math.round(clockedHours * d.share);
      return {
        department: d.name,
        scheduledHours: sched,
        clockedHours: clocked,
        variance: clocked - sched,
        overtimeHours: Math.round(overtimeHours * d.share),
        payrollCost: Math.round(payrollCost * d.share),
      };
    });
    const varPct = scheduledHours > 0 ? variance / scheduledHours : 0;
    const health: 'green' | 'amber' | 'red' = varPct > 0.06 ? 'red' : varPct > 0.02 ? 'amber' : 'green';
    return { hotelId, scheduledHours, clockedHours, variance, overtimeHours, payrollCost, departments, health };
  });
}

export function mockDailyRows(hotelIds: string[], from: string, to: string): ApiDailyMetrics[] {
  const days = enumerateDays(from, to);
  return hotelIds.map((hotelId) => {
    const ds = days.map((d) => dayMetric(hotelId, d));
    const roomsSold = ds.reduce((s, m) => s + m.roomsSold, 0);
    const roomsOoo = ds.reduce((s, m) => s + m.roomsOoo, 0);
    const roomsAvail = ds.reduce((s, m) => s + m.roomsAvailable, 0);
    const occupancyPct = roomsAvail > 0 ? Math.round((roomsSold / roomsAvail) * 1000) / 10 : 0;
    // CSAT room-night weighted (busier days carry more weight).
    const csatWeighted = roomsSold > 0
      ? ds.reduce((s, m) => s + m.csat * m.roomsSold, 0) / roomsSold
      : (ds.reduce((s, m) => s + m.csat, 0) / Math.max(ds.length, 1));
    return {
      hotelId,
      date: to,
      roomsSold,
      roomsOoo,
      avgCustomerRating: Math.round(csatWeighted * 100) / 100,
      occupancyPct,
    };
  });
}

/**
 * Revenue mix breakdown (the 4-level OnQ taxonomy: Type > SubtypeGroup >
 * Subtype lines) for the "Revenue Mix by Source" drill-down. Derived from the
 * SAME per-day mix totals as mockRevenueRows so the numbers reconcile. Returns
 * a portfolio rollup + one breakdown per hotel, matching /api/revenue/breakdown.
 */
export function mockRevenueBreakdown(hotelIds: string[], from: string, to: string): {
  portfolio: ApiRevenueBreakdown;
  perHotel: ApiRevenueBreakdown[];
} {
  const rev = mockRevenueRows(hotelIds, from, to, 'today');

  // Split a bucket dollar amount into believable named charge lines.
  const lines = (amount: number, parts: Array<[string, number, string | null]>): Array<{ label: string; subtype: string | null; amount: number }> =>
    parts.map(([label, share, subtype]) => ({ label, subtype, amount: Math.round(amount * share) }));

  const perHotel: ApiRevenueBreakdown[] = rev.map((r) => {
    const m = r.revenueMix;
    const roomLines = lines(m.room, [['Direct Room Revenue', 0.82, null], ['No Show Room Revenue', 0.05, null], ['Group Room Revenue', 0.13, null]]);
    const fbLines = lines(m.fb, [['Restaurant', 0.62, 'Restaurant'], ['Room Service', 0.23, 'Restaurant'], ['Bar / Lounge', 0.15, 'Restaurant']]);
    const marketLines = lines(m.retail, [['Front Market', 1.0, 'Front Market']]);
    const eventLines = lines(m.events, [['Meeting Room Rental', 0.55, null], ['Banquet F&B', 0.45, null]]);
    const otherLines = lines(m.other, [['Parking', 0.34, null], ['Resort / Amenity Fee', 0.3, null], ['Pet Fee', 0.12, null], ['Misc Charges', 0.24, null]]);

    const types = [
      {
        type: 'Room Revenue', total: roomLines.reduce((s, l) => s + l.amount, 0),
        groups: [{ group: 'Not Applicable', total: roomLines.reduce((s, l) => s + l.amount, 0), lines: roomLines }],
      },
      {
        type: 'Charges',
        total: [...fbLines, ...marketLines, ...eventLines, ...otherLines].reduce((s, l) => s + l.amount, 0),
        groups: [
          { group: 'F&B', total: [...fbLines, ...marketLines].reduce((s, l) => s + l.amount, 0), lines: [...fbLines, ...marketLines] },
          { group: 'Events', total: eventLines.reduce((s, l) => s + l.amount, 0), lines: eventLines },
          { group: 'Other Charges', total: otherLines.reduce((s, l) => s + l.amount, 0), lines: otherLines },
        ],
      },
    ];
    return { hotelId: r.hotelId, total: types.reduce((s, t) => s + t.total, 0), types };
  });

  // Portfolio = sum the per-hotel taxonomy line-by-line.
  const acc = new Map<string, { label: string; subtype: string | null; amount: number }>();
  const groupTotals = new Map<string, { type: string; group: string; total: number }>();
  for (const h of perHotel) {
    for (const t of h.types) {
      for (const g of t.groups) {
        const gk = `${t.type}|${g.group}`;
        const gt = groupTotals.get(gk) ?? { type: t.type, group: g.group, total: 0 };
        gt.total += g.total;
        groupTotals.set(gk, gt);
        for (const l of g.lines) {
          const lk = `${gk}|${l.label}`;
          const ex = acc.get(lk);
          if (ex) ex.amount += l.amount;
          else acc.set(lk, { label: l.label, subtype: l.subtype, amount: l.amount });
        }
      }
    }
  }
  const typeMap = new Map<string, ApiRevenueBreakdown['types'][number]>();
  for (const [gk, gt] of groupTotals) {
    const t = typeMap.get(gt.type) ?? { type: gt.type, total: 0, groups: [] };
    const groupLines = [...acc.entries()].filter(([k]) => k.startsWith(gk + '|')).map(([, v]) => v);
    t.groups.push({ group: gt.group, total: gt.total, lines: groupLines });
    t.total += gt.total;
    typeMap.set(gt.type, t);
  }
  const portfolioTypes = [...typeMap.values()];
  const portfolio: ApiRevenueBreakdown = {
    hotelId: 'PORTFOLIO',
    total: portfolioTypes.reduce((s, t) => s + t.total, 0),
    types: portfolioTypes,
  };
  return { portfolio, perHotel };
}
