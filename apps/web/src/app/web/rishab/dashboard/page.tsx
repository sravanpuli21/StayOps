'use client';

import Link from 'next/link';
import { AlertTriangle, ChevronRight, Users, Bed, Wrench, Clock } from 'lucide-react';
import {
  computeHotelScore,
  getEmployeesForHotel, getActiveTicketsForHotel,
  getPropertyOpsSummary, getHotelAuditSummary,
  formatCurrency, formatPct, formatVariance,
} from '@hos/shared';
import { useRedFlags, useAnomalies } from '@/lib/ai-data';
import { KpiCard } from '@/components/common/KpiCard';
import { HealthBadge } from '@/components/common/HealthBadge';
import { csatTier } from '@/lib/csat';
import { usePropertyScoped } from '@/lib/use-property-scoped';
import { DashboardSkeleton } from '@/components/common/Skeleton';
import { ErrorBanner } from '@/components/common/ErrorBanner';
import { EmptyState } from '@/components/common/EmptyState';

const HOTEL_ID = 'BTRCI';

export default function RishabDashboard() {
  const scoped = usePropertyScoped(HOTEL_ID);
  const hotel = scoped.hotel;
  const rev = scoped.revenue;
  const lab = scoped.labour;
  const dm = scoped.daily;
  const period = scoped.period;

  // Hooks must run unconditionally — call them BEFORE any early returns.
  const allRedFlags = useRedFlags();
  const allAnomalies = useAnomalies();

  if (scoped.error) return (
    <div className="p-6">
      <ErrorBanner error={scoped.error} />
    </div>
  );
  if (scoped.loading) return <DashboardSkeleton kpiCount={4} large />;
  if (!rev || !lab || !dm) {
    return (
      <div className="p-6">
        <EmptyState
          icon="inbox"
          title="No data for Home2 Baton Rouge yet"
          message="Your property dashboard populates when BTRCI's Hilton OnQ exports arrive. Drop today's final-audit CSV manually to verify the pipeline."
          ctaHref="/web/admin/uploads"
          ctaLabel="Upload CSV"
        />
      </div>
    );
  }
  const score = computeHotelScore(HOTEL_ID);
  const employees = getEmployeesForHotel(HOTEL_ID);
  const activeTickets = getActiveTicketsForHotel(HOTEL_ID);
  const opsSummary = getPropertyOpsSummary(HOTEL_ID);
  const auditSummary = getHotelAuditSummary(HOTEL_ID);
  const flags = allRedFlags.filter((f) => f.hotelId === HOTEL_ID);
  const anomalies = allAnomalies.filter((a) => a.hotelId === HOTEL_ID);

  const payrollPct = (lab.payrollCost / rev.totalRevenue) * 100;
  const callouts = employees.filter((e) => e.status === 'callout').length;
  const onShift = employees.filter((e) => e.status === 'active').length;
  const urgentTickets = activeTickets.filter((t) => t.priority === 'urgent').length;
  const roomsReady = opsSummary.readyRooms;

  // Synthetic: arrivals expected today (business logic would derive from DAILY_METRICS)
  const arrivalsExpected = Math.round(hotel.rooms * 0.45);  // ~45% turnover demand
  const roomsShort = Math.max(0, arrivalsExpected - roomsReady);

  // Critical alerts — rendered at top
  const criticalAlerts: Array<{ icon: typeof AlertTriangle; text: string; sub: string; href: string; color: string }> = [];
  if (roomsShort > 0) {
    criticalAlerts.push({
      icon: Bed,
      text: `Only ${roomsReady} ready rooms for ${arrivalsExpected} arrivals`,
      sub: `${roomsShort} short · HK pace check needed before 3 PM`,
      href: '/web/rishab/operations',
      color: '#b91c1c',
    });
  }
  if (payrollPct > 28) {
    criticalAlerts.push({
      icon: AlertTriangle,
      text: `Payroll at ${formatPct(payrollPct, 1)} — above 28% target`,
      sub: `Review scheduling for remainder of pay period`,
      href: '/web/rishab/scheduling',
      color: '#b45309',
    });
  }
  if (urgentTickets > 0) {
    criticalAlerts.push({
      icon: Wrench,
      text: `${urgentTickets} urgent maintenance ticket${urgentTickets > 1 ? 's' : ''} open`,
      sub: 'Blocking guest experience',
      href: '/web/rishab/operations',
      color: '#b91c1c',
    });
  }
  if (callouts > 0) {
    criticalAlerts.push({
      icon: Users,
      text: `${callouts} staff callout${callouts > 1 ? 's' : ''} today`,
      sub: 'Coverage gap — check scheduling',
      href: '/web/rishab/scheduling',
      color: '#b45309',
    });
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-baseline gap-3">
            <h1 className="text-xl font-bold" style={{ color: '#222222' }}>
              Good morning, Rishab 👋
            </h1>
            <HealthBadge health={rev.health} showLabel />
          </div>
          <p className="text-sm mt-0.5" style={{ color: '#929292' }}>
            {hotel.name} · {hotel.city}, {hotel.state} · {period.label}
          </p>
        </div>
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: '#ffffff', border: '1px solid #dddddd' }}>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: '#929292' }}>Composite</p>
            <p className="text-2xl font-bold" style={{ color: score.composite < 65 ? '#b91c1c' : score.composite < 75 ? '#b45309' : '#15803d' }}>
              {score.composite}
            </p>
          </div>
          <div className="w-px h-10" style={{ background: '#dddddd' }} />
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: '#929292' }}>Trend</p>
            <p className="text-sm font-semibold" style={{ color: score.trendDirection === 'up' ? '#15803d' : score.trendDirection === 'down' ? '#b91c1c' : '#6a6a6a' }}>
              {score.trendDirection === 'up' ? '↗' : score.trendDirection === 'down' ? '↘' : '→'} {formatVariance(score.trendDelta)}
            </p>
          </div>
        </div>
      </div>

      {/* Critical alerts strip */}
      {criticalAlerts.length > 0 && (
        <div className="flex flex-col gap-2">
          {criticalAlerts.map((a, i) => (
            <Link
              key={i}
              href={a.href}
              className="flex items-center gap-3 rounded-xl px-4 py-3 transition-colors hover:bg-white"
              style={{ background: '#fffbeb', border: '1px solid #fcd34d' }}
            >
              <a.icon className="w-4 h-4 flex-shrink-0" style={{ color: a.color }} />
              <div className="flex-1">
                <p className="text-sm font-semibold" style={{ color: a.color }}>{a.text}</p>
                <p className="text-xs mt-0.5" style={{ color: '#6a6a6a' }}>{a.sub}</p>
              </div>
              <ChevronRight className="w-4 h-4" style={{ color: a.color }} />
            </Link>
          ))}
        </div>
      )}

      {/* Revenue View */}
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wide mb-3" style={{ color: '#6a6a6a' }}>Revenue</h2>
        <div className="grid grid-cols-4 gap-4">
          <KpiCard label="Occupancy"   value={formatPct(rev.occupancyPct, 1)} subtext={`${dm.roomsSold} of ${hotel.rooms}`} size="large" />
          <KpiCard label="ADR"         value={formatCurrency(rev.adr)} subtext={`${rev.adr >= rev.marketAdr ? '+' : ''}${formatCurrency(rev.adr - rev.marketAdr)} vs market`} size="large" />
          <KpiCard label="RevPAR"      value={formatCurrency(rev.revPar)} subtext="per available room" size="large" />
          <KpiCard label="Revenue"     value={formatCurrency(rev.totalRevenue, true)} subtext="yesterday" size="large" />
        </div>
      </div>

      {/* Cost View */}
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wide mb-3" style={{ color: '#6a6a6a' }}>Costs</h2>
        <div className="grid grid-cols-4 gap-4">
          <KpiCard label="Payroll %"   value={formatPct(payrollPct, 1)} subtext="of revenue" alert={payrollPct > 28} size="medium" />
          <KpiCard label="Overtime"    value={`${lab.overtimeHours} hrs`} subtext="this pay period" alert={lab.overtimeHours > 15} size="medium" />
          <KpiCard label="Hours Var"   value={formatVariance(lab.variance) + ' hrs'} subtext={`${lab.scheduledHours} sched · ${lab.clockedHours} clocked`} trend={lab.variance > 0 ? 'down' : 'up'} size="medium" />
          <KpiCard label="Total Payroll" value={formatCurrency(lab.payrollCost, true)} subtext="bi-weekly" size="medium" />
        </div>
      </div>

      {/* Operations View */}
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wide mb-3" style={{ color: '#6a6a6a' }}>Operations — Today</h2>
        <div className="grid grid-cols-4 gap-4">
          <KpiCard
            label="Rooms Ready vs Arrivals"
            value={`${roomsReady} / ${arrivalsExpected}`}
            subtext={roomsShort > 0 ? `${roomsShort} short · HK pace check` : 'On pace'}
            alert={roomsShort > 0}
            size="medium"
          />
          <KpiCard label="Rooms OOO"    value={dm.roomsOoo.toString()} subtext={`${opsSummary.blockedRooms} blocked`} alert={dm.roomsOoo > 1} size="medium" />
          <KpiCard label="Open Tickets" value={opsSummary.openTickets.toString()} subtext={`${urgentTickets} urgent`} alert={urgentTickets > 0} size="medium" />
          <KpiCard label="Audit Pass"   value={`${auditSummary.compliancePct}%`} subtext={`${auditSummary.overdueRooms} overdue`} alert={auditSummary.compliancePct < 80} size="medium" />
        </div>
      </div>

      {/* People */}
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wide mb-3" style={{ color: '#6a6a6a' }}>People</h2>
        <div className="grid grid-cols-4 gap-4">
          <KpiCard label="On shift today" value={onShift.toString()} subtext={`${employees.length} total staff`} size="medium" />
          <KpiCard label="Callouts"       value={callouts.toString()} subtext="covering now" alert={callouts > 0} size="medium" />
          {(() => {
            const t = csatTier(dm.avgCustomerRating);
            return (
              <KpiCard
                label="Customer Satisfaction"
                value={`${dm.avgCustomerRating.toFixed(1)} / 5.0`}
                subtext={`${t.label} · guest score`}
                alert={t.alert}
                size="medium"
              />
            );
          })()}
          <KpiCard label="Response time"  value="42m" subtext="avg ticket response" size="medium" />
        </div>
      </div>

      {/* Quick drill-downs */}
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wide mb-3" style={{ color: '#6a6a6a' }}>Jump into</h2>
        <div className="grid grid-cols-4 gap-3">
          <Link href="/web/rishab/scheduling" className="flex items-center gap-3 bg-white rounded-xl p-4 transition-colors hover:border-[#ff385c]" style={{ border: '1px solid #dddddd' }}>
            <Clock className="w-5 h-5" style={{ color: '#ff385c' }} />
            <div className="flex-1">
              <p className="text-sm font-semibold" style={{ color: '#222' }}>Scheduling</p>
              <p className="text-xs" style={{ color: '#6a6a6a' }}>Build next week</p>
            </div>
            <ChevronRight className="w-4 h-4" style={{ color: '#c1c1c1' }} />
          </Link>
          <Link href="/web/rishab/operations" className="flex items-center gap-3 bg-white rounded-xl p-4 transition-colors hover:border-[#ff385c]" style={{ border: '1px solid #dddddd' }}>
            <Wrench className="w-5 h-5" style={{ color: '#ff385c' }} />
            <div className="flex-1">
              <p className="text-sm font-semibold" style={{ color: '#222' }}>Operations</p>
              <p className="text-xs" style={{ color: '#6a6a6a' }}>Rooms · tickets</p>
            </div>
            <ChevronRight className="w-4 h-4" style={{ color: '#c1c1c1' }} />
          </Link>
          <Link href="/web/rishab/audits" className="flex items-center gap-3 bg-white rounded-xl p-4 transition-colors hover:border-[#ff385c]" style={{ border: '1px solid #dddddd' }}>
            <Bed className="w-5 h-5" style={{ color: '#ff385c' }} />
            <div className="flex-1">
              <p className="text-sm font-semibold" style={{ color: '#222' }}>Audits</p>
              <p className="text-xs" style={{ color: '#6a6a6a' }}>{auditSummary.overdueRooms} overdue</p>
            </div>
            <ChevronRight className="w-4 h-4" style={{ color: '#c1c1c1' }} />
          </Link>
          <Link href="/web/rishab/alerts" className="flex items-center gap-3 bg-white rounded-xl p-4 transition-colors hover:border-[#ff385c]" style={{ border: '1px solid #dddddd' }}>
            <AlertTriangle className="w-5 h-5" style={{ color: '#ff385c' }} />
            <div className="flex-1">
              <p className="text-sm font-semibold" style={{ color: '#222' }}>Alerts</p>
              <p className="text-xs" style={{ color: '#6a6a6a' }}>{flags.length + anomalies.length} open</p>
            </div>
            <ChevronRight className="w-4 h-4" style={{ color: '#c1c1c1' }} />
          </Link>
        </div>
      </div>
    </div>
  );
}
