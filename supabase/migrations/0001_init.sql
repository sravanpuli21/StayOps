-- ==============================================================
-- stayops Module 1 (Revenue) — initial schema
-- Paste this into the Supabase SQL Editor to create all tables.
-- Dashboard: https://supabase.com/dashboard/project/dmqirlzwyahcifqjxnqt/sql
-- ==============================================================

-- Extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ==============================================================
-- Tenancy + identity
-- ==============================================================

create table if not exists tenants (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  plan text not null default 'free',
  created_at timestamptz not null default now()
);

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  clerk_id text unique,
  email text not null,
  name text,
  role text not null default 'staff', -- md | regional | gm | staff
  created_at timestamptz not null default now()
);
create index if not exists users_tenant_idx on users(tenant_id);
create index if not exists users_email_idx on users(email);

create table if not exists regions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  slug text not null,
  name text not null,
  director_user_id uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique(tenant_id, slug)
);
create index if not exists regions_tenant_idx on regions(tenant_id);

-- ==============================================================
-- Hotel inventory
-- ==============================================================

create table if not exists hotels (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  code text not null,
  name text not null,
  short_name text not null,
  brand text not null,
  parent_chain text,
  address text,
  city text,
  state text,
  zip text,
  country text default 'US',
  total_rooms integer not null,
  open_date date,
  pms text,                      -- 'onq' | 'opera' | 'choice-advantage' | 'sabre' | 'marsha'
  timezone text default 'America/New_York',
  region_id uuid references regions(id) on delete set null,
  gm_user_id uuid references users(id) on delete set null,
  market_adr numeric(10,2),
  ingest_email text,             -- per-hotel ingest address (stayops-ingest label match later)
  created_at timestamptz not null default now(),
  unique(tenant_id, code)
);
create index if not exists hotels_tenant_idx on hotels(tenant_id);
create index if not exists hotels_region_idx on hotels(region_id);

create table if not exists region_hotels (
  region_id uuid not null references regions(id) on delete cascade,
  hotel_id uuid not null references hotels(id) on delete cascade,
  primary key (region_id, hotel_id)
);

create table if not exists room_types (
  id uuid primary key default gen_random_uuid(),
  hotel_id uuid not null references hotels(id) on delete cascade,
  code text not null,            -- K / Q / KK / QQ / KS / QS / KPD / QPD
  label text not null,
  count integer not null default 0,
  base_rate numeric(10,2),
  unique(hotel_id, code)
);
create index if not exists room_types_hotel_idx on room_types(hotel_id);

-- Annual targets per hotel per fiscal year
create table if not exists annual_targets (
  id uuid primary key default gen_random_uuid(),
  hotel_id uuid not null references hotels(id) on delete cascade,
  fiscal_year integer not null,
  revenue_target numeric(14,2),
  occupancy_target_pct numeric(5,2),
  adr_target numeric(10,2),
  revpar_target numeric(10,2),
  monthly_split jsonb,           -- {"jan":..., "feb":...}
  unique(hotel_id, fiscal_year)
);

-- ==============================================================
-- Daily revenue + occupancy time series (Tier B)
-- One row per hotel per day. Re-ingests upsert.
-- ==============================================================

create table if not exists daily_revenue (
  hotel_id uuid not null references hotels(id) on delete cascade,
  date date not null,
  total_revenue numeric(14,2),
  room_revenue numeric(14,2),
  non_room_revenue numeric(14,2),
  mix_room numeric(14,2),
  mix_fb numeric(14,2),
  mix_retail numeric(14,2),
  mix_events numeric(14,2),
  mix_other numeric(14,2),
  adr numeric(10,2),
  revpar numeric(10,2),
  occupancy_pct numeric(5,2),
  market_adr numeric(10,2),
  health text,                   -- 'green' | 'amber' | 'red'
  source text default 'upload',  -- 'upload' | 'email' | 'api' | 'manual'
  uploaded_by uuid references users(id) on delete set null,
  uploaded_at timestamptz default now(),
  primary key (hotel_id, date)
);
create index if not exists daily_revenue_date_idx on daily_revenue(date desc);

create table if not exists daily_occupancy (
  hotel_id uuid not null references hotels(id) on delete cascade,
  date date not null,
  rooms_sold integer,
  rooms_ooo integer default 0,
  walk_ins integer default 0,
  no_shows integer default 0,
  cancellations integer default 0,
  arrivals integer default 0,
  departures integer default 0,
  stay_overs integer default 0,
  avg_customer_rating numeric(3,2),
  review_count integer default 0,
  primary key (hotel_id, date)
);
create index if not exists daily_occupancy_date_idx on daily_occupancy(date desc);

-- ==============================================================
-- AM/PM snapshots (twice daily per hotel)
-- ==============================================================

create table if not exists am_pm_snapshots (
  id uuid primary key default gen_random_uuid(),
  hotel_id uuid not null references hotels(id) on delete cascade,
  date date not null,
  slot text not null check (slot in ('AM','PM')),
  generated_at timestamptz not null default now(),
  total_rooms integer,
  rooms_sold integer,
  rooms_ooo integer,
  rooms_left_to_sell integer,
  adr numeric(10,2),
  avg_price numeric(10,2),
  revpar numeric(10,2),
  occupancy_pct numeric(5,2),
  unique(hotel_id, date, slot)
);
create index if not exists am_pm_snapshots_hotel_date_idx on am_pm_snapshots(hotel_id, date desc, slot);

create table if not exists am_pm_room_type_rows (
  id uuid primary key default gen_random_uuid(),
  snapshot_id uuid not null references am_pm_snapshots(id) on delete cascade,
  room_type_code text not null,
  label text,
  total integer,
  sold integer,
  ooo integer,
  left_to_sell integer,
  adr numeric(10,2),
  avg_price numeric(10,2),
  revpar numeric(10,2),
  occupancy_pct numeric(5,2)
);
create index if not exists am_pm_rtr_snap_idx on am_pm_room_type_rows(snapshot_id);

-- ==============================================================
-- Intraday pricing stream (Tier C)
-- ==============================================================

create table if not exists rate_events (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  hotel_id uuid not null references hotels(id) on delete cascade,
  room_type_id uuid references room_types(id) on delete set null,
  rate_plan text not null default 'BAR',
  stay_date date not null,
  old_rate numeric(10,2),
  new_rate numeric(10,2) not null,
  changed_at timestamptz not null default now(),
  changed_by uuid references users(id) on delete set null,
  source text default 'manual',  -- 'manual' | 'rms' | 'bulk'
  reason text,
  los_restriction integer,
  min_stay integer
);
create index if not exists rate_events_hotel_stay_idx on rate_events(hotel_id, stay_date, changed_at desc);

create table if not exists competitor_rate_shops (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  hotel_id uuid not null references hotels(id) on delete cascade,
  competitor_name text not null,
  room_type_hint text,
  stay_date date not null,
  bar_rate numeric(10,2) not null,
  shopped_at timestamptz not null default now(),
  source text
);
create index if not exists comp_shops_hotel_stay_idx on competitor_rate_shops(hotel_id, stay_date, shopped_at desc);

create table if not exists reservations (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  hotel_id uuid not null references hotels(id) on delete cascade,
  confirmation_code text,
  room_type_id uuid references room_types(id) on delete set null,
  rate_plan text,
  channel text,                  -- 'direct' | 'expedia' | 'booking' | 'hotels' | 'walk-in' | 'phone'
  arrival_date date not null,
  departure_date date not null,
  nights integer generated always as (departure_date - arrival_date) stored,
  rate_per_night numeric(10,2),
  total_amount numeric(14,2),
  booked_at timestamptz,
  status text default 'active',  -- 'active' | 'cancelled' | 'modified' | 'checked_in' | 'checked_out'
  cancelled_at timestamptz,
  unique(hotel_id, confirmation_code)
);
create index if not exists reservations_hotel_booked_idx on reservations(hotel_id, booked_at desc);
create index if not exists reservations_hotel_arrival_idx on reservations(hotel_id, arrival_date);

create table if not exists reservation_events (
  id uuid primary key default gen_random_uuid(),
  reservation_id uuid not null references reservations(id) on delete cascade,
  event_type text not null check (event_type in ('new','modify','cancel','check_in','check_out')),
  event_at timestamptz not null default now(),
  payload_diff jsonb
);
create index if not exists reservation_events_res_idx on reservation_events(reservation_id, event_at desc);

-- ==============================================================
-- Ingestion audit trail
-- ==============================================================

create table if not exists upload_batches (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  hotel_id uuid references hotels(id) on delete set null,
  uploaded_by uuid references users(id) on delete set null,
  uploaded_at timestamptz not null default now(),
  source text not null,          -- 'email' | 'upload' | 'api'
  source_filename text,
  source_email_from text,
  source_email_subject text,
  source_email_message_id text,
  report_date date,
  report_type text,              -- 'daily_revenue' | 'am_snapshot' | 'pm_snapshot' | 'reservation_activity'
  parser_id text,
  raw_storage_path text,         -- path in supabase storage bucket 'pms-raw'
  status text not null default 'pending', -- 'pending' | 'parsed' | 'failed' | 'duplicate'
  row_count integer default 0,
  warnings jsonb,
  errors jsonb,
  completed_at timestamptz
);
create index if not exists upload_batches_tenant_idx on upload_batches(tenant_id, uploaded_at desc);
create index if not exists upload_batches_status_idx on upload_batches(status);
create index if not exists upload_batches_msg_id_idx on upload_batches(source_email_message_id);
