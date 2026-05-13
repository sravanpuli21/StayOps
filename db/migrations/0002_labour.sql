-- StayOps Phase 1.A — labour tables (per-period roll-ups + department splits)
-- Phase-0 didn't have labour; first slice introduces it.

create table if not exists labour_periods (
  hotel_id        uuid not null references hotels(id) on delete cascade,
  period_end      date not null,
  period_start    date not null,
  scheduled_hours numeric(10,2) not null default 0,
  clocked_hours   numeric(10,2) not null default 0,
  variance_hours  numeric(10,2) generated always as (clocked_hours - scheduled_hours) stored,
  overtime_hours  numeric(10,2) not null default 0,
  payroll_cost    numeric(14,2) not null default 0,
  health          text,                              -- 'green' | 'amber' | 'red'
  source          text default 'upload',
  uploaded_by     uuid references users(id) on delete set null,
  uploaded_at     timestamptz default now(),
  primary key (hotel_id, period_end)
);
create index if not exists labour_periods_period_end_idx on labour_periods(period_end desc);

create table if not exists labour_departments (
  hotel_id        uuid not null references hotels(id) on delete cascade,
  period_end      date not null,
  department      text not null check (department in
    ('Housekeeping','Front Desk','Kitchen','Maintenance','Market','Event Space')),
  scheduled_hours numeric(10,2) not null default 0,
  clocked_hours   numeric(10,2) not null default 0,
  overtime_hours  numeric(10,2) not null default 0,
  payroll_cost    numeric(14,2) not null default 0,
  primary key (hotel_id, period_end, department),
  foreign key (hotel_id, period_end) references labour_periods(hotel_id, period_end) on delete cascade
);
