import 'server-only';
import { db, getHosTenantId } from '@/lib/db/client';
import type { MaintenanceTicket, TicketStatus } from '@hos/shared';
import { rowToTicket } from './insert-ticket';

const ID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Resolve a ticket id (uuid or legacy 'T001' style) to its uuid + hotel
 * code, scoped to the HOS tenant. Returns null if the id is unknown.
 */
async function resolveTicket(id: string): Promise<{ uuid: string; code: string } | null> {
  const tenantId = await getHosTenantId();
  if (!tenantId) return null;
  const isUuid = ID_RE.test(id);
  const [row] = await db<{ id: string; code: string }[]>`
    select t.id::text as id, h.code
      from maintenance_tickets t
      join hotels h on h.id = t.hotel_id
     where h.tenant_id = ${tenantId}
       ${isUuid ? db`and t.id = ${id}::uuid` : db`and t.legacy_id = ${id}`}
     limit 1
  `;
  if (!row) return null;
  return { uuid: row.id, code: row.code };
}

async function readTicket(uuid: string, code: string): Promise<MaintenanceTicket | null> {
  const tenantId = await getHosTenantId();
  if (!tenantId) return null;
  const [row] = await db<Array<Parameters<typeof rowToTicket>[1]>>`
    select t.id::text as id, t.legacy_id, t.room_number, t.area, t.type, t.priority, t.status,
           t.title, t.description, t.reported_by, t.assigned_to,
           t.estimated_cost, t.revenue_lost, t.activity,
           t.department, t.request_type, t.callback_required, t.callback_status,
           t.closed_at::text as closed_at,
           t.created_at::text as created_at,
           t.updated_at::text as updated_at
      from maintenance_tickets t
      join hotels h on h.id = t.hotel_id
     where t.id = ${uuid}::uuid
       and h.tenant_id = ${tenantId}
     limit 1
  `;
  return row ? rowToTicket(code, row) : null;
}

interface ActivityEntry {
  timestamp: string;
  actor: string;
  action: string;
  note?: string;
}

async function appendActivity(uuid: string, entry: ActivityEntry): Promise<void> {
  // Match the literal-shape Record postgres.js's JSONValue accepts (primitives
  // only, no `unknown`). Build a one-element jsonb array on the SQL side.
  const payload: { timestamp: string; actor: string; action: string; note?: string } = entry;
  await db`
    update maintenance_tickets
       set activity = coalesce(activity, '[]'::jsonb)
                      || jsonb_build_array(${db.json(payload)}::jsonb),
           updated_at = now()
     where id = ${uuid}::uuid
  `;
}

/**
 * Change a ticket's status. When transitioning to 'closed', also stamps
 * closed_at. When transitioning to 'callback_pending', sets callback_status
 * to 'pending' if it isn't already set.
 */
export async function updateTicketStatus(
  id: string,
  status: TicketStatus,
  note: string | undefined,
  actor: string,
): Promise<MaintenanceTicket | null> {
  const t = await resolveTicket(id);
  if (!t) return null;

  await db`
    update maintenance_tickets
       set status = ${status},
           closed_at = case when ${status} = 'closed' then now() else closed_at end,
           callback_status = case
             when ${status} = 'callback_pending' and callback_status is null then 'pending'
             when ${status} = 'reopened' then 'reopened'
             else callback_status
           end,
           updated_at = now()
     where id = ${t.uuid}::uuid
  `;

  await appendActivity(t.uuid, {
    timestamp: new Date().toISOString(),
    actor,
    action: `status:${status}`,
    ...(note ? { note } : {}),
  });

  return readTicket(t.uuid, t.code);
}

/** Append a free-text note to a ticket's activity log. */
export async function addTicketNote(
  id: string,
  note: string,
  actor: string,
): Promise<MaintenanceTicket | null> {
  const t = await resolveTicket(id);
  if (!t) return null;
  await appendActivity(t.uuid, {
    timestamp: new Date().toISOString(),
    actor,
    action: 'note',
    note,
  });
  return readTicket(t.uuid, t.code);
}

/**
 * Apply a front-desk callback action.
 *   confirmed     → callback_status='confirmed', status='closed', closed_at=now
 *   not_available → callback_status stays 'pending' (caller can call again later);
 *                   we still record the activity entry
 *   reopen        → callback_status='reopened', status='reopened'
 */
export async function applyCallbackAction(
  id: string,
  action: 'confirmed' | 'not_available' | 'reopen',
  note: string | undefined,
  actor: string,
): Promise<MaintenanceTicket | null> {
  const t = await resolveTicket(id);
  if (!t) return null;

  if (action === 'confirmed') {
    await db`
      update maintenance_tickets
         set status = 'closed',
             callback_status = 'confirmed',
             closed_at = now(),
             updated_at = now()
       where id = ${t.uuid}::uuid
    `;
  } else if (action === 'reopen') {
    await db`
      update maintenance_tickets
         set status = 'reopened',
             callback_status = 'reopened',
             updated_at = now()
       where id = ${t.uuid}::uuid
    `;
  } else {
    // not_available — just touch updated_at and log activity below.
    await db`
      update maintenance_tickets
         set updated_at = now()
       where id = ${t.uuid}::uuid
    `;
  }

  await appendActivity(t.uuid, {
    timestamp: new Date().toISOString(),
    actor,
    action: `callback:${action}`,
    ...(note ? { note } : {}),
  });

  return readTicket(t.uuid, t.code);
}
