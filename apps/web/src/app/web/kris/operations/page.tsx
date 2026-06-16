'use client';

import { useState } from 'react';
import { OpsClient } from '@/components/operations/OpsClient';
import { AuditsClient } from '@/components/audits/AuditsClient';
import { AIFlagsPanel } from '@/components/common/AIFlagsPanel';
import { useScopedData } from '@/lib/use-scoped-data';
import { useAnomalies } from '@/lib/ai-data';

type OpsTab = 'tickets' | 'audits';

export default function OperationsPage() {
  const { hotels, hotelIdSet, scopeSub, selection } = useScopedData();
  const [tab, setTab] = useState<OpsTab>('tickets');
  const hotelIds = hotels.map((h) => h.id);
  // Drive the single-hotel drill-in from `selection` directly — it's available
  // immediately, unlike `hotels` which is gated on revenue/labour/daily loading.
  const initialHotelId = selection.kind === 'single' ? selection.hotelId : undefined;
  const opsAnomalies = useAnomalies().filter(
    (a) => a.module === 'operations' && hotelIdSet.has(a.hotelId),
  );

  const TABS: { key: OpsTab; label: string }[] = [
    { key: 'tickets', label: 'Tickets' },
    { key: 'audits', label: 'Audits' },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold" style={{ color: '#222222' }}>Operations</h1>
        <p className="text-sm mt-0.5" style={{ color: '#929292' }}>
          {scopeSub} · {tab === 'tickets' ? 'Room status & maintenance tickets' : 'Audit compliance & history'}
        </p>
      </div>

      {/* Top tab: Tickets / Audits */}
      <div className="flex gap-1" style={{ borderBottom: '1px solid #dddddd' }}>
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className="px-4 py-2 text-sm font-semibold whitespace-nowrap"
            style={{
              color: tab === t.key ? '#ff385c' : '#6a6a6a',
              borderBottom: tab === t.key ? '2px solid #ff385c' : '2px solid transparent',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'tickets' && (
        <>
          {opsAnomalies.length > 0 && (
            <AIFlagsPanel findings={opsAnomalies} title="Operations AI Findings" />
          )}
          <OpsClient hotelIds={hotelIds} initialHotelId={initialHotelId} />
        </>
      )}

      {tab === 'audits' && <AuditsClient />}
    </div>
  );
}
