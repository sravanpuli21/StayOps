import 'server-only';
import { db, getHosTenantId } from '@/lib/db/client';
import type { ApiRevenueSummary } from '@hos/shared';

function deriveHealth(occPct: number): 'green' | 'amber' | 'red' {
  if (occPct >= 85) return 'green';
  if (occPct >= 75) return 'amber';
  return 'red';
}

/**
 * Aggregate daily_revenue + daily_occupancy across [from, to] for the given
 * hotel codes (tenant=hos). Returns one row per hotel with summed accumulators
 * and room-night-weighted ADR / occupancy.
 *
 * `hotelCodes` semantics (tri-state):
 *   - `null`        → no filter (all hotels in tenant)
 *   - `[]`          → empty scope, returns []
 *   - `string[]>0`  → restrict to those codes
 */
export async function queryRevenueAggregates(
  hotelCodes: string[] | null,
  from: string,
  to: string,
): Promise<ApiRevenueSummary[]> {
  if (hotelCodes !== null && hotelCodes.length === 0) return [];
  const tenantId = await getHosTenantId();
  if (!tenantId) return [];
  const codeFilter = hotelCodes && hotelCodes.length > 0 ? hotelCodes : null;

  // Window-aggregated revenue per hotel. Joining via daily_occupancy so the
  // ADR weighting uses real room-night counts instead of arithmetic mean.
  const rows = await db<Array<{
    code: string;
    market_adr: number | null;
    total_revenue: string | null;
    room_revenue: string | null;
    non_room_revenue: string | null;
    mix_room: string | null;
    mix_fb: string | null;
    mix_retail: string | null;
    mix_events: string | null;
    mix_other: string | null;
    occupancy_pct: string | null;
    adr: string | null;
  }>>`
    select
      h.code,
      h.market_adr,
      coalesce(sum(d.total_revenue), 0)    as total_revenue,
      coalesce(sum(d.room_revenue), 0)     as room_revenue,
      coalesce(sum(d.non_room_revenue), 0) as non_room_revenue,
      coalesce(sum(d.mix_room), 0)         as mix_room,
      coalesce(sum(d.mix_fb), 0)           as mix_fb,
      coalesce(sum(d.mix_retail), 0)       as mix_retail,
      coalesce(sum(d.mix_events), 0)       as mix_events,
      coalesce(sum(d.mix_other), 0)        as mix_other,
      avg(d.occupancy_pct)                 as occupancy_pct,
      case
        when sum(o.rooms_sold) > 0
          then sum(d.adr * o.rooms_sold)::numeric / sum(o.rooms_sold)::numeric
        else avg(d.adr)
      end                                  as adr
    from hotels h
    left join daily_revenue d
      on d.hotel_id = h.id and d.date between ${from}::date and ${to}::date
    left join daily_occupancy o
      on o.hotel_id = d.hotel_id and o.date = d.date
    where h.tenant_id = ${tenantId}
      ${codeFilter ? db`and h.code = any(${codeFilter})` : db``}
    group by h.id, h.code, h.market_adr
    having count(d.date) > 0
    order by h.code
  `;

  return rows.map((r) => {
    const occ = r.occupancy_pct == null ? 0 : Number(r.occupancy_pct);
    const adr = r.adr == null ? 0 : Number(r.adr);
    return {
      hotelId:        r.code,
      occupancyPct:   Math.round(occ * 10) / 10,
      adr:            Math.round(adr),
      revPar:         Math.round(adr * (occ / 100)),
      totalRevenue:   Math.round(Number(r.total_revenue ?? 0)),
      roomRevenue:    Math.round(Number(r.room_revenue ?? 0)),
      nonRoomRevenue: Math.round(Number(r.non_room_revenue ?? 0)),
      revenueMix: {
        room:   Math.round(Number(r.mix_room   ?? 0)),
        fb:     Math.round(Number(r.mix_fb     ?? 0)),
        retail: Math.round(Number(r.mix_retail ?? 0)),
        events: Math.round(Number(r.mix_events ?? 0)),
        other:  Math.round(Number(r.mix_other  ?? 0)),
      },
      marketAdr: r.market_adr == null ? Math.round(adr) : Number(r.market_adr),
      health: deriveHealth(occ),
    };
  });
}
