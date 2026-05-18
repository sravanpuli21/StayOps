import 'server-only';
import { db, getHosTenantId } from '@/lib/db/client';
import type { ApiRevenueSummary, RevenueAgg } from '@hos/shared';

function deriveHealth(occPct: number): 'green' | 'amber' | 'red' {
  if (occPct >= 85) return 'green';
  if (occPct >= 75) return 'amber';
  return 'red';
}

/**
 * Aggregate revenue across [from, to] for the given hotel codes.
 *
 *  - agg='today' (default): sum each day's `value_today` from daily_revenue
 *    (matches single-day Today / Yesterday / Week / Pay-Period behaviour).
 *  - agg='mtd': use the latest report_date in range, take its `value_mtd`
 *    column from night_audit_rows. Aligns with the OnQ file's MTD column.
 *  - agg='ytd': same shape but using `value_ytd`. Aligns with YTD.
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
  agg: RevenueAgg = 'today',
): Promise<ApiRevenueSummary[]> {
  if (hotelCodes !== null && hotelCodes.length === 0) return [];
  const tenantId = await getHosTenantId();
  if (!tenantId) return [];
  const codeFilter = hotelCodes && hotelCodes.length > 0 ? hotelCodes : null;

  if (agg === 'mtd' || agg === 'ytd') {
    return queryRevenueAggregatesCumulative(tenantId, codeFilter, from, to, agg);
  }

  // agg === 'today' — legacy behaviour.
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
        other:  Math.round(Number(r.mix_other ?? 0)),
      },
      marketAdr: r.market_adr == null ? Math.round(adr) : Number(r.market_adr),
      health: deriveHealth(occ),
    };
  });
}

/**
 * MTD / YTD path — pulls cumulative numbers straight from the most recent
 * night_audit_rows snapshot in the date window. The OnQ file already does
 * the cumulative arithmetic, so we just project the right column.
 */
async function queryRevenueAggregatesCumulative(
  tenantId: string,
  codeFilter: string[] | null,
  from: string,
  to: string,
  agg: 'mtd' | 'ytd',
): Promise<ApiRevenueSummary[]> {
  const valueCol = agg === 'mtd' ? db`nar.value_mtd` : db`nar.value_ytd`;

  const rows = await db<Array<{
    code: string;
    market_adr: number | null;
    revenue_only:    string | null;
    taxes:           string | null;
    mix_room:        string | null;
    mix_fb:          string | null;
    mix_retail:      string | null;
    mix_events:      string | null;
    mix_other:       string | null;
    occupancy_pct:   string | null;
    adr:             string | null;
    revpar:          string | null;
  }>>`
    with latest as (
      select nar.hotel_id, max(nar.report_date) as rd
        from night_audit_rows nar
        join hotels h on h.id = nar.hotel_id
       where h.tenant_id = ${tenantId}
         and nar.report_date between ${from}::date and ${to}::date
         ${codeFilter ? db`and h.code = any(${codeFilter})` : db``}
       group by nar.hotel_id
    )
    select
      h.code, h.market_adr,
      coalesce(sum(${valueCol}) filter (where nar.category = 'Revenue'), 0)::text as revenue_only,
      coalesce(sum(${valueCol}) filter (where nar.category = 'Taxes'), 0)::text   as taxes,
      coalesce(sum(${valueCol}) filter (where nar.type = 'Room Revenue' or nar.type = 'No Show Room Revenue'), 0)::text as mix_room,
      coalesce(sum(${valueCol}) filter (where nar.type = 'Charges' and nar.subtype_group = 'F&B' and nar.subtype = 'Restaurant'), 0)::text as mix_fb,
      coalesce(sum(${valueCol}) filter (where nar.type = 'Charges' and nar.subtype_group = 'F&B' and nar.subtype = 'Front Market'), 0)::text as mix_retail,
      coalesce(sum(${valueCol}) filter (where nar.type = 'Charges' and nar.subtype_group = 'Events'), 0)::text as mix_events,
      coalesce(sum(${valueCol}) filter (where nar.type = 'Charges' and nar.subtype_group in ('Additional Room Charges','Other Charges')), 0)::text as mix_other,
      max(${valueCol}) filter (where nar.category = 'KPI' and nar.type = 'Occupancy %')::text as occupancy_pct,
      max(${valueCol}) filter (where nar.category = 'KPI' and nar.type = 'ADR')::text         as adr,
      max(${valueCol}) filter (where nar.category = 'KPI' and nar.type = 'RevPar')::text      as revpar
    from latest l
    join night_audit_rows nar on nar.hotel_id = l.hotel_id and nar.report_date = l.rd
    join hotels h on h.id = l.hotel_id
    group by h.id, h.code, h.market_adr
    order by h.code
  `;

  return rows.map((r) => {
    const occ    = r.occupancy_pct == null ? 0 : Number(r.occupancy_pct);
    const adr    = r.adr           == null ? 0 : Number(r.adr);
    const revpar = r.revpar        == null ? Math.round(adr * (occ / 100)) : Number(r.revpar);
    const total  = Number(r.revenue_only ?? 0) + Number(r.taxes ?? 0);
    const room   = Number(r.mix_room ?? 0);
    return {
      hotelId:        r.code,
      occupancyPct:   Math.round(occ * 10) / 10,
      adr:            Math.round(adr),
      revPar:         Math.round(revpar),
      totalRevenue:   Math.round(total),
      roomRevenue:    Math.round(room),
      nonRoomRevenue: Math.max(0, Math.round(total - room)),
      revenueMix: {
        room,
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
