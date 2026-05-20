import { NextResponse, type NextRequest } from 'next/server';
import { AddTicketNoteSchema, CreateTicketResponseSchema } from '@hos/shared';
import { addTicketNote } from '@/lib/server/update-ticket';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface Ctx {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid JSON body' }, { status: 400 });
  }
  const parsed = AddTicketNoteSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: 'validation failed', issues: parsed.error.issues },
      { status: 400 },
    );
  }
  const actor = parsed.data.actor?.trim() || 'Front Desk';
  const ticket = await addTicketNote(id, parsed.data.note, actor);
  if (!ticket) {
    return NextResponse.json({ ok: false, error: `ticket ${id} not found` }, { status: 404 });
  }
  const body = CreateTicketResponseSchema.parse({
    ok: true,
    ticket: ticket as unknown as Record<string, unknown>,
  });
  return NextResponse.json(body);
}
