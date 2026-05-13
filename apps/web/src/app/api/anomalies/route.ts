import { NextResponse, type NextRequest } from 'next/server';
import { AI_ANOMALIES, GetAnomaliesResponseSchema } from '@hos/shared';
import { readHotelIds } from '@/lib/server/parse-query';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const hotelIds = readHotelIds(req);
  const anomalies =
    hotelIds === null
      ? AI_ANOMALIES
      : hotelIds.length === 0
        ? []
        : AI_ANOMALIES.filter((a) => hotelIds.includes(a.hotelId));
  const body = GetAnomaliesResponseSchema.parse({ anomalies });
  return NextResponse.json(body);
}
