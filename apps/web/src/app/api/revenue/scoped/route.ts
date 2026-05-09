import { NextRequest } from 'next/server';
import { z } from 'zod';
import { supabaseServer, getHosTenantId } from '@/lib/supabase/server';
import { resolveDateWindow, type DateRangeToken } from '@hos/shared';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const Query = z.object({
  range: z.enum(['today', 'yesterday', 'week', 'month', 'pay-period', 'ytd', 'custom']),
  selection: z.enum(['all', 'my-territory', 'regional', 'single']).default('all'),
  regionalId: z.string().optional(),
  hotelId: z.string().optional(),
  viewerRegionalId: z.string().optional(),
  customFrom: z.string().optional(),
  customTo: z.string().optional(),
});

/**
 * GET /api/revenue/scoped
 *
 * Returns hotels + aggregated revenue + daily metrics for the chosen scope
 * and date window. Aggregation is SQL-side — no multiplier fakery.
 *
 * For multi-day windows (week/month/ytd) the metrics are SUMs
 * over the daily_revenue / daily_occupancy series. Ratios (occupancy_pct,
 * ADR, rating) are weighted averages.
 */
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const parsed = Query.safeParse({
    range: sp.get('range') ?? 'yesterday',
    selection: sp.get('selection') ?? 'all',
    regionalId: sp.get('regionalId') ?? undefined,
    hotelId: sp.get('hotelId') ?? undefined,
    viewerRegionalId: sp.get('viewerRegionalId') ?? undefined,
    customFrom: sp.get('customFrom') ?? undefined,
    customTo: sp.get('customTo') ?? undefined,
  });
  if (!parsed.success) {
    return Response.json({ error: 'invalid query', issues: parsed.error.issues }, { status: 400 });
  }
  const q = parsed.data;

  const sb = supabaseServer();
  const tenantId = await getHosTenantId();

  // Resolve date window.
  const now = new Date('2026-05-07T12:00:00Z'); // Phase 0: frozen "today" so seed data lines up
  const win = resolveDateWindow(
    q.range as DateRangeToken,
    now,
    q.range === 'custom' && q.customFrom && q.customTo
      ? { from: q.customFrom, to: q.customTo }
      : undefined,
  );

  // Resolve hotel scope.
  let hotelsQuery = sb
    .from('hotels')
    .select('id, code, name, short_name, brand, city, state, total_rooms, region_id, market_adr')
    .eq('tenant_id', tenantId);

  if (q.selection === 'single' && q.hotelId) {
    hotelsQuery = hotelsQuery.eq('code', q.hotelId);
  } else if (q.selection === 'regional' && q.regionalId) {
    const { data: reg } = await sb.from('regions').select('id').eq('tenant_id', tenantId).eq('slug', q.regionalId).single();
    if (reg?.id) hotelsQuery = hotelsQuery.eq('region_id', reg.id);
  } else if (q.selection === 'my-territory' && q.viewerRegionalId) {
    const { data: reg } = await sb.from('regions').select('id').eq('tenant_id', tenantId).eq('slug', q.viewerRegionalId).single();
    if (reg?.id) hotelsQuery = hotelsQuery.eq('region_id', reg.id);
  }

  const { data: hotelsRaw, error: hotelsErr } = await hotelsQuery.order('code');
  if (hotelsErr) return Response.json({ error: hotelsErr.message }, { status: 500 });
  const hotels = hotelsRaw ?? [];
  if (hotels.length === 0) {
    return Response.json({ window: win, scopeLabel: 'Empty', scopeSub: '', hotels: [], revenueRows: [], dailyRows: [] });
  }

  const hotelIds = hotels.map((h) => h.id);

  // Aggregate revenue rows for the window.
  const { data: revRaw, error: revErr } = await sb
    .from('daily_revenue')
    .select('hotel_id, total_revenue, room_revenue, non_room_revenue, mix_room, mix_fb, mix_retail, mix_events, mix_other, adr, revpar, occupancy_pct, market_adr, health')
    .in('hotel_id', hotelIds)
    .gte('date', win.from)
    .lte('date', win.to);
  if (revErr) return Response.json({ error: revErr.message }, { status: 500 });

  const { data: occRaw, error: occErr } = await sb
    .from('daily_occupancy')
    .select('hotel_id, date, rooms_sold, rooms_ooo, avg_customer_rating')
    .in('hotel_id', hotelIds)
    .gte('date', win.from)
    .lte('date', win.to);
  if (occErr) return Response.json({ error: occErr.message }, { status: 500 });

  // Aggregate per hotel
  const revenueByHotel = new Map<string, {
    total: number; room: number; nonRoom: number;
    mixRoom: number; mixFb: number; mixRetail: number; mixEvents: number; mixOther: number;
    adrWeighted: number; adrWeight: number;
    revpar: number;
    occPct: number; occWeight: number;
    marketAdr: number;
    rowCount: number;
    health: string;
  }>();

  for (const r of revRaw ?? []) {
    const h = revenueByHotel.get(r.hotel_id) ?? {
      total: 0, room: 0, nonRoom: 0,
      mixRoom: 0, mixFb: 0, mixRetail: 0, mixEvents: 0, mixOther: 0,
      adrWeighted: 0, adrWeight: 0,
      revpar: 0,
      occPct: 0, occWeight: 0,
      marketAdr: 0,
      rowCount: 0,
      health: 'green',
    };
    h.total += Number(r.total_revenue ?? 0);
    h.room += Number(r.room_revenue ?? 0);
    h.nonRoom += Number(r.non_room_revenue ?? 0);
    h.mixRoom += Number(r.mix_room ?? 0);
    h.mixFb += Number(r.mix_fb ?? 0);
    h.mixRetail += Number(r.mix_retail ?? 0);
    h.mixEvents += Number(r.mix_events ?? 0);
    h.mixOther += Number(r.mix_other ?? 0);
    // ADR weighted by room revenue (so bigger days pull the weighted average)
    h.adrWeighted += Number(r.adr ?? 0) * Number(r.room_revenue ?? 0);
    h.adrWeight += Number(r.room_revenue ?? 0);
    h.revpar += Number(r.revpar ?? 0);
    h.occPct += Number(r.occupancy_pct ?? 0);
    h.occWeight += 1;
    h.marketAdr = Number(r.market_adr ?? h.marketAdr);
    h.rowCount += 1;
    // Take the worst health flag seen
    if (r.health === 'red') h.health = 'red';
    else if (r.health === 'amber' && h.health !== 'red') h.health = 'amber';
    revenueByHotel.set(r.hotel_id, h);
  }

  const occByHotel = new Map<string, { sold: number; ooo: number; ratingW: number; ratingWeight: number; occPctAvg: number; occWeight: number; lastDate: string }>();
  for (const o of occRaw ?? []) {
    const h = occByHotel.get(o.hotel_id) ?? { sold: 0, ooo: 0, ratingW: 0, ratingWeight: 0, occPctAvg: 0, occWeight: 0, lastDate: '' };
    h.sold += Number(o.rooms_sold ?? 0);
    h.ooo += Number(o.rooms_ooo ?? 0);
    if (o.avg_customer_rating != null) {
      h.ratingW += Number(o.avg_customer_rating);
      h.ratingWeight += 1;
    }
    if (o.date > h.lastDate) h.lastDate = o.date;
    occByHotel.set(o.hotel_id, h);
  }

  const revenueRows = hotels.map((h) => {
    const r = revenueByHotel.get(h.id);
    if (!r || r.rowCount === 0) {
      return {
        hotelId: h.code,
        occupancyPct: 0,
        adr: 0,
        revPar: 0,
        totalRevenue: 0,
        roomRevenue: 0,
        nonRoomRevenue: 0,
        revenueMix: { room: 0, fb: 0, retail: 0, events: 0, other: 0 },
        marketAdr: Number(h.market_adr ?? 0),
        health: 'amber' as const,
      };
    }
    return {
      hotelId: h.code,
      occupancyPct: r.occWeight > 0 ? Math.round((r.occPct / r.occWeight) * 10) / 10 : 0,
      adr: r.adrWeight > 0 ? Math.round(r.adrWeighted / r.adrWeight) : 0,
      revPar: r.rowCount > 0 ? Math.round(r.revpar / r.rowCount) : 0,
      totalRevenue: Math.round(r.total),
      roomRevenue: Math.round(r.room),
      nonRoomRevenue: Math.round(r.nonRoom),
      revenueMix: {
        room: Math.round(r.mixRoom),
        fb: Math.round(r.mixFb),
        retail: Math.round(r.mixRetail),
        events: Math.round(r.mixEvents),
        other: Math.round(r.mixOther),
      },
      marketAdr: Math.round(r.marketAdr),
      health: r.health as 'green' | 'amber' | 'red',
    };
  });

  const dailyRows = hotels.map((h) => {
    const o = occByHotel.get(h.id);
    const r = revenueByHotel.get(h.id);
    return {
      hotelId: h.code,
      date: o?.lastDate ?? win.to,
      roomsSold: o?.sold ?? 0,
      roomsOoo: o?.ooo ?? 0,
      avgCustomerRating: o && o.ratingWeight > 0 ? Math.round((o.ratingW / o.ratingWeight) * 10) / 10 : 0,
      occupancyPct: r && r.occWeight > 0 ? Math.round((r.occPct / r.occWeight) * 10) / 10 : 0,
    };
  });

  // Scope labels
  const scopeLabel =
    q.selection === 'single' && hotels[0]
      ? hotels[0].short_name
      : q.selection === 'regional' || q.selection === 'my-territory'
      ? 'Region'
      : 'Portfolio';

  const scopeSub = `${win.label} · ${hotels.length} Hotel${hotels.length === 1 ? '' : 's'}`;

  const payload = {
    window: win,
    scopeLabel,
    scopeSub,
    hotels: hotels.map((h) => ({
      id: h.code,
      code: h.code,
      name: h.name,
      shortName: h.short_name,
      rooms: h.total_rooms,
      brand: h.brand,
      city: h.city,
      state: h.state,
    })),
    revenueRows,
    dailyRows,
  };

  return Response.json(payload);
}
