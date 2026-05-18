import { NextResponse, type NextRequest } from 'next/server';
import { GetRevenueBreakdownResponseSchema, ScopedQuerySchema, RevenueAggSchema, resolveDateRange } from '@hos/shared';
import { queryRevenueBreakdown } from '@/lib/server/query-revenue-breakdown';
import { frozenToday } from '@/lib/server/frozen-today';
import { readHotelIds } from '@/lib/server/parse-query';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const today = frozenToday();
  const aggParam = req.nextUrl.searchParams.get('agg');
  const q = ScopedQuerySchema.parse({
    hotelIds: readHotelIds(req),
    from: req.nextUrl.searchParams.get('from') ?? resolveDateRange('yesterday', today).from,
    to:   req.nextUrl.searchParams.get('to')   ?? resolveDateRange('yesterday', today).to,
    agg:  aggParam ? RevenueAggSchema.parse(aggParam) : undefined,
  });
  const range = resolveDateRange('custom', today, { from: q.from, to: q.to });
  const { portfolio, perHotel } = await queryRevenueBreakdown(q.hotelIds, q.from, q.to, q.agg ?? 'today');
  const body = GetRevenueBreakdownResponseSchema.parse({ portfolio, perHotel, range });
  return NextResponse.json(body);
}
