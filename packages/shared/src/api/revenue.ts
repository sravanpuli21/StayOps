import { z } from 'zod';
import { ResolvedRangeSchema } from './date-range';

export const HealthStatusSchema = z.enum(['green', 'amber', 'red']);

export const RevenueMixSchema = z.object({
  room:   z.number(),
  fb:     z.number(),
  retail: z.number(),
  events: z.number(),
  other:  z.number(),
});

export const RevenueSummarySchema = z.object({
  hotelId:        z.string(),
  occupancyPct:   z.number(),
  adr:            z.number(),
  revPar:         z.number(),
  totalRevenue:   z.number(),
  roomRevenue:    z.number(),
  nonRoomRevenue: z.number(),
  revenueMix:     RevenueMixSchema,
  marketAdr:      z.number(),
  health:         HealthStatusSchema,
});
export type ApiRevenueSummary = z.infer<typeof RevenueSummarySchema>;

export const GetRevenueScopedResponseSchema = z.object({
  rows: z.array(RevenueSummarySchema),
  range: ResolvedRangeSchema,
});
export type GetRevenueScopedResponse = z.infer<typeof GetRevenueScopedResponseSchema>;

export const GetRevenuePropertyResponseSchema = z.object({
  summary: RevenueSummarySchema.nullable(),
  range: ResolvedRangeSchema,
});
export type GetRevenuePropertyResponse = z.infer<typeof GetRevenuePropertyResponseSchema>;
