-- StayOps Phase 1.A — initial schema (Neon)
-- Trimmed from phase-0 commit 6c2006c to the first slice:
--   tenants/users/regions/hotels/region_hotels/annual_targets,
--   daily_revenue, daily_occupancy, upload_batches.
-- AM/PM, rates, reservations, room_types, comp shops are deferred to Phase 2.

create extension if not exists "pgcrypto";

-- ─── Tenancy + identity ──────────────────────────────────────────────────────

create table if not exists tenants (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  name        text not null,
  plan        text not null default 'free',
  created_at  timestamptz not null default now()
);

create table if not exists users (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid not null references tenants(id) on delete cascade,
  clerk_id    text unique,
  email       text not null,
  name        text,
  role        text not null default 'staff',          -- md | regional | gm | staff
  created_at  timestamptz not null default now()
);
create index if not exists users_tenant_idx on users(tenant_id);
create index if not exists users_email_idx  on users(email);

create table if not exists regions (
  id                uuid primary key default gen_random_uuid(),
  tenant_id         uuid not null references tenants(id) on delete cascade,
  slug              text not null,
  name              text not null,
  director_user_id  uuid references users(id) on delete set null,
  created_at        timestamptz not null default now(),
  unique(tenant_id, slug)
);
create index if not exists regions_tenant_idx on regions(tenant_id);

-- ─── Hotel inventory ─────────────────────────────────────────────────────────

create table if not exists hotels (
  id              uuid primary key default gen_random_uuid(),
  tenant_id       uuid not null references tenants(id) on delete cascade,
  code            text not null,
  name            text not null,
  short_name      text not null,
  brand           text not null,
  parent_chain    text,
  city            text,
  state           text,
  country         text default 'US',
  total_rooms     integer not null,
  pms             text,                                -- 'onq' | 'opera' | 'choice-advantage' | 'sabre' | 'marsha'
  timezone        text default 'America/New_York',
  region_id       uuid references regions(id) on delete set null,
  gm_user_id      uuid references users(id) on delete set null,
  market_adr      numeric(10,2),
  ingest_email    text,
  created_at      timestamptz not null default now(),
  unique(tenant_id, code)
);
create index if not exists hotels_tenant_idx on hotels(tenant_id);
create index if not exists hotels_region_idx on hotels(region_id);

create table if not exists region_hotels (
  region_id  uuid not null references regions(id) on delete cascade,
  hotel_id   uuid not null references hotels(id)  on delete cascade,
  primary key (region_id, hotel_id)
);

create table if not exists annual_targets (
  id                    uuid primary key default gen_random_uuid(),
  hotel_id              uuid not null references hotels(id) on delete cascade,
  fiscal_year           integer not null,
  revenue_target        numeric(14,2),
  occupancy_target_pct  numeric(5,2),
  adr_target            numeric(10,2),
  revpar_target         numeric(10,2),
  monthly_split         jsonb,
  unique(hotel_id, fiscal_year)
);

-- ─── Daily revenue + occupancy time series ───────────────────────────────────
-- One row per hotel per day. Re-ingests upsert via primary key.

create table if not exists daily_revenue (
  hotel_id          uuid not null references hotels(id) on delete cascade,
  date              date not null,
  total_revenue     numeric(14,2),
  room_revenue      numeric(14,2),
  non_room_revenue  numeric(14,2),
  mix_room          numeric(14,2),
  mix_fb            numeric(14,2),
  mix_retail        numeric(14,2),
  mix_events        numeric(14,2),
  mix_other         numeric(14,2),
  adr               numeric(10,2),
  revpar            numeric(10,2),
  occupancy_pct     numeric(5,2),
  market_adr        numeric(10,2),
  health            text,                              -- 'green' | 'amber' | 'red'
  source            text default 'upload',             -- 'upload' | 'email' | 'api' | 'manual' | 'seed'
  uploaded_by       uuid references users(id) on delete set null,
  uploaded_at       timestamptz default now(),
  primary key (hotel_id, date)
);
create index if not exists daily_revenue_date_idx on daily_revenue(date desc);

create table if not exists daily_occupancy (
  hotel_id              uuid not null references hotels(id) on delete cascade,
  date                  date not null,
  rooms_sold            integer,
  rooms_ooo             integer default 0,
  walk_ins              integer default 0,
  no_shows              integer default 0,
  cancellations         integer default 0,
  arrivals              integer default 0,
  departures            integer default 0,
  stay_overs            integer default 0,
  avg_customer_rating   numeric(3,2),
  review_count          integer default 0,
  primary key (hotel_id, date)
);
create index if not exists daily_occupancy_date_idx on daily_occupancy(date desc);

-- ─── Ingestion audit trail ───────────────────────────────────────────────────

create table if not exists upload_batches (
  id                          uuid primary key default gen_random_uuid(),
  tenant_id                   uuid not null references tenants(id) on delete cascade,
  hotel_id                    uuid references hotels(id) on delete set null,
  uploaded_by                 uuid references users(id) on delete set null,
  uploaded_at                 timestamptz not null default now(),
  source                      text not null,           -- 'email' | 'upload' | 'api'
  source_filename             text,
  source_email_from           text,
  source_email_subject        text,
  source_email_message_id     text,
  report_date                 date,
  report_type                 text,                    -- 'daily_revenue' | 'labour' | 'am_snapshot' | etc.
  parser_id                   text,
  status                      text not null default 'pending', -- 'pending' | 'parsed' | 'failed' | 'duplicate'
  row_count                   integer default 0,
  warnings                    jsonb,
  errors                      jsonb,
  completed_at                timestamptz
);
create index if not exists upload_batches_tenant_idx     on upload_batches(tenant_id, uploaded_at desc);
create index if not exists upload_batches_status_idx     on upload_batches(status);
create index if not exists upload_batches_msg_id_idx     on upload_batches(source_email_message_id);
