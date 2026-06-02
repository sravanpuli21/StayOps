'use client';

import { useState } from 'react';
import { AuditsClient } from '@/components/audits/AuditsClient';
import { RoomAuditFlow } from '@/components/audits/RoomAuditFlow';

const HOTEL_ID = 'BTRCI';

type Tab = 'audit' | 'compliance';

export default function SydneyAuditsPage() {
  const [tab, setTab] = useState<Tab>('audit');

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold" style={{ color: '#222222' }}>Audits</h1>
        <p className="text-sm mt-0.5" style={{ color: '#929292' }}>
          Home2 Baton Rouge · room-first preventive audits · compliance &amp; history
        </p>
      </div>

      <div className="flex border-b" style={{ borderColor: '#dddddd' }}>
        <button
          onClick={() => setTab('audit')}
          className="px-4 py-2 text-sm font-semibold"
          style={{ color: tab === 'audit' ? '#222' : '#6a6a6a', borderBottom: tab === 'audit' ? '2px solid #ff385c' : '2px solid transparent' }}
        >
          Run Audit
        </button>
        <button
          onClick={() => setTab('compliance')}
          className="px-4 py-2 text-sm font-semibold"
          style={{ color: tab === 'compliance' ? '#222' : '#6a6a6a', borderBottom: tab === 'compliance' ? '2px solid #ff385c' : '2px solid transparent' }}
        >
          Compliance &amp; History
        </button>
      </div>

      {tab === 'audit'
        ? <RoomAuditFlow hotelCode={HOTEL_ID} />
        : <AuditsClient hotelIds={[HOTEL_ID]} />}
    </div>
  );
}
