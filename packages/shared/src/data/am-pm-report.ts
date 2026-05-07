import { HOTELS } from './hotels';
import { REVENUE_DATA } from './revenue';
import { DAILY_METRICS } from './daily-metrics';

export type RoomTypeCode = 'K' | 'Q' | 'KK' | 'QQ' | 'KS' | 'QS' | 'KPD' | 'QPD';

export interface RoomTypeBreakdown {
  type: RoomTypeCode;
  label: string;
  total: number;
  sold: number;
  ooo: number;
  leftToSell: number;
  adr: number;
  avgPrice: number;
  revPar: number;
  occupancyPct: number;
}

export interface AmPmSnapshot {
  hotelId: string;
  totalRooms: number;
  roomsSold: number;
  roomsOoo: number;
  roomsLeftToSell: number;
  adr: number;
  avgPrice: number;
  revPar: number;
  occupancyPct: number;
  roomTypes: RoomTypeBreakdown[];
}

export interface AmPmReport {
  slot: 'AM' | 'PM';
  generatedAt: string;
  label: string;
  rows: AmPmSnapshot[];
}

const ROOM_TYPE_LABELS: Record<RoomTypeCode, string> = {
  K: 'King (Single)',
  Q: 'Queen (Single)',
  KK: '2 King Beds',
  QQ: '2 Queen Beds',
  KS: 'King Suite',
  QS: 'Queen Suite',
  KPD: 'King Accessible',
  QPD: 'Queen Accessible',
};

const ROOM_TYPE_ORDER: RoomTypeCode[] = ['K', 'Q', 'KK', 'QQ', 'KS', 'QS', 'KPD', 'QPD'];

const ROOM_MIX: Record<RoomTypeCode, number> = {
  K: 0.22,
  Q: 0.14,
  KK: 0.14,
  QQ: 0.20,
  KS: 0.08,
  QS: 0.06,
  KPD: 0.09,
  QPD: 0.07,
};

const RATE_MOD: Record<RoomTypeCode, number> = {
  K: 1.00,
  Q: 0.95,
  KK: 1.10,
  QQ: 1.05,
  KS: 1.30,
  QS: 1.25,
  KPD: 1.00,
  QPD: 0.95,
};

const OCC_MOD: Record<RoomTypeCode, number> = {
  K: 1.00,
  Q: 0.98,
  KK: 1.04,
  QQ: 1.03,
  KS: 0.86,
  QS: 0.88,
  KPD: 0.92,
  QPD: 0.90,
};

function distributeRooms(totalRooms: number): Record<RoomTypeCode, number> {
  const out: Record<RoomTypeCode, number> = {
    K: 0, Q: 0, KK: 0, QQ: 0, KS: 0, QS: 0, KPD: 0, QPD: 0,
  };
  let allocated = 0;
  for (const code of ROOM_TYPE_ORDER) {
    if (code === 'K') continue;
    out[code] = Math.max(1, Math.round(totalRooms * ROOM_MIX[code]));
    allocated += out[code];
  }
  out.K = Math.max(1, totalRooms - allocated);
  return out;
}

function distributeOoo(mix: Record<RoomTypeCode, number>, totalOoo: number): Record<RoomTypeCode, number> {
  const out: Record<RoomTypeCode, number> = {
    K: 0, Q: 0, KK: 0, QQ: 0, KS: 0, QS: 0, KPD: 0, QPD: 0,
  };
  if (totalOoo <= 0) return out;
  const byCountDesc = [...ROOM_TYPE_ORDER].sort((a, b) => mix[b] - mix[a]);
  let remaining = totalOoo;
  let i = 0;
  while (remaining > 0) {
    const code = byCountDesc[i % byCountDesc.length];
    if (out[code] < mix[code]) {
      out[code] += 1;
      remaining -= 1;
    }
    i += 1;
    if (i > totalOoo * byCountDesc.length + 8) break;
  }
  return out;
}

function buildSnapshot(
  hotelId: string,
  totalRooms: number,
  baseOccPct: number,
  baseAdr: number,
  totalOoo: number,
): AmPmSnapshot {
  const mix = distributeRooms(totalRooms);
  const oooMix = distributeOoo(mix, totalOoo);

  const roomTypes: RoomTypeBreakdown[] = ROOM_TYPE_ORDER.map((code) => {
    const total = mix[code];
    const ooo = oooMix[code];
    const sellable = Math.max(0, total - ooo);
    const occ = Math.min(100, baseOccPct * OCC_MOD[code]);
    const sold = Math.min(sellable, Math.max(0, Math.round(sellable * occ / 100)));
    const leftToSell = Math.max(0, sellable - sold);
    const adr = Math.round(baseAdr * RATE_MOD[code]);
    const avgPrice = Math.round(adr * 0.97);
    const occupancyPct = sellable > 0 ? (sold / sellable) * 100 : 0;
    const revPar = Math.round(adr * (occupancyPct / 100));
    return {
      type: code,
      label: ROOM_TYPE_LABELS[code],
      total,
      sold,
      ooo,
      leftToSell,
      adr,
      avgPrice,
      revPar,
      occupancyPct,
    };
  });

  const roomsSold = roomTypes.reduce((s, r) => s + r.sold, 0);
  const roomsOoo = roomTypes.reduce((s, r) => s + r.ooo, 0);
  const roomsLeftToSell = roomTypes.reduce((s, r) => s + r.leftToSell, 0);
  const sellable = Math.max(1, totalRooms - roomsOoo);
  const occupancyPct = (roomsSold / sellable) * 100;
  const adr = baseAdr;
  const avgPrice = Math.round(baseAdr * 0.97);
  const revPar = Math.round(adr * (occupancyPct / 100));

  return {
    hotelId,
    totalRooms,
    roomsSold,
    roomsOoo,
    roomsLeftToSell,
    adr,
    avgPrice,
    revPar,
    occupancyPct,
    roomTypes,
  };
}

function buildReport(slot: 'AM' | 'PM'): AmPmReport {
  const occShift = slot === 'AM' ? -4 : 0;
  const adrShift = slot === 'AM' ? 0.99 : 1.00;
  const rows: AmPmSnapshot[] = HOTELS.map((hotel) => {
    const rev = REVENUE_DATA.find((r) => r.hotelId === hotel.id)!;
    const metrics = DAILY_METRICS.find((m) => m.hotelId === hotel.id);
    const baseOcc = Math.max(30, Math.min(100, rev.occupancyPct + occShift));
    const baseAdr = Math.round(rev.adr * adrShift);
    const totalOoo = metrics?.roomsOoo ?? 0;
    return buildSnapshot(hotel.id, hotel.rooms, baseOcc, baseAdr, totalOoo);
  });

  const label = slot === 'AM' ? '9:00 AM Snapshot' : '5:00 PM Snapshot';
  const generatedAt = slot === 'AM' ? '2026-04-25T09:00:00-04:00' : '2026-04-25T17:00:00-04:00';

  return { slot, generatedAt, label, rows };
}

export const AM_PM_REPORT_AM: AmPmReport = buildReport('AM');
export const AM_PM_REPORT_PM: AmPmReport = buildReport('PM');

export const AM_PM_REPORTS = {
  AM: AM_PM_REPORT_AM,
  PM: AM_PM_REPORT_PM,
} as const;

export const ROOM_TYPE_OPTIONS = ROOM_TYPE_ORDER.map((code) => ({
  code,
  label: ROOM_TYPE_LABELS[code],
}));
