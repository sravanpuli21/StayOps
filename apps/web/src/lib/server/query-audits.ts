import 'server-only';
import { db, getHosTenantId } from '@/lib/db/client';
import type { AuditTask } from '@hos/shared';

/**
 * Audit tasks (annual deep-clean inspections, etc) per hotel from Postgres.
 * Mirrors getAuditTasksForHotel() from the legacy in-memory helper.
 */
export async function queryAuditTasks(hotelCode: string | null): Promise<AuditTask[]> {
  const tenantId = await getHosTenantId();
  if (!tenantId) return [];

  const rows = await db<Array<{
    legacy_id: string | null;
    code: string;
    room_number: string | null;
    area: string | null;
    type: string;
    title: string;
    scheduled_date: string;
    completed_date: string | null;
    status: string;
    score: string | null;
    findings: unknown;
    assigned_to: string;
  }>>`
    select t.legacy_id, h.code, t.room_number, t.area, t.type, t.title,
           t.scheduled_date::text as scheduled_date,
           t.completed_date::text as completed_date,
           t.status, t.score, t.findings, t.assigned_to
    from audit_tasks t
    join hotels h on h.id = t.hotel_id
    where h.tenant_id = ${tenantId}
      ${hotelCode ? db`and h.code = ${hotelCode}` : db``}
    order by t.scheduled_date desc
  `;

  return rows.map((r) => ({
    id:             r.legacy_id ?? '',
    hotelId:        r.code,
    roomNumber:     r.room_number ?? undefined,
    area:           r.area ?? undefined,
    type:           r.type as AuditTask['type'],
    title:          r.title,
    scheduledDate:  r.scheduled_date,
    completedDate:  r.completed_date ?? undefined,
    status:         r.status as AuditTask['status'],
    score:          r.score == null ? undefined : Number(r.score),
    findings:       Array.isArray(r.findings) ? (r.findings as string[]) : [],
    assignedTo:     r.assigned_to,
  }));
}

/**
 * Hotel-level audit summary: counts by status, last audit date.
 * Matches the shape getHotelAuditSummary() returns from in-memory.
 */
export interface AuditSummary {
  hotelId: string;
  totalRooms: number;
  overdueRooms: number;
  dueSoonRooms: number;
  currentRooms: number;
  compliancePct: number;
  overdueAreas: number;
}

export async function queryAuditSummary(hotelCode: string): Promise<AuditSummary | null> {
  const tenantId = await getHosTenantId();
  if (!tenantId) return null;
  const [hotel] = await db<{ id: string; total_rooms: number }[]>`
    select id, total_rooms from hotels
    where tenant_id = ${tenantId} and code = ${hotelCode}
    limit 1
  `;
  if (!hotel) return null;

  const counts = await db<Array<{ status: string; n: string }>>`
    select status, count(*)::text as n
    from audit_tasks
    where hotel_id = ${hotel.id}
    group by status
  `;
  const byStatus = Object.fromEntries(counts.map((r) => [r.status, Number(r.n)]));

  const overdue = byStatus.overdue ?? 0;
  const inProgress = byStatus.in_progress ?? 0;
  const passed = byStatus.passed ?? 0;
  const completed = passed + (byStatus.failed ?? 0);
  const total = Object.values(byStatus).reduce((s, n) => s + n, 0);
  const compliancePct = total > 0 ? Math.round((passed / total) * 1000) / 10 : 100;

  return {
    hotelId:       hotelCode,
    totalRooms:    hotel.total_rooms,
    overdueRooms:  overdue,
    dueSoonRooms:  inProgress,
    currentRooms:  Math.max(0, hotel.total_rooms - overdue - inProgress),
    compliancePct,
    overdueAreas:  overdue,
  };
}
