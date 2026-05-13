import { NextRequest } from 'next/server';
import { pollGmailInbox } from '@/lib/ingest/gmail';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/inbox/cron — Vercel cron entry point. Authenticates via the
 * `Authorization: Bearer ${CRON_SECRET}` header that Vercel injects.
 *
 * Schedule lives in vercel.json. Daily on Hobby; bump to hourly on Pro.
 */
export async function GET(req: NextRequest) {
  const expected = process.env.CRON_SECRET;
  const provided = req.headers.get('authorization');
  if (!expected) return Response.json({ error: 'CRON_SECRET not configured' }, { status: 500 });
  if (provided !== `Bearer ${expected}`) return Response.json({ error: 'unauthorized' }, { status: 401 });
  const result = await pollGmailInbox();
  return Response.json(result);
}
