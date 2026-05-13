import 'server-only';
import { db, getHosTenantId } from '@/lib/db/client';

/**
 * Latest AM/PM snapshot per hotel (or for one hotel) from am_pm_snapshots
 * + am_pm_room_type_rows. "Latest" means most recent date for the slot.
 *
 * Returned shape matches the in-memory AmPmReport contract so existing pages
 * keep rendering without edits.
 */
export interface QueryAmPmRow {
  hotelId:        string;          // hotel code (e.g. 'BTRCI')
  totalRooms:     number;
  roomsSold:      number;
  roomsOoo:       number;
  roomsLeftToSell: number;
  adr:            number;
  avgPrice:       number;
  revPar:         number;
  occupancyPct:   number;
  roomTypes:      Array<{
    type: string;
    label: string;
    total: number;
    sold: number;
    ooo: number;
    leftToSell: number;
    adr: number;
    avgPrice: number;
    revPar: number;
    occupancyPct: number;
  }>;
}

export interface QueryAmPmReport {
  slot:        'AM' | 'PM';
  generatedAt: string;
  label:       string;
  rows:        QueryAmPmRow[];
}

export async function queryAmPmReport(
  slot: 'AM' | 'PM',
  hotelCode: string | null,
): Promise<QueryAmPmReport> {
  const tenantId = await getHosTenantId();

  // For each hotel, pick the most recent snapshot for the requested slot.
  const snapshots = await db<Array<{
    id: string;
    code: string;
    generated_at: string;
    total_rooms: number;
    rooms_sold: number;
    rooms_ooo: number;
    rooms_left_to_sell: number;
    adr: string | null;
    avg_price: string | null;
    revpar: string | null;
    occupancy_pct: string | null;
  }>>`
    select distinct on (h.id)
      s.id, h.code,
      s.generated_at::text as generated_at,
      s.total_rooms, s.rooms_sold, s.rooms_ooo, s.rooms_left_to_sell,
      s.adr, s.avg_price, s.revpar, s.occupancy_pct
    from hotels h
    join am_pm_snapshots s on s.hotel_id = h.id and s.slot = ${slot}
    where h.tenant_id = ${tenantId}
      ${hotelCode ? db`and h.code = ${hotelCode}` : db``}
    order by h.id, s.date desc, s.generated_at desc
  `;

  if (snapshots.length === 0) {
    return {
      slot,
      generatedAt: new Date().toISOString(),
      label: slot === 'AM' ? '9:00 AM Snapshot' : '9:00 PM Snapshot',
      rows: [],
    };
  }

  const snapIds = snapshots.map((s) => s.id);
  const rtRows = await db<Array<{
    snapshot_id: string;
    room_type_code: string;
    label: string | null;
    total: number;
    sold: number;
    ooo: number;
    left_to_sell: number;
    adr: string | null;
    avg_price: string | null;
    revpar: string | null;
    occupancy_pct: string | null;
  }>>`
    select snapshot_id, room_type_code, label, total, sold, ooo, left_to_sell,
           adr, avg_price, revpar, occupancy_pct
    from am_pm_room_type_rows
    where snapshot_id = any(${snapIds})
    order by snapshot_id, room_type_code
  `;
  type Rt = (typeof rtRows)[number];
  const rtBySnap = new Map<string, Rt[]>();
  for (const rt of rtRows) {
    const arr = rtBySnap.get(rt.snapshot_id) ?? [];
    arr.push(rt);
    rtBySnap.set(rt.snapshot_id, arr);
  }

  const rows: QueryAmPmRow[] = snapshots.map((s) => ({
    hotelId:        s.code,
    totalRooms:     s.total_rooms,
    roomsSold:      s.rooms_sold,
    roomsOoo:       s.rooms_ooo,
    roomsLeftToSell: s.rooms_left_to_sell,
    adr:            Number(s.adr ?? 0),
    avgPrice:       Number(s.avg_price ?? 0),
    revPar:         Number(s.revpar ?? 0),
    occupancyPct:   Number(s.occupancy_pct ?? 0),
    roomTypes: (rtBySnap.get(s.id) ?? []).map((rt) => ({
      type:         rt.room_type_code,
      label:        rt.label ?? rt.room_type_code,
      total:        rt.total,
      sold:         rt.sold,
      ooo:          rt.ooo,
      leftToSell:   rt.left_to_sell,
      adr:          Number(rt.adr ?? 0),
      avgPrice:     Number(rt.avg_price ?? 0),
      revPar:       Number(rt.revpar ?? 0),
      occupancyPct: Number(rt.occupancy_pct ?? 0),
    })),
  }));

  // Take the freshest generated_at across the bunch as the report header.
  const latestGenAt = snapshots
    .map((s) => s.generated_at)
    .sort()
    .at(-1) ?? new Date().toISOString();

  return {
    slot,
    generatedAt: latestGenAt,
    label: slot === 'AM' ? '9:00 AM Snapshot' : '9:00 PM Snapshot',
    rows,
  };
}
