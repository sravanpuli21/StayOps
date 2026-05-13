// Speculative — backend schema TBD in Phase 2.
import { z } from 'zod';

export const ComputedScoreSchema = z.object({
  composite:     z.number(),
  trendDirection: z.enum(['up', 'down', 'flat']),
  trendDelta:    z.number(),
}).passthrough();
export type ApiComputedScore = z.infer<typeof ComputedScoreSchema>;

export const GetGmScoresResponseSchema = z.object({
  scores: z.array(z.object({
    hotelId: z.string(),
    score:   ComputedScoreSchema,
  })),
});
export type GetGmScoresResponse = z.infer<typeof GetGmScoresResponseSchema>;

export const GetRegionalScoresResponseSchema = z.object({
  scores: z.array(z.object({
    regionalId: z.string(),
    score:      ComputedScoreSchema,
  })),
});
export type GetRegionalScoresResponse = z.infer<typeof GetRegionalScoresResponseSchema>;
