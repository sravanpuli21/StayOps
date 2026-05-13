'use client';

import { useState, useEffect } from 'react';
import { Save, RefreshCw, Check, Star, Minus, Clock } from 'lucide-react';
import { type AvailabilityDay, type AvailabilityLevel } from '@hos/shared';
import { useSravanAvailability } from '@/lib/sravan-data';

// Target hours the employee is looking for this week. Multiples of 8 since
// shifts are 8 hours — 40 = full time, 24 = part-time, 0 = not this week.
const TARGET_HOURS_OPTIONS = [0, 8, 16, 24, 32, 40, 48] as const;
const DEFAULT_TARGET = 40;

const TIME_OPTIONS: string[] = Array.from({ length: 24 }, (_, i) =>
  `${i.toString().padStart(2, '0')}:00`
);

function fmtTimeLabel(hhmm: string): string {
  const [h] = hhmm.split(':').map(Number);
  const hour12 = ((h + 11) % 12) + 1;
  const period = h >= 12 ? 'PM' : 'AM';
  return `${hour12}:00 ${period}`;
}

const WEEKS = [
  { id: 'w1', label: 'Week 1', range: 'May 5 – May 11' },
  { id: 'w2', label: 'Week 2', range: 'May 12 – May 18' },
] as const;

type WeekId = (typeof WEEKS)[number]['id'];

const LEVEL_META: Record<AvailabilityLevel, { bg: string; fg: string; icon: typeof Star; label: string; hint: string }> = {
  unavailable: { bg: '#f7f7f7', fg: '#929292', icon: Minus, label: 'Off',       hint: 'Do not schedule' },
  available:   { bg: '#e0f2fe', fg: '#075985', icon: Check, label: 'Available', hint: 'OK to schedule me' },
  preferred:   { bg: '#fef3c7', fg: '#b45309', icon: Star,  label: 'Preferred', hint: 'AI puts me here first' },
};

const LEVELS: AvailabilityLevel[] = ['unavailable', 'available', 'preferred'];

export default function SravanAvailabilityPage() {
  const SRAVAN_AVAILABILITY = useSravanAvailability() as AvailabilityDay[];
  const [weeks, setWeeks] = useState<Record<WeekId, AvailabilityDay[]>>({ w1: [], w2: [] });
  useEffect(() => {
    if (SRAVAN_AVAILABILITY.length > 0 && weeks.w1.length === 0) {
      setWeeks({
        w1: SRAVAN_AVAILABILITY.map((d) => ({ ...d })),
        w2: SRAVAN_AVAILABILITY.map((d) => ({ ...d })),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [SRAVAN_AVAILABILITY]);
  const [targetHours, setTargetHours] = useState<Record<WeekId, number>>({
    w1: DEFAULT_TARGET,
    w2: DEFAULT_TARGET,
  });
  const [saved, setSaved] = useState(false);

  const updateDay = (weekId: WeekId, i: number, patch: Partial<AvailabilityDay>) => {
    setSaved(false);
    setWeeks((cur) => ({
      ...cur,
      [weekId]: cur[weekId].map((d, idx) => (idx === i ? { ...d, ...patch } : d)),
    }));
  };

  const copyWeek1ToWeek2 = () => {
    setSaved(false);
    setWeeks((cur) => ({ ...cur, w2: cur.w1.map((d) => ({ ...d })) }));
    setTargetHours((cur) => ({ ...cur, w2: cur.w1 }));
  };

  const onSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const onReset = () => {
    setWeeks({
      w1: SRAVAN_AVAILABILITY.map((d: AvailabilityDay) => ({ ...d })),
      w2: SRAVAN_AVAILABILITY.map((d: AvailabilityDay) => ({ ...d })),
    });
    setTargetHours({ w1: DEFAULT_TARGET, w2: DEFAULT_TARGET });
    setSaved(false);
  };

  const allDays = Object.values(weeks).flat();
  const preferredCount = allDays.filter((d) => d.level === 'preferred').length;
  const availableCount = allDays.filter((d) => d.level === 'available').length;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold" style={{ color: '#222222' }}>Weekly Availability</h1>
        <p className="text-sm mt-0.5" style={{ color: '#929292' }}>
          Submit availability for the next 2 weeks. The scheduler uses this to auto-assign your shifts.
        </p>
      </div>

      {/* Legend */}
      <div className="rounded-2xl p-4 flex flex-wrap items-center gap-4" style={{ background: '#ffffff', border: '1px solid #dddddd' }}>
        {LEVELS.map((lvl) => {
          const m = LEVEL_META[lvl];
          const Icon = m.icon;
          return (
            <div key={lvl} className="flex items-center gap-2">
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold"
                style={{ background: m.bg, color: m.fg }}
              >
                <Icon className="w-3 h-3" />
                {m.label}
              </span>
              <span className="text-[11px]" style={{ color: '#6a6a6a' }}>{m.hint}</span>
            </div>
          );
        })}
      </div>

      {/* Sticky action bar */}
      <div
        className="sticky top-0 z-10 rounded-2xl px-5 py-3 flex items-center justify-between gap-3 flex-wrap"
        style={{ background: '#ffffff', border: '1px solid #dddddd' }}
      >
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>
            Due Sunday May 3 at 11:59 PM
          </p>
          <p className="text-xs mt-0.5" style={{ color: '#929292' }}>
            Covers May 5 – May 18 · {preferredCount} preferred · {availableCount} available · {14 - preferredCount - availableCount} off
          </p>
          <p className="text-xs mt-0.5" style={{ color: '#6a6a6a' }}>
            Target: <span className="font-semibold" style={{ color: '#222' }}>{targetHours.w1}h</span> Week 1 · <span className="font-semibold" style={{ color: '#222' }}>{targetHours.w2}h</span> Week 2
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={copyWeek1ToWeek2}
            className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl text-xs font-semibold"
            style={{ background: '#f7f7f7', color: '#6a6a6a', border: '1px solid #dddddd' }}
          >
            Copy Week 1 → Week 2
          </button>
          <button
            onClick={onReset}
            className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl text-xs font-semibold"
            style={{ background: '#f7f7f7', color: '#6a6a6a', border: '1px solid #dddddd' }}
          >
            <RefreshCw className="w-3.5 h-3.5" /> Reset
          </button>
          <button
            onClick={onSave}
            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl text-xs font-semibold"
            style={{ background: saved ? '#16a34a' : '#ff385c', color: '#ffffff' }}
          >
            {saved ? <><Check className="w-3.5 h-3.5" /> Saved</> : <><Save className="w-3.5 h-3.5" /> Submit</>}
          </button>
        </div>
      </div>

      {WEEKS.map((w) => (
        <div key={w.id} className="rounded-2xl overflow-hidden" style={{ background: '#ffffff', border: '1px solid #dddddd' }}>
          <div className="px-5 py-4" style={{ borderBottom: '1px solid #f0f0f0' }}>
            <div className="flex items-baseline gap-3">
              <h2 className="text-sm font-bold uppercase tracking-wide" style={{ color: '#222222' }}>
                {w.label}
              </h2>
              <span className="text-xs" style={{ color: '#929292' }}>{w.range}</span>
            </div>
          </div>

          {/* Target-hours row — still visually prominent but calmer */}
          <div className="px-5 py-4 flex items-center justify-between gap-3 flex-wrap" style={{ borderBottom: '1px solid #f0f0f0' }}>
            <label htmlFor={`target-${w.id}`} className="text-sm" style={{ color: '#6a6a6a' }}>
              Hours I&apos;m looking for this week
            </label>
            <select
              id={`target-${w.id}`}
              value={targetHours[w.id]}
              onChange={(e) => {
                setSaved(false);
                setTargetHours((cur) => ({ ...cur, [w.id]: Number(e.target.value) }));
              }}
              className="h-10 px-4 text-sm font-bold rounded-xl outline-none cursor-pointer"
              style={{ background: '#ffffff', border: '1.5px solid #222', color: '#222', minWidth: 200 }}
            >
              {TARGET_HOURS_OPTIONS.map((hrs) => (
                <option key={hrs} value={hrs}>
                  {hrs === 0 ? 'Not this week' : `${hrs} hrs (${hrs / 8} shift${hrs === 8 ? '' : 's'})`}
                </option>
              ))}
            </select>
          </div>
          <div className="divide-y" style={{ borderColor: '#f0f0f0' }}>
            {weeks[w.id].map((d, i) => (
              <div key={`${w.id}-${d.dayOfWeek}`} className="flex items-center px-5 py-4 gap-4 flex-wrap">
                <div className="w-16 flex-shrink-0">
                  <p className="text-sm font-bold" style={{ color: '#222222' }}>{d.dayOfWeek}</p>
                </div>

                <div
                  className="inline-flex rounded-xl p-0.5 flex-shrink-0"
                  style={{ background: '#f7f7f7', border: '1px solid #dddddd' }}
                >
                  {LEVELS.map((lvl) => {
                    const m = LEVEL_META[lvl];
                    const Icon = m.icon;
                    const active = d.level === lvl;
                    return (
                      <button
                        key={lvl}
                        onClick={() => updateDay(w.id, i, { level: lvl })}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-colors"
                        style={{
                          background: active ? '#ffffff' : 'transparent',
                          color: active ? m.fg : '#6a6a6a',
                          boxShadow: active ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                        }}
                      >
                        <Icon className="w-3 h-3" />
                        {m.label}
                      </button>
                    );
                  })}
                </div>

                <div className="flex-1 flex items-center gap-3 min-w-0">
                  {d.level !== 'unavailable' ? (
                    <>
                      <select
                        value={d.start ?? '07:00'}
                        onChange={(e) => updateDay(w.id, i, { start: e.target.value })}
                        className="h-9 px-3 text-sm rounded-xl outline-none"
                        style={{ background: '#f7f7f7', border: '1px solid #dddddd', color: '#222222' }}
                      >
                        {TIME_OPTIONS.map((t) => <option key={t} value={t}>{fmtTimeLabel(t)}</option>)}
                      </select>
                      <span className="text-sm" style={{ color: '#929292' }}>to</span>
                      <select
                        value={d.end ?? '23:00'}
                        onChange={(e) => updateDay(w.id, i, { end: e.target.value })}
                        className="h-9 px-3 text-sm rounded-xl outline-none"
                        style={{ background: '#f7f7f7', border: '1px solid #dddddd', color: '#222222' }}
                      >
                        {TIME_OPTIONS.map((t) => <option key={t} value={t}>{fmtTimeLabel(t)}</option>)}
                      </select>
                    </>
                  ) : (
                    <p className="text-sm italic" style={{ color: '#929292' }}>Unavailable</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
