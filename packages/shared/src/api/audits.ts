// Speculative — backend schema TBD in Phase 2.
import { z } from 'zod';
import type { AuditTask } from '../types/operations';

const asArray = <T>() => z.array(z.any() as unknown as z.ZodType<T>);

export const AuditSummarySchema = z.object({
  hotelId:        z.string(),
  compliancePct:  z.number(),
  overdueRooms:   z.number().int().nonnegative(),
}).passthrough();
export type ApiAuditSummary = z.infer<typeof AuditSummarySchema>;

export const GetAuditSummaryResponseSchema = z.object({
  summary: AuditSummarySchema.nullable(),
});
export type GetAuditSummaryResponse = z.infer<typeof GetAuditSummaryResponseSchema>;

export const GetAuditTasksResponseSchema = z.object({
  tasks: asArray<AuditTask>(),
});
export type GetAuditTasksResponse = z.infer<typeof GetAuditTasksResponseSchema>;
