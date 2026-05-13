import { NextResponse, type NextRequest } from 'next/server';
import { GetRevenuePropertyResponseSchema, PropertyQuerySchema, resolveDateRange } from '@hos/shared';
import { queryRevenueAggregates } from '@/lib/server/query-revenue';
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
  const rows = await queryRevenueAggregates([q.hotelId], q.from, q.to);
  const body = GetRevenuePropertyResponseSchema.parse({ summary: rows[0] ?? null, range });
  return NextResponse.json(body);
}
