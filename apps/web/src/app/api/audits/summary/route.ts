import { NextResponse, type NextRequest } from 'next/server';
import { GetAuditSummaryResponseSchema } from '@hos/shared';
import { queryAuditSummary } from '@/lib/server/query-audits';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const hotelId = req.nextUrl.searchParams.get('hotelId');
  if (!hotelId) {
    return NextResponse.json({ error: 'hotelId required' }, { status: 400 });
  }
  const summary = await queryAuditSummary(hotelId);
  const body = GetAuditSummaryResponseSchema.parse({ summary });
  return NextResponse.json(body);
}
