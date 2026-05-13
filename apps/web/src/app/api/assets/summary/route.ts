import { NextResponse, type NextRequest } from 'next/server';
import { GetAssetSummaryResponseSchema } from '@hos/shared';
import { queryAssetSummaries } from '@/lib/server/query-assets';
import { readHotelIds } from '@/lib/server/parse-query';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const summaries = await queryAssetSummaries(readHotelIds(req));
  const body = GetAssetSummaryResponseSchema.parse({ summaries });
  return NextResponse.json(body);
}
