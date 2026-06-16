'use client';

import { HistoryView } from '@/components/history/HistoryView';
import { useScopedData } from '@/lib/use-scoped-data';

export default function HistoryPage() {
  const { hotels, scopeLabel } = useScopedData();
  return <HistoryView hotelIds={hotels.map((h) => h.id)} scopeLabel={scopeLabel} />;
}
