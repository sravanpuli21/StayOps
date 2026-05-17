'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import {
  GM_ROSTER, computeHotelScore, computeRegionalScore, REGIONAL_ROSTER,
  getStaleDirtyRoomsForHotel,
  formatCurrency, formatPct, formatVariance,
} from '@hos/shared';
import { useRedFlags } from '@/lib/ai-data';
import { KpiCard } from '@/components/common/KpiCard';
import { RedFlagsPanel } from '@/components/common/RedFlagsPanel';
import { HealthBadge } from '@/components/common/HealthBadge';
import { DashboardSkeleton } from '@/components/common/Skeleton';
import { ErrorBanner } from '@/components/common/ErrorBanner';
import { EmptyState } from '@/components/common/EmptyState';
import { csatTier } from '@/lib/csat';
import { useScopedData } from '@/lib/use-scoped-data';
import { KpiDrawer } from './_components/KpiDrawer';
import {
  OccupancyDetail, RevenueDetail, RoomsOooDetail, StaleDirtyDetail,
  RegionalScoreDetail, HoursDetail, PayrollDetail, CsatDetail,
} from './_components/KpiDetails';

type KpiKey =
  | 'occupancy' | 'revenue' | 'ooo' | 'stale' | 'score'
  | 'hours' | 'variance' | 'payroll-pct' | 'payroll-total' | 'csat'
  | null;

export default function HarshalDashboard() {
  const {
    hotels, hotelIdSet, scopeLabel, scopeSub, period,
    revenueRows, labourRows, dailyRows, isSingleHotel, selection, loading, error,
  } = useScopedData();

  const [openKpi, setOpenKpi] = useState<KpiKey>(null);

  // All hooks must be called unconditionally — React's rules-of-hooks. We
  // filter to scope further down (after `hotelIdSet` is known).
  const allRedFlags = useRedFlags();

  if (error) return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold" style={{ color: '#222222' }}>{scopeLabel} Dashboard</h1>
        <p className="text-sm mt-0.5" style={{ color: '#929292' }}>{scopeSub}</p>
      </div>
      <ErrorBanner error={error} />
    </div>
  );
  if (loading) return <DashboardSkeleton kpiCount={5} large />;

  // Fresh deploy / post-wipe: show empty state instead of zero-value KPIs.
  if (revenueRows.length === 0 && labourRows.length === 0 && dailyRows.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-xl font-bold" style={{ color: '#222222' }}>{scopeLabel} Dashboard</h1>
          <p className="text-sm mt-0.5" style={{ color: '#929292' }}>{scopeSub}</p>
        </div>
        <EmptyState
          icon="inbox"
          title="No regional data yet"
          message="Your 8-hotel region populates as Hilton OnQ exports arrive at hos.stayops@gmail.com. Drop a final-audit CSV manually to verify the pipeline before email is wired."
          ctaHref="/web/admin/uploads"
          ctaLabel="Upload CSV"
        />
      </div>
    );
  }

  const scoped = {
    hotels, revenueRows, labourRows, dailyRows,
    periodDays: period.days,
  };

  // Aggregates
  const totalRooms = hotels.reduce((s, h) => s + h.rooms, 0);
  const totalRoomCapacity = totalRooms * period.days;
  const roomsSold = dailyRows.reduce((s, d) => s + d.roomsSold, 0);
  const roomsOoo = dailyRows.reduce((s, d) => s + d.roomsOoo, 0);
  const staleDirty = hotels.reduce((s, h) => s + getStaleDirtyRoomsForHotel(h.id).length, 0);
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

  // Per-hotel rows — filter to hotels that have data in ALL three queries.
  // A hotel that's only reported revenue but not labour shouldn't render with
  // crash-prone undefined fields. Each query returns rows independently; this
  // intersection guarantees `rev`/`lab`/`dm` are defined for every entry.
  const rows = hotels.flatMap((hotel) => {
    const rev = revenueRows.find((r) => r.hotelId === hotel.id);
    const lab = labourRows.find((l) => l.hotelId === hotel.id);
    const dm  = dailyRows.find((d) => d.hotelId === hotel.id);
    if (!rev || !lab || !dm) return [];
    const gm = GM_ROSTER.find((g) => g.hotelId === hotel.id);
    const score = computeHotelScore(hotel.id);
    const hotelPayrollPct = rev.totalRevenue > 0 ? (lab.payrollCost / rev.totalRevenue) * 100 : 0;
    return [{ hotel, rev, lab, dm, gm, score, hotelPayrollPct }];
  }).sort((a, b) => a.score.composite - b.score.composite);

  // Weakest 2 hotels — only shown in multi-hotel scopes
  const weakest = hotels.length > 1 ? rows.slice(0, 2) : [];

  // Red flags filtered to scope (hook was called at the top of the component)
  const regionalFlags = allRedFlags.filter((f) => hotelIdSet.has(f.hotelId));

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

      {/* Row 1 — 5 large KPIs — all clickable */}
      <div className="grid grid-cols-5 gap-4">
        <KpiButton onClick={() => setOpenKpi('occupancy')}>
          <KpiCard
            className="h-full"
            label="Occupancy"
            value={formatPct(occupancyPct, 1)}
            subtext={`${roomsSold.toLocaleString()} of ${totalRoomCapacity.toLocaleString()} room-nights sold`}
            size="medium"
          />
        </KpiButton>
        <KpiButton onClick={() => setOpenKpi('revenue')}>
          <KpiCard
            className="h-full"
            label="Total Revenue"
            value={formatCurrency(totalRevenue, true)}
            subtext={isSingleHotel ? 'this property' : `Across ${hotels.length} hotels`}
            size="medium"
          />
        </KpiButton>
        <KpiButton onClick={() => setOpenKpi('ooo')}>
          <KpiCard
            className="h-full"
            label="Rooms Out of Order"
            value={roomsOoo.toString()}
            subtext={totalRooms > 0 ? `${formatPct((roomsOoo / Math.max(totalRooms, 1)) * 100, 1)} of portfolio` : '—'}
            alert={roomsOoo > 3}
            size="medium"
          />
        </KpiButton>
        <KpiButton onClick={() => setOpenKpi('stale')}>
          <KpiCard
            className="h-full"
            label="Stale Dirty"
            value={staleDirty.toString()}
            subtext={hotels.length > 1
              ? `${hotels.length} hotel${hotels.length === 1 ? '' : 's'} · dirty 2+ days, no open ticket`
              : 'dirty 2+ days · no open ticket'}
            alert={staleDirty > hotels.length * 3}
            size="medium"
          />
        </KpiButton>
        <KpiButton onClick={() => setOpenKpi('score')}>
          <KpiCard
            className="h-full"
            label="Regional Score"
            value={`${regionalScore.composite}`}
            subtext={`${regionalScore.trendDirection === 'up' ? '↗' : regionalScore.trendDirection === 'down' ? '↘' : '→'} ${formatVariance(regionalScore.trendDelta)} vs last period`}
            size="medium"
          />
        </KpiButton>
      </div>

      {/* Row 2 — 5 medium KPIs — all clickable */}
      <div className="grid grid-cols-5 gap-4">
        <KpiButton onClick={() => setOpenKpi('hours')}>
          <KpiCard
            className="h-full"
            label="Hours Clocked / Sched"
            value={`${totalClocked.toLocaleString()} / ${totalScheduled.toLocaleString()}`}
            subtext={period.label}
            size="medium"
          />
        </KpiButton>
        <KpiButton onClick={() => setOpenKpi('variance')}>
          <KpiCard
            className="h-full"
            label="Labour Variance"
            value={formatVariance(labourVariance) + ' hrs'}
            subtext="vs scheduled"
            trend={labourVariance > 0 ? 'down' : 'up'}
            alert={labourVariance > Math.max(50, totalScheduled * 0.04)}
            size="medium"
          />
        </KpiButton>
        <KpiButton onClick={() => setOpenKpi('payroll-pct')}>
          <KpiCard
            className="h-full"
            label="Payroll %"
            value={formatPct(payrollPct, 1)}
            subtext="of revenue"
            alert={payrollPct > 28}
            size="medium"
          />
        </KpiButton>
        <KpiButton onClick={() => setOpenKpi('payroll-total')}>
          <KpiCard
            className="h-full"
            label="Total Payroll"
            value={formatCurrency(totalPayroll, true)}
            subtext={`${period.label} labour cost`}
            size="medium"
          />
        </KpiButton>
        <KpiButton onClick={() => setOpenKpi('csat')}>
          {(() => {
            const t = csatTier(avgCsat);
            return (
              <KpiCard
                className="h-full"
                label="Customer Satisfaction"
                value={`${avgCsat.toFixed(1)} / 5.0`}
                subtext={`${t.label} · ${isSingleHotel ? 'this property' : `across ${hotels.length} hotels`}`}
                alert={t.alert}
                size="medium"
              />
            );
          })()}
        </KpiButton>
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
                  <tr
                    key={row.hotel.id}
                    className="cursor-pointer hover:bg-[#fafafa] transition-colors"
                    style={{ borderBottom: i < rows.length - 1 ? '1px solid #f0f0f0' : 'none' }}
                    onClick={() => { window.location.href = `/web/harshal/hotel/${row.hotel.id}`; }}
                  >
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

      {/* KPI Drawer */}
      <KpiDrawer
        open={openKpi !== null}
        onClose={() => setOpenKpi(null)}
        title={KPI_META[openKpi ?? 'revenue']?.title ?? ''}
        subtitle={`${scopeLabel} · ${period.label}`}
      >
        {openKpi === 'occupancy'     && <OccupancyDetail     {...scoped} />}
        {openKpi === 'revenue'       && <RevenueDetail       {...scoped} />}
        {openKpi === 'ooo'           && <RoomsOooDetail      {...scoped} />}
        {openKpi === 'stale'         && <StaleDirtyDetail    {...scoped} />}
        {openKpi === 'score'         && <RegionalScoreDetail {...scoped} />}
        {openKpi === 'hours'         && <HoursDetail         {...scoped} />}
        {openKpi === 'variance'      && <HoursDetail         {...scoped} />}
        {openKpi === 'payroll-pct'   && <PayrollDetail       {...scoped} />}
        {openKpi === 'payroll-total' && <PayrollDetail       {...scoped} />}
        {openKpi === 'csat'          && <CsatDetail          {...scoped} />}
      </KpiDrawer>
    </div>
  );
}

const KPI_META: Record<Exclude<KpiKey, null>, { title: string }> = {
  'occupancy':     { title: 'Occupancy — by hotel' },
  'revenue':       { title: 'Total Revenue — mix by source' },
  'ooo':           { title: 'Rooms Out of Order — by hotel' },
  'stale':         { title: 'Stale Dirty — rooms sitting too long' },
  'score':         { title: 'Regional Score — by hotel' },
  'hours':         { title: 'Hours Clocked vs. Scheduled' },
  'variance':      { title: 'Labour Variance — by hotel' },
  'payroll-pct':   { title: 'Payroll % — by hotel' },
  'payroll-total': { title: 'Total Payroll — by hotel' },
  'csat':          { title: 'Customer Satisfaction — by hotel' },
};

/**
 * Reset-styled button wrapper so a whole KpiCard can be clicked without
 * breaking the card's internal layout or hover styling.
 */
function KpiButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-left w-full h-full rounded-2xl transition-shadow hover:shadow-[0_0_0_1px_#6a6a6a] focus:outline-none focus-visible:shadow-[0_0_0_2px_#222]"
      style={{ padding: 0, border: 'none', background: 'transparent', cursor: 'pointer' }}
    >
      {children}
    </button>
  );
}
