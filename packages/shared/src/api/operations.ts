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

// ── Property operational stats from night_audit_rows ───────────────────────
// Drives the status pills at the top of the operations property view.

export const OpsStatMetricSchema = z.object({
  /** Bucket key, e.g. 'OOO', 'Dirty', 'Clean', 'Rooms Vacant', 'Rooms Sold', etc. */
  type:  z.string(),
  today: z.number(),
  mtd:   z.number(),
  ytd:   z.number(),
});
export type ApiOpsStatMetric = z.infer<typeof OpsStatMetricSchema>;

export const PropertyOpsStatsSchema = z.object({
  hotelId:    z.string(),
  /** Latest report_date used for these counts, or null if there's no data. */
  reportDate: z.string().nullable(),
  metrics:    z.array(OpsStatMetricSchema),
});
export type ApiPropertyOpsStats = z.infer<typeof PropertyOpsStatsSchema>;

export const GetPropertyOpsStatsResponseSchema = z.object({
  stats: PropertyOpsStatsSchema.nullable(),
});
export type GetPropertyOpsStatsResponse = z.infer<typeof GetPropertyOpsStatsResponseSchema>;

// ── Per-room snapshot rows (drives the room grid) ──────────────────────────
export const RoomSnapshotRowSchema = z.object({
  hotelId:           z.string(),
  roomNumber:        z.string(),
  /** Derived from the leading digits of roomNumber (e.g. "215" → 2). */
  floor:             z.number().int(),
  /** Mapped status: Occupied | Stayover | Assigned | Available | Dirty | OOO | raw label. */
  type:              z.string(),
  rawOccStatus:      z.string().nullable(),
  rawReservationStatus: z.string().nullable(),
  matchStatus:       z.enum(['Mapped', 'Needs Review']),
  capturedAt:        z.string(),
});
export type ApiRoomSnapshotRow = z.infer<typeof RoomSnapshotRowSchema>;

export const GetPropertyRoomsResponseSchema = z.object({
  rooms: z.array(RoomSnapshotRowSchema),
});
export type GetPropertyRoomsResponse = z.infer<typeof GetPropertyRoomsResponseSchema>;

// ── Portfolio-level ops summary (one row per hotel) ────────────────────────
export const PortfolioOpsRowSchema = z.object({
  hotelId:   z.string(),
  /** Total rooms with at least one snapshot. */
  totalRooms: z.number().int().nonnegative(),
  /** Buckets — sum across all rooms in latest snapshot per room. */
  occupied:  z.number().int().nonnegative(),
  stayover:  z.number().int().nonnegative(),
  assigned:  z.number().int().nonnegative(),
  available: z.number().int().nonnegative(),
  dirty:     z.number().int().nonnegative(),
  /** Anything that didn't match the spec — surfaced for review. */
  needsReview: z.number().int().nonnegative(),
  /** ISO timestamp of the most recent captured_at across this hotel's rooms. */
  latestCapturedAt: z.string().nullable(),
});
export type ApiPortfolioOpsRow = z.infer<typeof PortfolioOpsRowSchema>;

export const GetPortfolioOpsResponseSchema = z.object({
  rows: z.array(PortfolioOpsRowSchema),
});
export type GetPortfolioOpsResponse = z.infer<typeof GetPortfolioOpsResponseSchema>;
