'use client';

import { AuditsClient } from '@/components/audits/AuditsClient';
import { useScopedData } from '@/lib/use-scoped-data';

export default function Page() {
  const { hotels, scopeSub } = useScopedData();
  return (
    <div className="flex flex-col h-full">
      <div className="px-8 py-6 flex-shrink-0" style={{ borderBottom: '1px solid #dddddd' }}>
        <h1 className="text-xl font-bold" style={{ color: '#222222' }}>Audits</h1>
        <p className="text-sm mt-0.5" style={{ color: '#929292' }}>{scopeSub} · Compliance tracking · audit history</p>
      </div>
      <div className="flex-1 overflow-y-auto">
        <AuditsClient hotelIds={hotels.map((h) => h.id)} />
      </div>
    </div>
  );
}
