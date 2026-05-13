-- Dedupe users table (seed re-runs created duplicates pre-constraint),
-- then add a (tenant_id, email) unique constraint so future ON CONFLICT works.

with ranked as (
  select id, tenant_id, email,
         row_number() over (partition by tenant_id, email order by created_at) as rn
  from users
)
delete from users u
using ranked r
where u.id = r.id and r.rn > 1;

alter table users
  add constraint users_tenant_email_uq unique (tenant_id, email);
