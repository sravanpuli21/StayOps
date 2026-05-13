'use client';

import { formatCurrency, formatPct, formatVariance } from '@hos/shared';
import { KpiCard } from '@/components/common/KpiCard';
import { AIFlagsPanel } from '@/components/common/AIFlagsPanel';
import { PortfolioTable } from '@/components/dashboard/PortfolioTable';
import { DashboardSkeleton } from '@/components/common/Skeleton';
import { ErrorBanner } from '@/components/common/ErrorBanner';
import { useScopedData } from '@/lib/use-scoped-data';

export default function DashboardPage() {
  const {
    hotels, scopeLabel, scopeSub, period,
    revenueRows, labourRows, dailyRows, openAnomalies,
    isSingleHotel, isRegional, loading, error,
  } = useScopedData();

  if (error) return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold" style={{ color: '#222222' }}>{scopeLabel} Dashboard</h1>
        <p className="text-sm mt-0.5" style={{ color: '#929292' }}>{scopeSub}</p>
      </div>
      <ErrorBanner error={error} />
    </div>
  );
  if (loading) return <DashboardSkeleton kpiCount={4} large />;

  const totalRooms = hotels.reduce((s, h) => s + h.rooms, 0);
  const totalRoomCapacity = totalRooms * period.days;
  const totalRoomsSold = dailyRows.reduce((s, m) => s + m.roomsSold, 0);
  // OOO is a current snapshot, scale lightly (capped at 2×) so it doesn't explode for YTD
  const totalRoomsOoo = dailyRows.reduce((s, m) => s + m.roomsOoo, 0);
  const occupancyPct = totalRoomCapacity > 0 ? (totalRoomsSold / totalRoomCapacity) * 100 : 0;
  const roomsNotSold = totalRoomCapacity - totalRoomsSold;
  const totalRevenue = revenueRows.reduce((s, r) => s + r.totalRevenue, 0);
  const totalRoomRevenue = revenueRows.reduce((s, r) => s + r.roomRevenue, 0);
  const totalScheduled = labourRows.reduce((s, l) => s + l.scheduledHours, 0);
  const totalClocked = labourRows.reduce((s, l) => s + l.clockedHours, 0);
  const labourVariance = totalClocked - totalScheduled;
  const avgRating = dailyRows.length > 0
    ? dailyRows.reduce((s, m) => s + m.avgCustomerRating, 0) / dailyRows.length
    : 0;

  const portfolioRows = hotels
    .map((hotel) => {
      const revenue = revenueRows.find((r) => r.hotelId === hotel.id);
      return revenue ? { hotel, revenue } : null;
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  const roomsNotSoldAlert = roomsNotSold > totalRoomCapacity * 0.2;
  const labourVarAlert = labourVariance > Math.max(50, totalScheduled * 0.04);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold" style={{ color: '#222222' }}>{scopeLabel} Dashboard</h1>
        <p className="text-sm mt-0.5" style={{ color: '#929292' }}>{scopeSub}</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <KpiCard
          label="Occupancy"
          value={formatPct(occupancyPct, 1)}
          subtext={`${totalRoomsSold.toLocaleString()} of ${totalRoomCapacity.toLocaleString()} room-nights sold`}
          size="large"
        />
        <KpiCard
          label="Room Revenue"
          value={formatCurrency(totalRoomRevenue, true)}
          subtext="Rooms only, excl. F&B / retail"
          size="large"
        />
        <KpiCard
          label="Total Revenue"
          value={formatCurrency(totalRevenue, true)}
          subtext="All revenue streams"
          size="large"
        />
        <KpiCard
          label="Rooms Not Sold"
          value={roomsNotSold.toLocaleString()}
          subtext={`${totalRoomsOoo} rooms out of order`}
          alert={roomsNotSoldAlert}
          size="large"
        />
      </div>

      <div className="grid grid-cols-4 gap-4">
        <KpiCard
          label="Rooms Out of Order"
          value={totalRoomsOoo.toString()}
          subtext={isSingleHotel ? 'This property' : 'Across properties'}
          size="medium"
        />
        <KpiCard
          label="Hours Clocked / Scheduled"
          value={`${totalClocked.toLocaleString()} / ${totalScheduled.toLocaleString()}`}
          subtext={period.label}
          size="medium"
        />
        <KpiCard
          label="Labour Variance"
          value={formatVariance(labourVariance) + ' hrs'}
          subtext="vs. scheduled hours"
          trend={labourVariance > 0 ? 'down' : 'up'}
          alert={labourVarAlert}
          size="medium"
        />
        <KpiCard
          label="Avg Customer Rating"
          value={avgRating.toFixed(1)}
          subtext={isSingleHotel ? 'this property' : `across ${hotels.length} hotels`}
          size="medium"
        />
      </div>

      <div>
        <h2 className="text-sm font-bold uppercase tracking-wide mb-3" style={{ color: '#6a6a6a' }}>
          {isSingleHotel ? 'Property' : isRegional ? `Properties (${hotels.length})` : 'All Properties'}
        </h2>
        <PortfolioTable rows={portfolioRows} />
      </div>

      {openAnomalies.length > 0 ? (
        <AIFlagsPanel findings={openAnomalies} />
      ) : (
        <div className="rounded-2xl p-6 text-center" style={{ background: '#ffffff', border: '1px solid #dddddd' }}>
          <p className="text-sm font-semibold" style={{ color: '#222' }}>No open AI findings for {scopeLabel}</p>
          <p className="text-xs mt-1" style={{ color: '#929292' }}>Everything at this scope is within tolerance.</p>
        </div>
      )}
    </div>
  );
}
