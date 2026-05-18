import 'server-only';
import { db, getHosTenantId } from '@/lib/db/client';
import type { ApiRoomSnapshotRow } from '@hos/shared';

/**
 * Per-room snapshots for the property room grid. Returns the latest
 * captured_at row for each room number under the given hotel.
 */
export async function queryPropertyRooms(hotelCode: string): Promise<ApiRoomSnapshotRow[]> {
  const tenantId = await getHosTenantId();
  if (!tenantId) return [];

  const rows = await db<Array<{
    room_number: string;
    type: string;
    raw_occ_status: string | null;
    raw_reservation_status: string | null;
    match_status: 'Mapped' | 'Needs Review';
    captured_at: string;
  }>>`
    with latest as (
      select rs.room_number, max(rs.captured_at) as ca
        from room_snapshots rs
        join hotels h on h.id = rs.hotel_id
       where h.tenant_id = ${tenantId} and h.code = ${hotelCode}
       group by rs.room_number
    )
    select rs.room_number, rs.type, rs.raw_occ_status, rs.raw_reservation_status,
           rs.match_status, rs.captured_at::text as captured_at
      from room_snapshots rs
      join hotels h on h.id = rs.hotel_id
      join latest l on l.room_number = rs.room_number and l.ca = rs.captured_at
     where h.tenant_id = ${tenantId} and h.code = ${hotelCode}
     order by rs.room_number
  `;

  return rows.map((r) => ({
    hotelId:    hotelCode,
    roomNumber: r.room_number,
    // Derive floor from the leading digits of the room number (e.g. "215" → 2,
    // "1015" → 10). Falls back to floor 1 if the room number is non-numeric.
    floor: deriveFloor(r.room_number),
    type:  r.type,
    rawOccStatus:         r.raw_occ_status,
    rawReservationStatus: r.raw_reservation_status,
    matchStatus:          r.match_status,
    capturedAt:           r.captured_at,
  }));
}

function deriveFloor(roomNumber: string): number {
  const digits = roomNumber.match(/^\d+/)?.[0];
  if (!digits) return 1;
  // Standard hotel convention: last two digits = unit, leading digits = floor.
  // 101 → 1, 215 → 2, 1015 → 10.
  if (digits.length <= 2) return 1;
  return Number(digits.slice(0, digits.length - 2));
}
