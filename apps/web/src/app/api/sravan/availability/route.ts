import { NextResponse } from 'next/server';
import { querySravanRecord } from '@/lib/server/query-sravan';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const availability = await querySravanRecord<Array<Record<string, unknown>>>('availability', []);
  return NextResponse.json({ availability });
}
