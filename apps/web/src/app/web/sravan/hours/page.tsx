import { Timer } from 'lucide-react';
import { SRAVAN_EMPLOYEE, SRAVAN_PAYSTUBS, SRAVAN_CLOCK_LOG, sravanPeriodHours } from '@hos/shared';

export default function SravanHoursPage() {
  const current = sravanPeriodHours(SRAVAN_CLOCK_LOG);
  const totalCurrent = current.regular + current.overtime;

  // Hours by day for current log
  const byDay = SRAVAN_CLOCK_LOG.map((s) => {
    if (!s.clockOut) return { date: s.clockIn.slice(0, 10), hours: 0 };
    const ms = new Date(s.clockOut).getTime() - new Date(s.clockIn).getTime();
    return { date: s.clockIn.slice(0, 10), hours: Number((ms / 3600000 - s.breakMinutes / 60).toFixed(2)) };
  });
  const maxHours = Math.max(8, ...byDay.map((d) => d.hours));

  const ytdRegular = SRAVAN_PAYSTUBS.reduce((s, p) => s + p.regularHours, 0);
  const ytdOt = SRAVAN_PAYSTUBS.reduce((s, p) => s + p.overtimeHours, 0);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold" style={{ color: '#222222' }}>Hours</h1>
        <p className="text-sm mt-0.5" style={{ color: '#929292' }}>
          Pay period {SRAVAN_EMPLOYEE.payPeriod} · clocked time from punches
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard label="Regular (This Period)" value={current.regular.toFixed(2)} sub="hrs" />
        <KpiCard label="Overtime (This Period)" value={current.overtime.toFixed(2)} sub="hrs" danger={current.overtime > 0} />
        <KpiCard label="Total (This Period)" value={totalCurrent.toFixed(2)} sub={`target 80 hrs`} />
        <KpiCard label="PTO Balance" value={SRAVAN_EMPLOYEE.ptoBalanceHours.toString()} sub="hrs banked" />
      </div>

      <div className="rounded-2xl p-5" style={{ background: '#ffffff', border: '1px solid #dddddd' }}>
        <h2 className="text-sm font-bold uppercase tracking-wide mb-4" style={{ color: '#6a6a6a' }}>
          Hours By Day
        </h2>
        <div className="flex flex-col gap-3">
          {byDay.map((d, i) => {
            const pct = (d.hours / maxHours) * 100;
            const label = new Date(d.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
            return (
              <div key={i} className="flex items-center gap-3">
                <span className="text-xs font-medium w-24 flex-shrink-0" style={{ color: '#6a6a6a' }}>{label}</span>
                <div className="flex-1 h-6 rounded-lg overflow-hidden" style={{ background: '#f7f7f7' }}>
                  <div
                    className="h-full rounded-lg flex items-center justify-end pr-2"
                    style={{ width: `${pct}%`, background: d.hours > 8 ? '#b45309' : '#0f766e' }}
                  >
                    {pct > 18 && (
                      <span className="text-[10px] font-semibold text-white tabular-nums">{d.hours} hr</span>
                    )}
                  </div>
                </div>
                {pct <= 18 && (
                  <span className="text-[10px] font-semibold tabular-nums w-12 text-right" style={{ color: '#6a6a6a' }}>
                    {d.hours} hr
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-2xl p-5" style={{ background: '#ffffff', border: '1px solid #dddddd' }}>
          <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: '#6a6a6a' }}>YTD Regular</p>
          <p className="text-2xl font-bold" style={{ color: '#222222' }}>{ytdRegular.toFixed(1)} hrs</p>
        </div>
        <div className="rounded-2xl p-5" style={{ background: '#ffffff', border: '1px solid #dddddd' }}>
          <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: '#6a6a6a' }}>YTD Overtime</p>
          <p className="text-2xl font-bold" style={{ color: ytdOt > 0 ? '#b45309' : '#222222' }}>{ytdOt.toFixed(1)} hrs</p>
        </div>
      </div>
    </div>
  );
}

function KpiCard({ label, value, sub, danger }: { label: string; value: string; sub: string; danger?: boolean }) {
  return (
    <div className="rounded-2xl p-5" style={{ background: '#ffffff', border: '1px solid #dddddd' }}>
      <div className="flex items-center gap-2 mb-2">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ background: 'rgba(15,118,110,0.1)' }}
        >
          <Timer className="w-4 h-4" style={{ color: '#0f766e' }} />
        </div>
        <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>{label}</span>
      </div>
      <p className="text-2xl font-bold" style={{ color: danger ? '#b45309' : '#222222' }}>{value}</p>
      <p className="text-xs mt-1" style={{ color: '#929292' }}>{sub}</p>
    </div>
  );
}
