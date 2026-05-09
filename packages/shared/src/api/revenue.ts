import type { Brand, HealthStatus } from '../types/hotel';
import type { RevenueMix } from '../types/metrics';
import type { DateRangeToken, DateWindow } from './date-range';

/** Matches the mock-era RevenueSummary closely so existing components don't need to change. */
export interface ApiRevenueRow {
  hotelId: string;
  occupancyPct: number;
  adr: number;
  revPar: number;
  totalRevenue: number;
  roomRevenue: number;
  nonRoomRevenue: number;
  revenueMix: RevenueMix;
  marketAdr: number;
  health: HealthStatus;
}

export interface ApiDailyRow {
  hotelId: string;
  date: string;
  roomsSold: number;
  roomsOoo: number;
  avgCustomerRating: number;
  occupancyPct: number;
}

export interface ApiHotelRow {
  id: string;           // uuid from db
  code: string;         // business key (BTRCI, SAVGW)
  name: string;
  shortName: string;
  rooms: number;
  brand: Brand;
  city: string;
  state: string;
}

/** GET /api/revenue/scoped response. */
export interface ApiRevenueScopedResponse {
  window: DateWindow;
  scopeLabel: string;
  scopeSub: string;
  hotels: ApiHotelRow[];
  revenueRows: ApiRevenueRow[];
  dailyRows: ApiDailyRow[];
}

/** GET /api/revenue/property response. */
export interface ApiRevenuePropertyResponse {
  window: DateWindow;
  hotel: ApiHotelRow;
  revenue: ApiRevenueRow | null;
  daily: ApiDailyRow | null;
}

export interface ApiScopedQuery {
  range: DateRangeToken;
  selection: 'all' | 'my-territory' | 'regional' | 'single';
  regionalId?: string;
  hotelId?: string;
  viewerRegionalId?: string;
  customFrom?: string;
  customTo?: string;
}
