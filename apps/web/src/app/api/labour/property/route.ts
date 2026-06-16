import { NextResponse, type NextRequest } from 'next/server';
import { GetLabourPropertyResponseSchema, PropertyQuerySchema, resolveDateRange, mockLabourRows } from '@hos/shared';
import { queryLabourAggregates } from '@/lib/server/query-labour';
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
  const rows = await queryLabourAggregates([q.hotelId], q.from, q.to);
  // Fall back to mock when the property has no labour rows (or only an empty
  // zeroed summary) so single-property dashboards always populate.
  const dbRow = rows[0];
  const summary = dbRow && dbRow.scheduledHours > 0
    ? dbRow
    : mockLabourRows([q.hotelId], q.from, q.to)[0] ?? null;
  const body = GetLabourPropertyResponseSchema.parse({ summary, range });
  return NextResponse.json(body);
}
