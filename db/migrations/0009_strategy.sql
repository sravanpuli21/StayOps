-- StayOps Phase 2 cleanup — strategy module tables
-- Annual portfolio targets, per-hotel targets, strategic initiatives, capex
-- pipeline. Stored as JSONB rows keyed by legacy id while the schema settles.
--
-- Note: phase-1 init created an `annual_targets` table for a different
-- purpose (per-hotel fiscal-year targets, currently unused). The strategy
-- module uses portfolio-wide records; we namespace these as `strategy_*`
-- to avoid the collision.

create table if not exists strategy_annual_targets (
  legacy_id   text primary key,
  data        jsonb not null,
  updated_at  timestamptz not null default now()
);

create table if not exists strategy_hotel_targets (
  legacy_id   text primary key,
  data        jsonb not null,
  updated_at  timestamptz not null default now()
);

create table if not exists strategy_initiatives (
  legacy_id   text primary key,
  data        jsonb not null,
  updated_at  timestamptz not null default now()
);

create table if not exists strategy_capex (
  legacy_id   text primary key,
  data        jsonb not null,
  updated_at  timestamptz not null default now()
);
