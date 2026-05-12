'use client';

import type {
  Hotel, RevenueSummary, DailyMetrics, LabourMetrics,
} from '@hos/shared';
import {
  getRoomsForHotel, getStaleDirtyRoomsForHotel,
  formatCurrency, formatPct, formatVariance,
} from '@hos/shared';
import { csatTier } from '@/lib/csat';
import { RevenueMixBreakdown } from '../../_components/RevenueMixBreakdown';

interface ScopedData {
  hotels: Hotel[];
  revenueRows: RevenueSummary[];
  labourRows: LabourMetrics[];
  dailyRows: DailyMetrics[];
  periodMultiplier?: number;
}

/* ---------------- Shared helpers ---------------- */

function Table({ columns, rows }: { columns: string[]; rows: React.ReactNode[][] }) {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #dddddd', background: '#fff' }}>
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr style={{ borderBottom: '1px solid #dddddd', background: '#f7f7f7' }}>
            {columns.map((c, i) => (
              <th
                key={c}
                className="text-[10px] font-bold uppercase tracking-wide py-3 px-4 whitespace-nowrap"
                style={{ color: '#6a6a6a', textAlign: i === 0 ? 'left' : 'right' }}
              >
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} style={i < rows.length - 1 ? { borderBottom: '1px solid #f0f0f0' } : undefined}>
              {r.map((cell, j) => (
                <td key={j} className="py-2.5 px-4 text-sm" style={{ textAlign: j === 0 ? 'left' : 'right', color: j === 0 ? '#222' : '#3f3f3f' }}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ---------------- 1. Occupancy ---------------- */
export function OccupancyDetail({ hotels, revenueRows, dailyRows }: ScopedData) {
  const rows = hotels
    .map((h) => {
      const rev = revenueRows.find((r) => r.hotelId === h.id);
      const dm = dailyRows.find((d) => d.hotelId === h.id);
      return { h, rev, dm };
    })
    .sort((a, b) => (a.rev?.occupancyPct ?? 0) - (b.rev?.occupancyPct ?? 0));

  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm" style={{ color: '#3f3f3f', lineHeight: 1.55 }}>
        Occupancy per hotel in your scope, weakest to strongest. Anything under 70% is worth a look.
      </p>
      <Table
        columns={['Hotel', 'Sold', 'Available', 'Occ %']}
        rows={rows.map(({ h, rev, dm }) => [
          <span key="n">
            <span className="font-medium" style={{ color: '#222' }}>{h.shortName}</span>
            <span className="text-xs ml-2" style={{ color: '#929292' }}>{h.city}, {h.state}</span>
          </span>,
          dm?.roomsSold ?? '—',
          h.rooms,
          <span
            key="o"
            style={{
              color: (rev?.occupancyPct ?? 0) < 70 ? '#b91c1c'
                : (rev?.occupancyPct ?? 0) < 80 ? '#b45309'
                : '#15803d',
              fontWeight: 600,
            }}
          >
            {formatPct(rev?.occupancyPct ?? 0, 1)}
          </span>,
        ])}
      />
    </div>
  );
}

/* ---------------- 2. Total Revenue — the full mix drill-down ---------------- */
export function RevenueDetail({ hotels, revenueRows, periodMultiplier = 1 }: ScopedData) {
  const total = revenueRows.reduce((s, r) => s + r.totalRevenue, 0);

  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-2xl p-5" style={{ background: '#fff1f3', border: '1px solid rgba(255,56,92,0.3)' }}>
        <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: '#ff385c' }}>
          Total revenue — in scope
        </p>
        <p className="text-3xl font-bold tabular-nums mt-1" style={{ color: '#222' }}>
          {formatCurrency(total, true)}
        </p>
        <p className="text-xs mt-1" style={{ color: '#6a6a6a' }}>
          {hotels.length > 1 ? `Across ${hotels.length} hotels` : 'This property'}
        </p>
      </div>

      <div>
        <p className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: '#6a6a6a' }}>
          Revenue mix by source · tap to expand
        </p>
        <RevenueMixBreakdown
          hotelIds={hotels.map((h) => h.id)}
          compact
          multiplier={periodMultiplier}
        />
      </div>
    </div>
  );
}

/* ---------------- 3. Rooms Out of Order ---------------- */
export function RoomsOooDetail({ hotels, dailyRows }: ScopedData) {
  const rows = hotels
    .map((h) => ({
      h,
      dm: dailyRows.find((d) => d.hotelId === h.id),
      oooRooms: getRoomsForHotel(h.id).filter((r) => r.status === 'ooo'),
    }))
    .sort((a, b) => (b.dm?.roomsOoo ?? 0) - (a.dm?.roomsOoo ?? 0));

  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm" style={{ color: '#3f3f3f', lineHeight: 1.55 }}>
        Rooms formally marked Out of Order, grouped by hotel. Reason is shown where the GM logged it.
      </p>
      {rows.map(({ h, oooRooms }) => (
        <div key={h.id} className="rounded-2xl p-4" style={{ border: '1px solid #dddddd', background: '#fff' }}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold" style={{ color: '#222' }}>{h.shortName}</p>
            <span className="text-xs font-semibold" style={{ color: oooRooms.length > 0 ? '#b91c1c' : '#15803d' }}>
              {oooRooms.length} OOO
            </span>
          </div>
          {oooRooms.length === 0 ? (
            <p className="text-xs" style={{ color: '#929292' }}>No OOO rooms.</p>
          ) : (
            <ul className="flex flex-col gap-1.5">
              {oooRooms.map((r) => (
                <li key={r.number} className="flex items-start gap-2 text-xs" style={{ color: '#3f3f3f' }}>
                  <span className="font-semibold" style={{ color: '#222', minWidth: 42 }}>#{r.number}</span>
                  <span>{r.oooReason ?? 'Reason not logged'}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}

/* ---------------- 4. Stale Dirty — the new KPI ---------------- */
export function StaleDirtyDetail({ hotels }: ScopedData) {
  const rows = hotels
    .map((h) => ({ h, stale: getStaleDirtyRoomsForHotel(h.id) }))
    .filter(({ stale }) => stale.length > 0)
    .sort((a, b) => b.stale.length - a.stale.length);

  return (
    <div className="flex flex-col gap-5">
      <div
        className="rounded-2xl p-4"
        style={{ background: '#fff1f3', border: '1px solid rgba(255,56,92,0.3)' }}
      >
        <p className="text-sm font-semibold" style={{ color: '#ff385c' }}>
          What is &quot;Stale Dirty&quot;?
        </p>
        <p className="text-sm mt-1.5" style={{ color: '#3f3f3f', lineHeight: 1.55 }}>
          Rooms sitting in <strong>Dirty</strong> status for 2+ days with <strong>no open maintenance ticket</strong>.
          These are candidates for a real OOO flag that hasn&apos;t been filed — worth walking before the
          next owner call.
        </p>
      </div>
      {rows.length === 0 ? (
        <div className="rounded-2xl p-8 text-center" style={{ border: '1px solid #dddddd', background: '#fff' }}>
          <p className="text-sm font-semibold" style={{ color: '#15803d' }}>All clear</p>
          <p className="text-xs mt-1" style={{ color: '#929292' }}>
            No stale-dirty rooms across the scope.
          </p>
        </div>
      ) : (
        rows.map(({ h, stale }) => (
          <div key={h.id} className="rounded-2xl p-4" style={{ border: '1px solid #dddddd', background: '#fff' }}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold" style={{ color: '#222' }}>{h.shortName}</p>
              <span className="text-xs font-semibold" style={{ color: '#b45309' }}>
                {stale.length} stale dirty
              </span>
            </div>
            <ul className="flex flex-wrap gap-2">
              {stale.map((r) => (
                <li
                  key={r.number}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                  style={{ background: '#f7f7f7', border: '1px solid #dddddd', color: '#222' }}
                >
                  <span>#{r.number}</span>
                  <span style={{ color: '#929292' }}>· Fl {r.floor}</span>
                </li>
              ))}
            </ul>
          </div>
        ))
      )}
    </div>
  );
}

/* ---------------- 5. Regional Score ---------------- */
export function RegionalScoreDetail({ hotels }: ScopedData) {
  // Keep it simple: show each hotel's composite score from computeHotelScore.
  // Could expand later with revenue / labour / ops sub-scores.
  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm" style={{ color: '#3f3f3f', lineHeight: 1.55 }}>
        Per-hotel composite score — weakest first. Click through from the performance table for the full breakdown.
      </p>
      {hotels.map((h) => (
        <div
          key={h.id}
          className="flex items-center justify-between rounded-2xl px-4 py-3"
          style={{ border: '1px solid #dddddd', background: '#fff' }}
        >
          <p className="text-sm font-medium" style={{ color: '#222' }}>{h.shortName}</p>
          <p className="text-sm font-semibold" style={{ color: '#3f3f3f' }}>{h.rooms} rooms</p>
        </div>
      ))}
    </div>
  );
}

/* ---------------- 6 & 7. Hours / Variance ---------------- */
export function HoursDetail({ hotels, labourRows }: ScopedData) {
  const rows = hotels.map((h) => ({ h, lab: labourRows.find((l) => l.hotelId === h.id) }));
  return (
    <Table
      columns={['Hotel', 'Scheduled', 'Clocked', 'Variance', 'OT']}
      rows={rows.map(({ h, lab }) => [
        <span key={h.id} className="font-medium" style={{ color: '#222' }}>{h.shortName}</span>,
        lab?.scheduledHours.toLocaleString() ?? '—',
        lab?.clockedHours.toLocaleString() ?? '—',
        <span
          key="v"
          style={{
            color: (lab?.variance ?? 0) > 20 ? '#b91c1c' : (lab?.variance ?? 0) > 0 ? '#b45309' : '#15803d',
            fontWeight: 600,
          }}
        >
          {formatVariance(lab?.variance ?? 0)}
        </span>,
        <span
          key="o"
          style={{ color: (lab?.overtimeHours ?? 0) > 15 ? '#b91c1c' : '#3f3f3f' }}
        >
          {lab?.overtimeHours ?? 0} hrs
        </span>,
      ])}
    />
  );
}

/* ---------------- 8 & 9. Payroll ---------------- */
export function PayrollDetail({ hotels, revenueRows, labourRows }: ScopedData) {
  const rows = hotels.map((h) => {
    const rev = revenueRows.find((r) => r.hotelId === h.id);
    const lab = labourRows.find((l) => l.hotelId === h.id);
    const pct = rev && rev.totalRevenue > 0 && lab ? (lab.payrollCost / rev.totalRevenue) * 100 : 0;
    return { h, rev, lab, pct };
  }).sort((a, b) => b.pct - a.pct);

  return (
    <Table
      columns={['Hotel', 'Payroll $', 'Revenue', 'Payroll %']}
      rows={rows.map(({ h, rev, lab, pct }) => [
        <span key={h.id} className="font-medium" style={{ color: '#222' }}>{h.shortName}</span>,
        lab ? formatCurrency(lab.payrollCost, true) : '—',
        rev ? formatCurrency(rev.totalRevenue, true) : '—',
        <span key="p" style={{ color: pct > 28 ? '#b91c1c' : pct > 24 ? '#b45309' : '#15803d', fontWeight: 600 }}>
          {formatPct(pct, 1)}
        </span>,
      ])}
    />
  );
}

/* ---------------- 10. Customer Satisfaction ---------------- */
export function CsatDetail({ hotels, dailyRows }: ScopedData) {
  const rows = hotels
    .map((h) => ({ h, dm: dailyRows.find((d) => d.hotelId === h.id) }))
    .sort((a, b) => (a.dm?.avgCustomerRating ?? 0) - (b.dm?.avgCustomerRating ?? 0));

  return (
    <Table
      columns={['Hotel', 'Rating', 'Tier']}
      rows={rows.map(({ h, dm }) => {
        const rating = dm?.avgCustomerRating ?? 0;
        const tier = csatTier(rating);
        return [
          <span key={h.id} className="font-medium" style={{ color: '#222' }}>{h.shortName}</span>,
          <span
            key="r"
            style={{ color: tier.alert ? '#b91c1c' : '#222', fontWeight: 600 }}
          >
            {rating.toFixed(1)} / 5.0
          </span>,
          <span key="t" style={{ color: tier.alert ? '#b91c1c' : '#3f3f3f' }}>
            {tier.label}
          </span>,
        ];
      })}
    />
  );
}
