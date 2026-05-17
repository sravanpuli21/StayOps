import { NextResponse, type NextRequest } from 'next/server';
import { db, requireHosTenantId } from '@/lib/db/client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface RateEventOut {
  id: string;
  hotelCode: string;
  ratePlan: string;
  stayDate: string;
  oldRate: number | null;
  newRate: number;
  source: string;
  reason: string | null;
  changedAt: string;
}

/**
 * GET /api/rates/log?hotelCode=BTRCI&limit=50
 * Returns recent rate events for a hotel, newest first.
 */
export async function GET(req: NextRequest) {
  const hotelCode = req.nextUrl.searchParams.get('hotelCode');
  if (!hotelCode) {
    return NextResponse.json({ error: 'hotelCode required' }, { status: 400 });
  }
  const limit = Math.min(500, Math.max(1, Number(req.nextUrl.searchParams.get('limit') ?? '100')));
  const tenantId = await requireHosTenantId();

  const rows = await db<Array<{
    id: string; code: string; rate_plan: string;
    stay_date: string; old_rate: string | null; new_rate: string;
    source: string; reason: string | null; changed_at: string;
  }>>`
    select r.id, h.code, r.rate_plan,
           r.stay_date::text   as stay_date,
           r.old_rate, r.new_rate, r.source, r.reason,
           r.changed_at::text  as changed_at
    from rate_events r
    join hotels h on h.id = r.hotel_id
    where r.tenant_id = ${tenantId} and h.code = ${hotelCode}
    order by r.changed_at desc, r.stay_date desc
    limit ${limit}
  `;

  const events: RateEventOut[] = rows.map((r) => ({
    id:        r.id,
    hotelCode: r.code,
    ratePlan:  r.rate_plan,
    stayDate:  r.stay_date,
    oldRate:   r.old_rate == null ? null : Number(r.old_rate),
    newRate:   Number(r.new_rate),
    source:    r.source,
    reason:    r.reason,
    changedAt: r.changed_at,
  }));

  return NextResponse.json({ events });
}

/**
 * POST /api/rates/log
 * Body: { hotelCode, ratePlan?, stayDateFrom, stayDateTo, newRate, reason? }
 * Inserts one row per stay-date in the inclusive [from, to] range.
 * Open admin endpoint (any persona logged-in via the persona picker can record
 * a BAR change). When real auth lands, gate by GM role.
 */
export async function POST(req: NextRequest) {
  let body: {
    hotelCode?: string;
    ratePlan?: string;
    stayDateFrom?: string;
    stayDateTo?: string;
    newRate?: number;
    reason?: string;
  };
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: 'invalid JSON body' }, { status: 400 }); }

  const { hotelCode, ratePlan = 'BAR', stayDateFrom, stayDateTo, newRate, reason } = body;
  if (!hotelCode || !stayDateFrom || !stayDateTo || newRate == null) {
    return NextResponse.json({ error: 'hotelCode, stayDateFrom, stayDateTo, newRate are required' }, { status: 400 });
  }
  if (!Number.isFinite(newRate) || newRate < 0) {
    return NextResponse.json({ error: 'newRate must be a non-negative number' }, { status: 400 });
  }
  const fromDate = new Date(`${stayDateFrom}T00:00:00Z`);
  const toDate   = new Date(`${stayDateTo}T00:00:00Z`);
  if (Number.isNaN(fromDate.getTime()) || Number.isNaN(toDate.getTime()) || fromDate > toDate) {
    return NextResponse.json({ error: 'invalid stay-date range' }, { status: 400 });
  }

  const tenantId = await requireHosTenantId();
  const [hotel] = await db<{ id: string }[]>`
    select id from hotels where tenant_id = ${tenantId} and code = ${hotelCode} limit 1
  `;
  if (!hotel) return NextResponse.json({ error: `unknown hotelCode ${hotelCode}` }, { status: 404 });

  // Inclusive day count
  const days = Math.round((toDate.getTime() - fromDate.getTime()) / 86400000) + 1;
  const inserts: Array<Promise<unknown>> = [];

  for (let i = 0; i < days; i++) {
    const stay = new Date(fromDate);
    stay.setUTCDate(stay.getUTCDate() + i);
    const iso = stay.toISOString().slice(0, 10);

    // Look up the most recent prior rate for this (hotel, stay_date, rate_plan) to set old_rate.
    inserts.push((async () => {
      const prior = await db<{ new_rate: string }[]>`
        select new_rate from rate_events
        where tenant_id = ${tenantId}
          and hotel_id  = ${hotel.id}
          and stay_date = ${iso}::date
          and rate_plan = ${ratePlan}
        order by changed_at desc
        limit 1
      `;
      const oldRate = prior[0]?.new_rate == null ? null : Number(prior[0].new_rate);

      await db`
        insert into rate_events (
          tenant_id, hotel_id, rate_plan, stay_date,
          old_rate, new_rate, source, reason
        )
        values (
          ${tenantId}, ${hotel.id}, ${ratePlan}, ${iso}::date,
          ${oldRate}, ${newRate}, 'manual', ${reason ?? null}
        )
      `;
    })());
  }
  await Promise.all(inserts);

  return NextResponse.json({ ok: true, inserted: days, stayDates: days });
}
