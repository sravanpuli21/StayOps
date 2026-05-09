import { NextRequest } from 'next/server';
import { z } from 'zod';
import { supabaseServer, getHosTenantId } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const LogRateBody = z.object({
  hotelCode: z.string().min(1),
  roomTypeCode: z.string().optional(),
  ratePlan: z.string().default('BAR'),
  stayDateFrom: z.string(),
  stayDateTo: z.string(),
  newRate: z.number().positive(),
  reason: z.string().optional(),
  losRestriction: z.number().int().optional(),
  minStay: z.number().int().optional(),
});

/** POST /api/rates/log — record a rate change for one or more stay dates. */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const parsed = LogRateBody.safeParse(body);
  if (!parsed.success) return Response.json({ error: 'invalid body', issues: parsed.error.issues }, { status: 400 });
  const q = parsed.data;

  const sb = supabaseServer();
  const tenantId = await getHosTenantId();

  const { data: h } = await sb.from('hotels').select('id').eq('tenant_id', tenantId).eq('code', q.hotelCode).single();
  if (!h) return Response.json({ error: 'hotel not found' }, { status: 404 });

  let roomTypeId: string | null = null;
  if (q.roomTypeCode) {
    const { data: rt } = await sb.from('room_types').select('id').eq('hotel_id', h.id).eq('code', q.roomTypeCode).single();
    roomTypeId = rt?.id ?? null;
  }

  // Expand date range to individual rate_events rows (one per stay date)
  const from = new Date(q.stayDateFrom);
  const to = new Date(q.stayDateTo);
  if (to < from) return Response.json({ error: 'stayDateTo must be >= stayDateFrom' }, { status: 400 });
  const rows: Array<{
    tenant_id: string;
    hotel_id: string;
    room_type_id: string | null;
    rate_plan: string;
    stay_date: string;
    old_rate: number | null;
    new_rate: number;
    reason: string | null;
    los_restriction: number | null;
    min_stay: number | null;
  }> = [];
  for (let d = new Date(from); d <= to; d.setDate(d.getDate() + 1)) {
    const isoDate = d.toISOString().slice(0, 10);
    // Look up most recent rate for this stay_date/room_type to capture old_rate
    const { data: prev } = await sb
      .from('rate_events')
      .select('new_rate')
      .eq('hotel_id', h.id)
      .eq('stay_date', isoDate)
      .eq('rate_plan', q.ratePlan)
      .order('changed_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    rows.push({
      tenant_id: tenantId,
      hotel_id: h.id,
      room_type_id: roomTypeId,
      rate_plan: q.ratePlan,
      stay_date: isoDate,
      old_rate: prev?.new_rate ?? null,
      new_rate: q.newRate,
      reason: q.reason ?? null,
      los_restriction: q.losRestriction ?? null,
      min_stay: q.minStay ?? null,
    });
  }

  const { error: insErr, data } = await sb.from('rate_events').insert(rows).select('id');
  if (insErr) return Response.json({ error: insErr.message }, { status: 500 });

  return Response.json({ inserted: data?.length ?? 0, stayDates: rows.length });
}

const ListQuery = z.object({
  hotelCode: z.string(),
  stayDateFrom: z.string().optional(),
  stayDateTo: z.string().optional(),
});

/** GET /api/rates/log?hotelCode=BTRCI&stayDateFrom=...&stayDateTo=... — rate history. */
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const parsed = ListQuery.safeParse({
    hotelCode: sp.get('hotelCode') ?? '',
    stayDateFrom: sp.get('stayDateFrom') ?? undefined,
    stayDateTo: sp.get('stayDateTo') ?? undefined,
  });
  if (!parsed.success) return Response.json({ error: 'invalid query' }, { status: 400 });
  const q = parsed.data;

  const sb = supabaseServer();
  const tenantId = await getHosTenantId();
  const { data: h } = await sb.from('hotels').select('id').eq('tenant_id', tenantId).eq('code', q.hotelCode).single();
  if (!h) return Response.json({ error: 'hotel not found' }, { status: 404 });

  let query = sb
    .from('rate_events')
    .select('id, room_type_id, rate_plan, stay_date, old_rate, new_rate, changed_at, reason')
    .eq('hotel_id', h.id)
    .order('changed_at', { ascending: false })
    .limit(500);
  if (q.stayDateFrom) query = query.gte('stay_date', q.stayDateFrom);
  if (q.stayDateTo) query = query.lte('stay_date', q.stayDateTo);

  const { data, error } = await query;
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ events: data ?? [] });
}
