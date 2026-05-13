// Speculative — backend schema TBD in Phase 2.
import { z } from 'zod';

const asArray = <T>() => z.array(z.any() as unknown as z.ZodType<T>);

export const GetAnnualTargetsResponseSchema = z.object({
  targets: asArray<Record<string, unknown>>(),
});
export type GetAnnualTargetsResponse = z.infer<typeof GetAnnualTargetsResponseSchema>;

export const GetHotelTargetsResponseSchema = z.object({
  targets: asArray<Record<string, unknown>>(),
});
export type GetHotelTargetsResponse = z.infer<typeof GetHotelTargetsResponseSchema>;

export const GetStrategicInitiativesResponseSchema = z.object({
  initiatives: asArray<Record<string, unknown>>(),
});
export type GetStrategicInitiativesResponse = z.infer<typeof GetStrategicInitiativesResponseSchema>;

export const GetCapexPipelineResponseSchema = z.object({
  pipeline: asArray<Record<string, unknown>>(),
});
export type GetCapexPipelineResponse = z.infer<typeof GetCapexPipelineResponseSchema>;
