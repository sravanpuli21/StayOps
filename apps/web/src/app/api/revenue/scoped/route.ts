import { NextResponse, type NextRequest } from 'next/server';
import { GetRevenueScopedResponseSchema, ScopedQuerySchema, resolveDateRange } from '@hos/shared';
import { queryRevenueAggregates } from '@/lib/server/query-revenue';
import { frozenToday } from '@/lib/server/frozen-today';
import { readHotelIds } from '@/lib/server/parse-query';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const today = frozenToday();
  const q = ScopedQuerySchema.parse({
    hotelIds: readHotelIds(req),
    from: req.nextUrl.searchParams.get('from') ?? resolveDateRange('yesterday', today).from,
    to:   req.nextUrl.searchParams.get('to')   ?? resolveDateRange('yesterday', today).to,
  });
  const range = resolveDateRange('custom', today, { from: q.from, to: q.to });
  const rows = await queryRevenueAggregates(q.hotelIds, q.from, q.to);
  const body = GetRevenueScopedResponseSchema.parse({ rows, range });
  return NextResponse.json(body);
}
