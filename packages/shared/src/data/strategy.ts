import { HOTELS } from './hotels';
import { REVENUE_DATA } from './revenue';

// ─── Annual Targets ────────────────────────────────────────────────────────────

export interface AnnualTarget {
  metric: string;
  unit: 'currency' | 'percent' | 'number';
  target: number;
  actual: number;
  priorYear: number;
}

export const ANNUAL_TARGETS: AnnualTarget[] = [
  { metric: 'Portfolio Revenue',   unit: 'currency', target: 4_800_000, actual: 3_840_000, priorYear: 4_210_000 },
  { metric: 'Avg Occupancy',       unit: 'percent',  target: 86,        actual: 82.4,       priorYear: 79.8 },
  { metric: 'Avg ADR',             unit: 'currency', target: 168,       actual: 158,        priorYear: 149 },
  { metric: 'Portfolio RevPAR',    unit: 'currency', target: 144,       actual: 130,        priorYear: 119 },
  { metric: 'Payroll % of Rev',    unit: 'percent',  target: 28,        actual: 29.4,       priorYear: 31.2 },
  { metric: 'Guest Satisfaction',  unit: 'number',   target: 4.6,       actual: 4.3,        priorYear: 4.1 },
];

// ─── Hotel-level Targets ───────────────────────────────────────────────────────

export interface HotelTarget {
  hotelId: string;
  revenueTarget: number;
  occupancyTarget: number;
  adrTarget: number;
}

export const HOTEL_TARGETS: HotelTarget[] = [
  { hotelId: 'SAVGW',   revenueTarget: 240_000, occupancyTarget: 87, adrTarget: 168 },
  { hotelId: 'SAVVY',   revenueTarget: 260_000, occupancyTarget: 88, adrTarget: 196 },
  { hotelId: 'GA989',   revenueTarget: 310_000, occupancyTarget: 91, adrTarget: 181 },
  { hotelId: 'SAVMT',   revenueTarget: 230_000, occupancyTarget: 82, adrTarget: 164 },
  { hotelId: 'SAVMD',   revenueTarget: 280_000, occupancyTarget: 85, adrTarget: 162 },
  { hotelId: 'RISAV',   revenueTarget: 210_000, occupancyTarget: 89, adrTarget: 184 },
  { hotelId: 'SAVFP',   revenueTarget: 380_000, occupancyTarget: 93, adrTarget: 177 },
  { hotelId: 'BQKCY',   revenueTarget: 220_000, occupancyTarget: 82, adrTarget: 152 },
  { hotelId: 'BSWVE',   revenueTarget: 235_000, occupancyTarget: 85, adrTarget: 156 },
  { hotelId: 'GAA84',   revenueTarget: 205_000, occupancyTarget: 79, adrTarget: 128 },
  { hotelId: 'BQKFP',   revenueTarget: 245_000, occupancyTarget: 84, adrTarget: 153 },
  { hotelId: 'SGJES',   revenueTarget: 190_000, occupancyTarget: 86, adrTarget: 144 },
  { hotelId: 'JAXTX',   revenueTarget: 200_000, occupancyTarget: 90, adrTarget: 204 },
  { hotelId: 'DFWFW',   revenueTarget: 180_000, occupancyTarget: 88, adrTarget: 136 },
  { hotelId: 'BTRCI',   revenueTarget: 230_000, occupancyTarget: 87, adrTarget: 138 },
  { hotelId: '58090LA', revenueTarget: 170_000, occupancyTarget: 81, adrTarget: 130 },
];

export function getHotelMarketPosition() {
  return HOTELS.map((hotel) => {
    const rev = REVENUE_DATA.find((r) => r.hotelId === hotel.id)!;
    const target = HOTEL_TARGETS.find((t) => t.hotelId === hotel.id)!;
    const adrIndex = Math.round((rev.adr / rev.marketAdr) * 100);
    const occVsTarget = +(rev.occupancyPct - target.occupancyTarget).toFixed(1);
    const adrVsTarget = rev.adr - target.adrTarget;
    return {
      hotel,
      adr: rev.adr,
      marketAdr: rev.marketAdr,
      adrIndex,
      occupancyPct: rev.occupancyPct,
      occupancyTarget: target.occupancyTarget,
      occVsTarget,
      adrVsTarget,
      revPar: rev.revPar,
    };
  });
}

// ─── Strategic Initiatives ─────────────────────────────────────────────────────

export type InitiativeStatus = 'on_track' | 'at_risk' | 'behind' | 'completed';
export type InitiativeCategory = 'Revenue' | 'Cost' | 'Asset' | 'People';

export interface StrategicInitiative {
  id: string;
  title: string;
  description: string;
  category: InitiativeCategory;
  status: InitiativeStatus;
  owner: string;
  dueDate: string;
  impactLabel: string;
  impactValue: number;
  progressPct: number;
  hotelIds: string[] | 'all';
}

export const STRATEGIC_INITIATIVES: StrategicInitiative[] = [
  {
    id: 'SI-001',
    title: 'Dynamic Pricing Roll-out',
    description: 'Deploy revenue management software across all 16 properties to optimize ADR based on demand signals and competitive rates.',
    category: 'Revenue',
    status: 'on_track',
    owner: 'Harshal Patel',
    dueDate: '2026-06-30',
    impactLabel: '+$68K/yr',
    impactValue: 68000,
    progressPct: 62,
    hotelIds: 'all',
  },
  {
    id: 'SI-002',
    title: 'Housekeeping Efficiency Program',
    description: 'Reduce clocked-vs-scheduled variance in HK dept by 40% through scheduling software and cross-training.',
    category: 'Cost',
    status: 'at_risk',
    owner: 'Harshal Patel',
    dueDate: '2026-05-15',
    impactLabel: '$28K/yr savings',
    impactValue: 28000,
    progressPct: 38,
    hotelIds: ['SAVGW', 'SAVMT', 'SAVMD', 'SAVFP', 'BQKCY'],
  },
  {
    id: 'SI-003',
    title: 'SAVFP Pool Deck Renovation',
    description: 'Full pool deck resurface, new furniture, and pergola install to drive summer F&B and event revenue.',
    category: 'Asset',
    status: 'on_track',
    owner: 'Michael Chen',
    dueDate: '2026-07-01',
    impactLabel: '$180K capex',
    impactValue: 180000,
    progressPct: 25,
    hotelIds: ['SAVFP'],
  },
  {
    id: 'SI-004',
    title: 'F&B Revenue Expansion',
    description: 'Launch breakfast buffet upsell and happy-hour program at full-service properties to grow F&B mix from 16% to 20%.',
    category: 'Revenue',
    status: 'behind',
    owner: 'Harshal Patel',
    dueDate: '2026-04-30',
    impactLabel: '+$62K/yr',
    impactValue: 62000,
    progressPct: 15,
    hotelIds: ['SAVVY', 'GA989', 'SAVMT', 'BQKCY', 'BQKFP'],
  },
  {
    id: 'SI-005',
    title: 'GM Retention & Incentive Revamp',
    description: 'Restructure GM bonus program to tie 50% of variable comp to composite leadership score. Reduces turnover risk.',
    category: 'People',
    status: 'on_track',
    owner: 'Kris Patel',
    dueDate: '2026-05-01',
    impactLabel: 'Retention risk ↓',
    impactValue: 0,
    progressPct: 80,
    hotelIds: 'all',
  },
  {
    id: 'SI-006',
    title: 'SAVMT HVAC System Upgrade',
    description: 'Replace aging HVAC units (14 rooms affected) to eliminate recurring OOO status and reduce maintenance cost.',
    category: 'Asset',
    status: 'on_track',
    owner: 'Jennifer Walsh',
    dueDate: '2026-09-30',
    impactLabel: '$95K capex',
    impactValue: 95000,
    progressPct: 10,
    hotelIds: ['SAVMT'],
  },
  {
    id: 'SI-007',
    title: 'Online Reputation Recovery – GAA84',
    description: 'Address sub-4.0 review scores at Brunswick property through staff coaching, room refresh, and response SLA.',
    category: 'Revenue',
    status: 'at_risk',
    owner: 'Sandra Kim',
    dueDate: '2026-06-01',
    impactLabel: 'ADR +$8/night',
    impactValue: 24000,
    progressPct: 44,
    hotelIds: ['GAA84'],
  },
  {
    id: 'SI-008',
    title: 'Payroll Compliance Audit',
    description: 'Full audit of OT authorization workflow across portfolio following elevated OT at SAVFP and SAVMT.',
    category: 'Cost',
    status: 'completed',
    owner: 'Harshal Patel',
    dueDate: '2026-03-31',
    impactLabel: '$19K OT recovered',
    impactValue: 19000,
    progressPct: 100,
    hotelIds: ['SAVFP', 'SAVMT', 'GA989'],
  },
];

// ─── CapEx Pipeline ────────────────────────────────────────────────────────────

export type CapExStatus = 'planned' | 'approved' | 'in_progress' | 'completed' | 'on_hold';

export interface CapExItem {
  id: string;
  hotelId: string;
  project: string;
  category: 'Renovation' | 'Equipment' | 'Technology' | 'Safety' | 'Landscaping';
  budget: number;
  spent: number;
  status: CapExStatus;
  startDate: string;
  targetDate: string;
}

export const CAPEX_PIPELINE: CapExItem[] = [
  { id: 'CX-001', hotelId: 'SAVFP',   project: 'Pool Deck Renovation',        category: 'Renovation',  budget: 180000, spent: 46200,  status: 'in_progress', startDate: '2026-03-01', targetDate: '2026-07-01' },
  { id: 'CX-002', hotelId: 'SAVGW',   project: 'Room Refresh – 40 rooms',     category: 'Renovation',  budget: 160000, spent: 14800,  status: 'in_progress', startDate: '2026-04-01', targetDate: '2026-06-15' },
  { id: 'CX-003', hotelId: 'SAVMT',   project: 'HVAC System Replacement',     category: 'Equipment',   budget: 95000,  spent: 0,      status: 'approved',    startDate: '2026-07-01', targetDate: '2026-09-30' },
  { id: 'CX-004', hotelId: 'BTRCI',   project: 'Lobby Refresh',               category: 'Renovation',  budget: 48000,  spent: 48000,  status: 'completed',   startDate: '2025-11-01', targetDate: '2026-02-28' },
  { id: 'CX-005', hotelId: 'JAXTX',   project: 'PMS & POS Integration',       category: 'Technology',  budget: 32000,  spent: 32000,  status: 'completed',   startDate: '2026-01-15', targetDate: '2026-03-31' },
  { id: 'CX-006', hotelId: 'GA989',   project: 'Fire Suppression Upgrade',    category: 'Safety',      budget: 56000,  spent: 0,      status: 'planned',     startDate: '2026-08-01', targetDate: '2026-10-31' },
  { id: 'CX-007', hotelId: 'SAVVY',   project: 'Rooftop Bar Buildout',        category: 'Renovation',  budget: 220000, spent: 0,      status: 'on_hold',     startDate: '2026-06-01', targetDate: '2026-12-31' },
  { id: 'CX-008', hotelId: 'DFWFW',   project: 'EV Charging Station Install', category: 'Equipment',   budget: 28000,  spent: 5400,   status: 'in_progress', startDate: '2026-03-15', targetDate: '2026-05-15' },
  { id: 'CX-009', hotelId: 'BQKFP',   project: 'Fitness Center Equipment',    category: 'Equipment',   budget: 22000,  spent: 22000,  status: 'completed',   startDate: '2026-02-01', targetDate: '2026-03-15' },
  { id: 'CX-010', hotelId: 'RISAV',   project: 'Exterior Signage Rebrand',    category: 'Landscaping', budget: 14000,  spent: 0,      status: 'planned',     startDate: '2026-09-01', targetDate: '2026-10-15' },
];
