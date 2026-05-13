import { NextResponse } from 'next/server';
import { REGIONAL_ROSTER, computeRegionalScore, GetRegionalScoresResponseSchema } from '@hos/shared';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const scores = REGIONAL_ROSTER.map((r) => ({
    regionalId: r.id,
    score:      computeRegionalScore(r.hotelIds),
  }));
  const body = GetRegionalScoresResponseSchema.parse({ scores });
  return NextResponse.json(body);
}
