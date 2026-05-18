-- ============================================================================
-- Migration 0014 — drop daily_charge_lines (added in 0013, no longer used)
--
-- The OnQ Final Audit parser now uses the charge-mapping taxonomy entirely
-- in-memory to derive daily_revenue / daily_occupancy / payment_method_mix
-- accurately. We do NOT persist a separate granular breakdown table —
-- existing tables flowing through /web/admin (Uploads + Email ingestion)
-- are the only data surfaces.
--
-- payment_method_mix.method_type stays — it's a useful column on an existing
-- table, not a new surface.
-- ============================================================================

drop index if exists daily_charge_lines_unique_idx;
drop index if exists daily_charge_lines_hotel_date_idx;
drop index if exists daily_charge_lines_category_idx;
drop index if exists daily_charge_lines_type_idx;

drop table if exists daily_charge_lines;
