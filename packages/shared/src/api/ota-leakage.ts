import { z } from 'zod';

export const OtaChannelKeySchema = z.enum([
  'direct', 'brand', 'booking', 'expedia', 'agoda', 'priceline', 'hopper', 'hoteltonight',
]);
export type ApiOtaChannelKey = z.infer<typeof OtaChannelKeySchema>;

export const OtaChannelRowSchema = z.object({
  hotelId:              z.string(),
  channel:              OtaChannelKeySchema,
  bookings:             z.number().int().nonnegative(),
  grossAdr:             z.number(),
  commissionPct:        z.number(),
  otherFeesPerBooking:  z.number(),
  cancellationPct:      z.number(),
  noShowPct:            z.number(),
  refundLossPerBooking: z.number(),
});
export type ApiOtaChannelRow = z.infer<typeof OtaChannelRowSchema>;

export const GetOtaChannelRowsResponseSchema = z.object({
  rows: z.array(OtaChannelRowSchema),
});
export type GetOtaChannelRowsResponse = z.infer<typeof GetOtaChannelRowsResponseSchema>;
