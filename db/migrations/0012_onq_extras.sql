-- ============================================================================
-- Migration 0012 — Hilton OnQ ingestion (Phase 2)
--
-- Adds seven tables for the real OnQ exports that arrive at hos.stayops@gmail.com:
--   payment_method_mix    — final-audit Section G (CASH/AMEX/VISA/...)
--   market_segment_mix    — final-audit Sections M+N (BAR/Consortia/...)
--   tax_breakdown         — final-audit Section F (CITY/OCCUPANCY/STATE...)
--   ledger_balances       — final-audit Section R (In House/Direct Bill/...)
--   room_snapshots        — room-details.csv (per-room daily snapshot)
--   reservation_arrivals  — arrivals.csv (expected check-ins)
--   high_balance_alerts   — high-balance-reports.csv
--
-- Also drops the old `rooms` table — Hilton's room type codes (NKJ/NQJ/NKSQG)
-- don't fit its CHECK constraint, and `room_snapshots` is a strict superset.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Payment-method mix (final-audit Section G)
-- ---------------------------------------------------------------------------
create table if not exists payment_method_mix (
  hotel_id        uuid not null references hotels(id) on delete cascade,
  date            date not null,
  method          text not null,
  amount_today    numeric(14,2) not null default 0,
  amount_mtd      numeric(14,2) not null default 0,
  amount_ytd      numeric(14,2) not null default 0,
  uploaded_at     timestamptz default now(),
  primary key (hotel_id, date, method)
);
create index if not exists payment_method_mix_date_idx on payment_method_mix(date desc);

-- ---------------------------------------------------------------------------
-- Market-segment mix (final-audit Sections M + N — paired count + revenue)
-- ---------------------------------------------------------------------------
create table if not exists market_segment_mix (
  hotel_id        uuid not null references hotels(id) on delete cascade,
  date            date not null,
  segment         text not null,
  rooms_today     integer not null default 0,
  rooms_mtd       integer not null default 0,
  rooms_ytd       integer not null default 0,
  revenue_today   numeric(14,2) not null default 0,
  revenue_mtd     numeric(14,2) not null default 0,
  revenue_ytd     numeric(14,2) not null default 0,
  uploaded_at     timestamptz default now(),
  primary key (hotel_id, date, segment)
);
create index if not exists market_segment_mix_date_idx on market_segment_mix(date desc);

-- ---------------------------------------------------------------------------
-- Tax breakdown (final-audit Section F)
-- ---------------------------------------------------------------------------
create table if not exists tax_breakdown (
  hotel_id        uuid not null references hotels(id) on delete cascade,
  date            date not null,
  tax_type        text not null,
  amount_today    numeric(14,2) not null default 0,
  amount_mtd      numeric(14,2) not null default 0,
  amount_ytd      numeric(14,2) not null default 0,
  uploaded_at     timestamptz default now(),
  primary key (hotel_id, date, tax_type)
);
create index if not exists tax_breakdown_date_idx on tax_breakdown(date desc);

-- ---------------------------------------------------------------------------
-- Ledger balances (final-audit Section R)
-- ---------------------------------------------------------------------------
create table if not exists ledger_balances (
  hotel_id          uuid not null references hotels(id) on delete cascade,
  date              date not null,
  ledger_name       text not null,
  opening_balance   numeric(14,2) not null default 0,
  net_change        numeric(14,2) not null default 0,
  closing_balance   numeric(14,2) not null default 0,
  uploaded_at       timestamptz default now(),
  primary key (hotel_id, date, ledger_name)
);
create index if not exists ledger_balances_date_idx on ledger_balances(date desc);

-- ---------------------------------------------------------------------------
-- Room snapshots (replaces old rooms; superset with full PMS fidelity)
-- ---------------------------------------------------------------------------
create table if not exists room_snapshots (
  hotel_id             uuid not null references hotels(id) on delete cascade,
  captured_at          timestamptz not null,
  room_number          text not null,
  room_type_code       text,         -- Hilton's raw code (NKJ / NKSQG / NQJ / ...)
  occ_status           text,         -- 'OCCUPIED' | 'VACANT'
  hsk_status           text,         -- 'READY' | 'DIRTY' | 'INSPECTING' | ...
  guest_name           text,
  addn_guests          text,
  honors_tier          text,         -- 'MEMBER' | 'SILVER' | 'GOLD' | 'DIAMOND' | null
  arrival_date         date,
  departure_date       date,
  rate_plan            text,
  reservation_status   text,         -- 'IN HOUSE' | 'CHECKED OUT' | 'Arrival' | null
  pending_status       text,
  maintenance          text,
  last_occupied        date,
  uploaded_at          timestamptz default now(),
  primary key (hotel_id, captured_at, room_number)
);
create index if not exists room_snapshots_latest_idx on room_snapshots(hotel_id, captured_at desc);
create index if not exists room_snapshots_room_idx   on room_snapshots(hotel_id, room_number);

-- ---------------------------------------------------------------------------
-- Reservation arrivals (arrivals.csv — expected check-ins for the day)
-- ---------------------------------------------------------------------------
create table if not exists reservation_arrivals (
  hotel_id             uuid not null references hotels(id) on delete cascade,
  confirmation_number  text not null,
  arrival_date         date,
  departure_date       date,
  guest_name           text,
  addn_guests          text,
  room_type            text,
  room_number          text,
  rate_plan            text,
  adults               integer,
  children             integer,
  company              text,
  avg_room_rate        numeric(10,2),
  avg_room_taxes       numeric(10,2),
  fee                  numeric(10,2),
  honors_tier          text,
  vip_guest            text,
  guest_tier           text,
  guarantee_type       text,
  arrival_time         text,
  digital_check_in     text,
  add_on               text,
  stay_requests        text,
  booking_remarks      text,
  stay_remarks         text,
  virtual_cc           text,
  uploaded_at          timestamptz default now(),
  primary key (hotel_id, confirmation_number)
);
create index if not exists reservation_arrivals_date_idx on reservation_arrivals(hotel_id, arrival_date desc);

-- ---------------------------------------------------------------------------
-- High-balance alerts (high-balance-reports.csv)
-- ---------------------------------------------------------------------------
create table if not exists high_balance_alerts (
  hotel_id                uuid not null references hotels(id) on delete cascade,
  captured_at             timestamptz not null,
  folio_name              text not null,
  room_number             text,
  guest_name              text,
  guest_tier              text,
  arrival_date            date,
  departure_date          date,
  room_rate               numeric(10,2),
  folio_balance           numeric(14,2),
  credit_balance          numeric(14,2),
  outstanding_balance     numeric(14,2),
  payment_method          text,
  available_credit_limit  numeric(14,2),
  auto_top_off_status     text,
  uploaded_at             timestamptz default now(),
  primary key (hotel_id, captured_at, folio_name)
);
create index if not exists high_balance_alerts_captured_idx on high_balance_alerts(hotel_id, captured_at desc);

-- ---------------------------------------------------------------------------
-- Drop the old rooms table. room_snapshots replaces it with strictly more data.
-- ---------------------------------------------------------------------------
drop table if exists rooms cascade;
