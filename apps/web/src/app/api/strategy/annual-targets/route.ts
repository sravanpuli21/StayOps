import { NextResponse } from 'next/server';
import { GetAnnualTargetsResponseSchema } from '@hos/shared';
import { queryAnnualTargets } from '@/lib/server/query-strategy';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const targets = await queryAnnualTargets();
  const body = GetAnnualTargetsResponseSchema.parse({ targets });
  return NextResponse.json(body);
}
