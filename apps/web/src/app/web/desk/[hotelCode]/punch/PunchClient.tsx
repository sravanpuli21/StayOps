'use client';

import { useState } from 'react';
import { mutate } from 'swr';
import { Delete, LogIn, LogOut, Check } from 'lucide-react';
import type { ApiPunchRow } from '@hos/shared';
import { useApi } from '@/lib/use-api';
import { apiKeys } from '@/lib/swr-keys';

interface Props { hotelCode: string }

type Pad = 'employee' | 'pin';

export function PunchClient({ hotelCode }: Props) {
  const [employeeId, setEmployeeId] = useState<string>('');
  const [pin, setPin]               = useState<string>('');
  const [active, setActive]         = useState<Pad>('employee');
  const [busy, setBusy]             = useState<'in' | 'out' | null>(null);
  const [error, setError]           = useState<string | null>(null);
  const [confirmation, setConfirm]  = useState<{ name: string; kind: 'in' | 'out'; at: string } | null>(null);

  const { data: punchesData } = useApi(apiKeys.punches(hotelCode));
  const recent: ApiPunchRow[] = punchesData?.punches ?? [];

  const reset = () => {
    setEmployeeId(''); setPin(''); setActive('employee'); setError(null);
  };

  const punch = async (kind: 'in' | 'out') => {
    setError(null);
    if (!employeeId.trim()) { setError('Enter your Employee ID.'); setActive('employee'); return; }
    if (!pin.trim())        { setError('Enter your PIN.');         setActive('pin');      return; }
    setBusy(kind);
    try {
      const res = await fetch('/api/employees/punch', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ hotelCode, employeeId: employeeId.trim(), pin: pin.trim(), kind }),
      });
      const j = await res.json();
      if (!res.ok || !j.ok) {
        setError(typeof j?.error === 'string' ? j.error : 'Punch failed');
        return;
      }
      setConfirm({ name: j.punch.fullName, kind, at: j.punch.punchedAt });
      mutate(apiKeys.punches(hotelCode)[0]);
      reset();
      // Auto-dismiss the confirmation after 4s.
      setTimeout(() => setConfirm(null), 4000);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Network error');
    } finally {
      setBusy(null);
    }
  };

  const press = (digit: string) => {
    setError(null);
    if (active === 'employee') {
      if (employeeId.length < 8) setEmployeeId((s) => s + digit);
    } else {
      if (pin.length < 6) setPin((s) => s + digit);
    }
  };
  const back = () => {
    if (active === 'employee') setEmployeeId((s) => s.slice(0, -1));
    else                       setPin((s) => s.slice(0, -1));
  };
  const clear = () => {
    if (active === 'employee') setEmployeeId('');
    else                       setPin('');
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: '#222' }}>Punch In / Punch Out</h1>
        <p className="text-sm mt-1" style={{ color: '#929292' }}>
          {hotelCode} · Enter your employee ID and PIN, then choose Punch In or Punch Out.
        </p>
      </div>

      {confirmation && (
        <div className="rounded-2xl p-4 flex items-center gap-3" style={{ background: '#f0fdf4', border: '1px solid #86efac' }}>
          <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: '#15803d' }}>
            <Check className="w-5 h-5" style={{ color: '#fff' }} />
          </div>
          <p className="text-sm font-semibold" style={{ color: '#15803d' }}>
            {confirmation.name} punched {confirmation.kind === 'in' ? 'IN' : 'OUT'} · {fmtTime(confirmation.at)}
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-6">
        {/* Left: input fields + keypad */}
        <section className="flex flex-col gap-4">
          <Field
            label="Employee ID"
            value={employeeId}
            placeholder="e.g. 1001"
            active={active === 'employee'}
            onFocus={() => setActive('employee')}
            mask={false}
          />
          <Field
            label="PIN"
            value={pin}
            placeholder="••••"
            active={active === 'pin'}
            onFocus={() => setActive('pin')}
            mask={true}
          />

          {/* Keypad */}
          <div className="grid grid-cols-3 gap-2">
            {[1,2,3,4,5,6,7,8,9].map((n) => (
              <KeypadBtn key={n} label={String(n)} onClick={() => press(String(n))} />
            ))}
            <KeypadBtn label="Clear" onClick={clear} variant="muted" />
            <KeypadBtn label="0" onClick={() => press('0')} />
            <KeypadBtn label={<Delete className="w-5 h-5" />} onClick={back} variant="muted" />
          </div>

          {error && <p className="text-sm" style={{ color: '#b91c1c' }}>{error}</p>}

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => punch('in')}
              disabled={busy !== null}
              className="h-14 rounded-2xl text-base font-bold inline-flex items-center justify-center gap-2 transition-opacity"
              style={{ background: '#15803d', color: '#fff', opacity: busy ? 0.5 : 1 }}
            >
              <LogIn className="w-5 h-5" />
              {busy === 'in' ? 'Punching In…' : 'Punch In'}
            </button>
            <button
              type="button"
              onClick={() => punch('out')}
              disabled={busy !== null}
              className="h-14 rounded-2xl text-base font-bold inline-flex items-center justify-center gap-2 transition-opacity"
              style={{ background: '#b91c1c', color: '#fff', opacity: busy ? 0.5 : 1 }}
            >
              <LogOut className="w-5 h-5" />
              {busy === 'out' ? 'Punching Out…' : 'Punch Out'}
            </button>
          </div>
        </section>

        {/* Right: recent punches */}
        <section>
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
        </section>
      </div>
    </div>
  );
}

function Field({
  label, value, placeholder, active, onFocus, mask,
}: { label: string; value: string; placeholder: string; active: boolean; onFocus: () => void; mask: boolean }) {
  const display = mask ? '•'.repeat(value.length) : value;
  return (
    <button
      type="button"
      onClick={onFocus}
      className="text-left rounded-2xl px-4 py-3"
      style={{
        background: '#ffffff',
        border: `2px solid ${active ? '#ff385c' : '#dddddd'}`,
      }}
    >
      <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>{label}</p>
      <p className="text-2xl font-bold tabular-nums mt-1" style={{ color: value ? '#222' : '#c1c1c1' }}>
        {display || placeholder}
      </p>
    </button>
  );
}

function KeypadBtn({
  label, onClick, variant,
}: { label: React.ReactNode; onClick: () => void; variant?: 'muted' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="h-16 rounded-2xl text-2xl font-bold inline-flex items-center justify-center transition-colors"
      style={{
        background: variant === 'muted' ? '#f7f7f7' : '#ffffff',
        color:      variant === 'muted' ? '#6a6a6a' : '#222',
        border: '1px solid #dddddd',
      }}
    >
      {label}
    </button>
  );
}

function fmtTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}
