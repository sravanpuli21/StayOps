import type { HealthStatus } from './hotel';

export interface RevenueMix {
  room: number;
  fb: number;
  retail: number;
  events: number;
  other: number;
}

export interface RevenueSummary {
  hotelId: string;
  occupancyPct: number;
  adr: number;
  revPar: number;
  totalRevenue: number;
  roomRevenue: number;
  nonRoomRevenue: number;
  revenueMix: RevenueMix;
  marketAdr: number;
  health: HealthStatus;
}

export type DepartmentName =
  | 'Housekeeping'
  | 'Front Desk'
  | 'Maintenance'
  | 'Kitchen'
  | 'Market'
  | 'Event Space';

export interface DepartmentLabour {
  department: DepartmentName;
  scheduledHours: number;
  clockedHours: number;
  variance: number;
  overtimeHours: number;
  payrollCost: number;
}

export interface LabourMetrics {
  hotelId: string;
  scheduledHours: number;
  clockedHours: number;
  variance: number;
  overtimeHours: number;
  payrollCost: number;
  departments: DepartmentLabour[];
  health: HealthStatus;
}

export interface DailyMetrics {
  hotelId: string;
  date: string;
  roomsSold: number;
  roomsOoo: number;
  avgCustomerRating: number;
  occupancyPct: number;
}

export interface PortfolioSummary {
  totalRevenue: number;
  roomRevenue: number;
  totalOccupancyPct: number;
  roomsNotSold: number;
  roomsOoo: number;
  totalScheduledHours: number;
  totalClockedHours: number;
  labourVariance: number;
  avgCustomerRating: number;
}
