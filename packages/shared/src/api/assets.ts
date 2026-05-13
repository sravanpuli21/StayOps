// Speculative — backend schema TBD in Phase 2.
import { z } from 'zod';
import type { RoomInventoryItem } from '../types/operations';

const asArray = <T>() => z.array(z.any() as unknown as z.ZodType<T>);

export const GetAssetsResponseSchema = z.object({
  assets: asArray<RoomInventoryItem>(),
});
export type GetAssetsResponse = z.infer<typeof GetAssetsResponseSchema>;

export const AssetHotelSummarySchema = z.object({
  hotelId: z.string(),
}).passthrough();
export type ApiAssetHotelSummary = z.infer<typeof AssetHotelSummarySchema>;

export const GetAssetSummaryResponseSchema = z.object({
  summaries: z.array(AssetHotelSummarySchema),
});
export type GetAssetSummaryResponse = z.infer<typeof GetAssetSummaryResponseSchema>;

export const VendorSpendSchema = z.object({
  hotelIds: z.array(z.string()),
}).passthrough();
export type ApiVendorSpend = z.infer<typeof VendorSpendSchema>;

export const GetVendorSpendResponseSchema = z.object({
  vendors: z.array(VendorSpendSchema),
});
export type GetVendorSpendResponse = z.infer<typeof GetVendorSpendResponseSchema>;
