import { NextResponse } from 'next/server';
import { GetSravanPaystubsResponseSchema } from '@hos/shared';
import { querySravanRecord } from '@/lib/server/query-sravan';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const paystubs = await querySravanRecord<Array<Record<string, unknown>>>('paystubs', []);
  const body = GetSravanPaystubsResponseSchema.parse({ paystubs });
  return NextResponse.json(body);
}
