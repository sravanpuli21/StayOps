import { NextResponse, type NextRequest } from 'next/server';
import { GetLabourScopedResponseSchema, ScopedQuerySchema, resolveDateRange } from '@hos/shared';
import { queryLabourAggregates } from '@/lib/server/query-labour';
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
  // ?breakdown=department flag: when present, departments are guaranteed to
  // be populated (existing default already includes them). When absent we
  // could skip the dept query for speed, but consumers expect the field
  // either way, so always populate for now.
  const breakdown = req.nextUrl.searchParams.get('breakdown');
  const includeDepartments = breakdown == null || breakdown === 'department';
  const rows = await queryLabourAggregates(q.hotelIds, q.from, q.to, includeDepartments);
  const body = GetLabourScopedResponseSchema.parse({ rows, range });
  return NextResponse.json(body);
}
