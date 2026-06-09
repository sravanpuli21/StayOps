'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Plus, AlertTriangle } from 'lucide-react';
import { useFdState } from '../_store';
import { WO_STATUSES, PRIORITIES, WO_LOCATION_TYPES, priorityStyle, statusStyle } from '../_data';
import { fdCard, Badge, timeAgo } from '../_ui';

interface Props { hotelCode: string }

export function OpenWorkOrdersClient({ hotelCode }: Props) {
  const base = `/web/front-desk/${hotelCode}`;
  const state = useFdState();
  const [statusF, setStatusF] = useState('open');
  const [priorityF, setPriorityF] = useState('all');
  const [locF, setLocF] = useState('all');
  const [urgentOnly, setUrgentOnly] = useState(false);
  const [q, setQ] = useState('');

  const priRank: Record<string, number> = { Urgent: 0, High: 1, Normal: 2, Low: 3 };
  const rows = useMemo(() => state.workOrders
    .filter((w) => {
      const matchStatus = statusF === 'all' ? true : statusF === 'open' ? (w.status !== 'Completed' && w.status !== 'Cancelled') : w.status === statusF;
      const matchPri = priorityF === 'all' || w.priority === priorityF;
      const matchLoc = locF === 'all' || w.locationType === locF;
      const matchUrgent = !urgentOnly || w.priority === 'Urgent';
      const s = q.toLowerCase();
      const matchQ = !s || [w.id, w.roomNumber, w.item, w.exactLocation, w.details].some((v) => (v ?? '').toLowerCase().includes(s));
      return matchStatus && matchPri && matchLoc && matchUrgent && matchQ;
    })
    .sort((a, b) => (priRank[a.priority] - priRank[b.priority]) || (b.createdAt.localeCompare(a.createdAt))), [state.workOrders, statusF, priorityF, locF, urgentOnly, q]);

  return (
    <div className="max-w-[1200px] mx-auto flex flex-col gap-5">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div><h1 className="text-2xl font-bold" style={{ color: '#222' }}>Open Work Orders</h1><p className="text-sm mt-1" style={{ color: '#929292' }}>Maintenance and engineering issues. Urgent items show at the top in red.</p></div>
        <Link href={`${base}/work-orders/new`} className="inline-flex items-center gap-1.5 h-11 px-5 rounded-xl text-sm font-bold" style={{ background: '#ff385c', color: '#fff' }}><Plus className="w-4 h-4" /> New Work Order</Link>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search WO #, room, item…" className="h-10 px-3 rounded-xl text-sm flex-1 min-w-[200px]" style={{ border: '1px solid #dddddd', background: '#fff', color: '#222' }} />
        <select value={statusF} onChange={(e) => setStatusF(e.target.value)} className={fil}><option value="open">Open only</option><option value="all">All statuses</option>{WO_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}</select>
        <select value={priorityF} onChange={(e) => setPriorityF(e.target.value)} className={fil}><option value="all">All priorities</option>{PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}</select>
        <select value={locF} onChange={(e) => setLocF(e.target.value)} className={fil}><option value="all">All locations</option>{WO_LOCATION_TYPES.map((l) => <option key={l} value={l}>{l}</option>)}</select>
        <button onClick={() => setUrgentOnly((u) => !u)} className="h-10 px-3 rounded-xl text-sm font-semibold inline-flex items-center gap-1.5" style={{ background: urgentOnly ? '#fee2e2' : '#fff', border: '1px solid #dddddd', color: urgentOnly ? '#b91c1c' : '#6a6a6a' }}><AlertTriangle className="w-4 h-4" /> Urgent only</button>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-2xl p-12 text-center" style={{ ...fdCard, borderStyle: 'dashed' }}>
          <p className="text-base font-semibold" style={{ color: '#222' }}>No work orders here.</p>
          <p className="text-sm mt-1" style={{ color: '#6a6a6a' }}>Try changing filters, or create a new work order.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {rows.map((w) => { const ps = priorityStyle(w.priority); const ss = statusStyle(w.status); const urgent = w.priority === 'Urgent'; return (
            <Link key={w.id} href={`${base}/work-orders/${w.id}`} className="flex items-center gap-4 px-4 py-3 rounded-2xl transition-all hover:shadow-md" style={{ ...fdCard, borderLeft: urgent ? '4px solid #b91c1c' : fdCard.border, background: urgent ? '#fff7f7' : '#fff' }}>
              <div className="w-16 flex-shrink-0"><p className="text-sm font-black" style={{ color: '#ff385c' }}>{w.id}</p></div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate" style={{ color: '#222' }}>{w.item || w.exactLocation}{w.guestWaiting && <span className="ml-2 text-[11px] font-bold" style={{ color: '#b91c1c' }}>· guest waiting</span>}</p>
                <p className="text-xs truncate" style={{ color: '#929292' }}>{w.exactLocation} · {w.requestedBy} · {timeAgo(w.createdAt)}</p>
              </div>
              <Badge label={w.priority} {...ps} />
              <Badge label={w.status} {...ss} />
            </Link>
          ); })}
        </div>
      )}
    </div>
  );
}

const fil = 'h-10 px-2.5 rounded-xl text-sm border border-[#dddddd] bg-white text-[#6a6a6a]';
