import { z } from 'zod';

export const HotelSchema = z.object({
  id: z.string(),
  code: z.string(),
  name: z.string(),
  shortName: z.string(),
  rooms: z.number().int().positive(),
  brand: z.enum(['Hilton', 'Marriott', 'Choice', 'IHG', 'Wyndham']),
  city: z.string(),
  state: z.string(),
});

export const GetHotelsResponseSchema = z.object({
  hotels: z.array(HotelSchema),
});
export type GetHotelsResponse = z.infer<typeof GetHotelsResponseSchema>;
