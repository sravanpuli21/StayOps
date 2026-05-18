import 'server-only';
import { db, getHosTenantId } from '@/lib/db/client';
import type { ApiPropertyOpsStats, ApiOpsStatMetric } from '@hos/shared';

/**
 * Operational counts for the property view's status pills, sourced from the
 * latest `night_audit_rows` snapshot in [from, to] for a given hotel.
 *
 * Buckets surfaced (matches the user's Mix/Match spec):
 *   - Room Status / OOO          → Down Rooms
 *   - Room Status / Dirty
 *   - Room Status / Clean
 *   - Rooms Availability / Rooms Vacant
 *   - Rooms Availability / Rooms Available
 *   - Rooms Availability / Rooms Sold
 *   - Occupancy / Zero Rate Rooms
 *   - Occupancy / No Show
 *   - Occupancy / Total Rooms Occupied
 */
export async function queryPropertyOpsStats(
  hotelCode: string,
  from: string,
  to: string,
): Promise<ApiPropertyOpsStats | null> {
  const tenantId = await getHosTenantId();
  if (!tenantId) return null;

  // Find the latest report_date in range that has any rows for this hotel.
  const [latest] = await db<{ rd: string | null }[]>`
    select max(nar.report_date)::text as rd
      from night_audit_rows nar
      join hotels h on h.id = nar.hotel_id
     where h.tenant_id = ${tenantId}
       and h.code = ${hotelCode}
       and nar.report_date between ${from}::date and ${to}::date
  `;

  // Mix/Match aggregates (Sold / Vacant / Clean / etc.) are kept on the
  // response for downstream consumers — but absence of night-audit data
  // shouldn't hide the per-room pills below.
  const merged = new Map<string, ApiOpsStatMetric>();
  if (latest?.rd) {
    const rows = await db<Array<{
      category: string;
      type: string;
      value_today: string | null;
      value_mtd: string | null;
      value_ytd: string | null;
    }>>`
      select nar.category, nar.type, nar.value_today, nar.value_mtd, nar.value_ytd
        from night_audit_rows nar
        join hotels h on h.id = nar.hotel_id
       where h.tenant_id = ${tenantId}
         and h.code = ${hotelCode}
         and nar.report_date = ${latest.rd}::date
         and nar.category in ('Room Status', 'Rooms Availability', 'Occupancy')
    `;
    for (const r of rows) {
      const key = r.type;
      const cur = merged.get(key) ?? { type: key, today: 0, mtd: 0, ytd: 0 };
      cur.today += Number(r.value_today ?? 0);
      cur.mtd   += Number(r.value_mtd   ?? 0);
      cur.ytd   += Number(r.value_ytd   ?? 0);
      merged.set(key, cur);
    }
  }

  // ── Per-room final status from room_snapshots.type ───────────────────────
  // Parser already derived `type` per the user's RoomStatus spec
  // (Occupied / Stayover / Assigned / Available / Dirty / raw-for-review).
  // Here we just take the latest captured_at per room and group.
  const grouped = await db<{ type: string; n: string }[]>`
    with latest as (
      select rs.room_number, max(rs.captured_at) as ca
        from room_snapshots rs
        join hotels h on h.id = rs.hotel_id
       where h.tenant_id = ${tenantId} and h.code = ${hotelCode}
       group by rs.room_number
    )
    select rs.type, count(*)::text as n
      from room_snapshots rs
      join hotels h on h.id = rs.hotel_id
      join latest l on l.room_number = rs.room_number and l.ca = rs.captured_at
     where h.tenant_id = ${tenantId} and h.code = ${hotelCode}
     group by rs.type
  `;
  const roomMetrics: ApiOpsStatMetric[] = grouped.map((g) => ({
    type: `Room.${g.type}`,
    today: Number(g.n),
    mtd: 0,
    ytd: 0,
  }));

  return {
    hotelId: hotelCode,
    reportDate: latest?.rd ?? null,
    // Mix/Match-derived metrics first (kept for any other consumer), then the
    // four per-room snapshot buckets the property pills use.
    metrics: [...merged.values(), ...roomMetrics],
  };
}
