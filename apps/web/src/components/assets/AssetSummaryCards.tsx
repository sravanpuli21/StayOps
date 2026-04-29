import { KpiCard } from '@/components/common/KpiCard';
import { formatCurrency } from '@hos/shared';
import type { AssetHotelSummary } from '@hos/shared';

interface Props {
  summaries: AssetHotelSummary[];
}

export function AssetSummaryCards({ summaries }: Props) {
  const totalValue = summaries.reduce((s, r) => s + r.totalValue, 0);
  const totalAging = summaries.reduce((s, r) => s + r.agingAssets, 0);
  const totalFailing = summaries.reduce((s, r) => s + r.failingAssets, 0);
  const ytdSpend = summaries.reduce((s, r) => s + r.ytdSpend, 0);
  const totalAssets = summaries.reduce((s, r) => s + r.totalAssets, 0);
  const totalPreventive = summaries.length > 0
    ? Math.round(summaries.reduce((s, r) => s + r.preventiveCompliancePct, 0) / summaries.length)
    : 0;

  return (
    <div className="grid grid-cols-5 gap-4">
      <KpiCard
        label="Total Asset Value"
        value={formatCurrency(totalValue, true)}
        subtext={`${totalAssets} tracked assets`}
        size="medium"
      />
      <KpiCard
        label="Aging Assets"
        value={totalAging.toString()}
        subtext=">80% of expected life"
        alert={totalAging > 20}
        size="medium"
      />
      <KpiCard
        label="Failing / Poor"
        value={totalFailing.toString()}
        subtext="Immediate attention"
        alert={totalFailing > 10}
        size="medium"
      />
      <KpiCard
        label="YTD Repair Spend"
        value={formatCurrency(ytdSpend, true)}
        subtext="Work orders last 12 mo"
        size="medium"
      />
      <KpiCard
        label="Preventive Compliance"
        value={`${totalPreventive}%`}
        subtext="Portfolio average"
        size="medium"
      />
    </div>
  );
}
