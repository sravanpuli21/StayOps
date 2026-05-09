import { NextRequest } from 'next/server';
import { requireAdminSecret } from '@/lib/admin-guard';
import { pollGmailInbox } from '@/lib/ingest/gmail';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * POST /api/inbox/poll-now — manual trigger used by the admin "Check inbox now"
 * button. Behind admin secret.
 */
export async function POST(req: NextRequest) {
  const guard = requireAdminSecret(req);
  if (guard) return guard;
  const outcome = await pollGmailInbox();
  return Response.json({ ok: true, outcome });
}
