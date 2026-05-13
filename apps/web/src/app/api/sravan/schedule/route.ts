import { NextResponse } from 'next/server';
import { GetSravanScheduleResponseSchema } from '@hos/shared';
import { querySravanRecord } from '@/lib/server/query-sravan';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const shifts = await querySravanRecord<Array<Record<string, unknown>>>('schedule', []);
  const body = GetSravanScheduleResponseSchema.parse({ shifts });
  return NextResponse.json(body);
}
