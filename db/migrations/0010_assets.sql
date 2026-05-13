-- StayOps Phase 2 cleanup — assets, asset summaries, vendor spend.
-- All three are list-shaped JSONB-keyed records consumed by Sydney's
-- assets page and Harshal's assets dashboard.

create table if not exists assets (
  legacy_id   text primary key,
  hotel_id    uuid references hotels(id) on delete cascade,
  data        jsonb not null,
  updated_at  timestamptz not null default now()
);
create index if not exists assets_hotel_idx on assets(hotel_id);

create table if not exists asset_hotel_summaries (
  hotel_id    uuid primary key references hotels(id) on delete cascade,
  data        jsonb not null,
  updated_at  timestamptz not null default now()
);

create table if not exists vendor_spends (
  legacy_id   text primary key,
  data        jsonb not null,
  updated_at  timestamptz not null default now()
);
