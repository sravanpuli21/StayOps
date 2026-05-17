import 'server-only';
import { db, getHosTenantId } from '@/lib/db/client';
import type { ApiDailyMetrics } from '@hos/shared';

/**
 * Aggregate daily_occupancy across [from, to] per hotel.
 * roomsSold + roomsOoo are sums; occupancy + rating are room-night weighted.
 */
export async function queryDailyAggregates(
  hotelCodes: string[] | null,
  from: string,
  to: string,
): Promise<ApiDailyMetrics[]> {
  if (hotelCodes !== null && hotelCodes.length === 0) return [];
  const tenantId = await getHosTenantId();
  if (!tenantId) return [];
  const codeFilter = hotelCodes && hotelCodes.length > 0 ? hotelCodes : null;

  const rows = await db<Array<{
    code: string;
    rooms_sold: string | null;
    rooms_ooo: string | null;
    occupancy_pct: string | null;
    avg_customer_rating: string | null;
  }>>`
    select
      h.code,
      coalesce(sum(o.rooms_sold), 0)          as rooms_sold,
      coalesce(sum(o.rooms_ooo), 0)           as rooms_ooo,
      -- Room-night-weighted occupancy: cross-hotel/cross-day average uses
      -- rooms_sold as the weight so a 90%-on-100-rooms day outweighs an
      -- 80%-on-50-rooms day. Falls back to simple avg if no rooms sold.
      case
        when sum(o.rooms_sold) > 0
          then sum(d.occupancy_pct * o.rooms_sold) / sum(o.rooms_sold)
        else avg(d.occupancy_pct)
      end                                     as occupancy_pct,
      case
        when sum(o.rooms_sold) > 0
          then sum(o.avg_customer_rating * o.rooms_sold) / sum(o.rooms_sold)
        else avg(o.avg_customer_rating)
      end                                     as avg_customer_rating
    from hotels h
    left join daily_occupancy o
      on o.hotel_id = h.id and o.date between ${from}::date and ${to}::date
    left join daily_revenue d
      on d.hotel_id = o.hotel_id and d.date = o.date
    where h.tenant_id = ${tenantId}
      ${codeFilter ? db`and h.code = any(${codeFilter})` : db``}
    group by h.id, h.code
    having count(o.date) > 0
    order by h.code
  `;

  return rows.map((r) => ({
    hotelId:           r.code,
    date:              to,
    roomsSold:         Number(r.rooms_sold ?? 0),
    roomsOoo:          Number(r.rooms_ooo ?? 0),
    occupancyPct:      r.occupancy_pct == null ? 0 : Math.round(Number(r.occupancy_pct) * 10) / 10,
    avgCustomerRating: r.avg_customer_rating == null ? 4.0 : Math.round(Number(r.avg_customer_rating) * 10) / 10,
  }));
}
