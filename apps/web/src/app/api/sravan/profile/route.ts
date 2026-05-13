import { NextResponse } from 'next/server';
import { GetSravanProfileResponseSchema } from '@hos/shared';
import { querySravanRecord } from '@/lib/server/query-sravan';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const profile = await querySravanRecord<Record<string, unknown>>('profile', {});
  const body = GetSravanProfileResponseSchema.parse({ profile });
  return NextResponse.json(body);
}
