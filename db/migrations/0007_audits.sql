-- StayOps Phase 2B.3 — audit tasks
-- Per-room and per-area audit tasks (annual deep-clean inspections, etc).
-- Findings are stored as a JSONB string array.

create table if not exists audit_tasks (
  id              uuid primary key default gen_random_uuid(),
  legacy_id       text unique,                            -- 'A001' style id from in-memory mock
  hotel_id        uuid not null references hotels(id) on delete cascade,
  room_number     text,
  area            text,
  type            text not null check (type in ('audit','preventive')),
  title           text not null,
  scheduled_date  date not null,
  completed_date  date,
  status          text not null check (status in ('scheduled','in_progress','passed','failed','overdue')),
  score           numeric(5,2),
  findings        jsonb not null default '[]'::jsonb,    -- string[]
  assigned_to     text not null,
  source          text default 'seed',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index if not exists audit_tasks_hotel_idx        on audit_tasks(hotel_id);
create index if not exists audit_tasks_hotel_status_idx on audit_tasks(hotel_id, status);
