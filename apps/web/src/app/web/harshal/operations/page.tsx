'use client';

import { OpsClient } from '@/components/operations/OpsClient';
import { AIFlagsPanel } from '@/components/common/AIFlagsPanel';
import { useScopedData } from '@/lib/use-scoped-data';
import { useAnomalies } from '@/lib/ai-data';

export default function OperationsPage() {
  const { hotels, hotelIdSet, scopeSub } = useScopedData();
  const opsAnomalies = useAnomalies().filter(
    (a) => a.module === 'operations' && hotelIdSet.has(a.hotelId),
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold" style={{ color: '#222222' }}>Operations</h1>
        <p className="text-sm mt-0.5" style={{ color: '#929292' }}>{scopeSub}</p>
      </div>

      {opsAnomalies.length > 0 && (
        <AIFlagsPanel findings={opsAnomalies} title="Operations AI Findings" />
      )}

      <OpsClient hotelIds={hotels.map((h) => h.id)} />
    </div>
  );
}
