-- StayOps Phase 2 cleanup — front-desk employee records
-- Single-table design with a record_type discriminator. Each (employee_email,
-- record_type) row stores its payload as JSONB. Fine for the current scale
-- (one employee × ten record types = 10 rows). Promote to per-record tables
-- if/when we onboard a real workforce-management feed.

create table if not exists employee_records (
  employee_email  text not null,
  record_type     text not null check (record_type in (
    'profile','schedule','clock_log','availability','paystubs','bonuses',
    'colleagues','open_shifts','swap_requests','sops'
  )),
  data            jsonb not null,
  updated_at      timestamptz not null default now(),
  primary key (employee_email, record_type)
);
create index if not exists employee_records_type_idx on employee_records(record_type);
