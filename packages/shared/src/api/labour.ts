import { z } from 'zod';
import { ResolvedRangeSchema } from './date-range';
import { HealthStatusSchema } from './revenue';

export const DepartmentNameSchema = z.enum([
  'Housekeeping', 'Front Desk', 'Maintenance', 'Kitchen', 'Market', 'Event Space',
]);

export const DepartmentLabourSchema = z.object({
  department:     DepartmentNameSchema,
  scheduledHours: z.number(),
  clockedHours:   z.number(),
  variance:       z.number(),
  overtimeHours:  z.number(),
  payrollCost:    z.number(),
});

export const LabourMetricsSchema = z.object({
  hotelId:        z.string(),
  scheduledHours: z.number(),
  clockedHours:   z.number(),
  variance:       z.number(),
  overtimeHours:  z.number(),
  payrollCost:    z.number(),
  departments:    z.array(DepartmentLabourSchema),
  health:         HealthStatusSchema,
});
export type ApiLabourMetrics = z.infer<typeof LabourMetricsSchema>;

export const GetLabourScopedResponseSchema = z.object({
  rows: z.array(LabourMetricsSchema),
  range: ResolvedRangeSchema,
});
export type GetLabourScopedResponse = z.infer<typeof GetLabourScopedResponseSchema>;

export const GetLabourPropertyResponseSchema = z.object({
  summary: LabourMetricsSchema.nullable(),
  range: ResolvedRangeSchema,
});
export type GetLabourPropertyResponse = z.infer<typeof GetLabourPropertyResponseSchema>;
