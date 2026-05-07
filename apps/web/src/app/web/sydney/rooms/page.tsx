'use client';

import { useMemo, useState } from 'react';
import { Filter, Search, Wrench } from 'lucide-react';
import { SYDNEY_HOTEL, getHotelRooms, getHotelTickets } from '@/lib/sydney-data';

const ROOM_TILE: Record<string, { bg: string; border: string; dot: string; label: string }> = {
  ready:      { bg: '#f0fdf4', border: '#86efac', dot: '#22c55e', label: 'Ready' },
  inspecting: { bg: '#eff6ff', border: '#93c5fd', dot: '#3b82f6', label: 'Inspecting' },
  dirty:      { bg: '#fffbeb', border: '#fcd34d', dot: '#f59e0b', label: 'Dirty' },
  occupied:   { bg: '#ffffff', border: '#e5e7eb', dot: '#94a3b8', label: 'Occupied' },
  ooo:        { bg: '#fef2f2', border: '#fca5a5', dot: '#ef4444', label: 'OOO' },
  blocked:    { bg: '#fef2f2', border: '#fca5a5', dot: '#e11d48', label: 'Blocked' },
};

export default function SydneyRoomsPage() {
  const rooms = useMemo(() => getHotelRooms(), []);
  const tickets = useMemo(() => getHotelTickets(), []);
  const ticketsByRoom = useMemo(() => {
    const m = new Map<string, number>();
    for (const t of tickets) {
      if (t.roomNumber && t.status !== 'resolved') {
        m.set(t.roomNumber, (m.get(t.roomNumber) ?? 0) + 1);
      }
    }
    return m;
  }, [tickets]);

  const [filter, setFilter] = useState<'all' | 'hasTicket' | 'ooo' | 'blocked'>('all');

  const floors = useMemo(() => {
    const byFloor = new Map<number, typeof rooms>();
    for (const r of rooms) {
      if (!byFloor.has(r.floor)) byFloor.set(r.floor, []);
      byFloor.get(r.floor)!.push(r);
    }
    return Array.from(byFloor.entries()).sort((a, b) => b[0] - a[0]);
  }, [rooms]);

  const passFilter = (r: typeof rooms[number]) => {
    if (filter === 'all') return true;
    if (filter === 'hasTicket') return (ticketsByRoom.get(r.number) ?? 0) > 0;
    if (filter === 'ooo') return r.status === 'ooo';
    if (filter === 'blocked') return r.status === 'blocked';
    return true;
  };

  const counts = {
    all: rooms.length,
    hasTicket: rooms.filter((r) => (ticketsByRoom.get(r.number) ?? 0) > 0).length,
    ooo: rooms.filter((r) => r.status === 'ooo').length,
    blocked: rooms.filter((r) => r.status === 'blocked').length,
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold" style={{ color: '#222222' }}>Rooms — Maintenance View</h1>
        <p className="text-sm mt-0.5" style={{ color: '#929292' }}>
          {SYDNEY_HOTEL.shortName} · {rooms.length} rooms · {counts.hasTicket} with open tickets · {counts.ooo} OOO · {counts.blocked} blocked
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {([
          { k: 'all',        label: 'All rooms',    count: counts.all,        color: undefined  },
          { k: 'hasTicket',  label: 'With tickets', count: counts.hasTicket,  color: '#b91c1c' },
          { k: 'ooo',        label: 'Out of order', count: counts.ooo,        color: '#ef4444' },
          { k: 'blocked',    label: 'Blocked',      count: counts.blocked,    color: '#e11d48' },
        ] as const).map((t) => {
          const active = filter === t.k;
          return (
            <button
              key={t.k}
              onClick={() => setFilter(t.k)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-colors"
              style={{
                background: active ? '#ff385c' : '#ffffff',
                color: active ? '#ffffff' : (t.color ?? '#6a6a6a'),
                border: active ? '1px solid #ff385c' : '1px solid #dddddd',
              }}
            >
              {t.label}
              <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold" style={{ background: active ? 'rgba(255,255,255,0.25)' : '#f0f0f0', color: active ? '#ffffff' : '#6a6a6a' }}>
                {t.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="px-5 py-2.5 flex items-center gap-5 flex-wrap rounded-t-2xl" style={{ background: '#fafafa', border: '1px solid #dddddd' }}>
        <span className="text-xs font-semibold" style={{ color: '#929292' }}>Status:</span>
        {Object.entries(ROOM_TILE).map(([status, cfg]) => (
          <span key={status} className="flex items-center gap-1.5 text-xs" style={{ color: '#6a6a6a' }}>
            <span className="w-3 h-3 rounded-sm" style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }} />
            {cfg.label}
          </span>
        ))}
        <span className="flex items-center gap-1.5 text-xs" style={{ color: '#6a6a6a' }}>
          <span className="w-3 h-3 rounded-full text-[8px] font-black text-white flex items-center justify-center" style={{ background: '#ff385c' }}>!</span>
          Ticket count
        </span>
      </div>

      {/* Floors */}
      <div className="px-5 py-5 rounded-b-2xl" style={{ background: '#ffffff', border: '1px solid #dddddd', borderTop: 'none' }}>
        {floors.map(([floor, rms]) => {
          const visible = rms.filter(passFilter);
          if (visible.length === 0) return null;
          return (
            <div key={floor} className="mb-5 last:mb-0">
              <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: '#929292' }}>
                Floor {floor} · {visible.length} rooms
              </p>
              <div className="flex flex-wrap gap-2">
                {visible.sort((a, b) => a.number.localeCompare(b.number)).map((r) => {
                  const cfg = ROOM_TILE[r.status] ?? ROOM_TILE.occupied;
                  const tk = ticketsByRoom.get(r.number) ?? 0;
                  return (
                    <div
                      key={r.id}
                      className="relative rounded-xl flex flex-col items-center justify-center"
                      style={{ width: 64, height: 56, background: cfg.bg, border: `1.5px solid ${cfg.border}` }}
                      title={`Room ${r.number} · ${cfg.label}${r.oooReason ? ` (${r.oooReason})` : ''}${tk ? ` · ${tk} open ticket${tk === 1 ? '' : 's'}` : ''}`}
                    >
                      <span className="text-xs font-bold" style={{ color: '#222' }}>{r.number}</span>
                      {tk > 0 && (
                        <span
                          className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full text-xs font-black flex items-center justify-center text-white"
                          style={{ background: '#ff385c', fontSize: '9px' }}
                        >
                          {tk}
                        </span>
                      )}
                      <div className="w-1.5 h-1.5 rounded-full mt-0.5" style={{ background: cfg.dot }} />
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
