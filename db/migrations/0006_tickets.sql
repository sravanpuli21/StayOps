-- StayOps Phase 2B.2 — maintenance tickets
-- Tickets cover both reactive (something broken) and preventive (scheduled
-- maintenance) work. Activity log lives as JSONB on the ticket row — for
-- timeline rendering only, not for query filtering.

create table if not exists maintenance_tickets (
  id              uuid primary key default gen_random_uuid(),
  legacy_id       text unique,                            -- 'T001' style id from in-memory mock; preserved for FK from old data
  hotel_id        uuid not null references hotels(id) on delete cascade,
  room_number     text,
  area            text,
  type            text not null check (type in ('reactive','preventive','audit','escalation')),
  priority        text not null check (priority in ('urgent','high','normal','low')),
  status          text not null check (status in ('open','in_progress','pending_part','resolved','escalated','scheduled')),
  title           text not null,
  description     text,
  reported_by     text,
  assigned_to     text,
  estimated_cost  numeric(10,2),
  revenue_lost    numeric(10,2),
  activity        jsonb not null default '[]'::jsonb,    -- [{timestamp, actor, action, note?}, ...]
  source          text default 'seed',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index if not exists tickets_hotel_idx        on maintenance_tickets(hotel_id);
create index if not exists tickets_hotel_status_idx on maintenance_tickets(hotel_id, status);
create index if not exists tickets_hotel_room_idx   on maintenance_tickets(hotel_id, room_number) where room_number is not null;
