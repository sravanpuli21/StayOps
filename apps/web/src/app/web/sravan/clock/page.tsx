'use client';

import { useEffect, useState } from 'react';
import { Clock, Play, Square, Coffee } from 'lucide-react';
import { useSravanProfile, useSravanSchedule, useSravanClock } from '@/lib/sravan-data';

function fmtDuration(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function fmtSessionTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function fmtSessionDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function sessionHours(s: { clockIn: string; clockOut?: string; breakMinutes: number }): string {
  if (!s.clockOut) return '—';
  const ms = new Date(s.clockOut).getTime() - new Date(s.clockIn).getTime();
  const hours = ms / 3600000 - s.breakMinutes / 60;
  return `${hours.toFixed(2)} hrs`;
}

export default function SravanClockPage() {
  const SRAVAN_EMPLOYEE = useSravanProfile() as any;
  const SRAVAN_SCHEDULE = useSravanSchedule() as any[];
  const SRAVAN_CLOCK_LOG = useSravanClock() as any[];
  const [clockedInAt, setClockedInAt] = useState<Date | null>(null);
  const [onBreak, setOnBreak] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!clockedInAt) return;
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [clockedInAt]);

  const elapsed = clockedInAt ? Date.now() - clockedInAt.getTime() : 0;
  if (!SRAVAN_EMPLOYEE || SRAVAN_SCHEDULE.length === 0) {
    return <div className="p-6 text-sm text-[#6a6a6a]">Loading…</div>;
  }
  const nextShift = SRAVAN_SCHEDULE.find((s) => s.date >= '2026-05-01') ?? SRAVAN_SCHEDULE[0];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold" style={{ color: '#222222' }}>Clock In / Out</h1>
        <p className="text-sm mt-0.5" style={{ color: '#929292' }}>
          Scheduled today: {nextShift.label} · {nextShift.start} – {nextShift.end}
        </p>
      </div>

      {/* Big clock panel */}
      <div
        className="rounded-2xl p-8 flex flex-col items-center"
        style={{
          background: clockedInAt ? 'linear-gradient(135deg, #0f766e 0%, #134e4a 100%)' : '#ffffff',
          border: clockedInAt ? 'none' : '1px solid #dddddd',
          color: clockedInAt ? '#ffffff' : '#222222',
        }}
      >
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
          style={{
            background: clockedInAt ? 'rgba(255,255,255,0.15)' : 'rgba(15,118,110,0.1)',
          }}
        >
          <Clock className="w-7 h-7" style={{ color: clockedInAt ? '#ffffff' : '#0f766e' }} />
        </div>

        <p className="text-xs uppercase tracking-wide font-semibold opacity-80">
          {clockedInAt ? (onBreak ? 'On Break' : 'Clocked In') : 'Not Clocked In'}
        </p>
        <p className="text-4xl font-bold tabular-nums mt-1">
          {clockedInAt ? fmtDuration(elapsed) : '00:00:00'}
        </p>
        {clockedInAt && (
          <p className="text-xs opacity-80 mt-1">
            Started at {clockedInAt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
          </p>
        )}

        <div className="flex gap-3 mt-6">
          {!clockedInAt ? (
            <button
              onClick={() => { setClockedInAt(new Date()); setTick(0); }}
              className="inline-flex items-center gap-2 h-11 px-6 rounded-xl text-sm font-semibold"
              style={{ background: '#ff385c', color: '#ffffff' }}
            >
              <Play className="w-4 h-4" /> Clock In
            </button>
          ) : (
            <>
              <button
                onClick={() => setOnBreak((b) => !b)}
                className="inline-flex items-center gap-2 h-11 px-5 rounded-xl text-sm font-semibold"
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  color: '#ffffff',
                  border: '1px solid rgba(255,255,255,0.3)',
                }}
              >
                <Coffee className="w-4 h-4" /> {onBreak ? 'End Break' : 'Start Break'}
              </button>
              <button
                onClick={() => { setClockedInAt(null); setOnBreak(false); }}
                className="inline-flex items-center gap-2 h-11 px-5 rounded-xl text-sm font-semibold"
                style={{ background: '#ffffff', color: '#0f766e' }}
              >
                <Square className="w-4 h-4" /> Clock Out
              </button>
            </>
          )}
        </div>
      </div>

      {/* Recent sessions */}
      <div className="rounded-2xl overflow-hidden" style={{ background: '#ffffff', border: '1px solid #dddddd' }}>
        <div className="px-5 py-4" style={{ borderBottom: '1px solid #f0f0f0' }}>
          <h2 className="text-sm font-bold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>
            Recent Sessions
          </h2>
          <p className="text-xs mt-0.5" style={{ color: '#929292' }}>Last {SRAVAN_CLOCK_LOG.length} shifts · pay period {SRAVAN_EMPLOYEE.payPeriod}</p>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: '#f7f7f7', borderBottom: '1px solid #f0f0f0' }}>
              <th className="text-left py-2 px-5 text-xs font-semibold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>Date</th>
              <th className="text-left py-2 px-5 text-xs font-semibold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>In</th>
              <th className="text-left py-2 px-5 text-xs font-semibold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>Out</th>
              <th className="text-right py-2 px-5 text-xs font-semibold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>Break</th>
              <th className="text-right py-2 px-5 text-xs font-semibold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>Hours</th>
            </tr>
          </thead>
          <tbody>
            {SRAVAN_CLOCK_LOG.map((s, i) => (
              <tr key={s.id} style={{ borderBottom: i < SRAVAN_CLOCK_LOG.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                <td className="py-2 px-5" style={{ color: '#222222' }}>{fmtSessionDate(s.clockIn)}</td>
                <td className="py-2 px-5" style={{ color: '#3f3f3f' }}>{fmtSessionTime(s.clockIn)}</td>
                <td className="py-2 px-5" style={{ color: '#3f3f3f' }}>{s.clockOut ? fmtSessionTime(s.clockOut) : '—'}</td>
                <td className="py-2 px-5 text-right" style={{ color: '#3f3f3f' }}>{s.breakMinutes} min</td>
                <td className="py-2 px-5 text-right font-semibold" style={{ color: '#222222' }}>{sessionHours(s)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
