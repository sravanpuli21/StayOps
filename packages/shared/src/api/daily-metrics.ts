import { z } from 'zod';
import { ResolvedRangeSchema } from './date-range';

/**
 * Rolled-up daily metrics for a single hotel over the requested window.
 * `roomsSold` / `roomsOoo` are sums; `occupancyPct` / `avgCustomerRating`
 * are room-night weighted averages. `date` is the window end-date (to) so
 * consumers can still key by hotelId.
 */
export const DailyMetricsSummarySchema = z.object({
  hotelId:           z.string(),
  date:              z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  roomsSold:         z.number().int().nonnegative(),
  roomsOoo:          z.number().int().nonnegative(),
  avgCustomerRating: z.number(),
  occupancyPct:      z.number(),
});
export type ApiDailyMetrics = z.infer<typeof DailyMetricsSummarySchema>;

export const GetDailyScopedResponseSchema = z.object({
  rows: z.array(DailyMetricsSummarySchema),
  range: ResolvedRangeSchema,
});
export type GetDailyScopedResponse = z.infer<typeof GetDailyScopedResponseSchema>;

export const GetDailyPropertyResponseSchema = z.object({
  summary: DailyMetricsSummarySchema.nullable(),
  range: ResolvedRangeSchema,
});
export type GetDailyPropertyResponse = z.infer<typeof GetDailyPropertyResponseSchema>;
