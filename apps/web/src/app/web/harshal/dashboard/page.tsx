'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import {
  RED_FLAGS, GM_ROSTER, computeHotelScore, computeRegionalScore, REGIONAL_ROSTER,
  formatCurrency, formatPct, formatVariance,
} from '@hos/shared';
import { KpiCard } from '@/components/common/KpiCard';
import { RedFlagsPanel } from '@/components/common/RedFlagsPanel';
import { HealthBadge } from '@/components/common/HealthBadge';
import { csatTier } from '@/lib/csat';
import { useScopedData } from '@/lib/use-scoped-data';

export default function HarshalDashboard() {
  const {
    hotels, hotelIdSet, scopeLabel, scopeSub, period,
    revenueRows, labourRows, dailyRows, isSingleHotel, selection,
  } = useScopedData();

  // Aggregates
  const totalRooms = hotels.reduce((s, h) => s + h.rooms, 0);
  const totalRoomCapacity = totalRooms * period.days;
  const roomsSold = dailyRows.reduce((s, d) => s + d.roomsSold, 0);
  const roomsOoo = Math.max(0, Math.round(dailyRows.reduce((s, d) => s + d.roomsOoo, 0) * Math.min(period.multiplier, 2)));
  const occupancyPct = totalRoomCapacity > 0 ? (roomsSold / totalRoomCapacity) * 100 : 0;
  const totalRevenue = revenueRows.reduce((s, r) => s + r.totalRevenue, 0);
  const totalScheduled = labourRows.reduce((s, l) => s + l.scheduledHours, 0);
  const totalClocked = labourRows.reduce((s, l) => s + l.clockedHours, 0);
  const totalPayroll = labourRows.reduce((s, l) => s + l.payrollCost, 0);
  const labourVariance = totalClocked - totalScheduled;
  const payrollPct = totalRevenue > 0 ? (totalPayroll / totalRevenue) * 100 : 0;
  const avgCsat = dailyRows.length > 0
    ? dailyRows.reduce((s, d) => s + d.avgCustomerRating, 0) / dailyRows.length
    : 0;

  // Per-hotel rows (using filtered data)
  const rows = hotels.map((hotel) => {
    const rev = revenueRows.find((r) => r.hotelId === hotel.id)!;
    const lab = labourRows.find((l) => l.hotelId === hotel.id)!;
    const dm = dailyRows.find((d) => d.hotelId === hotel.id)!;
    const gm = GM_ROSTER.find((g) => g.hotelId === hotel.id);
    const score = computeHotelScore(hotel.id);
    const hotelPayrollPct = rev && rev.totalRevenue > 0 ? (lab.payrollCost / rev.totalRevenue) * 100 : 0;
    return { hotel, rev, lab, dm, gm, score, hotelPayrollPct };
  }).sort((a, b) => a.score.composite - b.score.composite);

  // Weakest 2 hotels — only shown in multi-hotel scopes
  const weakest = hotels.length > 1 ? rows.slice(0, 2) : [];

  // Red flags filtered to scope
  const regionalFlags = RED_FLAGS.filter((f) => hotelIdSet.has(f.hotelId));

  // Regional score — use viewer's region unless viewing a different regional specifically
  const regionalIdForScore =
    selection.kind === 'regional' ? selection.regionalId : 'harshal';
  const regionalScore = computeRegionalScore(
    REGIONAL_ROSTER.find((r) => r.id === regionalIdForScore)?.hotelIds ?? hotels.map((h) => h.id),
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <div>
        <div className="flex items-baseline gap-3 flex-wrap">
          <h1 className="text-xl font-bold" style={{ color: '#222222' }}>
            {scopeLabel} Dashboard
          </h1>
          <span className="text-sm" style={{ color: '#6a6a6a' }}>
            {hotels.length} hotel{hotels.length === 1 ? '' : 's'} · Harshal Patel
          </span>
        </div>
        <p className="text-sm mt-0.5" style={{ color: '#929292' }}>{scopeSub}</p>
      </div>

      {/* Row 1 — 4 large KPIs */}
      <div className="grid grid-cols-4 gap-4">
        <KpiCard
          label="Occupancy"
          value={formatPct(occupancyPct, 1)}
          subtext={`${roomsSold.toLocaleString()} of ${totalRoomCapacity.toLocaleString()} room-nights sold`}
          size="large"
        />
        <KpiCard
          label="Total Revenue"
          value={formatCurrency(totalRevenue, true)}
          subtext={isSingleHotel ? 'this property' : `Across ${hotels.length} hotels`}
          size="large"
        />
        <KpiCard
          label="Rooms Out of Order"
          value={roomsOoo.toString()}
          subtext={totalRooms > 0 ? `${formatPct((roomsOoo / Math.max(totalRooms, 1)) * 100, 1)} of portfolio` : '—'}
          alert={roomsOoo > 3}
          size="large"
        />
        <KpiCard
          label="Regional Score"
          value={`${regionalScore.composite}`}
          subtext={`${regionalScore.trendDirection === 'up' ? '↗' : regionalScore.trendDirection === 'down' ? '↘' : '→'} ${formatVariance(regionalScore.trendDelta)} vs last period`}
          size="large"
        />
      </div>

      {/* Row 2 — 5 medium KPIs */}
      <div className="grid grid-cols-5 gap-4">
        <KpiCard
          label="Hours Clocked / Sched"
          value={`${totalClocked.toLocaleString()} / ${totalScheduled.toLocaleString()}`}
          subtext={period.label}
          size="medium"
        />
        <KpiCard
          label="Labour Variance"
          value={formatVariance(labourVariance) + ' hrs'}
          subtext="vs scheduled"
          trend={labourVariance > 0 ? 'down' : 'up'}
          alert={labourVariance > Math.max(50, totalScheduled * 0.04)}
          size="medium"
        />
        <KpiCard
          label="Payroll %"
          value={formatPct(payrollPct, 1)}
          subtext="of revenue"
          alert={payrollPct > 28}
          size="medium"
        />
        <KpiCard
          label="Total Payroll"
          value={formatCurrency(totalPayroll, true)}
          subtext={`${period.label} labour cost`}
          size="medium"
        />
        {(() => {
          const t = csatTier(avgCsat);
          return (
            <KpiCard
              label="Customer Satisfaction"
              value={`${avgCsat.toFixed(1)} / 5.0`}
              subtext={`${t.label} · ${isSingleHotel ? 'this property' : `across ${hotels.length} hotels`}`}
              alert={t.alert}
              size="medium"
            />
          );
        })()}
      </div>

      {/* Weakest hotels call-out — hidden for single-hotel scope */}
      {weakest.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          {weakest.map((row) => (
            <Link
              key={row.hotel.id}
              href={`/web/harshal/hotel/${row.hotel.id}`}
              className="bg-white rounded-2xl p-5 transition-all hover:shadow-md block"
              style={{ border: '1px solid #fca5a5', boxShadow: 'rgba(220,38,38,0.08) 0 4px 10px 0' }}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide" style={{ color: '#b91c1c' }}>
                    Needs attention · score {row.score.composite}
                  </p>
                  <p className="text-base font-semibold mt-1" style={{ color: '#222' }}>{row.hotel.shortName}</p>
                  {row.gm && (
                    <p className="text-xs mt-0.5" style={{ color: '#6a6a6a' }}>GM: {row.gm.name}</p>
                  )}
                </div>
                <HealthBadge health={row.rev.health} showLabel />
              </div>
              <div className="grid grid-cols-4 gap-2 mt-3">
                <div>
                  <p className="text-[10px] font-bold uppercase" style={{ color: '#929292' }}>Occ</p>
                  <p className="text-sm font-semibold" style={{ color: '#222' }}>{formatPct(row.rev.occupancyPct, 0)}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase" style={{ color: '#929292' }}>Payroll %</p>
                  <p className="text-sm font-semibold" style={{ color: row.hotelPayrollPct > 28 ? '#b91c1c' : '#222' }}>
                    {formatPct(row.hotelPayrollPct, 1)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase" style={{ color: '#929292' }}>Var</p>
                  <p className="text-sm font-semibold" style={{ color: row.lab.variance > 0 ? '#b91c1c' : '#15803d' }}>
                    {formatVariance(row.lab.variance)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase" style={{ color: '#929292' }}>OOO</p>
                  <p className="text-sm font-semibold" style={{ color: row.dm.roomsOoo > 0 ? '#b91c1c' : '#222' }}>{row.dm.roomsOoo}</p>
                </div>
              </div>
              <div className="flex items-center justify-end gap-1 mt-3 text-xs font-semibold" style={{ color: '#b91c1c' }}>
                Drill in
                <ChevronRight className="w-3 h-3" />
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Per-hotel comparison table — hidden for single-hotel scope */}
      {hotels.length > 1 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>
              Hotel Performance — Ranked
            </h2>
            <span className="text-xs" style={{ color: '#929292' }}>
              Tap row to drill in · weakest → strongest
            </span>
          </div>
          <div className="overflow-x-auto rounded-2xl" style={{ border: '1px solid #dddddd', background: '#ffffff' }}>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr style={{ borderBottom: '1px solid #dddddd', background: '#f7f7f7' }}>
                  {['Hotel / GM', 'Rooms', 'Occ %', 'ADR', 'RevPAR', 'Revenue', 'Payroll %', 'Var hrs', 'OOO', 'Score', 'Health', ''].map((h) => (
                    <th key={h} className="text-xs font-semibold uppercase tracking-wide py-3 px-4 whitespace-nowrap" style={{ color: '#6a6a6a', textAlign: h === 'Hotel / GM' ? 'left' : 'right' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={row.hotel.id} className="cursor-pointer hover:bg-[#fafafa] transition-colors" style={{ borderBottom: i < rows.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                    <td className="py-3 px-4">
                      <p className="font-medium text-sm" style={{ color: '#222222' }}>{row.hotel.shortName}</p>
                      {row.gm && <p className="text-xs mt-0.5" style={{ color: '#929292' }}>GM · {row.gm.name}</p>}
                    </td>
                    <td className="py-3 px-4 text-right text-sm" style={{ color: '#3f3f3f' }}>{row.hotel.rooms}</td>
                    <td className="py-3 px-4 text-right text-sm font-medium" style={{ color: '#3f3f3f' }}>{formatPct(row.rev.occupancyPct, 0)}</td>
                    <td className="py-3 px-4 text-right text-sm" style={{ color: '#3f3f3f' }}>{formatCurrency(row.rev.adr)}</td>
                    <td className="py-3 px-4 text-right text-sm" style={{ color: '#3f3f3f' }}>{formatCurrency(row.rev.revPar)}</td>
                    <td className="py-3 px-4 text-right text-sm font-semibold" style={{ color: '#222222' }}>{formatCurrency(row.rev.totalRevenue, true)}</td>
                    <td className="py-3 px-4 text-right text-sm font-medium" style={{ color: row.hotelPayrollPct > 28 ? '#b91c1c' : row.hotelPayrollPct > 24 ? '#b45309' : '#15803d' }}>
                      {formatPct(row.hotelPayrollPct, 1)}
                    </td>
                    <td className="py-3 px-4 text-right text-sm font-semibold" style={{ color: row.lab.variance > 20 ? '#b91c1c' : row.lab.variance > 0 ? '#b45309' : '#15803d' }}>
                      {formatVariance(row.lab.variance)}
                    </td>
                    <td className="py-3 px-4 text-right text-sm" style={{ color: row.dm.roomsOoo > 0 ? '#b91c1c' : '#3f3f3f' }}>{row.dm.roomsOoo}</td>
                    <td className="py-3 px-4 text-right text-sm font-bold" style={{ color: row.score.composite < 65 ? '#b91c1c' : row.score.composite < 75 ? '#b45309' : '#15803d' }}>
                      {row.score.composite}
                    </td>
                    <td className="py-3 px-4"><HealthBadge health={row.rev.health} showLabel /></td>
                    <td className="py-3 px-4 text-right">
                      <Link href={`/web/harshal/hotel/${row.hotel.id}`} className="inline-flex items-center gap-0.5 text-xs font-semibold hover:underline" style={{ color: '#ff385c' }}>
                        View <ChevronRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Red Flags — pushed to the end so numbers lead the page */}
      {regionalFlags.length > 0 && <RedFlagsPanel flags={regionalFlags} title={`Red Flags — ${scopeLabel}`} />}
    </div>
  );
}
