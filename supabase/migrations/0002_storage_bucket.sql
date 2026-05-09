-- ==============================================================
-- Storage bucket for raw PMS files (emails + manual uploads)
-- Run AFTER 0001_init.sql. Idempotent.
-- ==============================================================

-- Create the bucket (private by default)
insert into storage.buckets (id, name, public)
values ('pms-raw', 'pms-raw', false)
on conflict (id) do nothing;
