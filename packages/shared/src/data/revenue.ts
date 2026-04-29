import type { RevenueSummary, RevenueMix } from '../types/metrics';
import { deriveOccupancyHealth } from '../utils/health';

function makeMix(totalRevenue: number, propertyType: 'full' | 'limited' | 'extended'): RevenueMix {
  // Extended stay (Residence Inn, Home2) has lower F&B
  const ratios =
    propertyType === 'full'
      ? { room: 0.65, fb: 0.16, retail: 0.09, events: 0.07, other: 0.03 }
      : propertyType === 'extended'
      ? { room: 0.78, fb: 0.05, retail: 0.10, events: 0.04, other: 0.03 }
      : { room: 0.72, fb: 0.10, retail: 0.09, events: 0.06, other: 0.03 };

  return {
    room: Math.round(totalRevenue * ratios.room),
    fb: Math.round(totalRevenue * ratios.fb),
    retail: Math.round(totalRevenue * ratios.retail),
    events: Math.round(totalRevenue * ratios.events),
    other: Math.round(totalRevenue * ratios.other),
  };
}

const raw: Array<{
  hotelId: string;
  occ: number;
  adr: number;
  totalRev: number;
  marketAdr: number;
  propertyType: 'full' | 'limited' | 'extended';
}> = [
  { hotelId: 'SAVGW',   occ: 83, adr: 162, totalRev: 18200,  marketAdr: 158, propertyType: 'limited' },
  { hotelId: 'SAVVY',   occ: 84, adr: 189, totalRev: 19900,  marketAdr: 182, propertyType: 'full' },
  { hotelId: 'GA989',   occ: 88, adr: 174, totalRev: 24300,  marketAdr: 168, propertyType: 'full' },
  { hotelId: 'SAVMT',   occ: 77, adr: 158, totalRev: 17600,  marketAdr: 166, propertyType: 'full' },
  { hotelId: 'SAVMD',   occ: 80, adr: 155, totalRev: 21600,  marketAdr: 161, propertyType: 'limited' },
  { hotelId: 'RISAV',   occ: 86, adr: 178, totalRev: 16400,  marketAdr: 174, propertyType: 'extended' },
  { hotelId: 'SAVFP',   occ: 91, adr: 171, totalRev: 29400,  marketAdr: 165, propertyType: 'full' },
  { hotelId: 'BQKCY',   occ: 78, adr: 142, totalRev: 16900,  marketAdr: 148, propertyType: 'full' },
  { hotelId: 'BSWVE',   occ: 81, adr: 149, totalRev: 18100,  marketAdr: 153, propertyType: 'limited' },
  { hotelId: 'GAA84',   occ: 74, adr: 118, totalRev: 15800,  marketAdr: 124, propertyType: 'limited' },
  { hotelId: 'BQKFP',   occ: 79, adr: 145, totalRev: 18900,  marketAdr: 151, propertyType: 'full' },
  { hotelId: 'SGJES',   occ: 82, adr: 138, totalRev: 14700,  marketAdr: 136, propertyType: 'limited' },
  { hotelId: 'JAXTX',   occ: 87, adr: 196, totalRev: 15200,  marketAdr: 190, propertyType: 'full' },
  { hotelId: 'DFWFW',   occ: 85, adr: 129, totalRev: 13720,  marketAdr: 141, propertyType: 'extended' },
  { hotelId: 'BTRCI',   occ: 83, adr: 131, totalRev: 17900,  marketAdr: 134, propertyType: 'extended' },
  { hotelId: '58090LA', occ: 76, adr: 122, totalRev: 12900,  marketAdr: 128, propertyType: 'limited' },
];

export const REVENUE_DATA: RevenueSummary[] = raw.map((r) => {
  const revPar = Math.round(r.adr * (r.occ / 100));
  const mix = makeMix(r.totalRev, r.propertyType);
  const roomRevenue = mix.room;
  const nonRoomRevenue = r.totalRev - roomRevenue;
  return {
    hotelId: r.hotelId,
    occupancyPct: r.occ,
    adr: r.adr,
    revPar,
    totalRevenue: r.totalRev,
    roomRevenue,
    nonRoomRevenue,
    revenueMix: mix,
    marketAdr: r.marketAdr,
    health: deriveOccupancyHealth(r.occ),
  };
});

export const getRevenueById = (hotelId: string): RevenueSummary | undefined =>
  REVENUE_DATA.find((r) => r.hotelId === hotelId);
