'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Search, CheckCircle2, Trash2, Plus, BedDouble, Building, MoreHorizontal } from 'lucide-react';
import { useApi } from '@/lib/use-api';
import { apiKeys } from '@/lib/swr-keys';
import { statusFromType, TILE_CFG } from '@/components/operations/_constants';
import {
  SR_LOCATION_TYPES, SR_ITEM_GROUPS, SR_ALL_ITEMS, PRIORITIES, type Priority,
} from '../../_data';
import { HOTEL_AREAS } from '@/app/web/desk/[hotelCode]/requests/new/_dictionaries';
import { createServiceRequest, type ServiceRequest, type SrItem } from '../../_store';
import { pushServiceRequestToHousekeeping } from '../../_sr-to-housekeeping';
import { fdCard, Field, fdInput, fdInputStyle, QtyStepper, BackTo } from '../../_ui';

interface Props { hotelCode: string }
type Step = 'location' | 'room' | 'area' | 'items' | 'done';
type Line = { key: string; name: string; qty: number; notes: string };

export function NewServiceRequestClient({ hotelCode }: Props) {
  const base = `/web/front-desk/${hotelCode}`;
  const [step, setStep] = useState<Step>('location');
  const [locationType, setLocationType] = useState<string>('Guest Room');
  const [roomNumber, setRoomNumber] = useState('');
  const [hotelArea, setHotelArea] = useState('');
  const [guestName, setGuestName] = useState('');
  const [lines, setLines] = useState<Line[]>([]);
  const [priority, setPriority] = useState<Priority>('Normal');
  const [details, setDetails] = useState('');
  const [created, setCreated] = useState<ServiceRequest | null>(null);

  const addLine = () => setLines((l) => [...l, { key: `k-${Date.now()}-${l.length}`, name: SR_ALL_ITEMS[0], qty: 1, notes: '' }]);
  const setLine = (key: string, patch: Partial<Line>) => setLines((l) => l.map((x) => x.key === key ? { ...x, ...patch } : x));
  const removeLine = (key: string) => setLines((l) => l.filter((x) => x.key !== key));

  const reset = () => { setStep('location'); setLocationType('Guest Room'); setRoomNumber(''); setHotelArea(''); setGuestName(''); setLines([]); setPriority('Normal'); setDetails(''); setCreated(null); };

  // Common-area requests are described in the details box (no item cart);
  // every other request needs at least one item line.
  const isCommonArea = locationType === 'Common Area';
  const canSubmit = isCommonArea ? details.trim().length > 0 : lines.length > 0;

  const submit = () => {
    const items: SrItem[] = lines.map((l) => ({ id: l.key, name: l.name, qty: l.qty, notes: l.notes || undefined }));
    const sr = createServiceRequest({ hotelCode, locationType, roomNumber: locationType === 'Guest Room' ? roomNumber : undefined, exactLocation: locationType === 'Common Area' ? (hotelArea || undefined) : undefined, guestName: guestName || undefined, requestedBy: 'Guest', priority, overallDetails: details, items });
    setCreated(sr); setStep('done');
    // Route to Housekeeping (Emma's queue) in the background.
    void pushServiceRequestToHousekeeping(sr);
  };

  if (step === 'done' && created) {
    return (
      <div className="max-w-lg mx-auto flex flex-col gap-5">
        <div className="rounded-2xl p-8 flex flex-col items-center text-center gap-3" style={fdCard}>
          <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: '#dcfce7' }}><CheckCircle2 className="w-7 h-7" style={{ color: '#15803d' }} /></div>
          <h1 className="text-xl font-bold" style={{ color: '#222' }}>Service request created successfully</h1>
          <p className="text-2xl font-black" style={{ color: '#0ea5e9' }}>{created.id}</p>
          <div className="w-full rounded-xl p-4 flex flex-col gap-2 mt-1" style={{ background: '#f7f7f7' }}>
            <Row k={created.roomNumber ? 'Room number' : 'Location'} v={created.roomNumber ?? created.exactLocation ?? created.locationType} />
            {created.items.length > 0
              ? <Row k="Items requested" v={created.items.map((i) => `${i.name} ×${i.qty}`).join(', ')} />
              : <Row k="Details" v={created.overallDetails || '—'} />}
            <Row k="Assigned team" v="Housekeeping" />
            <Row k="Status" v="New" />
          </div>
          <p className="text-xs px-3 py-2 rounded-lg w-full" style={{ background: '#e0f2fe', color: '#0369a1' }}>Sent to the Housekeeping queue — it now shows on the housekeeping supervisor&rsquo;s dashboard.</p>
          <div className="flex flex-col sm:flex-row gap-2 w-full mt-2">
            <button onClick={reset} className="flex-1 h-11 rounded-xl text-sm font-bold" style={{ background: '#0ea5e9', color: '#fff' }}>Create Another Request</button>
            <Link href={`${base}/service-requests/${created.id}`} className="flex-1 h-11 leading-[44px] text-center rounded-xl text-sm font-bold" style={{ background: '#f7f7f7', border: '1px solid #dddddd', color: '#6a6a6a' }}>View Service Request</Link>
          </div>
          <Link href={`${base}/home`} className="text-sm font-semibold mt-1" style={{ color: '#929292' }}>Back to Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-5">
      {step === 'location' ? <BackTo href={`${base}/home`} label="Home" /> : <button onClick={() => setStep(step === 'items' ? (locationType === 'Guest Room' ? 'room' : locationType === 'Common Area' ? 'area' : 'location') : 'location')} className="inline-flex items-center gap-1.5 text-sm font-semibold self-start" style={{ color: '#6a6a6a' }}><ArrowLeft className="w-4 h-4" /> Back</button>}

      <div><h1 className="text-2xl font-bold" style={{ color: '#222' }}>New Service Request</h1><p className="text-sm mt-1" style={{ color: '#929292' }}>{step === 'location' ? 'Step 1 — where is the request for?' : step === 'room' ? 'Step 1 — pick the room' : step === 'area' ? 'Step 1 — pick the area' : 'Step 2 — add the requested items'}</p></div>

      {step === 'location' && (
        <div className="flex flex-col gap-3">
          {SR_LOCATION_TYPES.map((t) => (
            <button key={t} onClick={() => { setLocationType(t); setStep(t === 'Guest Room' ? 'room' : t === 'Common Area' ? 'area' : 'items'); }} className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all hover:shadow-md hover:-translate-y-0.5" style={fdCard}>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: '#fafafa' }}>{t === 'Guest Room' ? <BedDouble className="w-6 h-6" style={{ color: '#0ea5e9' }} /> : t === 'Common Area' ? <Building className="w-6 h-6" style={{ color: '#0ea5e9' }} /> : <MoreHorizontal className="w-6 h-6" style={{ color: '#0ea5e9' }} />}</div>
              <span className="text-base font-bold" style={{ color: '#222' }}>{t}</span>
            </button>
          ))}
        </div>
      )}

      {step === 'room' && <RoomPicker hotelCode={hotelCode} onPick={(rn) => { setRoomNumber(rn); if (lines.length === 0) addLine(); setStep('items'); }} />}

      {step === 'area' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {HOTEL_AREAS.map((a) => (
            <button key={a} onClick={() => { setHotelArea(a); setStep('items'); }} className="h-20 rounded-2xl text-base font-bold transition-all hover:shadow-md hover:-translate-y-0.5 flex items-center justify-center text-center px-3" style={{ ...fdCard, color: '#222' }}>{a}</button>
          ))}
        </div>
      )}

      {step === 'items' && (
        <div className="flex flex-col gap-4">
          {locationType === 'Guest Room' && (
            <div className="rounded-2xl p-4 flex items-center gap-4 flex-wrap" style={fdCard}>
              <div><p className="text-[10px] uppercase tracking-wide" style={{ color: '#929292' }}>Room</p><p className="text-lg font-bold" style={{ color: '#222' }}>{roomNumber}</p></div>
              <div className="flex-1 min-w-[160px]"><Field label="Guest name (optional)"><input value={guestName} onChange={(e) => setGuestName(e.target.value)} className={fdInput} style={fdInputStyle} /></Field></div>
            </div>
          )}
          {locationType === 'Common Area' && hotelArea && (
            <div className="rounded-2xl p-4 flex items-center gap-3" style={fdCard}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#f0f9ff' }}><Building className="w-5 h-5" style={{ color: '#0ea5e9' }} /></div>
              <div><p className="text-[10px] uppercase tracking-wide" style={{ color: '#929292' }}>Area</p><p className="text-lg font-bold" style={{ color: '#222' }}>{hotelArea}</p></div>
              <button onClick={() => setStep('area')} className="ml-auto text-sm font-semibold" style={{ color: '#0ea5e9' }}>Change</button>
            </div>
          )}

          {/* Item lines — only for room/other requests; common-area requests are
              described free-form in the details box below. */}
          {locationType !== 'Common Area' && (
            <div className="flex flex-col gap-3">
              {lines.map((l) => (
                <div key={l.key} className="rounded-2xl p-4 flex flex-col gap-3" style={fdCard}>
                  <div className="flex items-end gap-3 flex-wrap">
                    <div className="flex-1 min-w-[180px]"><Field label="Item"><select value={l.name} onChange={(e) => setLine(l.key, { name: e.target.value })} className={fdInput} style={fdInputStyle}>{SR_ITEM_GROUPS.map((g) => <optgroup key={g.group} label={g.group}>{g.items.map((it) => <option key={it} value={it}>{it}</option>)}</optgroup>)}</select></Field></div>
                    <div><Field label="Quantity"><QtyStepper value={l.qty} onChange={(n) => setLine(l.key, { qty: n })} /></Field></div>
                    <button onClick={() => removeLine(l.key)} className="h-11 w-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#fff', border: '1px solid #fca5a5' }}><Trash2 className="w-4 h-4" style={{ color: '#b91c1c' }} /></button>
                  </div>
                  <input value={l.notes} onChange={(e) => setLine(l.key, { notes: e.target.value })} placeholder="Notes for this item (optional)" className="h-10 px-3 rounded-xl text-sm" style={{ border: '1px solid #eee', color: '#222' }} />
                </div>
              ))}
              <button onClick={addLine} className="h-12 rounded-2xl text-sm font-bold inline-flex items-center justify-center gap-2" style={{ background: '#fff', border: '1px dashed #0ea5e9', color: '#0ea5e9' }}><Plus className="w-4 h-4" /> Add Item</button>
            </div>
          )}

          {/* Final fields */}
          <div className="rounded-2xl p-5 flex flex-col gap-4" style={fdCard}>
            <Field label="Priority"><div className="flex gap-2">{PRIORITIES.map((p) => <button key={p} onClick={() => setPriority(p)} className="flex-1 h-11 rounded-xl text-sm font-bold" style={{ background: priority === p ? '#0ea5e9' : '#fff', border: '1px solid #dddddd', color: priority === p ? '#fff' : '#6a6a6a' }}>{p}</button>)}</div></Field>
            <Field label={isCommonArea ? 'Details' : 'Overall details'} required={isCommonArea}><textarea value={details} onChange={(e) => setDetails(e.target.value)} rows={3} placeholder={isCommonArea ? 'Describe the request. Example: Spill in the lobby near the entrance — needs a mop and wet-floor sign.' : 'Example: Guest requested 4 towels and 2 bottles of water. Please deliver to room 303.'} className="px-3 py-2.5 rounded-xl text-base outline-none w-full resize-none" style={fdInputStyle} /></Field>
            <div className="flex flex-col sm:flex-row gap-2">
              <button onClick={submit} disabled={!canSubmit} className="flex-1 h-12 rounded-xl text-base font-bold" style={{ background: canSubmit ? '#0ea5e9' : '#dddddd', color: '#fff' }}>Submit Service Request</button>
              <button onClick={submit} disabled={!canSubmit} className="h-12 px-5 rounded-xl text-sm font-bold" style={{ background: '#f7f7f7', border: '1px solid #dddddd', color: '#6a6a6a' }}>Save as Draft</button>
              <Link href={`${base}/home`} className="h-12 px-5 leading-[48px] text-center rounded-xl text-sm font-bold" style={{ background: '#fff', border: '1px solid #dddddd', color: '#6a6a6a' }}>Cancel</Link>
            </div>
            {!canSubmit && <p className="text-xs" style={{ color: '#b45309' }}>{isCommonArea ? 'Add details to submit.' : 'Add at least one item to submit.'}</p>}
          </div>
        </div>
      )}
    </div>
  );
}

function RoomPicker({ hotelCode, onPick }: { hotelCode: string; onPick: (rn: string) => void }) {
  const { data } = useApi(apiKeys.opsPropertyRooms(hotelCode));
  const [q, setQ] = useState('');
  const rooms = (data?.rooms ?? []).map((r) => ({ rn: r.roomNumber, status: statusFromType(r.type) }));
  const filtered = q ? rooms.filter((r) => r.rn.includes(q)) : rooms;
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 h-12 px-4 rounded-2xl" style={fdCard}>
        <Search className="w-5 h-5" style={{ color: '#929292' }} />
        <input value={q} onChange={(e) => setQ(e.target.value)} inputMode="numeric" placeholder="Search room number…" className="flex-1 text-base outline-none bg-transparent" style={{ color: '#222' }} autoFocus />
      </div>
      {rooms.length === 0 ? <p className="text-sm italic text-center py-8" style={{ color: '#929292' }}>No rooms loaded for this hotel.</p> : (
        <div className="flex flex-wrap gap-2">
          {filtered.slice(0, 120).map((r) => { const cfg = TILE_CFG[r.status] ?? TILE_CFG.occupied; return (
            <button key={r.rn} onClick={() => onPick(r.rn)} className="rounded-xl flex flex-col items-center justify-center transition-all hover:scale-105 hover:shadow-md" style={{ width: 60, height: 52, background: cfg.bg, border: `1.5px solid ${cfg.border}` }}><span className="text-sm font-bold leading-none" style={{ color: '#222' }}>{r.rn}</span><span className="text-[9px] mt-0.5" style={{ color: '#6a6a6a' }}>{cfg.label}</span></button>
          ); })}
        </div>
      )}
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) { return <div className="flex justify-between gap-3"><span className="text-sm" style={{ color: '#6a6a6a' }}>{k}</span><span className="text-sm font-semibold text-right" style={{ color: '#222' }}>{v}</span></div>; }
