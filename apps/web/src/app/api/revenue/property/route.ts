import { NextRequest } from 'next/server';
import { z } from 'zod';
import { supabaseServer, getHosTenantId } from '@/lib/supabase/server';
import { resolveDateWindow, type DateRangeToken } from '@hos/shared';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const Query = z.object({
  hotelId: z.string().min(1),
  range: z.enum(['today', 'yesterday', 'week', 'month', 'pay-period', 'ytd', 'custom']).default('yesterday'),
  customFrom: z.string().optional(),
  customTo: z.string().optional(),
});

/**
 * GET /api/revenue/property?hotelId=BTRCI&range=yesterday
 *
 * Returns single-hotel aggregated revenue + daily. Same aggregation logic
 * as /api/revenue/scoped but trivially single-hotel.
 */
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const parsed = Query.safeParse({
    hotelId: sp.get('hotelId') ?? '',
    range: sp.get('range') ?? 'yesterday',
    customFrom: sp.get('customFrom') ?? undefined,
    customTo: sp.get('customTo') ?? undefined,
  });
  if (!parsed.success) {
    return Response.json({ error: 'invalid query', issues: parsed.error.issues }, { status: 400 });
  }
  const q = parsed.data;

  const sb = supabaseServer();
  const tenantId = await getHosTenantId();
  const now = new Date('2026-05-07T12:00:00Z');
  const win = resolveDateWindow(
    q.range as DateRangeToken,
    now,
    q.range === 'custom' && q.customFrom && q.customTo ? { from: q.customFrom, to: q.customTo } : undefined,
  );

  const { data: h, error: hErr } = await sb
    .from('hotels')
    .select('id, code, name, short_name, brand, city, state, total_rooms, market_adr')
    .eq('tenant_id', tenantId)
    .eq('code', q.hotelId)
    .single();
  if (hErr || !h) return Response.json({ error: 'hotel not found' }, { status: 404 });

  const { data: rev } = await sb
    .from('daily_revenue')
    .select('total_revenue, room_revenue, non_room_revenue, mix_room, mix_fb, mix_retail, mix_events, mix_other, adr, revpar, occupancy_pct, market_adr, health')
    .eq('hotel_id', h.id)
    .gte('date', win.from)
    .lte('date', win.to);

  const { data: occ } = await sb
    .from('daily_occupancy')
    .select('date, rooms_sold, rooms_ooo, avg_customer_rating')
    .eq('hotel_id', h.id)
    .gte('date', win.from)
    .lte('date', win.to);

  // Aggregate
  const agg = {
    total: 0, room: 0, nonRoom: 0,
    mixRoom: 0, mixFb: 0, mixRetail: 0, mixEvents: 0, mixOther: 0,
    adrW: 0, adrWeight: 0, revpar: 0, occPctSum: 0, count: 0,
    health: 'green' as 'green' | 'amber' | 'red',
  };
  for (const r of rev ?? []) {
    agg.total += Number(r.total_revenue ?? 0);
    agg.room += Number(r.room_revenue ?? 0);
    agg.nonRoom += Number(r.non_room_revenue ?? 0);
    agg.mixRoom += Number(r.mix_room ?? 0);
    agg.mixFb += Number(r.mix_fb ?? 0);
    agg.mixRetail += Number(r.mix_retail ?? 0);
    agg.mixEvents += Number(r.mix_events ?? 0);
    agg.mixOther += Number(r.mix_other ?? 0);
    agg.adrW += Number(r.adr ?? 0) * Number(r.room_revenue ?? 0);
    agg.adrWeight += Number(r.room_revenue ?? 0);
    agg.revpar += Number(r.revpar ?? 0);
    agg.occPctSum += Number(r.occupancy_pct ?? 0);
    agg.count += 1;
    if (r.health === 'red') agg.health = 'red';
    else if (r.health === 'amber' && agg.health !== 'red') agg.health = 'amber';
  }

  const occAgg = {
    sold: 0, ooo: 0, ratingSum: 0, ratingCount: 0, lastDate: '',
  };
  for (const o of occ ?? []) {
    occAgg.sold += Number(o.rooms_sold ?? 0);
    occAgg.ooo += Number(o.rooms_ooo ?? 0);
    if (o.avg_customer_rating != null) {
      occAgg.ratingSum += Number(o.avg_customer_rating);
      occAgg.ratingCount += 1;
    }
    if (o.date > occAgg.lastDate) occAgg.lastDate = o.date;
  }

  const hasRev = agg.count > 0;

  return Response.json({
    window: win,
    hotel: {
      id: h.code,
      code: h.code,
      name: h.name,
      shortName: h.short_name,
      rooms: h.total_rooms,
      brand: h.brand,
      city: h.city,
      state: h.state,
    },
    revenue: hasRev
      ? {
          hotelId: h.code,
          occupancyPct: agg.count > 0 ? Math.round((agg.occPctSum / agg.count) * 10) / 10 : 0,
          adr: agg.adrWeight > 0 ? Math.round(agg.adrW / agg.adrWeight) : 0,
          revPar: agg.count > 0 ? Math.round(agg.revpar / agg.count) : 0,
          totalRevenue: Math.round(agg.total),
          roomRevenue: Math.round(agg.room),
          nonRoomRevenue: Math.round(agg.nonRoom),
          revenueMix: {
            room: Math.round(agg.mixRoom),
            fb: Math.round(agg.mixFb),
            retail: Math.round(agg.mixRetail),
            events: Math.round(agg.mixEvents),
            other: Math.round(agg.mixOther),
          },
          marketAdr: Number(h.market_adr ?? 0),
          health: agg.health,
        }
      : null,
    daily: (occ && occ.length > 0)
      ? {
          hotelId: h.code,
          date: occAgg.lastDate,
          roomsSold: occAgg.sold,
          roomsOoo: occAgg.ooo,
          avgCustomerRating: occAgg.ratingCount > 0 ? Math.round((occAgg.ratingSum / occAgg.ratingCount) * 10) / 10 : 0,
          occupancyPct: agg.count > 0 ? Math.round((agg.occPctSum / agg.count) * 10) / 10 : 0,
        }
      : null,
  });
}
