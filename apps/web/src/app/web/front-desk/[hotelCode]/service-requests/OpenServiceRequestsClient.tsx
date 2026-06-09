'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Plus, AlertTriangle } from 'lucide-react';
import { useFdState } from '../_store';
import { SR_STATUSES, PRIORITIES, priorityStyle, statusStyle } from '../_data';
import { fdCard, Badge, timeAgo } from '../_ui';

interface Props { hotelCode: string }

export function OpenServiceRequestsClient({ hotelCode }: Props) {
  const base = `/web/front-desk/${hotelCode}`;
  const state = useFdState();
  const [statusF, setStatusF] = useState('open');
  const [priorityF, setPriorityF] = useState('all');
  const [urgentOnly, setUrgentOnly] = useState(false);
  const [q, setQ] = useState('');

  const priRank: Record<string, number> = { Urgent: 0, High: 1, Normal: 2, Low: 3 };
  const rows = useMemo(() => state.serviceRequests
    .filter((r) => {
      const open = r.status !== 'Completed' && r.status !== 'Cancelled' && r.status !== 'Delivered';
      const matchStatus = statusF === 'all' ? true : statusF === 'open' ? open : r.status === statusF;
      const matchPri = priorityF === 'all' || r.priority === priorityF;
      const matchUrgent = !urgentOnly || r.priority === 'Urgent';
      const s = q.toLowerCase();
      const matchQ = !s || [r.id, r.roomNumber, r.overallDetails, ...r.items.map((i) => i.name)].some((v) => (v ?? '').toLowerCase().includes(s));
      return matchStatus && matchPri && matchUrgent && matchQ;
    })
    .sort((a, b) => (priRank[a.priority] - priRank[b.priority]) || b.createdAt.localeCompare(a.createdAt)), [state.serviceRequests, statusF, priorityF, urgentOnly, q]);

  return (
    <div className="max-w-[1200px] mx-auto flex flex-col gap-5">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div><h1 className="text-2xl font-bold" style={{ color: '#222' }}>Open Service Requests</h1><p className="text-sm mt-1" style={{ color: '#929292' }}>Guest and housekeeping requests. Urgent items show at the top.</p></div>
        <Link href={`${base}/service-requests/new`} className="inline-flex items-center gap-1.5 h-11 px-5 rounded-xl text-sm font-bold" style={{ background: '#0ea5e9', color: '#fff' }}><Plus className="w-4 h-4" /> New Service Request</Link>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search SR #, room, item…" className="h-10 px-3 rounded-xl text-sm flex-1 min-w-[200px]" style={{ border: '1px solid #dddddd', background: '#fff', color: '#222' }} />
        <select value={statusF} onChange={(e) => setStatusF(e.target.value)} className={fil}><option value="open">Open only</option><option value="all">All statuses</option>{SR_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}</select>
        <select value={priorityF} onChange={(e) => setPriorityF(e.target.value)} className={fil}><option value="all">All priorities</option>{PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}</select>
        <button onClick={() => setUrgentOnly((u) => !u)} className="h-10 px-3 rounded-xl text-sm font-semibold inline-flex items-center gap-1.5" style={{ background: urgentOnly ? '#fee2e2' : '#fff', border: '1px solid #dddddd', color: urgentOnly ? '#b91c1c' : '#6a6a6a' }}><AlertTriangle className="w-4 h-4" /> Urgent only</button>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-2xl p-12 text-center" style={{ ...fdCard, borderStyle: 'dashed' }}><p className="text-base font-semibold" style={{ color: '#222' }}>No service requests here.</p><p className="text-sm mt-1" style={{ color: '#6a6a6a' }}>Try changing filters, or create a new service request.</p></div>
      ) : (
        <div className="flex flex-col gap-2">
          {rows.map((r) => { const ps = priorityStyle(r.priority); const ss = statusStyle(r.status); const urgent = r.priority === 'Urgent'; return (
            <Link key={r.id} href={`${base}/service-requests/${r.id}`} className="flex items-center gap-4 px-4 py-3 rounded-2xl transition-all hover:shadow-md" style={{ ...fdCard, borderLeft: urgent ? '4px solid #b91c1c' : fdCard.border, background: urgent ? '#fff7f7' : '#fff' }}>
              <div className="w-16 flex-shrink-0"><p className="text-sm font-black" style={{ color: '#0ea5e9' }}>{r.id}</p></div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate" style={{ color: '#222' }}>{r.items.length ? r.items.map((i) => `${i.name} ×${i.qty}`).join(', ') : (r.overallDetails || 'Service request')}{r.guestWaiting && <span className="ml-2 text-[11px] font-bold" style={{ color: '#b91c1c' }}>· guest waiting</span>}</p>
                <p className="text-xs truncate" style={{ color: '#929292' }}>{r.roomNumber ? `Room ${r.roomNumber}` : r.exactLocation || r.locationType} · {r.requestedBy} · {timeAgo(r.createdAt)}</p>
              </div>
              <Badge label={r.priority} {...ps} />
              <Badge label={r.status} {...ss} />
            </Link>
          ); })}
        </div>
      )}
    </div>
  );
}

const fil = 'h-10 px-2.5 rounded-xl text-sm border border-[#dddddd] bg-white text-[#6a6a6a]';
