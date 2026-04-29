import { Sparkles, Calendar, DollarSign } from 'lucide-react';
import type { CapexPrediction } from '@hos/shared';
import { HOTELS, formatCurrency } from '@hos/shared';
import { RecommendationCard } from '@/components/ai/RecommendationCard';

interface Props {
  predictions: CapexPrediction[];
}

const CONFIDENCE_COLOR = {
  high:   { bg: '#f0fdf4', color: '#15803d' },
  medium: { bg: '#fffbeb', color: '#b45309' },
  low:    { bg: '#f5f3ff', color: '#6d28d9' },
} as const;

export function CapExPlanningSection({ predictions }: Props) {
  const totalCost = predictions.reduce((s, p) => s + p.estimatedCost, 0);

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: 'rgba(255,56,92,0.1)' }}
        >
          <Sparkles className="w-4 h-4" style={{ color: '#ff385c' }} />
        </div>
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wide" style={{ color: '#ff385c' }}>
            AI CapEx Planning
          </h2>
          <p className="text-xs" style={{ color: '#929292' }}>
            {predictions.length} predictions · {formatCurrency(totalCost, true)} total over next 4 quarters
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {predictions.map((p) => {
          const cfg = CONFIDENCE_COLOR[p.confidence];
          return (
            <div
              key={p.id}
              className="rounded-2xl p-5"
              style={{ background: '#ffffff', border: '1px solid #dddddd' }}
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span
                      className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide"
                      style={{ background: 'rgba(255,56,92,0.1)', color: '#ff385c' }}
                    >
                      {p.assetCategory.toUpperCase()}
                    </span>
                    <span
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
                      style={{ background: '#f7f7f7', color: '#6a6a6a' }}
                    >
                      <Calendar className="w-3 h-3" /> {p.dueQuarter}
                    </span>
                    <span
                      className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide"
                      style={{ background: cfg.bg, color: cfg.color }}
                    >
                      {p.confidence.toUpperCase()} CONFIDENCE
                    </span>
                  </div>
                  <p className="font-semibold text-sm leading-snug" style={{ color: '#222222' }}>
                    {p.unitCount} {p.assetCategory} units across {p.affectedHotelIds.length} {p.affectedHotelIds.length === 1 ? 'property' : 'properties'}
                  </p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <DollarSign className="w-4 h-4" style={{ color: '#ff385c' }} />
                  <span className="text-xl font-bold" style={{ color: '#222222' }}>
                    {formatCurrency(p.estimatedCost, true)}
                  </span>
                </div>
              </div>

              <p className="text-sm leading-relaxed mb-3" style={{ color: '#6a6a6a' }}>
                {p.rationale}
              </p>

              <div className="flex flex-wrap gap-1.5 mb-3">
                <span className="text-[10px] font-bold uppercase tracking-wide mr-1" style={{ color: '#929292' }}>
                  Hotels ({p.affectedHotelIds.length})
                </span>
                {p.affectedHotelIds.slice(0, 8).map((hid) => {
                  const hotel = HOTELS.find((h) => h.id === hid);
                  return (
                    <span
                      key={hid}
                      className="px-2 py-0.5 rounded-full text-[10px] font-medium"
                      style={{ background: '#f7f7f7', border: '1px solid #eeeeee', color: '#6a6a6a' }}
                    >
                      {hotel?.shortName ?? hid}
                    </span>
                  );
                })}
                {p.affectedHotelIds.length > 8 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-medium" style={{ color: '#929292' }}>
                    +{p.affectedHotelIds.length - 8} more
                  </span>
                )}
              </div>

              <RecommendationCard
                recommendation={{
                  id: `capex-rec-${p.id}`,
                  findingId: p.id,
                  hotelId: p.affectedHotelIds[0] ?? '',
                  action: `Approve Q${p.dueQuarter} CapEx for ${p.assetCategory} — ${p.unitCount} units, ${formatCurrency(p.estimatedCost, true)}`,
                  rationale: p.rationale,
                  projectedImpact: `${p.unitCount} units replaced · est. ${formatCurrency(Math.round(p.estimatedCost * 0.1), true)} avoided repair spend`,
                  confidence: p.confidence,
                  status: 'pending',
                }}
                compact
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
