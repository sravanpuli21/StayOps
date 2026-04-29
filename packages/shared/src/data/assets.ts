import type { Asset, AssetWorkOrder, AssetHotelSummary, AssetCategory, AssetCondition, VendorSpend } from '../types/assets';
import { HOTELS } from './hotels';

interface AssetSeed {
  category: AssetCategory;
  label: string;
  installYear: number;
  life: number;
  cost: number;
  condition: AssetCondition;
  failures: number;
  lastService: string;
  vendor: string;
}

// Common asset template per hotel — varied by property characteristics below
const BASE_TEMPLATE: AssetSeed[] = [
  { category: 'HVAC/PTAC',  label: 'PTAC units (guestroom)', installYear: 2019, life: 8,  cost: 92000, condition: 'fair',   failures: 5, lastService: '2026-04-12', vendor: 'GE Zoneline Service' },
  { category: 'Elevator',   label: 'Passenger elevator',      installYear: 2014, life: 25, cost: 38000, condition: 'good',   failures: 1, lastService: '2026-03-04', vendor: 'Otis' },
  { category: 'Roof',       label: 'Main roof membrane',      installYear: 2012, life: 20, cost: 78000, condition: 'fair',   failures: 2, lastService: '2025-11-18', vendor: 'Southern Roofing Co.' },
  { category: 'Kitchen',    label: 'Commercial range + hood', installYear: 2017, life: 12, cost: 24000, condition: 'fair',   failures: 1, lastService: '2026-02-20', vendor: 'Restaurant Depot Service' },
  { category: 'Laundry',    label: 'Commercial washer bank',  installYear: 2018, life: 10, cost: 18000, condition: 'good',   failures: 0, lastService: '2026-03-28', vendor: 'Continental Girbau' },
  { category: 'Pool',       label: 'Pool heater + pump',      installYear: 2020, life: 10, cost: 14000, condition: 'good',   failures: 0, lastService: '2026-04-02', vendor: 'Pentair Service' },
  { category: 'POS/PMS',    label: 'Front-office PMS server', installYear: 2019, life: 7,  cost: 9000,  condition: 'fair',   failures: 0, lastService: '2026-04-15', vendor: 'Opera Cloud Support' },
  { category: 'Boiler',     label: 'Domestic hot water boiler',installYear: 2016, life: 15, cost: 32000, condition: 'good',   failures: 0, lastService: '2026-03-11', vendor: 'A.O. Smith Tech' },
  { category: 'Parking',    label: 'Parking lot lighting',    installYear: 2013, life: 15, cost: 11000, condition: 'fair',   failures: 1, lastService: '2025-12-05', vendor: 'Brite-Lite Electric' },
  { category: 'FF&E',       label: 'Guestroom soft-goods',    installYear: 2020, life: 7,  cost: 120000, condition: 'good',   failures: 0, lastService: '2025-10-01', vendor: 'HD Supply' },
];

// Property-specific overrides — aging/failing Savannah PTACs, new full-service kitchens, etc.
const HOTEL_OVERRIDES: Record<string, Partial<Record<AssetCategory, Partial<AssetSeed>>>> = {
  SAVMT: { 'HVAC/PTAC': { condition: 'failing', failures: 11, installYear: 2018 } },
  SAVGW: { 'HVAC/PTAC': { condition: 'poor',    failures: 7,  installYear: 2019 } },
  SAVMD: { 'HVAC/PTAC': { condition: 'poor',    failures: 6,  installYear: 2019 } },
  GA989: { 'HVAC/PTAC': { condition: 'poor',    failures: 8,  installYear: 2018 }, 'Kitchen': { condition: 'fair', failures: 3, installYear: 2015 } },
  SAVVY: { 'Roof':      { condition: 'poor',    failures: 4,  installYear: 2008 } },
  BQKCY: { 'Roof':      { condition: 'poor',    failures: 3,  installYear: 2010 }, 'HVAC/PTAC': { condition: 'fair', failures: 3 } },
  SAVFP: { 'Kitchen':   { condition: 'fair',    failures: 4,  installYear: 2016 }, 'Laundry': { condition: 'fair', failures: 2, installYear: 2018 } },
  BQKFP: { 'Laundry':   { condition: 'fair',    failures: 3,  installYear: 2017 } },
  DFWFW: { 'Laundry':   { condition: 'poor',    failures: 5,  installYear: 2019 } },
  BSWVE: { 'HVAC/PTAC': { condition: 'fair',    failures: 4 } },
  GAA84: { 'FF&E':      { condition: 'fair',    failures: 0,  installYear: 2018 } },
  BTRCI: {},
  SGJES: {},
  JAXTX: {},
  RISAV: {},
  '58090LA': { 'Pool': { condition: 'fair', failures: 1, installYear: 2017 } },
};

export const ASSETS: Asset[] = HOTELS.flatMap((hotel) => {
  const overrides = HOTEL_OVERRIDES[hotel.id] ?? {};
  return BASE_TEMPLATE.map((seed, i) => {
    const ov = overrides[seed.category] ?? {};
    const merged = { ...seed, ...ov };
    return {
      id: `${hotel.id}-A${String(i + 1).padStart(2, '0')}`,
      hotelId: hotel.id,
      category: merged.category,
      label: merged.label,
      installDate: `${merged.installYear}-06-01`,
      expectedLifeYears: merged.life,
      condition: merged.condition,
      lastServiceDate: merged.lastService,
      replacementCost: merged.cost,
      failureCount12mo: merged.failures,
      vendor: merged.vendor,
    } as Asset;
  });
});

// Work orders — ~40 spread across last 12 months. Cluster on failing assets.
const TODAY = '2026-04-28';
const WORK_ORDER_SEEDS: Array<{ hotelId: string; category: AssetCategory; date: string; type: 'preventive'|'reactive'; cost: number; vendor: string; desc: string }> = [
  { hotelId: 'SAVMT', category: 'HVAC/PTAC', date: '2026-04-22', type: 'reactive', cost: 420, vendor: 'GE Zoneline Service', desc: 'Room 312 — capacitor failure, replacement' },
  { hotelId: 'SAVMT', category: 'HVAC/PTAC', date: '2026-04-18', type: 'reactive', cost: 380, vendor: 'GE Zoneline Service', desc: 'Room 318 — compressor short-cycle' },
  { hotelId: 'SAVMT', category: 'HVAC/PTAC', date: '2026-04-09', type: 'reactive', cost: 410, vendor: 'GE Zoneline Service', desc: 'Room 407 — capacitor failure' },
  { hotelId: 'SAVMT', category: 'HVAC/PTAC', date: '2026-03-24', type: 'reactive', cost: 390, vendor: 'GE Zoneline Service', desc: 'Room 224 — coil cleaning + capacitor' },
  { hotelId: 'SAVGW', category: 'HVAC/PTAC', date: '2026-04-14', type: 'reactive', cost: 360, vendor: 'GE Zoneline Service', desc: 'Room 208 — PTAC fan motor' },
  { hotelId: 'SAVGW', category: 'HVAC/PTAC', date: '2026-03-08', type: 'reactive', cost: 320, vendor: 'GE Zoneline Service', desc: 'Room 215 — capacitor' },
  { hotelId: 'SAVMD', category: 'HVAC/PTAC', date: '2026-04-05', type: 'reactive', cost: 350, vendor: 'GE Zoneline Service', desc: 'Room 141 — PTAC control board' },
  { hotelId: 'GA989', category: 'HVAC/PTAC', date: '2026-04-02', type: 'reactive', cost: 410, vendor: 'GE Zoneline Service', desc: 'Room 512 — capacitor' },
  { hotelId: 'GA989', category: 'Kitchen',   date: '2026-03-15', type: 'reactive', cost: 1200, vendor: 'Restaurant Depot Service', desc: 'Oven ignition module' },
  { hotelId: 'SAVVY', category: 'Roof',      date: '2026-03-20', type: 'reactive', cost: 2400, vendor: 'Southern Roofing Co.', desc: 'Leak repair — NW corner membrane' },
  { hotelId: 'SAVVY', category: 'Roof',      date: '2025-12-08', type: 'reactive', cost: 1800, vendor: 'Southern Roofing Co.', desc: 'Drain clog + patch' },
  { hotelId: 'BQKCY', category: 'Roof',      date: '2026-02-11', type: 'reactive', cost: 1600, vendor: 'Southern Roofing Co.', desc: 'Leak repair — room 304' },
  { hotelId: 'BQKCY', category: 'Roof',      date: '2026-01-22', type: 'reactive', cost: 2100, vendor: 'Southern Roofing Co.', desc: 'Leak repair — adjacent to room 304' },
  { hotelId: 'SAVFP', category: 'Kitchen',   date: '2026-04-01', type: 'preventive', cost: 600, vendor: 'Restaurant Depot Service', desc: 'Quarterly range service' },
  { hotelId: 'SAVFP', category: 'Laundry',   date: '2026-02-18', type: 'reactive', cost: 800, vendor: 'Continental Girbau', desc: 'Washer 3 drive belt' },
  { hotelId: 'DFWFW', category: 'Laundry',   date: '2026-03-30', type: 'reactive', cost: 1100, vendor: 'Continental Girbau', desc: 'Washer 2 — door seal' },
  { hotelId: 'DFWFW', category: 'Laundry',   date: '2026-02-04', type: 'reactive', cost: 950, vendor: 'Continental Girbau', desc: 'Dryer 1 — heating element' },
  { hotelId: 'DFWFW', category: 'Laundry',   date: '2025-12-16', type: 'reactive', cost: 780, vendor: 'Continental Girbau', desc: 'Washer 1 — control board' },
  { hotelId: 'SAVGW', category: 'Elevator',  date: '2026-03-05', type: 'preventive', cost: 520, vendor: 'Otis', desc: 'Annual inspection + service' },
  { hotelId: 'SAVMT', category: 'Elevator',  date: '2026-03-05', type: 'preventive', cost: 540, vendor: 'Otis', desc: 'Annual inspection + service' },
  { hotelId: 'GA989', category: 'Elevator',  date: '2026-02-28', type: 'preventive', cost: 520, vendor: 'Otis', desc: 'Annual inspection + service' },
  { hotelId: 'SAVFP', category: 'Elevator',  date: '2026-03-11', type: 'preventive', cost: 620, vendor: 'Otis', desc: 'Annual inspection + service' },
  { hotelId: 'SAVFP', category: 'Pool',      date: '2026-04-15', type: 'preventive', cost: 280, vendor: 'Pentair Service', desc: 'Seasonal start-up' },
  { hotelId: 'GA989', category: 'Pool',      date: '2026-04-15', type: 'preventive', cost: 280, vendor: 'Pentair Service', desc: 'Seasonal start-up' },
  { hotelId: 'SAVGW', category: 'Pool',      date: '2026-04-12', type: 'preventive', cost: 260, vendor: 'Pentair Service', desc: 'Seasonal start-up' },
  { hotelId: '58090LA', category: 'Pool',    date: '2026-01-20', type: 'reactive', cost: 1400, vendor: 'Pentair Service', desc: 'Pump motor replacement' },
  { hotelId: 'SAVMT', category: 'Parking',   date: '2025-11-28', type: 'reactive', cost: 680, vendor: 'Brite-Lite Electric', desc: 'LED fixture replacement — 4 units' },
  { hotelId: 'SAVGW', category: 'Parking',   date: '2025-12-18', type: 'reactive', cost: 540, vendor: 'Brite-Lite Electric', desc: 'Photocell + 2 fixtures' },
  { hotelId: 'BQKCY', category: 'Boiler',    date: '2026-01-09', type: 'preventive', cost: 420, vendor: 'A.O. Smith Tech', desc: 'Annual flush + inspection' },
  { hotelId: 'SAVMT', category: 'Boiler',    date: '2026-01-11', type: 'preventive', cost: 420, vendor: 'A.O. Smith Tech', desc: 'Annual flush + inspection' },
  { hotelId: 'GA989', category: 'POS/PMS',   date: '2026-02-22', type: 'reactive', cost: 320, vendor: 'Opera Cloud Support', desc: 'Printer driver + restart' },
  { hotelId: 'BQKFP', category: 'Laundry',   date: '2026-03-02', type: 'reactive', cost: 640, vendor: 'Continental Girbau', desc: 'Washer 2 — control relay' },
  { hotelId: 'BQKFP', category: 'Laundry',   date: '2025-12-02', type: 'reactive', cost: 520, vendor: 'Continental Girbau', desc: 'Washer 1 — door lock' },
  { hotelId: 'BSWVE', category: 'HVAC/PTAC', date: '2026-03-29', type: 'reactive', cost: 320, vendor: 'GE Zoneline Service', desc: 'Room 212 — capacitor' },
  { hotelId: 'BSWVE', category: 'HVAC/PTAC', date: '2026-02-12', type: 'reactive', cost: 340, vendor: 'GE Zoneline Service', desc: 'Room 306 — fan motor' },
  { hotelId: 'RISAV', category: 'FF&E',      date: '2025-11-14', type: 'preventive', cost: 1800, vendor: 'HD Supply', desc: 'Soft-goods refresh — 6 suites' },
  { hotelId: 'SAVFP', category: 'HVAC/PTAC', date: '2026-03-18', type: 'reactive', cost: 380, vendor: 'GE Zoneline Service', desc: 'Room 318 — capacitor' },
  { hotelId: 'JAXTX', category: 'Kitchen',   date: '2026-02-25', type: 'preventive', cost: 450, vendor: 'Restaurant Depot Service', desc: 'Quarterly hood cleaning' },
  { hotelId: 'BTRCI', category: 'FF&E',      date: '2026-01-31', type: 'preventive', cost: 1200, vendor: 'HD Supply', desc: 'Soft-goods refresh — 4 rooms' },
  { hotelId: 'SGJES', category: 'Parking',   date: '2026-04-03', type: 'reactive', cost: 310, vendor: 'Brite-Lite Electric', desc: 'Photocell replacement' },
];

export const ASSET_WORK_ORDERS: AssetWorkOrder[] = WORK_ORDER_SEEDS.map((w, i) => {
  const asset = ASSETS.find((a) => a.hotelId === w.hotelId && a.category === w.category)!;
  return {
    id: `WO-${String(i + 1).padStart(4, '0')}`,
    assetId: asset.id,
    hotelId: w.hotelId,
    date: w.date,
    type: w.type,
    cost: w.cost,
    vendor: w.vendor,
    description: w.desc,
  };
});

// Pre-compute per-hotel asset summary
export const ASSET_HOTEL_SUMMARIES: AssetHotelSummary[] = HOTELS.map((hotel) => {
  const hotelAssets = ASSETS.filter((a) => a.hotelId === hotel.id);
  const today = new Date(TODAY);
  const aging = hotelAssets.filter((a) => {
    const installed = new Date(a.installDate);
    const ageYears = (today.getTime() - installed.getTime()) / (365 * 24 * 60 * 60 * 1000);
    return ageYears / a.expectedLifeYears > 0.8;
  }).length;
  const failing = hotelAssets.filter((a) => a.condition === 'failing' || a.condition === 'poor').length;
  const orders = ASSET_WORK_ORDERS.filter((w) => w.hotelId === hotel.id);
  const ytdSpend = orders.reduce((s, o) => s + o.cost, 0);
  const preventiveShare = orders.length > 0
    ? orders.filter((o) => o.type === 'preventive').length / orders.length
    : 1;
  const totalValue = hotelAssets.reduce((s, a) => s + a.replacementCost, 0);
  // Health: red if 2+ failing categories, amber if any failing, green otherwise
  const health = failing >= 2 ? 'red' : failing >= 1 ? 'amber' : 'green';
  return {
    hotelId: hotel.id,
    totalAssets: hotelAssets.length,
    totalValue,
    agingAssets: aging,
    failingAssets: failing,
    ytdSpend,
    openWorkOrders: Math.min(3, failing), // placeholder — 1 per poor/failing
    preventiveCompliancePct: Math.round(preventiveShare * 100),
    health: health as 'red' | 'amber' | 'green',
  };
});

// Vendor spend rollup
const vendorMap = new Map<string, { total: number; count: number; hotels: Set<string> }>();
for (const w of ASSET_WORK_ORDERS) {
  const entry = vendorMap.get(w.vendor) ?? { total: 0, count: 0, hotels: new Set<string>() };
  entry.total += w.cost;
  entry.count += 1;
  entry.hotels.add(w.hotelId);
  vendorMap.set(w.vendor, entry);
}

export const VENDOR_SPENDS: VendorSpend[] = Array.from(vendorMap.entries())
  .map(([vendor, e]) => ({
    vendor,
    totalSpend: e.total,
    workOrderCount: e.count,
    hotelIds: Array.from(e.hotels),
  }))
  .sort((a, b) => b.totalSpend - a.totalSpend);

export const getAssetsByHotel = (hotelId: string): Asset[] =>
  ASSETS.filter((a) => a.hotelId === hotelId);

export const getWorkOrdersByAsset = (assetId: string): AssetWorkOrder[] =>
  ASSET_WORK_ORDERS.filter((w) => w.assetId === assetId);
