'use client';

import { useState } from 'react';
import { mutate } from 'swr';
import { X, LogIn, LogOut, Check, Clock, WifiOff } from 'lucide-react';
import { apiKeys } from '@/lib/swr-keys';
import { enqueue, flushQueue } from './punch-queue';

interface Props {
  hotelCode: string;
  onClose: () => void;
}

/**
 * Quick punch from anywhere in the desk tools. No login — the walk-up employee
 * (any department) enters THEIR OWN username + password and clocks in/out. Uses
 * the credential-verified `/api/employees/punch`, with the offline queue so a
 * punch is never lost to a flaky network.
 */
export function QuickPunchModal({ hotelCode, onClose }: Props) {
  const [username, setUsername] = useState('');
  const [pin, setPin]           = useState('');
  const [busy, setBusy]         = useState<'in' | 'out' | null>(null);
  const [error, setError]       = useState<string | null>(null);
  const [done, setDone]         = useState<{ name: string; kind: 'in' | 'out'; at: string; offline: boolean } | null>(null);

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
      setTimeout(onClose, offline ? 3500 : 2500);
    } catch {
      setDone({ name: username.trim(), kind, at: punchedAt, offline: true });
      setTimeout(onClose, 3500);
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.4)' }} onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-md flex flex-col" style={{ border: '1px solid #dddddd' }} onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid #f0f0f0' }}>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: '#fff1f3' }}>
              <Clock className="w-5 h-5" style={{ color: '#ff385c' }} />
            </div>
            <div>
              <h2 className="text-base font-bold" style={{ color: '#222' }}>Punch In / Out</h2>
              <p className="text-xs mt-0.5" style={{ color: '#929292' }}>Enter your own login — works for any employee</p>
            </div>
          </div>
          <button onClick={onClose} className="text-[#6a6a6a] hover:text-[#222]"><X className="w-5 h-5" /></button>
        </div>

        {done ? (
          <div className="px-6 py-8 flex flex-col items-center text-center gap-3">
            <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: done.offline ? '#fff7ed' : '#f0fdf4' }}>
              {done.offline
                ? <WifiOff className="w-7 h-7" style={{ color: '#b45309' }} />
                : <Check className="w-7 h-7" style={{ color: '#15803d' }} />}
            </div>
            <div>
              <p className="text-lg font-bold" style={{ color: '#222' }}>Punched {done.kind === 'in' ? 'In' : 'Out'}</p>
              <p className="text-sm mt-0.5" style={{ color: '#6a6a6a' }}>{done.name} · {fmtTime(done.at)}</p>
              {done.offline && (
                <p className="text-xs mt-2 rounded-lg px-3 py-2" style={{ background: '#fff7ed', color: '#9a3412' }}>
                  Saved on this computer — the internet looks down. It will sync automatically when the connection is back.
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="px-6 py-5 flex flex-col gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>Username / Employee ID</span>
              <input
                type="text" value={username} autoFocus autoComplete="off" autoCapitalize="none" spellCheck={false}
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

            <div className="grid grid-cols-2 gap-3 mt-1">
              <button
                onClick={() => punch('in')} disabled={busy !== null}
                className="h-14 rounded-xl text-base font-bold inline-flex items-center justify-center gap-2 transition-opacity"
                style={{ background: '#15803d', color: '#fff', opacity: busy ? 0.5 : 1 }}
              >
                <LogIn className="w-5 h-5" /> {busy === 'in' ? 'Punching In…' : 'Punch In'}
              </button>
              <button
                onClick={() => punch('out')} disabled={busy !== null}
                className="h-14 rounded-xl text-base font-bold inline-flex items-center justify-center gap-2 transition-opacity"
                style={{ background: '#b91c1c', color: '#fff', opacity: busy ? 0.5 : 1 }}
              >
                <LogOut className="w-5 h-5" /> {busy === 'out' ? 'Punching Out…' : 'Punch Out'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function fmtTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}
