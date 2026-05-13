import 'server-only';
import { db, getHosTenantId } from '@/lib/db/client';
import type { MaintenanceTicket } from '@hos/shared';

/**
 * Read maintenance tickets from Postgres.
 * `getActiveTicketsForHotel` semantics — when `hotelCode` is set, returns
 * only tickets whose status != 'resolved' (matches the legacy in-memory
 * helper). When null, returns all tickets across all hotels.
 */
export async function queryTickets(hotelCode: string | null, activeOnly = true): Promise<MaintenanceTicket[]> {
  const tenantId = await getHosTenantId();

  const rows = await db<Array<{
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
    created_at: string;
    updated_at: string;
  }>>`
    select t.legacy_id, h.code,
           t.room_number, t.area, t.type, t.priority, t.status,
           t.title, t.description, t.reported_by, t.assigned_to,
           t.estimated_cost, t.revenue_lost, t.activity,
           t.created_at::text as created_at,
           t.updated_at::text as updated_at
    from maintenance_tickets t
    join hotels h on h.id = t.hotel_id
    where h.tenant_id = ${tenantId}
      ${hotelCode ? db`and h.code = ${hotelCode}` : db``}
      ${activeOnly && hotelCode ? db`and t.status <> 'resolved'` : db``}
    order by t.created_at desc
  `;

  return rows.map((r) => ({
    id:             r.legacy_id ?? '',
    hotelId:        r.code,
    roomNumber:     r.room_number ?? undefined,
    area:           r.area ?? undefined,
    type:           r.type as MaintenanceTicket['type'],
    priority:       r.priority as MaintenanceTicket['priority'],
    status:         r.status as MaintenanceTicket['status'],
    title:          r.title,
    description:    r.description ?? '',
    reportedBy:     r.reported_by ?? '',
    assignedTo:     r.assigned_to ?? undefined,
    createdAt:      r.created_at,
    updatedAt:      r.updated_at,
    estimatedCost:  r.estimated_cost == null ? undefined : Number(r.estimated_cost),
    revenueLost:    r.revenue_lost   == null ? undefined : Number(r.revenue_lost),
    activity:       Array.isArray(r.activity) ? (r.activity as MaintenanceTicket['activity']) : [],
  }));
}
