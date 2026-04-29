import {
  HOTELS,
  REVENUE_DATA,
  LABOUR_DATA,
  DAILY_METRICS,
  AI_ANOMALIES,
  AI_FORECASTS,
  getBriefByModule,
  PORTFOLIO_HISTORY,
  PORTFOLIO_STLY,
  OCCUPANCY_RINGS,
} from '@hos/shared';
import { RevenuePageClient } from '@/components/revenue/RevenuePageClient';

export default function RevenuePage() {
  const revenueRows = HOTELS.map((hotel) => ({
    hotel,
    revenue: REVENUE_DATA.find((r) => r.hotelId === hotel.id)!,
  }));
  const efficiencyRows = HOTELS.map((hotel) => ({
    hotel,
    revenue: REVENUE_DATA.find((r) => r.hotelId === hotel.id)!,
    labour: LABOUR_DATA.find((l) => l.hotelId === hotel.id)!,
  }));
  const leakageRows = HOTELS.map((hotel) => ({
    hotel,
    revenue: REVENUE_DATA.find((r) => r.hotelId === hotel.id)!,
    daily: DAILY_METRICS.find((d) => d.hotelId === hotel.id)!,
  }));

  const revenueAnomalies = AI_ANOMALIES.filter((a) => a.module === 'revenue');
  const brief = getBriefByModule('revenue')!;
  const revenueForecast = AI_FORECASTS.find((f) => f.id === 'fc-001')!;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-bold" style={{ color: '#222222' }}>Revenue</h1>
        <p className="text-sm mt-0.5" style={{ color: '#929292' }}>Yesterday · All 16 Hotels</p>
      </div>

      <RevenuePageClient
        revenueRows={revenueRows}
        efficiencyRows={efficiencyRows}
        leakageRows={leakageRows}
        anomalies={revenueAnomalies}
        forecast={revenueForecast}
        brief={brief}
        stly={{
          totalRevenue: PORTFOLIO_STLY.totalRevenue,
          roomRevenue:  PORTFOLIO_STLY.roomRevenue,
          nonRoom:      PORTFOLIO_STLY.nonRoomRevenue,
          occupancy:    PORTFOLIO_STLY.occupancy,
          adr:          PORTFOLIO_STLY.adr,
          revPar:       PORTFOLIO_STLY.revPar,
        }}
        history={{
          totalRevenue: PORTFOLIO_HISTORY.totalRevenue.points,
          roomRevenue:  PORTFOLIO_HISTORY.roomRevenue.points,
          nonRoom:      PORTFOLIO_HISTORY.nonRoomRevenue.points,
          occupancy:    PORTFOLIO_HISTORY.occupancy.points,
          adr:          PORTFOLIO_HISTORY.adr.points,
          revPar:       PORTFOLIO_HISTORY.revPar.points,
        }}
        currentValues={{
          totalRevenue: PORTFOLIO_STLY.totalRevenue.formattedCurrent,
          roomRevenue:  PORTFOLIO_STLY.roomRevenue.formattedCurrent,
          nonRoom:      PORTFOLIO_STLY.nonRoomRevenue.formattedCurrent,
          occupancy:    PORTFOLIO_STLY.occupancy.formattedCurrent,
          adr:          PORTFOLIO_STLY.adr.formattedCurrent,
          revPar:       PORTFOLIO_STLY.revPar.formattedCurrent,
        }}
        occupancyRings={OCCUPANCY_RINGS}
      />
    </div>
  );
}
