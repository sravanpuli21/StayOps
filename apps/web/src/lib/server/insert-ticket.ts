import 'server-only';
import { db, getHosTenantId } from '@/lib/db/client';
import type { MaintenanceTicket, CreateTicketRequest } from '@hos/shared';

/**
 * Insert a guest request / room issue / maintenance ticket from the
 * front-desk UI. Resolves the hotel code → uuid in the HOS tenant, then
 * inserts a row with status='open' (or 'assigned' if a department is given)
 * and source='front-desk'. Writes the initial activity entry into the
 * activity JSONB column.
 *
 * Returns the inserted row in the MaintenanceTicket shape that
 * queryTickets() emits, so the client can prepend it to the list without
 * a round-trip.
 */
export async function insertTicket(input: CreateTicketRequest): Promise<MaintenanceTicket | null> {
  const tenantId = await getHosTenantId();
  if (!tenantId) return null;

  const [hotel] = await db<{ id: string; code: string }[]>`
    select id, code from hotels
     where tenant_id = ${tenantId} and code = ${input.hotelCode}
     limit 1
  `;
  if (!hotel) return null;

  const reportedBy = input.reportedBy?.trim() || 'Front Desk';
  // If a department was chosen, we treat the ticket as routed → 'assigned'.
  // Otherwise it sits in 'open' until someone owns it.
  const initialStatus = input.department ? 'assigned' : 'open';
  const callbackRequired = input.callbackRequired ?? false;
  const callbackStatus = callbackRequired ? 'pending' : null;

  const activity = [
    {
      timestamp: new Date().toISOString(),
      actor: reportedBy,
      action: 'created',
      ...(input.description ? { note: input.description } : {}),
    },
  ];

  const [row] = await db<Array<{
    id: string;
    legacy_id: string | null;
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
    insert into maintenance_tickets (
      hotel_id, room_number, area, type, priority, status,
      title, description, reported_by, activity, source,
      department, request_type, callback_required, callback_status
    ) values (
      ${hotel.id},
      ${input.roomNumber ?? null},
      ${input.area ?? null},
      ${input.type},
      ${input.priority},
      ${initialStatus},
      ${input.title},
      ${input.description ?? null},
      ${reportedBy},
      ${db.json(activity)},
      'front-desk',
      ${input.department ?? null},
      ${input.requestType ?? null},
      ${callbackRequired},
      ${callbackStatus}
    )
    returning id::text as id, legacy_id, room_number, area, type, priority, status,
              title, description, reported_by, assigned_to,
              estimated_cost, revenue_lost, activity,
              department, request_type, callback_required, callback_status,
              closed_at::text as closed_at,
              created_at::text as created_at,
              updated_at::text as updated_at
  `;

  return rowToTicket(hotel.code, row);
}

/** Shared mapper so insert + status-update endpoints return the same shape. */
export function rowToTicket(
  hotelCode: string,
  row: {
    id: string;
    legacy_id: string | null;
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
  },
): MaintenanceTicket {
  return {
    // Prefer the legacy id when present (matches seed-data references) but
    // fall back to the row's uuid so new rows have a stable identifier the
    // front-desk PATCH endpoints can use.
    id:              row.legacy_id ?? row.id,
    hotelId:         hotelCode,
    roomNumber:      row.room_number ?? undefined,
    area:            row.area ?? undefined,
    type:            row.type as MaintenanceTicket['type'],
    priority:        row.priority as MaintenanceTicket['priority'],
    status:          row.status as MaintenanceTicket['status'],
    title:           row.title,
    description:     row.description ?? '',
    reportedBy:      row.reported_by ?? '',
    assignedTo:      row.assigned_to ?? undefined,
    createdAt:       row.created_at,
    updatedAt:       row.updated_at,
    closedAt:        row.closed_at ?? undefined,
    estimatedCost:   row.estimated_cost == null ? undefined : Number(row.estimated_cost),
    revenueLost:     row.revenue_lost   == null ? undefined : Number(row.revenue_lost),
    activity:        Array.isArray(row.activity) ? (row.activity as MaintenanceTicket['activity']) : [],
    department:      (row.department as MaintenanceTicket['department']) ?? undefined,
    requestType:     row.request_type ?? undefined,
    callbackRequired: row.callback_required,
    callbackStatus:  (row.callback_status as MaintenanceTicket['callbackStatus']) ?? null,
  };
}
