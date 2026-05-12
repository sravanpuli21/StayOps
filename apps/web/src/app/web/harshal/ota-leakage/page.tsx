'use client';

import { useMemo } from 'react';
import {
  OTA_CHANNEL_ROWS,
  aggregateOtaByChannel,
  formatCurrency,
  formatPct,
  type OtaChannelAggregate,
} from '@hos/shared';
import { KpiCard } from '@/components/common/KpiCard';
import { useScopedData } from '@/lib/use-scoped-data';

export default function HarshalOtaLeakage() {
  const { hotels, scopeLabel, scopeSub, period } = useScopedData();

  const hotelIdSet = useMemo(() => new Set(hotels.map((h) => h.id)), [hotels]);
  // Scale bookings by the date period multiplier so "Today" / "Week" / "YTD"
  // all land on realistic numbers instead of showing the same monthly figure.
  // Per-booking metrics (ADR, commission %, cancel %) stay constant — they're
  // ratios, not accumulators.
  const rows = useMemo(
    () =>
      OTA_CHANNEL_ROWS
        .filter((r) => hotelIdSet.has(r.hotelId))
        .map((r) => ({
          ...r,
          bookings: Math.max(1, Math.round(r.bookings * (period.multiplier / 30))),
        })),
    [hotelIdSet, period.multiplier],
  );
  const aggregates = useMemo(() => aggregateOtaByChannel(rows), [rows]);

  const grossTotal      = aggregates.reduce((s, a) => s + a.grossRevenue, 0);
  const leakageTotal    = aggregates.reduce((s, a) => s + a.leakageTotal, 0);
  const netTotal        = aggregates.reduce((s, a) => s + a.netRevenue, 0);
  const realisedTotal   = aggregates.reduce((s, a) => s + a.realisedRevenue, 0);
  const bookingsTotal   = aggregates.reduce((s, a) => s + a.bookings, 0);
  const realisedRatePct = grossTotal > 0 ? (realisedTotal / grossTotal) * 100 : 0;

  const bestChannel  = [...aggregates].sort((a, b) => b.netRevenue - a.netRevenue)[0];
  const worstChannel = [...aggregates]
    .filter((a) => a.grossRevenue > 0)
    .sort((a, b) => b.leakageTotal / b.grossRevenue - a.leakageTotal / a.grossRevenue)[0];

  const ranking = [...aggregates]
    .filter((a) => a.bookings > 0)
    .sort((a, b) => b.netRevenue - a.netRevenue);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold" style={{ color: '#222' }}>
          OTA Profit Leakage — {scopeLabel}
        </h1>
        <p className="text-sm mt-0.5" style={{ color: '#929292' }}>{scopeSub}</p>
        <p className="text-sm mt-2 italic" style={{ color: '#ff385c' }}>
          Your occupancy is not your profit.
        </p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <KpiCard
          label="Gross Revenue"
          value={formatCurrency(grossTotal, true)}
          subtext={`${bookingsTotal.toLocaleString()} bookings · ${period.label}`}
          size="large"
        />
        <KpiCard
          label="Total Leakage"
          value={formatCurrency(leakageTotal, true)}
          subtext={`${formatPct(grossTotal > 0 ? (leakageTotal / grossTotal) * 100 : 0, 1)} of gross`}
          size="large"
          alert
        />
        <KpiCard
          label="Net Revenue"
          value={formatCurrency(netTotal, true)}
          subtext="After commission, fees, cancels, no-shows"
          size="large"
        />
        <KpiCard
          label="Realised Revenue Rate"
          value={formatPct(realisedRatePct, 1)}
          subtext="% of booked revenue actually collected"
          size="large"
        />
      </div>

      {(bestChannel || worstChannel) && (
        <div className="grid grid-cols-2 gap-4">
          {bestChannel && (
            <div className="rounded-2xl p-5" style={{ border: '1px solid #dddddd', background: '#ffffff' }}>
              <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#929292' }}>
                Most Profitable Channel
              </p>
              <p className="text-lg font-bold mt-1" style={{ color: '#15803d' }}>{bestChannel.channelName}</p>
              <p className="text-sm mt-1" style={{ color: '#6a6a6a' }}>
                {formatCurrency(bestChannel.netRevenue, true)} net · {formatCurrency(bestChannel.netAdr)} net ADR
              </p>
            </div>
          )}
          {worstChannel && (
            <div className="rounded-2xl p-5" style={{ border: '1px solid #dddddd', background: '#ffffff' }}>
              <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#929292' }}>
                Biggest Leakage
              </p>
              <p className="text-lg font-bold mt-1" style={{ color: '#b91c1c' }}>{worstChannel.channelName}</p>
              <p className="text-sm mt-1" style={{ color: '#6a6a6a' }}>
                {formatCurrency(worstChannel.leakageTotal, true)} lost ·{' '}
                {formatPct((worstChannel.leakageTotal / worstChannel.grossRevenue) * 100, 1)} of gross
              </p>
            </div>
          )}
        </div>
      )}

      <NetAdrTable rows={aggregates} />
      <ProfitRankingTable rows={ranking} />
      <CancellationAdjustedTable rows={aggregates} />
    </div>
  );
}

function SectionShell({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-sm font-bold uppercase tracking-wide mb-1" style={{ color: '#6a6a6a' }}>
        {title}
      </h2>
      {subtitle && <p className="text-xs mb-3" style={{ color: '#929292' }}>{subtitle}</p>}
      <div className="overflow-x-auto rounded-2xl" style={{ border: '1px solid #dddddd', background: '#ffffff' }}>
        {children}
      </div>
    </div>
  );
}

function NetAdrTable({ rows }: { rows: OtaChannelAggregate[] }) {
  const headers = ['Channel', 'Gross ADR', 'Commission', 'Other Fees', 'Refund/Cancel Loss', 'Net ADR'];
  return (
    <SectionShell title="Net ADR by Channel" subtitle="What you actually keep per booking after commission, fees, and refund losses.">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr style={{ borderBottom: '1px solid #dddddd', background: '#f7f7f7' }}>
            {headers.map((h, i) => (
              <th key={h} className="text-xs font-semibold uppercase tracking-wide py-3 px-4 whitespace-nowrap"
                  style={{ color: '#6a6a6a', textAlign: i === 0 ? 'left' : 'right' }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.filter((r) => r.bookings > 0).map((r, i, arr) => {
            const isDirect = r.group === 'direct';
            return (
              <tr key={r.channel} style={{ borderBottom: i < arr.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                <td className="py-3 px-4">
                  <p className="font-medium text-sm" style={{ color: '#222' }}>{r.channelName}</p>
                  <p className="text-xs mt-0.5" style={{ color: isDirect ? '#15803d' : '#929292' }}>
                    {isDirect ? 'Direct channel' : 'Third-party OTA'}
                  </p>
                </td>
                <td className="py-3 px-4 text-right text-sm" style={{ color: '#3f3f3f' }}>{formatCurrency(r.grossAdr)}</td>
                <td className="py-3 px-4 text-right text-sm" style={{ color: r.commissionPerBooking > 0 ? '#b91c1c' : '#929292' }}>
                  {r.commissionPerBooking > 0 ? `-${formatCurrency(r.commissionPerBooking)}` : formatCurrency(0)}
                </td>
                <td className="py-3 px-4 text-right text-sm" style={{ color: '#b45309' }}>
                  -{formatCurrency(r.otherFeesPerBooking)}
                </td>
                <td className="py-3 px-4 text-right text-sm" style={{ color: '#b45309' }}>
                  -{formatCurrency(r.refundLossPerBooking)}
                </td>
                <td className="py-3 px-4 text-right text-sm font-bold" style={{ color: '#222' }}>
                  {formatCurrency(r.netAdr)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </SectionShell>
  );
}

function ProfitRankingTable({ rows }: { rows: OtaChannelAggregate[] }) {
  const headers = ['Rank', 'Channel', 'Bookings', 'Gross Revenue', 'Net Revenue', 'Leakage', 'Profit Quality'];
  const qualityColor = (q: OtaChannelAggregate['profitQuality']) =>
    q === 'Excellent' ? '#15803d' : q === 'Strong' ? '#3f3f3f' : '#b91c1c';
  const leakageBadgeColor = (a: OtaChannelAggregate) => {
    if (a.grossRevenue === 0) return { bg: '#f7f7f7', fg: '#6a6a6a' };
    const pct = (a.leakageTotal / a.grossRevenue) * 100;
    if (pct < 6)  return { bg: '#dcfce7', fg: '#15803d' };
    if (pct < 14) return { bg: '#fef3c7', fg: '#b45309' };
    return { bg: '#fee2e2', fg: '#b91c1c' };
  };

  return (
    <SectionShell title="Channel Profit Ranking" subtitle="Ranked by net revenue — not booking volume. Who gave you profitable bookings?">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr style={{ borderBottom: '1px solid #dddddd', background: '#f7f7f7' }}>
            {headers.map((h, i) => (
              <th key={h} className="text-xs font-semibold uppercase tracking-wide py-3 px-4 whitespace-nowrap"
                  style={{ color: '#6a6a6a', textAlign: i <= 1 ? 'left' : 'right' }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => {
            const badge = leakageBadgeColor(r);
            const leakagePct = r.grossRevenue > 0 ? (r.leakageTotal / r.grossRevenue) * 100 : 0;
            return (
              <tr key={r.channel} style={{ borderBottom: i < rows.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                <td className="py-3 px-4 text-sm font-bold" style={{ color: '#222' }}>#{i + 1}</td>
                <td className="py-3 px-4">
                  <p className="font-medium text-sm" style={{ color: '#222' }}>{r.channelName}</p>
                </td>
                <td className="py-3 px-4 text-right text-sm" style={{ color: '#3f3f3f' }}>{r.bookings.toLocaleString()}</td>
                <td className="py-3 px-4 text-right text-sm" style={{ color: '#3f3f3f' }}>{formatCurrency(r.grossRevenue, true)}</td>
                <td className="py-3 px-4 text-right text-sm font-semibold" style={{ color: '#222' }}>{formatCurrency(r.netRevenue, true)}</td>
                <td className="py-3 px-4 text-right">
                  <span className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold"
                        style={{ background: badge.bg, color: badge.fg }}>
                    {formatCurrency(r.leakageTotal, true)} · {formatPct(leakagePct, 0)}
                  </span>
                </td>
                <td className="py-3 px-4 text-right text-sm font-semibold" style={{ color: qualityColor(r.profitQuality) }}>
                  {r.profitQuality}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </SectionShell>
  );
}

function CancellationAdjustedTable({ rows }: { rows: OtaChannelAggregate[] }) {
  const headers = ['Channel', 'Bookings', 'Cancellation %', 'No-show %', 'Net Realised Revenue', 'Realised Rate'];
  return (
    <SectionShell title="Cancellation-Adjusted Channel Value" subtitle="How much of booked revenue actually became money after cancels and no-shows.">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr style={{ borderBottom: '1px solid #dddddd', background: '#f7f7f7' }}>
            {headers.map((h, i) => (
              <th key={h} className="text-xs font-semibold uppercase tracking-wide py-3 px-4 whitespace-nowrap"
                  style={{ color: '#6a6a6a', textAlign: i === 0 ? 'left' : 'right' }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.filter((r) => r.bookings > 0).map((r, i, arr) => (
            <tr key={r.channel} style={{ borderBottom: i < arr.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
              <td className="py-3 px-4">
                <p className="font-medium text-sm" style={{ color: '#222' }}>{r.channelName}</p>
              </td>
              <td className="py-3 px-4 text-right text-sm" style={{ color: '#3f3f3f' }}>{r.bookings.toLocaleString()}</td>
              <td className="py-3 px-4 text-right text-sm font-semibold"
                  style={{ color: r.cancellationPct > 22 ? '#b91c1c' : r.cancellationPct > 12 ? '#b45309' : '#15803d' }}>
                {formatPct(r.cancellationPct, 0)}
              </td>
              <td className="py-3 px-4 text-right text-sm"
                  style={{ color: r.noShowPct > 4 ? '#b91c1c' : '#3f3f3f' }}>
                {formatPct(r.noShowPct, 0)}
              </td>
              <td className="py-3 px-4 text-right text-sm font-semibold" style={{ color: '#222' }}>
                {formatCurrency(r.realisedRevenue, true)}
              </td>
              <td className="py-3 px-4 text-right text-sm"
                  style={{ color: r.realisedRevenueRatePct >= 80 ? '#15803d' : r.realisedRevenueRatePct >= 70 ? '#b45309' : '#b91c1c' }}>
                {formatPct(r.realisedRevenueRatePct, 1)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </SectionShell>
  );
}
