'use client';

import { useMemo, useState } from 'react';
import { mutate } from 'swr';
import {
  ChevronLeft, ChevronRight, Search, Check, X, Camera, AlertTriangle,
  CheckCircle2, Circle, Wrench, ClipboardCheck, User,
} from 'lucide-react';
import {
  AUDIT_AREA_BY_KEY, AREA_ITEM_COUNTS, getAreasForRoom, getChecklistForArea,
  type AuditArea, type AuditAreaKey, type ChecklistItem,
} from '@hos/shared';
import { useApi } from '@/lib/use-api';
import { apiKeys } from '@/lib/swr-keys';

interface Props {
  hotelCode: string;
}

type Step = 'rooms' | 'areas' | 'checklist';
type ItemResult = 'pass' | 'fail' | null;

interface RoomRow { number: string; floor: number; type?: string; status?: string }

/**
 * Room-first preventive audit flow:
 *   Select Room → Select Area → Complete Checklist → notes/photos →
 *   create ticket if failed → mark audit complete.
 *
 * Checklist items come from the room-audit template (AUDIT_CHECKLIST), filtered
 * by the selected area. Optional areas (balcony / suite / kitchen) only appear
 * for rooms that have those features. The "Subitems" column is ignored.
 */
export function RoomAuditFlow({ hotelCode }: Props) {
  const { data: roomsData } = useApi(apiKeys.opsRooms(hotelCode));
  const rooms = ((roomsData?.rooms ?? []) as RoomRow[]);
  const { data: staffData } = useApi(apiKeys.employees(hotelCode, 'Maintenance'));
  const staff = ((staffData?.employees ?? []) as Array<{ id: string; name: string; status: string }>)
    .filter((e) => e.status === 'active');

  const [step, setStep] = useState<Step>('rooms');
  const [room, setRoom] = useState<RoomRow | null>(null);
  const [area, setArea] = useState<AuditArea | null>(null);
  const [q, setQ] = useState('');

  // Per-room "last technician" memory so we prefer assigning the same tech to
  // the same room/area over time (spec: continuity). Keyed by room→tech name.
  const [assignedTech, setAssignedTech] = useState<Record<string, string>>({});

  const goRooms = () => { setStep('rooms'); setRoom(null); setArea(null); };
  const goAreas = (r: RoomRow) => { setRoom(r); setArea(null); setStep('areas'); };
  const goChecklist = (a: AuditArea) => { setArea(a); setStep('checklist'); };

  // ── Step 1: Rooms ──────────────────────────────────────────────────────────
  const floors = useMemo(() => {
    const filtered = rooms.filter((r) => !q.trim() || r.number.includes(q.trim()));
    const m = new Map<number, RoomRow[]>();
    for (const r of filtered) {
      if (!m.has(r.floor)) m.set(r.floor, []);
      m.get(r.floor)!.push(r);
    }
    return Array.from(m.entries()).sort((a, b) => a[0] - b[0]);
  }, [rooms, q]);

  return (
    <div className="flex flex-col gap-5">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-sm flex-wrap" style={{ color: '#6a6a6a' }}>
        <button onClick={goRooms} className="font-semibold hover:underline" style={{ color: step === 'rooms' ? '#222' : '#ff385c' }}>
          Rooms
        </button>
        {room && (
          <>
            <ChevronRight className="w-3.5 h-3.5" style={{ color: '#c1c1c1' }} />
            <button onClick={() => goAreas(room)} className="font-semibold hover:underline" style={{ color: step === 'areas' ? '#222' : '#ff385c' }}>
              Room {room.number}
            </button>
          </>
        )}
        {area && (
          <>
            <ChevronRight className="w-3.5 h-3.5" style={{ color: '#c1c1c1' }} />
            <span className="font-semibold" style={{ color: '#222' }}>{area.label}</span>
          </>
        )}
      </div>

      {step === 'rooms' && (
        <RoomPicker
          floors={floors}
          q={q}
          setQ={setQ}
          onPick={goAreas}
          totalRooms={rooms.length}
          assignedTech={assignedTech}
        />
      )}

      {step === 'areas' && room && (
        <AreaPicker
          room={room}
          onBack={goRooms}
          onPick={goChecklist}
        />
      )}

      {step === 'checklist' && room && area && (
        <ChecklistStep
          hotelCode={hotelCode}
          room={room}
          area={area}
          staff={staff}
          preferredTech={assignedTech[room.number]}
          onAssignTech={(tech) => setAssignedTech((m) => ({ ...m, [room.number]: tech }))}
          onBack={() => goAreas(room)}
          onComplete={() => goAreas(room)}
        />
      )}
    </div>
  );
}

// ── Step 1: Room picker ───────────────────────────────────────────────────────

function RoomPicker({
  floors, q, setQ, onPick, totalRooms, assignedTech,
}: {
  floors: [number, RoomRow[]][];
  q: string;
  setQ: (v: string) => void;
  onPick: (r: RoomRow) => void;
  totalRooms: number;
  assignedTech: Record<string, string>;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>Select a room</h2>
          <p className="text-xs mt-0.5" style={{ color: '#929292' }}>{totalRooms} rooms · tap a room to start its audit</p>
        </div>
        <div className="relative max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: '#c1c1c1' }} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search room number…"
            className="h-8 pl-8 pr-3 text-xs rounded-lg outline-none"
            style={{ background: '#fff', border: '1px solid #dddddd', color: '#222', minWidth: 200 }}
          />
        </div>
      </div>

      {floors.length === 0 ? (
        <div className="rounded-2xl p-10 text-center" style={{ background: '#fff', border: '1px solid #dddddd' }}>
          <p className="text-sm" style={{ color: '#929292' }}>No rooms match.</p>
        </div>
      ) : (
        <div className="rounded-2xl px-5 py-5" style={{ background: '#fff', border: '1px solid #dddddd' }}>
          {floors.map(([floor, frooms]) => (
            <div key={floor} className="mb-5 last:mb-0">
              <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: '#929292' }}>Floor {floor}</p>
              <div className="flex flex-wrap gap-2">
                {frooms.sort((a, b) => a.number.localeCompare(b.number)).map((r) => {
                  const tech = assignedTech[r.number];
                  return (
                    <button
                      key={r.number}
                      onClick={() => onPick(r)}
                      className="relative rounded-xl flex flex-col items-center justify-center transition-all hover:scale-105 hover:shadow-md"
                      style={{ width: 60, height: 52, background: '#f7f7f7', border: '1.5px solid #dddddd' }}
                      title={`Room ${r.number}${tech ? ` · usual tech: ${tech}` : ''}`}
                    >
                      <span className="text-xs font-bold" style={{ color: '#222' }}>{r.number}</span>
                      {tech && <span className="w-1.5 h-1.5 rounded-full mt-0.5" style={{ background: '#7c3aed' }} />}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Step 2: Area picker ─────────────────────────────────────────────────────

function AreaPicker({
  room, onBack, onPick,
}: { room: RoomRow; onBack: () => void; onPick: (a: AuditArea) => void }) {
  const areas = useMemo(() => getAreasForRoom(room.number, room.type), [room]);
  const required = areas.filter((a) => !a.optional);
  const optional = areas.filter((a) => a.optional);

  return (
    <div className="flex flex-col gap-4">
      <button onClick={onBack} className="inline-flex items-center gap-1 text-sm font-semibold self-start hover:underline" style={{ color: '#ff385c' }}>
        <ChevronLeft className="w-4 h-4" /> All rooms
      </button>
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>
          Room {room.number} · select an area
        </h2>
        <p className="text-xs mt-0.5" style={{ color: '#929292' }}>
          {areas.length} areas apply to this room{room.type ? ` (${room.type})` : ''}. Audit one area or a related group.
        </p>
      </div>

      <AreaGrid areas={required} onPick={onPick} />

      {optional.length > 0 && (
        <>
          <p className="text-xs font-bold uppercase tracking-wide mt-2" style={{ color: '#929292' }}>
            Optional · applies to this room
          </p>
          <AreaGrid areas={optional} onPick={onPick} optional />
        </>
      )}
    </div>
  );
}

function AreaGrid({ areas, onPick, optional }: { areas: AuditArea[]; onPick: (a: AuditArea) => void; optional?: boolean }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {areas.map((a) => (
        <button
          key={a.key}
          onClick={() => onPick(a)}
          className="rounded-2xl p-4 text-left flex items-start gap-3 transition-all hover:shadow-md hover:-translate-y-0.5"
          style={{ background: '#fff', border: `1px solid ${optional ? '#fde68a' : '#dddddd'}` }}
        >
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold" style={{ color: '#222' }}>{a.label}</p>
            <p className="text-xs mt-1" style={{ color: '#929292' }}>{AREA_ITEM_COUNTS[a.key]} checklist items</p>
          </div>
          <ChevronRight className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#c1c1c1' }} />
        </button>
      ))}
    </div>
  );
}

// ── Step 3: Checklist + complete ────────────────────────────────────────────

function ChecklistStep({
  hotelCode, room, area, staff, preferredTech, onAssignTech, onBack, onComplete,
}: {
  hotelCode: string;
  room: RoomRow;
  area: AuditArea;
  staff: Array<{ id: string; name: string }>;
  preferredTech?: string;
  onAssignTech: (tech: string) => void;
  onBack: () => void;
  onComplete: () => void;
}) {
  const items = useMemo(() => getChecklistForArea(area.key), [area]);
  const [results, setResults] = useState<Record<string, ItemResult>>({});
  const [notes, setNotes] = useState('');
  const [photoCount, setPhotoCount] = useState(0);
  const [tech, setTech] = useState<string>(preferredTech ?? (staff[0]?.name ?? 'Sydney Rivera'));
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<{ failed: number; ticketCreated: boolean } | null>(null);

  const passed = Object.values(results).filter((r) => r === 'pass').length;
  const failed = items.filter((it) => results[it.id] === 'fail');
  const reviewed = Object.values(results).filter((r) => r !== null).length;
  const allReviewed = reviewed === items.length;

  const setResult = (id: string, r: ItemResult) =>
    setResults((cur) => ({ ...cur, [id]: cur[id] === r ? null : r }));

  const markAll = (r: ItemResult) =>
    setResults(Object.fromEntries(items.map((it) => [it.id, r])));

  const complete = async () => {
    setSubmitting(true);
    let ticketCreated = false;
    try {
      // Create one maintenance ticket capturing the failed items, if any.
      if (failed.length > 0) {
        const res = await fetch('/api/ops/tickets', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            hotelCode,
            roomNumber: room.number,
            area: area.label,
            type: 'audit',
            priority: failed.length >= 3 ? 'high' : 'normal',
            title: `${area.label} audit — ${failed.length} item${failed.length === 1 ? '' : 's'} failed · Room ${room.number}`,
            description: [
              `Preventive audit failures (${area.label}, Room ${room.number}):`,
              ...failed.map((f) => `• ${f.name}`),
              notes.trim() ? `\nNotes: ${notes.trim()}` : '',
            ].join('\n'),
            reportedBy: tech,
            department: 'Maintenance',
            requestType: 'Audit',
            callbackRequired: false,
          }),
        });
        const j = await res.json().catch(() => ({}));
        ticketCreated = !!(res.ok && j.ok);
        mutate(apiKeys.opsTicketsAll(hotelCode)[0]);
        mutate(apiKeys.opsTickets(hotelCode)[0]);
      }
      onAssignTech(tech); // remember tech for this room (continuity)
      setDone({ failed: failed.length, ticketCreated });
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="flex flex-col gap-4">
        <div className="rounded-2xl p-6 flex items-start gap-4" style={{ background: '#f0fdf4', border: '1px solid #86efac' }}>
          <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: '#15803d' }}>
            <Check className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-base font-bold" style={{ color: '#15803d' }}>
              {area.label} audit complete · Room {room.number}
            </p>
            <p className="text-sm mt-1" style={{ color: '#3f3f3f' }}>
              {passed} passed · {done.failed} failed{photoCount > 0 ? ` · ${photoCount} photo${photoCount === 1 ? '' : 's'}` : ''} · audited by {tech}
            </p>
            {done.ticketCreated && (
              <p className="text-sm mt-1 inline-flex items-center gap-1" style={{ color: '#b45309' }}>
                <Wrench className="w-3.5 h-3.5" /> Maintenance ticket created for {done.failed} failed item{done.failed === 1 ? '' : 's'}.
              </p>
            )}
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={onComplete} className="h-10 px-5 rounded-xl text-sm font-semibold" style={{ background: '#ff385c', color: '#fff' }}>
            Audit another area
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <button onClick={onBack} className="inline-flex items-center gap-1 text-sm font-semibold self-start hover:underline" style={{ color: '#ff385c' }}>
        <ChevronLeft className="w-4 h-4" /> Areas
      </button>

      {/* Header + progress + bulk pass */}
      <div className="rounded-2xl p-5 flex items-center justify-between gap-4 flex-wrap" style={{ background: '#fff', border: '1px solid #dddddd' }}>
        <div>
          <div className="flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5" style={{ color: '#7c3aed' }} />
            <h2 className="text-base font-bold" style={{ color: '#222' }}>{area.label}</h2>
          </div>
          <p className="text-xs mt-0.5" style={{ color: '#929292' }}>
            Room {room.number} · {reviewed}/{items.length} reviewed · {passed} pass · {failed.length} fail
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => markAll('pass')} className="h-8 px-3 rounded-lg text-xs font-semibold inline-flex items-center gap-1" style={{ background: '#dcfce7', color: '#15803d' }}>
            <CheckCircle2 className="w-3.5 h-3.5" /> Mark all pass
          </button>
          <button onClick={() => markAll(null)} className="h-8 px-3 rounded-lg text-xs font-semibold" style={{ background: '#f7f7f7', color: '#6a6a6a', border: '1px solid #dddddd' }}>
            Reset
          </button>
        </div>
      </div>

      {/* Assigned technician */}
      <div className="rounded-2xl p-4 flex items-center gap-3 flex-wrap" style={{ background: '#fff', border: '1px solid #dddddd' }}>
        <User className="w-4 h-4" style={{ color: '#6a6a6a' }} />
        <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>Auditor</label>
        <select value={tech} onChange={(e) => setTech(e.target.value)} className="h-9 px-3 rounded-lg text-sm outline-none" style={{ border: '1px solid #dddddd', background: '#fff', color: '#222' }}>
          {(staff.length > 0 ? staff.map((s) => s.name) : ['Sydney Rivera', 'Amir Lopez']).map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
        {preferredTech && preferredTech === tech && (
          <span className="text-[11px] inline-flex items-center gap-1" style={{ color: '#7c3aed' }}>
            <Check className="w-3 h-3" /> usual tech for this room
          </span>
        )}
      </div>

      {/* Checklist items */}
      <div className="rounded-2xl overflow-hidden" style={{ background: '#fff', border: '1px solid #dddddd' }}>
        {items.map((it, i) => {
          const r = results[it.id] ?? null;
          return (
            <div key={it.id} className="flex items-center gap-3 px-4 py-2.5" style={{ borderBottom: i < items.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
              <div className="flex-shrink-0">
                {r === 'pass' ? <CheckCircle2 className="w-4 h-4" style={{ color: '#15803d' }} />
                  : r === 'fail' ? <AlertTriangle className="w-4 h-4" style={{ color: '#b91c1c' }} />
                  : <Circle className="w-4 h-4" style={{ color: '#d1d5db' }} />}
              </div>
              <p className="flex-1 text-sm" style={{ color: '#222' }}>{it.name}</p>
              <div className="flex gap-1.5 flex-shrink-0">
                <button
                  onClick={() => setResult(it.id, 'pass')}
                  className="h-7 px-3 rounded-lg text-xs font-semibold transition-colors"
                  style={{ background: r === 'pass' ? '#15803d' : '#f7f7f7', color: r === 'pass' ? '#fff' : '#6a6a6a' }}
                >
                  Pass
                </button>
                <button
                  onClick={() => setResult(it.id, 'fail')}
                  className="h-7 px-3 rounded-lg text-xs font-semibold transition-colors"
                  style={{ background: r === 'fail' ? '#b91c1c' : '#f7f7f7', color: r === 'fail' ? '#fff' : '#6a6a6a' }}
                >
                  Fail
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Notes + photos */}
      <div className="rounded-2xl p-5 flex flex-col gap-3" style={{ background: '#fff', border: '1px solid #dddddd' }}>
        <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          placeholder="Anything the next audit should know…"
          className="w-full px-3 py-2 rounded-lg outline-none focus:ring-2 focus:ring-[#ff385c] text-sm resize-y"
          style={{ border: '1px solid #dddddd', background: '#fff', color: '#222' }}
        />
        <button
          onClick={() => setPhotoCount((c) => c + 1)}
          className="self-start inline-flex items-center gap-1.5 h-9 px-3 rounded-lg text-xs font-semibold"
          style={{ background: '#f7f7f7', color: '#222', border: '1px solid #dddddd' }}
        >
          <Camera className="w-3.5 h-3.5" /> Add photo{photoCount > 0 ? ` · ${photoCount}` : ''}
        </button>
      </div>

      {/* Complete */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <p className="text-xs" style={{ color: failed.length > 0 ? '#b45309' : '#929292' }}>
          {failed.length > 0
            ? `${failed.length} failed item${failed.length === 1 ? '' : 's'} → a maintenance ticket will be created.`
            : 'No failures — completing will mark this area current.'}
        </p>
        <button
          onClick={complete}
          disabled={submitting || reviewed === 0}
          className="h-11 px-6 rounded-xl text-sm font-semibold transition-opacity"
          style={{
            background: failed.length > 0 ? '#b45309' : '#15803d',
            color: '#fff',
            opacity: submitting || reviewed === 0 ? 0.5 : 1,
          }}
        >
          {submitting ? 'Saving…' : failed.length > 0 ? 'Complete & create ticket' : 'Mark audit complete'}
        </button>
      </div>
      {!allReviewed && reviewed > 0 && (
        <p className="text-[11px]" style={{ color: '#929292' }}>
          {items.length - reviewed} item{items.length - reviewed === 1 ? '' : 's'} not yet reviewed — you can still complete a partial audit.
        </p>
      )}
    </div>
  );
}
