import { z } from 'zod';

export const AlertSeveritySchema = z.enum(['critical', 'warning', 'info']);
export const AlertModuleSchema   = z.enum(['labour', 'revenue', 'operations', 'maintenance']);
export const AnomalyKindSchema   = z.enum(['new', 'trending', 'recurring', 'resolved']);

export const AnomalyFindingSchema = z.object({
  id:          z.string(),
  hotelId:     z.string(),
  module:      AlertModuleSchema,
  severity:    AlertSeveritySchema,
  kind:        AnomalyKindSchema,
  headline:    z.string(),
  detail:      z.string(),
  metricChain: z.array(z.string()),
  detectedAt:  z.string(),
});
export type ApiAnomalyFinding = z.infer<typeof AnomalyFindingSchema>;

export const GetAnomaliesResponseSchema = z.object({
  anomalies: z.array(AnomalyFindingSchema),
});
export type GetAnomaliesResponse = z.infer<typeof GetAnomaliesResponseSchema>;
