import { NextResponse, type NextRequest } from 'next/server';
import { PunchRequestSchema, PunchResponseSchema } from '@hos/shared';
import { verifyEmployee, recordPunch } from '@/lib/server/employee-punches';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  let json: unknown;
  try { json = await req.json(); }
  catch { return NextResponse.json({ ok: false, error: 'invalid JSON body' }, { status: 400 }); }

  const parsed = PunchRequestSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: 'validation failed', issues: parsed.error.issues },
      { status: 400 },
    );
  }
  const { hotelCode, employeeId, pin, kind } = parsed.data;

  const emp = await verifyEmployee(hotelCode, employeeId, pin);
  if (!emp) return NextResponse.json({ ok: false, error: 'Invalid ID or PIN' }, { status: 401 });

  const punch = await recordPunch(emp.id, kind);
  if (!punch) return NextResponse.json({ ok: false, error: 'Could not record punch' }, { status: 500 });

  const body = PunchResponseSchema.parse({ ok: true, punch });
  return NextResponse.json(body, { status: 201 });
}
