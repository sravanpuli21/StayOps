export type RoomStatus = 'ready' | 'dirty' | 'inspecting' | 'ooo' | 'blocked' | 'occupied';
export type RoomType = 'King' | 'Queen' | 'Suite';
export type HkStatus = 'clean' | 'dirty' | 'inspected';
export type TicketType = 'reactive' | 'preventive' | 'audit' | 'escalation';
/**
 * Ticket status — covers the front-desk Guest Request lifecycle plus the
 * legacy maintenance values kept for back-compat with seeded data.
 */
export type TicketStatus =
  | 'open' | 'assigned' | 'in_progress' | 'completed'
  | 'callback_pending' | 'closed' | 'reopened' | 'escalated'
  | 'pending_part' | 'scheduled' | 'resolved';
export type TicketPriority = 'urgent' | 'high' | 'normal' | 'low';

/** Department a ticket is routed to. */
export type TicketDepartment = 'Front Desk' | 'Housekeeping' | 'Maintenance' | 'Engineering';

/** Callback workflow state once a ticket has been completed. */
export type CallbackStatus = 'pending' | 'confirmed' | 'not_available' | 'reopened';
export type AuditTaskType = 'audit' | 'preventive';
export type AuditStatus = 'scheduled' | 'in_progress' | 'passed' | 'failed' | 'overdue';
export type ItemCategory = 'furniture' | 'appliance' | 'fixture' | 'linen' | 'electronics';
export type ItemCondition = 'good' | 'fair' | 'poor' | 'condemned';

export interface Room {
  id: string;
  hotelId: string;
  number: string;
  floor: number;
  type: RoomType;
  status: RoomStatus;
  hkStatus: HkStatus;
  lastCleaned: string | null;
  lastInspected: string | null;
  hasOpenTicket: boolean;
  oooReason?: string;
  lastGuestRating?: number;
}

export interface TicketActivity {
  timestamp: string;
  actor: string;
  action: string;
  note?: string;
}

export interface MaintenanceTicket {
  id: string;
  hotelId: string;
  roomNumber?: string;
  area?: string;
  type: TicketType;
  priority: TicketPriority;
  status: TicketStatus;
  title: string;
  description: string;
  reportedBy: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
  closedAt?: string;
  estimatedCost?: number;
  revenueLost?: number;
  activity: TicketActivity[];

  /** Front-desk additions (nullable on legacy / non-FD tickets). */
  department?: TicketDepartment;
  /** Free-text label like "Extra towels" or "AC not cooling". */
  requestType?: string;
  callbackRequired?: boolean;
  callbackStatus?: CallbackStatus | null;
}

export interface AuditTask {
  id: string;
  hotelId: string;
  roomNumber?: string;
  area?: string;
  type: AuditTaskType;
  title: string;
  scheduledDate: string;
  completedDate?: string;
  status: AuditStatus;
  score?: number;
  findings?: string[];
  assignedTo: string;
}

export interface ItemHistoryEntry {
  date: string;
  type: 'repair' | 'replacement' | 'inspection' | 'complaint';
  description: string;
  cost?: number;
  technician?: string;
}

export type AssetStatus = 'operational' | 'repair needed' | 'out of service' | 'retired';

export interface AssetAttachment {
  id: string;
  name: string;
  type: string;
  sizeKb: number;
}

export interface SensorReading {
  date: string;
  value: number;
}

export interface RoomInventoryItem {
  id: string;
  hotelId: string;
  roomNumber: string;
  name: string;
  category: ItemCategory;
  condition: ItemCondition;
  installedDate: string;
  lastServiceDate?: string;
  repairCount: number;
  totalRepairCost: number;
  replacementCost: number;
  history: ItemHistoryEntry[];

  // Rich asset details (reference design)
  description?: string;
  location?: string;
  status?: AssetStatus;

  manufacturer?: string;
  model?: string;
  serialNumber?: string;
  firstUseDate?: string;
  endOfLifeDate?: string;

  supplier?: string;
  purchaseCost?: number;
  purchaseDate?: string;
  warrantyEnd?: string;

  counterType?: string;
  counterUnit?: string;
  readings?: SensorReading[];

  attachments?: AssetAttachment[];
}
