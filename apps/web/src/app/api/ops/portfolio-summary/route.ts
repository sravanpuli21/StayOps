import { NextResponse, type NextRequest } from 'next/server';
import { GetPortfolioOpsResponseSchema } from '@hos/shared';
import { queryPortfolioOps } from '@/lib/server/query-portfolio-ops';
import { readHotelIds } from '@/lib/server/parse-query';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const hotelIds = readHotelIds(req);
  const rows = await queryPortfolioOps(hotelIds);
  const body = GetPortfolioOpsResponseSchema.parse({ rows });
  return NextResponse.json(body);
}
