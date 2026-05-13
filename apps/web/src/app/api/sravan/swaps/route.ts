import { NextResponse } from 'next/server';
import { GetSravanSwapsResponseSchema } from '@hos/shared';
import { querySravanRecord } from '@/lib/server/query-sravan';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const swaps = await querySravanRecord<Array<Record<string, unknown>>>('swap_requests', []);
  const body = GetSravanSwapsResponseSchema.parse({ swaps });
  return NextResponse.json(body);
}
