import Link from 'next/link';
import { Clock, Calendar, DollarSign, Sparkles, Timer, ChevronRight, CheckCircle2, AlertCircle } from 'lucide-react';
import {
  SRAVAN_EMPLOYEE,
  SRAVAN_SCHEDULE,
  SRAVAN_PAYSTUBS,
  SRAVAN_BONUSES,
  SRAVAN_SOPS,
  formatCurrency,
} from '@hos/shared';

function fmtTime(hhmm: string): string {
  const [h, m] = hhmm.split(':').map(Number);
  const hour12 = ((h + 11) % 12) + 1;
  const period = h >= 12 ? 'PM' : 'AM';
  return `${hour12}:${m.toString().padStart(2, '0')} ${period}`;
}

export default function SravanHomePage() {
  const currentStub = SRAVAN_PAYSTUBS.find((p) => p.status === 'pending')!;
  const nextShift = SRAVAN_SCHEDULE.find((s) => s.date >= '2026-05-01') ?? SRAVAN_SCHEDULE[0];
  const weekShifts = SRAVAN_SCHEDULE.slice(0, 5);
  const periodEarnings = currentStub.grossPay + currentStub.tips + currentStub.bonus;
  const activeBonuses = SRAVAN_BONUSES.filter((b) => b.status === 'active');
  const requiredSops = SRAVAN_SOPS.filter((s) => s.required);

  return (
    <div className="flex flex-col gap-6">
      {/* Hero */}
      <div
        className="rounded-2xl p-6 text-white"
        style={{ background: 'linear-gradient(135deg, #0f766e 0%, #134e4a 100%)' }}
      >
        <p className="text-xs font-medium uppercase tracking-wide opacity-80">Next Shift</p>
        <h1 className="text-2xl font-bold mt-1">
          {nextShift.label} · {fmtTime(nextShift.start)} – {fmtTime(nextShift.end)}
        </h1>
        <p className="text-sm mt-1 opacity-90">{nextShift.role} · {SRAVAN_EMPLOYEE.hotel}</p>
        {nextShift.note && (
          <p className="text-xs mt-2 opacity-90 italic">{nextShift.note}</p>
        )}
        <div className="flex gap-3 mt-4">
          <Link
            href="/web/sravan/clock"
            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl text-sm font-semibold"
            style={{ background: '#ffffff', color: '#0f766e' }}
          >
            <Clock className="w-4 h-4" /> Clock In
          </Link>
          <Link
            href="/web/sravan/schedule"
            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl text-sm font-semibold"
            style={{ background: 'rgba(255,255,255,0.15)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.3)' }}
          >
            <Calendar className="w-4 h-4" /> Full Schedule
          </Link>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          icon={DollarSign}
          label="This Pay Period"
          value={formatCurrency(periodEarnings)}
          sub={`Pays ${SRAVAN_EMPLOYEE.nextPayDate} · ${currentStub.regularHours + currentStub.overtimeHours} hrs so far`}
          href="/web/sravan/earnings"
        />
        <StatCard
          icon={Timer}
          label="Hours This Period"
          value={`${currentStub.regularHours + currentStub.overtimeHours}`}
          sub={`${currentStub.overtimeHours} OT · ${SRAVAN_EMPLOYEE.ptoBalanceHours} PTO banked`}
          href="/web/sravan/hours"
        />
        <StatCard
          icon={Sparkles}
          label="Bonuses Earned"
          value={formatCurrency(SRAVAN_BONUSES.reduce((s, b) => s + b.earnedThisPeriod, 0))}
          sub={`${activeBonuses.length} programs active`}
          href="/web/sravan/bonus"
        />
      </div>

      {/* Two-column body */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Week schedule */}
        <div className="lg:col-span-2 rounded-2xl" style={{ background: '#ffffff', border: '1px solid #dddddd' }}>
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid #f0f0f0' }}>
            <h2 className="text-sm font-bold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>This Week</h2>
            <Link href="/web/sravan/schedule" className="text-xs font-semibold inline-flex items-center gap-0.5" style={{ color: '#ff385c' }}>
              View all <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y" style={{ borderColor: '#f0f0f0' }}>
            {weekShifts.map((s) => (
              <div key={s.date} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-sm font-medium" style={{ color: '#222222' }}>{s.label}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#929292' }}>{s.role}</p>
                </div>
                <p className="text-sm font-semibold" style={{ color: '#3f3f3f' }}>
                  {fmtTime(s.start)} – {fmtTime(s.end)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Alerts & required SOPs */}
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl p-5" style={{ background: '#ffffff', border: '1px solid #dddddd' }}>
            <h3 className="text-sm font-bold uppercase tracking-wide mb-3" style={{ color: '#6a6a6a' }}>Alerts</h3>
            <ul className="flex flex-col gap-3">
              <li className="flex gap-2 items-start">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#b45309' }} />
                <p className="text-xs" style={{ color: '#3f3f3f' }}>
                  Availability for the week of May 12 is due Sunday.
                </p>
              </li>
              <li className="flex gap-2 items-start">
                <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#16a34a' }} />
                <p className="text-xs" style={{ color: '#3f3f3f' }}>
                  Quarterly training complete · $75 bonus unlocked.
                </p>
              </li>
            </ul>
          </div>

          <div className="rounded-2xl p-5" style={{ background: '#ffffff', border: '1px solid #dddddd' }}>
            <h3 className="text-sm font-bold uppercase tracking-wide mb-3" style={{ color: '#6a6a6a' }}>Required SOPs</h3>
            <p className="text-xs mb-3" style={{ color: '#929292' }}>
              {requiredSops.length} required documents for your role
            </p>
            <Link
              href="/web/sravan/sop"
              className="inline-flex items-center gap-1 text-xs font-semibold"
              style={{ color: '#ff385c' }}
            >
              Open SOP Library <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon, label, value, sub, href,
}: {
  icon: typeof Clock;
  label: string;
  value: string;
  sub: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-2xl p-5 block transition-shadow hover:shadow-sm"
      style={{ background: '#ffffff', border: '1px solid #dddddd' }}
    >
      <div className="flex items-center gap-2 mb-3">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ background: 'rgba(15,118,110,0.1)' }}
        >
          <Icon className="w-4 h-4" style={{ color: '#0f766e' }} />
        </div>
        <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>
          {label}
        </span>
      </div>
      <p className="text-2xl font-bold" style={{ color: '#222222' }}>{value}</p>
      <p className="text-xs mt-1" style={{ color: '#929292' }}>{sub}</p>
    </Link>
  );
}
