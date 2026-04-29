import { HOTELS, REVENUE_DATA, LABOUR_DATA, DAILY_METRICS, AI_ANOMALIES, getBriefByModule } from '@hos/shared';
import { formatCurrency, formatPct, formatVariance } from '@hos/shared';
import { KpiCard } from '@/components/common/KpiCard';
import { AIFlagsPanel } from '@/components/common/AIFlagsPanel';
import { PortfolioTable } from '@/components/dashboard/PortfolioTable';
import { AIBrief } from '@/components/ai/AIBrief';

export default function DashboardPage() {
  // Portfolio aggregates
  const totalRooms = HOTELS.reduce((s, h) => s + h.rooms, 0);
  const totalRoomsSold = DAILY_METRICS.reduce((s, m) => s + m.roomsSold, 0);
  const totalRoomsOoo = DAILY_METRICS.reduce((s, m) => s + m.roomsOoo, 0);
  const occupancyPct = (totalRoomsSold / totalRooms) * 100;
  const roomsNotSold = totalRooms - totalRoomsSold;

  const totalRevenue = REVENUE_DATA.reduce((s, r) => s + r.totalRevenue, 0);
  const totalRoomRevenue = REVENUE_DATA.reduce((s, r) => s + r.roomRevenue, 0);

  const totalScheduled = LABOUR_DATA.reduce((s, l) => s + l.scheduledHours, 0);
  const totalClocked = LABOUR_DATA.reduce((s, l) => s + l.clockedHours, 0);
  const labourVariance = totalClocked - totalScheduled;

  const avgRating =
    DAILY_METRICS.reduce((s, m) => s + m.avgCustomerRating, 0) / DAILY_METRICS.length;

  // Join hotel + revenue for PortfolioTable
  const portfolioRows = HOTELS.map((hotel) => {
    const revenue = REVENUE_DATA.find((r) => r.hotelId === hotel.id)!;
    return { hotel, revenue };
  });

  const brief = getBriefByModule('dashboard')!;

  return (
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-bold" style={{ color: '#222222' }}>
          Portfolio Dashboard
        </h1>
        <p className="text-sm mt-0.5" style={{ color: '#929292' }}>
          Yesterday · All 16 Hotels
        </p>
      </div>

      {/* AI Brief */}
      <AIBrief brief={brief} />

      {/* Row 1 — 4 large KPI cards */}
      <div className="grid grid-cols-4 gap-4">
        <KpiCard
          label="Portfolio Occupancy"
          value={formatPct(occupancyPct, 1)}
          subtext={`${totalRoomsSold} of ${totalRooms} rooms sold`}
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
          value={roomsNotSold.toString()}
          subtext={`${totalRoomsOoo} rooms out of order`}
          alert={roomsNotSold > 320}
          size="large"
        />
      </div>

      {/* Row 2 — 4 medium KPI cards */}
      <div className="grid grid-cols-4 gap-4">
        <KpiCard
          label="Rooms Out of Order"
          value={totalRoomsOoo.toString()}
          subtext="Across all properties"
          size="medium"
        />
        <KpiCard
          label="Hours Clocked / Scheduled"
          value={`${totalClocked.toLocaleString()} / ${totalScheduled.toLocaleString()}`}
          subtext="bi-weekly period"
          size="medium"
        />
        <KpiCard
          label="Labour Variance"
          value={formatVariance(labourVariance) + ' hrs'}
          subtext="vs. scheduled hours"
          trend={labourVariance > 0 ? 'down' : 'up'}
          alert={labourVariance > 200}
          size="medium"
        />
        <KpiCard
          label="Avg Customer Rating"
          value={avgRating.toFixed(1)}
          subtext="across all 16 hotels"
          size="medium"
        />
      </div>

      {/* Portfolio table */}
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wide mb-3" style={{ color: '#6a6a6a' }}>
          All Properties
        </h2>
        <PortfolioTable rows={portfolioRows} />
      </div>

      {/* AI findings (replaces static Red Flags) */}
      <AIFlagsPanel findings={AI_ANOMALIES.filter((a) => a.kind !== 'resolved')} />
    </div>
  );
}
