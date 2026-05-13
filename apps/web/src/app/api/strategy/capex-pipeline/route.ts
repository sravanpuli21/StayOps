import { NextResponse } from 'next/server';
import { GetCapexPipelineResponseSchema } from '@hos/shared';
import { queryCapexPipeline } from '@/lib/server/query-strategy';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const pipeline = await queryCapexPipeline();
  const body = GetCapexPipelineResponseSchema.parse({ pipeline });
  return NextResponse.json(body);
}
