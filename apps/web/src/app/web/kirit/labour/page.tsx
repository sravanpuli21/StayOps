import { HOTELS, REVENUE_DATA, LABOUR_DATA, AI_ANOMALIES, AI_RECOMMENDATIONS, AI_FORECASTS, getBriefByModule } from '@hos/shared';
import { LabourSummaryCards } from '@/components/labour/LabourSummaryCards';
import { HotelLabourTable } from '@/components/labour/HotelLabourTable';
import { LabourEfficiencyTable } from '@/components/labour/LabourEfficiencyTable';
import { AIFlagsPanel } from '@/components/common/AIFlagsPanel';
import { AIBrief } from '@/components/ai/AIBrief';
import { ForecastWidget } from '@/components/ai/ForecastWidget';
import { RecommendationCard } from '@/components/ai/RecommendationCard';

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-sm font-bold uppercase tracking-wide mb-3" style={{ color: '#6a6a6a' }}>
      {children}
    </h2>
  );
}

export default function LabourPage() {
  const labourRows = HOTELS.map((hotel) => {
    const labour = LABOUR_DATA.find((l) => l.hotelId === hotel.id)!;
    const revenue = REVENUE_DATA.find((r) => r.hotelId === hotel.id)!;
    return {
      hotel,
      labour,
      revenueTotalForPayrollPct: revenue?.totalRevenue ?? 0,
    };
  });

  const efficiencyRows = HOTELS.map((hotel) => ({
    hotel,
    revenue: REVENUE_DATA.find((r) => r.hotelId === hotel.id)!,
    labour: LABOUR_DATA.find((l) => l.hotelId === hotel.id)!,
  }));

  const labourAnomalies = AI_ANOMALIES.filter((a) => a.module === 'labour');
  const brief = getBriefByModule('labour')!;
  const labourForecast = AI_FORECASTS.find((f) => f.id === 'fc-002')!;

  // Top recommendations for labour (show as agentic cards — AI feature #4)
  const topLabourRecs = AI_RECOMMENDATIONS
    .filter((r) => labourAnomalies.some((a) => a.id === r.findingId))
    .slice(0, 3);

  return (
    <div className="flex flex-col gap-8">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-bold" style={{ color: '#222222' }}>Labour</h1>
        <p className="text-sm mt-0.5" style={{ color: '#929292' }}>Apr 7–20 · All 16 Hotels</p>
      </div>

      {/* AI Brief */}
      <AIBrief brief={brief} />

      {/* Summary KPI cards */}
      <LabourSummaryCards data={LABOUR_DATA} />

      {/* Forecast widget — AI #14 */}
      <ForecastWidget forecast={labourForecast} />

      {/* Agentic recommendations — AI #4 */}
      {topLabourRecs.length > 0 && (
        <div>
          <SectionTitle>Top Recommendations</SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {topLabourRecs.map((rec) => (
              <RecommendationCard key={rec.id} recommendation={rec} compact />
            ))}
          </div>
        </div>
      )}

      {/* Hotel labour table with drilldown */}
      <div>
        <SectionTitle>Hotel Labour Breakdown</SectionTitle>
        <p className="text-xs mb-3" style={{ color: '#929292' }}>Click any row to expand department breakdown</p>
        <HotelLabourTable rows={labourRows} />
      </div>

      {/* Efficiency table */}
      <div>
        <SectionTitle>Labour Efficiency</SectionTitle>
        <LabourEfficiencyTable rows={efficiencyRows} />
      </div>

      {/* AI findings (replaces static Red Flags) */}
      <AIFlagsPanel findings={labourAnomalies} title="Labour AI Findings" />
    </div>
  );
}
