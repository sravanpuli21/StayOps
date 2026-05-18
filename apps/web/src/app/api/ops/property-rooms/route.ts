import { NextResponse, type NextRequest } from 'next/server';
import { GetPropertyRoomsResponseSchema } from '@hos/shared';
import { queryPropertyRooms } from '@/lib/server/query-property-rooms';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const hotelId = req.nextUrl.searchParams.get('hotelId');
  if (!hotelId) {
    return NextResponse.json({ error: 'hotelId is required' }, { status: 400 });
  }
  const rooms = await queryPropertyRooms(hotelId);
  const body = GetPropertyRoomsResponseSchema.parse({ rooms });
  return NextResponse.json(body);
}
