'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';

interface PollOutcome {
  connected: boolean;
  scannedMessages: number;
  processedMessages: number;
  skippedDuplicates: number;
  failedMessages: number;
  batchIds: string[];
  errors: string[];
  durationMs: number;
}

export default function IngestionPage() {
  const [running, setRunning] = useState(false);
  const [last, setLast] = useState<PollOutcome | null>(null);

  async function pollNow() {
    setRunning(true);
    setLast(null);
    const secret = window.localStorage.getItem('stayops_admin') ?? '';
    try {
      const r = await fetch('/api/inbox/poll-now', {
        method: 'POST',
        headers: { 'x-admin-secret': secret },
      });
      const j = (await r.json()) as PollOutcome;
      setLast(j);
    } catch (e) {
      setLast({
        connected: false, scannedMessages: 0, processedMessages: 0,
        skippedDuplicates: 0, failedMessages: 0, batchIds: [],
        errors: [e instanceof Error ? e.message : String(e)], durationMs: 0,
      });
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="min-h-screen p-8" style={{ background: '#f7f7f7' }}>
      <div className="max-w-3xl mx-auto">
        <Link href="/web/admin" className="inline-flex items-center gap-1 text-sm mb-4" style={{ color: '#6a6a6a' }}>
          <ArrowLeft className="w-4 h-4" /> Back to admin
        </Link>
        <h1 className="text-2xl font-bold mb-1" style={{ color: '#222' }}>Email ingestion</h1>
        <p className="text-sm mb-6" style={{ color: '#929292' }}>
          Polls <code className="text-xs px-1 py-0.5 rounded" style={{ background: '#f0f0f0' }}>hos.stayops@gmail.com</code>,
          {' '}parses CSV/XLSX attachments, and applies them to the database. Processed messages are moved to the
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

        {last && (
          <div
            className="mt-6 rounded-2xl p-5"
            style={{
              background: '#ffffff',
              border: `1px solid ${last.errors.length === 0 && last.connected ? '#86efac' : '#fca5a5'}`,
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              {last.errors.length === 0 && last.connected
                ? <CheckCircle2 className="w-5 h-5" style={{ color: '#15803d' }} />
                : <AlertCircle  className="w-5 h-5" style={{ color: '#b91c1c' }} />}
              <p className="text-base font-semibold" style={{ color: '#222' }}>
                {last.connected ? `Polled in ${last.durationMs}ms` : 'Connection failed'}
              </p>
            </div>
            <ul className="text-sm flex flex-col gap-1" style={{ color: '#3f3f3f' }}>
              <li>· Scanned: {last.scannedMessages}</li>
              <li>· Processed: {last.processedMessages}</li>
              <li>· Skipped duplicates: {last.skippedDuplicates}</li>
              <li>· Failed: {last.failedMessages}</li>
              {last.batchIds.length > 0 && (
                <li>· Batch IDs: {last.batchIds.length}</li>
              )}
            </ul>
            {last.errors.length > 0 && (
              <details className="text-xs mt-3" style={{ color: '#b91c1c' }}>
                <summary className="cursor-pointer font-semibold">{last.errors.length} error(s)</summary>
                <ul className="mt-1 ml-3">
                  {last.errors.map((e, i) => <li key={i}>· {e}</li>)}
                </ul>
              </details>
            )}
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
