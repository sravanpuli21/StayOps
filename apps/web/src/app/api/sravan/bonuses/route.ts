import { NextResponse } from 'next/server';
import { GetSravanBonusesResponseSchema } from '@hos/shared';
import { querySravanRecord } from '@/lib/server/query-sravan';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const bonuses = await querySravanRecord<Array<Record<string, unknown>>>('bonuses', []);
  const body = GetSravanBonusesResponseSchema.parse({ bonuses });
  return NextResponse.json(body);
}
