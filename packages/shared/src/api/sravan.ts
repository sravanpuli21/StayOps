// Speculative — backend schema TBD in Phase 2. Match the existing TS shapes
// in packages/shared/src/data/sravan.ts so the hook rewrite is mechanical.
import { z } from 'zod';

const asArray = <T>() => z.array(z.any() as unknown as z.ZodType<T>);
const asObj   = <T>() => z.any() as unknown as z.ZodType<T>;

export const GetSravanProfileResponseSchema = z.object({
  profile: asObj<Record<string, unknown>>(),
});
export type GetSravanProfileResponse = z.infer<typeof GetSravanProfileResponseSchema>;

export const GetSravanScheduleResponseSchema = z.object({
  shifts: asArray<Record<string, unknown>>(),
});
export type GetSravanScheduleResponse = z.infer<typeof GetSravanScheduleResponseSchema>;

export const GetSravanPaystubsResponseSchema = z.object({
  paystubs: asArray<Record<string, unknown>>(),
});
export type GetSravanPaystubsResponse = z.infer<typeof GetSravanPaystubsResponseSchema>;

export const GetSravanBonusesResponseSchema = z.object({
  bonuses: asArray<Record<string, unknown>>(),
});
export type GetSravanBonusesResponse = z.infer<typeof GetSravanBonusesResponseSchema>;

export const GetSravanColleaguesResponseSchema = z.object({
  colleagues: asArray<Record<string, unknown>>(),
});
export type GetSravanColleaguesResponse = z.infer<typeof GetSravanColleaguesResponseSchema>;

export const GetSravanSwapsResponseSchema = z.object({
  swaps: asArray<Record<string, unknown>>(),
});
export type GetSravanSwapsResponse = z.infer<typeof GetSravanSwapsResponseSchema>;

export const GetSravanOpenShiftsResponseSchema = z.object({
  openShifts: asArray<Record<string, unknown>>(),
});
export type GetSravanOpenShiftsResponse = z.infer<typeof GetSravanOpenShiftsResponseSchema>;

export const GetSravanSopsResponseSchema = z.object({
  sops: asArray<Record<string, unknown>>(),
});
export type GetSravanSopsResponse = z.infer<typeof GetSravanSopsResponseSchema>;
