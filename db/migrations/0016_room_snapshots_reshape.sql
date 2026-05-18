-- 0016_room_snapshots_reshape.sql
-- Slim room_snapshots to the user's spec:
--   room_number, raw_occ_status, raw_reservation_status,
--   category, type, subtype, match_status
-- Plus core infra columns (hotel_id, captured_at, uploaded_at).
--
-- Drops PII fields (guest_name, addn_guests, honors_tier) and other rarely
-- used columns. Existing data is wiped in the process — re-upload room-
-- details CSVs to repopulate.

drop table if exists room_snapshots;

create table room_snapshots (
  hotel_id                uuid not null references hotels(id) on delete cascade,
  captured_at             timestamptz not null,
  room_number             text not null,
  raw_occ_status          text,
  raw_reservation_status  text,
  category                text not null default 'RoomStatus',
  type                    text not null,
  subtype                 text,
  match_status            text not null,
  uploaded_at             timestamptz not null default now(),
  primary key (hotel_id, captured_at, room_number)
);
create index room_snapshots_hotel_idx on room_snapshots(hotel_id);
create index room_snapshots_type_idx  on room_snapshots(hotel_id, type);
create index room_snapshots_review_idx on room_snapshots(hotel_id) where match_status = 'Needs Review';
