import { NextResponse, type NextRequest } from 'next/server';
import { GetAssetsResponseSchema } from '@hos/shared';
import { queryAssets } from '@/lib/server/query-assets';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const hotelId = req.nextUrl.searchParams.get('hotelId');
  const category = req.nextUrl.searchParams.get('category');
  const assets = await queryAssets(hotelId, category);
  const body = GetAssetsResponseSchema.parse({ assets });
  return NextResponse.json(body);
}
