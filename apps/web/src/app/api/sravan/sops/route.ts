import { NextResponse } from 'next/server';
import { GetSravanSopsResponseSchema } from '@hos/shared';
import { querySravanRecord } from '@/lib/server/query-sravan';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const sops = await querySravanRecord<Array<Record<string, unknown>>>('sops', []);
  const body = GetSravanSopsResponseSchema.parse({ sops });
  return NextResponse.json(body);
}
