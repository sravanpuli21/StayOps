import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ChevronRight, MapPin, Building2, User } from 'lucide-react';
import {
  HOTELS, REVENUE_DATA, LABOUR_DATA, DAILY_METRICS, GM_ROSTER, RED_FLAGS, AI_ANOMALIES,
  getActiveTicketsForHotel, getPropertyOpsSummary, getHotelAuditSummary, getOooRoomsForHotel,
  computeHotelScore, formatCurrency, formatPct, formatVariance,
} from '@hos/shared';
import { MdKpi, MdHealth } from '../../dashboard/_kit';
import { TicketsCard } from './_TicketsCard';

/**
 * Kris's (Managing Director) hotel detail — PORTFOLIO scope, so every one of the
 * 16 hotels opens here. Self-contained: no shared persona pages, uses only Kris's
 * own dashboard kit + shared data helpers. (Distinct from Harshal's territory-
 * gated /web/harshal/hotel/[id].)
 */
interface Props { params: Promise<{ id: string }> }

export default async function KrisHotelDetailPage({ params }: Props) {
  const { id } = await params;
  const hotel = HOTELS.find((h) => h.id === id);
  if (!hotel) notFound();

  const rev = REVENUE_DATA.find((r) => r.hotelId === hotel.id);
  const lab = LABOUR_DATA.find((l) => l.hotelId === hotel.id);
  const dm = DAILY_METRICS.find((d) => d.hotelId === hotel.id);
  const gm = GM_ROSTER.find((g) => g.hotelId === hotel.id);
  const score = computeHotelScore(hotel.id);
  const ops = getPropertyOpsSummary(hotel.id);
  const audit = getHotelAuditSummary(hotel.id);
  const tickets = getActiveTicketsForHotel(hotel.id);
  const flags = RED_FLAGS.filter((f) => f.hotelId === hotel.id);
  const anomalies = AI_ANOMALIES.filter((a) => a.hotelId === hotel.id);
  const oooCount = getOooRoomsForHotel(hotel.id).length;
  const payrollPct = rev && lab && rev.totalRevenue > 0 ? (lab.payrollCost / rev.totalRevenue) * 100 : 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm" style={{ color: '#6a6a6a' }}>
        <Link href="/web/kris/dashboard" className="hover:underline flex items-center gap-1"><ArrowLeft className="w-3.5 h-3.5" /> Dashboard</Link>
        <ChevronRight className="w-3 h-3" style={{ color: '#c1c1c1' }} />
        <span style={{ color: '#222' }}>{hotel.shortName}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-baseline gap-3 mb-1">
            <h1 className="text-2xl font-bold" style={{ color: '#222' }}>{hotel.name}</h1>
            {rev && <MdHealth health={rev.health} />}
          </div>
          <div className="flex items-center gap-4 text-sm flex-wrap" style={{ color: '#6a6a6a' }}>
            <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5" />{hotel.brand}</span>
            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{hotel.city}, {hotel.state}</span>
            <span>ID: {hotel.id}</span><span>·</span><span>{hotel.rooms} rooms</span>
          </div>
        </div>
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: '#fff', border: '1px solid #dddddd' }}>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: '#929292' }}>Composite</p>
            <p className="text-2xl font-bold" style={{ color: score.composite < 65 ? '#b91c1c' : score.composite < 75 ? '#b45309' : '#15803d' }}>{score.composite}</p>
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
      {rev && dm && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MdKpi size="large" label="Occupancy" value={formatPct(rev.occupancyPct, 0)} subtext={`${dm.roomsSold} of ${hotel.rooms} sold`} />
          <MdKpi size="large" label="Revenue" value={formatCurrency(rev.totalRevenue, true)} subtext={`RevPAR ${formatCurrency(rev.revPar)}`} />
          <MdKpi size="large" label="ADR vs Market" value={formatCurrency(rev.adr)} subtext={`Market ${formatCurrency(rev.marketAdr)} (${rev.adr >= rev.marketAdr ? '+' : ''}${formatCurrency(rev.adr - rev.marketAdr)})`} />
          <MdKpi size="large" label="OOO Rooms" value={oooCount.toString()} subtext={`${formatPct((oooCount / hotel.rooms) * 100, 1)} of inventory`} alert={oooCount > 0} />
        </div>
      )}

      {lab && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MdKpi label="Payroll %" value={formatPct(payrollPct, 1)} subtext={formatCurrency(lab.payrollCost, true) + ' total'} alert={payrollPct > 28} />
          <MdKpi label="Hours Var" value={formatVariance(lab.variance) + ' hrs'} subtext={`${lab.scheduledHours.toLocaleString()} sched · ${lab.clockedHours.toLocaleString()} clocked`} trend={lab.variance > 0 ? 'down' : 'up'} alert={lab.variance > 25} />
          <MdKpi label="Overtime" value={lab.overtimeHours.toString() + ' hrs'} subtext="this pay period" alert={lab.overtimeHours > 15} />
          <MdKpi label="Audit Pass" value={`${audit.compliancePct}%`} subtext={`${audit.currentRooms} of ${audit.totalRooms} rooms current`} alert={audit.compliancePct < 80} />
        </div>
      )}

      {/* GM card */}
      {gm && (
        <Link href="/web/kris/leaders" className="flex items-center gap-4 bg-white rounded-2xl p-5 hover:border-[#ff385c] transition-colors" style={{ border: '1px solid #dddddd' }}>
          <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: '#f7f7f7', color: '#222', fontSize: 16, fontWeight: 700 }}>{gm.initials}</div>
          <div className="flex-1">
            <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: '#929292' }}>General Manager</p>
            <p className="text-base font-semibold" style={{ color: '#222' }}>{gm.name}</p>
            <p className="text-xs mt-0.5" style={{ color: '#6a6a6a' }}>Property leadership</p>
          </div>
          <User className="w-4 h-4" style={{ color: '#6a6a6a' }} />
          <ChevronRight className="w-4 h-4" style={{ color: '#c1c1c1' }} />
        </Link>
      )}

      {/* Labour by department */}
      {lab?.departments && lab.departments.length > 0 && (
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wide mb-3" style={{ color: '#6a6a6a' }}>Labour Breakdown — by Department</h2>
          <div className="overflow-x-auto rounded-2xl" style={{ border: '1px solid #dddddd', background: '#fff' }}>
            <table className="w-full text-sm border-collapse">
              <thead><tr style={{ borderBottom: '1px solid #dddddd', background: '#f7f7f7' }}>
                {['Department', 'Sched', 'Clocked', 'Variance', 'OT hrs'].map((h) => (
                  <th key={h} className="text-xs font-semibold uppercase tracking-wide py-3 px-4 whitespace-nowrap" style={{ color: '#6a6a6a', textAlign: h === 'Department' ? 'left' : 'right' }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {lab.departments.map((d, i) => (
                  <tr key={d.department} style={{ borderBottom: i < lab.departments.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                    <td className="py-3 px-4 font-medium text-sm" style={{ color: '#222' }}>{d.department}</td>
                    <td className="py-3 px-4 text-right text-sm" style={{ color: '#3f3f3f' }}>{d.scheduledHours}</td>
                    <td className="py-3 px-4 text-right text-sm" style={{ color: '#3f3f3f' }}>{d.clockedHours}</td>
                    <td className="py-3 px-4 text-right text-sm font-semibold" style={{ color: d.variance > 0 ? '#b91c1c' : '#15803d' }}>{formatVariance(d.variance)}</td>
                    <td className="py-3 px-4 text-right text-sm" style={{ color: d.overtimeHours > 5 ? '#b91c1c' : '#3f3f3f' }}>{d.overtimeHours}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Active tickets — click a ticket to open its full detail */}
      <TicketsCard tickets={tickets} />

      {/* Audit compliance strip */}
      <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid #dddddd' }}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>Audit Compliance</h3>
            <p className="text-xs mt-0.5" style={{ color: '#929292' }}>{audit.overdueRooms} overdue · {audit.dueSoonRooms} due soon · {audit.currentRooms} current</p>
          </div>
          <Link href="/web/kris/audits" className="text-xs font-semibold" style={{ color: '#ff385c' }}>View audits →</Link>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ background: '#ebebeb' }}>
          <div className="h-full rounded-full" style={{ width: `${audit.compliancePct}%`, background: audit.compliancePct >= 80 ? '#22c55e' : audit.compliancePct >= 65 ? '#f59e0b' : '#ef4444' }} />
        </div>
      </div>

      {/* Ops summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MdKpi label="Ready rooms" value={ops.readyRooms.toString()} subtext="ready to sell" />
        <MdKpi label="Dirty / Inspect" value={(ops.dirtyRooms + ops.inspectingRooms).toString()} subtext="awaiting turnover" />
        <MdKpi label="Blocked" value={ops.blockedRooms.toString()} subtext="held for VIP/maintenance" />
        <MdKpi label="Urgent tickets" value={ops.urgentTickets.toString()} subtext="priority = urgent" alert={ops.urgentTickets > 0} />
      </div>

      {/* AI findings */}
      {anomalies.length > 0 && (
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wide mb-3" style={{ color: '#6a6a6a' }}>AI Findings at this hotel</h2>
          <div className="flex flex-col gap-2">
            {anomalies.map((a) => (
              <div key={a.id} className="bg-white rounded-xl p-4" style={{ border: '1px solid #dddddd' }}>
                <p className="text-sm font-medium" style={{ color: '#222' }}>{a.headline}</p>
                {a.detail && <p className="text-xs mt-1" style={{ color: '#6a6a6a' }}>{a.detail}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Red flags */}
      {flags.length > 0 && (
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wide mb-3" style={{ color: '#6a6a6a' }}>Red Flags</h2>
          <div className="flex flex-col gap-2">
            {flags.map((f) => (
              <div key={f.id} className="bg-white rounded-xl p-4" style={{ border: '1px solid rgba(255,56,92,0.3)', background: '#fff1f3' }}>
                <p className="text-sm font-medium" style={{ color: '#b91c1c' }}>{f.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
