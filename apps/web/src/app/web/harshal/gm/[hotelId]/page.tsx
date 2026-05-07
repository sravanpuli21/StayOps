import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ChevronRight, MessageSquare, Phone, MapPin, Clock, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import {
  HOTELS, REVENUE_DATA, LABOUR_DATA, DAILY_METRICS,
  GM_ROSTER, REGIONAL_ROSTER, computeHotelScore,
  formatCurrency, formatPct, formatVariance,
} from '@hos/shared';
import { HealthBadge } from '@/components/common/HealthBadge';

const HARSHAL = REGIONAL_ROSTER.find((r) => r.id === 'harshal')!;

// Synthetic commitments/response data (matches what Harshal GMs page uses)
const COMMITMENT_DATA: Record<string, { open: number; ontrack: number; missed: number; lastContact: string; responseMinutes: number; }> = {
  BSWVE:    { open: 3, ontrack: 2, missed: 1, lastContact: '2h ago',  responseMinutes: 42 },
  GAA84:    { open: 5, ontrack: 2, missed: 2, lastContact: '1d ago',  responseMinutes: 92 },
  BQKFP:    { open: 4, ontrack: 3, missed: 0, lastContact: '4h ago',  responseMinutes: 55 },
  SGJES:    { open: 2, ontrack: 2, missed: 0, lastContact: '6h ago',  responseMinutes: 28 },
  JAXTX:    { open: 3, ontrack: 3, missed: 0, lastContact: '3h ago',  responseMinutes: 34 },
  DFWFW:    { open: 6, ontrack: 2, missed: 3, lastContact: '2d ago',  responseMinutes: 140 },
  BTRCI:    { open: 4, ontrack: 3, missed: 1, lastContact: '5h ago',  responseMinutes: 68 },
  '58090LA':{ open: 3, ontrack: 2, missed: 1, lastContact: '8h ago',  responseMinutes: 75 },
};

// Synthetic commitment log — realistic weekly accountability trail
const COMMITMENT_LOG: Record<string, Array<{ date: string; topic: string; status: 'ontrack' | 'missed' | 'completed'; note?: string }>> = {
  BSWVE: [
    { date: 'Apr 28', topic: 'Reduce OOO rooms to <3',                  status: 'ontrack',  note: 'PTAC service scheduled Fri' },
    { date: 'Apr 21', topic: 'Trim HK overtime by 5hrs/period',          status: 'completed', note: '3 hrs below target last cycle' },
    { date: 'Apr 14', topic: 'Front-desk staffing review',               status: 'missed',   note: 'Deferred — no update in 7 days' },
    { date: 'Apr 07', topic: 'Quarterly audits plan',                    status: 'completed' },
  ],
  GAA84: [
    { date: 'Apr 29', topic: 'Pool deck repairs',                        status: 'missed',   note: 'Vendor delay — escalate' },
    { date: 'Apr 22', topic: 'Labour variance <10%',                     status: 'ontrack' },
    { date: 'Apr 15', topic: 'Payroll review',                           status: 'missed',   note: 'Incomplete submission' },
    { date: 'Apr 08', topic: 'Guest review response rate',               status: 'completed' },
  ],
  BQKFP: [
    { date: 'Apr 30', topic: 'HVAC preventive on schedule',              status: 'ontrack' },
    { date: 'Apr 23', topic: 'New HK supervisor onboarding',             status: 'completed' },
    { date: 'Apr 16', topic: 'Reduce rooms OOO',                         status: 'ontrack' },
  ],
  SGJES: [
    { date: 'Apr 28', topic: 'Audit compliance push',                    status: 'ontrack' },
    { date: 'Apr 21', topic: 'Breakfast service upgrade',                status: 'completed' },
  ],
  JAXTX: [
    { date: 'Apr 29', topic: 'Pricing review vs comp set',               status: 'ontrack',  note: 'ADR up $4 this week' },
    { date: 'Apr 22', topic: 'Guest recovery program rollout',           status: 'completed' },
    { date: 'Apr 15', topic: 'Annual review prep',                       status: 'completed' },
  ],
  DFWFW: [
    { date: 'Apr 26', topic: 'Payroll variance — URGENT',                status: 'missed',   note: 'Still >30% — needs plan this week' },
    { date: 'Apr 19', topic: 'Reduce overtime',                          status: 'missed',   note: 'Increased instead of decreased' },
    { date: 'Apr 12', topic: 'Pool deck maintenance',                    status: 'missed',   note: 'Open 3 weeks' },
    { date: 'Apr 05', topic: 'OOO room recovery',                        status: 'ontrack' },
  ],
  BTRCI: [
    { date: 'Apr 28', topic: 'Night audit consistency',                  status: 'ontrack' },
    { date: 'Apr 21', topic: 'Front desk staffing plan',                 status: 'missed',   note: 'Will resubmit Fri' },
    { date: 'Apr 14', topic: 'Quarterly HK audit',                       status: 'completed' },
  ],
  '58090LA': [
    { date: 'Apr 27', topic: 'Revenue vs budget gap',                    status: 'missed',   note: '$8k under — need strategy' },
    { date: 'Apr 20', topic: 'Comp-set rate review',                     status: 'ontrack' },
    { date: 'Apr 13', topic: 'Staff training plan',                      status: 'completed' },
  ],
};

interface Props {
  params: Promise<{ hotelId: string }>;
}

const STATUS_ICON = {
  ontrack:   { Icon: Clock,        color: '#d97706', bg: '#fffbeb', label: 'On track' },
  completed: { Icon: CheckCircle2, color: '#15803d', bg: '#f0fdf4', label: 'Completed' },
  missed:    { Icon: XCircle,      color: '#b91c1c', bg: '#fef2f2', label: 'Missed' },
} as const;

export default async function GmDetailPage({ params }: Props) {
  const { hotelId } = await params;
  if (!HARSHAL.hotelIds.includes(hotelId)) notFound();

  const hotel = HOTELS.find((h) => h.id === hotelId);
  const gm = GM_ROSTER.find((g) => g.hotelId === hotelId);
  if (!hotel || !gm) notFound();

  const rev = REVENUE_DATA.find((r) => r.hotelId === hotelId)!;
  const lab = LABOUR_DATA.find((l) => l.hotelId === hotelId)!;
  const dm = DAILY_METRICS.find((d) => d.hotelId === hotelId)!;
  const score = computeHotelScore(hotelId);
  const commit = COMMITMENT_DATA[hotelId];
  const log = COMMITMENT_LOG[hotelId] ?? [];
  const payrollPct = (lab.payrollCost / rev.totalRevenue) * 100;
  const onTrackPct = commit.open > 0 ? Math.round((commit.ontrack / commit.open) * 100) : 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm" style={{ color: '#6a6a6a' }}>
        <Link href="/web/harshal/gms" className="hover:underline flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" />
          GMs
        </Link>
        <ChevronRight className="w-3 h-3" style={{ color: '#c1c1c1' }} />
        <span style={{ color: '#222' }}>{gm.name}</span>
      </div>

      {/* Profile header */}
      <div className="bg-white rounded-2xl p-6 flex items-start gap-5" style={{ border: '1px solid #dddddd' }}>
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: '#f7f7f7', color: '#222', fontSize: 22, fontWeight: 700 }}
        >
          {gm.initials}
        </div>
        <div className="flex-1">
          <h1 className="text-xl font-bold" style={{ color: '#222' }}>{gm.name}</h1>
          <p className="text-sm mt-0.5" style={{ color: '#6a6a6a' }}>
            General Manager · <Link href={`/web/harshal/hotel/${hotel.id}`} className="underline font-medium" style={{ color: '#222' }}>{hotel.shortName}</Link>
          </p>
          <div className="flex items-center gap-4 text-xs mt-2" style={{ color: '#929292' }}>
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {hotel.city}, {hotel.state}
            </span>
            <span>·</span>
            <span>{hotel.brand}</span>
            <span>·</span>
            <span>{hotel.rooms} rooms</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl transition-colors"
            style={{ background: '#f7f7f7', color: '#222', border: '1px solid #dddddd' }}
          >
            <Phone className="w-3.5 h-3.5" />
            Call
          </button>
          <button
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl transition-colors"
            style={{ background: '#ff385c', color: '#ffffff' }}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Message GM
          </button>
        </div>
      </div>

      {/* Accountability summary */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid #dddddd' }}>
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#929292' }}>Composite Score</p>
          <p className="text-2xl font-bold mt-1" style={{ color: score.composite < 65 ? '#b91c1c' : score.composite < 75 ? '#b45309' : '#15803d' }}>
            {score.composite}
          </p>
          <p className="text-xs mt-1" style={{ color: '#6a6a6a' }}>
            {score.trendDirection === 'up' ? '↗' : score.trendDirection === 'down' ? '↘' : '→'} {formatVariance(score.trendDelta)} vs last period
          </p>
        </div>
        <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid #dddddd' }}>
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#929292' }}>Open Commitments</p>
          <p className="text-2xl font-bold mt-1" style={{ color: '#222' }}>
            {commit.ontrack}/{commit.open}
          </p>
          <div className="h-1.5 rounded-full overflow-hidden mt-2" style={{ background: '#ebebeb' }}>
            <div className="h-full rounded-full" style={{ width: `${onTrackPct}%`, background: onTrackPct >= 75 ? '#16a34a' : onTrackPct >= 50 ? '#d97706' : '#dc2626' }} />
          </div>
          <p className="text-xs mt-1" style={{ color: '#6a6a6a' }}>on track</p>
        </div>
        <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid #dddddd' }}>
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#929292' }}>Missed Follow-ups</p>
          <p className="text-2xl font-bold mt-1" style={{ color: commit.missed > 1 ? '#b91c1c' : commit.missed > 0 ? '#b45309' : '#15803d' }}>
            {commit.missed}
          </p>
          <p className="text-xs mt-1" style={{ color: '#6a6a6a' }}>this period</p>
        </div>
        <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid #dddddd' }}>
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#929292' }}>Avg Response</p>
          <p className="text-2xl font-bold mt-1" style={{ color: commit.responseMinutes > 60 ? '#b91c1c' : '#15803d' }}>
            {commit.responseMinutes}m
          </p>
          <p className="text-xs mt-1" style={{ color: '#6a6a6a' }}>last contact {commit.lastContact}</p>
        </div>
      </div>

      {/* Property snapshot */}
      <div>
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="text-sm font-bold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>
            Property Snapshot — {hotel.shortName}
          </h2>
          <Link href={`/web/harshal/hotel/${hotel.id}`} className="text-xs font-semibold" style={{ color: '#ff385c' }}>
            Full hotel view →
          </Link>
        </div>
        <div className="bg-white rounded-2xl p-5 grid grid-cols-5 gap-4" style={{ border: '1px solid #dddddd' }}>
          <div>
            <p className="text-[10px] font-bold uppercase" style={{ color: '#929292' }}>Occupancy</p>
            <p className="text-lg font-semibold" style={{ color: '#222' }}>{formatPct(rev.occupancyPct, 0)}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase" style={{ color: '#929292' }}>Revenue</p>
            <p className="text-lg font-semibold" style={{ color: '#222' }}>{formatCurrency(rev.totalRevenue, true)}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase" style={{ color: '#929292' }}>Payroll %</p>
            <p className="text-lg font-semibold" style={{ color: payrollPct > 28 ? '#b91c1c' : '#222' }}>{formatPct(payrollPct, 1)}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase" style={{ color: '#929292' }}>Hours Var</p>
            <p className="text-lg font-semibold" style={{ color: lab.variance > 0 ? '#b91c1c' : '#15803d' }}>{formatVariance(lab.variance)}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase" style={{ color: '#929292' }}>Rooms OOO</p>
            <p className="text-lg font-semibold" style={{ color: dm.roomsOoo > 0 ? '#b91c1c' : '#222' }}>{dm.roomsOoo}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <HealthBadge health={rev.health} showLabel />
        </div>
      </div>

      {/* Commitment log */}
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wide mb-3" style={{ color: '#6a6a6a' }}>
          Commitment Log
        </h2>
        <div className="bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid #dddddd' }}>
          {log.map((entry, i) => {
            const cfg = STATUS_ICON[entry.status];
            return (
              <div
                key={i}
                className="flex items-start gap-4 p-4"
                style={{ borderBottom: i < log.length - 1 ? '1px solid #f0f0f0' : 'none' }}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: cfg.bg }}
                >
                  <cfg.Icon className="w-4 h-4" style={{ color: cfg.color }} />
                </div>
                <div className="flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="text-sm font-semibold" style={{ color: '#222' }}>{entry.topic}</p>
                    <span
                      className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full flex-shrink-0"
                      style={{ color: cfg.color, background: cfg.bg }}
                    >
                      {cfg.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs mt-1" style={{ color: '#929292' }}>
                    <span>{entry.date}</span>
                    {entry.note && <span>· {entry.note}</span>}
                  </div>
                </div>
              </div>
            );
          })}
          {log.length === 0 && (
            <p className="text-sm p-8 text-center" style={{ color: '#929292' }}>
              No recorded commitments with this GM yet.
            </p>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-3 gap-3">
        <Link
          href={`/web/harshal/hotel/${hotel.id}`}
          className="flex items-center justify-between bg-white rounded-xl p-4 hover:border-[#ff385c] transition-colors"
          style={{ border: '1px solid #dddddd' }}
        >
          <div>
            <p className="text-sm font-semibold" style={{ color: '#222' }}>Property detail</p>
            <p className="text-xs mt-0.5" style={{ color: '#6a6a6a' }}>All metrics · labour · ops</p>
          </div>
          <ChevronRight className="w-4 h-4" style={{ color: '#c1c1c1' }} />
        </Link>
        <Link
          href={`/web/harshal/operations`}
          className="flex items-center justify-between bg-white rounded-xl p-4 hover:border-[#ff385c] transition-colors"
          style={{ border: '1px solid #dddddd' }}
        >
          <div>
            <p className="text-sm font-semibold" style={{ color: '#222' }}>Active tickets</p>
            <p className="text-xs mt-0.5" style={{ color: '#6a6a6a' }}>Open ops + maintenance</p>
          </div>
          <ChevronRight className="w-4 h-4" style={{ color: '#c1c1c1' }} />
        </Link>
        <Link
          href={`/web/harshal/audits`}
          className="flex items-center justify-between bg-white rounded-xl p-4 hover:border-[#ff385c] transition-colors"
          style={{ border: '1px solid #dddddd' }}
        >
          <div>
            <p className="text-sm font-semibold" style={{ color: '#222' }}>Audit compliance</p>
            <p className="text-xs mt-0.5" style={{ color: '#6a6a6a' }}>Property audit trail</p>
          </div>
          <ChevronRight className="w-4 h-4" style={{ color: '#c1c1c1' }} />
        </Link>
      </div>
    </div>
  );
}
