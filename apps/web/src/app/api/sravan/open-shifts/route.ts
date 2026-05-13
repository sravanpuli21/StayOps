import { NextResponse } from 'next/server';
import { GetSravanOpenShiftsResponseSchema } from '@hos/shared';
import { querySravanRecord } from '@/lib/server/query-sravan';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const openShifts = await querySravanRecord<Array<Record<string, unknown>>>('open_shifts', []);
  const body = GetSravanOpenShiftsResponseSchema.parse({ openShifts });
  return NextResponse.json(body);
}
