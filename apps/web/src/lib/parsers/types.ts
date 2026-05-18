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
  | 'rate_update'
  | 'onq_final_audit'
  | 'onq_room_details'
  | 'onq_arrivals'
  | 'onq_high_balance';

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

// --- Hilton OnQ extras (Phase 2) ---------------------------------------------

export interface ParsedPaymentMethodMix {
  hotelCode: string;
  date: string;
  method: string;
  /** Bucket from the user's taxonomy: Cash | Card | hilton | DirectBill | adjustments. */
  method_type?: string | null;
  amount_today: number;
  amount_mtd: number;
  amount_ytd: number;
}

export interface ParsedMarketSegmentMix {
  hotelCode: string;
  date: string;
  segment: string;
  rooms_today: number;
  rooms_mtd: number;
  rooms_ytd: number;
  revenue_today: number;
  revenue_mtd: number;
  revenue_ytd: number;
}

export interface ParsedTaxBreakdown {
  hotelCode: string;
  date: string;
  tax_type: string;
  amount_today: number;
  amount_mtd: number;
  amount_ytd: number;
}

export interface ParsedLedgerBalance {
  hotelCode: string;
  date: string;
  ledger_name: string;
  opening_balance: number;
  net_change: number;
  closing_balance: number;
}

/**
 * Per-row record from a Hilton OnQ Final Audit CSV. One emitted per non-blank
 * non-zero row across all sections (Charge Type, Tax Type, Payment Method,
 * Type). Unmapped rows surface with category='Unmapped', type='Needs Review',
 * matchStatus='Needs Review' so we can review them rather than silently drop.
 */
export interface ParsedNightAuditRow {
  hotelCode: string;
  reportDate: string;            // YYYY-MM-DD
  sourceFileName: string;
  sourceTable: string;           // 'Charge Type' | 'Tax Type' | 'Payment Method' | 'Type'
  sourceRowName: string;         // original label (pre-normalisation)
  category: string;              // 'Revenue' | 'Taxes' | 'Payment Methods' | 'Room Status' | 'Rooms Availability' | 'Occupancy' | 'KPI' | 'Unmapped'
  type: string;
  subtypeGroup: string | null;
  subtype: string | null;
  valueToday: number | null;
  valueMtd: number | null;
  valueYtd: number | null;
  matchStatus: 'Mapped' | 'Needs Review';
}

export interface ParsedRoomSnapshot {
  hotelCode: string;
  captured_at: string;  // ISO timestamp
  room_number: string;
  room_type_code?: string;
  occ_status?: string;
  hsk_status?: string;
  guest_name?: string;
  addn_guests?: string;
  honors_tier?: string;
  arrival_date?: string;
  departure_date?: string;
  rate_plan?: string;
  reservation_status?: string;
  pending_status?: string;
  maintenance?: string;
  last_occupied?: string;
}

export interface ParsedReservationArrival {
  hotelCode: string;
  confirmation_number: string;
  arrival_date?: string;
  departure_date?: string;
  guest_name?: string;
  addn_guests?: string;
  room_type?: string;
  room_number?: string;
  rate_plan?: string;
  adults?: number;
  children?: number;
  company?: string;
  avg_room_rate?: number;
  avg_room_taxes?: number;
  fee?: number;
  honors_tier?: string;
  vip_guest?: string;
  guest_tier?: string;
  guarantee_type?: string;
  arrival_time?: string;
  digital_check_in?: string;
  add_on?: string;
  stay_requests?: string;
  booking_remarks?: string;
  stay_remarks?: string;
  virtual_cc?: string;
}

export interface ParsedHighBalanceAlert {
  hotelCode: string;
  captured_at: string;
  folio_name: string;
  room_number?: string;
  guest_name?: string;
  guest_tier?: string;
  arrival_date?: string;
  departure_date?: string;
  room_rate?: number;
  folio_balance?: number;
  credit_balance?: number;
  outstanding_balance?: number;
  payment_method?: string;
  available_credit_limit?: number;
  auto_top_off_status?: string;
}

export interface ParseResult {
  daily_revenue?: ParsedDailyRevenue[];
  daily_occupancy?: ParsedDailyOccupancy[];
  labour_periods?: ParsedLabourPeriod[];
  labour_departments?: ParsedLabourDepartment[];
  am_pm_snapshots?: ParsedAmPmSnapshot[];   // parsed but not persisted in 1.A
  // OnQ extras (Phase 2)
  payment_method_mix?: ParsedPaymentMethodMix[];
  market_segment_mix?: ParsedMarketSegmentMix[];
  tax_breakdown?: ParsedTaxBreakdown[];
  ledger_balances?: ParsedLedgerBalance[];
  room_snapshots?: ParsedRoomSnapshot[];
  reservation_arrivals?: ParsedReservationArrival[];
  high_balance_alerts?: ParsedHighBalanceAlert[];
  night_audit_rows?: ParsedNightAuditRow[];
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
