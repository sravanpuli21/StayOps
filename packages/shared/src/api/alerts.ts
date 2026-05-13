import { z } from 'zod';
import { AlertModuleSchema, AlertSeveritySchema } from './anomalies';

export const RedFlagSchema = z.object({
  id:        z.string(),
  hotelId:   z.string(),
  module:    AlertModuleSchema,
  severity:  AlertSeveritySchema,
  message:   z.string(),
  timestamp: z.string(),
}).passthrough();
export type ApiRedFlag = z.infer<typeof RedFlagSchema>;

export const GetRedFlagsResponseSchema = z.object({
  flags: z.array(RedFlagSchema),
});
export type GetRedFlagsResponse = z.infer<typeof GetRedFlagsResponseSchema>;
