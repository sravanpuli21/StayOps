'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import {
  Upload, FileSpreadsheet, CheckCircle2, AlertCircle, ArrowLeft, Loader2, Circle,
} from 'lucide-react';

interface StepEvent {
  name: string;       // 'classifying' | 'parsing' | 'applying-revenue' | … | 'done' | 'error'
  data: Record<string, unknown>;
  ts: number;         // ms since epoch when this client received it
}

interface DoneEvent {
  ok: boolean;
  batchId: string;
  parser: string;
  rowCount: number;
  summary: Record<string, number | string[]>;
}

const STEP_LABEL: Record<string, string> = {
  classifying: 'Detecting file type',
  parsing: 'Parsing CSV',
  'applying-revenue': 'Writing revenue rows',
  'applying-occupancy': 'Writing occupancy rows',
  'applying-labour-periods': 'Writing labour periods',
  'applying-labour-departments': 'Writing labour departments',
  'applying-am-pm-snapshots': 'Writing AM/PM snapshots',
  'applying-payment-mix': 'Writing payment method mix',
  'applying-market-segment': 'Writing market segment mix',
  'applying-tax-breakdown': 'Writing tax breakdown',
  'applying-ledger-balances': 'Writing ledger balances',
  'applying-rooms': 'Writing room snapshots',
  'applying-arrivals': 'Writing arrivals',
  'applying-high-balance': 'Writing high-balance alerts',
  done: 'Done',
  error: 'Error',
};

export default function UploadsPage() {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [events, setEvents] = useState<StepEvent[]>([]);
  const [done, setDone] = useState<DoneEvent | null>(null);
  const [errored, setErrored] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function uploadFile(file: File) {
    setUploading(true);
    setEvents([]);
    setDone(null);
    setErrored(null);

    const secret = window.localStorage.getItem('stayops_admin') ?? '';
    const fd = new FormData();
    fd.append('file', file);

    try {
      const res = await fetch('/api/uploads', {
        method: 'POST',
        headers: {
          'x-admin-secret': secret,
          accept: 'text/event-stream',
        },
        body: fd,
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

        // Parse complete SSE blocks (terminated by "\n\n")
        let idx: number;
        while ((idx = buf.indexOf('\n\n')) !== -1) {
          const block = buf.slice(0, idx);
          buf = buf.slice(idx + 2);
          const event = parseSseBlock(block);
          if (!event) continue;
          if (event.name === 'done') {
            setDone(event.data as unknown as DoneEvent);
          } else if (event.name === 'error') {
            const msg = (event.data as { message?: string; errors?: string[] }).message
              ?? (event.data as { errors?: string[] }).errors?.join('; ')
              ?? 'unknown error';
            setErrored(msg);
          }
          setEvents((prev) => [...prev, event]);
        }
      }
    } catch (e) {
      setErrored(e instanceof Error ? e.message : 'upload failed');
    } finally {
      setUploading(false);
    }
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  }

  const isTerminal = (name: string) => name === 'done' || name === 'error';

  return (
    <div className="min-h-screen p-8" style={{ background: '#f7f7f7' }}>
      <div className="max-w-3xl mx-auto">
        <Link href="/web/admin" className="inline-flex items-center gap-1 text-sm mb-4" style={{ color: '#6a6a6a' }}>
          <ArrowLeft className="w-4 h-4" /> Back to admin
        </Link>
        <h1 className="text-2xl font-bold mb-1" style={{ color: '#222' }}>Upload CSV</h1>
        <p className="text-sm mb-6" style={{ color: '#929292' }}>
          Drop a Hilton OnQ export (<code className="text-xs px-1 py-0.5 rounded" style={{ background: '#f0f0f0' }}>…-final-audit.csv</code>,
          {' '}<code className="text-xs px-1 py-0.5 rounded" style={{ background: '#f0f0f0' }}>…-room-details.csv</code>,
          {' '}<code className="text-xs px-1 py-0.5 rounded" style={{ background: '#f0f0f0' }}>…-arrivals.csv</code>,
          {' '}<code className="text-xs px-1 py-0.5 rounded" style={{ background: '#f0f0f0' }}>…-high-balance-reports.csv</code>).
          The pipeline streams progress live below.
        </p>

        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          className="rounded-2xl p-12 text-center cursor-pointer transition-colors"
          style={{
            background: dragging ? '#fef0f3' : '#ffffff',
            border: `2px dashed ${dragging ? '#ff385c' : '#dddddd'}`,
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadFile(f); }}
          />
          <Upload className="w-8 h-8 mx-auto mb-3" style={{ color: '#929292' }} />
          <p className="text-base font-semibold" style={{ color: '#222' }}>
            {uploading ? 'Streaming…' : 'Drop file or click to browse'}
          </p>
          <p className="text-xs mt-1" style={{ color: '#929292' }}>
            CSV, ≤ 5 MB. Filename: <em>&lt;date&gt;-&lt;HOTELCODE&gt;-…-final-audit.csv</em>
          </p>
        </div>

        {/* Live progress / step log */}
        {events.length > 0 && (
          <div
            className="mt-6 rounded-2xl p-5"
            style={{
              background: '#ffffff',
              border: `1px solid ${errored ? '#fca5a5' : done?.ok ? '#86efac' : '#dddddd'}`,
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              {errored ? (
                <AlertCircle className="w-5 h-5" style={{ color: '#b91c1c' }} />
              ) : done?.ok ? (
                <CheckCircle2 className="w-5 h-5" style={{ color: '#15803d' }} />
              ) : (
                <Loader2 className="w-5 h-5 animate-spin" style={{ color: '#6a6a6a' }} />
              )}
              <p className="text-base font-semibold" style={{ color: '#222' }}>
                {errored ? 'Upload failed' : done?.ok ? 'Upload applied' : 'Working…'}
              </p>
            </div>

            <ul className="text-sm flex flex-col gap-1.5" style={{ color: '#3f3f3f' }}>
              {events.map((ev, i) => {
                const next = events[i + 1];
                const isLast = i === events.length - 1;
                const stillInFlight = !isTerminal(ev.name) && !next && uploading;
                const Icon = stillInFlight
                  ? Loader2
                  : ev.name === 'error'
                  ? AlertCircle
                  : ev.name === 'done'
                  ? CheckCircle2
                  : Circle;
                const iconColor =
                  ev.name === 'error' ? '#b91c1c'
                  : ev.name === 'done' ? '#15803d'
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
              <div className="mt-4 pt-3 border-t" style={{ borderColor: '#f0f0f0' }}>
                <p className="text-xs" style={{ color: '#6a6a6a' }}>
                  <FileSpreadsheet className="inline w-3 h-3 mr-1" />
                  Parser <code className="px-1 py-0.5 rounded" style={{ background: '#f7f7f7' }}>{done.parser}</code>
                  {' '}wrote {done.rowCount} row{done.rowCount === 1 ? '' : 's'} (batch {done.batchId.slice(0, 8)}…)
                </p>
              </div>
            )}

            {errored && (
              <p className="text-sm mt-3" style={{ color: '#b91c1c' }}>{errored}</p>
            )}
          </div>
        )}

        <div className="mt-8 rounded-2xl p-5" style={{ background: '#ffffff', border: '1px solid #dddddd' }}>
          <p className="text-sm font-semibold mb-2" style={{ color: '#222' }}>Expected filename pattern</p>
          <pre className="text-xs overflow-x-auto" style={{ color: '#3f3f3f' }}>
{`<Month Day, Year>-<HotelCode>-<Long Property Name>-<reportType>.csv

  reportType ∈ { final-audit, room-details, arrivals, high-balance-reports }

Example:
  "May 17, 2026-BTRCI-Home2 Suites By Hilton - Baton Rouge Citiplace, LA-final-audit.csv"

Browser-renamed duplicates (e.g. "… (1).csv") are skipped automatically.
Re-uploading the same file is safe — every row uses ON CONFLICT DO UPDATE.`}
          </pre>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// SSE parsing + formatting
// =============================================================================

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
  if (ev.name === 'classifying') {
    const code = d.hotelCode ? `${d.hotelCode}` : '';
    const date = d.date ? ` · ${d.date}` : '';
    const parser = d.parserId ? ` · ${d.parserId}` : '';
    return [code, date, parser].filter(Boolean).join('').replace(/^ · /, '');
  }
  if (ev.name === 'parsing') {
    const rows = d.rowsExtracted as Record<string, number> | undefined;
    if (!rows) return '';
    const nonZero = Object.entries(rows).filter(([, v]) => v > 0);
    return nonZero.length === 0
      ? 'no rows'
      : nonZero.map(([k, v]) => `${v} ${k}`).join(', ');
  }
  if (ev.name.startsWith('applying-')) {
    const rows = d.rows as number | undefined;
    const ms = d.ms as number | undefined;
    if (typeof rows !== 'number') return '';
    return `${rows} row${rows === 1 ? '' : 's'}${ms != null ? ` · ${ms}ms` : ''}`;
  }
  if (ev.name === 'done') {
    return `${d.rowCount as number} rows total`;
  }
  if (ev.name === 'error') {
    return (d.message as string) ?? '';
  }
  return '';
}
