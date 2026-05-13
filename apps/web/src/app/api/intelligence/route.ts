import { NextResponse, type NextRequest } from 'next/server';
import {
  AI_DECISIONS, AI_PATTERNS, AI_FORECASTS, AI_RECOMMENDATIONS,
  AI_ROOT_CAUSES, AI_CAPEX_PREDICTIONS, AI_BRIEFS, AI_ANOMALIES,
  GetIntelligenceResponseSchema,
} from '@hos/shared';
import { readHotelIds } from '@/lib/server/parse-query';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Filters per record type:
 *   - decisions, recommendations, rootCauses, capexPredictions: by hotelId field
 *   - patterns: by `affectedHotelIds[]` (multi-hotel record)
 *   - forecasts: by hotelId, OR keep when no hotelId (portfolio-wide forecast)
 *   - briefs: not hotel-specific; pass through
 *
 * Tri-state hotelIds: null=all, []=none, string[]=scope.
 */
export async function GET(req: NextRequest) {
  const hotelIds = readHotelIds(req);
  const has = (id: string | undefined | null) => id != null && hotelIds!.includes(id);
  const allIn = hotelIds === null;
  const noneIn = hotelIds !== null && hotelIds.length === 0;

  const filterById = <T extends { hotelId: string }>(arr: readonly T[]): T[] =>
    allIn ? [...arr] : noneIn ? [] : arr.filter((r) => has(r.hotelId));

  const decisions        = filterById(AI_DECISIONS);
  const recommendations  = filterById(AI_RECOMMENDATIONS);
  // Root causes are joined via findingId → AnomalyFinding.hotelId.
  const findingHotel = new Map(AI_ANOMALIES.map((a) => [a.id, a.hotelId]));
  const rootCauses = allIn
    ? AI_ROOT_CAUSES
    : noneIn
      ? []
      : AI_ROOT_CAUSES.filter((rc) => has(findingHotel.get(rc.findingId)));

  // CapEx predictions use affectedHotelIds[]
  const capexPredictions = allIn
    ? AI_CAPEX_PREDICTIONS
    : noneIn
      ? []
      : AI_CAPEX_PREDICTIONS.filter((c) => c.affectedHotelIds.some((id) => hotelIds!.includes(id)));

  // Patterns use affectedHotelIds[] too
  const patterns = allIn
    ? AI_PATTERNS
    : noneIn
      ? []
      : AI_PATTERNS.filter((p) => p.affectedHotelIds.some((id) => hotelIds!.includes(id)));

  // Forecasts: per-hotel OR portfolio-wide (hotelId undefined)
  const forecasts = allIn
    ? AI_FORECASTS
    : noneIn
      ? AI_FORECASTS.filter((f) => !f.hotelId)
      : AI_FORECASTS.filter((f) => !f.hotelId || hotelIds!.includes(f.hotelId));

  // Briefs are module-level, not hotel-level — pass through
  const briefs = AI_BRIEFS;

  const body = GetIntelligenceResponseSchema.parse({
    decisions, patterns, forecasts, recommendations, rootCauses, capexPredictions, briefs,
  });
  return NextResponse.json(body);
}
