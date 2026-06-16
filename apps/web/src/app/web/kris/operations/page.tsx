'use client';

import { OpsClient } from '@/components/operations/OpsClient';
import { AIFlagsPanel } from '@/components/common/AIFlagsPanel';
import { useScopedData } from '@/lib/use-scoped-data';
import { useAnomalies } from '@/lib/ai-data';

export default function OperationsPage() {
  const { hotels, hotelIdSet, scopeSub, selection } = useScopedData();
  const hotelIds = hotels.map((h) => h.id);
  // Drive the single-hotel drill-in from `selection` directly — it's available
  // immediately, unlike `hotels` which is gated on revenue/labour/daily loading.
  const initialHotelId = selection.kind === 'single' ? selection.hotelId : undefined;
  const opsAnomalies = useAnomalies().filter(
    (a) => a.module === 'operations' && hotelIdSet.has(a.hotelId),
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold" style={{ color: '#222222' }}>Operations</h1>
        <p className="text-sm mt-0.5" style={{ color: '#929292' }}>
          {scopeSub} · Room status & maintenance tickets
        </p>
      </div>

      {opsAnomalies.length > 0 && (
        <AIFlagsPanel findings={opsAnomalies} title="Operations AI Findings" />
      )}
      <OpsClient hotelIds={hotelIds} initialHotelId={initialHotelId} />
    </div>
  );
}
