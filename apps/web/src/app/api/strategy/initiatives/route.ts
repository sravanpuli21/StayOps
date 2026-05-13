import { NextResponse } from 'next/server';
import { GetStrategicInitiativesResponseSchema } from '@hos/shared';
import { queryStrategicInitiatives } from '@/lib/server/query-strategy';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const initiatives = await queryStrategicInitiatives();
  const body = GetStrategicInitiativesResponseSchema.parse({ initiatives });
  return NextResponse.json(body);
}
