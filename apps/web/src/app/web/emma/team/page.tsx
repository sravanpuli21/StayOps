'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { EMMA_HOTEL, EMMA_HOTEL_ID, useHkStaff, useHkCallouts, useAllHotelRooms, useQueueRooms, seedAssignments } from '@/lib/emma-data';
import { useApi } from '@/lib/use-api';
import { apiKeys } from '@/lib/swr-keys';
import { AlertTriangle, Phone, Mail, Star, Calendar, TrendingUp, ChevronRight } from 'lucide-react';

export default function EmmaTeamPage() {
  const hkStaff = useHkStaff();
  const callouts = useHkCallouts();
  const queueRooms = useQueueRooms();
  // Include all HK staff regardless of status so Emma sees the callouts
  const { data: empData } = useApi(apiKeys.employees(EMMA_HOTEL_ID));
  const allHk = useMemo(
    () => ((empData?.employees ?? []) as any[]).filter((e) => e.team === 'Housekeeping'),
    [empData],
  );

  // Seed assignments to show today's room counts
  const seeded = useMemo(
    () => (hkStaff.length > 0 && queueRooms.length > 0 ? seedAssignments(hkStaff, queueRooms) : []),
    [hkStaff, queueRooms],
  );
  const roomsPerStaff = useMemo(() => {
    const m = new Map<string, number>();
    for (const a of seeded) {
      for (const id of a.assignees) m.set(id, (m.get(id) ?? 0) + 1);
    }
    return m;
  }, [seeded]);

  const avgPerf = hkStaff.reduce((s, e: any) => s + (e.performanceScore ?? 0), 0) / (hkStaff.length || 1);
  const totalAssigned = seeded.length;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold" style={{ color: '#222222' }}>Housekeeping Team</h1>
        <p className="text-sm mt-0.5" style={{ color: '#929292' }}>
          {EMMA_HOTEL.shortName} · {hkStaff.length} active · {callouts.length} callout{callouts.length === 1 ? '' : 's'} · avg performance {Math.round(avgPerf)}
        </p>
      </div>

      {callouts.length > 0 && (
        <div className="rounded-2xl p-4 flex items-center gap-3" style={{ background: '#fef2f2', border: '1px solid #fca5a5' }}>
          <AlertTriangle className="w-4 h-4" style={{ color: '#b91c1c' }} />
          <div className="flex-1">
            <p className="text-sm font-semibold" style={{ color: '#b91c1c' }}>
              {callouts.length} staff member{callouts.length === 1 ? '' : 's'} on callout
            </p>
            <p className="text-xs" style={{ color: '#7f1d1d' }}>
              {callouts.map((c) => c.name).join(', ')} — rooms re-distributed to active team.
            </p>
          </div>
        </div>
      )}

      {/* Active staff */}
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wide mb-3" style={{ color: '#6a6a6a' }}>Active today</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {hkStaff.map((emp) => {
            const assigned = roomsPerStaff.get(emp.id) ?? 0;
            const perfColor = emp.performanceScore >= 90 ? '#15803d' : emp.performanceScore >= 80 ? '#b45309' : '#b91c1c';
            return (
              <div key={emp.id} className="rounded-2xl p-4" style={{ background: '#ffffff', border: '1px solid #dddddd' }}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: '#428bff', color: '#ffffff' }}>
                    {emp.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-semibold truncate" style={{ color: '#222' }}>{emp.name}</p>
                    <p className="text-xs truncate" style={{ color: '#929292' }}>{emp.role}</p>
                  </div>
                  <Link
                    href={`/web/rishab/employee/${emp.id}`}
                    className="inline-flex items-center h-7 px-2 rounded-md text-[11px] font-semibold"
                    style={{ background: '#f7f7f7', color: '#6a6a6a', border: '1px solid #dddddd' }}
                  >
                    Profile
                    <ChevronRight className="w-3 h-3 ml-0.5" />
                  </Link>
                </div>

                <div className="grid grid-cols-3 gap-2 py-3" style={{ borderTop: '1px solid #f0f0f0', borderBottom: '1px solid #f0f0f0' }}>
                  <Stat label="Today" value={`${assigned}`} sub="rooms" highlight={assigned > 10 ? '#b91c1c' : assigned > 0 ? '#15803d' : '#929292'} />
                  <Stat label="Perf" value={`${emp.performanceScore}`} sub="score" highlight={perfColor} icon={<Star className="w-3 h-3" style={{ color: perfColor }} />} />
                  <Stat label="Callouts" value={`${emp.callouts30d}`} sub="30d" highlight={emp.callouts30d > 2 ? '#b91c1c' : '#6a6a6a'} />
                </div>

                <div className="flex flex-col gap-1.5 mt-3 text-[11px]" style={{ color: '#6a6a6a' }}>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3 h-3" />
                    <span>Max {emp.maxHoursWeek}h/wk · ${emp.hourlyRate}/hr</span>
                  </div>
                  {emp.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3 h-3" />
                      <span>{emp.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-3 h-3" />
                    <span>Since {new Date(emp.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Callouts */}
      {callouts.length > 0 && (
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wide mb-3" style={{ color: '#6a6a6a' }}>On callout</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {callouts.map((emp) => (
              <div key={emp.id} className="rounded-2xl p-4 opacity-75" style={{ background: '#fef2f2', border: '1px solid #fca5a5' }}>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: '#fecaca', color: '#b91c1c' }}>
                    {emp.initials}
                  </div>
                  <div className="flex-1">
                    <p className="text-base font-semibold" style={{ color: '#222' }}>{emp.name}</p>
                    <p className="text-xs" style={{ color: '#b91c1c' }}>On callout · {emp.callouts30d} in last 30 days</p>
                  </div>
                </div>
                <p className="text-[11px] mt-3" style={{ color: '#7f1d1d' }}>Rooms redistributed. Contact to confirm return status.</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary band */}
      <div className="rounded-2xl p-5" style={{ background: '#fafafa', border: '1px solid #dddddd' }}>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide" style={{ color: '#929292' }}>Today at a glance</p>
            <p className="text-sm mt-0.5" style={{ color: '#222' }}>
              {totalAssigned} rooms split across {hkStaff.length} active staff · avg {Math.round(totalAssigned / (hkStaff.length || 1))} per person
            </p>
          </div>
          <Link
            href="/web/rishab/scheduling"
            className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl text-xs font-semibold"
            style={{ background: '#ffffff', color: '#222', border: '1px solid #dddddd' }}
          >
            View full schedule
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, sub, highlight, icon }: { label: string; value: string; sub: string; highlight?: string; icon?: React.ReactNode }) {
  return (
    <div className="text-center">
      <p className="text-[10px] uppercase tracking-wide font-bold" style={{ color: '#929292' }}>{label}</p>
      <p className="text-base font-bold flex items-center justify-center gap-0.5" style={{ color: highlight ?? '#222' }}>
        {icon}
        {value}
      </p>
      <p className="text-[10px]" style={{ color: '#929292' }}>{sub}</p>
    </div>
  );
}
