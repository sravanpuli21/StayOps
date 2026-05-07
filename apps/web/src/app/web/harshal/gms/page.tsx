'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import {
  GM_ROSTER, computeHotelScore,
  formatCurrency, formatPct, formatVariance,
} from '@hos/shared';
import { HealthBadge } from '@/components/common/HealthBadge';
import { useScopedData } from '@/lib/use-scoped-data';

// Synthetic accountability data per persona doc ("GM accountability, execution quality, follow-through")
const COMMITMENT_DATA: Record<string, { open: number; ontrack: number; missed: number; lastContact: string; responseMinutes: number; }> = {
  BSWVE:   { open: 3, ontrack: 2, missed: 1, lastContact: '2h ago',  responseMinutes: 42 },
  GAA84:   { open: 5, ontrack: 2, missed: 2, lastContact: '1d ago',  responseMinutes: 92 },
  BQKFP:   { open: 4, ontrack: 3, missed: 0, lastContact: '4h ago',  responseMinutes: 55 },
  SGJES:   { open: 2, ontrack: 2, missed: 0, lastContact: '6h ago',  responseMinutes: 28 },
  JAXTX:   { open: 3, ontrack: 3, missed: 0, lastContact: '3h ago',  responseMinutes: 34 },
  DFWFW:   { open: 6, ontrack: 2, missed: 3, lastContact: '2d ago',  responseMinutes: 140 },
  BTRCI:   { open: 4, ontrack: 3, missed: 1, lastContact: '5h ago',  responseMinutes: 68 },
  '58090LA':{ open: 3, ontrack: 2, missed: 1, lastContact: '8h ago', responseMinutes: 75 },
};

// Deterministic fallback for hotels not in the seeded map (Gautham's 8)
function hashId(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return h;
}
function getCommitments(hotelId: string) {
  if (COMMITMENT_DATA[hotelId]) return COMMITMENT_DATA[hotelId];
  const s = hashId(hotelId);
  const open = 2 + (s % 5);
  const missed = s % 4 === 0 ? 2 : s % 3 === 0 ? 1 : 0;
  const ontrack = Math.max(0, open - missed - (s % 2));
  const responseMinutes = 30 + (s % 120);
  const hours = (s % 8) + 1;
  return { open, ontrack, missed, lastContact: `${hours}h ago`, responseMinutes };
}

export default function HarshalGMs() {
  const { hotels, scopeSub, revenueRows, labourRows, dailyRows } = useScopedData();

  const gmRows = hotels.map((hotel) => {
    const rev = revenueRows.find((r) => r.hotelId === hotel.id)!;
    const lab = labourRows.find((l) => l.hotelId === hotel.id)!;
    const dm = dailyRows.find((d) => d.hotelId === hotel.id)!;
    const gm = GM_ROSTER.find((g) => g.hotelId === hotel.id)!;
    const score = computeHotelScore(hotel.id);
    const commitments = getCommitments(hotel.id);
    const completionPct = commitments.open > 0
      ? Math.round((commitments.ontrack / commitments.open) * 100)
      : 100;
    const payrollPct = rev && rev.totalRevenue > 0 ? (lab.payrollCost / rev.totalRevenue) * 100 : 0;
    return { hotel, rev, lab, dm, gm, score, commitments, completionPct, payrollPct };
  }).filter((r) => r.gm) // only hotels with a GM in roster
    .sort((a, b) => b.score.composite - a.score.composite);

  // Top 3 aggregate stats — computed across the filtered GM set
  const avgResponse = gmRows.length > 0
    ? Math.round(gmRows.reduce((s, r) => s + r.commitments.responseMinutes, 0) / gmRows.length)
    : 0;
  const totalOpen = gmRows.reduce((s, r) => s + r.commitments.open, 0);
  const totalMissed = gmRows.reduce((s, r) => s + r.commitments.missed, 0);

  return (
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-bold" style={{ color: '#222222' }}>General Managers</h1>
        <p className="text-sm mt-0.5" style={{ color: '#929292' }}>
          {scopeSub} · {gmRows.length} general manager{gmRows.length === 1 ? '' : 's'}
        </p>
      </div>

      {/* Top row — accountability summary */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Open commitments',  value: totalOpen.toString(),                             color: '#222' },
          { label: 'Avg response time',  value: `${avgResponse}m`,                                 color: avgResponse > 60 ? '#b91c1c' : '#15803d' },
          { label: 'Missed follow-ups',  value: totalMissed.toString(),                           color: totalMissed > 4 ? '#b91c1c' : '#b45309' },
          { label: 'On-track rate',      value: totalOpen > 0 ? `${Math.round(((totalOpen - totalMissed) / totalOpen) * 100)}%` : '—', color: '#15803d' },
        ].map((k) => (
          <div
            key={k.label}
            className="bg-white rounded-2xl p-5"
            style={{ border: '1px solid #dddddd' }}
          >
            <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#929292' }}>{k.label}</p>
            <p className="text-2xl font-bold mt-1" style={{ color: k.color }}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* GM cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>
            GM Accountability — Ranked
          </h2>
          <span className="text-xs" style={{ color: '#929292' }}>
            Strongest → weakest
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {gmRows.map((row) => (
            <Link
              key={row.hotel.id}
              href={`/web/harshal/gm/${row.hotel.id}`}
              className="bg-white rounded-2xl p-5 flex flex-col gap-3 block transition-all hover:border-[#ff385c] hover:shadow-md"
              style={{ border: '1px solid #dddddd' }}
            >
              {/* Header */}
              <div className="flex items-start gap-3">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: '#f7f7f7', color: '#222', fontSize: 16, fontWeight: 700 }}
                >
                  {row.gm.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm" style={{ color: '#222' }}>{row.gm.name}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#929292' }}>
                    {row.hotel.shortName} · {row.hotel.city}, {row.hotel.state}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span
                    className="text-xl font-bold"
                    style={{ color: row.score.composite < 65 ? '#b91c1c' : row.score.composite < 75 ? '#b45309' : '#15803d' }}
                  >
                    {row.score.composite}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: '#929292' }}>
                    score
                  </span>
                </div>
              </div>

              {/* Hotel metrics */}
              <div className="grid grid-cols-4 gap-2">
                <div>
                  <p className="text-[10px] font-bold uppercase" style={{ color: '#929292' }}>Occ</p>
                  <p className="text-sm font-semibold" style={{ color: '#222' }}>{formatPct(row.rev.occupancyPct, 0)}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase" style={{ color: '#929292' }}>Revenue</p>
                  <p className="text-sm font-semibold" style={{ color: '#222' }}>{formatCurrency(row.rev.totalRevenue, true)}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase" style={{ color: '#929292' }}>Payroll %</p>
                  <p className="text-sm font-semibold" style={{ color: row.payrollPct > 28 ? '#b91c1c' : '#222' }}>
                    {formatPct(row.payrollPct, 1)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase" style={{ color: '#929292' }}>Hrs Var</p>
                  <p className="text-sm font-semibold" style={{ color: row.lab.variance > 0 ? '#b91c1c' : '#15803d' }}>
                    {formatVariance(row.lab.variance)}
                  </p>
                </div>
              </div>

              {/* Commitments row */}
              <div
                className="flex items-center gap-4 rounded-xl px-3 py-2"
                style={{ background: '#f7f7f7' }}
              >
                <div className="flex-1">
                  <div className="flex items-baseline gap-1">
                    <span className="text-sm font-semibold" style={{ color: '#222' }}>
                      {row.commitments.ontrack}/{row.commitments.open}
                    </span>
                    <span className="text-xs" style={{ color: '#6a6a6a' }}>on track</span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden mt-1" style={{ background: '#e5e5e5', width: '100%' }}>
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${row.completionPct}%`,
                        background: row.completionPct >= 75 ? '#16a34a' : row.completionPct >= 50 ? '#d97706' : '#dc2626',
                      }}
                    />
                  </div>
                </div>
                <div className="flex gap-3 text-xs" style={{ color: '#6a6a6a' }}>
                  {row.commitments.missed > 0 && (
                    <span style={{ color: '#b91c1c', fontWeight: 600 }}>
                      {row.commitments.missed} missed
                    </span>
                  )}
                  <span>
                    <span style={{ color: row.commitments.responseMinutes > 60 ? '#b91c1c' : '#15803d', fontWeight: 600 }}>
                      {row.commitments.responseMinutes}m
                    </span>
                    {' '}resp.
                  </span>
                  <span>· {row.commitments.lastContact}</span>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between">
                <HealthBadge health={row.rev.health} showLabel />
                <div className="inline-flex items-center gap-0.5 text-xs font-semibold" style={{ color: '#ff385c' }}>
                  View GM <ChevronRight className="w-3 h-3" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
