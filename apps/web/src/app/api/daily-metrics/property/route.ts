import { NextResponse, type NextRequest } from 'next/server';
import { GetDailyPropertyResponseSchema, PropertyQuerySchema, resolveDateRange, mockDailyRows } from '@hos/shared';
import { queryDailyAggregates } from '@/lib/server/query-daily';
import { frozenToday } from '@/lib/server/frozen-today';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const today = frozenToday();
  const q = PropertyQuerySchema.parse({
    hotelId: req.nextUrl.searchParams.get('hotelId') ?? '',
    from: req.nextUrl.searchParams.get('from') ?? resolveDateRange('yesterday', today).from,
    to:   req.nextUrl.searchParams.get('to')   ?? resolveDateRange('yesterday', today).to,
  });
  const range = resolveDateRange('custom', today, { from: q.from, to: q.to });
  const rows = await queryDailyAggregates([q.hotelId], q.from, q.to);
  // Fall back to mock when the property has no daily metrics yet.
  const summary = rows[0] ?? mockDailyRows([q.hotelId], q.from, q.to)[0] ?? null;
  const body = GetDailyPropertyResponseSchema.parse({ summary, range });
  return NextResponse.json(body);
}
