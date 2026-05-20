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

// ── Front-desk: log a guest-request / maintenance ticket ──────────────────
export const CreateTicketRequestSchema = z.object({
  hotelCode:   z.string().min(1),
  roomNumber:  z.string().min(1).optional(),
  area:        z.string().min(1).optional(),
  type:        z.enum(['reactive', 'preventive', 'audit', 'escalation']).default('reactive'),
  priority:    z.enum(['urgent', 'high', 'normal', 'low']).default('normal'),
  title:       z.string().min(1),
  description: z.string().optional(),
  reportedBy:  z.string().optional(),
  department:  z.enum(['Front Desk', 'Housekeeping', 'Maintenance', 'Engineering']).optional(),
  /** Free-text request type label (e.g. "Extra towels", "AC not cooling"). */
  requestType:       z.string().min(1).optional(),
  callbackRequired:  z.boolean().optional(),
});
export type CreateTicketRequest = z.infer<typeof CreateTicketRequestSchema>;

// ── Front-desk: state-change actions on an existing ticket ────────────────
export const UpdateTicketStatusSchema = z.object({
  status: z.enum([
    'open', 'assigned', 'in_progress', 'completed',
    'callback_pending', 'closed', 'reopened', 'escalated',
  ]),
  note:   z.string().optional(),
  actor:  z.string().optional(),
});
export type UpdateTicketStatusRequest = z.infer<typeof UpdateTicketStatusSchema>;

export const AddTicketNoteSchema = z.object({
  note:  z.string().min(1),
  actor: z.string().optional(),
});
export type AddTicketNoteRequest = z.infer<typeof AddTicketNoteSchema>;

// ── Employee punch in / punch out ─────────────────────────────────────────
export const PunchRequestSchema = z.object({
  hotelCode:  z.string().min(1),
  employeeId: z.string().min(1),
  pin:        z.string().min(1),
  kind:       z.enum(['in', 'out']),
});
export type PunchRequest = z.infer<typeof PunchRequestSchema>;

export const PunchRowSchema = z.object({
  id:         z.string(),
  employeeId: z.string(),
  fullName:   z.string(),
  department: z.string().nullable(),
  kind:       z.enum(['in', 'out']),
  punchedAt:  z.string(),
});
export type ApiPunchRow = z.infer<typeof PunchRowSchema>;

export const PunchResponseSchema = z.object({
  ok:     z.literal(true),
  punch:  PunchRowSchema,
});
export type PunchResponse = z.infer<typeof PunchResponseSchema>;

export const GetPunchesResponseSchema = z.object({
  punches: z.array(PunchRowSchema),
});
export type GetPunchesResponse = z.infer<typeof GetPunchesResponseSchema>;

export const CallbackActionSchema = z.object({
  /** confirmed → close; not_available → keep callback_pending; reopen → status=reopened. */
  action: z.enum(['confirmed', 'not_available', 'reopen']),
  note:   z.string().optional(),
  actor:  z.string().optional(),
});
export type CallbackActionRequest = z.infer<typeof CallbackActionSchema>;

export const CreateTicketResponseSchema = z.object({
  ok:     z.literal(true),
  /** The inserted MaintenanceTicket — typed loosely here to avoid a circular
   *  import; consumers should cast to the in-memory MaintenanceTicket shape. */
  ticket: z.record(z.string(), z.unknown()),
});
export type CreateTicketResponse = z.infer<typeof CreateTicketResponseSchema>;
