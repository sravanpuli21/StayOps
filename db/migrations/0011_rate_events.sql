-- StayOps Phase 2 — Rate Manager (Rishab BAR change tracking)
-- One row per stay-date per rate change. POSTed by /api/rates/log.

create table if not exists rate_events (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid not null references tenants(id) on delete cascade,
  hotel_id    uuid not null references hotels(id) on delete cascade,
  rate_plan   text not null default 'BAR',
  stay_date   date not null,
  old_rate    numeric(10,2),
  new_rate    numeric(10,2) not null,
  source      text default 'manual',                    -- 'manual' | 'rms' | 'bulk'
  reason      text,
  changed_at  timestamptz not null default now(),
  changed_by  uuid references users(id) on delete set null
);
create index if not exists rate_events_hotel_stay_idx on rate_events(hotel_id, stay_date desc, changed_at desc);
create index if not exists rate_events_changed_at_idx on rate_events(changed_at desc);
