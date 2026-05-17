'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import {
  GM_ROSTER,
  getZeroRateRoomsForHotel,
  formatCurrency, formatPct,
} from '@hos/shared';
import { useAnomalies, useAiForecasts } from '@/lib/ai-data';
import { KpiCard } from '@/components/common/KpiCard';
import { HealthBadge } from '@/components/common/HealthBadge';
import { AIFlagsPanel } from '@/components/common/AIFlagsPanel';
import { ForecastWidget } from '@/components/ai/ForecastWidget';
import { HotelRevenueTable } from '@/components/revenue/HotelRevenueTable';
import { RevenueMixTable } from '@/components/revenue/RevenueMixTable';
import { OpportunityLeakageTable } from '@/components/revenue/OpportunityLeakageTable';
import { RevLabourEfficiencyTable } from '@/components/revenue/RevLabourEfficiencyTable';
import { PricingPowerTable } from '@/components/revenue/PricingPowerTable';
import { useScopedData } from '@/lib/use-scoped-data';
import { RevenueMixBreakdown } from '../_components/RevenueMixBreakdown';

function SectionTitle({ children, subtitle }: { children: React.ReactNode; subtitle?: string }) {
  return (
    <div className="flex items-baseline justify-between mb-3">
      <h2 className="text-sm font-bold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>
        {children}
      </h2>
      {subtitle && <p className="text-xs" style={{ color: '#929292' }}>{subtitle}</p>}
    </div>
  );
}

export default function HarshalRevenue() {
  const {
    hotels, hotelIdSet, scopeLabel, scopeSub, period,
    revenueRows, labourRows, dailyRows,
  } = useScopedData();

  // GM-annotated rows for the ranking table at the bottom. Filter to hotels
  // that have both revenue and labour — partial reporters are skipped.
  const rankingRows = hotels.flatMap((hotel) => {
    const rev = revenueRows.find((r) => r.hotelId === hotel.id);
    const lab = labourRows.find((l) => l.hotelId === hotel.id);
    if (!rev || !lab) return [];
    const gm = GM_ROSTER.find((g) => g.hotelId === hotel.id);
    return [{
      hotel, rev, gm,
      payrollPct: rev.totalRevenue > 0 ? (lab.payrollCost / rev.totalRevenue) * 100 : 0,
      adrVsMarket: rev.adr - rev.marketAdr,
    }];
  }).sort((a, b) => b.rev.revPar - a.rev.revPar);

  // Row shapes expected by the shared Kris-flavored tables
  const revRows = hotels.flatMap((hotel) => {
    const revenue = revenueRows.find((r) => r.hotelId === hotel.id);
    if (!revenue) return [];
    return [{ hotel, revenue }];
  });
  const efficiencyRows = hotels.flatMap((hotel) => {
    const revenue = revenueRows.find((r) => r.hotelId === hotel.id);
    const labour = labourRows.find((l) => l.hotelId === hotel.id);
    if (!revenue || !labour) return [];
    return [{ hotel, revenue, labour }];
  });
  const leakageRows = hotels.flatMap((hotel) => {
    const revenue = revenueRows.find((r) => r.hotelId === hotel.id);
    const daily = dailyRows.find((d) => d.hotelId === hotel.id);
    if (!revenue || !daily) return [];
    return [{ hotel, revenue, daily }];
  });

  // Portfolio KPIs
  const totalRevenue = rankingRows.reduce((s, r) => s + r.rev.totalRevenue, 0);
  const avgOcc = rankingRows.length > 0 ? rankingRows.reduce((s, r) => s + r.rev.occupancyPct, 0) / rankingRows.length : 0;
  const avgAdr = rankingRows.length > 0 ? rankingRows.reduce((s, r) => s + r.rev.adr, 0) / rankingRows.length : 0;
  const avgRevPar = rankingRows.length > 0 ? rankingRows.reduce((s, r) => s + r.rev.revPar, 0) / rankingRows.length : 0;
  const zeroRateTotal = hotels.reduce((s, h) => s + getZeroRateRoomsForHotel(h.id), 0);

  // AI
  const revenueAnomalies = useAnomalies().filter(
    (a) => a.module === 'revenue' && hotelIdSet.has(a.hotelId),
  );
  const revenueForecast = useAiForecasts().find((f) => f.id === 'fc-001');

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-xl font-bold" style={{ color: '#222' }}>Revenue — {scopeLabel}</h1>
        <p className="text-sm mt-0.5" style={{ color: '#929292' }}>{scopeSub}</p>
      </div>

      {/* Portfolio KPIs */}
      <div className="grid grid-cols-5 gap-4">
        <KpiCard label="Total Revenue" value={formatCurrency(totalRevenue, true)} subtext={`All revenue · ${period.label}`} size="large" />
        <KpiCard label="Avg Occupancy" value={formatPct(avgOcc, 1)} subtext={hotels.length > 1 ? `Across ${hotels.length} hotels` : 'This property'} size="large" />
        <KpiCard label="Avg ADR"       value={formatCurrency(avgAdr)} subtext="Daily rate" size="large" />
        <KpiCard label="Avg RevPAR"    value={formatCurrency(avgRevPar)} subtext="Per available room" size="large" />
        <KpiCard
          label="Zero Rate Rooms"
          value={zeroRateTotal.toString()}
          subtext={hotels.length > 1
            ? `${hotels.length} hotels · comp, house use, employee stays`
            : 'comp, house use, employee stays'}
          size="large"
        />
      </div>

      {/* Forecast — from Kris's view */}
      {revenueForecast && <ForecastWidget forecast={revenueForecast} />}

      {/* Hotel Revenue Breakdown — Kris's table */}
      <div>
        <SectionTitle>Hotel Revenue Breakdown</SectionTitle>
        <HotelRevenueTable rows={revRows} />
      </div>

      {/* Revenue Mix — Portfolio Totals (bucket drill-down) */}
      <div>
        <SectionTitle subtitle="Tap any bucket to see the individual charge lines">
          Revenue Mix by Source — Portfolio
        </SectionTitle>
        <RevenueMixBreakdown
          hotelIds={hotels.map((h) => h.id)}
          initialOpen={null}
          days={period.days}
        />
      </div>

      {/* Revenue Mix — Per Hotel table (Kris's table, different representation) */}
      <div>
        <SectionTitle>Revenue Mix by Source — Per Hotel</SectionTitle>
        <RevenueMixTable rows={revRows} />
      </div>

      {/* Opportunity Leakage — unsold rooms */}
      <div>
        <SectionTitle>Opportunity Leakage — Unsold Rooms</SectionTitle>
        <OpportunityLeakageTable rows={leakageRows} />
      </div>

      {/* Revenue / Labour Efficiency */}
      <div>
        <SectionTitle>Revenue / Labour Efficiency</SectionTitle>
        <RevLabourEfficiencyTable rows={efficiencyRows} />
      </div>

      {/* Pricing Power vs. Market */}
      <div>
        <SectionTitle>Pricing Power vs. Market</SectionTitle>
        <PricingPowerTable rows={revRows} />
      </div>

      {/* Harshal's GM-annotated ranking — kept for regional director view */}
      {rankingRows.length > 1 && (
        <div>
          <SectionTitle subtitle="Sorted by RevPAR · click a row to drill into the hotel">
            Revenue Ranking — GM View
          </SectionTitle>
          <div className="overflow-x-auto rounded-2xl" style={{ border: '1px solid #dddddd', background: '#ffffff' }}>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr style={{ borderBottom: '1px solid #dddddd', background: '#f7f7f7' }}>
                  {['Hotel / GM', 'Occ %', 'ADR', 'Market ADR', 'Gap', 'RevPAR', 'Revenue', 'Payroll %', 'Health', ''].map((h) => (
                    <th key={h} className="text-xs font-semibold uppercase tracking-wide py-3 px-4 whitespace-nowrap" style={{ color: '#6a6a6a', textAlign: h === 'Hotel / GM' ? 'left' : 'right' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rankingRows.map((row, i) => (
                  <tr
                    key={row.hotel.id}
                    className="cursor-pointer hover:bg-[#fafafa] transition-colors"
                    style={{ borderBottom: i < rankingRows.length - 1 ? '1px solid #f0f0f0' : 'none' }}
                    onClick={() => { window.location.href = `/web/harshal/hotel/${row.hotel.id}`; }}
                  >
                    <td className="py-3 px-4">
                      <p className="font-medium text-sm" style={{ color: '#222' }}>{row.hotel.shortName}</p>
                      {row.gm && <p className="text-xs mt-0.5" style={{ color: '#929292' }}>GM · {row.gm.name}</p>}
                    </td>
                    <td className="py-3 px-4 text-right text-sm font-medium" style={{ color: '#3f3f3f' }}>{formatPct(row.rev.occupancyPct, 0)}</td>
                    <td className="py-3 px-4 text-right text-sm" style={{ color: '#3f3f3f' }}>{formatCurrency(row.rev.adr)}</td>
                    <td className="py-3 px-4 text-right text-sm" style={{ color: '#929292' }}>{formatCurrency(row.rev.marketAdr)}</td>
                    <td className="py-3 px-4 text-right text-sm font-semibold" style={{ color: row.adrVsMarket >= 0 ? '#15803d' : '#b91c1c' }}>
                      {row.adrVsMarket >= 0 ? '+' : ''}{formatCurrency(row.adrVsMarket)}
                    </td>
                    <td className="py-3 px-4 text-right text-sm font-medium" style={{ color: '#3f3f3f' }}>{formatCurrency(row.rev.revPar)}</td>
                    <td className="py-3 px-4 text-right text-sm font-semibold" style={{ color: '#222' }}>{formatCurrency(row.rev.totalRevenue, true)}</td>
                    <td className="py-3 px-4 text-right text-sm" style={{ color: row.payrollPct > 28 ? '#b91c1c' : row.payrollPct > 24 ? '#b45309' : '#15803d' }}>
                      {formatPct(row.payrollPct, 1)}
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

      {/* Revenue AI Findings */}
      {revenueAnomalies.length > 0 && (
        <AIFlagsPanel findings={revenueAnomalies} title="Revenue AI Findings" />
      )}
    </div>
  );
}
