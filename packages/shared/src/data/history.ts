export interface SparkSeries {
  points: number[];
  baseline: number;
}

export interface StlyComparison {
  current: number;
  stly: number;
  changePct: number;
  formattedCurrent: string;
  formattedStly: string;
}

export interface RingCompare {
  value: number;
  label: string;
  compareLabel: string;
  compareValue: string;
  compareChange: string;
  compareDirection: 'up' | 'down';
}

// 28-day sparkline series — synthetic, shape-only. Oldest → newest.
export const PORTFOLIO_HISTORY: Record<string, SparkSeries> = {
  totalRevenue: {
    baseline: 291520,
    points: [
      272400, 278100, 281500, 283100, 279800, 285200, 287900,
      284500, 289200, 286700, 290100, 292400, 288800, 291000,
      294200, 290500, 288900, 292300, 295100, 296800, 293400,
      289800, 292100, 295600, 298200, 294900, 296200, 291520,
    ],
  },
  roomRevenue: {
    baseline: 220100,
    points: [
      204800, 209100, 212400, 213900, 210600, 215800, 218200,
      215900, 219400, 217100, 220800, 222700, 218900, 221400,
      223800, 220900, 218600, 222100, 224800, 226500, 223100,
      219400, 221800, 224800, 227600, 224200, 225700, 220100,
    ],
  },
  occupancy: {
    baseline: 82.0,
    points: [
      78.2, 79.4, 80.1, 79.8, 80.6, 81.2, 80.8, 81.4, 82.0, 81.7,
      82.3, 82.8, 81.9, 82.4, 82.9, 82.1, 81.7, 82.5, 83.0, 83.3,
      82.6, 81.9, 82.3, 83.0, 83.5, 82.8, 83.0, 82.0,
    ],
  },
  adr: {
    baseline: 152,
    points: [
      146, 147, 149, 148, 150, 151, 150, 152, 153, 152, 154, 155,
      152, 153, 155, 152, 151, 153, 155, 156, 154, 152, 153, 155,
      157, 154, 155, 152,
    ],
  },
  revPar: {
    baseline: 125,
    points: [
      114, 117, 119, 118, 121, 123, 121, 124, 125, 124, 127, 128,
      125, 126, 128, 125, 124, 126, 129, 130, 127, 124, 126, 128,
      131, 127, 129, 125,
    ],
  },
  nonRoomRevenue: {
    baseline: 71420,
    points: [
      67600, 69000, 69100, 69200, 69200, 69400, 69700, 68600, 69800,
      69600, 69300, 69700, 69900, 69600, 70400, 69600, 70300, 70200,
      70300, 70300, 70300, 70400, 70300, 70800, 70600, 70700, 70500,
      71420,
    ],
  },
};

// Portfolio-level STLY comparison (same-time last year)
export const PORTFOLIO_STLY: Record<string, StlyComparison> = {
  totalRevenue:   { current: 291520, stly: 278150, changePct: 4.8, formattedCurrent: '$291.5k', formattedStly: '$278.2k' },
  roomRevenue:    { current: 220100, stly: 208900, changePct: 5.4, formattedCurrent: '$220.1k', formattedStly: '$208.9k' },
  nonRoomRevenue: { current: 71420,  stly: 69250,  changePct: 3.1, formattedCurrent: '$71.4k',  formattedStly: '$69.2k' },
  occupancy:      { current: 82.0,   stly: 79.6,   changePct: 3.0, formattedCurrent: '82.0%',   formattedStly: '79.6%' },
  adr:            { current: 152,    stly: 147,    changePct: 3.4, formattedCurrent: '$152',    formattedStly: '$147' },
  revPar:         { current: 125,    stly: 117,    changePct: 6.8, formattedCurrent: '$125',    formattedStly: '$117' },
  roomsSold:      { current: 1300,   stly: 1248,   changePct: 4.2, formattedCurrent: '1,300',   formattedStly: '1,248' },
  roomsNotSold:   { current: 285,    stly: 337,    changePct: -15.4, formattedCurrent: '285',    formattedStly: '337' },
  labourVariance: { current: 274,    stly: 412,    changePct: -33.5, formattedCurrent: '+274 hrs', formattedStly: '+412 hrs' },
  scheduledHours: { current: 9597,   stly: 9450,   changePct: 1.6, formattedCurrent: '9,597',   formattedStly: '9,450' },
  clockedHours:   { current: 9871,   stly: 9862,   changePct: 0.1, formattedCurrent: '9,871',   formattedStly: '9,862' },
  overtimeHours:  { current: 145,    stly: 178,    changePct: -18.5, formattedCurrent: '145',    formattedStly: '178' },
  payrollCost:    { current: 507440, stly: 492300, changePct: 3.1, formattedCurrent: '$507.4k', formattedStly: '$492.3k' },
  avgRating:      { current: 4.2,    stly: 4.1,    changePct: 2.4, formattedCurrent: '4.2',     formattedStly: '4.1' },
  totalAssetValue:{ current: 7650000, stly: 7480000, changePct: 2.3, formattedCurrent: '$7.65M', formattedStly: '$7.48M' },
  ytdRepairSpend: { current: 28670,  stly: 31420,  changePct: -8.8, formattedCurrent: '$28.7k',  formattedStly: '$31.4k' },
};

// Occupancy donut pair data (OTB + forecast)
export const OCCUPANCY_RINGS: RingCompare[] = [
  {
    value: 82,
    label: 'Current OTB',
    compareLabel: 'Same time LY',
    compareValue: '79.6%',
    compareChange: '3.0',
    compareDirection: 'up',
  },
  {
    value: 85,
    label: 'Month forecast',
    compareLabel: 'End of month LY',
    compareValue: '82.4%',
    compareChange: '3.1',
    compareDirection: 'up',
  },
];

// Asset health donut pair
export const ASSET_HEALTH_RINGS: RingCompare[] = [
  {
    value: 73,
    label: 'Assets in good health',
    compareLabel: 'vs last quarter',
    compareValue: '76%',
    compareChange: '3.0',
    compareDirection: 'down',
  },
  {
    value: 42,
    label: 'Preventive compliance',
    compareLabel: 'vs target 60%',
    compareValue: '60%',
    compareChange: '18',
    compareDirection: 'down',
  },
];
