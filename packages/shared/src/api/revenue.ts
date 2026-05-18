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

// ── Revenue breakdown (new 4-level taxonomy from night_audit_rows) ──────────
// Hierarchy: Type > SubtypeGroup > Subtype (each Subtype rolls up source rows).
// Type ∈ { 'Room Revenue', 'No Show Room Revenue', 'Charges' }
// Charges' SubtypeGroups: 'Events' | 'F&B' | 'Additional Room Charges' | 'Other Charges'

export const RevenueLineSchema = z.object({
  /** Source row label as it appeared in the OnQ CSV. */
  label:  z.string(),
  /** Subtype bucket (e.g. 'Direct Room Revenue', 'Misc Charges'). */
  subtype: z.string().nullable(),
  amount: z.number(),
});
export type ApiRevenueLine = z.infer<typeof RevenueLineSchema>;

export const RevenueSubtypeGroupSchema = z.object({
  /** SubtypeGroup name. 'Not Applicable' for Room Revenue / No Show. */
  group:  z.string(),
  total:  z.number(),
  lines:  z.array(RevenueLineSchema),
});
export type ApiRevenueSubtypeGroup = z.infer<typeof RevenueSubtypeGroupSchema>;

export const RevenueTypeSchema = z.object({
  /** Type: 'Room Revenue' | 'No Show Room Revenue' | 'Charges'. */
  type:   z.string(),
  total:  z.number(),
  groups: z.array(RevenueSubtypeGroupSchema),
});
export type ApiRevenueType = z.infer<typeof RevenueTypeSchema>;

export const RevenueBreakdownSchema = z.object({
  /** Hotel code. 'PORTFOLIO' for the cross-hotel rollup. */
  hotelId: z.string(),
  total:   z.number(),
  types:   z.array(RevenueTypeSchema),
});
export type ApiRevenueBreakdown = z.infer<typeof RevenueBreakdownSchema>;

export const GetRevenueBreakdownResponseSchema = z.object({
  /** Cross-hotel rollup (always present). */
  portfolio: RevenueBreakdownSchema,
  /** One per hotel scoped in. */
  perHotel:  z.array(RevenueBreakdownSchema),
  range:     ResolvedRangeSchema,
});
export type GetRevenueBreakdownResponse = z.infer<typeof GetRevenueBreakdownResponseSchema>;
