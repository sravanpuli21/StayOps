'use client';

import { getZeroRateRoomsForHotel, formatCurrency, formatPct } from '@hos/shared';
import { useScopedData } from '@/lib/use-scoped-data';
import {
  HotelRevenueTable, RevenueMixTable, OpportunityLeakageTable,
  RevLabourEfficiencyTable, PricingPowerTable, PortfolioMix,
} from './_tables';

/**
 * Kris's (Managing Director) revenue page.
 *
 * Built fresh and self-contained — its own tables (./_tables) and KPI tiles,
 * sharing no components with Harshal's regional revenue view. Mirrors that
 * page's structure: 5 portfolio KPIs, the per-hotel breakdown, the portfolio
 * revenue-mix bucket drill-down, per-hotel mix, opportunity leakage,
 * rev/labour efficiency, and pricing power. Omits the regional-only extras
 * (GM-annotated ranking, AI findings, forecast) — the MD reads the tables.
 */
function SectionTitle({ children, subtitle }: { children: React.ReactNode; subtitle?: string }) {
  return (
    <div className="flex items-baseline justify-between mb-3">
      <h2 className="text-sm font-bold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>{children}</h2>
      {subtitle && <p className="text-xs" style={{ color: '#929292' }}>{subtitle}</p>}
    </div>
  );
}

function Kpi({ label, value, subtext }: { label: string; value: string; subtext?: string }) {
  return (
    <div className="bg-white rounded-2xl p-5 flex flex-col gap-1" style={{ border: '1px solid #dddddd', boxShadow: 'rgba(0,0,0,0.02) 0 0 0 1px, rgba(0,0,0,0.04) 0 2px 6px 0' }}>
      <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: '#929292' }}>{label}</p>
      <p className="text-3xl font-bold leading-none" style={{ color: '#222' }}>{value}</p>
      {subtext && <p className="text-xs mt-1" style={{ color: '#6a6a6a' }}>{subtext}</p>}
    </div>
  );
}

export default function KrisRevenue() {
  const {
    hotels, scopeLabel, scopeSub, period, range,
    revenueRows, labourRows, dailyRows, loading,
  } = useScopedData();

  const isCumulative = range === 'month' || range === 'ytd';
  const formatTotal = (v: number): string =>
    isCumulative ? formatCurrency(v, true) : v.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // Joined row shapes for the standalone tables.
  const revRows = hotels.flatMap((hotel) => {
    const revenue = revenueRows.find((r) => r.hotelId === hotel.id);
    return revenue ? [{ hotel, revenue }] : [];
  });
  const efficiencyRows = hotels.flatMap((hotel) => {
    const revenue = revenueRows.find((r) => r.hotelId === hotel.id);
    const labour = labourRows.find((l) => l.hotelId === hotel.id);
    return revenue && labour ? [{ hotel, revenue, labour }] : [];
  });
  const leakageRows = hotels.flatMap((hotel) => {
    const revenue = revenueRows.find((r) => r.hotelId === hotel.id);
    const daily = dailyRows.find((d) => d.hotelId === hotel.id);
    return revenue && daily ? [{ hotel, revenue, daily }] : [];
  });

  // Portfolio KPIs
  const totalRevenue = revRows.reduce((s, r) => s + r.revenue.totalRevenue, 0);
  const avgOcc = revRows.length > 0 ? revRows.reduce((s, r) => s + r.revenue.occupancyPct, 0) / revRows.length : 0;
  const avgAdr = revRows.length > 0 ? revRows.reduce((s, r) => s + r.revenue.adr, 0) / revRows.length : 0;
  const avgRevPar = revRows.length > 0 ? revRows.reduce((s, r) => s + r.revenue.revPar, 0) / revRows.length : 0;
  const zeroRateTotal = hotels.reduce((s, h) => s + getZeroRateRoomsForHotel(h.id), 0);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-xl font-bold" style={{ color: '#222' }}>Revenue — {scopeLabel}</h1>
        <p className="text-sm mt-0.5" style={{ color: '#929292' }}>{scopeSub}</p>
      </div>

      {/* Portfolio KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <Kpi label="Total Revenue" value={loading ? '—' : formatTotal(totalRevenue)} subtext={`All revenue · ${period.label}`} />
        <Kpi label="Avg Occupancy" value={loading ? '—' : formatPct(avgOcc, 1)} subtext={hotels.length > 1 ? `Across ${hotels.length} hotels` : 'This property'} />
        <Kpi label="Avg ADR" value={loading ? '—' : formatCurrency(avgAdr)} subtext="Daily rate" />
        <Kpi label="Avg RevPAR" value={loading ? '—' : formatCurrency(avgRevPar)} subtext="Per available room" />
        <Kpi label="Zero Rate Rooms" value={zeroRateTotal.toString()} subtext={hotels.length > 1 ? `${hotels.length} hotels · comp, house use, employee` : 'comp, house use, employee'} />
      </div>

      <div>
        <SectionTitle>Hotel Revenue Breakdown</SectionTitle>
        <HotelRevenueTable rows={revRows} />
      </div>

      <div>
        <SectionTitle subtitle="Tap any bucket to see the individual charge lines">Revenue Mix by Source — Portfolio</SectionTitle>
        <PortfolioMix hotelIds={hotels.map((h) => h.id)} />
      </div>

      <div>
        <SectionTitle>Revenue Mix by Source — Per Hotel</SectionTitle>
        <RevenueMixTable rows={revRows} />
      </div>

      <div>
        <SectionTitle>Opportunity Leakage — Unsold Rooms</SectionTitle>
        <OpportunityLeakageTable rows={leakageRows} />
      </div>

      <div>
        <SectionTitle>Revenue / Labour Efficiency</SectionTitle>
        <RevLabourEfficiencyTable rows={efficiencyRows} />
      </div>

      <div>
        <SectionTitle>Pricing Power vs. Market</SectionTitle>
        <PricingPowerTable rows={revRows} />
      </div>
    </div>
  );
}
