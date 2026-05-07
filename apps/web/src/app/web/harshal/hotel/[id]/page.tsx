import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ChevronRight, User, MapPin, Building2 } from 'lucide-react';
import {
  HOTELS, REVENUE_DATA, LABOUR_DATA, DAILY_METRICS,
  GM_ROSTER, REGIONAL_ROSTER, RED_FLAGS, AI_ANOMALIES,
  getActiveTicketsForHotel, getPropertyOpsSummary, getHotelAuditSummary, computeHotelScore,
  formatCurrency, formatPct, formatVariance,
} from '@hos/shared';
import { KpiCard } from '@/components/common/KpiCard';
import { HealthBadge } from '@/components/common/HealthBadge';
import { RedFlagsPanel } from '@/components/common/RedFlagsPanel';
import { AIFlagsPanel } from '@/components/common/AIFlagsPanel';

const HARSHAL = REGIONAL_ROSTER.find((r) => r.id === 'harshal')!;

interface Props {
  params: Promise<{ id: string }>;
}

export default async function HotelDetailPage({ params }: Props) {
  const { id } = await params;
  const hotel = HOTELS.find((h) => h.id === id);
  if (!hotel) notFound();

  // Access control: only if hotel is in Harshal's territory
  const inTerritory = HARSHAL.hotelIds.includes(hotel.id);
  if (!inTerritory) notFound();

  const rev = REVENUE_DATA.find((r) => r.hotelId === hotel.id)!;
  const lab = LABOUR_DATA.find((l) => l.hotelId === hotel.id)!;
  const dm = DAILY_METRICS.find((d) => d.hotelId === hotel.id)!;
  const gm = GM_ROSTER.find((g) => g.hotelId === hotel.id);
  const score = computeHotelScore(hotel.id);
  const opsSummary = getPropertyOpsSummary(hotel.id);
  const auditSummary = getHotelAuditSummary(hotel.id);
  const activeTickets = getActiveTicketsForHotel(hotel.id);
  const hotelFlags = RED_FLAGS.filter((f) => f.hotelId === hotel.id);
  const hotelAnomalies = AI_ANOMALIES.filter((a) => a.hotelId === hotel.id);
  const payrollPct = (lab.payrollCost / rev.totalRevenue) * 100;

  const priorityColor: Record<string, string> = {
    urgent: '#dc2626',
    high:   '#d97706',
    normal: '#2563eb',
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm" style={{ color: '#6a6a6a' }}>
        <Link href="/web/harshal/dashboard" className="hover:underline flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" />
          Dashboard
        </Link>
        <ChevronRight className="w-3 h-3" style={{ color: '#c1c1c1' }} />
        <span style={{ color: '#222' }}>{hotel.shortName}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-baseline gap-3 mb-1">
            <h1 className="text-2xl font-bold" style={{ color: '#222' }}>{hotel.name}</h1>
            <HealthBadge health={rev.health} showLabel />
          </div>
          <div className="flex items-center gap-4 text-sm" style={{ color: '#6a6a6a' }}>
            <span className="flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5" />
              {hotel.brand}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {hotel.city}, {hotel.state}
            </span>
            <span>ID: {hotel.id}</span>
            <span>·</span>
            <span>{hotel.rooms} rooms</span>
          </div>
        </div>
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-xl"
          style={{ background: '#ffffff', border: '1px solid #dddddd' }}
        >
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

      {/* KPI row */}
      <div className="grid grid-cols-4 gap-4">
        <KpiCard label="Occupancy"    value={formatPct(rev.occupancyPct, 0)} subtext={`${dm.roomsSold} of ${hotel.rooms} sold`} size="large" />
        <KpiCard label="Revenue"       value={formatCurrency(rev.totalRevenue, true)} subtext={`RevPAR ${formatCurrency(rev.revPar)}`} size="large" />
        <KpiCard label="ADR vs Market" value={formatCurrency(rev.adr)} subtext={`Market ${formatCurrency(rev.marketAdr)} (${rev.adr >= rev.marketAdr ? '+' : ''}${formatCurrency(rev.adr - rev.marketAdr)})`} size="large" />
        <KpiCard label="OOO Rooms"     value={dm.roomsOoo.toString()} subtext={`${formatPct((dm.roomsOoo / hotel.rooms) * 100, 1)} of inventory`} alert={dm.roomsOoo > 0} size="large" />
      </div>

      <div className="grid grid-cols-4 gap-4">
        <KpiCard label="Payroll %"    value={formatPct(payrollPct, 1)} subtext={formatCurrency(lab.payrollCost, true) + ' total'} alert={payrollPct > 28} size="medium" />
        <KpiCard label="Hours Var"    value={formatVariance(lab.variance) + ' hrs'} subtext={`${lab.scheduledHours.toLocaleString()} sched · ${lab.clockedHours.toLocaleString()} clocked`} trend={lab.variance > 0 ? 'down' : 'up'} alert={lab.variance > 25} size="medium" />
        <KpiCard label="Overtime"     value={lab.overtimeHours.toString() + ' hrs'} subtext="this pay period" alert={lab.overtimeHours > 15} size="medium" />
        <KpiCard label="Audit Pass"   value={`${auditSummary.compliancePct}%`} subtext={`${auditSummary.currentRooms} of ${auditSummary.totalRooms} rooms current`} alert={auditSummary.compliancePct < 80} size="medium" />
      </div>

      {/* GM card + action */}
      {gm && (
        <Link
          href={`/web/harshal/gm/${hotel.id}`}
          className="flex items-center gap-4 bg-white rounded-2xl p-5 hover:border-[#ff385c] transition-colors"
          style={{ border: '1px solid #dddddd' }}
        >
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: '#f7f7f7', color: '#222', fontSize: 16, fontWeight: 700 }}
          >
            {gm.initials}
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: '#929292' }}>General Manager</p>
            <p className="text-base font-semibold" style={{ color: '#222' }}>{gm.name}</p>
            <p className="text-xs mt-0.5" style={{ color: '#6a6a6a' }}>Reports to Harshal · click for accountability view</p>
          </div>
          <User className="w-4 h-4" style={{ color: '#6a6a6a' }} />
          <ChevronRight className="w-4 h-4" style={{ color: '#c1c1c1' }} />
        </Link>
      )}

      {/* Labour breakdown by department */}
      {lab.departments && lab.departments.length > 0 && (
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wide mb-3" style={{ color: '#6a6a6a' }}>
            Labour Breakdown — by Department
          </h2>
          <div
            className="overflow-x-auto rounded-2xl"
            style={{ border: '1px solid #dddddd', background: '#ffffff' }}
          >
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr style={{ borderBottom: '1px solid #dddddd', background: '#f7f7f7' }}>
                  {['Department', 'Sched', 'Clocked', 'Variance', 'OT hrs'].map((h) => (
                    <th
                      key={h}
                      className="text-xs font-semibold uppercase tracking-wide py-3 px-4 whitespace-nowrap"
                      style={{ color: '#6a6a6a', textAlign: h === 'Department' ? 'left' : 'right' }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {lab.departments.map((d, i) => (
                  <tr
                    key={d.department}
                    style={{ borderBottom: i < lab.departments.length - 1 ? '1px solid #f0f0f0' : 'none' }}
                  >
                    <td className="py-3 px-4 font-medium text-sm" style={{ color: '#222' }}>{d.department}</td>
                    <td className="py-3 px-4 text-right text-sm" style={{ color: '#3f3f3f' }}>{d.scheduledHours}</td>
                    <td className="py-3 px-4 text-right text-sm" style={{ color: '#3f3f3f' }}>{d.clockedHours}</td>
                    <td className="py-3 px-4 text-right text-sm font-semibold" style={{ color: d.variance > 0 ? '#b91c1c' : '#15803d' }}>
                      {formatVariance(d.variance)}
                    </td>
                    <td className="py-3 px-4 text-right text-sm" style={{ color: d.overtimeHours > 5 ? '#b91c1c' : '#3f3f3f' }}>
                      {d.overtimeHours}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Active tickets */}
      {activeTickets.length > 0 && (
        <div>
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="text-sm font-bold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>
              Active Tickets ({activeTickets.length})
            </h2>
            <Link href="/web/harshal/operations" className="text-xs font-semibold" style={{ color: '#ff385c' }}>
              View all →
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            {activeTickets.slice(0, 5).map((t) => (
              <Link
                key={t.id}
                href="/web/harshal/operations"
                className="flex items-start gap-3 bg-white rounded-xl p-4 hover:border-[#ff385c] transition-colors"
                style={{ border: '1px solid #dddddd' }}
              >
                <div
                  className="w-1 self-stretch rounded-full"
                  style={{ background: priorityColor[t.priority] ?? '#6a6a6a' }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-xs font-bold" style={{ color: '#929292' }}>{t.id}</span>
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide"
                      style={{ color: priorityColor[t.priority] ?? '#6a6a6a', background: (priorityColor[t.priority] ?? '#6a6a6a') + '18' }}
                    >
                      {t.priority}
                    </span>
                    <span
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                      style={{ color: '#6a6a6a', background: '#f0f0f0' }}
                    >
                      {t.type}
                    </span>
                  </div>
                  <p className="text-sm font-medium" style={{ color: '#222' }}>{t.title}</p>
                  <p className="text-xs mt-1" style={{ color: '#6a6a6a' }}>Room {t.roomNumber} · {t.status.replace('_', ' ')}</p>
                </div>
                <ChevronRight className="w-4 h-4 flex-shrink-0 mt-1" style={{ color: '#c1c1c1' }} />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Audit compliance strip */}
      <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid #dddddd' }}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>Audit Compliance</h3>
            <p className="text-xs mt-0.5" style={{ color: '#929292' }}>
              {auditSummary.overdueRooms} overdue · {auditSummary.dueSoonRooms} due soon · {auditSummary.currentRooms} current
            </p>
          </div>
          <Link href="/web/harshal/audits" className="text-xs font-semibold" style={{ color: '#ff385c' }}>
            View audits →
          </Link>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ background: '#ebebeb' }}>
          <div
            className="h-full rounded-full"
            style={{
              width: `${auditSummary.compliancePct}%`,
              background: auditSummary.compliancePct >= 80 ? '#22c55e' : auditSummary.compliancePct >= 65 ? '#f59e0b' : '#ef4444',
            }}
          />
        </div>
      </div>

      {/* Ops summary */}
      <div className="grid grid-cols-4 gap-4">
        <KpiCard label="Ready rooms"    value={opsSummary.readyRooms.toString()} subtext="ready to sell" size="medium" />
        <KpiCard label="Dirty / Inspect" value={(opsSummary.dirtyRooms + opsSummary.inspectingRooms).toString()} subtext="awaiting turnover" size="medium" />
        <KpiCard label="Blocked"        value={opsSummary.blockedRooms.toString()} subtext="held for VIP/maintenance" size="medium" />
        <KpiCard label="Urgent tickets" value={opsSummary.urgentTickets.toString()} subtext="priority = urgent" alert={opsSummary.urgentTickets > 0} size="medium" />
      </div>

      {/* AI findings */}
      {hotelAnomalies.length > 0 && (
        <AIFlagsPanel findings={hotelAnomalies} title="AI Findings at this hotel" />
      )}

      {/* Red flags */}
      {hotelFlags.length > 0 && (
        <RedFlagsPanel flags={hotelFlags} title="Red Flags" />
      )}
    </div>
  );
}
