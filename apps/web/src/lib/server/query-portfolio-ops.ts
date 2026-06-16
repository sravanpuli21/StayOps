import 'server-only';
import { db, getHosTenantId } from '@/lib/db/client';
import { HOTELS, getRoomsForHotel, type ApiPortfolioOpsRow } from '@hos/shared';

/**
 * Demo/local fallback: when there are no DB room_snapshots, build the per-hotel
 * ops summary from the shared mock room data so the Property Operations table
 * is never all-zeros. Buckets the generated room statuses into the API shape.
 */
function mockPortfolioOps(hotelCodes: string[] | null): ApiPortfolioOpsRow[] {
  const hotels = hotelCodes && hotelCodes.length > 0
    ? HOTELS.filter((h) => hotelCodes.includes(h.id))
    : HOTELS;
  return hotels.map((h) => {
    const rooms = getRoomsForHotel(h.id);
    const count = (pred: (s: string) => boolean) => rooms.filter((r) => pred(r.status)).length;
    const occupied  = count((s) => s === 'occupied');
    const available = count((s) => s === 'ready');
    const dirty     = count((s) => s === 'dirty');
    const inspecting = count((s) => s === 'inspecting');
    const blocked   = count((s) => s === 'blocked' || s === 'ooo');
    return {
      hotelId: h.id,
      totalRooms: rooms.length,
      occupied,
      stayover: 0,
      assigned: inspecting,        // surfaced under "assigned/arriving" bucket
      available,
      dirty,
      needsReview: blocked,
      latestCapturedAt: '2026-05-06T06:00:00Z',
    };
  });
}

/**
 * Per-hotel ops summary for the operations PortfolioView.
 * Pulls the latest snapshot per (hotel, room) from `room_snapshots` and
 * buckets by `type` (Occupied / Stayover / Assigned / Available / Dirty).
 * Falls back to mock data when no DB rows exist.
 *
 * `hotelCodes`:
 *   - null  → all hotels in tenant
 *   - []    → empty scope, returns []
 *   - [...] → restrict to those codes
 */
export async function queryPortfolioOps(hotelCodes: string[] | null): Promise<ApiPortfolioOpsRow[]> {
  if (hotelCodes !== null && hotelCodes.length === 0) return [];
  const tenantId = await getHosTenantId();
  if (!tenantId) return mockPortfolioOps(hotelCodes);
  const codeFilter = hotelCodes && hotelCodes.length > 0 ? hotelCodes : null;

  const rows = await db<Array<{
    code: string;
    total: string;
    occupied: string;
    stayover: string;
    assigned: string;
    available: string;
    dirty: string;
    needs_review: string;
    latest: string | null;
  }>>`
    with latest as (
      select rs.hotel_id, rs.room_number, max(rs.captured_at) as ca
        from room_snapshots rs
        join hotels h on h.id = rs.hotel_id
       where h.tenant_id = ${tenantId}
         ${codeFilter ? db`and h.code = any(${codeFilter})` : db``}
       group by rs.hotel_id, rs.room_number
    ),
    snap as (
      select rs.*
        from room_snapshots rs
        join latest l
          on l.hotel_id = rs.hotel_id
         and l.room_number = rs.room_number
         and l.ca = rs.captured_at
    )
    select
      h.code,
      count(*)::text                                                            as total,
      count(*) filter (where snap.type = 'Occupied')::text                      as occupied,
      count(*) filter (where snap.type = 'Stayover')::text                      as stayover,
      count(*) filter (where snap.type = 'Assigned')::text                      as assigned,
      count(*) filter (where snap.type = 'Available')::text                     as available,
      count(*) filter (where snap.type = 'Dirty')::text                         as dirty,
      count(*) filter (where snap.match_status = 'Needs Review')::text          as needs_review,
      max(snap.captured_at)::text                                               as latest
    from snap
    join hotels h on h.id = snap.hotel_id
    where h.tenant_id = ${tenantId}
      ${codeFilter ? db`and h.code = any(${codeFilter})` : db``}
    group by h.code
    order by h.code
  `;

  // No snapshots captured yet → use the mock fallback so the table isn't empty.
  if (rows.length === 0) return mockPortfolioOps(hotelCodes);

  const dbRows: ApiPortfolioOpsRow[] = rows.map((r) => ({
    hotelId:    r.code,
    totalRooms: Number(r.total),
    occupied:   Number(r.occupied),
    stayover:   Number(r.stayover),
    assigned:   Number(r.assigned),
    available:  Number(r.available),
    dirty:      Number(r.dirty),
    needsReview: Number(r.needs_review),
    latestCapturedAt: r.latest,
  }));

  // Backfill any in-scope hotels that have no DB snapshots yet with mock rows,
  // so the portfolio table shows all hotels (real data where it exists).
  const haveData = new Set(dbRows.filter((r) => r.totalRooms > 0).map((r) => r.hotelId));
  const missing = mockPortfolioOps(hotelCodes).filter((m) => !haveData.has(m.hotelId));
  return [...dbRows.filter((r) => r.totalRooms > 0), ...missing];
}
