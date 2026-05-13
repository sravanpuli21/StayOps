import { NextResponse, type NextRequest } from 'next/server';
import { getPropertyOpsSummary, GetOpsSummaryResponseSchema } from '@hos/shared';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const hotelId = req.nextUrl.searchParams.get('hotelId');
  if (!hotelId) {
    return NextResponse.json({ error: 'hotelId required' }, { status: 400 });
  }
  const summary = getPropertyOpsSummary(hotelId);
  const body = GetOpsSummaryResponseSchema.parse({ summary });
  return NextResponse.json(body);
}
