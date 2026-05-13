'use client';

import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Plus, Filter } from 'lucide-react';
import { SYDNEY_HOTEL, PRIORITY_META } from '@/lib/sydney-data';

// Deterministic hash for seeding synthetic preventive tasks across the month
function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
}

// Systems that Sydney owns (hotelkit-style PPM categories)
const SYSTEM_META = {
  hvac:        { label: 'HVAC / PTAC',    bg: '#eff6ff', color: '#1d4ed8', border: '#93c5fd' },
  plumbing:    { label: 'Plumbing',       bg: '#ecfeff', color: '#0e7490', border: '#67e8f9' },
  electrical:  { label: 'Electrical',     bg: '#fffbeb', color: '#b45309', border: '#fcd34d' },
  pool:        { label: 'Pool / Spa',     bg: '#f0fdf4', color: '#15803d', border: '#86efac' },
  elevator:    { label: 'Elevator',       bg: '#f3e8ff', color: '#6b21a8', border: '#d8b4fe' },
  fire_life:   { label: 'Fire & Life',    bg: '#fef2f2', color: '#b91c1c', border: '#fca5a5' },
  kitchen:     { label: 'Kitchen / F&B',  bg: '#fff7ed', color: '#9a3412', border: '#fed7aa' },
  grounds:     { label: 'Grounds',        bg: '#f0fdfa', color: '#047857', border: '#6ee7b7' },
  general:     { label: 'General',        bg: '#f7f7f7', color: '#6a6a6a', border: '#dddddd' },
} as const;
type SystemKey = keyof typeof SYSTEM_META;

interface PpmTask {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  system: SystemKey;
  priority: 'urgent' | 'high' | 'normal' | 'low';
  assignedTo: string;
  location: string;
  durationMin: number;
  sourceTicketId?: string;
}

// Generate a month's worth of PPM tasks for Sydney's hotel — deterministic by day
function generateMonthPpm(year: number, month: number): PpmTask[] {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const tasks: PpmTask[] = [];
  const seedBase = `${SYDNEY_HOTEL.id}-${year}-${month}`;

  const TEMPLATES: { title: string; system: SystemKey; assignedTo: string; location: string; durationMin: number }[] = [
    { title: 'PTAC filter change',            system: 'hvac',       assignedTo: 'Sydney Rivera', location: 'Floors 1–3', durationMin: 120 },
    { title: 'Chiller inspection',            system: 'hvac',       assignedTo: 'HVAC Vendor',   location: 'Roof',       durationMin: 90 },
    { title: 'Hot water heater check',        system: 'plumbing',   assignedTo: 'Sydney Rivera', location: 'Mech room',  durationMin: 45 },
    { title: 'Shower head descale rotation',  system: 'plumbing',   assignedTo: 'Amir Lopez',    location: 'Random 10',  durationMin: 60 },
    { title: 'Emergency light test',          system: 'fire_life',  assignedTo: 'Sydney Rivera', location: 'All floors', durationMin: 75 },
    { title: 'Fire extinguisher inspection',  system: 'fire_life',  assignedTo: 'Sydney Rivera', location: 'All floors', durationMin: 60 },
    { title: 'Elevator monthly inspection',   system: 'elevator',   assignedTo: 'Otis',          location: 'Elevator',   durationMin: 90 },
    { title: 'Pool chemistry + skim',         system: 'pool',       assignedTo: 'Pool Vendor',   location: 'Pool deck',  durationMin: 45 },
    { title: 'Pool filter backwash',          system: 'pool',       assignedTo: 'Amir Lopez',    location: 'Pool pump',  durationMin: 30 },
    { title: 'GFCI outlet test',              system: 'electrical', assignedTo: 'Amir Lopez',    location: 'Rooms 101-120', durationMin: 90 },
    { title: 'Parking lot lighting check',    system: 'electrical', assignedTo: 'Amir Lopez',    location: 'Lot',        durationMin: 45 },
    { title: 'Breakfast equipment service',   system: 'kitchen',    assignedTo: 'Kitchen Vendor',location: 'Breakfast',  durationMin: 60 },
    { title: 'Ice machine descale',           system: 'kitchen',    assignedTo: 'Amir Lopez',    location: 'Breakfast',  durationMin: 30 },
    { title: 'Landscape + irrigation',        system: 'grounds',    assignedTo: 'Grounds Vendor',location: 'Exterior',   durationMin: 180 },
    { title: 'Trash compactor service',       system: 'general',    assignedTo: 'Waste Vendor',  location: 'Rear lot',   durationMin: 30 },
    { title: 'PTAC coil cleaning',            system: 'hvac',       assignedTo: 'Sydney Rivera', location: 'Floor 4',    durationMin: 150 },
    { title: 'Generator test run',            system: 'electrical', assignedTo: 'Sydney Rivera', location: 'Gen room',   durationMin: 45 },
    { title: 'Laundry dryer vent cleaning',   system: 'general',    assignedTo: 'Amir Lopez',    location: 'Laundry',    durationMin: 60 },
  ];

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const dow = new Date(year, month, d).getDay(); // 0 Sun..6 Sat
    // Skip Sundays (Sydney is mon-fri-heavy); fewer tasks on Saturdays
    if (dow === 0) continue;
    const s = hash(`${seedBase}-${d}`);
    // Weekday: 2–4 tasks; Saturday: 0–1 task
    const count = dow === 6 ? (s % 3 === 0 ? 1 : 0) : 2 + (s % 3);
    for (let i = 0; i < count; i++) {
      const t = TEMPLATES[(s + i * 7) % TEMPLATES.length];
      const priority: PpmTask['priority'] = (s + i) % 17 === 0 ? 'urgent' : (s + i) % 5 === 0 ? 'high' : 'normal';
      tasks.push({
        id: `ppm-${dateStr}-${i}`,
        date: dateStr,
        title: t.title,
        system: t.system,
        priority,
        assignedTo: t.assignedTo,
        location: t.location,
        durationMin: t.durationMin,
      });
    }
  }

  return tasks;
}

function ymd(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function SydneyPreventivePage() {
  // Anchor on today's date (frozen in memory doc to 2026-05-05 but floats with system time)
  const [anchor, setAnchor] = useState(() => new Date());
  const year = anchor.getFullYear();
  const month = anchor.getMonth();
  const todayStr = ymd(new Date());

  const [systemFilter, setSystemFilter] = useState<SystemKey | 'all'>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');

  const tasks = useMemo(() => generateMonthPpm(year, month), [year, month]);

  const filtered = tasks.filter((t) => {
    if (systemFilter !== 'all' && t.system !== systemFilter) return false;
    if (assigneeFilter !== 'all' && t.assignedTo !== assigneeFilter) return false;
    return true;
  });

  const tasksByDay = useMemo(() => {
    const m = new Map<string, PpmTask[]>();
    for (const t of filtered) {
      if (!m.has(t.date)) m.set(t.date, []);
      m.get(t.date)!.push(t);
    }
    return m;
  }, [filtered]);

  // Assignee list for filter
  const assignees = Array.from(new Set(tasks.map((t) => t.assignedTo))).sort();

  // Build calendar grid
  const firstDow = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const weeks: (number | null)[][] = [];
  let week: (number | null)[] = Array(firstDow).fill(null);
  for (let d = 1; d <= daysInMonth; d++) {
    week.push(d);
    if (week.length === 7) { weeks.push(week); week = []; }
  }
  if (week.length) { while (week.length < 7) week.push(null); weeks.push(week); }

  const monthLabel = anchor.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const totalThisMonth = filtered.length;
  const completedThisMonth = filtered.filter((t) => new Date(t.date) < new Date()).length;
  const upcomingThisMonth = filtered.filter((t) => new Date(t.date) >= new Date()).length;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold" style={{ color: '#222222' }}>Preventive Maintenance Calendar</h1>
        <p className="text-sm mt-0.5" style={{ color: '#929292' }}>
          {SYDNEY_HOTEL.shortName} · {monthLabel} · {totalThisMonth} scheduled · {completedThisMonth} done · {upcomingThisMonth} upcoming
        </p>
      </div>

      {/* Month nav + filters */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="inline-flex items-center rounded-xl" style={{ background: '#ffffff', border: '1px solid #dddddd' }}>
          <button
            onClick={() => setAnchor(new Date(year, month - 1, 1))}
            className="h-9 w-9 flex items-center justify-center"
          >
            <ChevronLeft className="w-4 h-4" style={{ color: '#6a6a6a' }} />
          </button>
          <span className="px-4 text-sm font-semibold" style={{ color: '#222' }}>{monthLabel}</span>
          <button
            onClick={() => setAnchor(new Date(year, month + 1, 1))}
            className="h-9 w-9 flex items-center justify-center"
          >
            <ChevronRight className="w-4 h-4" style={{ color: '#6a6a6a' }} />
          </button>
          <button
            onClick={() => setAnchor(new Date())}
            className="h-9 px-3 text-xs font-semibold"
            style={{ color: '#ff385c', borderLeft: '1px solid #dddddd' }}
          >
            Today
          </button>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="inline-flex items-center gap-1 text-xs" style={{ color: '#6a6a6a' }}>
            <Filter className="w-3.5 h-3.5" /> Filter
          </div>
          <select
            value={systemFilter}
            onChange={(e) => setSystemFilter(e.target.value as SystemKey | 'all')}
            className="h-8 px-3 rounded-lg text-xs font-semibold outline-none"
            style={{ background: '#ffffff', border: '1px solid #dddddd', color: '#222' }}
          >
            <option value="all">All systems</option>
            {(Object.keys(SYSTEM_META) as SystemKey[]).map((k) => (
              <option key={k} value={k}>{SYSTEM_META[k].label}</option>
            ))}
          </select>
          <select
            value={assigneeFilter}
            onChange={(e) => setAssigneeFilter(e.target.value)}
            className="h-8 px-3 rounded-lg text-xs font-semibold outline-none"
            style={{ background: '#ffffff', border: '1px solid #dddddd', color: '#222' }}
          >
            <option value="all">All assignees</option>
            {assignees.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
          <button
            onClick={() => alert('Schedule new preventive task (mock)')}
            className="inline-flex items-center gap-1 h-8 px-3 rounded-lg text-xs font-semibold"
            style={{ background: '#ff385c', color: '#ffffff' }}
          >
            <Plus className="w-3.5 h-3.5" /> Schedule task
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 flex-wrap text-xs" style={{ color: '#6a6a6a' }}>
        <span className="font-semibold">Systems:</span>
        {(Object.keys(SYSTEM_META) as SystemKey[]).map((k) => (
          <span key={k} className="inline-flex items-center gap-1">
            <span className="w-3 h-3 rounded-sm" style={{ background: SYSTEM_META[k].bg, border: `1px solid ${SYSTEM_META[k].border}` }} />
            {SYSTEM_META[k].label}
          </span>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="rounded-2xl overflow-hidden" style={{ background: '#ffffff', border: '1px solid #dddddd' }}>
        <div className="grid grid-cols-7" style={{ borderBottom: '1px solid #dddddd', background: '#f7f7f7' }}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <div key={d} className="py-2 px-3 text-[10px] font-bold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>
              {d}
            </div>
          ))}
        </div>
        <div>
          {weeks.map((w, wi) => (
            <div key={wi} className="grid grid-cols-7" style={{ borderBottom: wi < weeks.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
              {w.map((d, di) => {
                if (d === null) return <div key={di} className="min-h-[110px] p-1.5" style={{ background: '#fafafa' }} />;
                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                const dayTasks = tasksByDay.get(dateStr) ?? [];
                const isToday = dateStr === todayStr;
                return (
                  <div
                    key={di}
                    className="min-h-[110px] p-1.5"
                    style={{
                      background: isToday ? '#fff1f3' : '#ffffff',
                      borderRight: di < 6 ? '1px solid #f0f0f0' : 'none',
                    }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className="text-[11px] font-bold px-1.5 rounded-full"
                        style={{
                          color: isToday ? '#ffffff' : '#222',
                          background: isToday ? '#ff385c' : 'transparent',
                        }}
                      >
                        {d}
                      </span>
                      {dayTasks.length > 0 && (
                        <span className="text-[9px] font-bold" style={{ color: '#929292' }}>{dayTasks.length}</span>
                      )}
                    </div>
                    <div className="flex flex-col gap-0.5">
                      {dayTasks.slice(0, 4).map((t) => {
                        const m = SYSTEM_META[t.system];
                        return (
                          <div
                            key={t.id}
                            className="rounded-sm px-1.5 py-0.5 text-[10px] leading-tight"
                            style={{
                              background: m.bg,
                              border: `1px solid ${m.border}`,
                              borderLeft: `3px solid ${m.color}`,
                              color: m.color,
                            }}
                            title={`${t.title} · ${t.location} · ${t.assignedTo} · ${t.durationMin}m`}
                          >
                            <div className="font-semibold truncate">{t.title}</div>
                          </div>
                        );
                      })}
                      {dayTasks.length > 4 && (
                        <div className="text-[9px] font-bold px-1" style={{ color: '#929292' }}>
                          +{dayTasks.length - 4} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Summary by system */}
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wide mb-3" style={{ color: '#6a6a6a' }}>
          Month at a glance · {monthLabel}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {(Object.keys(SYSTEM_META) as SystemKey[]).map((k) => {
            const m = SYSTEM_META[k];
            const count = tasks.filter((t) => t.system === k).length;
            if (count === 0) return null;
            return (
              <div
                key={k}
                className="rounded-xl p-3"
                style={{ background: m.bg, border: `1px solid ${m.border}` }}
              >
                <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: m.color }}>{m.label}</p>
                <p className="text-xl font-bold mt-1" style={{ color: m.color }}>{count}</p>
                <p className="text-[10px]" style={{ color: m.color, opacity: 0.75 }}>tasks scheduled</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
