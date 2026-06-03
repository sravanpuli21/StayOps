'use client';

import { useState } from 'react';
import { mutate } from 'swr';
import { LogIn, LogOut, Check, WifiOff } from 'lucide-react';
import type { ApiPunchRow } from '@hos/shared';
import { useApi } from '@/lib/use-api';
import { apiKeys } from '@/lib/swr-keys';
import { enqueue, flushQueue } from '../punch-queue';

interface Props { hotelCode: string }

/**
 * Full-page punch screen for the shared desk kiosk. No login — anyone enters
 * their own username + password and clocks in/out. Punches are offline-resilient
 * (saved on the device, synced when the network returns).
 */
export function PunchClient({ hotelCode }: Props) {
  const [username, setUsername] = useState('');
  const [pin, setPin]           = useState('');
  const [busy, setBusy]         = useState<'in' | 'out' | null>(null);
  const [error, setError]       = useState<string | null>(null);
  const [done, setDone]         = useState<{ name: string; kind: 'in' | 'out'; at: string; offline: boolean } | null>(null);

  const { data: punchesData } = useApi(apiKeys.punches(hotelCode));
  const recent: ApiPunchRow[] = punchesData?.punches ?? [];

  // Who's on shift right now: each person's most recent punch; if it's an "in",
  // they're currently clocked in. `recent` is newest-first, so the first punch
  // we see per employee is their latest.
  const onShift = (() => {
    const latest = new Map<string, ApiPunchRow>();
    for (const p of recent) if (!latest.has(p.employeeId)) latest.set(p.employeeId, p);
    return [...latest.values()]
      .filter((p) => p.kind === 'in')
      .sort((a, b) => +new Date(a.punchedAt) - +new Date(b.punchedAt));
  })();

  const punch = async (kind: 'in' | 'out') => {
    if (busy) return;
    setError(null);
    if (!username.trim()) { setError('Enter your username / Employee ID.'); return; }
    if (!pin.trim())      { setError('Enter your password.'); return; }
    setBusy(kind);

    const punchedAt = new Date().toISOString();
    const queued = {
      id: `pq-${punchedAt}-${username.trim()}`,
      hotelCode, employeeId: username.trim(), pin: pin.trim(), kind, punchedAt,
    };
    enqueue(queued); // record on this device first — never lose a punch

    try {
      const result = await flushQueue(hotelCode);
      mutate(apiKeys.punches(hotelCode)[0]);

      if (result.rejected.find((r) => r.id === queued.id)) {
        setError('Invalid username or password — punch not recorded.');
        return;
      }
      const offline = result.remaining > 0;
      setDone({ name: username.trim(), kind, at: punchedAt, offline });
      // Clear the form for the next person.
      setUsername(''); setPin('');
      setTimeout(() => setDone(null), offline ? 5000 : 4000);
    } catch {
      setDone({ name: username.trim(), kind, at: punchedAt, offline: true });
      setUsername(''); setPin('');
      setTimeout(() => setDone(null), 5000);
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: '#222' }}>Punch In / Punch Out</h1>
        <p className="text-sm mt-1" style={{ color: '#929292' }}>
          {hotelCode} · Enter your username and password, then choose Punch In or Punch Out.
        </p>
      </div>

      {done && (
        <div className="rounded-2xl p-4 flex items-center gap-3" style={{ background: done.offline ? '#fff7ed' : '#f0fdf4', border: `1px solid ${done.offline ? '#fed7aa' : '#86efac'}` }}>
          <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: done.offline ? '#b45309' : '#15803d' }}>
            {done.offline ? <WifiOff className="w-5 h-5" style={{ color: '#fff' }} /> : <Check className="w-5 h-5" style={{ color: '#fff' }} />}
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: done.offline ? '#9a3412' : '#15803d' }}>
              {done.name} punched {done.kind === 'in' ? 'IN' : 'OUT'} · {fmtTime(done.at)}
            </p>
            {done.offline && (
              <p className="text-xs mt-0.5" style={{ color: '#9a3412' }}>
                Saved on this computer — the internet looks down. It will sync automatically when the connection is back.
              </p>
            )}
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Left: credentials + buttons */}
        <section className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>Username / Employee ID</span>
            <input
              type="text" value={username} autoComplete="off" autoCapitalize="none" spellCheck={false}
              onChange={(e) => { setError(null); setUsername(e.target.value); }}
              className="h-12 px-3 rounded-xl text-base outline-none focus:ring-2 focus:ring-[#ff385c]"
              style={{ border: '1px solid #dddddd', background: '#fff', color: '#222' }}
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>Password</span>
            <input
              type="password" value={pin} autoComplete="off"
              onChange={(e) => { setError(null); setPin(e.target.value); }}
              className="h-12 px-3 rounded-xl text-base outline-none focus:ring-2 focus:ring-[#ff385c]"
              style={{ border: '1px solid #dddddd', background: '#fff', color: '#222' }}
            />
          </label>

          {error && <p className="text-sm" style={{ color: '#b91c1c' }}>{error}</p>}

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button" onClick={() => punch('in')} disabled={busy !== null}
              className="h-16 rounded-2xl text-lg font-bold inline-flex items-center justify-center gap-2 transition-opacity"
              style={{ background: '#15803d', color: '#fff', opacity: busy ? 0.5 : 1 }}
            >
              <LogIn className="w-6 h-6" /> {busy === 'in' ? 'Punching In…' : 'Punch In'}
            </button>
            <button
              type="button" onClick={() => punch('out')} disabled={busy !== null}
              className="h-16 rounded-2xl text-lg font-bold inline-flex items-center justify-center gap-2 transition-opacity"
              style={{ background: '#b91c1c', color: '#fff', opacity: busy ? 0.5 : 1 }}
            >
              <LogOut className="w-6 h-6" /> {busy === 'out' ? 'Punching Out…' : 'Punch Out'}
            </button>
          </div>
          <p className="text-xs text-center" style={{ color: '#929292' }}>
            Anyone can punch here — enter your own login. No need to sign into the computer.
          </p>
        </section>

        {/* Right: who's on shift now + recent punches */}
        <section className="flex flex-col gap-6">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wide mb-3 flex items-center gap-2" style={{ color: '#6a6a6a' }}>
              On shift now
              <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full text-xs font-bold" style={{ background: '#f0fdf4', color: '#15803d' }}>{onShift.length}</span>
            </h2>
            {onShift.length === 0 ? (
              <div className="rounded-2xl px-6 py-6 text-center text-sm" style={{ border: '1px solid #dddddd', color: '#929292', background: '#fff' }}>
                Nobody clocked in right now.
              </div>
            ) : (
              <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #dddddd', background: '#fff' }}>
                {onShift.map((p, i) => (
                  <div key={p.employeeId} className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: i < onShift.length - 1 ? '1px solid #f0f0f0' : undefined }}>
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#15803d' }} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate" style={{ color: '#222' }}>{p.fullName}</p>
                      <p className="text-xs" style={{ color: '#929292' }}>#{p.employeeId}{p.department ? ` · ${p.department}` : ''}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-semibold" style={{ color: '#15803d' }}>{fmtTime(p.punchedAt)}</p>
                      <p className="text-[11px]" style={{ color: '#929292' }}>in for {sinceLabel(p.punchedAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
          <h2 className="text-sm font-bold uppercase tracking-wide mb-3" style={{ color: '#6a6a6a' }}>Today&rsquo;s punches</h2>
          {recent.length === 0 ? (
            <div className="rounded-2xl px-6 py-8 text-center text-sm" style={{ border: '1px solid #dddddd', color: '#929292', background: '#fff' }}>
              No punches yet.
            </div>
          ) : (
            <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #dddddd', background: '#fff' }}>
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: '#f7f7f7', borderBottom: '1px solid #dddddd' }}>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>Who</th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>Kind</th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>When</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((p, i) => (
                    <tr key={p.id} style={{ borderBottom: i < recent.length - 1 ? '1px solid #f0f0f0' : undefined }}>
                      <td className="px-4 py-2.5">
                        <p className="font-medium" style={{ color: '#222' }}>{p.fullName}</p>
                        <p className="text-xs" style={{ color: '#929292' }}>#{p.employeeId}{p.department ? ` · ${p.department}` : ''}</p>
                      </td>
                      <td className="px-4 py-2.5">
                        <span
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold"
                          style={{
                            background: p.kind === 'in' ? '#f0fdf4' : '#fef2f2',
                            color:      p.kind === 'in' ? '#15803d' : '#b91c1c',
                          }}
                        >
                          {p.kind === 'in' ? <LogIn className="w-3 h-3" /> : <LogOut className="w-3 h-3" />}
                          {p.kind === 'in' ? 'In' : 'Out'}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-xs" style={{ color: '#6a6a6a' }}>{fmtTime(p.punchedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          </div>
        </section>
      </div>
    </div>
  );
}

function fmtTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

/** Compact "time since" label, e.g. "2h 15m" or "12m". */
function sinceLabel(iso: string): string {
  const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}
