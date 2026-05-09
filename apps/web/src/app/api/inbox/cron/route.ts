import { NextRequest } from 'next/server';
import { pollGmailInbox } from '@/lib/ingest/gmail';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Vercel Hobby cap

/**
 * Vercel cron endpoint. Runs every 1 minute per vercel.json.
 * Vercel sends a signed request with CRON_SECRET header when configured,
 * or we accept internal scheduled invocations by user-agent.
 */
export async function GET(req: NextRequest) {
  // Vercel cron auth: x-vercel-cron header is present for cron invocations.
  // For extra safety, check CRON_SECRET if set.
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const provided = req.headers.get('authorization');
    if (provided !== `Bearer ${cronSecret}`) {
      return Response.json({ error: 'unauthorized' }, { status: 401 });
    }
  }

  const outcome = await pollGmailInbox();
  return Response.json({ ok: true, outcome });
}
