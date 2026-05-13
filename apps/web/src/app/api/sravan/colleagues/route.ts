import { NextResponse } from 'next/server';
import { GetSravanColleaguesResponseSchema } from '@hos/shared';
import { querySravanRecord } from '@/lib/server/query-sravan';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const colleagues = await querySravanRecord<Array<Record<string, unknown>>>('colleagues', []);
  const body = GetSravanColleaguesResponseSchema.parse({ colleagues });
  return NextResponse.json(body);
}
