import { NextResponse, type NextRequest } from 'next/server';
import { GetRevenuePropertyResponseSchema, PropertyQuerySchema, resolveDateRange, mockRevenueRows } from '@hos/shared';
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
  // Fall back to deterministic mock data when the property has no DB rows yet,
  // so single-property dashboards (Rishab/Emma/Sydney) always populate.
  const summary = rows[0] ?? mockRevenueRows([q.hotelId], q.from, q.to)[0] ?? null;
  const body = GetRevenuePropertyResponseSchema.parse({ summary, range });
  return NextResponse.json(body);
}
