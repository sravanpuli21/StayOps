import { NextResponse, type NextRequest } from 'next/server';
import { GetHotelTargetsResponseSchema } from '@hos/shared';
import { queryHotelTargets } from '@/lib/server/query-strategy';
import { readHotelIds } from '@/lib/server/parse-query';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const hotelIds = readHotelIds(req);
  const all = await queryHotelTargets();
  const filtered =
    hotelIds === null
      ? all
      : hotelIds.length === 0
        ? []
        : all.filter((t) => hotelIds.includes((t as { hotelId?: string }).hotelId ?? ''));
  const body = GetHotelTargetsResponseSchema.parse({ targets: filtered });
  return NextResponse.json(body);
}
