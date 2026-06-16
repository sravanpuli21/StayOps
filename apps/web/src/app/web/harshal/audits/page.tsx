'use client';

import { useState } from 'react';
import { AuditsClient } from '@/components/audits/AuditsClient';
import { useScopedData } from '@/lib/use-scoped-data';
import { AuditTemplates } from './_AuditTemplates';

type AuditTab = 'compliance' | 'templates';

export default function Page() {
  const { hotels, scopeSub, selection } = useScopedData();
  const [tab, setTab] = useState<AuditTab>('compliance');
  // Single hotel selected up top → open that hotel's room grid directly.
  const initialHotelId = selection.kind === 'single' ? selection.hotelId : undefined;

  const TABS: { key: AuditTab; label: string }[] = [
    { key: 'compliance', label: 'Compliance' },
    { key: 'templates', label: 'Template' },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="px-8 pt-6 flex-shrink-0" style={{ borderBottom: '1px solid #dddddd' }}>
        <h1 className="text-xl font-bold" style={{ color: '#222222' }}>Audits</h1>
        <p className="text-sm mt-0.5" style={{ color: '#929292' }}>
          {scopeSub} · {tab === 'compliance' ? 'Compliance tracking · audit history' : 'Build the inspection form & push to your hotels'}
        </p>
        <div className="flex gap-1 mt-3">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className="px-4 py-2 text-sm font-semibold"
              style={{
                color: tab === t.key ? '#ff385c' : '#6a6a6a',
                borderBottom: tab === t.key ? '2px solid #ff385c' : '2px solid transparent',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {tab === 'compliance' && <AuditsClient hotelIds={hotels.map((h) => h.id)} initialHotelId={initialHotelId} />}
        {tab === 'templates' && <AuditTemplates hotels={hotels.map((h) => ({ id: h.id, shortName: h.shortName }))} />}
      </div>
    </div>
  );
}
