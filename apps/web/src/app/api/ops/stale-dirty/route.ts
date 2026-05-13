import { NextResponse, type NextRequest } from 'next/server';
import { GetStaleDirtyResponseSchema } from '@hos/shared';
import { queryStaleDirtyRooms } from '@/lib/server/query-rooms';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const hotelId = req.nextUrl.searchParams.get('hotelId');
  const rooms = await queryStaleDirtyRooms(hotelId);
  const body = GetStaleDirtyResponseSchema.parse({ rooms });
  return NextResponse.json(body);
}
