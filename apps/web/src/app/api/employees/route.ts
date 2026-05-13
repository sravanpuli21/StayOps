import { NextResponse, type NextRequest } from 'next/server';
import { getEmployeesForHotel, GetEmployeesResponseSchema } from '@hos/shared';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const hotelId = req.nextUrl.searchParams.get('hotelId');
  const team = req.nextUrl.searchParams.get('team');
  if (!hotelId) {
    return NextResponse.json({ error: 'hotelId required' }, { status: 400 });
  }
  const all = getEmployeesForHotel(hotelId);
  const employees = team ? all.filter((e) => e.team === team) : all;
  const body = GetEmployeesResponseSchema.parse({ employees });
  return NextResponse.json(body);
}
