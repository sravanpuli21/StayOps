'use client';

import { useState } from 'react';
import { Clock, Plus } from 'lucide-react';
import { useFdState, addSrNote, addSrItem, setSrPriority, cancelServiceRequest, setSrGuestWaiting } from '../../_store';
import { PRIORITIES, SR_ITEM_GROUPS, SR_ALL_ITEMS, priorityStyle, statusStyle } from '../../_data';
import { fdCard, Badge, BackTo, fmtDateTime, timeAgo, QtyStepper } from '../../_ui';

interface Props { hotelCode: string; id: string }

export function ServiceRequestDetailClient({ hotelCode, id }: Props) {
  const base = `/web/front-desk/${hotelCode}`;
  const state = useFdState();
  const sr = state.serviceRequests.find((r) => r.id === id);
  const [note, setNote] = useState('');
  const [newItem, setNewItem] = useState(SR_ALL_ITEMS[0]);
  const [newQty, setNewQty] = useState(1);
  const [adding, setAdding] = useState(false);

  if (!sr) return <div className="max-w-2xl mx-auto flex flex-col gap-4"><BackTo href={`${base}/service-requests`} label="Open Service Requests" /><div className="rounded-2xl p-10 text-center" style={{ ...fdCard, borderStyle: 'dashed' }}><p className="text-sm" style={{ color: '#929292' }}>Service request {id} not found.</p></div></div>;

  const ps = priorityStyle(sr.priority); const ss = statusStyle(sr.status);
  const closed = sr.status === 'Completed' || sr.status === 'Cancelled';

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-5">
      <BackTo href={`${base}/service-requests`} label="Open Service Requests" />

      <div><div className="flex items-center gap-2 flex-wrap"><h1 className="text-2xl font-bold" style={{ color: '#0ea5e9' }}>{sr.id}</h1><Badge label={sr.priority} {...ps} /><Badge label={sr.status} {...ss} /></div><p className="text-sm mt-1" style={{ color: '#929292' }}>{sr.roomNumber ? `Room ${sr.roomNumber}` : sr.exactLocation || sr.locationType} · Assigned to {sr.assignedTeam}</p></div>

      {/* Items — hidden for common-area requests, which are described in Notes. */}
      {(sr.items.length > 0 || adding) && (
      <div className="rounded-2xl overflow-hidden" style={fdCard}>
        <div className="px-5 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid #f0f0f0' }}><p className="text-sm font-bold" style={{ color: '#222' }}>Requested items</p>{!closed && <button onClick={() => setAdding((a) => !a)} className="text-sm font-semibold inline-flex items-center gap-1" style={{ color: '#0ea5e9' }}><Plus className="w-4 h-4" /> Add Item</button>}</div>
        {sr.items.map((it, i) => (
          <div key={it.id} className="px-5 py-3 flex items-center gap-3" style={{ borderBottom: i < sr.items.length - 1 || adding ? '1px solid #f0f0f0' : 'none' }}>
            <span className="w-10 h-10 rounded-xl flex items-center justify-center text-base font-bold flex-shrink-0" style={{ background: '#f0f9ff', color: '#0ea5e9' }}>{it.qty}</span>
            <div className="flex-1"><p className="text-sm font-semibold" style={{ color: '#222' }}>{it.name}</p>{it.notes && <p className="text-xs" style={{ color: '#929292' }}>{it.notes}</p>}</div>
          </div>
        ))}
        {adding && (
          <div className="px-5 py-3 flex items-end gap-3 flex-wrap" style={{ background: '#fafafa' }}>
            <div className="flex-1 min-w-[160px]"><label className="text-xs font-semibold block mb-1" style={{ color: '#6a6a6a' }}>Item</label><select value={newItem} onChange={(e) => setNewItem(e.target.value)} className="h-10 px-2.5 rounded-xl text-sm w-full" style={{ border: '1px solid #dddddd', color: '#222' }}>{SR_ITEM_GROUPS.map((g) => <optgroup key={g.group} label={g.group}>{g.items.map((x) => <option key={x} value={x}>{x}</option>)}</optgroup>)}</select></div>
            <QtyStepper value={newQty} onChange={setNewQty} />
            <button onClick={() => { addSrItem(sr.id, newItem, newQty); setAdding(false); setNewQty(1); }} className="h-10 px-4 rounded-xl text-sm font-bold" style={{ background: '#0ea5e9', color: '#fff' }}>Add</button>
          </div>
        )}
      </div>
      )}

      {/* Info */}
      <div className="rounded-2xl p-5 grid grid-cols-1 sm:grid-cols-2 gap-4" style={fdCard}>
        <Info k={sr.roomNumber ? 'Room number' : 'Location'} v={sr.roomNumber ?? sr.exactLocation ?? sr.locationType} />
        <Info k="Requested by" v={sr.requestedBy} />
        <Info k="Created" v={`${fmtDateTime(sr.createdAt)} · ${sr.createdBy}`} />
        <Info k="Last updated" v={timeAgo(sr.updatedAt)} />
        {sr.overallDetails && <div className="sm:col-span-2"><Info k="Notes" v={sr.overallDetails} /></div>}
      </div>

      {/* Notes */}
      <div className="rounded-2xl overflow-hidden" style={fdCard}>
        <div className="px-5 py-3" style={{ borderBottom: '1px solid #f0f0f0' }}><p className="text-sm font-bold" style={{ color: '#222' }}>Notes</p></div>
        {sr.notes.length === 0 ? <p className="px-5 py-4 text-sm" style={{ color: '#929292' }}>No notes yet.</p> : sr.notes.map((n, i) => (
          <div key={n.id} className="px-5 py-3 flex gap-3" style={{ borderBottom: i < sr.notes.length - 1 ? '1px solid #f0f0f0' : 'none' }}><Clock className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#cfcfcf' }} /><div><p className="text-sm" style={{ color: '#222' }}>{n.note}</p><p className="text-[11px] mt-0.5" style={{ color: '#929292' }}>{n.by} · {timeAgo(n.ts)}</p></div></div>
        ))}
        {!closed && <div className="px-5 py-3 flex gap-2" style={{ borderTop: '1px solid #f0f0f0' }}><input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add a note…" className="flex-1 h-10 px-3 rounded-xl text-sm" style={{ border: '1px solid #dddddd', color: '#222' }} /><button onClick={() => { if (note.trim()) { addSrNote(sr.id, note.trim()); setNote(''); } }} className="h-10 px-4 rounded-xl text-sm font-bold" style={{ background: '#0ea5e9', color: '#fff' }}>Add Note</button></div>}
      </div>

      {/* Actions */}
      {!closed && (
        <div className="rounded-2xl p-5 flex flex-col gap-3" style={fdCard}>
          <div className="flex items-center justify-between gap-3 flex-wrap"><span className="text-sm font-semibold" style={{ color: '#222' }}>Change priority</span><div className="flex gap-2">{PRIORITIES.map((p) => <button key={p} onClick={() => setSrPriority(sr.id, p)} className="h-9 px-3 rounded-xl text-xs font-bold" style={{ background: sr.priority === p ? '#0ea5e9' : '#fff', border: '1px solid #dddddd', color: sr.priority === p ? '#fff' : '#6a6a6a' }}>{p}</button>)}</div></div>
          <div className="flex gap-2 flex-wrap pt-2" style={{ borderTop: '1px solid #f0f0f0' }}>
            <button onClick={() => setSrGuestWaiting(sr.id, !sr.guestWaiting)} className="h-10 px-3 rounded-xl text-sm font-semibold" style={{ background: sr.guestWaiting ? '#fee2e2' : '#f7f7f7', border: '1px solid #dddddd', color: sr.guestWaiting ? '#b91c1c' : '#6a6a6a' }}>{sr.guestWaiting ? 'Guest waiting ✓' : 'Mark guest waiting'}</button>
            <button onClick={() => cancelServiceRequest(sr.id)} className="h-10 px-3 rounded-xl text-sm font-semibold ml-auto" style={{ background: '#fff', border: '1px solid #fca5a5', color: '#b91c1c' }}>Cancel Service Request</button>
          </div>
        </div>
      )}
    </div>
  );
}

function Info({ k, v }: { k: string; v: string }) { return <div><p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: '#929292' }}>{k}</p><p className="text-sm mt-0.5" style={{ color: '#222' }}>{v}</p></div>; }
