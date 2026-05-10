export type OtaChannelKey =
  | 'direct'
  | 'brand'
  | 'booking'
  | 'expedia'
  | 'agoda'
  | 'priceline'
  | 'hopper'
  | 'hoteltonight';

export interface OtaChannelMeta {
  key: OtaChannelKey;
  name: string;
  group: 'direct' | 'ota';
}

export interface OtaChannelRow {
  hotelId: string;
  channel: OtaChannelKey;
  bookings: number;
  grossAdr: number;
  commissionPct: number;
  otherFeesPerBooking: number;
  cancellationPct: number;
  noShowPct: number;
  refundLossPerBooking: number;
}
