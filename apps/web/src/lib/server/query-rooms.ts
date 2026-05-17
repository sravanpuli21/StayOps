import 'server-only';
import { db, getHosTenantId } from '@/lib/db/client';
import type { Room } from '@hos/shared';

/**
 * Read rooms from Postgres. If `hotelCode` is null, returns rooms across all
 * hotels in the HOS tenant. The returned shape mirrors the in-memory `Room`
 * interface from @hos/shared so consumer pages keep rendering unchanged.
 */
export async function queryRooms(hotelCode: string | null): Promise<Room[]> {
  const tenantId = await getHosTenantId();
  if (!tenantId) return [];

  const rows = await db<Array<{
    code: string;
    number: string;
    floor: number;
    type: string;
    status: string;
    hk_status: string;
    last_cleaned: string | null;
    last_inspected: string | null;
    has_open_ticket: boolean;
    ooo_reason: string | null;
    last_guest_rating: string | null;
  }>>`
    select h.code, r.number, r.floor, r.type, r.status, r.hk_status,
           r.last_cleaned::text   as last_cleaned,
           r.last_inspected::text as last_inspected,
           r.has_open_ticket, r.ooo_reason, r.last_guest_rating
    from rooms r
    join hotels h on h.id = r.hotel_id
    where h.tenant_id = ${tenantId}
      ${hotelCode ? db`and h.code = ${hotelCode}` : db``}
    order by h.code, r.floor, r.number
  `;

  return rows.map((r) => ({
    id:               `${r.code}-${r.number}`,
    hotelId:          r.code,
    number:           r.number,
    floor:            r.floor,
    type:             r.type as Room['type'],
    status:           r.status as Room['status'],
    hkStatus:         r.hk_status as Room['hkStatus'],
    lastCleaned:      r.last_cleaned,
    lastInspected:    r.last_inspected,
    hasOpenTicket:    r.has_open_ticket,
    oooReason:        r.ooo_reason ?? undefined,
    lastGuestRating:  r.last_guest_rating != null ? Number(r.last_guest_rating) : undefined,
  }));
}

/**
 * Stale-dirty rooms: dirty/inspecting and not cleaned for ≥ 1 day.
 * Mirrors getStaleDirtyRoomsForHotel() in operations.ts.
 */
export async function queryStaleDirtyRooms(hotelCode: string | null): Promise<Room[]> {
  const all = await queryRooms(hotelCode);
  const now = Date.now();
  return all.filter((r) => {
    if (r.status !== 'dirty' && r.status !== 'inspecting') return false;
    if (!r.lastCleaned) return true;
    const ageDays = (now - new Date(r.lastCleaned).getTime()) / 86400000;
    return ageDays >= 1;
  });
}
