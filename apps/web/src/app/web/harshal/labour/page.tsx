'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { useAnomalies, useAiRecommendations, useAiForecasts } from '@/lib/ai-data';
import { LabourSummaryCards } from '@/components/labour/LabourSummaryCards';
import { HotelLabourTable } from '@/components/labour/HotelLabourTable';
import { LabourEfficiencyTable } from '@/components/labour/LabourEfficiencyTable';
import { PrintableLabourBreakdown } from '@/components/labour/PrintableLabourBreakdown';
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
  const { hotels, hotelIdSet, scopeLabel, scopeSub, labourRows, revenueRows, period } = useScopedData();

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
      <div className="no-print">
        <h1 className="text-xl font-bold" style={{ color: '#222222' }}>Labour</h1>
        <p className="text-sm mt-0.5" style={{ color: '#929292' }}>{scopeSub}</p>
      </div>

      {/* Labour overview (summary cards) */}
      <div className="no-print">
        <LabourSummaryCards data={labourRows} periodLabel={period.label} />
      </div>

      {/* Hotel Labour Breakdown — screen: interactive table; print: one page per hotel expanded */}
      <div>
        <SectionTitle>Hotel Labour Breakdown</SectionTitle>
        <p className="text-xs mb-3 no-print" style={{ color: '#929292' }}>
          Click any row to expand department breakdown · Printing will output {hotels.length} page{hotels.length === 1 ? '' : 's'}, one per hotel, fully expanded
        </p>
        <div className="no-print">
          <HotelLabourTable rows={breakdown} />
          {hotels.length > 1 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {hotels.map((h) => (
                <Link
                  key={h.id}
                  href={`/web/harshal/hotel/${h.id}`}
                  className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full transition-colors hover:border-[#ff385c]"
                  style={{ background: '#f7f7f7', color: '#6a6a6a', border: '1px solid #dddddd' }}
                >
                  {h.shortName}
                  <ChevronRight className="w-3 h-3" />
                </Link>
              ))}
            </div>
          )}
        </div>
        {/* Print-only: expanded per-hotel view */}
        <PrintableLabourBreakdown rows={breakdown} periodLabel={period.label} scopeLabel={scopeLabel} />
      </div>

      {/* Labour Efficiency */}
      <div className="no-print">
        <SectionTitle>Labour Efficiency</SectionTitle>
        <LabourEfficiencyTable rows={efficiency} />
      </div>

      {/* Labour AI Findings */}
      <div className="no-print">
        <AIFlagsPanel findings={labourAnomalies} title="Labour AI Findings" />
      </div>

      {/* Forecast & What-If */}
      {labourForecast && (
        <div className="no-print">
          <ForecastWidget forecast={labourForecast} />
        </div>
      )}

      {/* Top Recommendations */}
      {topLabourRecs.length > 0 && (
        <div className="no-print">
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
