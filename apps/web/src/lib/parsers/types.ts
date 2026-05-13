/**
 * PMS parser contract. One parser per (brand × report type) pairing.
 * Parsers are pure functions: given the file buffer + hints, return
 * structured rows ready for upsert.
 *
 * Email-ingestion (/api/inbox/cron) and manual uploads (/api/uploads) share
 * the same parsing code through this interface.
 */

export type ReportType =
  | 'daily_revenue'
  | 'labour'
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

export interface ParsedLabourPeriod {
  hotelCode: string;
  period_end: string;     // YYYY-MM-DD (Sunday)
  period_start: string;   // YYYY-MM-DD (period_end - 13)
  scheduled_hours: number;
  clocked_hours: number;
  overtime_hours: number;
  payroll_cost: number;
  health?: 'green' | 'amber' | 'red';
}

export type LabourDeptName =
  | 'Housekeeping' | 'Front Desk' | 'Kitchen'
  | 'Maintenance' | 'Market' | 'Event Space';

export interface ParsedLabourDepartment {
  hotelCode: string;
  period_end: string;
  department: LabourDeptName;
  scheduled_hours: number;
  clocked_hours: number;
  overtime_hours: number;
  payroll_cost: number;
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
  labour_periods?: ParsedLabourPeriod[];
  labour_departments?: ParsedLabourDepartment[];
  am_pm_snapshots?: ParsedAmPmSnapshot[];   // parsed but not persisted in 1.A
  warnings: string[];
  errors: string[];
}

export interface ParseInput {
  buffer: Buffer;
  filename?: string;
  hotelCode?: string;
  reportDate?: string;
}

export interface ParserDef {
  id: string;
  pmsId: string; // 'onq' | 'opera' | 'choice-advantage' | 'sabre' | 'marsha' | 'stayops'
  reportType: ReportType;
  matchSubject?: RegExp;
  matchFilename?: RegExp;
  senderDomains?: string[];
  parse: (input: ParseInput) => Promise<ParseResult> | ParseResult;
}
