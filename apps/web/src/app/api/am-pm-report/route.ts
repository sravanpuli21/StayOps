import { NextResponse, type NextRequest } from 'next/server';
import { GetAmPmReportResponseSchema, AmPmReportQuerySchema } from '@hos/shared';
import { queryAmPmReport } from '@/lib/server/query-am-pm';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const q = AmPmReportQuerySchema.parse({
    slot:    req.nextUrl.searchParams.get('slot') ?? 'AM',
    hotelId: req.nextUrl.searchParams.get('hotelId') ?? undefined,
  });
  const report = await queryAmPmReport(q.slot, q.hotelId ?? null);
  const body = GetAmPmReportResponseSchema.parse(report);
  return NextResponse.json(body);
}
