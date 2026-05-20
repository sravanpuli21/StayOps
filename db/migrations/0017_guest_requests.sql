-- 0017_guest_requests.sql
-- Front-desk guest-request fields layered onto the existing maintenance_tickets
-- table. We model GuestRequest, RoomIssue, and WorkOrder as one row each here
-- (distinguished by `department` + `callback_required`); the "RequestNote"
-- entity lives in the existing `activity` JSONB column.

alter table maintenance_tickets
  add column if not exists department        text,
  add column if not exists request_type      text,
  add column if not exists callback_required boolean not null default false,
  add column if not exists callback_status   text,
  add column if not exists closed_at         timestamptz;

-- Expand status semantics to match the front-desk spec. Drop the old check
-- and recreate it; the legacy values (resolved / pending_part / scheduled)
-- are preserved so existing rows stay valid.
alter table maintenance_tickets
  drop constraint if exists maintenance_tickets_status_check;

alter table maintenance_tickets
  add constraint maintenance_tickets_status_check
  check (status in (
    'open', 'assigned', 'in_progress', 'completed',
    'callback_pending', 'closed', 'reopened', 'escalated',
    'pending_part', 'scheduled', 'resolved'
  ));

-- callback_status is null for tickets that don't need a callback.
alter table maintenance_tickets
  drop constraint if exists maintenance_tickets_callback_status_check;
alter table maintenance_tickets
  add constraint maintenance_tickets_callback_status_check
  check (callback_status is null or callback_status in ('pending', 'confirmed', 'not_available', 'reopened'));

create index if not exists tickets_callback_idx
  on maintenance_tickets (hotel_id, status)
  where status = 'callback_pending';

create index if not exists tickets_dept_idx
  on maintenance_tickets (hotel_id, department, status);
