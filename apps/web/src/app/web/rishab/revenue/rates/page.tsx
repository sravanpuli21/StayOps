'use client';

import { useEffect, useState, useCallback } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Plus, Calendar, Minus } from 'lucide-react';
import { ErrorBanner } from '@/components/common/ErrorBanner';

interface RateEvent {
  id: string;
  hotelCode: string;
  ratePlan: string;
  stayDate: string;
  oldRate: number | null;
  newRate: number;
  source: string;
  reason: string | null;
  changedAt: string;
}

const HOTEL_CODE = 'BTRCI';

function fmtDate(iso: string): string {
  return new Date(iso + 'T00:00:00Z').toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
}
function fmtTime(iso: string): string {
  return new Date(iso).toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' });
}

export default function RateManagerPage() {
  const [events, setEvents] = useState<RateEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const today = new Date().toISOString().slice(0, 10);
  const weekOut = new Date(Date.now() + 6 * 86400000).toISOString().slice(0, 10);

  const [stayFrom, setStayFrom]   = useState(today);
  const [stayTo,   setStayTo]     = useState(weekOut);
  const [newRate,  setNewRate]    = useState('');
  const [ratePlan, setRatePlan]   = useState('BAR');
  const [reason,   setReason]     = useState('');
  const [saving,   setSaving]     = useState(false);
  const [savedMsg, setSavedMsg]   = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await fetch(`/api/rates/log?hotelCode=${HOTEL_CODE}&limit=200`);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const j = await r.json();
      setEvents(j.events ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'failed to load');
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => { void load(); }, [load]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSavedMsg(null);
    try {
      const r = await fetch('/api/rates/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hotelCode:    HOTEL_CODE,
          ratePlan,
          stayDateFrom: stayFrom,
          stayDateTo:   stayTo,
          newRate:      Number(newRate),
          reason:       reason || undefined,
        }),
      });
      const j = await r.json();
      if (!r.ok) {
        setSavedMsg(`Error: ${j.error ?? 'unknown'}`);
        return;
      }
      setSavedMsg(`Logged ${j.inserted} rate event${j.inserted === 1 ? '' : 's'} across ${j.stayDates} stay dates.`);
      setShowForm(false);
      setNewRate('');
      setReason('');
      void load();
    } catch (err) {
      setSavedMsg(`Error: ${err instanceof Error ? err.message : 'network'}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: '#222' }}>Rate Manager</h1>
          <p className="text-sm mt-0.5" style={{ color: '#929292' }}>
            Log BAR (or other rate-plan) changes. Each change stamps the stay date(s) it applies to so the history is auditable.
          </p>
        </div>
        <button
          onClick={() => { setShowForm((v) => !v); setSavedMsg(null); }}
          className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl text-xs font-semibold"
          style={{ background: showForm ? '#fff' : '#ff385c', color: showForm ? '#6a6a6a' : '#fff', border: '1px solid #dddddd' }}
        >
          {showForm ? <><Minus className="w-3.5 h-3.5" /> Cancel</> : <><Plus className="w-3.5 h-3.5" /> Log a rate change</>}
        </button>
      </div>

      {error && <ErrorBanner error={error} onRetry={load} />}
      {savedMsg && (
        <div className="rounded-2xl px-4 py-3 text-sm" style={{ background: savedMsg.startsWith('Error') ? '#fef2f2' : '#f0fdf4', color: savedMsg.startsWith('Error') ? '#b91c1c' : '#15803d', border: `1px solid ${savedMsg.startsWith('Error') ? '#fca5a5' : '#86efac'}` }}>
          {savedMsg}
        </div>
      )}

      {showForm && (
        <form onSubmit={save} className="rounded-2xl p-5 grid grid-cols-1 md:grid-cols-2 gap-4" style={{ background: '#fff', border: '1px solid #dddddd' }}>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#929292' }}>Rate plan</label>
            <input type="text" value={ratePlan} onChange={(e) => setRatePlan(e.target.value)} className="w-full h-10 px-3 mt-1 rounded-lg text-sm" style={{ background: '#fafafa', border: '1px solid #dddddd' }} />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#929292' }}>New rate (USD)</label>
            <input type="number" min="0" step="1" required value={newRate} onChange={(e) => setNewRate(e.target.value)} placeholder="e.g. 175" className="w-full h-10 px-3 mt-1 rounded-lg text-sm" style={{ background: '#fafafa', border: '1px solid #dddddd' }} />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#929292' }}>Stay date — from</label>
            <input type="date" required value={stayFrom} onChange={(e) => setStayFrom(e.target.value)} className="w-full h-10 px-3 mt-1 rounded-lg text-sm" style={{ background: '#fafafa', border: '1px solid #dddddd' }} />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#929292' }}>Stay date — to (inclusive)</label>
            <input type="date" required value={stayTo} onChange={(e) => setStayTo(e.target.value)} className="w-full h-10 px-3 mt-1 rounded-lg text-sm" style={{ background: '#fafafa', border: '1px solid #dddddd' }} />
          </div>
          <div className="md:col-span-2">
            <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#929292' }}>Reason (optional)</label>
            <input type="text" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Memorial Day soft — pulled $14 vs comp set" className="w-full h-10 px-3 mt-1 rounded-lg text-sm" style={{ background: '#fafafa', border: '1px solid #dddddd' }} />
          </div>
          <div className="md:col-span-2 flex justify-end">
            <button type="submit" disabled={saving} className="h-10 px-5 rounded-xl text-sm font-semibold disabled:opacity-50" style={{ background: '#ff385c', color: '#fff' }}>
              {saving ? 'Saving…' : 'Save rate change'}
            </button>
          </div>
        </form>
      )}

      <div>
        <h2 className="text-sm font-bold uppercase tracking-wide mb-3" style={{ color: '#6a6a6a' }}>
          Recent changes
        </h2>
        {loading ? (
          <div className="rounded-2xl p-6 text-sm" style={{ background: '#fff', border: '1px solid #dddddd', color: '#929292' }}>
            Loading…
          </div>
        ) : events.length === 0 ? (
          <div className="rounded-2xl p-6 text-sm" style={{ background: '#fff', border: '1px solid #dddddd', color: '#929292' }}>
            No rate changes logged yet for {HOTEL_CODE}.
          </div>
        ) : (
          <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #dddddd', background: '#fff' }}>
            <table className="w-full text-sm">
              <thead style={{ background: '#f7f7f7' }}>
                <tr>
                  {['Stay date', 'Plan', 'Old', 'New', 'Δ', 'Reason', 'Changed'].map((h) => (
                    <th key={h} className="text-left px-4 py-2 font-semibold" style={{ color: '#6a6a6a' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {events.map((e) => {
                  const delta = e.oldRate == null ? null : e.newRate - e.oldRate;
                  return (
                    <tr key={e.id} style={{ borderTop: '1px solid #f0f0f0' }}>
                      <td className="px-4 py-2.5 flex items-center gap-1.5" style={{ color: '#222' }}>
                        <Calendar className="w-3.5 h-3.5" style={{ color: '#929292' }} />
                        {fmtDate(e.stayDate)}
                      </td>
                      <td className="px-4 py-2.5" style={{ color: '#3f3f3f' }}>{e.ratePlan}</td>
                      <td className="px-4 py-2.5 tabular-nums" style={{ color: '#929292' }}>
                        {e.oldRate == null ? '—' : `$${e.oldRate.toFixed(0)}`}
                      </td>
                      <td className="px-4 py-2.5 tabular-nums font-semibold" style={{ color: '#222' }}>
                        <DollarSign className="w-3 h-3 inline" style={{ color: '#6a6a6a' }} />{e.newRate.toFixed(0)}
                      </td>
                      <td className="px-4 py-2.5 tabular-nums" style={{ color: delta == null ? '#929292' : delta > 0 ? '#15803d' : delta < 0 ? '#b91c1c' : '#6a6a6a' }}>
                        {delta == null ? '—' : (
                          <span className="inline-flex items-center gap-0.5">
                            {delta > 0 ? <TrendingUp className="w-3 h-3" /> : delta < 0 ? <TrendingDown className="w-3 h-3" /> : null}
                            {delta > 0 ? '+' : ''}{delta.toFixed(0)}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 max-w-xs truncate" style={{ color: '#3f3f3f' }} title={e.reason ?? ''}>
                        {e.reason ?? <span style={{ color: '#bbb' }}>—</span>}
                      </td>
                      <td className="px-4 py-2.5 text-xs" style={{ color: '#6a6a6a' }}>{fmtTime(e.changedAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
