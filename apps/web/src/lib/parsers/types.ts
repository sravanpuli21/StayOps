/**
 * PMS parser contract. One parser per (brand × report type) pairing.
 * Parsers are pure functions: given the file buffer + hints, return
 * structured rows ready for upsert.
 *
 * This lets email-ingestion (/api/inbox/cron) and manual uploads
 * (/api/uploads) share the same parsing code.
 */

export type ReportType =
  | 'daily_revenue'
  | 'am_snapshot'
  | 'pm_snapshot'
  | 'reservation_activity'
  | 'rate_update';

export interface ParsedDailyRevenue {
  hotelCode: string;
  date: string; // YYYY-MM-DD
  total_revenue: number;
  room_revenue: number;
  non_room_revenue: number;
  mix_room: number;
  mix_fb: number;
  mix_retail: number;
  mix_events: number;
  mix_other: number;
  adr: number;
  revpar: number;
  occupancy_pct: number;
  market_adr?: number | null;
  health?: 'green' | 'amber' | 'red';
}

export interface ParsedDailyOccupancy {
  hotelCode: string;
  date: string;
  rooms_sold: number;
  rooms_ooo: number;
  walk_ins?: number;
  no_shows?: number;
  cancellations?: number;
  arrivals?: number;
  departures?: number;
  stay_overs?: number;
  avg_customer_rating?: number | null;
  review_count?: number;
}

export interface ParsedAmPmSnapshot {
  hotelCode: string;
  date: string;
  slot: 'AM' | 'PM';
  generated_at?: string;
  total_rooms: number;
  rooms_sold: number;
  rooms_ooo: number;
  rooms_left_to_sell: number;
  adr: number;
  avg_price: number;
  revpar: number;
  occupancy_pct: number;
  room_type_rows: Array<{
    room_type_code: string;
    label?: string;
    total: number;
    sold: number;
    ooo: number;
    left_to_sell: number;
    adr: number;
    avg_price: number;
    revpar: number;
    occupancy_pct: number;
  }>;
}

export interface ParseResult {
  daily_revenue?: ParsedDailyRevenue[];
  daily_occupancy?: ParsedDailyOccupancy[];
  am_pm_snapshots?: ParsedAmPmSnapshot[];
  warnings: string[];
  errors: string[];
}

export interface ParseInput {
  buffer: Buffer;
  filename?: string;
  /** Hints from email routing or upload UI. Parsers may override. */
  hotelCode?: string;
  reportDate?: string;
}

export interface ParserDef {
  id: string; // 'hilton-onq-daily-revenue', etc.
  pmsId: string; // 'onq' | 'opera' | ...
  reportType: ReportType;
  /** Subject pattern match (for email classification). */
  matchSubject?: RegExp;
  /** Filename pattern match. */
  matchFilename?: RegExp;
  /** Sender domain allowlist. */
  senderDomains?: string[];
  parse: (input: ParseInput) => Promise<ParseResult> | ParseResult;
}
