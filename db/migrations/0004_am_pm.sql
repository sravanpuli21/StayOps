-- StayOps Phase 2A — AM/PM snapshot tables
-- Twice-daily room snapshots per hotel (9 AM and 9 PM by convention).
-- The AM/PM CSV parser already exists; this migration is what unblocks
-- writes from /api/uploads + /api/inbox/cron into actual rows.

create table if not exists am_pm_snapshots (
  id                  uuid primary key default gen_random_uuid(),
  hotel_id            uuid not null references hotels(id) on delete cascade,
  date                date not null,
  slot                text not null check (slot in ('AM','PM')),
  generated_at        timestamptz not null default now(),
  total_rooms         integer,
  rooms_sold          integer,
  rooms_ooo           integer,
  rooms_left_to_sell  integer,
  adr                 numeric(10,2),
  avg_price           numeric(10,2),
  revpar              numeric(10,2),
  occupancy_pct       numeric(5,2),
  source              text default 'upload',
  uploaded_by         uuid references users(id) on delete set null,
  uploaded_at         timestamptz not null default now(),
  unique(hotel_id, date, slot)
);
create index if not exists am_pm_snapshots_hotel_date_idx on am_pm_snapshots(hotel_id, date desc, slot);

create table if not exists am_pm_room_type_rows (
  id                uuid primary key default gen_random_uuid(),
  snapshot_id       uuid not null references am_pm_snapshots(id) on delete cascade,
  room_type_code    text not null,
  label             text,
  total             integer,
  sold              integer,
  ooo               integer,
  left_to_sell      integer,
  adr               numeric(10,2),
  avg_price         numeric(10,2),
  revpar            numeric(10,2),
  occupancy_pct     numeric(5,2)
);
create index if not exists am_pm_rtr_snap_idx on am_pm_room_type_rows(snapshot_id);
