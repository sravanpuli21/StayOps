'use client';

import Link from 'next/link';
import { Wrench, ConciergeBell, Clock, TrendingUp, ClipboardList, BellRing, ArrowRight } from 'lucide-react';
import { useFdState } from '../_store';
import { fdCard, timeAgo } from '../_ui';

interface Props { hotelCode: string }

export function HomeClient({ hotelCode }: Props) {
  const state = useFdState();
  const base = `/web/front-desk/${hotelCode}`;
  const openWo = state.workOrders.filter((w) => w.status !== 'Completed' && w.status !== 'Cancelled').length;
  const openSr = state.serviceRequests.filter((r) => r.status !== 'Completed' && r.status !== 'Cancelled' && r.status !== 'Delivered').length;

  return (
    <div className="flex flex-col gap-7 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: '#222' }}>Front Desk</h1>
        <p className="text-sm mt-1" style={{ color: '#929292' }}>What do you need to do?</p>
      </div>

      {/* Primary action cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ActionCard href={`${base}/work-orders/new`} icon={<Wrench className="w-7 h-7" style={{ color: '#ff385c' }} />} accent="#ff385c" title="Create Work Order" desc="Maintenance, engineering, damage, broken item, room issue" />
        <ActionCard href={`${base}/service-requests/new`} icon={<ConciergeBell className="w-7 h-7" style={{ color: '#0ea5e9' }} />} accent="#0ea5e9" title="Create Service Request" desc="Towels, soap, water, coffee, bedding, housekeeping request" />
        <ActionCard href={`${base}/punch`} icon={<Clock className="w-7 h-7" style={{ color: '#15803d' }} />} accent="#15803d" title="Punch In / Punch Out" desc="Employee time clock" />
        <ActionCard href={`${base}/pulse/new`} icon={<TrendingUp className="w-7 h-7" style={{ color: '#7c3aed' }} />} accent="#7c3aed" title="Log What's Happening Today" desc="Events, high occupancy reason, guest source, future sales opportunity" />
      </div>

      {/* Open counts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <CountCard href={`${base}/work-orders`} icon={<ClipboardList className="w-6 h-6" style={{ color: '#ff385c' }} />} label="Open Work Orders" count={openWo} accent="#ff385c" />
        <CountCard href={`${base}/service-requests`} icon={<BellRing className="w-6 h-6" style={{ color: '#0ea5e9' }} />} label="Open Service Requests" count={openSr} accent="#0ea5e9" />
      </div>

      {/* Recent activity */}
      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-bold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>Recent activity on this computer</h2>
        <div className="rounded-2xl overflow-hidden" style={fdCard}>
          {state.activity.slice(0, 10).map((a, i, arr) => {
            const inner = (
              <>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded uppercase flex-shrink-0" style={{ background: '#f7f7f7', color: '#6a6a6a' }}>{a.kind}</span>
                <span className="text-sm flex-1" style={{ color: '#222' }}>{a.label}</span>
                <span className="text-xs flex-shrink-0" style={{ color: '#b0b0b0' }}>{timeAgo(a.ts)}</span>
              </>
            );
            const cls = 'flex items-center gap-3 px-4 py-3';
            const style = { borderBottom: i < arr.length - 1 ? '1px solid #f0f0f0' : 'none' };
            return a.href
              ? <Link key={a.id} href={`${base}/${a.href}`} className={cls + ' hover:bg-[#fafafa]'} style={style}>{inner}</Link>
              : <div key={a.id} className={cls} style={style}>{inner}</div>;
          })}
          {state.activity.length === 0 && <p className="px-4 py-6 text-sm" style={{ color: '#929292' }}>Nothing logged yet on this computer.</p>}
        </div>
      </div>
    </div>
  );
}

function ActionCard({ href, icon, title, desc, accent }: { href: string; icon: React.ReactNode; title: string; desc: string; accent: string }) {
  return (
    <Link href={href} className="rounded-2xl p-6 flex flex-col gap-3 transition-all hover:shadow-md hover:-translate-y-0.5" style={fdCard}>
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: '#fafafa', borderLeft: `3px solid ${accent}` }}>{icon}</div>
      <p className="text-lg font-bold" style={{ color: '#222' }}>{title}</p>
      <p className="text-sm" style={{ color: '#6a6a6a' }}>{desc}</p>
    </Link>
  );
}

function CountCard({ href, icon, label, count, accent }: { href: string; icon: React.ReactNode; label: string; count: number; accent: string }) {
  return (
    <Link href={href} className="rounded-2xl p-5 flex items-center gap-4 transition-all hover:shadow-md" style={fdCard}>
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: '#fafafa' }}>{icon}</div>
      <div className="flex-1"><p className="text-3xl font-bold leading-none" style={{ color: accent }}>{count}</p><p className="text-sm mt-1" style={{ color: '#6a6a6a' }}>{label}</p></div>
      <ArrowRight className="w-5 h-5" style={{ color: '#cfcfcf' }} />
    </Link>
  );
}
