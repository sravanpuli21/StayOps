'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useFdState } from '../_store';
import { fdCard, Badge, fmtDateTime } from '../_ui';

interface Props { hotelCode: string }

export function CompletedClient({ hotelCode }: Props) {
  const base = `/web/front-desk/${hotelCode}`;
  const state = useFdState();
  const [tab, setTab] = useState<'wo' | 'sr'>('wo');

  const wo = state.workOrders.filter((w) => w.status === 'Completed' || w.status === 'Cancelled');
  const sr = state.serviceRequests.filter((r) => r.status === 'Completed' || r.status === 'Delivered' || r.status === 'Cancelled');

  return (
    <div className="max-w-[1100px] mx-auto flex flex-col gap-5">
      <div><h1 className="text-2xl font-bold" style={{ color: '#222' }}>Completed Items</h1><p className="text-sm mt-1" style={{ color: '#929292' }}>Work orders and service requests that are done or cancelled.</p></div>

      <div className="flex gap-1 overflow-x-auto" style={{ borderBottom: '1px solid #dddddd' }}>
        {([['wo', `Completed Work Orders (${wo.length})`], ['sr', `Completed Service Requests (${sr.length})`]] as const).map(([k, label]) => (
          <button key={k} onClick={() => setTab(k)} className="px-4 py-2.5 text-sm font-semibold whitespace-nowrap" style={{ color: tab === k ? '#ff385c' : '#6a6a6a', borderBottom: tab === k ? '2px solid #ff385c' : '2px solid transparent' }}>{label}</button>
        ))}
      </div>

      {tab === 'wo' ? (
        wo.length === 0 ? <Empty text="No completed work orders yet." /> : (
          <div className="flex flex-col gap-2">{wo.map((w) => (
            <Link key={w.id} href={`${base}/work-orders/${w.id}`} className="flex items-center gap-4 px-4 py-3 rounded-2xl transition-all hover:shadow-md" style={fdCard}>
              <div className="w-16 flex-shrink-0"><p className="text-sm font-black" style={{ color: '#ff385c' }}>{w.id}</p></div>
              <div className="flex-1 min-w-0"><p className="text-sm font-bold truncate" style={{ color: '#222' }}>{w.item || w.exactLocation}</p><p className="text-xs truncate" style={{ color: '#929292' }}>{w.exactLocation} · {fmtDateTime(w.updatedAt)} · {w.assignedTeam}</p></div>
              <Badge label={w.status} fg={w.status === 'Completed' ? '#15803d' : '#6a6a6a'} bg={w.status === 'Completed' ? '#dcfce7' : '#f0f0f0'} />
            </Link>
          ))}</div>
        )
      ) : (
        sr.length === 0 ? <Empty text="No completed service requests yet." /> : (
          <div className="flex flex-col gap-2">{sr.map((r) => (
            <Link key={r.id} href={`${base}/service-requests/${r.id}`} className="flex items-center gap-4 px-4 py-3 rounded-2xl transition-all hover:shadow-md" style={fdCard}>
              <div className="w-16 flex-shrink-0"><p className="text-sm font-black" style={{ color: '#0ea5e9' }}>{r.id}</p></div>
              <div className="flex-1 min-w-0"><p className="text-sm font-bold truncate" style={{ color: '#222' }}>{r.items.length ? r.items.map((i) => `${i.name} ×${i.qty}`).join(', ') : (r.overallDetails || 'Service request')}</p><p className="text-xs truncate" style={{ color: '#929292' }}>{r.roomNumber ? `Room ${r.roomNumber}` : r.exactLocation || r.locationType} · {fmtDateTime(r.updatedAt)} · {r.assignedTeam}</p></div>
              <Badge label={r.status} fg={r.status === 'Cancelled' ? '#6a6a6a' : '#15803d'} bg={r.status === 'Cancelled' ? '#f0f0f0' : '#dcfce7'} />
            </Link>
          ))}</div>
        )
      )}
    </div>
  );
}

function Empty({ text }: { text: string }) { return <div className="rounded-2xl p-12 text-center" style={{ background: '#fff', border: '1px dashed #dddddd', borderRadius: 16 }}><p className="text-sm" style={{ color: '#929292' }}>{text}</p></div>; }
