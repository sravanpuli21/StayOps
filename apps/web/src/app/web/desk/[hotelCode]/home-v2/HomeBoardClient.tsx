'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Wrench, Sparkles, TrendingUp, ArrowRight, X, BedDouble } from 'lucide-react';
import type { MaintenanceTicket } from '@hos/shared';
import { useApi } from '@/lib/use-api';
import { apiKeys } from '@/lib/swr-keys';
import { TILE_CFG, statusFromType } from '@/components/operations/_constants';
import { useDemandSignals } from '@/lib/demand-signals-store';
import { CATEGORY_LABEL } from '@hos/shared';
import { DemandNoteModal } from '../home/DemandNoteModal';

interface Props { hotelCode: string }

/**
 * Front Desk — Room Board (alternative home). A live room-status grid is the
 * centerpiece: tap any room to log a work order / service request / note for
 * that room in context. Header carries at-a-glance stats + global quick-log.
 */
export function HomeBoardClient({ hotelCode }: Props) {
  const router = useRouter();
  const { data: roomsData } = useApi(apiKeys.opsPropertyRooms(hotelCode));
  const { data: ticketsData } = useApi(apiKeys.opsTickets(hotelCode));
  const signals = useDemandSignals();
  const today = new Date().toISOString().slice(0, 10);
  const todays = signals.filter((s) => s.date === today);

  const [selected, setSelected] = useState<string | null>(null);
  const [demandOpen, setDemandOpen] = useState(false);

  const apiRooms = roomsData?.rooms ?? [];
  const tickets = (ticketsData?.tickets as MaintenanceTicket[] | undefined) ?? [];
  const openTickets = tickets.filter((t) => t.status !== 'resolved');

  const ticketsByRoom = useMemo(() => {
    const m: Record<string, number> = {};
    for (const t of openTickets) if (t.roomNumber) m[t.roomNumber] = (m[t.roomNumber] ?? 0) + 1;
    return m;
  }, [openTickets]);

  type Tile = { roomNumber: string; floor: number; status: ReturnType<typeof statusFromType>; rawType: string };
  const tiles: Tile[] = apiRooms.map((r) => ({ roomNumber: r.roomNumber, floor: r.floor, status: statusFromType(r.type), rawType: r.type }));

  const floorMap: Record<number, Tile[]> = {};
  for (const t of tiles) (floorMap[t.floor] ??= []).push(t);
  const floors = Object.keys(floorMap).map(Number).sort((a, b) => b - a);

  // Header stats
  const occupied = tiles.filter((t) => t.status === 'occupied').length;
  const occPct = tiles.length ? Math.round((occupied / tiles.length) * 100) : 0;
  const needsAttention = tiles.filter((t) => t.status === 'dirty' || t.status === 'ooo' || ticketsByRoom[t.roomNumber]).length;

  return (
    <div className="flex flex-col gap-6">
      {/* Header: title + quick stats + global quick-log */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold" style={{ color: '#222' }}>Room Board</h1>
            <HomeToggle hotelCode={hotelCode} active="v2" />
          </div>
          <p className="text-sm mt-1" style={{ color: '#929292' }}>Tap any room to log a work order, request, or note — pre-filled for that room.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Link href={`/web/desk/${hotelCode}/requests/new?type=work-order`} className="inline-flex items-center gap-1.5 h-9 px-3 rounded-full text-sm font-semibold" style={{ background: '#fff', border: '1px solid #dddddd', color: '#222' }}><Wrench className="w-4 h-4" style={{ color: '#ff385c' }} /> Work Order</Link>
          <Link href={`/web/desk/${hotelCode}/requests/new?type=service-request`} className="inline-flex items-center gap-1.5 h-9 px-3 rounded-full text-sm font-semibold" style={{ background: '#fff', border: '1px solid #dddddd', color: '#222' }}><Sparkles className="w-4 h-4" style={{ color: '#0ea5e9' }} /> Request</Link>
          <button onClick={() => setDemandOpen(true)} className="inline-flex items-center gap-1.5 h-9 px-3 rounded-full text-sm font-semibold" style={{ background: '#fff', border: '1px solid #dddddd', color: '#222' }}><TrendingUp className="w-4 h-4" style={{ color: '#7c3aed' }} /> Demand Note</button>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Occupancy" value={`${occPct}%`} sub={`${occupied} of ${tiles.length || '—'} rooms`} accent="#222" />
        <StatCard label="Needs Attention" value={String(needsAttention)} sub="dirty, OOO, or open ticket" accent={needsAttention ? '#b45309' : '#15803d'} />
        <StatCard label="Open Tickets" value={String(openTickets.length)} sub="across the property" accent={openTickets.length ? '#ff385c' : '#15803d'} />
        <StatCard label="Demand Today" value={todays.length ? `+${todays.reduce((s, d) => s + d.occupancyLift, 0)}%` : '—'} sub={todays[0]?.title ?? 'nothing logged'} accent="#7c3aed" />
      </div>

      {/* The board */}
      <div>
        <div className="px-5 py-2.5 flex items-center gap-5 flex-wrap rounded-t-2xl" style={{ background: '#fafafa', borderTop: '1px solid #dddddd', borderLeft: '1px solid #dddddd', borderRight: '1px solid #dddddd' }}>
          <span className="text-xs font-semibold" style={{ color: '#929292' }}>Status:</span>
          {Object.entries(TILE_CFG).map(([status, cfg]) => (
            <span key={status} className="flex items-center gap-1.5 text-xs" style={{ color: '#6a6a6a' }}>
              <span className="w-3 h-3 rounded-sm" style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }} />{cfg.label}
            </span>
          ))}
          <span className="flex items-center gap-1.5 text-xs" style={{ color: '#6a6a6a' }}>
            <span className="w-3 h-3 rounded-full text-[8px] font-black text-white flex items-center justify-center" style={{ background: '#ff385c' }}>!</span>Open ticket count
          </span>
        </div>
        <div className="px-5 py-5 rounded-b-2xl" style={{ background: '#fff', border: '1px solid #dddddd', borderTop: 'none' }}>
          {floors.length === 0 ? (
            <p className="text-sm italic text-center py-10" style={{ color: '#929292' }}>No rooms loaded yet — upload an OnQ room-details CSV to populate this board.</p>
          ) : floors.map((floor) => (
            <div key={floor} className="mb-6 last:mb-0">
              <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: '#929292' }}>Floor {floor}</p>
              <div className="flex flex-wrap gap-1.5">
                {floorMap[floor].sort((a, b) => a.roomNumber.localeCompare(b.roomNumber)).map((t) => {
                  const cfg = TILE_CFG[t.status] ?? TILE_CFG.occupied;
                  const tc = ticketsByRoom[t.roomNumber] ?? 0;
                  return (
                    <button key={t.roomNumber} onClick={() => setSelected(t.roomNumber)}
                      title={`Room ${t.roomNumber} · ${cfg.label}${tc ? ` · ${tc} open ticket${tc === 1 ? '' : 's'}` : ''}`}
                      className="relative rounded-lg flex flex-col items-center justify-center transition-all hover:scale-105 hover:shadow-md"
                      style={{ width: 52, height: 46, background: cfg.bg, border: `1.5px solid ${cfg.border}` }}>
                      <span className="text-[11px] font-bold leading-none" style={{ color: '#222' }}>{t.roomNumber}</span>
                      {tc > 0 && <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full font-black flex items-center justify-center text-white" style={{ background: '#ff385c', fontSize: '8px' }}>{tc}</span>}
                      <div className="w-1 h-1 rounded-full mt-0.5" style={{ background: cfg.dot }} />
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {selected && <RoomActionSheet hotelCode={hotelCode} roomNumber={selected} status={tiles.find((t) => t.roomNumber === selected)?.rawType ?? ''} openTickets={ticketsByRoom[selected] ?? 0} onClose={() => setSelected(null)} router={router} />}
      {demandOpen && <DemandNoteModal onClose={() => setDemandOpen(false)} />}
    </div>
  );
}

function RoomActionSheet({ hotelCode, roomNumber, status, openTickets, onClose, router }: {
  hotelCode: string; roomNumber: string; status: string; openTickets: number; onClose: () => void; router: ReturnType<typeof useRouter>;
}) {
  const go = (path: string) => { router.push(path); onClose(); };
  const base = `/web/desk/${hotelCode}/requests/new?room=${encodeURIComponent(roomNumber)}`;
  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4" style={{ background: 'rgba(0,0,0,0.4)' }} onClick={onClose}>
      <div className="w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl flex flex-col" style={{ background: '#fff', border: '1px solid #dddddd' }} onClick={(e) => e.stopPropagation()}>
        <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid #f0f0f0' }}>
          <div>
            <h2 className="text-base font-bold" style={{ color: '#222' }}>Room {roomNumber}</h2>
            <p className="text-xs mt-0.5" style={{ color: '#929292' }}>{status || 'No status'}{openTickets ? ` · ${openTickets} open ticket${openTickets === 1 ? '' : 's'}` : ''}</p>
          </div>
          <button onClick={onClose}><X className="w-5 h-5" style={{ color: '#6a6a6a' }} /></button>
        </div>
        <div className="p-3 flex flex-col gap-1.5">
          <SheetRow icon={<BedDouble className="w-5 h-5" style={{ color: '#6a6a6a' }} />} title="View Room" desc="Open work, status, and history" onClick={() => go(`/web/desk/${hotelCode}/rooms/${encodeURIComponent(roomNumber)}`)} />
          <SheetRow icon={<Wrench className="w-5 h-5" style={{ color: '#ff385c' }} />} title="Log Work Order" desc="Maintenance or engineering issue" onClick={() => go(`${base}&type=work-order`)} />
          <SheetRow icon={<Sparkles className="w-5 h-5" style={{ color: '#0ea5e9' }} />} title="Log Service Request" desc="Towels, water, amenities…" onClick={() => go(`${base}&type=service-request`)} />
        </div>
      </div>
    </div>
  );
}

function SheetRow({ icon, title, desc, onClick }: { icon: React.ReactNode; title: string; desc: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-colors hover:bg-[#f7f7f7]">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#fafafa', border: '1px solid #f0f0f0' }}>{icon}</div>
      <div className="flex-1 min-w-0"><p className="text-sm font-semibold" style={{ color: '#222' }}>{title}</p><p className="text-xs" style={{ color: '#929292' }}>{desc}</p></div>
      <ArrowRight className="w-4 h-4 flex-shrink-0" style={{ color: '#cfcfcf' }} />
    </button>
  );
}

function StatCard({ label, value, sub, accent }: { label: string; value: string; sub: string; accent: string }) {
  return (
    <div className="rounded-2xl p-4" style={{ background: '#fff', border: '1px solid #dddddd' }}>
      <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: '#929292' }}>{label}</p>
      <p className="text-2xl font-bold mt-1" style={{ color: accent }}>{value}</p>
      <p className="text-[11px] mt-0.5 truncate" style={{ color: '#b0b0b0' }}>{sub}</p>
    </div>
  );
}

export function HomeToggle({ hotelCode, active }: { hotelCode: string; active: 'v1' | 'v2' }) {
  return (
    <div className="inline-flex rounded-full overflow-hidden" style={{ border: '1px solid #dddddd' }}>
      <Link href={`/web/desk/${hotelCode}/home`} className="px-2.5 py-1 text-[11px] font-semibold" style={{ background: active === 'v1' ? '#222' : '#fff', color: active === 'v1' ? '#fff' : '#929292' }}>Classic</Link>
      <Link href={`/web/desk/${hotelCode}/home-v2`} className="px-2.5 py-1 text-[11px] font-semibold" style={{ background: active === 'v2' ? '#222' : '#fff', color: active === 'v2' ? '#fff' : '#929292' }}>Room Board</Link>
    </div>
  );
}
