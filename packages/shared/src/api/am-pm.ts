// Speculative — backend schema TBD in Phase 2.
import { z } from 'zod';
import type { AmPmSnapshot } from '../data/am-pm-report';

const asArray = <T>() => z.array(z.any() as unknown as z.ZodType<T>);

export const AmPmReportQuerySchema = z.object({
  slot:    z.enum(['AM', 'PM']),
  hotelId: z.string().optional(),
});
export type AmPmReportQuery = z.infer<typeof AmPmReportQuerySchema>;

export const GetAmPmReportResponseSchema = z.object({
  slot:        z.enum(['AM', 'PM']),
  generatedAt: z.string(),
  label:       z.string(),
  rows:        asArray<AmPmSnapshot>(),
});
export type GetAmPmReportResponse = z.infer<typeof GetAmPmReportResponseSchema>;
