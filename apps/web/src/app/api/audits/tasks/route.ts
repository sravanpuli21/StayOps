import { NextResponse, type NextRequest } from 'next/server';
import { GetAuditTasksResponseSchema } from '@hos/shared';
import { queryAuditTasks } from '@/lib/server/query-audits';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const hotelId = req.nextUrl.searchParams.get('hotelId');
  const tasks = await queryAuditTasks(hotelId);
  const body = GetAuditTasksResponseSchema.parse({ tasks });
  return NextResponse.json(body);
}
