import { NextResponse, type NextRequest } from 'next/server';
import { GetPropertyOpsStatsResponseSchema, resolveDateRange } from '@hos/shared';
import { queryPropertyOpsStats } from '@/lib/server/query-property-ops-stats';
import { frozenToday } from '@/lib/server/frozen-today';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const today = frozenToday();
  const hotelId = req.nextUrl.searchParams.get('hotelId');
  if (!hotelId) {
    return NextResponse.json({ error: 'hotelId is required' }, { status: 400 });
  }
  const from = req.nextUrl.searchParams.get('from') ?? resolveDateRange('ytd', today).from;
  const to   = req.nextUrl.searchParams.get('to')   ?? resolveDateRange('today', today).to;
  const stats = await queryPropertyOpsStats(hotelId, from, to);
  const body = GetPropertyOpsStatsResponseSchema.parse({ stats });
  return NextResponse.json(body);
}
