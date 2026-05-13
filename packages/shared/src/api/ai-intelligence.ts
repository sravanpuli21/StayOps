// Speculative — backend schema TBD in Phase 2. Match TS shape exactly.
import { z } from 'zod';
import type {
  DecisionLogEntry, PortfolioPattern, Forecast, Recommendation, RootCause, CapexPrediction, ModuleBrief,
} from '../types/ai';

// Pass-through schemas: we preserve the TS types from the shared package but
// keep the runtime validator loose until the real backend lands.
const asArray = <T>() => z.array(z.any() as unknown as z.ZodType<T>);

export const GetIntelligenceResponseSchema = z.object({
  decisions:         asArray<DecisionLogEntry>(),
  patterns:          asArray<PortfolioPattern>(),
  forecasts:         asArray<Forecast>(),
  recommendations:   asArray<Recommendation>(),
  rootCauses:        asArray<RootCause>(),
  capexPredictions:  asArray<CapexPrediction>(),
  briefs:            asArray<ModuleBrief>(),
});
export type GetIntelligenceResponse = z.infer<typeof GetIntelligenceResponseSchema>;
