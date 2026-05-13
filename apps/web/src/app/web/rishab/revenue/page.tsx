'use client';

import { formatCurrency, formatPct } from '@hos/shared';
import { KpiCard } from '@/components/common/KpiCard';
import { HealthBadge } from '@/components/common/HealthBadge';
import { usePropertyScoped } from '@/lib/use-property-scoped';
import { DashboardSkeleton } from '@/components/common/Skeleton';

const HOTEL_ID = 'BTRCI';

export default function RishabRevenue() {
  const scoped = usePropertyScoped(HOTEL_ID);
  const hotel = scoped.hotel;
  const rev = scoped.revenue;
  const lab = scoped.labour;
  const dm = scoped.daily;
  const period = scoped.period;
  if (!rev || !lab || !dm) return <DashboardSkeleton kpiCount={4} large />;
  const payrollPct = rev.totalRevenue > 0 ? (lab.payrollCost / rev.totalRevenue) * 100 : 0;
  const adrGap = rev.adr - rev.marketAdr;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="flex items-baseline gap-3">
          <h1 className="text-xl font-bold" style={{ color: '#222222' }}>Revenue</h1>
          <HealthBadge health={rev.health} showLabel />
        </div>
        <p className="text-sm mt-0.5" style={{ color: '#929292' }}>
          {hotel.name} · {period.label}
        </p>
      </div>

      {/* Headline KPIs */}
      <div className="grid grid-cols-4 gap-4">
        <KpiCard label="Occupancy" value={formatPct(rev.occupancyPct, 1)} subtext={`${dm.roomsSold} of ${hotel.rooms} rooms`} size="large" />
        <KpiCard label="ADR"       value={formatCurrency(rev.adr)} subtext={`${adrGap >= 0 ? '+' : ''}${formatCurrency(adrGap)} vs market`} size="large" />
        <KpiCard label="RevPAR"    value={formatCurrency(rev.revPar)} subtext="per available room" size="large" />
        <KpiCard label="Revenue"   value={formatCurrency(rev.totalRevenue, true)} subtext="yesterday total" size="large" />
      </div>

      {/* Room Rev vs Non-Room Rev */}
      <div className="grid grid-cols-3 gap-4">
        <KpiCard label="Room Revenue"    value={formatCurrency(rev.roomRevenue, true)}    subtext={formatPct((rev.roomRevenue / rev.totalRevenue) * 100, 0) + ' of total'} size="medium" />
        <KpiCard label="Non-Room"        value={formatCurrency(rev.nonRoomRevenue, true)} subtext="F&B, retail, events" size="medium" />
        <KpiCard label="Payroll %"       value={formatPct(payrollPct, 1)} subtext={formatCurrency(lab.payrollCost, true) + ' payroll'} alert={payrollPct > 28} size="medium" />
      </div>

      {/* Revenue mix breakdown */}
      <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid #dddddd' }}>
        <h2 className="text-sm font-bold uppercase tracking-wide mb-4" style={{ color: '#6a6a6a' }}>Revenue Mix</h2>
        <div className="grid grid-cols-5 gap-4">
          {[
            { label: 'Rooms',  value: rev.revenueMix.room,   color: '#ff385c' },
            { label: 'F&B',    value: rev.revenueMix.fb,     color: '#f97316' },
            { label: 'Retail', value: rev.revenueMix.retail, color: '#eab308' },
            { label: 'Events', value: rev.revenueMix.events, color: '#22c55e' },
            { label: 'Other',  value: rev.revenueMix.other,  color: '#94a3b8' },
          ].map((m) => {
            const pct = (m.value / rev.totalRevenue) * 100;
            return (
              <div key={m.label}>
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="w-2 h-2 rounded-full" style={{ background: m.color }} />
                  <p className="text-xs font-semibold" style={{ color: '#6a6a6a' }}>{m.label}</p>
                </div>
                <p className="text-lg font-bold" style={{ color: '#222' }}>{formatCurrency(m.value, true)}</p>
                <div className="h-1.5 rounded-full overflow-hidden mt-1" style={{ background: '#f0f0f0' }}>
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, background: m.color }} />
                </div>
                <p className="text-[10px] mt-1" style={{ color: '#929292' }}>{pct.toFixed(0)}% of total</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pricing power vs market */}
      <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid #dddddd' }}>
        <h2 className="text-sm font-bold uppercase tracking-wide mb-4" style={{ color: '#6a6a6a' }}>Pricing Power vs. Market</h2>
        <div className="flex items-center gap-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#929292' }}>Our ADR</p>
            <p className="text-2xl font-bold" style={{ color: '#222' }}>{formatCurrency(rev.adr)}</p>
          </div>
          <div className="text-2xl" style={{ color: '#c1c1c1' }}>vs</div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#929292' }}>Market ADR</p>
            <p className="text-2xl font-bold" style={{ color: '#6a6a6a' }}>{formatCurrency(rev.marketAdr)}</p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#929292' }}>Gap</p>
            <p className="text-2xl font-bold" style={{ color: adrGap > 15 ? '#15803d' : adrGap < -10 ? '#b91c1c' : '#6a6a6a' }}>
              {adrGap >= 0 ? '+' : ''}{formatCurrency(adrGap)}
            </p>
            <p className="text-xs mt-0.5" style={{ color: '#929292' }}>
              {((adrGap / rev.marketAdr) * 100).toFixed(1)}% {adrGap >= 0 ? 'premium' : 'discount'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
