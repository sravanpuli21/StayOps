-- ============================================================================
-- Migration 0013 — daily_charge_lines + payment_method_mix.method_type
--
-- Adds the granular per-row breakdown table that the Hilton OnQ Final Audit
-- parser populates from the user's category/type/subtype taxonomy. The same
-- taxonomy also tags every payment_method_mix row via a new method_type
-- column, so dashboards can filter by Cash / Card / hilton / DirectBill /
-- adjustments without re-classifying client-side.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- daily_charge_lines — one row per (hotel, date, category, type, subtype, label)
-- ---------------------------------------------------------------------------
create table if not exists daily_charge_lines (
  id              uuid primary key default gen_random_uuid(),
  hotel_id        uuid not null references hotels(id) on delete cascade,
  date            date not null,
  category        text not null,                -- 'Revenue' | 'Taxes' | 'Payment Methods' | 'Room Status' | 'Rooms Availability' | 'Occupancy' | 'KPI'
  type            text not null,                -- 'Room Revenue' | 'F&B' | 'Other' | 'Events' | 'Misc' | 'CITY' | 'Cash' | 'Card' | 'OOO' | 'Occupancy %' | etc.
  subtype         text,                         -- 'Room Direct Revenue' | 'Restaurant' | 'Pet Charges' | etc. (nullable)
  label           text not null,                -- original row label, e.g. 'GUEST ROOM', 'EXTRA ADULT', for traceability
  today           numeric(14,2),
  mtd             numeric(14,2),
  ytd             numeric(14,2),
  source          text,                         -- 'email' | 'upload' | 'api' | 'manual' (matches ApplyContext)
  uploaded_by     text,
  uploaded_at     timestamptz not null default now()
);

-- Postgres doesn't allow expressions in UNIQUE table constraints, so we use
-- a unique INDEX with coalesce so a null subtype is treated as '' for
-- conflict resolution (matching `on conflict (... coalesce(subtype,''), ...)`).
create unique index if not exists daily_charge_lines_unique_idx
  on daily_charge_lines (hotel_id, date, category, type, coalesce(subtype, ''), label);

create index if not exists daily_charge_lines_hotel_date_idx
  on daily_charge_lines (hotel_id, date desc);
create index if not exists daily_charge_lines_category_idx
  on daily_charge_lines (hotel_id, date, category);
create index if not exists daily_charge_lines_type_idx
  on daily_charge_lines (hotel_id, date, category, type);

-- ---------------------------------------------------------------------------
-- payment_method_mix.method_type — taxonomy bucket
-- ---------------------------------------------------------------------------
alter table payment_method_mix
  add column if not exists method_type text;

comment on column payment_method_mix.method_type is
  'Taxonomy bucket from charge-mapping: Cash | Card | hilton | DirectBill | adjustments';
