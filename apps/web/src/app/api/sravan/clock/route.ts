import { NextResponse } from 'next/server';
import { querySravanRecord } from '@/lib/server/query-sravan';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const sessions = await querySravanRecord<Array<Record<string, unknown>>>('clock_log', []);
  return NextResponse.json({ sessions });
}
