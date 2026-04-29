import { HOTELS, REVENUE_DATA, LABOUR_DATA, DAILY_METRICS, AI_ANOMALIES, AI_FORECASTS, getBriefByModule } from '@hos/shared';
import { RevenueSummaryCards } from '@/components/revenue/RevenueSummaryCards';
import { HotelRevenueTable } from '@/components/revenue/HotelRevenueTable';
import { RevenueMixTable } from '@/components/revenue/RevenueMixTable';
import { OpportunityLeakageTable } from '@/components/revenue/OpportunityLeakageTable';
import { RevLabourEfficiencyTable } from '@/components/revenue/RevLabourEfficiencyTable';
import { PricingPowerTable } from '@/components/revenue/PricingPowerTable';
import { AIFlagsPanel } from '@/components/common/AIFlagsPanel';
import { AIBrief } from '@/components/ai/AIBrief';
import { ForecastWidget } from '@/components/ai/ForecastWidget';

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-sm font-bold uppercase tracking-wide mb-3" style={{ color: '#6a6a6a' }}>
      {children}
    </h2>
  );
}

export default function RevenuePage() {
  const revenueRows = HOTELS.map((hotel) => ({
    hotel,
    revenue: REVENUE_DATA.find((r) => r.hotelId === hotel.id)!,
  }));

  const efficiencyRows = HOTELS.map((hotel) => ({
    hotel,
    revenue: REVENUE_DATA.find((r) => r.hotelId === hotel.id)!,
    labour: LABOUR_DATA.find((l) => l.hotelId === hotel.id)!,
  }));

  const leakageRows = HOTELS.map((hotel) => ({
    hotel,
    revenue: REVENUE_DATA.find((r) => r.hotelId === hotel.id)!,
    daily: DAILY_METRICS.find((d) => d.hotelId === hotel.id)!,
  }));

  const revenueAnomalies = AI_ANOMALIES.filter((a) => a.module === 'revenue');
  const brief = getBriefByModule('revenue')!;
  const revenueForecast = AI_FORECASTS.find((f) => f.id === 'fc-001')!;

  return (
    <div className="flex flex-col gap-8">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-bold" style={{ color: '#222222' }}>Revenue</h1>
        <p className="text-sm mt-0.5" style={{ color: '#929292' }}>Yesterday · All 16 Hotels</p>
      </div>

      {/* AI Brief */}
      <AIBrief brief={brief} />

      {/* Summary KPI cards */}
      <RevenueSummaryCards data={REVENUE_DATA} />

      {/* Forecast widget — AI #14 */}
      <ForecastWidget forecast={revenueForecast} />

      {/* Hotel revenue table */}
      <div>
        <SectionTitle>Hotel Revenue Breakdown</SectionTitle>
        <HotelRevenueTable rows={revenueRows} />
      </div>

      {/* Revenue mix */}
      <div>
        <SectionTitle>Revenue Mix by Source</SectionTitle>
        <RevenueMixTable rows={revenueRows} />
      </div>

      {/* Opportunity leakage */}
      <div>
        <SectionTitle>Opportunity Leakage — Unsold Rooms</SectionTitle>
        <OpportunityLeakageTable rows={leakageRows} />
      </div>

      {/* Revenue vs Labour efficiency */}
      <div>
        <SectionTitle>Revenue / Labour Efficiency</SectionTitle>
        <RevLabourEfficiencyTable rows={efficiencyRows} />
      </div>

      {/* Pricing power */}
      <div>
        <SectionTitle>Pricing Power vs. Market</SectionTitle>
        <PricingPowerTable rows={revenueRows} />
      </div>

      {/* AI findings (replaces static Red Flags) */}
      <AIFlagsPanel findings={revenueAnomalies} title="Revenue AI Findings" />
    </div>
  );
}
