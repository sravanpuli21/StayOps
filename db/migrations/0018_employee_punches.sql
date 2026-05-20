-- 0018_employee_punches.sql
-- Punch in / punch out for hotel staff. PIN-only auth on a shared kiosk PC.
-- Each employee belongs to one hotel; punches are timestamped and typed
-- (in / out). No break tracking yet — that's a follow-up.

create table if not exists employees (
  id            uuid primary key default gen_random_uuid(),
  hotel_id      uuid not null references hotels(id) on delete cascade,
  /** Short numeric/text id the employee enters at the kiosk. */
  employee_id   text not null,
  full_name     text not null,
  department    text,
  pin_hash      text not null,
  pin_salt      text not null,
  active        boolean not null default true,
  created_at    timestamptz not null default now(),
  unique (hotel_id, employee_id)
);
create index if not exists employees_hotel_idx on employees(hotel_id);

create table if not exists employee_punches (
  id           uuid primary key default gen_random_uuid(),
  hotel_id     uuid not null references hotels(id) on delete cascade,
  employee_id  uuid not null references employees(id) on delete cascade,
  kind         text not null check (kind in ('in','out')),
  punched_at   timestamptz not null default now(),
  source       text default 'kiosk'
);
create index if not exists employee_punches_hotel_idx on employee_punches(hotel_id, punched_at desc);
create index if not exists employee_punches_employee_idx on employee_punches(employee_id, punched_at desc);
