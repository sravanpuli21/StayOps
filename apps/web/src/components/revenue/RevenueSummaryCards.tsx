import { KpiCard } from '@/components/common/KpiCard';
import { formatCurrency, formatPct } from '@hos/shared';
import type { RevenueSummary } from '@hos/shared';

interface Props {
  data: RevenueSummary[];
  multiplier?: number;
  periodLabel?: string;
}

export function RevenueSummaryCards({ data, multiplier = 1, periodLabel = 'this period' }: Props) {
  const mult = multiplier;
  const totalRevenue = data.reduce((s, r) => s + r.totalRevenue, 0) * mult;
  const totalRoomRevenue = data.reduce((s, r) => s + r.roomRevenue, 0) * mult;
  const totalNonRoom = data.reduce((s, r) => s + r.nonRoomRevenue, 0) * mult;
  // Ratios (occupancy, ADR, RevPAR) are averages — not scaled by period
  const avgOcc = data.length > 0 ? data.reduce((s, r) => s + r.occupancyPct, 0) / data.length : 0;
  const avgAdr = data.length > 0 ? data.reduce((s, r) => s + r.adr, 0) / data.length : 0;
  const avgRevPar = data.length > 0 ? data.reduce((s, r) => s + r.revPar, 0) / data.length : 0;

  return (
    <div className="grid grid-cols-6 gap-4">
      <KpiCard label="Total Revenue" value={formatCurrency(totalRevenue, true)} subtext={`All revenue · ${periodLabel}`} size="medium" />
      <KpiCard label="Room Revenue" value={formatCurrency(totalRoomRevenue, true)} subtext={totalRevenue > 0 ? formatPct(totalRoomRevenue / totalRevenue * 100, 0) + ' of total' : '—'} size="medium" />
      <KpiCard label="Non-Room Revenue" value={formatCurrency(totalNonRoom, true)} subtext={totalRevenue > 0 ? formatPct(totalNonRoom / totalRevenue * 100, 0) + ' of total' : '—'} size="medium" />
      <KpiCard label="Avg Occupancy" value={formatPct(avgOcc, 1)} subtext="Portfolio average" size="medium" />
      <KpiCard label="Avg ADR" value={formatCurrency(avgAdr)} subtext="Average daily rate" size="medium" />
      <KpiCard label="Avg RevPAR" value={formatCurrency(avgRevPar)} subtext="Revenue per available room" size="medium" />
    </div>
  );
}
