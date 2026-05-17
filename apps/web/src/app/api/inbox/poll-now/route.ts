import { NextRequest } from 'next/server';
import { requireAdminSecret } from '@/lib/admin-guard';
import { pollGmailInbox } from '@/lib/ingest/gmail';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * POST /api/inbox/poll-now — admin-gated manual trigger of the Gmail poller.
 *
 * Two response modes:
 *  - default: JSON `PollOutcome` once done
 *  - `Accept: text/event-stream`: SSE event stream with per-message progress
 *
 * Used by the "Check inbox now" button in /web/admin/ingestion.
 */
export async function POST(req: NextRequest) {
  const guard = requireAdminSecret(req);
  if (guard) return guard;

  const wantsStream = req.headers.get('accept')?.includes('text/event-stream') ?? false;
  if (!wantsStream) {
    const result = await pollGmailInbox();
    return Response.json(result);
  }

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const enc = new TextEncoder();
      const send = (event: string, data: unknown) => {
        controller.enqueue(enc.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
      };
      try {
        await pollGmailInbox({
          onProgress: (ev) => send(ev.name, ev.data),
        });
      } catch (e) {
        send('error', { message: e instanceof Error ? e.message : String(e) });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'content-type': 'text/event-stream; charset=utf-8',
      'cache-control': 'no-cache, no-transform',
      'x-accel-buffering': 'no',
      connection: 'keep-alive',
    },
  });
}
