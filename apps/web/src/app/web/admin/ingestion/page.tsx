'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, Mail, RefreshCw, CheckCircle2, AlertCircle, Loader2, Circle, Inbox,
} from 'lucide-react';

interface StepEvent {
  name: string;
  data: Record<string, unknown>;
  ts: number;
}

interface DoneOutcome {
  connected: boolean;
  scannedMessages: number;
  processedMessages: number;
  skippedDuplicates: number;
  failedMessages: number;
  batchIds: string[];
  errors: string[];
  durationMs: number;
}

const STEP_LABEL: Record<string, string> = {
  connecting:         'Connecting to Gmail',
  connected:          'Connected',
  scanned:            'Scanned inbox',
  'message-start':    'Reading message',
  'message-parsed':   'Parsed attachment',
  'message-duplicate':'Skipped duplicate',
  'message-failed':   'Message failed',
  'message-applied':  'Applied to DB',
  done:               'Done',
  error:              'Error',
};

export default function IngestionPage() {
  const [running, setRunning] = useState(false);
  const [events, setEvents] = useState<StepEvent[]>([]);
  const [done, setDone] = useState<DoneOutcome | null>(null);
  const [errored, setErrored] = useState<string | null>(null);

  async function pollNow() {
    setRunning(true);
    setEvents([]);
    setDone(null);
    setErrored(null);

    const secret = window.localStorage.getItem('stayops_admin') ?? '';
    try {
      const res = await fetch('/api/inbox/poll-now', {
        method: 'POST',
        headers: { 'x-admin-secret': secret, accept: 'text/event-stream' },
      });
      if (!res.body) {
        setErrored('No response body from server');
        return;
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = '';

      while (true) {
        const { value, done: streamDone } = await reader.read();
        if (streamDone) break;
        buf += decoder.decode(value, { stream: true });
        let idx: number;
        while ((idx = buf.indexOf('\n\n')) !== -1) {
          const block = buf.slice(0, idx);
          buf = buf.slice(idx + 2);
          const event = parseSseBlock(block);
          if (!event) continue;
          if (event.name === 'done') {
            setDone(event.data as unknown as DoneOutcome);
          } else if (event.name === 'error') {
            const msg = (event.data as { message?: string }).message ?? 'unknown error';
            setErrored(msg);
          }
          setEvents((prev) => [...prev, event]);
        }
      }
    } catch (e) {
      setErrored(e instanceof Error ? e.message : 'poll failed');
    } finally {
      setRunning(false);
    }
  }

  const isTerminal = (n: string) => n === 'done' || n === 'error';

  return (
    <div className="min-h-screen p-8" style={{ background: '#f7f7f7' }}>
      <div className="max-w-3xl mx-auto">
        <Link href="/web/admin" className="inline-flex items-center gap-1 text-sm mb-4" style={{ color: '#6a6a6a' }}>
          <ArrowLeft className="w-4 h-4" /> Back to admin
        </Link>
        <h1 className="text-2xl font-bold mb-1" style={{ color: '#222' }}>Email ingestion</h1>
        <p className="text-sm mb-6" style={{ color: '#929292' }}>
          Polls <code className="text-xs px-1 py-0.5 rounded" style={{ background: '#f0f0f0' }}>hos.stayops@gmail.com</code>,
          {' '}parses every CSV attachment, and applies rows to the database. Processed messages move to the
          {' '}<code className="text-xs px-1 py-0.5 rounded" style={{ background: '#f0f0f0' }}>stayops-processed</code> label.
          {' '}Daily cron handles routine polls; use this button to force a check right now.
        </p>

        <button
          onClick={pollNow}
          disabled={running}
          className="inline-flex items-center gap-2 h-11 px-5 rounded-xl text-sm font-semibold disabled:opacity-50"
          style={{ background: '#ff385c', color: '#ffffff' }}
        >
          <RefreshCw className={`w-4 h-4 ${running ? 'animate-spin' : ''}`} />
          {running ? 'Polling…' : 'Check inbox now'}
        </button>

        {/* Live event log */}
        {events.length > 0 && (
          <div
            className="mt-6 rounded-2xl p-5"
            style={{
              background: '#ffffff',
              border: `1px solid ${errored ? '#fca5a5' : done ? '#86efac' : '#dddddd'}`,
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              {errored ? (
                <AlertCircle className="w-5 h-5" style={{ color: '#b91c1c' }} />
              ) : done ? (
                <CheckCircle2 className="w-5 h-5" style={{ color: '#15803d' }} />
              ) : (
                <Loader2 className="w-5 h-5 animate-spin" style={{ color: '#6a6a6a' }} />
              )}
              <p className="text-base font-semibold" style={{ color: '#222' }}>
                {errored ? 'Poll failed' : done ? `Polled in ${done.durationMs}ms` : 'Working…'}
              </p>
            </div>

            <ul className="text-sm flex flex-col gap-1.5" style={{ color: '#3f3f3f' }}>
              {events.map((ev, i) => {
                const next = events[i + 1];
                const stillInFlight = !isTerminal(ev.name) && !next && running;
                const Icon = stillInFlight
                  ? Loader2
                  : ev.name === 'error' || ev.name === 'message-failed'
                  ? AlertCircle
                  : ev.name === 'done' || ev.name === 'message-applied'
                  ? CheckCircle2
                  : ev.name === 'message-duplicate'
                  ? Inbox
                  : Circle;
                const iconColor =
                  ev.name === 'error' || ev.name === 'message-failed' ? '#b91c1c'
                  : ev.name === 'done' || ev.name === 'message-applied' ? '#15803d'
                  : ev.name === 'message-duplicate' ? '#929292'
                  : stillInFlight ? '#6a6a6a'
                  : '#86efac';
                const label = STEP_LABEL[ev.name] ?? ev.name;
                const detail = formatEventDetail(ev);
                return (
                  <li key={i} className="flex items-start gap-2">
                    <Icon
                      className={`w-4 h-4 mt-0.5 ${stillInFlight ? 'animate-spin' : ''}`}
                      style={{ color: iconColor }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <span className="font-medium">{label}</span>
                        {detail && <span className="text-xs" style={{ color: '#6a6a6a' }}>{detail}</span>}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            {done && (
              <div className="mt-4 pt-3 border-t text-xs" style={{ borderColor: '#f0f0f0', color: '#6a6a6a' }}>
                Scanned {done.scannedMessages} · Processed {done.processedMessages} ·
                {' '}Duplicates {done.skippedDuplicates} · Failed {done.failedMessages}
              </div>
            )}

            {errored && <p className="text-sm mt-3" style={{ color: '#b91c1c' }}>{errored}</p>}
          </div>
        )}

        <div className="mt-8 rounded-2xl p-5" style={{ background: '#ffffff', border: '1px solid #dddddd' }}>
          <Mail className="w-5 h-5 mb-2" style={{ color: '#6a6a6a' }} />
          <p className="text-sm font-semibold mb-2" style={{ color: '#222' }}>Setup checklist</p>
          <ol className="text-sm flex flex-col gap-1.5" style={{ color: '#3f3f3f' }}>
            <li>1. Enable 2FA on hos.stayops@gmail.com</li>
            <li>2. Generate a Google App Password (16 chars) → set <code>GMAIL_APP_PASSWORD</code></li>
            <li>3. Create one Gmail label called <code>stayops-processed</code> (the poller moves processed mail here).</li>
            <li>4. Vercel: set <code>CRON_SECRET</code> to a random 32-char string</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

function parseSseBlock(block: string): StepEvent | null {
  let name: string | null = null;
  let data = '';
  for (const line of block.split('\n')) {
    if (line.startsWith('event:')) name = line.slice(6).trim();
    else if (line.startsWith('data:')) data += line.slice(5).trim();
  }
  if (!name) return null;
  try {
    return { name, data: data ? JSON.parse(data) : {}, ts: Date.now() };
  } catch {
    return { name, data: { raw: data }, ts: Date.now() };
  }
}

function formatEventDetail(ev: StepEvent): string {
  const d = ev.data;
  if (ev.name === 'connecting')      return `${d.host as string} · ${d.mailbox as string}`;
  if (ev.name === 'connected')       return d.messageCount != null ? `${d.messageCount} messages in mailbox` : '';
  if (ev.name === 'scanned')         return `${d.newMessages as number} new to process`;
  if (ev.name === 'message-start')   return `uid ${d.uid as number} · ${(d.subject as string) ?? ''}`;
  if (ev.name === 'message-parsed') {
    const rows = d.rows as Record<string, number> | undefined;
    const parser = (d.parser as string) ?? '';
    const file = (d.filename as string) ?? '';
    const summary = rows
      ? Object.entries(rows).filter(([, v]) => v > 0).map(([k, v]) => `${v} ${k}`).join(', ')
      : '';
    return [parser, file, summary].filter(Boolean).join(' · ');
  }
  if (ev.name === 'message-duplicate') return `uid ${d.uid as number}`;
  if (ev.name === 'message-failed')    return (d.reason as string) ?? '';
  if (ev.name === 'message-applied')   return `${d.rows as number} rows · ${d.ms as number}ms`;
  if (ev.name === 'done') {
    const o = d as unknown as DoneOutcome;
    return `${o.scannedMessages} scanned, ${o.processedMessages} processed, ${o.skippedDuplicates} dup, ${o.failedMessages} failed`;
  }
  return '';
}
