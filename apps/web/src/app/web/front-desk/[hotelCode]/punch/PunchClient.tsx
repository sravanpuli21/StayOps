'use client';

import { useState, useEffect, useMemo } from 'react';
import { Clock, CheckCircle2, LogIn, LogOut, Users } from 'lucide-react';
import { findEmployee, DEVICE_NAME, type FdEmployee } from '../_data';
import { useFdState, recordPunch, isPunchedIn, type PunchLog } from '../_store';
import { fdCard, fdInput, fdInputStyle, Field, timeAgo } from '../_ui';
import { HOTELS } from '@hos/shared';

interface Props { hotelCode: string }
type Phase = 'login' | 'status' | 'done';

export function PunchClient({ hotelCode }: Props) {
  const state = useFdState();
  const hotelName = HOTELS.find((h) => h.code === hotelCode)?.name ?? hotelCode;
  const [phase, setPhase] = useState<Phase>('login');
  const [empId, setEmpId] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [emp, setEmp] = useState<FdEmployee | null>(null);
  const [lastPunch, setLastPunch] = useState<PunchLog | null>(null);
  const [actionError, setActionError] = useState('');

  // Auto-return to start 10s after a successful punch.
  useEffect(() => {
    if (phase !== 'done') return;
    const t = setTimeout(() => reset(), 10000);
    return () => clearTimeout(t);
  }, [phase]);

  const reset = () => { setPhase('login'); setEmpId(''); setPin(''); setError(''); setEmp(null); setLastPunch(null); setActionError(''); };

  const continueLogin = () => {
    const found = findEmployee(empId, pin);
    if (!found) { setError('Employee ID or password is incorrect.'); return; }
    setEmp(found); setError(''); setActionError(''); setPhase('status');
  };

  const punchedIn = emp ? isPunchedIn(state, emp.id) : false;

  const doPunch = (type: 'Punch In' | 'Punch Out') => {
    if (!emp) return;
    if (type === 'Punch In' && punchedIn) { setActionError('You are already punched in.'); return; }
    if (type === 'Punch Out' && !punchedIn) { setActionError('You are not currently punched in.'); return; }
    const p = recordPunch(hotelCode, emp, type);
    setLastPunch(p); setPhase('done');
  };

  /* ── Side panel data: who's on shift + today's punches ── */
  const today = new Date().toDateString();
  const todays = useMemo(() => state.punches.filter((p) => p.hotelCode === hotelCode && new Date(p.ts).toDateString() === today), [state.punches, hotelCode, today]);
  const onShift = useMemo(() => {
    // Latest punch per employee; "on shift" = their most recent is a Punch In.
    const seen = new Set<string>(); const out: PunchLog[] = [];
    for (const p of state.punches.filter((x) => x.hotelCode === hotelCode)) {
      if (seen.has(p.employeeId)) continue;
      seen.add(p.employeeId);
      if (p.type === 'Punch In') out.push(p);
    }
    return out;
  }, [state.punches, hotelCode]);
  const side = <SidePanel onShift={onShift} todays={todays} />;

  /* ── Login ── */
  if (phase === 'login') {
    return (
      <Shell side={side}>
        <div className="flex flex-col items-center gap-2 mb-2">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: '#dcfce7' }}><Clock className="w-7 h-7" style={{ color: '#15803d' }} /></div>
          <h1 className="text-xl font-bold" style={{ color: '#222' }}>Employee Punch In / Punch Out</h1>
          <p className="text-sm" style={{ color: '#929292' }}>Enter your employee ID and PIN to clock in or out.</p>
        </div>
        <Field label="Employee ID"><input value={empId} onChange={(e) => { setEmpId(e.target.value); setError(''); }} placeholder="E1042" className={fdInput} style={fdInputStyle} autoFocus /></Field>
        <Field label="Password or PIN"><input value={pin} onChange={(e) => { setPin(e.target.value); setError(''); }} type="password" placeholder="••••" className={fdInput} style={fdInputStyle} onKeyDown={(e) => { if (e.key === 'Enter') continueLogin(); }} /></Field>
        {error && <p className="text-sm font-semibold" style={{ color: '#b91c1c' }}>{error}</p>}
        <button onClick={continueLogin} className="h-12 rounded-xl text-base font-bold" style={{ background: '#15803d', color: '#fff' }}>Continue</button>
        <p className="text-[11px] text-center" style={{ color: '#cfcfcf' }}>Demo logins: E1042 / 1042 · E1088 / 1088 · E1130 / 1130</p>
      </Shell>
    );
  }

  /* ── Status + punch button ── */
  if (phase === 'status' && emp) {
    return (
      <Shell side={side}>
        <div className="flex flex-col items-center gap-1.5">
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-black" style={{ background: '#f7f7f7', color: '#6a6a6a' }}>{emp.name.split(' ').map((n) => n[0]).join('')}</div>
          <p className="text-xl font-bold" style={{ color: '#222' }}>{emp.name}</p>
          <p className="text-sm" style={{ color: '#929292' }}>{emp.department}</p>
          <span className="inline-flex items-center gap-1.5 mt-1 px-3 py-1 rounded-full text-xs font-bold" style={{ background: punchedIn ? '#dcfce7' : '#f0f0f0', color: punchedIn ? '#15803d' : '#6a6a6a' }}>{punchedIn ? 'Currently punched in' : 'Not punched in'}</span>
        </div>
        {actionError && <p className="text-sm font-semibold text-center" style={{ color: '#b91c1c' }}>{actionError}</p>}
        {punchedIn ? (
          <button onClick={() => doPunch('Punch Out')} className="h-16 rounded-2xl text-lg font-black inline-flex items-center justify-center gap-2" style={{ background: '#b91c1c', color: '#fff' }}><LogOut className="w-6 h-6" /> Punch Out</button>
        ) : (
          <button onClick={() => doPunch('Punch In')} className="h-16 rounded-2xl text-lg font-black inline-flex items-center justify-center gap-2" style={{ background: '#15803d', color: '#fff' }}><LogIn className="w-6 h-6" /> Punch In</button>
        )}
        <button onClick={reset} className="text-sm font-semibold" style={{ color: '#929292' }}>Cancel</button>
      </Shell>
    );
  }

  /* ── Confirmation ── */
  if (phase === 'done' && lastPunch && emp) {
    return (
      <Shell side={side}>
        <div className="flex flex-col items-center gap-2">
          <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: '#dcfce7' }}><CheckCircle2 className="w-8 h-8" style={{ color: '#15803d' }} /></div>
          <h1 className="text-xl font-bold" style={{ color: '#222' }}>{lastPunch.type} successful</h1>
        </div>
        <div className="rounded-xl p-4 flex flex-col gap-2" style={{ background: '#f7f7f7' }}>
          <Row k="Employee" v={emp.name} />
          <Row k="Date" v={new Date(lastPunch.ts).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })} />
          <Row k="Time" v={new Date(lastPunch.ts).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit' })} />
          <Row k="Hotel" v={hotelName} />
          <Row k="Device" v={DEVICE_NAME} />
        </div>
        <div className="flex gap-2">
          <button onClick={reset} className="flex-1 h-12 rounded-xl text-base font-bold" style={{ background: '#15803d', color: '#fff' }}>Done</button>
          <button onClick={reset} className="flex-1 h-12 rounded-xl text-base font-bold" style={{ background: '#f7f7f7', border: '1px solid #dddddd', color: '#6a6a6a' }}>Punch another employee</button>
        </div>
        <p className="text-[11px] text-center" style={{ color: '#cfcfcf' }}>Returning to start automatically…</p>
      </Shell>
    );
  }
  return null;
}

function Shell({ children, side }: { children: React.ReactNode; side?: React.ReactNode }) {
  return (
    <div className="max-w-4xl mx-auto grid lg:grid-cols-[minmax(0,1fr)_320px] gap-5 items-start">
      <div className="rounded-2xl p-7 flex flex-col gap-4" style={fdCard}>{children}</div>
      {side}
    </div>
  );
}

function SidePanel({ onShift, todays }: { onShift: PunchLog[]; todays: PunchLog[] }) {
  return (
    <div className="flex flex-col gap-4">
      {/* On shift now */}
      <div className="rounded-2xl overflow-hidden" style={fdCard}>
        <div className="px-4 py-3 flex items-center gap-2" style={{ borderBottom: '1px solid #f0f0f0' }}>
          <Users className="w-4 h-4" style={{ color: '#15803d' }} />
          <p className="text-sm font-bold" style={{ color: '#222' }}>On shift now</p>
          <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: '#dcfce7', color: '#15803d' }}>{onShift.length}</span>
        </div>
        {onShift.length === 0 ? (
          <p className="px-4 py-4 text-sm" style={{ color: '#929292' }}>No one is punched in yet.</p>
        ) : onShift.map((p, i) => (
          <div key={p.id} className="px-4 py-2.5 flex items-center gap-3" style={{ borderBottom: i < onShift.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
            <span className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0" style={{ background: '#f0fdf4', color: '#15803d' }}>{p.employeeName.split(' ').map((n) => n[0]).join('')}</span>
            <div className="flex-1 min-w-0"><p className="text-sm font-semibold truncate" style={{ color: '#222' }}>{p.employeeName}</p><p className="text-[11px] truncate" style={{ color: '#929292' }}>{p.department}</p></div>
            <span className="text-[11px] flex-shrink-0" style={{ color: '#929292' }}>in {timeAgo(p.ts)}</span>
          </div>
        ))}
      </div>

      {/* Today's punches */}
      <div className="rounded-2xl overflow-hidden" style={fdCard}>
        <div className="px-4 py-3 flex items-center gap-2" style={{ borderBottom: '1px solid #f0f0f0' }}>
          <Clock className="w-4 h-4" style={{ color: '#6a6a6a' }} />
          <p className="text-sm font-bold" style={{ color: '#222' }}>Today&rsquo;s punches</p>
          <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: '#f0f0f0', color: '#6a6a6a' }}>{todays.length}</span>
        </div>
        {todays.length === 0 ? (
          <p className="px-4 py-4 text-sm" style={{ color: '#929292' }}>No punches logged today.</p>
        ) : todays.slice(0, 12).map((p, i) => (
          <div key={p.id} className="px-4 py-2 flex items-center gap-2.5" style={{ borderBottom: i < Math.min(todays.length, 12) - 1 ? '1px solid #f0f0f0' : 'none' }}>
            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: p.type === 'Punch In' ? '#15803d' : '#b91c1c' }} />
            <span className="text-sm flex-1 truncate" style={{ color: '#222' }}>{p.employeeName}</span>
            <span className="text-[11px] font-semibold flex-shrink-0" style={{ color: p.type === 'Punch In' ? '#15803d' : '#b91c1c' }}>{p.type === 'Punch In' ? 'In' : 'Out'}</span>
            <span className="text-[11px] flex-shrink-0 tabular-nums" style={{ color: '#929292' }}>{new Date(p.ts).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
function Row({ k, v }: { k: string; v: string }) { return <div className="flex justify-between gap-3"><span className="text-sm" style={{ color: '#6a6a6a' }}>{k}</span><span className="text-sm font-semibold text-right" style={{ color: '#222' }}>{v}</span></div>; }
