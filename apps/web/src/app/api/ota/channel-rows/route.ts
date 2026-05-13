import { NextResponse, type NextRequest } from 'next/server';
import { OTA_CHANNEL_ROWS, GetOtaChannelRowsResponseSchema } from '@hos/shared';
import { readHotelIds } from '@/lib/server/parse-query';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const hotelIds = readHotelIds(req); // null=all, []=none, string[]=scope
  const rows =
    hotelIds === null
      ? OTA_CHANNEL_ROWS
      : hotelIds.length === 0
        ? []
        : OTA_CHANNEL_ROWS.filter((r) => hotelIds.includes(r.hotelId));
  const body = GetOtaChannelRowsResponseSchema.parse({ rows });
  return NextResponse.json(body);
}
