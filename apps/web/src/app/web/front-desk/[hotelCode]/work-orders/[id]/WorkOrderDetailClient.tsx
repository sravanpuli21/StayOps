'use client';

import { useState } from 'react';
import { Camera, Clock } from 'lucide-react';
import { useFdState, addWoNote, setWoPriority, cancelWorkOrder, addWoPhoto, setWoGuestWaiting } from '../../_store';
import { PRIORITIES, priorityStyle, statusStyle, type Priority } from '../../_data';
import { fdCard, Badge, BackTo, fmtDateTime, timeAgo } from '../../_ui';

interface Props { hotelCode: string; id: string }

export function WorkOrderDetailClient({ hotelCode, id }: Props) {
  const base = `/web/front-desk/${hotelCode}`;
  const state = useFdState();
  const wo = state.workOrders.find((w) => w.id === id);
  const [note, setNote] = useState('');

  if (!wo) return <div className="max-w-2xl mx-auto flex flex-col gap-4"><BackTo href={`${base}/work-orders`} label="Open Work Orders" /><div className="rounded-2xl p-10 text-center" style={{ ...fdCard, borderStyle: 'dashed' }}><p className="text-sm" style={{ color: '#929292' }}>Work order {id} not found.</p></div></div>;

  const ps = priorityStyle(wo.priority); const ss = statusStyle(wo.status);
  const closed = wo.status === 'Completed' || wo.status === 'Cancelled';

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-5">
      <BackTo href={`${base}/work-orders`} label="Open Work Orders" />

      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div><div className="flex items-center gap-2 flex-wrap"><h1 className="text-2xl font-bold" style={{ color: '#ff385c' }}>{wo.id}</h1><Badge label={wo.priority} {...ps} /><Badge label={wo.status} {...ss} /></div><p className="text-sm mt-1" style={{ color: '#929292' }}>{wo.exactLocation} · Assigned to {wo.assignedTeam}</p></div>
      </div>

      {/* Info */}
      <div className="rounded-2xl p-5 grid grid-cols-1 sm:grid-cols-2 gap-4" style={fdCard}>
        <Info k="Location type" v={wo.locationType} />
        <Info k="Exact location" v={wo.exactLocation} />
        {wo.roomNumber && <Info k="Room" v={wo.roomNumber} />}
        {wo.roomArea && <Info k="Room area" v={wo.roomArea} />}
        <Info k="Item" v={wo.item || '—'} />
        <Info k="Requested by" v={wo.requestedBy} />
        <Info k="Created" v={`${fmtDateTime(wo.createdAt)} · ${wo.createdBy}`} />
        <Info k="Last updated" v={timeAgo(wo.updatedAt)} />
      </div>

      {/* Details */}
      <div className="rounded-2xl p-5" style={fdCard}>
        <p className="text-[11px] font-bold uppercase tracking-wide mb-1" style={{ color: '#929292' }}>Details</p>
        <p className="text-sm" style={{ color: '#222' }}>{wo.details || 'No details provided.'}</p>
        {wo.photoName && <p className="text-xs mt-2 inline-flex items-center gap-1" style={{ color: '#6a6a6a' }}><Camera className="w-3.5 h-3.5" /> {wo.photoName}</p>}
      </div>

      {/* Notes timeline */}
      <div className="rounded-2xl overflow-hidden" style={fdCard}>
        <div className="px-5 py-3" style={{ borderBottom: '1px solid #f0f0f0' }}><p className="text-sm font-bold" style={{ color: '#222' }}>Notes</p></div>
        {wo.notes.length === 0 ? <p className="px-5 py-4 text-sm" style={{ color: '#929292' }}>No notes yet.</p> : wo.notes.map((n, i) => (
          <div key={n.id} className="px-5 py-3 flex gap-3" style={{ borderBottom: i < wo.notes.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
            <Clock className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#cfcfcf' }} />
            <div><p className="text-sm" style={{ color: '#222' }}>{n.note}</p><p className="text-[11px] mt-0.5" style={{ color: '#929292' }}>{n.by} · {timeAgo(n.ts)}</p></div>
          </div>
        ))}
        {!closed && (
          <div className="px-5 py-3 flex gap-2" style={{ borderTop: '1px solid #f0f0f0' }}>
            <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add a note…" className="flex-1 h-10 px-3 rounded-xl text-sm" style={{ border: '1px solid #dddddd', color: '#222' }} />
            <button onClick={() => { if (note.trim()) { addWoNote(wo.id, note.trim()); setNote(''); } }} className="h-10 px-4 rounded-xl text-sm font-bold" style={{ background: '#ff385c', color: '#fff' }}>Add Note</button>
          </div>
        )}
      </div>

      {/* Actions */}
      {!closed && (
        <div className="rounded-2xl p-5 flex flex-col gap-3" style={fdCard}>
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <span className="text-sm font-semibold" style={{ color: '#222' }}>Change priority</span>
            <div className="flex gap-2">{PRIORITIES.map((p) => <button key={p} onClick={() => setWoPriority(wo.id, p)} className="h-9 px-3 rounded-xl text-xs font-bold" style={{ background: wo.priority === p ? '#ff385c' : '#fff', border: '1px solid #dddddd', color: wo.priority === p ? '#fff' : '#6a6a6a' }}>{p}</button>)}</div>
          </div>
          <div className="flex gap-2 flex-wrap pt-2" style={{ borderTop: '1px solid #f0f0f0' }}>
            <label className="h-10 px-3 rounded-xl text-sm font-semibold inline-flex items-center gap-1.5 cursor-pointer" style={{ background: '#f7f7f7', border: '1px solid #dddddd', color: '#6a6a6a' }}><Camera className="w-4 h-4" /> Add Photo<input type="file" accept="image/*" className="hidden" onChange={(e) => addWoPhoto(wo.id, e.target.files?.[0]?.name ?? 'photo.jpg')} /></label>
            <button onClick={() => setWoGuestWaiting(wo.id, !wo.guestWaiting)} className="h-10 px-3 rounded-xl text-sm font-semibold" style={{ background: wo.guestWaiting ? '#fee2e2' : '#f7f7f7', border: '1px solid #dddddd', color: wo.guestWaiting ? '#b91c1c' : '#6a6a6a' }}>{wo.guestWaiting ? 'Guest waiting ✓' : 'Mark guest waiting'}</button>
            <button onClick={() => cancelWorkOrder(wo.id)} className="h-10 px-3 rounded-xl text-sm font-semibold ml-auto" style={{ background: '#fff', border: '1px solid #fca5a5', color: '#b91c1c' }}>Cancel Work Order</button>
          </div>
        </div>
      )}
    </div>
  );
}

function Info({ k, v }: { k: string; v: string }) { return <div><p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: '#929292' }}>{k}</p><p className="text-sm mt-0.5" style={{ color: '#222' }}>{v}</p></div>; }
