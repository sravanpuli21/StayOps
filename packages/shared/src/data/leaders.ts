import { HOTELS } from './hotels';
import { REVENUE_DATA } from './revenue';
import { LABOUR_DATA } from './labour';
import { getRoomsForHotel } from './operations';

// ─── GM Assignments ────────────────────────────────────────────────────────────

export const GM_ROSTER: { name: string; hotelId: string; initials: string }[] = [
  { name: 'Rishab Patel',    hotelId: 'BTRCI',   initials: 'RP' },
  { name: 'Monica Davis',    hotelId: 'SAVVY',   initials: 'MD' },
  { name: 'Derek Thompson',  hotelId: 'GA989',   initials: 'DT' },
  { name: 'Jennifer Walsh',  hotelId: 'SAVMT',   initials: 'JW' },
  { name: 'Carlos Reyes',    hotelId: 'SAVMD',   initials: 'CR' },
  { name: 'Priya Sharma',    hotelId: 'RISAV',   initials: 'PS' },
  { name: 'Michael Chen',    hotelId: 'SAVFP',   initials: 'MC' },
  { name: 'Angela Brooks',   hotelId: 'BQKCY',   initials: 'AB' },
  { name: 'Tyler Morrison',  hotelId: 'BSWVE',   initials: 'TM' },
  { name: 'Sandra Kim',      hotelId: 'GAA84',   initials: 'SK' },
  { name: 'James Okafor',    hotelId: 'BQKFP',   initials: 'JO' },
  { name: 'Rachel Torres',   hotelId: 'SGJES',   initials: 'RT' },
  { name: 'Nathan Pierce',   hotelId: 'JAXTX',   initials: 'NP' },
  { name: 'Lisa Nakamura',   hotelId: 'DFWFW',   initials: 'LN' },
  { name: 'Kevin Jamison',   hotelId: 'SAVGW',   initials: 'KJ' },
  { name: 'Diana Patel',     hotelId: '58090LA', initials: 'DP' },
];

export const REGIONAL_ROSTER = [
  {
    id: 'gautham',
    name: 'Gautham Shetty',
    initials: 'GS',
    title: 'Regional Director of Operations',
    hotelIds: ['SAVGW', 'SAVVY', 'GA989', 'SAVMT', 'SAVMD', 'RISAV', 'SAVFP', 'BQKCY'],
  },
  {
    id: 'harshal',
    name: 'Harshal Patel',
    initials: 'HP',
    title: 'Regional Director of Operations',
    hotelIds: ['BSWVE', 'GAA84', 'BQKFP', 'SGJES', 'JAXTX', 'DFWFW', 'BTRCI', '58090LA'],
  },
];

// ─── Score Computation ─────────────────────────────────────────────────────────

function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
}

export interface LeaderScore {
  hotelId: string;
  revenue: number;
  payroll: number;
  costSavings: number;
  assetUptime: number;
  trend: number;
  composite: number;
  trendDelta: number;           // vs previous period (+/-)
  trendDirection: 'up' | 'flat' | 'down';
}

export function computeHotelScore(hotelId: string): LeaderScore {
  const rev = REVENUE_DATA.find((r) => r.hotelId === hotelId)!;
  const lab = LABOUR_DATA.find((l) => l.hotelId === hotelId)!;
  const hotel = HOTELS.find((h) => h.id === hotelId)!;
  const rooms = getRoomsForHotel(hotelId);

  // Revenue score: occupancy vs 78% target + ADR vs market premium
  const revenueScore = Math.round(
    Math.min(100, Math.max(30,
      65 + (rev.occupancyPct - 75) * 2 + ((rev.adr / rev.marketAdr) - 1) * 40
    ))
  );

  // Payroll score: variance% — over hours penalized 4x harder than under
  const varPct = ((lab.clockedHours - lab.scheduledHours) / lab.scheduledHours) * 100;
  const payrollScore = Math.round(
    Math.min(100, Math.max(20,
      varPct > 0
        ? 85 - varPct * 4
        : 85 + Math.abs(varPct) * 1.0
    ))
  );

  // Asset uptime: % of rooms that are NOT ooo or blocked
  const ooo = rooms.filter((r) => r.status === 'ooo').length;
  const blocked = rooms.filter((r) => r.status === 'blocked').length;
  const assetUptimeScore = Math.round(((hotel.rooms - ooo - blocked) / hotel.rooms) * 100);

  // Cost savings & trend: deterministic generated scores
  const s = hash(hotelId);
  const costSavingsScore = 60 + (s % 30);
  const trendScore = 55 + ((s >> 4) % 40);

  const composite = Math.round(
    revenueScore * 0.35 +
    payrollScore * 0.25 +
    costSavingsScore * 0.20 +
    assetUptimeScore * 0.10 +
    trendScore * 0.10
  );

  const trendDelta = (s % 12) - 5; // -5 to +6
  const trendDirection = trendDelta > 1 ? 'up' : trendDelta < -1 ? 'down' : 'flat';

  return {
    hotelId,
    revenue: revenueScore,
    payroll: payrollScore,
    costSavings: costSavingsScore,
    assetUptime: assetUptimeScore,
    trend: trendScore,
    composite,
    trendDelta,
    trendDirection,
  };
}

export function computeRegionalScore(hotelIds: string[]): LeaderScore {
  const scores = hotelIds.map(computeHotelScore);
  const avg = (key: keyof LeaderScore) =>
    Math.round(scores.reduce((s, x) => s + (x[key] as number), 0) / scores.length);

  const composite = avg('composite');
  const trendDelta = Math.round(scores.reduce((s, x) => s + x.trendDelta, 0) / scores.length);

  return {
    hotelId: 'regional',
    revenue: avg('revenue'),
    payroll: avg('payroll'),
    costSavings: avg('costSavings'),
    assetUptime: avg('assetUptime'),
    trend: avg('trend'),
    composite,
    trendDelta,
    trendDirection: trendDelta > 1 ? 'up' : trendDelta < -1 ? 'down' : 'flat',
  };
}

export function getAllGMScores() {
  return GM_ROSTER.map((gm, i) => ({
    ...gm,
    score: computeHotelScore(gm.hotelId),
    hotel: HOTELS.find((h) => h.id === gm.hotelId)!,
    rank: 0, // filled after sort
  }))
    .sort((a, b) => b.score.composite - a.score.composite)
    .map((gm, i) => ({ ...gm, rank: i + 1 }));
}
