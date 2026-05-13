-- StayOps Phase 2B.1 — rooms table
-- Per-room operational state: status, housekeeping status, last-cleaned timestamps.
-- Used by Emma's housekeeping grid, Sydney's maintenance grid, and the Harshal/
-- Rishab operations pages.

create table if not exists rooms (
  hotel_id        uuid not null references hotels(id) on delete cascade,
  number          text not null,
  floor           integer not null,
  type            text not null check (type in ('King','Queen','Suite')),
  status          text not null check (status in ('ready','dirty','inspecting','ooo','blocked','occupied')),
  hk_status       text not null check (hk_status in ('clean','dirty','inspected')),
  last_cleaned    timestamptz,
  last_inspected  timestamptz,
  has_open_ticket boolean not null default false,
  ooo_reason      text,
  last_guest_rating numeric(3,2),
  primary key (hotel_id, number)
);
create index if not exists rooms_hotel_idx       on rooms(hotel_id);
create index if not exists rooms_status_idx      on rooms(hotel_id, status);
create index if not exists rooms_hk_status_idx   on rooms(hotel_id, hk_status);
