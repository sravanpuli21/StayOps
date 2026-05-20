import { NextResponse, type NextRequest } from 'next/server';
import { GetPunchesResponseSchema } from '@hos/shared';
import { recentPunches } from '@/lib/server/employee-punches';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const hotelId = req.nextUrl.searchParams.get('hotelId');
  if (!hotelId) {
    return NextResponse.json({ error: 'hotelId is required' }, { status: 400 });
  }
  const punches = await recentPunches(hotelId, 20);
  const body = GetPunchesResponseSchema.parse({ punches });
  return NextResponse.json(body);
}
