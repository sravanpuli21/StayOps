'use client';

import Link from 'next/link';
import { useState } from 'react';
import { mutate } from 'swr';
import { ChevronLeft, Wrench, Sparkles, MapPin, DoorClosed, Check } from 'lucide-react';
import type { ApiRoomSnapshotRow, MaintenanceTicket } from '@hos/shared';
import { useApi } from '@/lib/use-api';
import { apiKeys } from '@/lib/swr-keys';
import { TILE_CFG, statusFromType } from '@/components/operations/_constants';
import {
  HOTEL_AREAS,
  WORK_ORDER_AREAS, WORK_ORDER_ITEMS, type WorkOrderArea,
  SERVICE_CATEGORIES, SERVICE_ITEMS, type ServiceCategory,
  REQUESTED_BY_WORK_ORDER, REQUESTED_BY_SERVICE,
  PRIORITIES, type Priority,
} from './_dictionaries';

type RequestType = 'work-order' | 'service-request';
type LocationType = 'room' | 'hotel-area';
type Step = 'pick-type' | 'pick-location-type' | 'pick-place' | 'form' | 'success';

interface Props {
  hotelCode:   string;
  initialType: RequestType | null;
  initialRoom: string;
  initialArea: string;
}

export function NewRequestClient({ hotelCode, initialType, initialRoom, initialArea }: Props) {
  const [type,         setType]         = useState<RequestType | null>(initialType);
  const [locationType, setLocationType] = useState<LocationType | null>(
    initialRoom ? 'room' : initialArea ? 'hotel-area' : null,
  );
  const [roomNumber,   setRoomNumber]   = useState<string>(initialRoom);
  const [hotelArea,    setHotelArea]    = useState<string>(initialArea);

  // Step machine.
  const step: Step =
    !type ? 'pick-type'
    : !locationType ? 'pick-location-type'
    : (locationType === 'room' && !roomNumber) || (locationType === 'hotel-area' && !hotelArea) ? 'pick-place'
    : 'form';

  // Picker step uses the full available width for the floor grid; the other
  // steps stay narrow so the inputs don't stretch into a giant column.
  const wrapperWidth = step === 'pick-place' && locationType === 'room' ? '' : 'max-w-2xl';

  return (
    <div className={`flex flex-col gap-6 ${wrapperWidth}`}>
      <BackLink hotelCode={hotelCode} step={step} type={type} onBack={(target) => {
        if (target === 'home') {
          // clear, then let DeskShell's back nav handle it
        } else if (target === 'pick-type') {
          setType(null); setLocationType(null); setRoomNumber(''); setHotelArea('');
        } else if (target === 'pick-location-type') {
          setLocationType(null); setRoomNumber(''); setHotelArea('');
        } else if (target === 'pick-place') {
          setRoomNumber(''); setHotelArea('');
        }
      }} />

      {step === 'pick-type'          && <TypePicker hotelCode={hotelCode} onPick={setType} />}
      {step === 'pick-location-type' && type !== null && (
        <LocationTypePicker type={type} onPick={setLocationType} />
      )}
      {step === 'pick-place' && type !== null && locationType === 'room' && (
        <RoomPicker hotelCode={hotelCode} type={type} onPick={setRoomNumber} />
      )}
      {step === 'pick-place' && type !== null && locationType === 'hotel-area' && (
        <HotelAreaPicker type={type} onPick={setHotelArea} />
      )}
      {step === 'form' && type !== null && (
        <RequestForm
          hotelCode={hotelCode}
          type={type}
          roomNumber={locationType === 'room' ? roomNumber : ''}
          hotelArea={locationType === 'hotel-area' ? hotelArea : ''}
        />
      )}
    </div>
  );
}

/* ─── Back link ─── */
function BackLink({
  hotelCode, step,
}: {
  hotelCode: string;
  step: Step;
  type: RequestType | null;
  onBack: (target: 'home' | 'pick-type' | 'pick-location-type' | 'pick-place') => void;
}) {
  if (step === 'success') return null;
  return (
    <Link
      href={`/web/desk/${hotelCode}/home`}
      className="flex items-center gap-1 text-sm font-semibold hover:underline"
      style={{ color: '#ff385c' }}
    >
      <ChevronLeft className="w-4 h-4" />
      Front Desk
    </Link>
  );
}

/* ─── Step 1: Type ─── */
function TypePicker({ hotelCode, onPick }: { hotelCode: string; onPick: (t: RequestType) => void }) {
  return (
    <>
      <header>
        <h1 className="text-2xl font-bold" style={{ color: '#222' }}>New request</h1>
        <p className="text-sm mt-1" style={{ color: '#929292' }}>What do you need to log?</p>
      </header>
      <div className="grid grid-cols-2 gap-4">
        <PickerCard
          icon={<Wrench className="w-7 h-7" style={{ color: '#ff385c' }} />}
          accent="#ff385c"
          title="Work Order"
          description="Maintenance or engineering issue."
          onClick={() => onPick('work-order')}
        />
        <PickerCard
          icon={<Sparkles className="w-7 h-7" style={{ color: '#0ea5e9' }} />}
          accent="#0ea5e9"
          title="Service Request"
          description="Towels, water, shampoo, cleaning, etc."
          onClick={() => onPick('service-request')}
        />
      </div>
      <Link href={`/web/desk/${hotelCode}/home`} className="text-xs hover:underline" style={{ color: '#929292' }}>
        Cancel
      </Link>
    </>
  );
}

/* ─── Step 2: Location type ─── */
function LocationTypePicker({ type, onPick }: { type: RequestType; onPick: (l: LocationType) => void }) {
  return (
    <>
      <header>
        <h1 className="text-2xl font-bold" style={{ color: '#222' }}>{type === 'work-order' ? 'New Work Order' : 'New Service Request'}</h1>
        <p className="text-sm mt-1" style={{ color: '#929292' }}>Where is this request for?</p>
      </header>
      <div className="grid grid-cols-2 gap-4">
        <PickerCard
          icon={<DoorClosed className="w-7 h-7" style={{ color: '#222' }} />}
          accent="#222"
          title="Room"
          description="A specific guest room."
          onClick={() => onPick('room')}
        />
        <PickerCard
          icon={<MapPin className="w-7 h-7" style={{ color: '#222' }} />}
          accent="#222"
          title="Hotel Area"
          description="Lobby, pool, hallway, etc."
          onClick={() => onPick('hotel-area')}
        />
      </div>
    </>
  );
}

/* ─── Step 3a: Room picker (visual grid, grouped by floor) ─── */
function RoomPicker({
  hotelCode, type, onPick,
}: { hotelCode: string; type: RequestType; onPick: (room: string) => void }) {
  const { data } = useApi(apiKeys.opsPropertyRooms(hotelCode));
  const rooms = (data?.rooms ?? []) as ApiRoomSnapshotRow[];
  const [picked, setPicked] = useState<string>('');

  type Tile = {
    roomNumber: string; floor: number; type: string;
    status: ReturnType<typeof statusFromType>;
  };
  const tiles: Tile[] = rooms.map((r) => ({
    roomNumber: r.roomNumber,
    floor:      r.floor,
    type:       r.type,
    status:     statusFromType(r.type),
  }));
  const floorMap: Record<number, Tile[]> = {};
  for (const t of tiles) {
    if (!floorMap[t.floor]) floorMap[t.floor] = [];
    floorMap[t.floor].push(t);
  }
  const floors = Object.keys(floorMap).map(Number).sort((a, b) => b - a);

  return (
    <>
      <header>
        <h1 className="text-2xl font-bold" style={{ color: '#222' }}>{type === 'work-order' ? 'New Work Order' : 'New Service Request'}</h1>
        <p className="text-sm mt-1" style={{ color: '#929292' }}>Tap the room.</p>
      </header>

      <div
        className="rounded-2xl px-4 py-4"
        style={{ background: '#ffffff', border: '1px solid #dddddd' }}
      >
        {floors.length === 0 ? (
          <p className="text-center text-sm py-8" style={{ color: '#929292' }}>
            No rooms loaded yet — upload a room-details CSV to populate this grid.
          </p>
        ) : floors.map((floor) => (
          <div key={floor} className="mb-3 last:mb-0">
            <p className="text-[11px] font-bold uppercase tracking-wide mb-1.5" style={{ color: '#929292' }}>
              Floor {floor}
            </p>
            <div
              className="grid gap-1.5"
              style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(56px, 1fr))' }}
            >
              {floorMap[floor]
                .sort((a, b) => a.roomNumber.localeCompare(b.roomNumber))
                .map((t) => {
                  const cfg = TILE_CFG[t.status] ?? TILE_CFG.occupied;
                  const sel = picked === t.roomNumber;
                  return (
                    <button
                      key={t.roomNumber}
                      type="button"
                      onClick={() => setPicked(t.roomNumber)}
                      title={`Room ${t.roomNumber} · ${cfg.label}`}
                      className="relative rounded-xl flex flex-col items-center justify-center transition-all hover:scale-105 hover:shadow-md"
                      style={{
                        height: 48,
                        background: cfg.bg,
                        border: `${sel ? 2.5 : 1.5}px solid ${sel ? '#ff385c' : cfg.border}`,
                        boxShadow: sel ? '0 0 0 3px rgba(255,56,92,0.18)' : undefined,
                      }}
                    >
                      <span className="text-xs font-bold leading-none" style={{ color: '#222' }}>{t.roomNumber}</span>
                      <div className="w-1.5 h-1.5 rounded-full mt-0.5" style={{ background: cfg.dot }} />
                    </button>
                  );
                })}
            </div>
          </div>
        ))}
      </div>

      {/* Sticky CTA — stays pinned to the bottom of the viewport while the
          floor grid scrolls behind it. */}
      <div
        className="sticky bottom-0 -mx-6 px-6 py-3 flex items-center gap-3"
        style={{
          background: 'rgba(247,247,247,0.92)',
          backdropFilter: 'blur(6px)',
          borderTop: '1px solid #dddddd',
        }}
      >
        <button
          type="button"
          disabled={!picked}
          onClick={() => onPick(picked)}
          className="h-11 px-6 rounded-xl text-sm font-semibold"
          style={{ background: '#ff385c', color: '#fff', opacity: picked ? 1 : 0.5 }}
        >
          Continue {picked && `· Room ${picked}`}
        </button>
        {picked && (
          <span className="text-xs" style={{ color: '#929292' }}>
            <Check className="inline w-3 h-3" /> Selected
          </span>
        )}
      </div>
    </>
  );
}

/* ─── Step 3b: Hotel area picker ─── */
function HotelAreaPicker({ type, onPick }: { type: RequestType; onPick: (a: string) => void }) {
  const [picked, setPicked] = useState<string>('');
  return (
    <>
      <header>
        <h1 className="text-2xl font-bold" style={{ color: '#222' }}>{type === 'work-order' ? 'New Work Order' : 'New Service Request'}</h1>
        <p className="text-sm mt-1" style={{ color: '#929292' }}>Pick the hotel area.</p>
      </header>

      <div className="grid grid-cols-3 gap-2">
        {HOTEL_AREAS.map((a) => {
          const sel = picked === a;
          return (
            <button
              key={a}
              type="button"
              onClick={() => setPicked(a)}
              className="h-12 rounded-xl text-sm font-semibold transition-colors"
              style={{
                background: sel ? '#222' : '#ffffff',
                color: sel ? '#fff' : '#222',
                border: `1px solid ${sel ? '#222' : '#dddddd'}`,
              }}
            >
              {a}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        disabled={!picked}
        onClick={() => onPick(picked)}
        className="h-11 px-6 rounded-xl text-sm font-semibold self-start"
        style={{ background: '#ff385c', color: '#fff', opacity: picked ? 1 : 0.5 }}
      >
        Continue
      </button>
    </>
  );
}

/* ─── Step 4: Form ─── */
function RequestForm({
  hotelCode, type, roomNumber, hotelArea,
}: { hotelCode: string; type: RequestType; roomNumber: string; hotelArea: string }) {
  // Work-order specific
  const [woArea, setWoArea] = useState<WorkOrderArea | ''>('');
  const [woItem, setWoItem] = useState<string>('');
  // Service-request specific
  const [srCategory, setSrCategory] = useState<ServiceCategory | ''>('');
  const [srItem, setSrItem]         = useState<string>('');
  const [quantity, setQuantity]     = useState<number>(1);
  // Shared
  const [requestedBy, setRequestedBy] = useState<string>('Guest');
  const [priority,    setPriority]    = useState<Priority>('Normal');
  const [details,     setDetails]     = useState<string>('');
  const [submitting,  setSubmitting]  = useState<boolean>(false);
  const [error,       setError]       = useState<string | null>(null);
  const [created,     setCreated]     = useState<MaintenanceTicket | null>(null);

  const woItemOptions = woArea ? WORK_ORDER_ITEMS[woArea] : [];
  const srItemOptions = srCategory ? SERVICE_ITEMS[srCategory] : [];
  const requestedByOptions = type === 'work-order' ? REQUESTED_BY_WORK_ORDER : REQUESTED_BY_SERVICE;

  const submit = async () => {
    setError(null);
    if (type === 'work-order') {
      if (!woArea) { setError('Pick the area.'); return; }
      if (!woItem) { setError('Pick the item.'); return; }
    } else {
      if (!srCategory) { setError('Pick the service category.'); return; }
      if (!srItem)     { setError('Pick the item.'); return; }
      if (quantity < 1) { setError('Quantity must be at least 1.'); return; }
    }

    const title =
      type === 'work-order'
        ? `${woItem} — ${woArea}`
        : `${quantity}× ${srItem} — ${srCategory}`;
    const department = type === 'work-order' ? 'Engineering' : 'Housekeeping';
    const requestType = type === 'work-order' ? 'Work Order' : 'Service Request';
    const priorityKey = priority.toLowerCase() as 'low' | 'normal' | 'high' | 'urgent';

    setSubmitting(true);
    try {
      const res = await fetch('/api/ops/tickets', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          hotelCode,
          roomNumber: roomNumber || undefined,
          area:       hotelArea || undefined,
          type:       'reactive',
          priority:   priorityKey,
          title,
          description: details.trim() || undefined,
          reportedBy: requestedBy,
          department,
          requestType,
          callbackRequired: false,
        }),
      });
      const j = await res.json();
      if (!res.ok || !j.ok) {
        setError(typeof j?.error === 'string' ? j.error : 'Failed to create');
        return;
      }
      setCreated(j.ticket as MaintenanceTicket);
      mutate(apiKeys.opsTicketsAll(hotelCode)[0]);
      mutate(apiKeys.opsTickets(hotelCode)[0]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Network error');
    } finally {
      setSubmitting(false);
    }
  };

  if (created) {
    return <SuccessSummary hotelCode={hotelCode} type={type} ticket={created} reset={() => {
      setWoArea(''); setWoItem(''); setSrCategory(''); setSrItem(''); setQuantity(1);
      setRequestedBy('Guest'); setPriority('Normal'); setDetails(''); setCreated(null);
    }} />;
  }

  const lblCls = 'text-[11px] font-semibold uppercase tracking-wide';
  const lblStyle = { color: '#6a6a6a' };
  const inputCls = 'w-full h-11 px-3 rounded-xl outline-none focus:ring-2 focus:ring-[#ff385c] text-base';
  const inputStyle = { border: '1px solid #dddddd', background: '#ffffff', color: '#222' };

  return (
    <>
      <header>
        <h1 className="text-2xl font-bold" style={{ color: '#222' }}>
          {type === 'work-order' ? 'New Work Order' : 'New Service Request'}
        </h1>
        <p className="text-sm mt-1" style={{ color: '#929292' }}>
          {roomNumber ? `Room ${roomNumber}` : hotelArea} · {type === 'work-order' ? 'Routes to Engineering' : 'Routes to Housekeeping'}
        </p>
      </header>

      <form
        onSubmit={(e) => { e.preventDefault(); submit(); }}
        className="rounded-2xl p-5 flex flex-col gap-4"
        style={{ background: '#ffffff', border: '1px solid #dddddd' }}
      >
        {type === 'work-order' ? (
          <>
            <div className="flex flex-col gap-1">
              <label className={lblCls} style={lblStyle}>Area</label>
              <select
                value={woArea}
                onChange={(e) => { setWoArea(e.target.value as WorkOrderArea); setWoItem(''); }}
                className={inputCls}
                style={inputStyle}
              >
                <option value="">Select area…</option>
                {WORK_ORDER_AREAS.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className={lblCls} style={lblStyle}>Item</label>
              <select
                value={woItem}
                onChange={(e) => setWoItem(e.target.value)}
                disabled={!woArea}
                className={inputCls}
                style={inputStyle}
              >
                <option value="">{woArea ? 'Select item…' : 'Pick an area first'}</option>
                {woItemOptions.map((i) => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
          </>
        ) : (
          <>
            <div className="flex flex-col gap-1">
              <label className={lblCls} style={lblStyle}>Service category</label>
              <select
                value={srCategory}
                onChange={(e) => { setSrCategory(e.target.value as ServiceCategory); setSrItem(''); }}
                className={inputCls}
                style={inputStyle}
              >
                <option value="">Select category…</option>
                {SERVICE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className={lblCls} style={lblStyle}>Item</label>
              <select
                value={srItem}
                onChange={(e) => setSrItem(e.target.value)}
                disabled={!srCategory}
                className={inputCls}
                style={inputStyle}
              >
                <option value="">{srCategory ? 'Select item…' : 'Pick a category first'}</option>
                {srItemOptions.map((i) => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className={lblCls} style={lblStyle}>Quantity</label>
              <input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
                className={inputCls}
                style={inputStyle}
              />
            </div>
          </>
        )}

        <div className="flex flex-col gap-1">
          <label className={lblCls} style={lblStyle}>Requested by</label>
          <select
            value={requestedBy}
            onChange={(e) => setRequestedBy(e.target.value)}
            className={inputCls}
            style={inputStyle}
          >
            {requestedByOptions.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className={lblCls} style={lblStyle}>Priority</label>
          <div className="flex gap-1">
            {PRIORITIES.map((p) => {
              const sel = priority === p;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className="flex-1 h-11 rounded-xl text-sm font-semibold"
                  style={{
                    background: sel ? '#222' : '#f7f7f7',
                    color: sel ? '#fff' : '#6a6a6a',
                  }}
                >
                  {p}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className={lblCls} style={lblStyle}>Details</label>
          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            rows={3}
            placeholder={type === 'work-order' ? 'Enter the issue details here' : 'Enter any extra details here'}
            className="w-full px-3 py-2 rounded-xl outline-none focus:ring-2 focus:ring-[#ff385c] text-base resize-y"
            style={inputStyle}
          />
        </div>

        {error && <p className="text-xs" style={{ color: '#b91c1c' }}>{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="h-12 rounded-xl text-base font-semibold transition-opacity"
          style={{
            background: type === 'work-order' ? '#ff385c' : '#0ea5e9',
            color: '#fff',
            opacity: submitting ? 0.6 : 1,
          }}
        >
          {submitting ? 'Submitting…' : type === 'work-order' ? 'Create Work Order' : 'Create Service Request'}
        </button>
      </form>
    </>
  );
}

/* ─── Step 5: Success summary ─── */
function SuccessSummary({
  hotelCode, type, ticket, reset,
}: { hotelCode: string; type: RequestType; ticket: MaintenanceTicket; reset: () => void }) {
  const where = ticket.roomNumber ? `Room ${ticket.roomNumber}` : ticket.area ?? '—';
  const accent = type === 'work-order' ? '#ff385c' : '#0ea5e9';
  const sentTo = type === 'work-order' ? 'Engineering' : 'Housekeeping';
  return (
    <>
      <div className="rounded-2xl p-6 flex items-start gap-4" style={{ background: '#f0fdf4', border: '1px solid #86efac' }}>
        <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: '#15803d' }}>
          <Check className="w-5 h-5" style={{ color: '#ffffff' }} />
        </div>
        <div>
          <p className="text-base font-bold" style={{ color: '#15803d' }}>
            {type === 'work-order' ? 'Work Order created and sent to Engineering.' : 'Service Request created and sent to Housekeeping.'}
          </p>
          <p className="text-sm mt-1" style={{ color: '#15803d' }}>{ticket.title}</p>
        </div>
      </div>

      <section className="rounded-2xl p-5 flex flex-col gap-2" style={{ background: '#ffffff', border: '1px solid #dddddd' }}>
        <p className="text-sm font-bold mb-1" style={{ color: '#222' }}>Summary</p>
        <SummaryRow k="Request type" v={type === 'work-order' ? 'Work Order' : 'Service Request'} />
        <SummaryRow k="Sent to"      v={sentTo} />
        <SummaryRow k="Where"        v={where} />
        {ticket.requestType && <SummaryRow k={type === 'work-order' ? 'Item · area' : 'Item · category'} v={ticket.title} />}
        <SummaryRow k="Requested by" v={ticket.reportedBy} />
        <SummaryRow k="Priority"     v={cap(ticket.priority)} />
        {ticket.description && <SummaryRow k="Details" v={ticket.description} />}
        <SummaryRow k="Status"       v={cap(ticket.status)} />
      </section>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={reset}
          className="h-11 px-5 rounded-xl text-sm font-semibold"
          style={{ background: accent, color: '#fff' }}
        >
          Create Another Request
        </button>
        <Link
          href={`/web/desk/${hotelCode}/home`}
          className="h-11 px-5 rounded-xl text-sm font-semibold inline-flex items-center"
          style={{ background: '#f7f7f7', color: '#222' }}
        >
          Back to Front Desk
        </Link>
      </div>
    </>
  );
}

function SummaryRow({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-baseline gap-3 py-1">
      <p className="text-xs uppercase tracking-wide w-32 flex-shrink-0" style={{ color: '#929292' }}>{k}</p>
      <p className="text-sm" style={{ color: '#222' }}>{v}</p>
    </div>
  );
}

function cap(s: string): string { return s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, ' '); }

/* ─── Generic picker card ─── */
function PickerCard({
  icon, title, description, accent, onClick,
}: { icon: React.ReactNode; title: string; description: string; accent: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-2xl p-6 flex flex-col gap-3 text-left transition-all hover:shadow-md hover:-translate-y-0.5"
      style={{ background: '#ffffff', border: '1px solid #dddddd' }}
    >
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center"
        style={{ background: '#fafafa', borderLeft: `3px solid ${accent}` }}
      >
        {icon}
      </div>
      <p className="text-base font-bold" style={{ color: '#222' }}>{title}</p>
      <p className="text-sm" style={{ color: '#6a6a6a' }}>{description}</p>
    </button>
  );
}
