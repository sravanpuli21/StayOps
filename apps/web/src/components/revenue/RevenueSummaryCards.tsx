import { KpiCard } from '@/components/common/KpiCard';
import { formatCurrency, formatPct } from '@hos/shared';
import type { RevenueSummary } from '@hos/shared';

interface Props {
  data: RevenueSummary[];
}

export function RevenueSummaryCards({ data }: Props) {
  const totalRevenue = data.reduce((s, r) => s + r.totalRevenue, 0);
  const totalRoomRevenue = data.reduce((s, r) => s + r.roomRevenue, 0);
  const totalNonRoom = data.reduce((s, r) => s + r.nonRoomRevenue, 0);
  const avgOcc = data.reduce((s, r) => s + r.occupancyPct, 0) / data.length;
  const avgAdr = data.reduce((s, r) => s + r.adr, 0) / data.length;
  const avgRevPar = data.reduce((s, r) => s + r.revPar, 0) / data.length;

  return (
    <div className="grid grid-cols-6 gap-4">
      <KpiCard label="Total Revenue" value={formatCurrency(totalRevenue, true)} subtext="All revenue streams" size="medium" />
      <KpiCard label="Room Revenue" value={formatCurrency(totalRoomRevenue, true)} subtext={formatPct(totalRoomRevenue / totalRevenue * 100, 0) + ' of total'} size="medium" />
      <KpiCard label="Non-Room Revenue" value={formatCurrency(totalNonRoom, true)} subtext={formatPct(totalNonRoom / totalRevenue * 100, 0) + ' of total'} size="medium" />
      <KpiCard label="Avg Occupancy" value={formatPct(avgOcc, 1)} subtext="Portfolio average" size="medium" />
      <KpiCard label="Avg ADR" value={formatCurrency(avgAdr)} subtext="Average daily rate" size="medium" />
      <KpiCard label="Avg RevPAR" value={formatCurrency(avgRevPar)} subtext="Revenue per available room" size="medium" />
    </div>
  );
}
