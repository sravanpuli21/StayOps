import { NextResponse, type NextRequest } from 'next/server';
import { GetRoomsResponseSchema } from '@hos/shared';
import { queryRooms } from '@/lib/server/query-rooms';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const hotelId = req.nextUrl.searchParams.get('hotelId');
  const status = req.nextUrl.searchParams.get('status');
  const all = await queryRooms(hotelId);
  const rooms = status ? all.filter((r) => r.status === status) : all;
  const body = GetRoomsResponseSchema.parse({ rooms });
  return NextResponse.json(body);
}
