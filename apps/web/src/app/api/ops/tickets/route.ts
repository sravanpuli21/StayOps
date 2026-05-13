import { NextResponse, type NextRequest } from 'next/server';
import { GetTicketsResponseSchema } from '@hos/shared';
import { queryTickets } from '@/lib/server/query-tickets';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const hotelId = req.nextUrl.searchParams.get('hotelId');
  const status = req.nextUrl.searchParams.get('status');
  const all = await queryTickets(hotelId);
  const tickets = status ? all.filter((t) => t.status === status) : all;
  const body = GetTicketsResponseSchema.parse({ tickets });
  return NextResponse.json(body);
}
