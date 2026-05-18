-- 0015_night_audit_rows.sql
-- Per-row records for every Hilton OnQ Final Audit (hotel night audit) CSV.
-- Stores the user's authoritative 4-level taxonomy:
--   category > type > subtype_group > subtype
-- Unmapped rows are kept as match_status='Needs Review' so we surface, not drop.
-- Duplicates within a single file are preserved (no unique constraint).

create table if not exists night_audit_rows (
  id                uuid primary key default gen_random_uuid(),
  hotel_id          uuid not null references hotels(id) on delete cascade,
  report_date       date not null,
  source_file_name  text,
  source_table      text,                       -- 'Charge Type' | 'Tax Type' | 'Payment Method' | 'Type'
  source_row_name   text not null,              -- original label, e.g. 'GUEST ROOM'
  category          text,
  type              text,
  subtype_group     text,
  subtype           text,
  value_today       numeric(14,2),
  value_mtd         numeric(14,2),
  value_ytd         numeric(14,2),
  match_status      text not null,              -- 'Mapped' | 'Needs Review'
  uploaded_at       timestamptz not null default now()
);

create index if not exists night_audit_rows_hotel_date_idx
  on night_audit_rows (hotel_id, report_date desc);
create index if not exists night_audit_rows_category_idx
  on night_audit_rows (hotel_id, report_date, category);
create index if not exists night_audit_rows_review_idx
  on night_audit_rows (hotel_id, report_date)
  where match_status = 'Needs Review';
