import {
  HOTELS,
  REVENUE_DATA,
  LABOUR_DATA,
  DAILY_METRICS,
  AI_ANOMALIES,
  getBriefByModule,
  PORTFOLIO_HISTORY,
  PORTFOLIO_STLY,
  OCCUPANCY_RINGS,
} from '@hos/shared';
import { KpiCard } from '@/components/common/KpiCard';
import { AIFlagsPanel } from '@/components/common/AIFlagsPanel';
import { PortfolioTable } from '@/components/dashboard/PortfolioTable';
import { AIBrief } from '@/components/ai/AIBrief';
import { DonutPair } from '@/components/common/DonutPair';
import { SegmentedStatusBar } from '@/components/common/SegmentedStatusBar';

export default function DashboardPage() {
  const totalRooms = HOTELS.reduce((s, h) => s + h.rooms, 0);
  const totalRoomsSold = DAILY_METRICS.reduce((s, m) => s + m.roomsSold, 0);
  const totalRoomsOoo = DAILY_METRICS.reduce((s, m) => s + m.roomsOoo, 0);
  const roomsNotSold = totalRooms - totalRoomsSold;

  const portfolioRows = HOTELS.map((hotel) => {
    const revenue = REVENUE_DATA.find((r) => r.hotelId === hotel.id)!;
    return { hotel, revenue };
  });

  const brief = getBriefByModule('dashboard')!;

  // Health breakdown segments
  const greenCount = REVENUE_DATA.filter((r) => r.health === 'green').length;
  const amberCount = REVENUE_DATA.filter((r) => r.health === 'amber').length;
  const redCount = REVENUE_DATA.filter((r) => r.health === 'red').length;
  const greenPct = Math.round((greenCount / REVENUE_DATA.length) * 100);
  const amberPct = Math.round((amberCount / REVENUE_DATA.length) * 100);
  const redPct = 100 - greenPct - amberPct;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold" style={{ color: '#222222' }}>
          Portfolio Dashboard
        </h1>
        <p className="text-sm mt-0.5" style={{ color: '#929292' }}>
          Yesterday · All 16 Hotels
        </p>
      </div>

      <AIBrief brief={brief} />

      {/* Row 1 — 4 primary KPIs with sparklines + STLY */}
      <div className="grid grid-cols-4 gap-3">
        <KpiCard
          label="Portfolio Occupancy"
          value={PORTFOLIO_STLY.occupancy.formattedCurrent}
          change={{ pct: PORTFOLIO_STLY.occupancy.changePct, direction: 'up' }}
          stly={PORTFOLIO_STLY.occupancy.formattedStly}
          sparkline={PORTFOLIO_HISTORY.occupancy.points}
        />
        <KpiCard
          label="Room Revenue"
          value={PORTFOLIO_STLY.roomRevenue.formattedCurrent}
          change={{ pct: PORTFOLIO_STLY.roomRevenue.changePct, direction: 'up' }}
          stly={PORTFOLIO_STLY.roomRevenue.formattedStly}
          sparkline={PORTFOLIO_HISTORY.roomRevenue.points}
        />
        <KpiCard
          label="Total Revenue"
          value={PORTFOLIO_STLY.totalRevenue.formattedCurrent}
          change={{ pct: PORTFOLIO_STLY.totalRevenue.changePct, direction: 'up' }}
          stly={PORTFOLIO_STLY.totalRevenue.formattedStly}
          sparkline={PORTFOLIO_HISTORY.totalRevenue.points}
        />
        <KpiCard
          label="Rooms Not Sold"
          value={roomsNotSold.toString()}
          change={{ pct: PORTFOLIO_STLY.roomsNotSold.changePct, direction: 'up' }}
          stly={PORTFOLIO_STLY.roomsNotSold.formattedStly}
        />
      </div>

      {/* Row 2 — 4 secondary KPIs */}
      <div className="grid grid-cols-4 gap-3">
        <KpiCard
          label="Rooms Out of Order"
          value={totalRoomsOoo.toString()}
          stly="9"
          change={{ pct: -11, direction: 'up' }}
        />
        <KpiCard
          label="Hours Clocked / Sched"
          value="9,871 / 9,597"
          change={{ pct: PORTFOLIO_STLY.scheduledHours.changePct, direction: 'up' }}
          stly={`${PORTFOLIO_STLY.clockedHours.formattedStly} / ${PORTFOLIO_STLY.scheduledHours.formattedStly}`}
        />
        <KpiCard
          label="Labour Variance"
          value={PORTFOLIO_STLY.labourVariance.formattedCurrent}
          change={{ pct: PORTFOLIO_STLY.labourVariance.changePct, direction: 'up' }}
          stly={PORTFOLIO_STLY.labourVariance.formattedStly}
          alert
        />
        <KpiCard
          label="Avg Customer Rating"
          value={PORTFOLIO_STLY.avgRating.formattedCurrent}
          change={{ pct: PORTFOLIO_STLY.avgRating.changePct, direction: 'up' }}
          stly={PORTFOLIO_STLY.avgRating.formattedStly}
        />
      </div>

      {/* Row 3 — Donut pair + health breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div
          className="bg-white p-6"
          style={{ borderRadius: 14, border: '1px solid #dddddd' }}
        >
          <p className="text-base font-semibold mb-4" style={{ color: '#222' }}>
            Occupancy — OTB vs Month Forecast
          </p>
          <DonutPair rings={OCCUPANCY_RINGS} size={130} />
        </div>

        <div
          className="bg-white p-6"
          style={{ borderRadius: 14, border: '1px solid #dddddd' }}
        >
          <p className="text-base font-semibold mb-5" style={{ color: '#222' }}>
            Portfolio Health Status
          </p>
          <SegmentedStatusBar
            segments={[
              { label: 'Green',  pct: greenPct, color: '#16a34a' },
              { label: 'Amber',  pct: amberPct, color: '#d97706' },
              { label: 'Red',    pct: redPct,   color: '#dc2626' },
            ]}
          />
          <p className="text-xs mt-4" style={{ color: '#6a6a6a' }}>
            {greenCount} healthy · {amberCount} to monitor · {redCount} at risk
          </p>
        </div>
      </div>

      <div>
        <h2 className="text-base font-bold mb-3" style={{ color: '#222' }}>
          All Properties
        </h2>
        <PortfolioTable rows={portfolioRows} />
      </div>

      <AIFlagsPanel findings={AI_ANOMALIES.filter((a) => a.kind !== 'resolved')} />
    </div>
  );
}
