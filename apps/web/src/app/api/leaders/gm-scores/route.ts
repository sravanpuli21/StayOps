import { NextResponse, type NextRequest } from 'next/server';
import { getAllGMScores, GetGmScoresResponseSchema } from '@hos/shared';
import { readHotelIds } from '@/lib/server/parse-query';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const hotelIds = readHotelIds(req);
  const all = getAllGMScores();
  const filtered =
    hotelIds === null
      ? all
      : hotelIds.length === 0
        ? []
        : all.filter((g) => hotelIds.includes(g.hotel.id));
  const scores = filtered.map((g) => ({
    hotelId: g.hotel.id,
    score:   g.score,
  }));
  const body = GetGmScoresResponseSchema.parse({ scores });
  return NextResponse.json(body);
}
