export type RoomStatus = 'ready' | 'dirty' | 'inspecting' | 'ooo' | 'blocked' | 'occupied';
export type RoomType = 'King' | 'Queen' | 'Suite';
export type HkStatus = 'clean' | 'dirty' | 'inspected';
export type TicketType = 'reactive' | 'preventive' | 'audit' | 'escalation';
export type TicketStatus = 'open' | 'in_progress' | 'pending_part' | 'resolved' | 'escalated' | 'scheduled';
export type TicketPriority = 'urgent' | 'high' | 'normal' | 'low';
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
  estimatedCost?: number;
  revenueLost?: number;
  activity: TicketActivity[];
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
}
