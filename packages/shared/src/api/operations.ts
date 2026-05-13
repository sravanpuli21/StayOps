// Speculative — backend schema TBD in Phase 2. Match TS shape exactly.
import { z } from 'zod';
import type {
  Room, MaintenanceTicket, RoomInventoryItem,
} from '../types/operations';

const asArray = <T>() => z.array(z.any() as unknown as z.ZodType<T>);

export const GetRoomsResponseSchema = z.object({
  rooms: asArray<Room>(),
});
export type GetRoomsResponse = z.infer<typeof GetRoomsResponseSchema>;

export const GetTicketsResponseSchema = z.object({
  tickets: asArray<MaintenanceTicket>(),
});
export type GetTicketsResponse = z.infer<typeof GetTicketsResponseSchema>;

export const OpsSummarySchema = z.object({
  hotelId:           z.string(),
  readyRooms:        z.number().int().nonnegative(),
  dirtyRooms:        z.number().int().nonnegative(),
  inspectingRooms:   z.number().int().nonnegative(),
  oooRooms:          z.number().int().nonnegative(),
  blockedRooms:      z.number().int().nonnegative(),
  occupiedRooms:     z.number().int().nonnegative(),
  staleDirtyRooms:   z.number().int().nonnegative(),
  openTickets:       z.number().int().nonnegative(),
  urgentTickets:     z.number().int().nonnegative(),
  auditPassRate:     z.number(),
  lastAuditDate:     z.string(),
});
export type ApiOpsSummary = z.infer<typeof OpsSummarySchema>;

export const GetOpsSummaryResponseSchema = z.object({
  summary: OpsSummarySchema.nullable(),
});
export type GetOpsSummaryResponse = z.infer<typeof GetOpsSummaryResponseSchema>;

export const StaleDirtyRoomSchema = z.object({
  hotelId: z.string(),
  number:  z.string(),
  floor:   z.number().int(),
  type:    z.string(),
}).passthrough();
export type ApiStaleDirtyRoom = z.infer<typeof StaleDirtyRoomSchema>;

export const GetStaleDirtyResponseSchema = z.object({
  rooms: z.array(StaleDirtyRoomSchema),
});
export type GetStaleDirtyResponse = z.infer<typeof GetStaleDirtyResponseSchema>;

export const GetEmployeesResponseSchema = z.object({
  employees: asArray<Record<string, unknown>>(),  // Speculative
});
export type GetEmployeesResponse = z.infer<typeof GetEmployeesResponseSchema>;

export const GetInventoryResponseSchema = z.object({
  items: asArray<RoomInventoryItem>(),
});
export type GetInventoryResponse = z.infer<typeof GetInventoryResponseSchema>;
