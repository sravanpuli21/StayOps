'use client';

import { AI_ANOMALIES, AI_FORECASTS } from '@hos/shared';
import { RevenueSummaryCards } from '@/components/revenue/RevenueSummaryCards';
import { HotelRevenueTable } from '@/components/revenue/HotelRevenueTable';
import { RevenueMixTable } from '@/components/revenue/RevenueMixTable';
import { OpportunityLeakageTable } from '@/components/revenue/OpportunityLeakageTable';
import { RevLabourEfficiencyTable } from '@/components/revenue/RevLabourEfficiencyTable';
import { PricingPowerTable } from '@/components/revenue/PricingPowerTable';
import { AIFlagsPanel } from '@/components/common/AIFlagsPanel';
import { ForecastWidget } from '@/components/ai/ForecastWidget';
import { useScopedData } from '@/lib/use-scoped-data';

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-sm font-bold uppercase tracking-wide mb-3" style={{ color: '#6a6a6a' }}>
      {children}
    </h2>
  );
}

export default function RevenuePage() {
  const { hotels, hotelIdSet, scopeSub, revenueRows, labourRows, dailyRows, period } = useScopedData();

  const revRows = hotels.map((hotel) => ({
    hotel,
    revenue: revenueRows.find((r) => r.hotelId === hotel.id)!,
  }));
  const efficiencyRows = hotels.map((hotel) => ({
    hotel,
    revenue: revenueRows.find((r) => r.hotelId === hotel.id)!,
    labour: labourRows.find((l) => l.hotelId === hotel.id)!,
  }));
  const leakageRows = hotels.map((hotel) => ({
    hotel,
    revenue: revenueRows.find((r) => r.hotelId === hotel.id)!,
    daily: dailyRows.find((d) => d.hotelId === hotel.id)!,
  }));

  const revenueAnomalies = AI_ANOMALIES.filter(
    (a) => a.module === 'revenue' && hotelIdSet.has(a.hotelId),
  );
  const revenueForecast = AI_FORECASTS.find((f) => f.id === 'fc-001')!;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-xl font-bold" style={{ color: '#222222' }}>Revenue</h1>
        <p className="text-sm mt-0.5" style={{ color: '#929292' }}>{scopeSub}</p>
      </div>

      <RevenueSummaryCards data={revenueRows} periodLabel={period.label} />

      <ForecastWidget forecast={revenueForecast} />

      <div>
        <SectionTitle>Hotel Revenue Breakdown</SectionTitle>
        <HotelRevenueTable rows={revRows} />
      </div>

      <div>
        <SectionTitle>Revenue Mix by Source</SectionTitle>
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

      <AIFlagsPanel findings={revenueAnomalies} title="Revenue AI Findings" />
    </div>
  );
}
