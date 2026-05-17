'use client';

import { useAnomalies, useAiRecommendations, useAiForecasts } from '@/lib/ai-data';
import { LabourSummaryCards } from '@/components/labour/LabourSummaryCards';
import { HotelLabourTable } from '@/components/labour/HotelLabourTable';
import { LabourEfficiencyTable } from '@/components/labour/LabourEfficiencyTable';
import { AIFlagsPanel } from '@/components/common/AIFlagsPanel';
import { ForecastWidget } from '@/components/ai/ForecastWidget';
import { RecommendationCard } from '@/components/ai/RecommendationCard';
import { useScopedData } from '@/lib/use-scoped-data';

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-sm font-bold uppercase tracking-wide mb-3" style={{ color: '#6a6a6a' }}>
      {children}
    </h2>
  );
}

export default function LabourPage() {
  const { hotels, hotelIdSet, scopeSub, labourRows, revenueRows, period } = useScopedData();

  // Filter hotels to those with labour data; revenue is optional (used only for payroll %).
  const breakdown = hotels.flatMap((hotel) => {
    const labour = labourRows.find((l) => l.hotelId === hotel.id);
    if (!labour) return [];
    const revenue = revenueRows.find((r) => r.hotelId === hotel.id);
    return [{
      hotel,
      labour,
      revenueTotalForPayrollPct: revenue?.totalRevenue ?? 0,
    }];
  });

  const efficiency = hotels.flatMap((hotel) => {
    const revenue = revenueRows.find((r) => r.hotelId === hotel.id);
    const labour = labourRows.find((l) => l.hotelId === hotel.id);
    if (!revenue || !labour) return [];
    return [{ hotel, revenue, labour }];
  });

  const labourAnomalies = useAnomalies().filter(
    (a) => a.module === 'labour' && hotelIdSet.has(a.hotelId),
  );
  const labourForecast = useAiForecasts().find((f) => f.id === 'fc-002');
  const topLabourRecs = useAiRecommendations()
    .filter((r) => labourAnomalies.some((a) => a.id === r.findingId))
    .slice(0, 3);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-xl font-bold" style={{ color: '#222222' }}>Labour</h1>
        <p className="text-sm mt-0.5" style={{ color: '#929292' }}>{scopeSub}</p>
      </div>

      <LabourSummaryCards data={labourRows} periodLabel={period.label} />

      <div>
        <SectionTitle>Hotel Labour Breakdown</SectionTitle>
        <p className="text-xs mb-3" style={{ color: '#929292' }}>Click any row to expand department breakdown</p>
        <HotelLabourTable rows={breakdown} />
      </div>

      <div>
        <SectionTitle>Labour Efficiency</SectionTitle>
        <LabourEfficiencyTable rows={efficiency} />
      </div>

      <AIFlagsPanel findings={labourAnomalies} title="Labour AI Findings" />

      {labourForecast && <ForecastWidget forecast={labourForecast} />}

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
    </div>
  );
}
