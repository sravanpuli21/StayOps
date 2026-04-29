import type { HealthStatus } from './hotel';

export type AssetCategory =
  | 'HVAC/PTAC'
  | 'Elevator'
  | 'Roof'
  | 'Kitchen'
  | 'Laundry'
  | 'Pool'
  | 'POS/PMS'
  | 'Boiler'
  | 'Parking'
  | 'FF&E';

export type AssetCondition = 'good' | 'fair' | 'poor' | 'failing';

export interface Asset {
  id: string;
  hotelId: string;
  category: AssetCategory;
  label: string;
  installDate: string;
  expectedLifeYears: number;
  condition: AssetCondition;
  lastServiceDate: string;
  replacementCost: number;
  failureCount12mo: number;
  vendor: string;
}

export interface AssetWorkOrder {
  id: string;
  assetId: string;
  hotelId: string;
  date: string;
  type: 'preventive' | 'reactive';
  cost: number;
  vendor: string;
  description: string;
}

export interface AssetHotelSummary {
  hotelId: string;
  totalAssets: number;
  totalValue: number;
  agingAssets: number;
  failingAssets: number;
  ytdSpend: number;
  openWorkOrders: number;
  preventiveCompliancePct: number;
  health: HealthStatus;
}

export interface VendorSpend {
  vendor: string;
  totalSpend: number;
  workOrderCount: number;
  hotelIds: string[];
}
