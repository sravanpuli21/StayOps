'use client';

import { OpsClient } from '@/components/operations/OpsClient';
import { AIFlagsPanel } from '@/components/common/AIFlagsPanel';
import { AI_ANOMALIES } from '@hos/shared';
import { useScopedData } from '@/lib/use-scoped-data';

export default function OperationsPage() {
  const { hotelIdSet, scopeSub } = useScopedData();
  const opsAnomalies = AI_ANOMALIES.filter(
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

      <OpsClient />
    </div>
  );
}
