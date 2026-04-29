import type { DailyMetrics } from '../types/metrics';

export const DAILY_METRICS: DailyMetrics[] = [
  { hotelId: 'SAVGW',   date: '2026-04-24', roomsSold: 76,  roomsOoo: 0, avgCustomerRating: 4.3, occupancyPct: 83 },
  { hotelId: 'SAVVY',   date: '2026-04-24', roomsSold: 47,  roomsOoo: 0, avgCustomerRating: 4.6, occupancyPct: 84 },
  { hotelId: 'GA989',   date: '2026-04-24', roomsSold: 89,  roomsOoo: 1, avgCustomerRating: 4.5, occupancyPct: 88 },
  { hotelId: 'SAVMT',   date: '2026-04-24', roomsSold: 102, roomsOoo: 3, avgCustomerRating: 4.1, occupancyPct: 77 },
  { hotelId: 'SAVMD',   date: '2026-04-24', roomsSold: 96,  roomsOoo: 0, avgCustomerRating: 4.2, occupancyPct: 80 },
  { hotelId: 'RISAV',   date: '2026-04-24', roomsSold: 57,  roomsOoo: 0, avgCustomerRating: 4.4, occupancyPct: 86 },
  { hotelId: 'SAVFP',   date: '2026-04-24', roomsSold: 144, roomsOoo: 0, avgCustomerRating: 4.3, occupancyPct: 91 },
  { hotelId: 'BQKCY',   date: '2026-04-24', roomsSold: 73,  roomsOoo: 1, avgCustomerRating: 4.0, occupancyPct: 78 },
  { hotelId: 'BSWVE',   date: '2026-04-24', roomsSold: 79,  roomsOoo: 0, avgCustomerRating: 4.2, occupancyPct: 81 },
  { hotelId: 'GAA84',   date: '2026-04-24', roomsSold: 90,  roomsOoo: 0, avgCustomerRating: 3.9, occupancyPct: 74 },
  { hotelId: 'BQKFP',   date: '2026-04-24', roomsSold: 89,  roomsOoo: 1, avgCustomerRating: 4.1, occupancyPct: 79 },
  { hotelId: 'SGJES',   date: '2026-04-24', roomsSold: 67,  roomsOoo: 0, avgCustomerRating: 4.3, occupancyPct: 82 },
  { hotelId: 'JAXTX',   date: '2026-04-24', roomsSold: 50,  roomsOoo: 0, avgCustomerRating: 4.7, occupancyPct: 87 },
  { hotelId: 'DFWFW',   date: '2026-04-24', roomsSold: 84,  roomsOoo: 1, avgCustomerRating: 3.9, occupancyPct: 85 },
  { hotelId: 'BTRCI',   date: '2026-04-24', roomsSold: 96,  roomsOoo: 0, avgCustomerRating: 4.2, occupancyPct: 83 },
  { hotelId: '58090LA', date: '2026-04-24', roomsSold: 61,  roomsOoo: 1, avgCustomerRating: 4.0, occupancyPct: 76 },
];

export const getDailyMetricsById = (hotelId: string): DailyMetrics | undefined =>
  DAILY_METRICS.find((m) => m.hotelId === hotelId);
