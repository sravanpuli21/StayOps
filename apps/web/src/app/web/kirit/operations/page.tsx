import { OpsClient } from '@/components/operations/OpsClient';
import { AIBrief } from '@/components/ai/AIBrief';
import { AIFlagsPanel } from '@/components/common/AIFlagsPanel';
import { AI_ANOMALIES, getBriefByModule } from '@hos/shared';

export default function OperationsPage() {
  const brief = getBriefByModule('operations')!;
  const opsAnomalies = AI_ANOMALIES.filter((a) => a.module === 'operations');

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold" style={{ color: '#222222' }}>Operations</h1>
        <p className="text-sm mt-0.5" style={{ color: '#929292' }}>Apr 25, 2026 · All 16 Hotels</p>
      </div>

      {/* AI Brief */}
      <AIBrief brief={brief} />

      {/* Operations findings */}
      {opsAnomalies.length > 0 && (
        <AIFlagsPanel findings={opsAnomalies} title="Operations AI Findings" />
      )}

      <OpsClient />
    </div>
  );
}
