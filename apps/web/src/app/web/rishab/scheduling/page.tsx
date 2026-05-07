'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Sparkles, Check, X, Plus, Minus, AlertTriangle, Lock, Send, Pin as PinIcon,
  Star, RefreshCw, ChevronRight, UserPlus, Crown,
} from 'lucide-react';
import {
  getEmployeesForHotel, SHIFT_META,
  type ShiftCode, type DayCode, type EmployeeTeam, type Employee,
} from '@hos/shared';

const HOTEL_ID = 'BTRCI';
const DAYS: DayCode[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const TEAMS: EmployeeTeam[] = ['Front Desk', 'Housekeeping', 'Maintenance', 'Restaurant', 'Management'];

type WeekId = 'w1' | 'w2';
const WEEKS: { id: WeekId; label: string; range: string }[] = [
  { id: 'w1', label: 'Week 1', range: 'May 5 – May 11' },
  { id: 'w2', label: 'Week 2', range: 'May 12 – May 18' },
];

// Per-day FD staffing targets (AM / PM / NA)
interface FdDay { AM: number; PM: number; NA: number; }
const DEFAULT_FD_DAILY: Record<DayCode, FdDay> = {
  Mon: { AM: 1, PM: 1, NA: 1 },
  Tue: { AM: 1, PM: 1, NA: 1 },
  Wed: { AM: 1, PM: 1, NA: 1 },
  Thu: { AM: 1, PM: 1, NA: 1 },
  Fri: { AM: 1, PM: 1, NA: 1 },
  Sat: { AM: 1, PM: 1, NA: 1 },
  Sun: { AM: 1, PM: 1, NA: 1 },
};

// How many DAY slots per day for non-FD teams
const DEFAULT_DAY_STAFFING: Record<Exclude<EmployeeTeam, 'Front Desk'>, Record<DayCode, number>> = {
  'Housekeeping': { Mon: 3, Tue: 3, Wed: 3, Thu: 3, Fri: 3, Sat: 4, Sun: 3 },
  'Maintenance':  { Mon: 2, Tue: 2, Wed: 2, Thu: 2, Fri: 2, Sat: 1, Sun: 1 },
  'Restaurant':   { Mon: 1, Tue: 1, Wed: 1, Thu: 1, Fri: 1, Sat: 2, Sun: 2 },
  'Management':   { Mon: 1, Tue: 1, Wed: 1, Thu: 1, Fri: 1, Sat: 0, Sun: 0 },
};

interface Pin {
  id: string;
  weekId: WeekId;
  day: DayCode;
  shift: ShiftCode;
  employeeId: string;
}

interface ScheduleCell {
  employeeId: string;
  shift: ShiftCode;
  pinned: boolean;
  preferredMatch: boolean;
  agmCover?: boolean;
}

interface Gap {
  weekId: WeekId;
  day: DayCode;
  shift: ShiftCode;
  team: EmployeeTeam;
  short: number;
}

const AGM_FD_COVER_LIMIT = 2;

type WeekSchedule = Record<DayCode, ScheduleCell[]>;

const EMPTY_WEEK = (): WeekSchedule => ({
  Mon: [], Tue: [], Wed: [], Thu: [], Fri: [], Sat: [], Sun: [],
});

// Shifts to try for a team's AI fill (FD has 3 FD shifts; others have DAY)
function teamShifts(team: EmployeeTeam): ShiftCode[] {
  return team === 'Front Desk' ? ['AM', 'PM', 'NA'] : ['DAY'];
}

// Turn a "HH:MM" 24h string into "7a" / "3p" / "12p" / "12a".
function fmt12(hhmm: string): string {
  if (!hhmm || !hhmm.includes(':')) return hhmm;
  const h = parseInt(hhmm.split(':')[0], 10);
  if (isNaN(h)) return hhmm;
  const mer = h >= 12 ? 'p' : 'a';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}${mer}`;
}

function demand(team: EmployeeTeam, day: DayCode, shift: ShiftCode, dailyFd: Record<DayCode, FdDay>): number {
  if (team === 'Front Desk') {
    if (shift === 'AM' || shift === 'PM' || shift === 'NA') return dailyFd[day][shift];
    return 0;
  }
  if (shift === 'DAY') return DEFAULT_DAY_STAFFING[team as Exclude<EmployeeTeam, 'Front Desk'>][day];
  return 0;
}

export default function SchedulingPage() {
  const allEmployees = getEmployeesForHotel(HOTEL_ID);

  const [activeTeam, setActiveTeam] = useState<EmployeeTeam>('Front Desk');
  const [activeWeek, setActiveWeek] = useState<WeekId>('w1');
  const [pins, setPins] = useState<Pin[]>([]);
  const [schedule, setSchedule] = useState<Record<WeekId, WeekSchedule> | null>(null);
  const [gaps, setGaps] = useState<Gap[]>([]);
  const [gapPicker, setGapPicker] = useState<Gap | null>(null);
  // Published keyed by `${team}:${weekId}` — each team × week is independently publishable
  const [published, setPublished] = useState<Set<string>>(new Set());
  const [dailyFd, setDailyFd] = useState(DEFAULT_FD_DAILY);

  const pubKey = (team: EmployeeTeam, weekId: WeekId) => `${team}:${weekId}`;
  const isPublished = (team: EmployeeTeam, weekId: WeekId) => published.has(pubKey(team, weekId));

  const [showPinForm, setShowPinForm] = useState(false);
  const [pinForm, setPinForm] = useState<Omit<Pin, 'id'>>({
    weekId: 'w1', day: 'Mon', shift: 'AM', employeeId: '',
  });

  const baseTeamEmployees = useMemo(
    () => allEmployees.filter((e) => e.team === activeTeam && e.status === 'active'),
    [allEmployees, activeTeam],
  );

  // Rows on the schedule grid: active team members + anyone scheduled onto this team's shifts (cross-team pins)
  const teamEmployees = useMemo(() => {
    if (!schedule) return baseTeamEmployees;
    const weekSched = schedule[activeWeek];
    const teamShiftSet = new Set<ShiftCode>(teamShifts(activeTeam));
    const extraIds = new Set<string>();
    for (const day of DAYS) {
      for (const c of weekSched[day]) {
        if (teamShiftSet.has(c.shift) && !baseTeamEmployees.some((e) => e.id === c.employeeId)) {
          extraIds.add(c.employeeId);
        }
      }
    }
    const extras = allEmployees.filter((e) => extraIds.has(e.id));
    return [...baseTeamEmployees, ...extras];
  }, [baseTeamEmployees, allEmployees, activeTeam, schedule, activeWeek]);

  const activeWeekPins = useMemo(
    () => pins.filter((p) => p.weekId === activeWeek),
    [pins, activeWeek],
  );

  // Group employees by team for the <select> in the pin form
  const employeesByTeam = useMemo(() => {
    const groups: Record<string, Employee[]> = {};
    for (const team of TEAMS) {
      groups[team] = allEmployees.filter((e) => e.team === team && e.status === 'active');
    }
    return groups;
  }, [allEmployees]);

  // ── Pin helpers ─────────────────────────────────────────────────────────

  const addPin = () => {
    if (!pinForm.employeeId) return;
    const newPin: Pin = { id: `pin-${Date.now()}`, ...pinForm };
    setPins((cur) => [...cur, newPin]);
    setShowPinForm(false);
    setSchedule(null); // invalidate
    setPublished(new Set());
  };

  const removePin = (id: string) => {
    setPins((cur) => cur.filter((p) => p.id !== id));
    setSchedule(null);
    setPublished(new Set());
  };

  const adjustDaily = (day: DayCode, shift: 'AM' | 'PM' | 'NA', delta: number) => {
    setDailyFd((d) => ({ ...d, [day]: { ...d[day], [shift]: Math.max(0, d[day][shift] + delta) } }));
    setSchedule(null);
  };

  // ── AI Fill ─────────────────────────────────────────────────────────────

  const computeFill = (sourcePins: Pin[], sourceDailyFd: Record<DayCode, FdDay>) => {
    const fullSched: Record<WeekId, WeekSchedule> = { w1: EMPTY_WEEK(), w2: EMPTY_WEEK() };
    const fullGaps: Gap[] = [];
    const agm = allEmployees.find((e) => e.team === 'Management' && e.role.toLowerCase().includes('assistant general manager'));

    for (const weekId of ['w1', 'w2'] as WeekId[]) {
      const sched = fullSched[weekId];
      const weekPins = sourcePins.filter((p) => p.weekId === weekId);
      const hoursByEmp: Record<string, number> = {};
      let agmFdCovers = 0;

      // Seed with pins — pins override availability (manager's call)
      for (const pin of weekPins) {
        const emp = allEmployees.find((e) => e.id === pin.employeeId);
        if (!emp) continue;
        sched[pin.day].push({
          employeeId: pin.employeeId,
          shift: pin.shift,
          pinned: true,
          preferredMatch: Boolean(emp.preferences?.[pin.day]?.includes(pin.shift)),
        });
        hoursByEmp[pin.employeeId] = (hoursByEmp[pin.employeeId] ?? 0) + SHIFT_META[pin.shift].hours;
      }

      // Fill remaining per team — iterate each team independently to compute gaps
      for (const team of TEAMS) {
        const eligiblePool = allEmployees.filter((e) => e.team === team && e.status === 'active');
        for (const day of DAYS) {
          for (const shift of teamShifts(team)) {
            const need = demand(team, day, shift, sourceDailyFd);
            if (need <= 0) continue;

            const pinnedForSlot = sched[day].filter((c) => c.shift === shift).length;
            let remaining = need - pinnedForSlot;
            if (remaining <= 0) continue;

            const alreadyWorkingThisDay = () => new Set(sched[day].map((c) => c.employeeId));

            const candidates = eligiblePool
              .filter(
                (e) =>
                  e.availability[day].includes(shift) &&
                  !alreadyWorkingThisDay().has(e.id) &&
                  (hoursByEmp[e.id] ?? 0) + SHIFT_META[shift].hours <= e.maxHoursWeek,
              )
              .map((e) => {
                let score = e.performanceScore;
                if (e.preferences?.[day]?.includes(shift)) score += 300;
                if (e.preferredShift === shift) score += 100;
                // Slight balance nudge — prefer those with fewer hours so far
                score -= (hoursByEmp[e.id] ?? 0) * 0.5;
                return { emp: e, score };
              })
              .sort((a, b) => b.score - a.score);

            let picked = 0;
            while (picked < remaining && candidates[picked]) {
              const pick = candidates[picked];
              sched[day].push({
                employeeId: pick.emp.id,
                shift,
                pinned: false,
                preferredMatch: Boolean(pick.emp.preferences?.[day]?.includes(shift)),
              });
              hoursByEmp[pick.emp.id] = (hoursByEmp[pick.emp.id] ?? 0) + SHIFT_META[shift].hours;
              picked++;
            }
            remaining -= picked;

            // AGM fallback — Front Desk only, capped per week
            if (
              remaining > 0 &&
              team === 'Front Desk' &&
              agm &&
              agmFdCovers < AGM_FD_COVER_LIMIT &&
              !alreadyWorkingThisDay().has(agm.id) &&
              (hoursByEmp[agm.id] ?? 0) + SHIFT_META[shift].hours <= agm.maxHoursWeek
            ) {
              sched[day].push({
                employeeId: agm.id,
                shift,
                pinned: false,
                preferredMatch: false,
                agmCover: true,
              });
              hoursByEmp[agm.id] = (hoursByEmp[agm.id] ?? 0) + SHIFT_META[shift].hours;
              agmFdCovers++;
              remaining--;
            }

            if (remaining > 0) {
              fullGaps.push({ weekId, day, shift, team, short: remaining });
            }
          }
        }
      }
    }

    return { schedule: fullSched, gaps: fullGaps };
  };

  const runAiFill = () => {
    const { schedule: s, gaps: g } = computeFill(pins, dailyFd);
    setSchedule(s);
    setGaps(g);
  };

  const clearGenerated = () => {
    setSchedule(null);
    setGaps([]);
    setPublished(new Set());
  };

  // Fill a specific gap manually — adds a pin and re-runs fill to honor it synchronously
  const fillGapManually = (gap: Gap, employeeId: string) => {
    const newPin: Pin = {
      id: `pin-${Date.now()}`,
      weekId: gap.weekId,
      day: gap.day,
      shift: gap.shift,
      employeeId,
    };
    const nextPins = [...pins, newPin];
    setPins(nextPins);
    const { schedule: s, gaps: g } = computeFill(nextPins, dailyFd);
    setSchedule(s);
    setGaps(g);
    setGapPicker(null);
    setPublished(new Set());
  };

  const publishTeamWeek = (team: EmployeeTeam, weekId: WeekId) => {
    setPublished((cur) => new Set(cur).add(pubKey(team, weekId)));
  };
  const unpublishTeamWeek = (team: EmployeeTeam, weekId: WeekId) => {
    setPublished((cur) => {
      const n = new Set(cur);
      n.delete(pubKey(team, weekId));
      return n;
    });
  };

  // ── Derived for display ────────────────────────────────────────────────

  const activeWeekSched: WeekSchedule | null = schedule ? schedule[activeWeek] : null;

  // Pin is shown on the tab whose SHIFTS it serves (not the employee's home team).
  // So Lashwanda (Management) pinned onto FD-AM appears on the Front Desk tab.
  const activeWeekPinsForTeam = useMemo(() => {
    const teamShiftSet = new Set<ShiftCode>(teamShifts(activeTeam));
    return activeWeekPins.filter((p) => teamShiftSet.has(p.shift));
  }, [activeWeekPins, activeTeam]);

  const weekStats = useMemo(() => {
    if (!schedule) return null;
    const teamShiftSet = new Set<ShiftCode>(teamShifts(activeTeam));
    // A cell counts for this team's stats if its SHIFT belongs to this team
    // (e.g. AGM covering a FD shift counts toward Front Desk, not Management).
    const teamCells = DAYS.flatMap((d) => schedule[activeWeek][d].filter((c) => teamShiftSet.has(c.shift)));
    const totalHours = teamCells.reduce((s, c) => s + SHIFT_META[c.shift].hours, 0);
    const cost = teamCells.reduce((s, c) => {
      const emp = allEmployees.find((e) => e.id === c.employeeId);
      return s + (emp ? emp.hourlyRate * SHIFT_META[c.shift].hours : 0);
    }, 0);
    const preferredHit = teamCells.filter((c) => c.preferredMatch).length;
    const totalSlots = teamCells.length;
    return { totalHours, cost, preferredHit, totalSlots };
  }, [schedule, activeWeek, activeTeam, allEmployees]);

  return (
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold" style={{ color: '#222222' }}>Bi-weekly Scheduling</h1>
          <p className="text-sm mt-0.5" style={{ color: '#929292' }}>
            May 5 – May 18 · Home2 Baton Rouge · Pin manually first, then let AI fill · Each team × week publishes independently
          </p>
        </div>
      </div>

      {/* Global published-status banner — always visible once anything is published */}
      {published.size > 0 && (
        <div
          className="rounded-2xl px-5 py-3 flex items-center gap-3 flex-wrap"
          style={{ background: '#ecfdf5', border: '1px solid #86efac' }}
        >
          <Check className="w-4 h-4 flex-shrink-0" style={{ color: '#047857' }} />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#047857' }}>
              Published · {published.size} schedule{published.size === 1 ? '' : 's'}
            </p>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {Array.from(published).sort().map((key) => {
                const [t, w] = key.split(':') as [EmployeeTeam, WeekId];
                const wk = WEEKS.find((x) => x.id === w)!;
                return (
                  <span
                    key={key}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full"
                    style={{ background: '#ffffff', color: '#047857', border: '1px solid #86efac' }}
                  >
                    <Check className="w-2.5 h-2.5" /> {t} · {wk.label}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Team tabs */}
      <div className="flex gap-2 flex-wrap">
        {TEAMS.map((team) => {
          const isActive = activeTeam === team;
          const count = allEmployees.filter((e) => e.team === team && e.status === 'active').length;
          const publishedCount = WEEKS.filter((w) => isPublished(team, w.id)).length;
          return (
            <button
              key={team}
              onClick={() => setActiveTeam(team)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-colors relative"
              style={{
                background: isActive ? '#ff385c' : '#ffffff',
                color: isActive ? '#ffffff' : '#6a6a6a',
                border: isActive ? '1px solid #ff385c' : '1px solid #dddddd',
              }}
            >
              {team}
              <span
                className="text-[10px] px-1.5 py-0.5 rounded-full font-bold"
                style={{
                  background: isActive ? 'rgba(255,255,255,0.25)' : '#f0f0f0',
                  color: isActive ? '#ffffff' : '#6a6a6a',
                }}
              >
                {count}
              </span>
              {publishedCount > 0 && (
                <span
                  className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                  style={{
                    background: isActive ? 'rgba(255,255,255,0.25)' : '#ecfdf5',
                    color: isActive ? '#ffffff' : '#047857',
                    border: isActive ? 'none' : '1px solid #86efac',
                  }}
                  title={`${publishedCount} of ${WEEKS.length} week(s) published`}
                >
                  <Check className="w-2.5 h-2.5" />
                  {publishedCount}/{WEEKS.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Week tabs + publish button for this (team × week) */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div
          className="inline-flex rounded-xl p-1"
          style={{ background: '#f7f7f7', border: '1px solid #dddddd' }}
        >
          {WEEKS.map((w) => {
            const isActive = activeWeek === w.id;
            const pubForActive = isPublished(activeTeam, w.id);
            return (
              <button
                key={w.id}
                onClick={() => setActiveWeek(w.id)}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors"
                style={{
                  background: isActive ? '#ffffff' : 'transparent',
                  color: isActive ? '#222222' : '#6a6a6a',
                  boxShadow: isActive ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                }}
              >
                {w.label}
                <span className="text-[10px]" style={{ color: '#929292' }}>{w.range}</span>
                {pubForActive && <Check className="w-3 h-3" style={{ color: '#16a34a' }} />}
              </button>
            );
          })}
        </div>

        {schedule && (
          isPublished(activeTeam, activeWeek) ? (
            <div className="flex items-center gap-2">
              <span
                className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl text-xs font-semibold"
                style={{ background: '#d1fae5', color: '#047857', border: '1px solid #86efac' }}
              >
                <Check className="w-3.5 h-3.5" /> {activeTeam} · {WEEKS.find((w) => w.id === activeWeek)!.label} published
              </span>
              <button
                onClick={() => unpublishTeamWeek(activeTeam, activeWeek)}
                className="inline-flex items-center gap-1 h-9 px-3 rounded-xl text-xs font-semibold"
                style={{ background: '#ffffff', color: '#6a6a6a', border: '1px solid #dddddd' }}
              >
                Unpublish
              </button>
            </div>
          ) : (
            <button
              onClick={() => publishTeamWeek(activeTeam, activeWeek)}
              className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl text-xs font-semibold"
              style={{ background: '#ff385c', color: '#ffffff' }}
            >
              <Send className="w-3.5 h-3.5" />
              Publish {activeTeam} · {WEEKS.find((w) => w.id === activeWeek)!.label}
            </button>
          )
        )}
      </div>

      {/* Staffing targets + Manual pins */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Staffing targets */}
        {activeTeam === 'Front Desk' ? (
          <div className="rounded-2xl p-5" style={{ background: '#ffffff', border: '1px solid #dddddd' }}>
            <p className="text-xs font-bold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>Staffing targets · Front Desk</p>
            <p className="text-xs mt-0.5 mb-3" style={{ color: '#929292' }}>
              How many people per shift per day (applies to both weeks). AM 7a–3p · PM 3p–11p · NA 11p–7a.
            </p>
            <table className="w-full text-xs">
              <thead>
                <tr>
                  <th className="text-left py-1 px-1 font-semibold" style={{ color: '#929292' }}></th>
                  {DAYS.map((d) => <th key={d} className="py-1 px-1 font-semibold" style={{ color: '#6a6a6a' }}>{d}</th>)}
                </tr>
              </thead>
              <tbody>
                {(['AM', 'PM', 'NA'] as const).map((shift) => (
                  <tr key={shift}>
                    <td className="py-1 px-1 font-semibold" style={{ color: SHIFT_META[shift].color }}>{shift}</td>
                    {DAYS.map((d) => (
                      <td key={d} className="py-1 px-1">
                        <div className="flex items-center gap-1 justify-center">
                          <button onClick={() => adjustDaily(d, shift, -1)} className="w-5 h-5 rounded flex items-center justify-center" style={{ background: '#f7f7f7', color: '#6a6a6a' }}>−</button>
                          <span className="w-5 text-center font-bold" style={{ color: '#222' }}>{dailyFd[d][shift]}</span>
                          <button onClick={() => adjustDaily(d, shift, 1)} className="w-5 h-5 rounded flex items-center justify-center" style={{ background: '#f7f7f7', color: '#6a6a6a' }}>+</button>
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-2xl p-5" style={{ background: '#ffffff', border: '1px solid #dddddd' }}>
            <p className="text-xs font-bold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>Staffing targets · {activeTeam}</p>
            <p className="text-xs mt-0.5 mb-3" style={{ color: '#929292' }}>
              {activeTeam === 'Management'
                ? 'Office hours, Mon–Fri (9a–5p). AGM / managers default to DAY shifts; pin them onto Front Desk when they need to cover.'
                : activeTeam === 'Housekeeping'
                  ? 'DAY shift (8a–4p). Higher on weekends.'
                  : activeTeam === 'Maintenance'
                    ? 'DAY shift. Sydney AM, Amir PM. On-call weekends.'
                    : 'Breakfast only. 1 on weekdays, 2 on weekends.'}
            </p>
            <div className="grid grid-cols-7 gap-2 text-center text-xs">
              {DAYS.map((d) => (
                <div key={d} className="rounded-lg p-2" style={{ background: '#f7f7f7' }}>
                  <p className="font-semibold" style={{ color: '#6a6a6a' }}>{d}</p>
                  <p className="text-lg font-bold mt-0.5" style={{ color: '#222' }}>
                    {DEFAULT_DAY_STAFFING[activeTeam as Exclude<EmployeeTeam, 'Front Desk'>][d]}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Manual pins */}
        <div className="rounded-2xl p-5" style={{ background: '#ffffff', border: '1px solid #dddddd' }}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>
                Manual Pins · {WEEKS.find((w) => w.id === activeWeek)!.label}
              </p>
              <p className="text-xs mt-0.5" style={{ color: '#929292' }}>
                Force a specific person onto a specific shift. AI fills around these.
              </p>
            </div>
            <button
              onClick={() => setShowPinForm((s) => !s)}
              className="inline-flex items-center gap-1 h-8 px-3 rounded-xl text-xs font-semibold"
              style={{ background: '#ff385c', color: '#ffffff' }}
            >
              <Plus className="w-3.5 h-3.5" />
              Add Pin
            </button>
          </div>

          {/* Add pin form */}
          {showPinForm && (
            <div className="rounded-xl p-3 mb-3" style={{ background: '#fafafa', border: '1px solid #f0f0f0' }}>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <select
                  value={pinForm.weekId}
                  onChange={(e) => setPinForm((f) => ({ ...f, weekId: e.target.value as WeekId }))}
                  className="h-9 px-2 text-sm rounded-lg outline-none"
                  style={{ background: '#ffffff', border: '1px solid #dddddd', color: '#222' }}
                >
                  {WEEKS.map((w) => <option key={w.id} value={w.id}>{w.label}</option>)}
                </select>
                <select
                  value={pinForm.day}
                  onChange={(e) => setPinForm((f) => ({ ...f, day: e.target.value as DayCode }))}
                  className="h-9 px-2 text-sm rounded-lg outline-none"
                  style={{ background: '#ffffff', border: '1px solid #dddddd', color: '#222' }}
                >
                  {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
                <select
                  value={pinForm.shift}
                  onChange={(e) => setPinForm((f) => ({ ...f, shift: e.target.value as ShiftCode }))}
                  className="h-9 px-2 text-sm rounded-lg outline-none"
                  style={{ background: '#ffffff', border: '1px solid #dddddd', color: '#222' }}
                >
                  <option value="AM">AM · 7a–3p</option>
                  <option value="PM">PM · 3p–11p</option>
                  <option value="NA">NA · 11p–7a</option>
                  <option value="DAY">DAY · 8a–4p</option>
                </select>
                <select
                  value={pinForm.employeeId}
                  onChange={(e) => setPinForm((f) => ({ ...f, employeeId: e.target.value }))}
                  className="h-9 px-2 text-sm rounded-lg outline-none"
                  style={{ background: '#ffffff', border: '1px solid #dddddd', color: '#222' }}
                >
                  <option value="">— pick employee —</option>
                  {(employeesByTeam[activeTeam] ?? []).map((e) => (
                    <option key={e.id} value={e.id}>{e.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-2 mt-3">
                <button
                  onClick={() => setShowPinForm(false)}
                  className="h-8 px-3 rounded-lg text-xs font-semibold"
                  style={{ background: '#ffffff', color: '#6a6a6a', border: '1px solid #dddddd' }}
                >
                  Cancel
                </button>
                <button
                  onClick={addPin}
                  disabled={!pinForm.employeeId}
                  className="h-8 px-3 rounded-lg text-xs font-semibold"
                  style={{
                    background: pinForm.employeeId ? '#ff385c' : '#f0f0f0',
                    color: pinForm.employeeId ? '#ffffff' : '#929292',
                  }}
                >
                  <PinIcon className="w-3 h-3 inline mr-1" /> Pin
                </button>
              </div>
            </div>
          )}

          {/* Pins list */}
          {activeWeekPinsForTeam.length === 0 ? (
            <p className="text-xs italic text-center py-4" style={{ color: '#929292' }}>
              No pins for {activeTeam} in {WEEKS.find((w) => w.id === activeWeek)!.label}. {pins.length - activeWeekPinsForTeam.length > 0 && `(${pins.length - activeWeekPinsForTeam.length} pins on other team/week)`}
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {activeWeekPinsForTeam.map((pin) => {
                const emp = allEmployees.find((e) => e.id === pin.employeeId)!;
                return (
                  <li key={pin.id} className="flex items-center gap-3 px-3 py-2 rounded-lg" style={{ background: '#fafafa', border: '1px solid #f0f0f0' }}>
                    <Lock className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#b45309' }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold" style={{ color: '#222' }}>
                        {emp.name} · {pin.day} · {pin.shift}
                      </p>
                      <p className="text-[11px]" style={{ color: '#929292' }}>
                        {emp.role} · {fmt12(SHIFT_META[pin.shift].start)}–{fmt12(SHIFT_META[pin.shift].end)}
                      </p>
                    </div>
                    <button
                      onClick={() => removePin(pin.id)}
                      className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-[#ffffff]"
                    >
                      <X className="w-3.5 h-3.5" style={{ color: '#929292' }} />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {/* Action bar */}
      <div className="flex items-center justify-between gap-3 flex-wrap rounded-2xl px-5 py-3" style={{ background: '#fffbeb', border: '1px solid #fde68a' }}>
        <div className="flex items-center gap-3">
          <Sparkles className="w-4 h-4" style={{ color: '#b45309' }} />
          <div>
            <p className="text-sm font-semibold" style={{ color: '#78350f' }}>
              {schedule ? 'Schedule generated · review below, then publish' : 'Ready to fill'}
            </p>
            <p className="text-xs" style={{ color: '#78350f', opacity: 0.8 }}>
              AI respects pins, honors <span className="font-semibold">Preferred</span> slots first, then Available, then balances hours.
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {schedule && (
            <button
              onClick={clearGenerated}
              className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl text-xs font-semibold"
              style={{ background: '#ffffff', color: '#6a6a6a', border: '1px solid #dddddd' }}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Clear Generated
            </button>
          )}
          <button
            onClick={runAiFill}
            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl text-xs font-semibold"
            style={{ background: '#ff385c', color: '#ffffff' }}
          >
            <Sparkles className="w-3.5 h-3.5" />
            {schedule ? 'Re-run AI Fill' : 'AI Auto-Fill Remaining'}
          </button>
        </div>
      </div>

      {/* Week stats */}
      {weekStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="Total Hours" value={`${weekStats.totalHours}`} sub={`${activeTeam} · ${WEEKS.find((w) => w.id === activeWeek)!.label}`} />
          <StatCard label="Est. Payroll" value={`$${weekStats.cost.toFixed(0)}`} sub={`${activeTeam} · this week`} />
          <StatCard label="Preferred Matched" value={`${weekStats.preferredHit} / ${weekStats.totalSlots}`} sub={`${weekStats.totalSlots > 0 ? Math.round((weekStats.preferredHit / weekStats.totalSlots) * 100) : 0}% honored`} />
          <StatCard label="Gaps" value={`${gaps.filter((g) => g.team === activeTeam && g.weekId === activeWeek).reduce((s, g) => s + g.short, 0)}`} sub={`${activeTeam} · ${WEEKS.find((w) => w.id === activeWeek)!.label}`} danger={gaps.some((g) => g.team === activeTeam && g.weekId === activeWeek)} />
        </div>
      )}

      {/* Coverage gap actions — active team only */}
      {schedule && gaps.filter((g) => g.team === activeTeam).length > 0 && (
        <div className="rounded-2xl p-5" style={{ background: '#fef2f2', border: '1px solid #fca5a5' }}>
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-4 h-4" style={{ color: '#b91c1c' }} />
            <p className="text-sm font-semibold" style={{ color: '#b91c1c' }}>
              Coverage gaps · {activeTeam} — {gaps.filter((g) => g.team === activeTeam).reduce((s, g) => s + g.short, 0)} slots unfilled
            </p>
          </div>
          <p className="text-xs mb-3" style={{ color: '#7f1d1d' }}>
            AI couldn&apos;t find anyone preferred/available. Pick someone manually — they&apos;ll be pinned and the schedule re-runs.
          </p>
          <div className="flex flex-col gap-2">
            {WEEKS.map((w) => {
              const weekGaps = gaps.filter((g) => g.weekId === w.id && g.team === activeTeam);
              if (weekGaps.length === 0) return null;
              return (
                <div key={w.id}>
                  <p className="text-[11px] font-bold uppercase tracking-wide mb-1.5" style={{ color: '#7f1d1d' }}>
                    {w.label} · {w.range}
                  </p>
                  <ul className="flex flex-col gap-1.5">
                    {weekGaps.map((g, i) => (
                      <li
                        key={`${g.weekId}-${g.day}-${g.shift}-${g.team}-${i}`}
                        className="flex items-center gap-3 rounded-xl px-3 py-2"
                        style={{ background: '#ffffff', border: '1px solid #fecaca' }}
                      >
                        <span
                          className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full"
                          style={{ background: SHIFT_META[g.shift].bg, color: SHIFT_META[g.shift].color }}
                        >
                          {g.day} · {g.shift}
                        </span>
                        <div className="flex-1 flex items-center gap-1">
                          {Array.from({ length: g.short }).map((_, idx) => (
                            <div
                              key={idx}
                              className="w-7 h-7 rounded-full flex items-center justify-center"
                              style={{ background: '#fef2f2', border: '1px dashed #fca5a5' }}
                            >
                              <UserPlus className="w-3 h-3" style={{ color: '#b91c1c' }} />
                            </div>
                          ))}
                        </div>
                        <span className="text-[11px] font-semibold" style={{ color: '#b91c1c' }}>short {g.short}</span>
                        <button
                          onClick={() => setGapPicker(g)}
                          className="inline-flex items-center gap-1 h-8 px-3 rounded-lg text-xs font-semibold"
                          style={{ background: '#ff385c', color: '#ffffff' }}
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                          Add person
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Gap picker modal */}
      {gapPicker && (
        <GapPickerModal
          gap={gapPicker}
          employees={allEmployees}
          weekSchedule={schedule ? schedule[gapPicker.weekId] : null}
          onClose={() => setGapPicker(null)}
          onPick={(empId) => fillGapManually(gapPicker, empId)}
        />
      )}

      {/* Schedule grid — Front Desk uses a day-by-shift calendar; others keep the employee grid */}
      {activeWeekSched && activeTeam === 'Front Desk' && (
        <FrontDeskCalendar
          weekSchedule={activeWeekSched}
          employees={allEmployees}
          dailyFd={dailyFd}
          gaps={gaps.filter((g) => g.team === 'Front Desk' && g.weekId === activeWeek)}
          onGapClick={(g) => setGapPicker(g)}
        />
      )}

      {activeWeekSched && activeTeam !== 'Front Desk' && (
        <div className="overflow-x-auto rounded-2xl" style={{ border: '1px solid #dddddd', background: '#ffffff' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: '#f7f7f7', borderBottom: '1px solid #dddddd' }}>
                <th className="text-left py-3 px-4 text-xs font-bold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>Employee</th>
                {DAYS.map((d) => (
                  <th key={d} className="py-3 px-3 text-xs font-bold uppercase tracking-wide" style={{ color: '#6a6a6a', minWidth: 90 }}>{d}</th>
                ))}
                <th className="py-3 px-3 text-right text-xs font-bold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>Hrs</th>
              </tr>
            </thead>
            <tbody>
              {teamEmployees.map((emp, i) => {
                const empHours = DAYS.reduce((sum, d) => {
                  const cell = activeWeekSched[d].find((c) => c.employeeId === emp.id);
                  return sum + (cell ? SHIFT_META[cell.shift].hours : 0);
                }, 0);
                return (
                  <tr key={emp.id} style={{ borderBottom: i < teamEmployees.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                    <td className="py-2 px-4">
                      <Link href={`/web/rishab/employee/${emp.id}`} className="flex items-center gap-2 hover:underline">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ background: '#f7f7f7', color: '#222' }}>
                          {emp.initials}
                        </div>
                        <div>
                          <p className="text-sm font-medium" style={{ color: '#222' }}>{emp.name}</p>
                          <p className="text-[10px]" style={{ color: '#929292' }}>{emp.role}</p>
                        </div>
                      </Link>
                    </td>
                    {DAYS.map((day) => {
                      const cell = activeWeekSched[day].find((c) => c.employeeId === emp.id);
                      if (!cell) {
                        const avail = emp.availability[day].filter((s) => s !== 'OFF').length > 0;
                        return (
                          <td key={day} className="py-2 px-2 text-center">
                            <span className="text-[10px]" style={{ color: avail ? '#c1c1c1' : '#eeeeee' }}>
                              {avail ? '—' : 'off'}
                            </span>
                          </td>
                        );
                      }
                      const meta = SHIFT_META[cell.shift];
                      return (
                        <td key={day} className="py-2 px-2">
                          <div
                            className="rounded-lg py-1.5 px-2 text-center relative"
                            style={{ background: meta.bg, border: `1px solid ${meta.color}40` }}
                          >
                            <p className="text-[10px] font-bold" style={{ color: meta.color }}>{cell.shift}</p>
                            <p className="text-[9px]" style={{ color: '#6a6a6a' }}>{fmt12(meta.start)}</p>
                            {cell.pinned && (
                              <Lock className="w-2.5 h-2.5 absolute top-1 right-1" style={{ color: '#b45309' }} />
                            )}
                            {!cell.pinned && cell.agmCover && (
                              <Crown className="w-2.5 h-2.5 absolute top-1 right-1" style={{ color: '#9333ea' }} />
                            )}
                            {!cell.pinned && !cell.agmCover && cell.preferredMatch && (
                              <Star className="w-2.5 h-2.5 absolute top-1 right-1" style={{ color: '#b45309' }} />
                            )}
                          </div>
                        </td>
                      );
                    })}
                    <td className="py-2 px-3 text-right">
                      <p className="text-sm font-bold" style={{ color: empHours > emp.maxHoursWeek ? '#b91c1c' : empHours === 0 ? '#929292' : '#222' }}>
                        {empHours}
                      </p>
                      <p className="text-[10px]" style={{ color: '#929292' }}>of {emp.maxHoursWeek}</p>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="px-4 py-2 flex items-center justify-end gap-4 text-[11px]" style={{ background: '#fafafa', borderTop: '1px solid #f0f0f0', color: '#6a6a6a' }}>
            <span className="inline-flex items-center gap-1"><Lock className="w-3 h-3" style={{ color: '#b45309' }} /> Pinned by manager</span>
            <span className="inline-flex items-center gap-1"><Star className="w-3 h-3" style={{ color: '#b45309' }} /> Preferred slot honored</span>
            <span className="inline-flex items-center gap-1"><Crown className="w-3 h-3" style={{ color: '#9333ea' }} /> AGM cover</span>
          </div>
        </div>
      )}

      {/* Per-employee scheduled shifts (active team · active week) */}
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wide mb-3" style={{ color: '#6a6a6a' }}>
          {activeTeam} — Scheduled shifts · {WEEKS.find((w) => w.id === activeWeek)!.label}
        </h2>
        <div className="overflow-x-auto rounded-2xl" style={{ border: '1px solid #dddddd', background: '#ffffff' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: '#f7f7f7', borderBottom: '1px solid #dddddd' }}>
                <th className="text-left py-3 px-4 text-xs font-bold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>Employee</th>
                {DAYS.map((d) => <th key={d} className="py-3 px-2 text-xs font-bold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>{d}</th>)}
                <th className="py-3 px-3 text-right text-xs font-bold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>Hrs / Max</th>
              </tr>
            </thead>
            <tbody>
              {teamEmployees.map((emp, i) => {
                const empHours = activeWeekSched
                  ? DAYS.reduce((sum, d) => {
                      const cell = activeWeekSched[d].find((c) => c.employeeId === emp.id);
                      return sum + (cell ? SHIFT_META[cell.shift].hours : 0);
                    }, 0)
                  : 0;
                return (
                  <tr key={emp.id} style={{ borderBottom: i < teamEmployees.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                    <td className="py-2 px-4">
                      <Link href={`/web/rishab/employee/${emp.id}`} className="flex items-center gap-2 hover:underline">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ background: '#f7f7f7', color: '#222' }}>
                          {emp.initials}
                        </div>
                        <div>
                          <p className="text-sm font-medium" style={{ color: '#222' }}>{emp.name}</p>
                          <p className="text-[10px]" style={{ color: '#929292' }}>{emp.role}</p>
                        </div>
                      </Link>
                    </td>
                    {DAYS.map((day) => {
                      const cell = activeWeekSched?.[day].find((c) => c.employeeId === emp.id);
                      if (!cell) {
                        return (
                          <td key={day} className="py-2 px-2 text-center">
                            <span className="text-[10px]" style={{ color: '#c1c1c1' }}>off</span>
                          </td>
                        );
                      }
                      const meta = SHIFT_META[cell.shift];
                      return (
                        <td key={day} className="py-2 px-2 text-center">
                          <span
                            className="text-[10px] font-bold px-1.5 py-0.5 rounded inline-flex items-center gap-0.5"
                            style={{ background: meta.bg, color: meta.color, border: `1px solid ${meta.color}40` }}
                            title={`${fmt12(meta.start)}–${fmt12(meta.end)}`}
                          >
                            {cell.pinned && <Lock className="w-2 h-2" />}
                            {!cell.pinned && cell.agmCover && <Crown className="w-2 h-2" />}
                            {!cell.pinned && !cell.agmCover && cell.preferredMatch && <Star className="w-2 h-2" />}
                            {cell.shift}
                          </span>
                        </td>
                      );
                    })}
                    <td className="py-2 px-3 text-right text-sm font-semibold" style={{ color: empHours > emp.maxHoursWeek ? '#b91c1c' : empHours === 0 ? '#929292' : '#222' }}>
                      {empHours} <span className="text-[10px] font-normal" style={{ color: '#929292' }}>/ {emp.maxHoursWeek}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function FrontDeskCalendar({
  weekSchedule, employees, dailyFd, gaps, onGapClick,
}: {
  weekSchedule: WeekSchedule;
  employees: Employee[];
  dailyFd: Record<DayCode, FdDay>;
  gaps: Gap[];
  onGapClick: (g: Gap) => void;
}) {
  const calDays: DayCode[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const fdShifts: ShiftCode[] = ['AM', 'PM', 'NA'];
  const empById = (id: string) => employees.find((e) => e.id === id);
  const gapFor = (day: DayCode, shift: ShiftCode) =>
    gaps.find((g) => g.day === day && g.shift === shift);

  return (
    <div className="overflow-x-auto rounded-2xl" style={{ border: '1px solid #dddddd', background: '#ffffff' }}>
      <table className="w-full text-sm">
        <thead>
          <tr style={{ background: '#f7f7f7', borderBottom: '1px solid #dddddd' }}>
            <th className="text-left py-3 px-4 text-xs font-bold uppercase tracking-wide" style={{ color: '#6a6a6a', minWidth: 80 }}>Day</th>
            {fdShifts.map((s) => (
              <th key={s} className="py-3 px-3 text-xs font-bold uppercase tracking-wide text-left" style={{ color: SHIFT_META[s].color, minWidth: 200 }}>
                {s} · {fmt12(SHIFT_META[s].start)}–{fmt12(SHIFT_META[s].end)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {calDays.map((day, i) => (
            <tr key={day} style={{ borderBottom: i < calDays.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
              <td className="py-3 px-4 align-top">
                <p className="text-sm font-bold" style={{ color: '#222' }}>{day}</p>
                <p className="text-[10px]" style={{ color: '#929292' }}>
                  target {dailyFd[day].AM}/{dailyFd[day].PM}/{dailyFd[day].NA}
                </p>
              </td>
              {fdShifts.map((shift) => {
                const cells = weekSchedule[day].filter((c) => c.shift === shift);
                const gap = gapFor(day, shift);
                const meta = SHIFT_META[shift];
                return (
                  <td key={shift} className="py-2 px-2 align-top">
                    <div className="flex flex-col gap-1.5">
                      {cells.map((cell, idx) => {
                        const emp = empById(cell.employeeId);
                        if (!emp) return null;
                        return (
                          <Link
                            key={`${cell.employeeId}-${idx}`}
                            href={`/web/rishab/employee/${emp.id}`}
                            className="flex items-center gap-2 rounded-lg px-2 py-1.5 relative"
                            style={{ background: meta.bg, border: `1px solid ${meta.color}40` }}
                          >
                            <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0" style={{ background: '#ffffff', color: '#222' }}>
                              {emp.initials}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[12px] font-semibold truncate" style={{ color: '#222' }}>{emp.name}</p>
                              <p className="text-[10px] truncate" style={{ color: '#6a6a6a' }}>{emp.role}</p>
                            </div>
                            {cell.pinned && <Lock className="w-3 h-3 flex-shrink-0" style={{ color: '#b45309' }} />}
                            {!cell.pinned && cell.agmCover && <Crown className="w-3 h-3 flex-shrink-0" style={{ color: '#9333ea' }} />}
                            {!cell.pinned && !cell.agmCover && cell.preferredMatch && <Star className="w-3 h-3 flex-shrink-0" style={{ color: '#b45309' }} />}
                          </Link>
                        );
                      })}
                      {gap && Array.from({ length: gap.short }).map((_, idx) => (
                        <button
                          key={`gap-${idx}`}
                          onClick={() => onGapClick(gap)}
                          className="flex items-center gap-2 rounded-lg px-2 py-1.5 w-full"
                          style={{ background: '#fef2f2', border: '1px dashed #fca5a5' }}
                        >
                          <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: '#ffffff', border: '1px dashed #fca5a5' }}>
                            <UserPlus className="w-3 h-3" style={{ color: '#b91c1c' }} />
                          </div>
                          <div className="flex-1 min-w-0 text-left">
                            <p className="text-[12px] font-semibold" style={{ color: '#b91c1c' }}>Add person</p>
                            <p className="text-[10px]" style={{ color: '#7f1d1d' }}>open slot</p>
                          </div>
                        </button>
                      ))}
                      {cells.length === 0 && !gap && (
                        <div className="text-[10px] italic py-2 px-2" style={{ color: '#c1c1c1' }}>—</div>
                      )}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="px-4 py-2 flex items-center justify-end gap-4 text-[11px]" style={{ background: '#fafafa', borderTop: '1px solid #f0f0f0', color: '#6a6a6a' }}>
        <span className="inline-flex items-center gap-1"><Lock className="w-3 h-3" style={{ color: '#b45309' }} /> Pinned</span>
        <span className="inline-flex items-center gap-1"><Star className="w-3 h-3" style={{ color: '#b45309' }} /> Preferred</span>
        <span className="inline-flex items-center gap-1"><Crown className="w-3 h-3" style={{ color: '#9333ea' }} /> AGM cover</span>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, danger }: { label: string; value: string; sub: string; danger?: boolean }) {
  return (
    <div className="rounded-2xl p-4" style={{ background: '#ffffff', border: '1px solid #dddddd' }}>
      <p className="text-[10px] uppercase tracking-wide font-semibold" style={{ color: '#929292' }}>{label}</p>
      <p className="text-xl font-bold mt-0.5" style={{ color: danger ? '#b91c1c' : '#222' }}>{value}</p>
      <p className="text-[11px] mt-0.5" style={{ color: '#929292' }}>{sub}</p>
    </div>
  );
}

function GapPickerModal({
  gap, employees, weekSchedule, onClose, onPick,
}: {
  gap: Gap;
  employees: Employee[];
  weekSchedule: WeekSchedule | null;
  onClose: () => void;
  onPick: (empId: string) => void;
}) {
  const weekLabel = gap.weekId === 'w1' ? 'Week 1' : 'Week 2';
  const alreadyWorkingThatDay = new Set(
    (weekSchedule?.[gap.day] ?? []).map((c) => c.employeeId),
  );

  type Bucket = 'preferred' | 'available' | 'team' | 'cross';
  const rows = employees
    .filter((e) => e.status === 'active')
    .map((e) => {
      const conflict = alreadyWorkingThatDay.has(e.id);
      const prefers = Boolean(e.preferences?.[gap.day]?.includes(gap.shift));
      const available = e.availability[gap.day].includes(gap.shift);
      const sameTeam = e.team === gap.team;
      let bucket: Bucket;
      if (prefers) bucket = 'preferred';
      else if (available) bucket = 'available';
      else if (sameTeam) bucket = 'team';
      else bucket = 'cross';
      return { emp: e, bucket, prefers, available, sameTeam, conflict };
    })
    .sort((a, b) => {
      const order: Record<Bucket, number> = { preferred: 0, available: 1, team: 2, cross: 3 };
      if (order[a.bucket] !== order[b.bucket]) return order[a.bucket] - order[b.bucket];
      if (a.conflict !== b.conflict) return a.conflict ? 1 : -1;
      return b.emp.performanceScore - a.emp.performanceScore;
    });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.4)' }}
      onClick={onClose}
    >
      <div
        className="rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col"
        style={{ background: '#ffffff', border: '1px solid #dddddd' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5" style={{ borderBottom: '1px solid #f0f0f0' }}>
          <div>
            <p className="text-xs font-bold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>Fill gap</p>
            <p className="text-lg font-bold" style={{ color: '#222' }}>
              {weekLabel} · {gap.day} · {gap.shift} · {gap.team}
            </p>
            <p className="text-xs mt-0.5" style={{ color: '#929292' }}>
              {fmt12(SHIFT_META[gap.shift].start)}–{fmt12(SHIFT_META[gap.shift].end)} · {SHIFT_META[gap.shift].hours}h
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: '#f7f7f7', color: '#6a6a6a' }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 p-3">
          <ul className="flex flex-col gap-1.5">
            {rows.map(({ emp, bucket, prefers, available, sameTeam, conflict }) => {
              const badgeColor =
                bucket === 'preferred' ? { bg: '#fef3c7', fg: '#b45309', label: 'Preferred' } :
                bucket === 'available' ? { bg: '#ecfdf5', fg: '#047857', label: 'Available' } :
                bucket === 'team' ? { bg: '#f0f0f0', fg: '#6a6a6a', label: 'Same team · unavailable' } :
                { bg: '#fef2f2', fg: '#b91c1c', label: 'Cross-team' };
              return (
                <li
                  key={emp.id}
                  className="flex items-center gap-3 rounded-xl px-3 py-2"
                  style={{
                    background: conflict ? '#fafafa' : '#ffffff',
                    border: '1px solid #f0f0f0',
                    opacity: conflict ? 0.55 : 1,
                  }}
                >
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0" style={{ background: '#f7f7f7', color: '#222' }}>
                    {emp.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold truncate" style={{ color: '#222' }}>{emp.name}</p>
                      {prefers && <Star className="w-3 h-3" style={{ color: '#b45309' }} />}
                    </div>
                    <p className="text-[11px] truncate" style={{ color: '#929292' }}>
                      {emp.role} · {emp.team} · max {emp.maxHoursWeek}h/wk
                    </p>
                  </div>
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                    style={{ background: badgeColor.bg, color: badgeColor.fg }}
                  >
                    {badgeColor.label}
                  </span>
                  <button
                    onClick={() => onPick(emp.id)}
                    disabled={conflict}
                    className="h-8 px-3 rounded-lg text-xs font-semibold flex-shrink-0"
                    style={{
                      background: conflict ? '#f0f0f0' : '#ff385c',
                      color: conflict ? '#929292' : '#ffffff',
                      cursor: conflict ? 'not-allowed' : 'pointer',
                    }}
                    title={conflict ? 'Already scheduled that day' : ''}
                  >
                    {conflict ? 'Busy' : 'Assign'}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
