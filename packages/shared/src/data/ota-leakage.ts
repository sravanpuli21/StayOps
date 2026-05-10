import type { OtaChannelKey, OtaChannelMeta, OtaChannelRow } from '../types/ota-leakage';
import { REVENUE_DATA } from './revenue';

export const OTA_CHANNELS: OtaChannelMeta[] = [
  { key: 'direct',       name: 'Direct',        group: 'direct' },
  { key: 'brand',        name: 'Brand.com',     group: 'direct' },
  { key: 'booking',      name: 'Booking.com',   group: 'ota'    },
  { key: 'expedia',      name: 'Expedia',       group: 'ota'    },
  { key: 'agoda',        name: 'Agoda',         group: 'ota'    },
  { key: 'priceline',    name: 'Priceline',     group: 'ota'    },
  { key: 'hopper',       name: 'Hopper',        group: 'ota'    },
  { key: 'hoteltonight', name: 'HotelTonight',  group: 'ota'    },
];

interface ChannelProfile {
  mix: number;
  commissionPct: number;
  otherFeesPerBooking: number;
  cancellationPct: number;
  noShowPct: number;
  refundLossPerBooking: number;
  adrMultiplier: number;
}

const PROFILES: Record<OtaChannelKey, ChannelProfile> = {
  direct:       { mix: 0.18, commissionPct: 0,    otherFeesPerBooking: 2,  cancellationPct: 8,  noShowPct: 2, refundLossPerBooking: 2,  adrMultiplier: 0.985 },
  brand:        { mix: 0.30, commissionPct: 4,    otherFeesPerBooking: 3,  cancellationPct: 10, noShowPct: 2, refundLossPerBooking: 3,  adrMultiplier: 1.000 },
  booking:      { mix: 0.22, commissionPct: 16,   otherFeesPerBooking: 5,  cancellationPct: 28, noShowPct: 5, refundLossPerBooking: 7,  adrMultiplier: 1.010 },
  expedia:      { mix: 0.14, commissionPct: 19,   otherFeesPerBooking: 5,  cancellationPct: 24, noShowPct: 4, refundLossPerBooking: 8,  adrMultiplier: 1.000 },
  agoda:        { mix: 0.06, commissionPct: 18,   otherFeesPerBooking: 4,  cancellationPct: 27, noShowPct: 5, refundLossPerBooking: 7,  adrMultiplier: 0.975 },
  priceline:    { mix: 0.05, commissionPct: 20,   otherFeesPerBooking: 4,  cancellationPct: 20, noShowPct: 4, refundLossPerBooking: 6,  adrMultiplier: 0.970 },
  hopper:       { mix: 0.03, commissionPct: 17,   otherFeesPerBooking: 6,  cancellationPct: 31, noShowPct: 6, refundLossPerBooking: 9,  adrMultiplier: 0.965 },
  hoteltonight: { mix: 0.02, commissionPct: 15,   otherFeesPerBooking: 4,  cancellationPct: 12, noShowPct: 5, refundLossPerBooking: 5,  adrMultiplier: 0.955 },
};

function hashSeed(hotelId: string, channel: string): number {
  let h = 2166136261;
  const s = `${hotelId}:${channel}`;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 1000) / 1000;
}

function jitter(base: number, seed: number, spread: number): number {
  return base * (1 + (seed - 0.5) * spread);
}

export const OTA_CHANNEL_ROWS: OtaChannelRow[] = REVENUE_DATA.flatMap((rev) => {
  const monthlyBookings = Math.round((rev.totalRevenue * 30) / Math.max(rev.adr, 1));

  return OTA_CHANNELS.map((ch) => {
    const profile = PROFILES[ch.key];
    const seed = hashSeed(rev.hotelId, ch.key);
    const bookings = Math.max(1, Math.round(monthlyBookings * jitter(profile.mix, seed, 0.35)));
    const grossAdr = Math.round(rev.adr * profile.adrMultiplier * jitter(1, seed, 0.06));
    const commissionPct = Math.round(jitter(profile.commissionPct, seed, 0.10) * 10) / 10;
    const cancellationPct = Math.max(0, Math.round(jitter(profile.cancellationPct, seed, 0.25)));
    const noShowPct = Math.max(0, Math.round(jitter(profile.noShowPct, seed, 0.4)));

    return {
      hotelId: rev.hotelId,
      channel: ch.key,
      bookings,
      grossAdr,
      commissionPct,
      otherFeesPerBooking: profile.otherFeesPerBooking,
      cancellationPct,
      noShowPct,
      refundLossPerBooking: profile.refundLossPerBooking,
    };
  });
});

export const getOtaRowsByHotel = (hotelId: string): OtaChannelRow[] =>
  OTA_CHANNEL_ROWS.filter((r) => r.hotelId === hotelId);

export interface OtaChannelAggregate {
  channel: OtaChannelKey;
  channelName: string;
  group: 'direct' | 'ota';
  bookings: number;
  grossAdr: number;
  commissionPerBooking: number;
  otherFeesPerBooking: number;
  refundLossPerBooking: number;
  netAdr: number;
  grossRevenue: number;
  commissionTotal: number;
  feesTotal: number;
  cancellationLoss: number;
  noShowLoss: number;
  leakageTotal: number;
  netRevenue: number;
  cancellationPct: number;
  noShowPct: number;
  realisedRevenue: number;
  realisedRevenueRatePct: number;
  profitQuality: 'Excellent' | 'Strong' | 'Weak';
}

function classifyQuality(leakagePctOfGross: number): 'Excellent' | 'Strong' | 'Weak' {
  if (leakagePctOfGross < 6)  return 'Excellent';
  if (leakagePctOfGross < 14) return 'Strong';
  return 'Weak';
}

export function aggregateOtaByChannel(rows: OtaChannelRow[]): OtaChannelAggregate[] {
  const byChannel = new Map<OtaChannelKey, OtaChannelRow[]>();
  for (const r of rows) {
    const arr = byChannel.get(r.channel) ?? [];
    arr.push(r);
    byChannel.set(r.channel, arr);
  }

  return OTA_CHANNELS.map((meta) => {
    const channelRows = byChannel.get(meta.key) ?? [];
    const totalBookings = channelRows.reduce((s, r) => s + r.bookings, 0);
    if (totalBookings === 0) {
      return {
        channel: meta.key, channelName: meta.name, group: meta.group,
        bookings: 0, grossAdr: 0, commissionPerBooking: 0, otherFeesPerBooking: 0,
        refundLossPerBooking: 0, netAdr: 0, grossRevenue: 0, commissionTotal: 0,
        feesTotal: 0, cancellationLoss: 0, noShowLoss: 0, leakageTotal: 0,
        netRevenue: 0, cancellationPct: 0, noShowPct: 0, realisedRevenue: 0,
        realisedRevenueRatePct: 0, profitQuality: 'Strong' as const,
      };
    }

    const weighted = (sel: (r: OtaChannelRow) => number) =>
      channelRows.reduce((s, r) => s + sel(r) * r.bookings, 0) / totalBookings;

    const grossAdr = Math.round(weighted((r) => r.grossAdr));
    const commissionPct = weighted((r) => r.commissionPct);
    const otherFeesPerBooking = weighted((r) => r.otherFeesPerBooking);
    const refundLossPerBooking = weighted((r) => r.refundLossPerBooking);
    const cancellationPct = weighted((r) => r.cancellationPct);
    const noShowPct = weighted((r) => r.noShowPct);

    const commissionPerBooking = grossAdr * (commissionPct / 100);
    const netAdr = Math.round(grossAdr - commissionPerBooking - otherFeesPerBooking - refundLossPerBooking);

    const grossRevenue = Math.round(grossAdr * totalBookings);
    const commissionTotal = Math.round(commissionPerBooking * totalBookings);
    const feesTotal = Math.round(otherFeesPerBooking * totalBookings);
    const cancellationLoss = Math.round(grossRevenue * (cancellationPct / 100) * 0.6);
    const noShowLoss = Math.round(grossRevenue * (noShowPct / 100) * 0.4);
    const leakageTotal = commissionTotal + feesTotal + cancellationLoss + noShowLoss;
    const netRevenue = grossRevenue - leakageTotal;
    const realisedRevenue = Math.round(grossRevenue * (1 - cancellationPct / 100) * (1 - noShowPct / 100));
    const realisedRevenueRatePct = grossRevenue > 0 ? (realisedRevenue / grossRevenue) * 100 : 0;
    const leakagePctOfGross = grossRevenue > 0 ? (leakageTotal / grossRevenue) * 100 : 0;

    return {
      channel: meta.key,
      channelName: meta.name,
      group: meta.group,
      bookings: totalBookings,
      grossAdr,
      commissionPerBooking: Math.round(commissionPerBooking),
      otherFeesPerBooking: Math.round(otherFeesPerBooking),
      refundLossPerBooking: Math.round(refundLossPerBooking),
      netAdr,
      grossRevenue,
      commissionTotal,
      feesTotal,
      cancellationLoss,
      noShowLoss,
      leakageTotal,
      netRevenue,
      cancellationPct: Math.round(cancellationPct),
      noShowPct: Math.round(noShowPct),
      realisedRevenue,
      realisedRevenueRatePct,
      profitQuality: classifyQuality(leakagePctOfGross),
    };
  });
}
