import 'server-only';
import { db, getHosTenantId } from '@/lib/db/client';
import type { Room } from '@hos/shared';

/**
 * Project the OnQ snapshot `type` (the per-room "Final Room Status" string)
 * onto the grid's 6-status visual buckets. Mirrors statusFromType() in
 * components/operations/_constants.ts — kept inline so server code doesn't
 * import a client-side module.
 */
function statusFromType(t: string): Room['status'] {
  if (t === 'Occupied' || t === 'Stayover') return 'occupied';
  if (t === 'Available') return 'ready';
  if (t === 'Dirty')     return 'dirty';
  if (t === 'Assigned')  return 'inspecting';
  if (t === 'OOO')       return 'ooo';
  return 'occupied';
}

function hkFromStatus(status: Room['status']): Room['hkStatus'] {
  if (status === 'dirty') return 'dirty';
  if (status === 'inspecting') return 'inspected';
  return 'clean';
}

function deriveFloor(roomNumber: string): number {
  const digits = roomNumber.match(/^\d+/)?.[0];
  if (!digits) return 1;
  if (digits.length <= 2) return 1;
  return Number(digits.slice(0, digits.length - 2));
}

/**
 * Read rooms from Postgres. If `hotelCode` is null, returns rooms across all
 * hotels in the HOS tenant. The returned shape mirrors the in-memory `Room`
 * interface from @hos/shared so consumer pages keep rendering unchanged.
 *
 * Source: `room_snapshots` (latest captured_at per hotel+room) — the slim
 * table introduced in migration 0016. The previous rich `rooms` table was
 * dropped, so bed-type / last-cleaned / last-inspected are no longer stored;
 * those fields are defaulted. `hasOpenTicket` is derived by joining
 * `maintenance_tickets`.
 */
export async function queryRooms(hotelCode: string | null): Promise<Room[]> {
  const tenantId = await getHosTenantId();
  if (!tenantId) return [];

  const rows = await db<Array<{
    code: string;
    room_number: string;
    type: string;
    raw_occ_status: string | null;
    open_ticket_count: number;
  }>>`
    with latest as (
      select rs.hotel_id, rs.room_number, max(rs.captured_at) as ca
        from room_snapshots rs
        join hotels h on h.id = rs.hotel_id
       where h.tenant_id = ${tenantId}
         ${hotelCode ? db`and h.code = ${hotelCode}` : db``}
       group by rs.hotel_id, rs.room_number
    )
    select h.code,
           rs.room_number,
           rs.type,
           rs.raw_occ_status,
           (
             select count(*)::int
               from maintenance_tickets mt
              where mt.hotel_id = rs.hotel_id
                and mt.room_number = rs.room_number
                and mt.status <> 'resolved'
           ) as open_ticket_count
      from room_snapshots rs
      join latest l on l.hotel_id = rs.hotel_id and l.room_number = rs.room_number and l.ca = rs.captured_at
      join hotels h on h.id = rs.hotel_id
     where h.tenant_id = ${tenantId}
       ${hotelCode ? db`and h.code = ${hotelCode}` : db``}
     order by h.code, rs.room_number
  `;

  return rows.map((r) => {
    const status = statusFromType(r.type);
    return {
      id:               `${r.code}-${r.room_number}`,
      hotelId:          r.code,
      number:           r.room_number,
      floor:            deriveFloor(r.room_number),
      // Bed type is no longer stored in the slim snapshot table; the snapshot
      // `type` is the room *status*, which we surface as the display label.
      type:             r.type as Room['type'],
      status,
      hkStatus:         hkFromStatus(status),
      lastCleaned:      null,
      lastInspected:    null,
      hasOpenTicket:    r.open_ticket_count > 0,
      oooReason:        status === 'ooo' ? (r.raw_occ_status ?? 'Out of order') : undefined,
      lastGuestRating:  undefined,
    };
  });
}

/**
 * Stale-dirty rooms: dirty/inspecting and not cleaned for ≥ 1 day.
 * Mirrors getStaleDirtyRoomsForHotel() in operations.ts.
 *
 * Note: the slim room_snapshots table no longer stores last_cleaned, so the
 * age check can't run — every dirty/inspecting room is returned (treated as
 * needing attention). Re-add a cleaned-at column if precise aging is needed.
 */
export async function queryStaleDirtyRooms(hotelCode: string | null): Promise<Room[]> {
  const all = await queryRooms(hotelCode);
  return all.filter((r) => r.status === 'dirty' || r.status === 'inspecting');
}
