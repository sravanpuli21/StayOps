'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { Phone, Star, Clock, TrendingUp, ChevronRight } from 'lucide-react';
import { SYDNEY_HOTEL, useMaintenanceStaff } from '@/lib/sydney-data';

export default function SydneyTeamPage() {
  const team = useMaintenanceStaff();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold" style={{ color: '#222222' }}>Maintenance Team</h1>
        <p className="text-sm mt-0.5" style={{ color: '#929292' }}>
          {SYDNEY_HOTEL.shortName} · {team.length} active · Sydney + Amir cover 16 hours/day
        </p>
      </div>

      {/* Shift coverage map */}
      <div className="rounded-2xl p-5" style={{ background: '#ffffff', border: '1px solid #dddddd' }}>
        <p className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: '#929292' }}>Shift coverage · today</p>
        <div className="relative h-10 rounded-lg overflow-hidden" style={{ background: '#f7f7f7', border: '1px solid #f0f0f0' }}>
          <div className="absolute top-0 left-0 right-0 h-full flex">
            {Array.from({ length: 24 }).map((_, h) => (
              <div key={h} className="flex-1 border-l" style={{ borderColor: '#f0f0f0' }} />
            ))}
          </div>
          {/* Sydney 8:30 - 16:30 */}
          <div
            className="absolute top-1 h-4 rounded text-[10px] font-bold text-white flex items-center justify-center"
            style={{
              left: `${(8.5 / 24) * 100}%`,
              width: `${(8 / 24) * 100}%`,
              background: '#7c3aed',
            }}
          >
            Sydney · 8:30a–4:30p
          </div>
          {/* Amir 16:00 - 22:00 */}
          <div
            className="absolute bottom-1 h-4 rounded text-[10px] font-bold text-white flex items-center justify-center"
            style={{
              left: `${(16 / 24) * 100}%`,
              width: `${(6 / 24) * 100}%`,
              background: '#ff385c',
            }}
          >
            Amir · 4p–10p
          </div>
        </div>
        <div className="flex justify-between mt-1 text-[9px]" style={{ color: '#929292' }}>
          {[0, 4, 8, 12, 16, 20].map((h) => (
            <span key={h}>{h === 0 ? '12a' : h < 12 ? `${h}a` : h === 12 ? '12p' : `${h - 12}p`}</span>
          ))}
        </div>
        <p className="text-[11px] mt-2" style={{ color: '#6a6a6a' }}>
          Handover: Sydney → Amir at 4:00p · On-call overnight via Amir
        </p>
      </div>

      {/* Team cards */}
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wide mb-3" style={{ color: '#6a6a6a' }}>Active team</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {team.map((emp) => {
            const perfColor = emp.performanceScore >= 90 ? '#15803d' : emp.performanceScore >= 80 ? '#b45309' : '#b91c1c';
            return (
              <div key={emp.id} className="rounded-2xl p-4" style={{ background: '#ffffff', border: '1px solid #dddddd' }}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: '#7c3aed', color: '#ffffff' }}>
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
                  <Stat label="Perf"     value={`${emp.performanceScore}`} sub="score"   highlight={perfColor} icon={<Star className="w-3 h-3" style={{ color: perfColor }} />} />
                  <Stat label="Max"      value={`${emp.maxHoursWeek}h`}    sub="per week" />
                  <Stat label="Callouts" value={`${emp.callouts30d}`}       sub="30d"    highlight={emp.callouts30d > 2 ? '#b91c1c' : '#6a6a6a'} />
                </div>

                <div className="flex flex-col gap-1.5 mt-3 text-[11px]" style={{ color: '#6a6a6a' }}>
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
