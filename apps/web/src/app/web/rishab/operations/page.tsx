import { OpsClient } from '@/components/operations/OpsClient';
import { AIFlagsPanel } from '@/components/common/AIFlagsPanel';
import { AI_ANOMALIES } from '@hos/shared';

const HOTEL_ID = 'BTRCI';

export default function OperationsPage() {
  const opsAnomalies = AI_ANOMALIES.filter(
    (a) => a.module === 'operations' && a.hotelId === HOTEL_ID
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="flex items-baseline gap-3">
          <h1 className="text-xl font-bold" style={{ color: '#222222' }}>Operations</h1>
          <span className="text-sm" style={{ color: '#6a6a6a' }}>Home2 Baton Rouge · single property</span>
        </div>
        <p className="text-sm mt-0.5" style={{ color: '#929292' }}>
          Rooms, tickets, inventory, audits
        </p>
      </div>

      {opsAnomalies.length > 0 && (
        <AIFlagsPanel findings={opsAnomalies} title="Operations AI Findings" />
      )}

      <OpsClient hotelIds={[HOTEL_ID]} />
    </div>
  );
}
