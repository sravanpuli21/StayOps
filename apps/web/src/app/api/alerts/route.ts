import { NextResponse, type NextRequest } from 'next/server';
import { RED_FLAGS, GetRedFlagsResponseSchema } from '@hos/shared';
import { readHotelIds } from '@/lib/server/parse-query';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const hotelIds = readHotelIds(req);
  const modulesParam = req.nextUrl.searchParams.get('modules');
  const moduleSet =
    modulesParam == null ? null : new Set(modulesParam.split(',').filter(Boolean));

  let flags =
    hotelIds === null
      ? RED_FLAGS
      : hotelIds.length === 0
        ? []
        : RED_FLAGS.filter((f) => hotelIds.includes(f.hotelId));
  if (moduleSet) {
    flags = flags.filter((f) => moduleSet.has(f.module));
  }

  const body = GetRedFlagsResponseSchema.parse({ flags });
  return NextResponse.json(body);
}
