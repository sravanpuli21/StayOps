import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft, ChevronRight, Phone, MessageSquare, Calendar, TrendingUp, AlertCircle,
} from 'lucide-react';
import { getEmployeeById, SHIFT_META, type DayCode } from '@hos/shared';

const DAYS: DayCode[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

interface Props {
  params: Promise<{ id: string }>;
}

// Synthetic shift history (last 4 weeks) — mock data for demo
function getShiftHistory(empId: string) {
  const weeks: Array<{ week: string; hours: number; overtime: number; callouts: number }> = [
    { week: 'This week',   hours: 32, overtime: 0, callouts: 0 },
    { week: 'Last week',   hours: 38, overtime: 0, callouts: 0 },
    { week: '2 weeks ago', hours: 40, overtime: 2, callouts: 0 },
    { week: '3 weeks ago', hours: 36, overtime: 0, callouts: 1 },
  ];
  // Deterministic variation by empId hash
  let h = 0;
  for (let i = 0; i < empId.length; i++) h = (h * 31 + empId.charCodeAt(i)) >>> 0;
  return weeks.map((w, i) => ({
    ...w,
    hours: Math.max(12, w.hours - (h % 8) + i),
    overtime: (h % 3) === 0 && i === 2 ? w.overtime : 0,
  }));
}

function getActivityLog(empId: string) {
  const events: Array<{ date: string; type: 'shift' | 'callout' | 'review' | 'note'; label: string; detail?: string }> = [
    { date: 'Apr 28', type: 'shift',   label: 'Worked PM shift', detail: '3:00 PM – 11:00 PM · 8 hrs' },
    { date: 'Apr 27', type: 'shift',   label: 'Worked PM shift', detail: '3:00 PM – 11:00 PM · 8 hrs' },
    { date: 'Apr 26', type: 'shift',   label: 'Worked AM shift', detail: '7:00 AM – 3:00 PM · 8 hrs' },
    { date: 'Apr 25', type: 'review',  label: 'Performance review', detail: 'Score 88 · meets expectations. Areas to improve: guest recovery script.' },
    { date: 'Apr 20', type: 'shift',   label: 'Worked AM shift', detail: '7:00 AM – 3:00 PM · 8 hrs' },
  ];
  let h = 0;
  for (let i = 0; i < empId.length; i++) h = (h * 31 + empId.charCodeAt(i)) >>> 0;
  if (h % 4 === 0) events.splice(2, 0, { date: 'Apr 26', type: 'callout', label: 'Called out sick', detail: 'Covered by Daniel Chen' });
  return events;
}

export default async function EmployeeDetailPage({ params }: Props) {
  const { id } = await params;
  const emp = getEmployeeById(id);
  if (!emp) notFound();

  const history = getShiftHistory(emp.id);
  const log = getActivityLog(emp.id);
  const avgHours = Math.round(history.reduce((s, w) => s + w.hours, 0) / history.length);
  const totalOvertime = history.reduce((s, w) => s + w.overtime, 0);

  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm" style={{ color: '#6a6a6a' }}>
        <Link href="/web/rishab/scheduling" className="hover:underline flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" />
          Scheduling
        </Link>
        <ChevronRight className="w-3 h-3" style={{ color: '#c1c1c1' }} />
        <span style={{ color: '#222' }}>{emp.name}</span>
      </div>

      {/* Profile */}
      <div className="bg-white rounded-2xl p-6 flex items-start gap-5" style={{ border: '1px solid #dddddd' }}>
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: '#f7f7f7', color: '#222', fontSize: 22, fontWeight: 700 }}
        >
          {emp.initials}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold" style={{ color: '#222' }}>{emp.name}</h1>
            {emp.status === 'callout' && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide" style={{ background: '#fef2f2', color: '#b91c1c' }}>
                Called out
              </span>
            )}
            {emp.status === 'pto' && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide" style={{ background: '#eff6ff', color: '#1d4ed8' }}>
                PTO
              </span>
            )}
            <span
              className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
              style={{ background: '#f7f7f7', color: '#6a6a6a' }}
            >
              {emp.team}
            </span>
          </div>
          <p className="text-sm mt-0.5" style={{ color: '#6a6a6a' }}>{emp.role}</p>
          <div className="flex items-center gap-4 text-xs mt-2" style={{ color: '#929292' }}>
            <span>Started {emp.startDate}</span>
            <span>·</span>
            <span>${emp.hourlyRate}/hr</span>
            <span>·</span>
            <span>Max {emp.maxHoursWeek} hrs/wk</span>
            <span>·</span>
            <span>{emp.phone}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl transition-colors"
            style={{ background: '#f7f7f7', color: '#222', border: '1px solid #dddddd' }}
          >
            <Phone className="w-3.5 h-3.5" />
            Call
          </button>
          <button
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl transition-colors"
            style={{ background: '#ff385c', color: '#ffffff' }}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Message
          </button>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid #dddddd' }}>
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#929292' }}>Performance</p>
          <p className="text-2xl font-bold mt-1" style={{ color: emp.performanceScore < 75 ? '#b91c1c' : emp.performanceScore < 85 ? '#b45309' : '#15803d' }}>
            {emp.performanceScore}
          </p>
          <p className="text-xs mt-1" style={{ color: '#6a6a6a' }}>last reviewed Apr 25</p>
        </div>
        <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid #dddddd' }}>
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#929292' }}>This week</p>
          <p className="text-2xl font-bold mt-1" style={{ color: '#222' }}>{emp.hoursThisWeek} hrs</p>
          <p className="text-xs mt-1" style={{ color: '#6a6a6a' }}>of {emp.maxHoursWeek} max</p>
        </div>
        <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid #dddddd' }}>
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#929292' }}>4-wk avg</p>
          <p className="text-2xl font-bold mt-1" style={{ color: '#222' }}>{avgHours} hrs</p>
          <p className="text-xs mt-1" style={{ color: '#6a6a6a' }}>{totalOvertime} OT hrs total</p>
        </div>
        <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid #dddddd' }}>
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#929292' }}>Callouts (30d)</p>
          <p className="text-2xl font-bold mt-1" style={{ color: emp.callouts30d > 2 ? '#b91c1c' : emp.callouts30d > 0 ? '#b45309' : '#15803d' }}>
            {emp.callouts30d}
          </p>
          <p className="text-xs mt-1" style={{ color: '#6a6a6a' }}>
            {emp.callouts30d > 2 ? 'above team avg' : emp.callouts30d > 0 ? 'on par' : 'below team avg'}
          </p>
        </div>
      </div>

      {/* Availability */}
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wide mb-3" style={{ color: '#6a6a6a' }}>
          Availability (from portal)
        </h2>
        <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid #dddddd' }}>
          <div className="grid grid-cols-7 gap-3">
            {DAYS.map((day) => {
              const shifts = emp.availability[day];
              const off = shifts.includes('OFF') && shifts.length === 1;
              return (
                <div key={day}>
                  <p className="text-xs font-bold mb-2" style={{ color: '#6a6a6a' }}>{day}</p>
                  {off ? (
                    <div
                      className="rounded-lg py-2 px-2 text-center"
                      style={{ background: '#f7f7f7', border: '1px dashed #dddddd' }}
                    >
                      <p className="text-[10px]" style={{ color: '#929292' }}>OFF</p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1">
                      {shifts.filter((s) => s !== 'OFF').map((s) => {
                        const meta = SHIFT_META[s];
                        return (
                          <div
                            key={s}
                            className="rounded-lg py-1.5 px-2 text-center"
                            style={{ background: meta.bg, border: `1px solid ${meta.color}40` }}
                          >
                            <p className="text-[10px] font-bold" style={{ color: meta.color }}>{s}</p>
                            <p className="text-[9px]" style={{ color: '#6a6a6a' }}>{meta.start}</p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {emp.preferredShift && (
            <p className="text-xs mt-4 pt-4" style={{ color: '#6a6a6a', borderTop: '1px solid #f0f0f0' }}>
              Preferred shift: <span className="font-semibold" style={{ color: '#222' }}>{SHIFT_META[emp.preferredShift].label}</span>
            </p>
          )}
        </div>
      </div>

      {/* 4-week history */}
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wide mb-3" style={{ color: '#6a6a6a' }}>
          4-Week History
        </h2>
        <div className="bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid #dddddd' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: '#f7f7f7', borderBottom: '1px solid #dddddd' }}>
                <th className="text-left py-3 px-4 text-xs font-bold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>Week</th>
                <th className="text-right py-3 px-4 text-xs font-bold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>Hours</th>
                <th className="text-right py-3 px-4 text-xs font-bold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>Overtime</th>
                <th className="text-right py-3 px-4 text-xs font-bold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>Callouts</th>
              </tr>
            </thead>
            <tbody>
              {history.map((w, i) => (
                <tr key={w.week} style={{ borderBottom: i < history.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                  <td className="py-3 px-4 font-medium" style={{ color: '#222' }}>{w.week}</td>
                  <td className="py-3 px-4 text-right" style={{ color: '#222' }}>{w.hours}</td>
                  <td className="py-3 px-4 text-right" style={{ color: w.overtime > 0 ? '#b45309' : '#929292' }}>
                    {w.overtime > 0 ? `+${w.overtime}` : '—'}
                  </td>
                  <td className="py-3 px-4 text-right" style={{ color: w.callouts > 0 ? '#b91c1c' : '#929292' }}>
                    {w.callouts > 0 ? w.callouts : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Activity log */}
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wide mb-3" style={{ color: '#6a6a6a' }}>
          Recent Activity
        </h2>
        <div className="bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid #dddddd' }}>
          {log.map((e, i) => {
            const Icon = e.type === 'shift' ? Calendar : e.type === 'callout' ? AlertCircle : e.type === 'review' ? TrendingUp : MessageSquare;
            const color = e.type === 'callout' ? '#b91c1c' : e.type === 'review' ? '#15803d' : '#6a6a6a';
            const bg = e.type === 'callout' ? '#fef2f2' : e.type === 'review' ? '#f0fdf4' : '#f7f7f7';
            return (
              <div
                key={i}
                className="flex items-start gap-3 p-4"
                style={{ borderBottom: i < log.length - 1 ? '1px solid #f0f0f0' : 'none' }}
              >
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: bg }}>
                  <Icon className="w-3.5 h-3.5" style={{ color }} />
                </div>
                <div className="flex-1">
                  <div className="flex items-baseline justify-between">
                    <p className="text-sm font-semibold" style={{ color: '#222' }}>{e.label}</p>
                    <span className="text-xs" style={{ color: '#929292' }}>{e.date}</span>
                  </div>
                  {e.detail && <p className="text-xs mt-0.5" style={{ color: '#6a6a6a' }}>{e.detail}</p>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
