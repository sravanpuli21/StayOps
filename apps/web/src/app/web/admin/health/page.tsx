'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Activity, Loader2, AlertCircle, Database, Inbox, CheckCircle2, Clock } from 'lucide-react';

interface HealthData {
  counts: Array<{ table: string; count: number }>;
  lastIngestion: { at: string; source: string; status: string; filename: string | null } | null;
  freshness: Array<{ code: string; shortName: string; lastDataDate: string | null }>;
  recentBatches: Array<{
    at: string; source: string; reportType: string | null; parser: string | null;
    status: string; rowCount: number; filename: string | null; reportDate: string | null;
  }>;
}

const TABLE_LABEL: Record<string, string> = {
  hotels: 'Hotels',
  users: 'Users',
  daily_revenue: 'Daily Revenue',
  daily_occupancy: 'Daily Occupancy',
  labour_periods: 'Labour Periods',
  maintenance_tickets: 'Maintenance Tickets',
  room_snapshots: 'Room Snapshots',
  night_audit_rows: 'Night Audit Rows',
  employee_punches: 'Employee Punches',
  upload_batches: 'Upload Batches',
};

// Frozen "today" for freshness math — matches NEXT_PUBLIC_STAYOPS_FROZEN_TODAY.
const TODAY = process.env.NEXT_PUBLIC_STAYOPS_FROZEN_TODAY ?? null;

function daysStale(lastDate: string | null): number | null {
  if (!lastDate) return null;
  const today = TODAY ? new Date(`${TODAY}T00:00:00Z`) : new Date();
  const last = new Date(`${lastDate}T00:00:00Z`);
  return Math.round((today.getTime() - last.getTime()) / 86400000);
}

function freshnessColor(stale: number | null): { bg: string; color: string; label: string } {
  if (stale === null) return { bg: '#fee2e2', color: '#b91c1c', label: 'NO DATA' };
  if (stale <= 2) return { bg: '#dcfce7', color: '#15803d', label: `${stale}d` };
  if (stale <= 7) return { bg: '#fef3c7', color: '#92400e', label: `${stale}d` };
  return { bg: '#fee2e2', color: '#b91c1c', label: `${stale}d` };
}

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  parsed: { bg: '#dcfce7', color: '#15803d' },
  pending: { bg: '#fef3c7', color: '#92400e' },
  failed: { bg: '#fee2e2', color: '#b91c1c' },
  duplicate: { bg: '#f0f0f0', color: '#6a6a6a' },
};

export default function AdminHealthPage() {
  const [data, setData] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const secret = window.localStorage.getItem('stayops_admin') ?? '';
    fetch('/api/admin/health', { headers: { 'x-admin-secret': secret } })
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((d) => setData(d))
      .catch((e) => setErr(e instanceof Error ? e.message : 'failed to load'))
      .finally(() => setLoading(false));
  }, []);

  const staleHotels = useMemo(
    () => (data?.freshness ?? []).filter((f) => {
      const s = daysStale(f.lastDataDate);
      return s === null || s > 7;
    }).length,
    [data],
  );

  return (
    <div className="min-h-screen p-8" style={{ background: '#f7f7f7' }}>
      <div className="max-w-6xl mx-auto">
        <Link href="/web/admin" className="inline-flex items-center gap-1 text-sm mb-4" style={{ color: '#6a6a6a' }}>
          <ArrowLeft className="w-4 h-4" /> Back to admin
        </Link>
        <div className="flex items-center gap-2 mb-1">
          <Activity className="w-5 h-5" style={{ color: '#ff385c' }} />
          <h1 className="text-2xl font-bold" style={{ color: '#222' }}>System Health</h1>
        </div>
        <p className="text-sm mb-6" style={{ color: '#929292' }}>
          Live database snapshot · ingestion status · per-hotel data freshness
        </p>

        {loading ? (
          <div className="rounded-2xl p-12 flex items-center justify-center gap-2" style={{ background: '#fff', border: '1px solid #dddddd' }}>
            <Loader2 className="w-4 h-4 animate-spin" style={{ color: '#6a6a6a' }} />
            <span className="text-sm" style={{ color: '#929292' }}>Querying database…</span>
          </div>
        ) : err ? (
          <div className="rounded-2xl p-5 flex items-start gap-2" style={{ background: '#fef2f2', border: '1px solid #fca5a5' }}>
            <AlertCircle className="w-4 h-4 mt-0.5" style={{ color: '#b91c1c' }} />
            <p className="text-sm" style={{ color: '#b91c1c' }}>Failed to load: {err}</p>
          </div>
        ) : data ? (
          <div className="flex flex-col gap-6">
            {/* Top summary cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-2xl p-5" style={{ background: '#fff', border: '1px solid #dddddd' }}>
                <div className="flex items-center gap-2 mb-1">
                  <Inbox className="w-4 h-4" style={{ color: '#6a6a6a' }} />
                  <p className="text-xs font-bold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>Last Ingestion</p>
                </div>
                {data.lastIngestion ? (
                  <>
                    <p className="text-base font-bold" style={{ color: '#222' }}>{new Date(data.lastIngestion.at).toLocaleString()}</p>
                    <p className="text-xs mt-0.5" style={{ color: '#929292' }}>
                      via {data.lastIngestion.source} · {data.lastIngestion.status}
                    </p>
                  </>
                ) : (
                  <p className="text-sm" style={{ color: '#b45309' }}>No ingestion runs yet</p>
                )}
              </div>

              <div className="rounded-2xl p-5" style={{ background: '#fff', border: '1px solid #dddddd' }}>
                <div className="flex items-center gap-2 mb-1">
                  <Database className="w-4 h-4" style={{ color: '#6a6a6a' }} />
                  <p className="text-xs font-bold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>Total Batches</p>
                </div>
                <p className="text-2xl font-bold" style={{ color: '#222' }}>
                  {data.counts.find((c) => c.table === 'upload_batches')?.count ?? 0}
                </p>
                <p className="text-xs mt-0.5" style={{ color: '#929292' }}>upload + email lifetime</p>
              </div>

              <div className="rounded-2xl p-5" style={{ background: staleHotels > 0 ? '#fffbeb' : '#f0fdf4', border: `1px solid ${staleHotels > 0 ? '#fde68a' : '#86efac'}` }}>
                <div className="flex items-center gap-2 mb-1">
                  {staleHotels > 0 ? <Clock className="w-4 h-4" style={{ color: '#92400e' }} /> : <CheckCircle2 className="w-4 h-4" style={{ color: '#15803d' }} />}
                  <p className="text-xs font-bold uppercase tracking-wide" style={{ color: staleHotels > 0 ? '#92400e' : '#15803d' }}>Stale Hotels</p>
                </div>
                <p className="text-2xl font-bold" style={{ color: '#222' }}>{staleHotels}<span className="text-sm font-normal" style={{ color: '#929292' }}> / {data.freshness.length}</span></p>
                <p className="text-xs mt-0.5" style={{ color: '#929292' }}>no data &gt; 7 days</p>
              </div>
            </div>

            {/* Row counts */}
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wide mb-3" style={{ color: '#6a6a6a' }}>Table Row Counts</h2>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {data.counts.map((c) => (
                  <div key={c.table} className="rounded-2xl p-4" style={{ background: '#fff', border: '1px solid #dddddd' }}>
                    <p className="text-xl font-bold" style={{ color: '#222' }}>{c.count.toLocaleString()}</p>
                    <p className="text-[11px] mt-0.5" style={{ color: '#6a6a6a' }}>{TABLE_LABEL[c.table] ?? c.table}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Per-hotel freshness */}
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wide mb-3" style={{ color: '#6a6a6a' }}>Data Freshness by Hotel</h2>
              <div className="rounded-2xl p-4 grid grid-cols-2 md:grid-cols-4 gap-2" style={{ background: '#fff', border: '1px solid #dddddd' }}>
                {data.freshness.map((f) => {
                  const stale = daysStale(f.lastDataDate);
                  const fc = freshnessColor(stale);
                  return (
                    <div key={f.code} className="flex items-center justify-between rounded-lg px-3 py-2" style={{ background: '#f7f7f7' }}>
                      <div className="min-w-0">
                        <p className="text-xs font-medium truncate" style={{ color: '#222' }}>{f.shortName}</p>
                        <p className="text-[10px]" style={{ color: '#929292' }}>{f.lastDataDate ?? 'never'}</p>
                      </div>
                      <span className="text-[10px] font-bold tracking-wide px-1.5 py-0.5 rounded ml-2" style={{ background: fc.bg, color: fc.color }}>
                        {fc.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent batches */}
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wide mb-3" style={{ color: '#6a6a6a' }}>Recent Ingestion Batches</h2>
              <div className="overflow-x-auto rounded-2xl" style={{ border: '1px solid #dddddd', background: '#fff' }}>
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr style={{ borderBottom: '1px solid #dddddd', background: '#f7f7f7' }}>
                      <th className={th}>When</th>
                      <th className={th}>Source</th>
                      <th className={th}>Report</th>
                      <th className={th}>Parser</th>
                      <th className={th + ' text-right'}>Rows</th>
                      <th className={th}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentBatches.map((b, i) => {
                      const ss = STATUS_STYLE[b.status] ?? { bg: '#f0f0f0', color: '#6a6a6a' };
                      return (
                        <tr key={i} style={{ borderBottom: i < data.recentBatches.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                          <td className="py-2.5 px-4 text-xs" style={{ color: '#3f3f3f' }}>{new Date(b.at).toLocaleString()}</td>
                          <td className="py-2.5 px-4 text-xs uppercase" style={{ color: '#6a6a6a' }}>{b.source}</td>
                          <td className="py-2.5 px-4 text-xs" style={{ color: '#222' }}>{b.reportType ?? '—'}{b.reportDate ? ` · ${b.reportDate}` : ''}</td>
                          <td className="py-2.5 px-4 text-xs font-mono" style={{ color: '#6a6a6a' }}>{b.parser ?? '—'}</td>
                          <td className="py-2.5 px-4 text-sm text-right" style={{ color: '#3f3f3f' }}>{b.rowCount}</td>
                          <td className="py-2.5 px-4">
                            <span className="text-[10px] font-bold tracking-wide px-1.5 py-0.5 rounded" style={{ background: ss.bg, color: ss.color }}>
                              {b.status.toUpperCase()}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                    {data.recentBatches.length === 0 && (
                      <tr><td colSpan={6} className="py-8 px-4 text-center text-sm" style={{ color: '#929292' }}>No batches yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

const th = 'text-left text-xs font-semibold uppercase tracking-wide py-3 px-4 whitespace-nowrap';
