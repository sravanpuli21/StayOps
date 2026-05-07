'use client';

import { useMemo, useState } from 'react';
import type { Room } from '@hos/shared';
import { EMMA_HOTEL, getAllHotelRooms, getHotelTickets, ROOM_TILE } from '@/lib/emma-data';
import { Filter, Search, Wrench, AlertTriangle } from 'lucide-react';

const ALL_STATUSES = ['ready', 'inspecting', 'dirty', 'occupied', 'ooo', 'blocked'] as const;

function fmtDate(iso?: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function EmmaRoomsPage() {
  const allRooms = useMemo(() => getAllHotelRooms(), []);
  const tickets = useMemo(() => getHotelTickets(), []);
  const ticketsByRoom = useMemo(() => {
    const m = new Map<string, number>();
    for (const t of tickets) {
      if (t.roomNumber) m.set(t.roomNumber, (m.get(t.roomNumber) ?? 0) + 1);
    }
    return m;
  }, [tickets]);

  const [q, setQ] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [floorFilter, setFloorFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const floors = Array.from(new Set(allRooms.map((r) => r.floor))).sort((a, b) => a - b);
  const types = Array.from(new Set(allRooms.map((r) => r.type)));

  const filtered = useMemo(() => allRooms.filter((r) => {
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    if (floorFilter !== 'all' && r.floor !== Number(floorFilter)) return false;
    if (typeFilter !== 'all' && r.type !== typeFilter) return false;
    if (q && !r.number.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  }), [allRooms, statusFilter, floorFilter, typeFilter, q]);

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const r of allRooms) c[r.status] = (c[r.status] ?? 0) + 1;
    return c;
  }, [allRooms]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold" style={{ color: '#222222' }}>Rooms · {EMMA_HOTEL.shortName}</h1>
        <p className="text-sm mt-0.5" style={{ color: '#929292' }}>
          {allRooms.length} rooms · {floors.length} floors · {tickets.length} open tickets
        </p>
      </div>

      {/* Status tabs */}
      <div className="flex gap-2 flex-wrap">
        <StatusTab label="All" count={allRooms.length} active={statusFilter === 'all'} onClick={() => setStatusFilter('all')} />
        {ALL_STATUSES.map((s) => (
          <StatusTab
            key={s}
            label={ROOM_TILE[s].label}
            count={counts[s] ?? 0}
            active={statusFilter === s}
            onClick={() => setStatusFilter(statusFilter === s ? 'all' : s)}
            color={ROOM_TILE[s].dot}
          />
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1 text-xs" style={{ color: '#6a6a6a' }}>
          <Filter className="w-3.5 h-3.5" /> Filter
        </div>
        <select value={floorFilter} onChange={(e) => setFloorFilter(e.target.value)} className="h-8 px-3 rounded-lg text-xs font-semibold outline-none" style={{ background: '#ffffff', border: '1px solid #dddddd', color: '#222' }}>
          <option value="all">All floors</option>
          {floors.map((f) => <option key={f} value={f}>Floor {f}</option>)}
        </select>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="h-8 px-3 rounded-lg text-xs font-semibold outline-none" style={{ background: '#ffffff', border: '1px solid #dddddd', color: '#222' }}>
          <option value="all">All types</option>
          {types.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: '#c1c1c1' }} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search room number…"
            className="w-full h-8 pl-8 pr-3 text-xs rounded-lg outline-none"
            style={{ background: '#ffffff', border: '1px solid #dddddd', color: '#222' }}
          />
        </div>
        <span className="text-xs" style={{ color: '#929292' }}>{filtered.length} match{filtered.length === 1 ? '' : 'es'}</span>
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={{ background: '#ffffff', border: '1px solid #dddddd' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: '#f7f7f7', borderBottom: '1px solid #dddddd' }}>
              <th className="text-left py-3 px-4 text-xs font-bold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>Room</th>
              <th className="text-left py-3 px-4 text-xs font-bold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>Floor</th>
              <th className="text-left py-3 px-4 text-xs font-bold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>Type</th>
              <th className="text-left py-3 px-4 text-xs font-bold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>Status</th>
              <th className="text-left py-3 px-4 text-xs font-bold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>HK</th>
              <th className="text-left py-3 px-4 text-xs font-bold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>Last cleaned</th>
              <th className="text-left py-3 px-4 text-xs font-bold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>Last inspected</th>
              <th className="text-right py-3 px-4 text-xs font-bold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>Tickets</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r, i) => {
              const cfg = ROOM_TILE[r.status];
              const tk = ticketsByRoom.get(r.number) ?? 0;
              return (
                <tr key={r.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                  <td className="py-2 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold" style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, color: '#222' }}>
                        {r.number}
                      </div>
                    </div>
                  </td>
                  <td className="py-2 px-4 text-sm" style={{ color: '#222' }}>F{r.floor}</td>
                  <td className="py-2 px-4 text-sm" style={{ color: '#6a6a6a' }}>{r.type}</td>
                  <td className="py-2 px-4">
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full" style={{ background: cfg.bg, color: cfg.dot }}>
                      {cfg.label}
                    </span>
                    {r.oooReason && <p className="text-[10px] mt-1" style={{ color: '#b91c1c' }}>{r.oooReason}</p>}
                  </td>
                  <td className="py-2 px-4 text-xs capitalize" style={{ color: '#6a6a6a' }}>{r.hkStatus}</td>
                  <td className="py-2 px-4 text-xs" style={{ color: '#6a6a6a' }}>{fmtDate(r.lastCleaned)}</td>
                  <td className="py-2 px-4 text-xs" style={{ color: '#6a6a6a' }}>{fmtDate(r.lastInspected)}</td>
                  <td className="py-2 px-4 text-right">
                    {tk > 0 ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: '#fef2f2', color: '#b91c1c' }}>
                        <Wrench className="w-3 h-3" /> {tk}
                      </span>
                    ) : (
                      <span className="text-xs" style={{ color: '#c1c1c1' }}>—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-10">
            <AlertTriangle className="w-6 h-6 mx-auto mb-2" style={{ color: '#c1c1c1' }} />
            <p className="text-sm" style={{ color: '#6a6a6a' }}>No rooms match these filters</p>
          </div>
        )}
      </div>
    </div>
  );
}

function StatusTab({ label, count, active, onClick, color }: { label: string; count: number; active: boolean; onClick: () => void; color?: string }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-colors"
      style={{
        background: active ? '#ff385c' : '#ffffff',
        color: active ? '#ffffff' : '#6a6a6a',
        border: active ? '1px solid #ff385c' : '1px solid #dddddd',
      }}
    >
      {color && <span className="w-2 h-2 rounded-full" style={{ background: color }} />}
      {label}
      <span
        className="text-[10px] px-1.5 py-0.5 rounded-full font-bold"
        style={{ background: active ? 'rgba(255,255,255,0.25)' : '#f0f0f0', color: active ? '#ffffff' : '#6a6a6a' }}
      >
        {count}
      </span>
    </button>
  );
}
