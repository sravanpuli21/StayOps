import 'server-only';
import { db, getHosTenantId } from '@/lib/db/client';
import type { MaintenanceTicket } from '@hos/shared';
import { rowToTicket } from './insert-ticket';

/**
 * Read maintenance / guest-request tickets from Postgres.
 *
 * `getActiveTicketsForHotel` semantics — when `hotelCode` is set, returns
 * only tickets whose status is not in the terminal set (closed / resolved).
 * When null, returns all tickets across all hotels in the HOS tenant.
 */
const TERMINAL_STATUSES = ['closed', 'resolved'] as const;

export async function queryTickets(
  hotelCode: string | null,
  activeOnly = true,
): Promise<MaintenanceTicket[]> {
  const tenantId = await getHosTenantId();
  if (!tenantId) return [];

  const rows = await db<Array<{
    id: string;
    legacy_id: string | null;
    code: string;
    room_number: string | null;
    area: string | null;
    type: string;
    priority: string;
    status: string;
    title: string;
    description: string | null;
    reported_by: string | null;
    assigned_to: string | null;
    estimated_cost: string | null;
    revenue_lost: string | null;
    activity: unknown;
    department: string | null;
    request_type: string | null;
    callback_required: boolean;
    callback_status: string | null;
    closed_at: string | null;
    created_at: string;
    updated_at: string;
  }>>`
    select t.id::text as id, t.legacy_id, h.code,
           t.room_number, t.area, t.type, t.priority, t.status,
           t.title, t.description, t.reported_by, t.assigned_to,
           t.estimated_cost, t.revenue_lost, t.activity,
           t.department, t.request_type, t.callback_required, t.callback_status,
           t.closed_at::text as closed_at,
           t.created_at::text as created_at,
           t.updated_at::text as updated_at
    from maintenance_tickets t
    join hotels h on h.id = t.hotel_id
    where h.tenant_id = ${tenantId}
      ${hotelCode ? db`and h.code = ${hotelCode}` : db``}
      ${activeOnly && hotelCode ? db`and t.status <> all(${TERMINAL_STATUSES})` : db``}
    order by t.created_at desc
  `;

  return rows.map((r) => rowToTicket(r.code, r));
}
