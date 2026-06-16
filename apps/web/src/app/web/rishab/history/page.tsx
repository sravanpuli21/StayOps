'use client';

import { HOTELS } from '@hos/shared';
import { HistoryView } from '@/components/history/HistoryView';

const HOTEL_ID = 'BTRCI';

export default function HistoryPage() {
  const hotel = HOTELS.find((h) => h.id === HOTEL_ID)!;
  return <HistoryView hotelIds={[HOTEL_ID]} scopeLabel={hotel.name} />;
}
