'use client';

import { useEffect, useState } from 'react';
import { RefreshCw, Inbox, CheckCircle2, AlertCircle, Clock, Mail } from 'lucide-react';
import Link from 'next/link';

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

interface Batch {
  id: string;
  uploaded_at: string;
  source: string;
  source_filename: string | null;
  source_email_from: string | null;
  source_email_subject: string | null;
  report_date: string | null;
  status: string;
  row_count: number;
  errors: Array<{ message: string }> | null;
  warnings: Array<{ message: string }> | null;
}

export default function IngestionPage() {
  const [polling, setPolling] = useState(false);
  const [pollResult, setPollResult] = useState<PollOutcome | null>(null);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);

  const secret = () => (typeof window !== 'undefined' ? window.localStorage.getItem('stayops_admin') ?? '' : '');

  const loadBatches = async () => {
    try {
      const r = await fetch('/api/uploads', { headers: { 'x-admin-secret': secret() } });
      const text = await r.text();
      const j = text ? JSON.parse(text) : {};
      setBatches(j.batches ?? []);
    } catch { /* noop */ } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadBatches(); }, []);

  async function checkNow() {
    setPolling(true);
    setPollResult(null);
    try {
      const r = await fetch('/api/inbox/poll-now', { method: 'POST', headers: { 'x-admin-secret': secret() } });
      const j = await r.json();
      setPollResult(j.outcome ?? null);
    } catch (e) {
      setPollResult({
        connected: false,
        scannedMessages: 0, processedMessages: 0, skippedDuplicates: 0, failedMessages: 0,
        batchIds: [], errors: [e instanceof Error ? e.message : String(e)], durationMs: 0,
      });
    } finally {
      setPolling(false);
      loadBatches();
    }
  }

  const emailBatches = batches.filter((b) => b.source === 'email');
  const uploadBatches = batches.filter((b) => b.source === 'upload');
  const lastSuccessful = batches.find((b) => b.status === 'parsed');
  const recentFailures = batches.filter((b) => b.status === 'failed').slice(0, 5);

  return (
    <div className="min-h-screen p-6" style={{ background: '#f7f7f7' }}>
      <div className="max-w-5xl mx-auto flex flex-col gap-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold" style={{ color: '#222' }}>Ingestion Health</h1>
            <p className="text-sm mt-0.5" style={{ color: '#929292' }}>
              Tracks PMS emails arriving in Gmail (stayops-ingest label) and manual uploads.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/web/admin/uploads"
              className="h-9 px-3 rounded-lg text-xs font-semibold inline-flex items-center"
              style={{ background: '#ffffff', color: '#6a6a6a', border: '1px solid #dddddd' }}
            >
              Manual Upload
            </Link>
            <button
              onClick={checkNow}
              disabled={polling}
              className="h-9 px-3 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5"
              style={{ background: '#ff385c', color: '#ffffff', opacity: polling ? 0.6 : 1 }}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${polling ? 'animate-spin' : ''}`} />
              {polling ? 'Checking...' : 'Check Inbox Now'}
            </button>
          </div>
        </div>

        {/* Poll result toast */}
        {pollResult && (
          <div
            className="rounded-2xl p-4"
            style={{
              background: pollResult.connected ? (pollResult.errors.length > 0 ? '#fef3c7' : '#ecfdf5') : '#fef2f2',
              border: `1px solid ${pollResult.connected ? (pollResult.errors.length > 0 ? '#fde68a' : '#a7f3d0') : '#fecaca'}`,
            }}
          >
            <div className="flex items-center gap-2">
              {pollResult.connected ? (
                pollResult.errors.length > 0 ? <AlertCircle className="w-4 h-4" style={{ color: '#ca8a04' }} /> : <CheckCircle2 className="w-4 h-4" style={{ color: '#15803d' }} />
              ) : <AlertCircle className="w-4 h-4" style={{ color: '#b91c1c' }} />}
              <p className="text-sm font-semibold" style={{ color: '#222' }}>
                {pollResult.connected ? 'Gmail connected' : 'Gmail connection failed'}
                {' · '}
                {pollResult.scannedMessages} scanned, {pollResult.processedMessages} processed, {pollResult.skippedDuplicates} duplicate, {pollResult.failedMessages} failed · {pollResult.durationMs}ms
              </p>
            </div>
            {pollResult.errors.length > 0 && (
              <ul className="mt-2 ml-6 list-disc text-xs" style={{ color: '#92400e' }}>
                {pollResult.errors.map((e, i) => <li key={i}>{e}</li>)}
              </ul>
            )}
          </div>
        )}

        {/* Stat cards */}
        <div className="grid grid-cols-4 gap-4">
          <StatCard
            label="Email batches"
            value={emailBatches.length}
            subtext="from stayops-ingest"
            icon={<Mail className="w-4 h-4" style={{ color: '#6a6a6a' }} />}
          />
          <StatCard
            label="Manual uploads"
            value={uploadBatches.length}
            subtext="admin upload UI"
            icon={<Inbox className="w-4 h-4" style={{ color: '#6a6a6a' }} />}
          />
          <StatCard
            label="Last success"
            value={lastSuccessful ? timeAgo(new Date(lastSuccessful.uploaded_at)) : '—'}
            subtext={lastSuccessful?.source ?? 'no batches yet'}
            icon={<CheckCircle2 className="w-4 h-4" style={{ color: '#15803d' }} />}
          />
          <StatCard
            label="Recent failures"
            value={recentFailures.length}
            subtext={recentFailures.length === 0 ? 'all green' : 'needs attention'}
            icon={<AlertCircle className="w-4 h-4" style={{ color: recentFailures.length > 0 ? '#b91c1c' : '#15803d' }} />}
          />
        </div>

        {/* Setup checklist */}
        <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid #dddddd' }}>
          <h2 className="text-sm font-bold uppercase tracking-wide mb-3" style={{ color: '#6a6a6a' }}>Setup Checklist</h2>
          <ul className="space-y-2 text-sm" style={{ color: '#222' }}>
            <li>1. Dedicated Gmail inbox <code style={codeStyle}>hos.stayops@gmail.com</code> set up — PMS emails forward here, whole inbox scanned.</li>
            <li>2. Gmail 2FA enabled + app password generated + pasted into Vercel env var <code style={codeStyle}>GMAIL_APP_PASSWORD</code>. If blank, the poller idles.</li>
            <li>3. Gmail label <code style={codeStyle}>stayops-processed</code> created — poller moves messages here after ingest to avoid reprocessing.</li>
            <li>4. Vercel cron at <code style={codeStyle}>/api/inbox/cron</code> runs every minute on Pro. On Hobby it runs daily — use the "Check Inbox Now" button between for demos.</li>
          </ul>
        </div>

        {/* Recent batches */}
        <div className="bg-white rounded-2xl" style={{ border: '1px solid #dddddd' }}>
          <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid #f0f0f0' }}>
            <h2 className="text-sm font-bold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>Recent Activity</h2>
            <button onClick={loadBatches} className="text-xs font-semibold" style={{ color: '#6a6a6a' }}>Refresh</button>
          </div>
          {loading ? (
            <p className="p-6 text-sm" style={{ color: '#929292' }}>Loading…</p>
          ) : batches.length === 0 ? (
            <p className="p-6 text-sm" style={{ color: '#929292' }}>
              No ingestion activity yet. Either drop a file at{' '}
              <Link href="/web/admin/uploads" style={{ color: '#ff385c', textDecoration: 'underline' }}>/web/admin/uploads</Link>
              {' '}or forward an email to <code style={codeStyle}>hos.stayops@gmail.com</code>.
            </p>
          ) : (
            <div className="divide-y" style={{ borderColor: '#f0f0f0' }}>
              {batches.slice(0, 20).map((b) => (
                <div key={b.id} className="px-6 py-3 flex items-start gap-3">
                  {b.source === 'email' ? <Mail className="w-4 h-4 mt-0.5" style={{ color: '#1d4ed8' }} /> : <Inbox className="w-4 h-4 mt-0.5" style={{ color: '#6a6a6a' }} />}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: '#222' }}>
                      {b.source_filename ?? b.source_email_subject ?? 'unnamed'}
                    </p>
                    <p className="text-xs" style={{ color: '#929292' }}>
                      {new Date(b.uploaded_at).toLocaleString()}
                      {b.source_email_from && ` · from ${b.source_email_from}`}
                      {` · ${b.row_count} rows`}
                    </p>
                    {b.errors?.map((e, i) => (
                      <p key={i} className="text-xs mt-0.5" style={{ color: '#b91c1c' }}>{e.message}</p>
                    ))}
                  </div>
                  <StatusPill status={b.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const codeStyle: React.CSSProperties = {
  background: '#f0f0f0',
  color: '#222',
  padding: '1px 6px',
  borderRadius: 4,
  fontSize: '0.85em',
};

function StatCard({ label, value, subtext, icon }: { label: string; value: number | string; subtext: string; icon: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl p-4" style={{ border: '1px solid #dddddd' }}>
      <div className="flex items-center gap-1.5">
        {icon}
        <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>{label}</p>
      </div>
      <p className="text-2xl font-bold mt-1" style={{ color: '#222' }}>{value}</p>
      <p className="text-xs" style={{ color: '#929292' }}>{subtext}</p>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const color =
    status === 'parsed' ? { bg: '#ecfdf5', fg: '#15803d' } :
    status === 'failed' ? { bg: '#fef2f2', fg: '#b91c1c' } :
    status === 'duplicate' ? { bg: '#f3f4f6', fg: '#6a6a6a' } :
    { bg: '#fffbeb', fg: '#ca8a04' };
  return (
    <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full" style={{ background: color.bg, color: color.fg }}>
      {status}
    </span>
  );
}

function timeAgo(d: Date): string {
  const s = Math.floor((Date.now() - d.getTime()) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}
