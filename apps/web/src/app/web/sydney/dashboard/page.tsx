'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import {
  Wrench, AlertTriangle, Calendar, CheckCircle2, ClipboardList, Package,
  Bed, ChevronRight, Clock, Users,
} from 'lucide-react';
import { KpiCard } from '@/components/common/KpiCard';
import {
  SYDNEY_HOTEL, useMaintenanceStaff, useHotelTickets, useHotelAudits,
  useHotelRooms, useOpsSummary, useAssetSummary,
  TICKET_TYPE_META, PRIORITY_META,
} from '@/lib/sydney-data';

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const d = Math.floor(diff / 86400000);
  if (d >= 1) return `${d}d ago`;
  const h = Math.floor(diff / 3600000);
  if (h >= 1) return `${h}h ago`;
  return `${Math.floor(diff / 60000)}m ago`;
}

export default function SydneyDashboard() {
  const hotel = SYDNEY_HOTEL;
  const tickets = useHotelTickets();
  const audits = useHotelAudits();
  const rooms = useHotelRooms();
  const ops = useOpsSummary();
  const assetSummary = useAssetSummary();
  const maintStaff = useMaintenanceStaff();

  const openTickets = tickets.filter((t) => t.status !== 'resolved');
  const urgentTickets = openTickets.filter((t) => t.priority === 'urgent');
  const reactive = openTickets.filter((t) => t.type === 'reactive');
  const preventive = openTickets.filter((t) => t.type === 'preventive');
  const escalated = openTickets.filter((t) => t.type === 'escalation' || t.status === 'escalated');

  // Audits coming due / overdue — use scheduledDate as the due indicator
  const auditsOverdue = audits.filter((a) => {
    if (a.status === 'failed') return true;
    if (a.status === 'passed' || !a.scheduledDate) return false;
    return new Date(a.scheduledDate) < new Date();
  });
  const auditsDueSoon = audits.filter((a) => {
    if (a.status === 'passed' || a.status === 'failed' || !a.scheduledDate) return false;
    const due = new Date(a.scheduledDate).getTime();
    return due - Date.now() < 1000 * 60 * 60 * 24 * 7 && due >= Date.now();
  });

  const roomsWithTickets = rooms.filter((r) => r.hasOpenTicket).length;
  const roomsOoo = rooms.filter((r) => r.status === 'ooo').length;

  // Top 4 for the urgent queue
  const topUrgent = [...urgentTickets, ...escalated]
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    .slice(0, 4);

  // Today's preventive schedule — sort by most recent
  const todaysPreventive = preventive.slice(0, 5);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold" style={{ color: '#222222' }}>
          Good morning, Sydney
        </h1>
        <p className="text-sm mt-0.5" style={{ color: '#929292' }}>
          {hotel.shortName} · {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })} · Maintenance & Engineering
        </p>
      </div>

      {/* Morning briefing KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <KpiCard
          label="Open tickets"
          value={openTickets.length.toString()}
          subtext={urgentTickets.length > 0 ? `${urgentTickets.length} urgent` : 'all priorities'}
          alert={urgentTickets.length > 0}
          size="medium"
        />
        <KpiCard
          label="Preventive due"
          value={preventive.length.toString()}
          subtext="this period"
          size="medium"
        />
        <KpiCard
          label="Rooms OOO"
          value={roomsOoo.toString()}
          subtext={`${roomsWithTickets} with active tickets`}
          alert={roomsOoo > 2}
          size="medium"
        />
        <KpiCard
          label="Audits overdue"
          value={auditsOverdue.length.toString()}
          subtext={`${auditsDueSoon.length} due within 7 days`}
          alert={auditsOverdue.length > 0}
          size="medium"
        />
        <KpiCard
          label="Failing assets"
          value={assetSummary ? `${assetSummary.failingAssets}` : '—'}
          subtext={assetSummary ? `${assetSummary.agingAssets} aging · ${assetSummary.totalAssets} total` : 'tracking'}
          alert={(assetSummary?.failingAssets ?? 0) > 2}
          size="medium"
        />
      </div>

      {/* Urgent queue */}
      {topUrgent.length > 0 && (
        <div className="rounded-2xl p-5" style={{ background: '#fef2f2', border: '1px solid #fca5a5' }}>
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4" style={{ color: '#b91c1c' }} />
            <p className="text-sm font-semibold" style={{ color: '#b91c1c' }}>
              Needs attention now · {topUrgent.length}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {topUrgent.map((t) => {
              const typeMeta = TICKET_TYPE_META[t.type as keyof typeof TICKET_TYPE_META];
              return (
                <div
                  key={t.id}
                  className="rounded-lg px-3 py-2.5"
                  style={{ background: '#ffffff', border: '1px solid #fecaca' }}
                >
                  <div className="flex items-baseline gap-2 flex-wrap mb-1">
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full" style={{ background: typeMeta.bg, color: typeMeta.color }}>
                      {typeMeta.icon} {typeMeta.label}
                    </span>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full" style={{ background: '#fef2f2', color: '#b91c1c' }}>
                      URGENT
                    </span>
                    {t.roomNumber && (
                      <span className="text-xs font-semibold" style={{ color: '#222' }}>Room {t.roomNumber}</span>
                    )}
                  </div>
                  <p className="text-sm font-semibold" style={{ color: '#222' }}>{t.title}</p>
                  <div className="flex items-center gap-3 mt-1 text-[11px]" style={{ color: '#6a6a6a' }}>
                    {t.assignedTo && <span>→ {t.assignedTo}</span>}
                    <span className="inline-flex items-center gap-0.5"><Clock className="w-3 h-3" /> {timeAgo(t.createdAt)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Two-column: today's preventive + staff on shift */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Today's preventive */}
        <div className="lg:col-span-2 rounded-2xl p-5" style={{ background: '#ffffff', border: '1px solid #dddddd' }}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>
                Today's preventive schedule
              </h2>
              <p className="text-xs mt-0.5" style={{ color: '#929292' }}>
                Scheduled tasks · PPM rotation
              </p>
            </div>
            <Link
              href="/web/sydney/preventive"
              className="inline-flex items-center gap-1 text-xs font-semibold"
              style={{ color: '#ff385c' }}
            >
              View calendar <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          {todaysPreventive.length === 0 ? (
            <div className="text-center py-6">
              <CheckCircle2 className="w-6 h-6 mx-auto mb-2" style={{ color: '#16a34a' }} />
              <p className="text-xs font-semibold" style={{ color: '#15803d' }}>No preventive tasks scheduled today</p>
            </div>
          ) : (
            <ul className="flex flex-col gap-2">
              {todaysPreventive.map((t) => {
                const pmeta = PRIORITY_META[t.priority as keyof typeof PRIORITY_META];
                return (
                  <li
                    key={t.id}
                    className="rounded-lg px-3 py-2 flex items-center gap-3"
                    style={{ background: '#eff6ff', border: '1px solid #bfdbfe' }}
                  >
                    <Calendar className="w-4 h-4 flex-shrink-0" style={{ color: '#1d4ed8' }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold" style={{ color: '#1e3a8a' }}>
                        {t.title} {t.roomNumber && <span className="font-normal">· Room {t.roomNumber}</span>}
                      </p>
                      <p className="text-[11px]" style={{ color: '#1e40af' }}>
                        {t.assignedTo ? `→ ${t.assignedTo}` : 'unassigned'} · {timeAgo(t.createdAt)}
                      </p>
                    </div>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full" style={{ background: pmeta.bg, color: pmeta.color }}>
                      {pmeta.label}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Staff on shift */}
        <div className="rounded-2xl p-5" style={{ background: '#ffffff', border: '1px solid #dddddd' }}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>
              Maint team today
            </h2>
          </div>
          {maintStaff.length === 0 ? (
            <p className="text-xs italic" style={{ color: '#929292' }}>No maintenance staff active</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {maintStaff.map((emp) => (
                <li
                  key={emp.id}
                  className="flex items-center gap-2 rounded-lg px-2 py-2"
                  style={{ background: '#fafafa', border: '1px solid #f0f0f0' }}
                >
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: '#7c3aed', color: '#ffffff' }}>
                    {emp.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: '#222' }}>{emp.name}</p>
                    <p className="text-[11px] truncate" style={{ color: '#929292' }}>{emp.role}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-3 pt-3 text-[11px]" style={{ color: '#929292', borderTop: '1px solid #f0f0f0' }}>
            <p className="font-semibold" style={{ color: '#6a6a6a' }}>Sydney's shift: 8:30a – 4:30p</p>
            <p className="mt-0.5">Handover to Amir at 4 pm for night coverage.</p>
          </div>
        </div>
      </div>

      {/* Ticket type breakdown */}
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wide mb-3" style={{ color: '#6a6a6a' }}>
          Queue by type
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {(['reactive', 'preventive', 'audit', 'escalation'] as const).map((type) => {
            const meta = TICKET_TYPE_META[type];
            const count = openTickets.filter((t) => t.type === type || (type === 'escalation' && t.status === 'escalated')).length;
            return (
              <Link
                key={type}
                href={`/web/sydney/tickets?type=${type}`}
                className="rounded-2xl p-4 transition-all hover:shadow-md"
                style={{ background: meta.bg, border: `1px solid ${meta.border}` }}
              >
                <div className="flex items-baseline justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: meta.color }}>
                      {meta.icon} {meta.label}
                    </p>
                    <p className="text-2xl font-bold mt-1" style={{ color: meta.color }}>{count}</p>
                  </div>
                  <ChevronRight className="w-4 h-4" style={{ color: meta.color, opacity: 0.5 }} />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Jump into */}
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wide mb-3" style={{ color: '#6a6a6a' }}>Jump into</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <JumpCard href="/web/sydney/tickets"    icon={<Wrench className="w-5 h-5" style={{ color: '#ff385c' }} />}         label="Tickets"     hint={`${openTickets.length} open`} />
          <JumpCard href="/web/sydney/preventive" icon={<CalendarCheck />}                                                     label="Preventive"  hint={`${preventive.length} active`} />
          <JumpCard href="/web/sydney/rooms"      icon={<Bed className="w-5 h-5" style={{ color: '#ff385c' }} />}              label="Rooms"       hint={`${roomsWithTickets} with tickets`} />
          <JumpCard href="/web/sydney/assets"     icon={<Package className="w-5 h-5" style={{ color: '#ff385c' }} />}          label="Assets"      hint="systems + vendors" />
        </div>
      </div>
    </div>
  );
}

function CalendarCheck() {
  return <Calendar className="w-5 h-5" style={{ color: '#ff385c' }} />;
}

function JumpCard({ href, icon, label, hint }: { href: string; icon: React.ReactNode; label: string; hint: string }) {
  return (
    <Link href={href} className="flex items-center gap-3 bg-white rounded-xl p-4 transition-colors hover:border-[#ff385c]" style={{ border: '1px solid #dddddd' }}>
      {icon}
      <div className="flex-1">
        <p className="text-sm font-semibold" style={{ color: '#222' }}>{label}</p>
        <p className="text-xs" style={{ color: '#6a6a6a' }}>{hint}</p>
      </div>
      <ChevronRight className="w-4 h-4" style={{ color: '#c1c1c1' }} />
    </Link>
  );
}
