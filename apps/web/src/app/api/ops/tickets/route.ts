import { NextResponse, type NextRequest } from 'next/server';
import { GetTicketsResponseSchema, CreateTicketRequestSchema, CreateTicketResponseSchema } from '@hos/shared';
import { queryTickets } from '@/lib/server/query-tickets';
import { insertTicket } from '@/lib/server/insert-ticket';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const hotelId  = req.nextUrl.searchParams.get('hotelId');
  const status   = req.nextUrl.searchParams.get('status');
  // `all=1` includes closed/resolved tickets (used by the front-desk Requests
  // tabs that need to render Completed / Closed lists).
  const includeAll = req.nextUrl.searchParams.get('all') === '1';
  const rows = await queryTickets(hotelId, !includeAll);
  const tickets = status ? rows.filter((t) => t.status === status) : rows;
  const body = GetTicketsResponseSchema.parse({ tickets });
  return NextResponse.json(body);
}

export async function POST(req: NextRequest) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid JSON body' }, { status: 400 });
  }

  const parsed = CreateTicketRequestSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: 'validation failed', issues: parsed.error.issues },
      { status: 400 },
    );
  }

  // Require either roomNumber or area so the ticket has *some* location.
  if (!parsed.data.roomNumber && !parsed.data.area) {
    return NextResponse.json(
      { ok: false, error: 'either roomNumber or area is required' },
      { status: 400 },
    );
  }

  const ticket = await insertTicket(parsed.data);
  if (!ticket) {
    return NextResponse.json(
      { ok: false, error: `unknown hotelCode ${parsed.data.hotelCode}` },
      { status: 404 },
    );
  }

  const body = CreateTicketResponseSchema.parse({
    ok: true,
    ticket: ticket as unknown as Record<string, unknown>,
  });
  return NextResponse.json(body, { status: 201 });
}
