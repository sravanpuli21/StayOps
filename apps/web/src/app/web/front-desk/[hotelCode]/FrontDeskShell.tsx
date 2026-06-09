'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home, Wrench, ConciergeBell, Clock, TrendingUp, ClipboardList, BellRing,
  CheckCircle2, Settings, Search, Monitor, X,
} from 'lucide-react';
import { DEVICE_NAME } from './_data';
import { useFdState } from './_store';

interface Props { hotelCode: string; hotelName: string; hotelCity: string; hotelState: string; children: React.ReactNode }

const NAV = [
  { label: 'Home', seg: 'home', icon: Home },
  { label: 'New Work Order', seg: 'work-orders/new', icon: Wrench },
  { label: 'New Service Request', seg: 'service-requests/new', icon: ConciergeBell },
  { label: 'Punch In / Punch Out', seg: 'punch', icon: Clock },
  { label: "Today's Hotel Pulse", seg: 'pulse', icon: TrendingUp },
  { label: 'Open Work Orders', seg: 'work-orders', icon: ClipboardList },
  { label: 'Open Service Requests', seg: 'service-requests', icon: BellRing },
  { label: 'Completed Items', seg: 'completed', icon: CheckCircle2 },
  { label: 'Settings', seg: 'settings', icon: Settings },
];

export function FrontDeskShell({ hotelCode, hotelName, hotelCity, hotelState, children }: Props) {
  const pathname = usePathname() ?? '';
  const base = `/web/front-desk/${hotelCode}`;

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#f7f7f7' }}>
      {/* Left nav */}
      <aside className="w-64 flex-shrink-0 flex flex-col" style={{ background: '#fff', borderRight: '1px solid #dddddd' }}>
        <div className="h-16 flex items-center gap-2.5 px-5 flex-shrink-0" style={{ borderBottom: '1px solid #f0f0f0' }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-black" style={{ background: '#ff385c' }}>S</div>
          <div><p className="text-sm font-bold leading-none" style={{ color: '#222' }}>StayOps</p><p className="text-[10px] mt-0.5" style={{ color: '#929292' }}>Front Desk Access</p></div>
        </div>
        <nav className="flex-1 overflow-y-auto py-3 px-2.5 flex flex-col gap-1">
          {NAV.map((it) => {
            const href = `${base}/${it.seg}`;
            // exact for home; for list segments avoid matching their /new child as the same nav item
            const isList = it.seg === 'work-orders' || it.seg === 'service-requests';
            const active = it.seg === 'home'
              ? pathname === href
              : isList
                ? (pathname === href || (pathname.startsWith(href + '/') && !pathname.endsWith('/new')))
                : pathname.startsWith(href);
            const Icon = it.icon;
            return (
              <Link key={it.seg} href={href} className="flex items-center gap-3 h-11 px-3 rounded-xl text-sm" style={{ background: active ? '#fff0f3' : 'transparent', color: active ? '#ff385c' : '#3f3f3f', fontWeight: active ? 700 : 500 }}>
                <Icon className="w-[18px] h-[18px] flex-shrink-0" style={{ color: active ? '#ff385c' : '#6a6a6a' }} />
                <span>{it.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="px-4 py-3 flex items-center gap-2.5" style={{ borderTop: '1px solid #f0f0f0' }}>
          <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#f7f7f7' }}><Monitor className="w-4 h-4" style={{ color: '#6a6a6a' }} /></div>
          <div className="min-w-0"><p className="text-xs font-bold truncate" style={{ color: '#222' }}>{DEVICE_NAME}</p><p className="text-[10px] truncate" style={{ color: '#929292' }}>{hotelName}</p></div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar hotelCode={hotelCode} hotelName={hotelName} hotelCity={hotelCity} hotelState={hotelState} base={base} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}

function TopBar({ hotelCode, hotelName, hotelCity, hotelState, base }: { hotelCode: string; hotelName: string; hotelCity: string; hotelState: string; base: string }) {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => { setNow(new Date()); const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t); }, []);

  return (
    <header className="h-16 flex items-center gap-4 px-6 flex-shrink-0" style={{ background: '#fff', borderBottom: '1px solid #dddddd' }}>
      <div className="min-w-0">
        <p className="text-sm font-bold truncate" style={{ color: '#222' }}>{hotelName}</p>
        <p className="text-[11px]" style={{ color: '#929292' }}>{hotelCity}, {hotelState}</p>
      </div>
      <GlobalSearch base={base} />
      <div className="ml-auto flex items-center gap-4">
        <span className="hidden lg:inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-xs font-semibold" style={{ background: '#fff0f3', color: '#ff385c' }}><Monitor className="w-3.5 h-3.5" /> {DEVICE_NAME}</span>
        <div className="text-right">
          <p className="text-sm font-bold tabular-nums" style={{ color: '#222' }}>{now ? now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : '—'}</p>
          <p className="text-[11px]" style={{ color: '#929292' }}>{now ? now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : ''}</p>
        </div>
      </div>
    </header>
  );
}

function GlobalSearch({ base }: { base: string }) {
  const router = useRouter();
  const state = useFdState();
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);

  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return [];
    const out: Array<{ label: string; sub: string; href: string }> = [];
    state.workOrders.forEach((w) => {
      if ([w.id, w.roomNumber, w.item, w.exactLocation, w.details].some((v) => (v ?? '').toLowerCase().includes(s)))
        out.push({ label: `${w.id} · ${w.item}`, sub: `Work order · ${w.roomNumber ? `Room ${w.roomNumber}` : w.exactLocation}`, href: `${base}/work-orders/${w.id}` });
    });
    state.serviceRequests.forEach((r) => {
      if ([r.id, r.roomNumber, r.overallDetails, ...r.items.map((i) => i.name)].some((v) => (v ?? '').toLowerCase().includes(s)))
        out.push({ label: `${r.id} · ${r.items.map((i) => i.name).join(', ')}`, sub: `Service request · Room ${r.roomNumber ?? '—'}`, href: `${base}/service-requests/${r.id}` });
    });
    state.pulse.forEach((p) => {
      if ([p.eventName, p.mainReason, p.notes].some((v) => (v ?? '').toLowerCase().includes(s)))
        out.push({ label: p.eventName || p.mainReason, sub: 'Hotel pulse', href: `${base}/pulse/${p.id}` });
    });
    state.punches.forEach((pn) => {
      if ([pn.employeeName, pn.employeeId].some((v) => v.toLowerCase().includes(s)) && !out.some((o) => o.sub === 'Punch log'))
        out.push({ label: pn.employeeName, sub: 'Punch log', href: `${base}/punch` });
    });
    return out.slice(0, 8);
  }, [q, state, base]);

  return (
    <div className="relative flex-1 max-w-md hidden md:block">
      <div className="flex items-center gap-2 h-9 px-3 rounded-full" style={{ background: '#f7f7f7', border: '1px solid #eee' }}>
        <Search className="w-4 h-4" style={{ color: '#929292' }} />
        <input value={q} onChange={(e) => { setQ(e.target.value); setOpen(true); }} onFocus={() => setOpen(true)} onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder="Search room, WO, SR, event, employee…" className="flex-1 text-sm outline-none bg-transparent" style={{ color: '#222' }} />
        {q && <button onClick={() => { setQ(''); }}><X className="w-3.5 h-3.5" style={{ color: '#929292' }} /></button>}
      </div>
      {open && q && (
        <div className="absolute left-0 right-0 top-11 z-50 rounded-2xl overflow-hidden shadow-xl max-h-80 overflow-y-auto" style={{ background: '#fff', border: '1px solid #dddddd' }}>
          {results.length === 0 ? <p className="px-4 py-3 text-sm" style={{ color: '#929292' }}>No matches.</p> : results.map((r, i) => (
            <button key={i} onMouseDown={() => router.push(r.href)} className="w-full text-left px-4 py-2.5 hover:bg-[#f7f7f7]" style={{ borderBottom: i < results.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
              <p className="text-sm font-semibold" style={{ color: '#222' }}>{r.label}</p>
              <p className="text-xs" style={{ color: '#929292' }}>{r.sub}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
