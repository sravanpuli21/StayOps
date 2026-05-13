import { NextRequest } from 'next/server';
import { requireAdminSecret } from '@/lib/admin-guard';
import { pollGmailInbox } from '@/lib/ingest/gmail';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/inbox/poll-now — admin-gated manual trigger of the Gmail poller.
 * Used by the "Check inbox now" button in /web/admin/ingestion.
 */
export async function POST(req: NextRequest) {
  const guard = requireAdminSecret(req);
  if (guard) return guard;
  const result = await pollGmailInbox();
  return Response.json(result);
}
