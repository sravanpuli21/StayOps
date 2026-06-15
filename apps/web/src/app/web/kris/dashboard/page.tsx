'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import {
  GM_ROSTER, computeHotelScore, computeRegionalScore, REGIONAL_ROSTER,
  getStaleDirtyRoomsForHotel, getOooRoomsForHotel, formatCurrency, formatPct, formatVariance,
} from '@hos/shared';
import { useScopedData } from '@/lib/use-scoped-data';
import { MdKpi, MdHealth, MdDrawer, mdCsatTier } from './_kit';
import {
  OccupancyDetail, RevenueDetail, RoomsOooDetail, StaleDirtyDetail,
  HoursDetail, PayrollDetail, CsatDetail, type ScopedData,
} from './_details';

/**
 * Kris's (Managing Director) command-center dashboard.
 *
 * Built fresh and self-contained — shares no components with the regional
 * (Harshal) view. Same analytical depth: 10 clickable KPIs, a ranked
 * portfolio table, and per-KPI drawers. Deliberately OMITS the
 * "Needs attention" weakest-hotel call-out cards — the MD reads the full
 * ranked table directly.
 */
type KpiKey =
  | 'occupancy' | 'revenue' | 'ooo' | 'stale' | 'score'
  | 'hours' | 'variance' | 'payroll-pct' | 'payroll-total' | 'csat' | null;

export default function KrisDashboard() {
  const {
    hotels, scopeLabel, scopeSub, period,
    revenueRows, labourRows, dailyRows, isSingleHotel, selection, loading, error,
  } = useScopedData();

  const [openKpi, setOpenKpi] = useState<KpiKey>(null);

  if (error) {
    return (
      <div className="flex flex-col gap-6">
        <Header scopeLabel={scopeLabel} scopeSub={scopeSub} hotels={hotels.length} />
        <div className="rounded-2xl p-6" style={{ background: '#fff1f3', border: '1px solid rgba(255,56,92,0.3)' }}>
          <p className="text-sm font-semibold" style={{ color: '#b91c1c' }}>Couldn&apos;t load dashboard data.</p>
          <p className="text-xs mt-1" style={{ color: '#6a6a6a' }}>{String(error)}</p>
        </div>
      </div>
    );
  }
  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <Header scopeLabel={scopeLabel} scopeSub={scopeSub} hotels={hotels.length} />
        <div className="grid grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 h-28 animate-pulse" style={{ border: '1px solid #dddddd' }} />
          ))}
        </div>
      </div>
    );
  }

  // Aggregates
  const totalRooms = hotels.reduce((s, h) => s + h.rooms, 0);
  const totalRoomCapacity = totalRooms * period.days;
  const roomsSold = dailyRows.reduce((s, d) => s + d.roomsSold, 0);
  // OOO headline uses the same room-level source as the by-hotel detail so the
  // two always reconcile.
  const roomsOoo = hotels.reduce((s, h) => s + getOooRoomsForHotel(h.id).length, 0);
  const staleDirty = hotels.reduce((s, h) => s + getStaleDirtyRoomsForHotel(h.id).length, 0);
  const occupancyPct = totalRoomCapacity > 0 ? (roomsSold / totalRoomCapacity) * 100 : 0;
  const totalRevenue = revenueRows.reduce((s, r) => s + r.totalRevenue, 0);
  const totalScheduled = labourRows.reduce((s, l) => s + l.scheduledHours, 0);
  const totalClocked = labourRows.reduce((s, l) => s + l.clockedHours, 0);
  const totalPayroll = labourRows.reduce((s, l) => s + l.payrollCost, 0);
  const labourVariance = totalClocked - totalScheduled;
  const payrollPct = totalRevenue > 0 ? (totalPayroll / totalRevenue) * 100 : 0;
  const avgCsat = dailyRows.length > 0 ? dailyRows.reduce((s, d) => s + d.avgCustomerRating, 0) / dailyRows.length : 0;

  // Per-hotel rows — only hotels present in all three result sets.
  const rows = hotels.flatMap((hotel) => {
    const rev = revenueRows.find((r) => r.hotelId === hotel.id);
    const lab = labourRows.find((l) => l.hotelId === hotel.id);
    const dm  = dailyRows.find((d) => d.hotelId === hotel.id);
    if (!rev || !lab || !dm) return [];
    const gm = GM_ROSTER.find((g) => g.hotelId === hotel.id);
    const score = computeHotelScore(hotel.id);
    const hotelPayrollPct = rev.totalRevenue > 0 ? (lab.payrollCost / rev.totalRevenue) * 100 : 0;
    const ooo = getOooRoomsForHotel(hotel.id).length;
    return [{ hotel, rev, lab, dm, gm, score, hotelPayrollPct, ooo }];
  }).sort((a, b) => a.score.composite - b.score.composite);

  const regionalIdForScore = selection.kind === 'regional' ? selection.regionalId : null;
  const portfolioScore = computeRegionalScore(
    regionalIdForScore
      ? REGIONAL_ROSTER.find((r) => r.id === regionalIdForScore)?.hotelIds ?? hotels.map((h) => h.id)
      : hotels.map((h) => h.id),
  );

  const scoped: ScopedData = { hotels, revenueRows, labourRows, dailyRows };
  const csat = mdCsatTier(avgCsat);

  return (
    <div className="flex flex-col gap-6">
      <Header scopeLabel={scopeLabel} scopeSub={scopeSub} hotels={hotels.length} />

      {/* Row 1 — 5 large KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <MdKpi size="large" label="Occupancy" value={formatPct(occupancyPct, 1)} subtext={`${roomsSold.toLocaleString()} of ${totalRoomCapacity.toLocaleString()} room-nights`} onClick={() => setOpenKpi('occupancy')} />
        <MdKpi size="large" label="Total Revenue" value={formatCurrency(totalRevenue, true)} subtext={isSingleHotel ? 'this property' : `across ${hotels.length} hotels`} onClick={() => setOpenKpi('revenue')} />
        <MdKpi size="large" label="Rooms Out of Order" value={roomsOoo.toString()} subtext={totalRooms > 0 ? `${formatPct((roomsOoo / Math.max(totalRooms, 1)) * 100, 1)} of portfolio` : '—'} alert={roomsOoo > 3} onClick={() => setOpenKpi('ooo')} />
        <MdKpi size="large" label="Stale Dirty" value={staleDirty.toString()} subtext="dirty 2+ days · no open ticket" alert={staleDirty > hotels.length * 3} onClick={() => setOpenKpi('stale')} />
        <MdKpi size="large" label="Portfolio Score" value={`${portfolioScore.composite}`} subtext={`${portfolioScore.trendDirection === 'up' ? '↗' : portfolioScore.trendDirection === 'down' ? '↘' : '→'} ${formatVariance(portfolioScore.trendDelta)} vs last period`} onClick={() => setOpenKpi('score')} />
      </div>

      {/* Row 2 — 5 medium KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <MdKpi label="Hours Clocked / Sched" value={`${totalClocked.toLocaleString()} / ${totalScheduled.toLocaleString()}`} subtext={period.label} onClick={() => setOpenKpi('hours')} />
        <MdKpi label="Labour Variance" value={formatVariance(labourVariance) + ' hrs'} subtext="vs scheduled" trend={labourVariance > 0 ? 'down' : 'up'} alert={labourVariance > Math.max(50, totalScheduled * 0.04)} onClick={() => setOpenKpi('variance')} />
        <MdKpi label="Payroll %" value={formatPct(payrollPct, 1)} subtext="of revenue" alert={payrollPct > 28} onClick={() => setOpenKpi('payroll-pct')} />
        <MdKpi label="Total Payroll" value={formatCurrency(totalPayroll, true)} subtext={`${period.label} labour cost`} onClick={() => setOpenKpi('payroll-total')} />
        <MdKpi label="Customer Satisfaction" value={`${avgCsat.toFixed(1)} / 5.0`} subtext={`${csat.label} · ${isSingleHotel ? 'this property' : `across ${hotels.length} hotels`}`} alert={csat.alert} onClick={() => setOpenKpi('csat')} />
      </div>

      {/* Ranked portfolio table — no "needs attention" call-out cards */}
      {hotels.length > 1 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>Hotel Performance — Ranked</h2>
            <span className="text-xs" style={{ color: '#929292' }}>Tap row to drill in · weakest → strongest</span>
          </div>
          <div className="overflow-x-auto rounded-2xl" style={{ border: '1px solid #dddddd', background: '#fff' }}>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr style={{ borderBottom: '1px solid #dddddd', background: '#f7f7f7' }}>
                  {['Hotel / GM', 'Rooms', 'Occ %', 'ADR', 'RevPAR', 'Revenue', 'Payroll %', 'Var hrs', 'OOO', 'Score', 'Health', ''].map((h) => (
                    <th key={h} className="text-xs font-semibold uppercase tracking-wide py-3 px-4 whitespace-nowrap" style={{ color: '#6a6a6a', textAlign: h === 'Hotel / GM' ? 'left' : 'right' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={row.hotel.id} className="cursor-pointer hover:bg-[#fafafa] transition-colors" style={{ borderBottom: i < rows.length - 1 ? '1px solid #f0f0f0' : 'none' }} onClick={() => { window.location.href = `/web/harshal/hotel/${row.hotel.id}`; }}>
                    <td className="py-3 px-4">
                      <p className="font-medium text-sm" style={{ color: '#222' }}>{row.hotel.shortName}</p>
                      {row.gm && <p className="text-xs mt-0.5" style={{ color: '#929292' }}>GM · {row.gm.name}</p>}
                    </td>
                    <td className="py-3 px-4 text-right text-sm" style={{ color: '#3f3f3f' }}>{row.hotel.rooms}</td>
                    <td className="py-3 px-4 text-right text-sm font-medium" style={{ color: '#3f3f3f' }}>{formatPct(row.rev.occupancyPct, 0)}</td>
                    <td className="py-3 px-4 text-right text-sm" style={{ color: '#3f3f3f' }}>{formatCurrency(row.rev.adr)}</td>
                    <td className="py-3 px-4 text-right text-sm" style={{ color: '#3f3f3f' }}>{formatCurrency(row.rev.revPar)}</td>
                    <td className="py-3 px-4 text-right text-sm font-semibold" style={{ color: '#222' }}>{formatCurrency(row.rev.totalRevenue, true)}</td>
                    <td className="py-3 px-4 text-right text-sm font-medium" style={{ color: row.hotelPayrollPct > 28 ? '#b91c1c' : row.hotelPayrollPct > 24 ? '#b45309' : '#15803d' }}>{formatPct(row.hotelPayrollPct, 1)}</td>
                    <td className="py-3 px-4 text-right text-sm font-semibold" style={{ color: row.lab.variance > 20 ? '#b91c1c' : row.lab.variance > 0 ? '#b45309' : '#15803d' }}>{formatVariance(row.lab.variance)}</td>
                    <td className="py-3 px-4 text-right text-sm" style={{ color: row.ooo > 0 ? '#b91c1c' : '#3f3f3f' }}>{row.ooo}</td>
                    <td className="py-3 px-4 text-right text-sm font-bold" style={{ color: row.score.composite < 65 ? '#b91c1c' : row.score.composite < 75 ? '#b45309' : '#15803d' }}>{row.score.composite}</td>
                    <td className="py-3 px-4"><MdHealth health={row.rev.health} /></td>
                    <td className="py-3 px-4 text-right">
                      <Link href={`/web/harshal/hotel/${row.hotel.id}`} className="inline-flex items-center gap-0.5 text-xs font-semibold hover:underline" style={{ color: '#ff385c' }} onClick={(e) => e.stopPropagation()}>View <ChevronRight className="w-3 h-3" /></Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <MdDrawer open={openKpi !== null} onClose={() => setOpenKpi(null)} title={KPI_META[openKpi ?? 'revenue']?.title ?? ''} subtitle={`${scopeLabel} · ${period.label}`}>
        {openKpi === 'occupancy'     && <OccupancyDetail  {...scoped} />}
        {openKpi === 'revenue'       && <RevenueDetail    {...scoped} />}
        {openKpi === 'ooo'           && <RoomsOooDetail   {...scoped} />}
        {openKpi === 'stale'         && <StaleDirtyDetail {...scoped} />}
        {openKpi === 'score'         && <OccupancyDetail  {...scoped} />}
        {openKpi === 'hours'         && <HoursDetail      {...scoped} />}
        {openKpi === 'variance'      && <HoursDetail      {...scoped} />}
        {openKpi === 'payroll-pct'   && <PayrollDetail    {...scoped} />}
        {openKpi === 'payroll-total' && <PayrollDetail    {...scoped} />}
        {openKpi === 'csat'          && <CsatDetail       {...scoped} />}
      </MdDrawer>
    </div>
  );
}

function Header({ scopeLabel, scopeSub, hotels }: { scopeLabel: string; scopeSub: string; hotels: number }) {
  return (
    <div>
      <div className="flex items-baseline gap-3 flex-wrap">
        <h1 className="text-xl font-bold" style={{ color: '#222' }}>{scopeLabel} Dashboard</h1>
        <span className="text-sm" style={{ color: '#6a6a6a' }}>{hotels} hotel{hotels === 1 ? '' : 's'} · Kris Patel</span>
      </div>
      <p className="text-sm mt-0.5" style={{ color: '#929292' }}>{scopeSub}</p>
    </div>
  );
}

const KPI_META: Record<Exclude<KpiKey, null>, { title: string }> = {
  occupancy:       { title: 'Occupancy — by hotel' },
  revenue:         { title: 'Total Revenue — mix by source' },
  ooo:             { title: 'Rooms Out of Order — by hotel' },
  stale:           { title: 'Stale Dirty — rooms sitting too long' },
  score:           { title: 'Portfolio Score — by hotel' },
  hours:           { title: 'Hours Clocked vs. Scheduled' },
  variance:        { title: 'Labour Variance — by hotel' },
  'payroll-pct':   { title: 'Payroll % — by hotel' },
  'payroll-total': { title: 'Total Payroll — by hotel' },
  csat:            { title: 'Customer Satisfaction — by hotel' },
};
