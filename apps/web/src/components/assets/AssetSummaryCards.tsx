import { KpiCard } from '@/components/common/KpiCard';
import { formatCurrency, PORTFOLIO_STLY } from '@hos/shared';
import type { AssetHotelSummary } from '@hos/shared';

interface Props {
  summaries: AssetHotelSummary[];
}

export function AssetSummaryCards({ summaries }: Props) {
  const totalValue = summaries.reduce((s, r) => s + r.totalValue, 0);
  const totalAging = summaries.reduce((s, r) => s + r.agingAssets, 0);
  const totalFailing = summaries.reduce((s, r) => s + r.failingAssets, 0);
  const ytdSpend = summaries.reduce((s, r) => s + r.ytdSpend, 0);
  const totalPreventive = summaries.length > 0
    ? Math.round(summaries.reduce((s, r) => s + r.preventiveCompliancePct, 0) / summaries.length)
    : 0;

  return (
    <div className="grid grid-cols-5 gap-3">
      <KpiCard
        label="Total Asset Value"
        value={formatCurrency(totalValue, true)}
        change={{ pct: PORTFOLIO_STLY.totalAssetValue.changePct, direction: 'up' }}
        stly={PORTFOLIO_STLY.totalAssetValue.formattedStly}
      />
      <KpiCard
        label="Aging Assets"
        value={totalAging.toString()}
        change={{ pct: 8.2, direction: 'up' }}
        stly="68"
        alert={totalAging > 20}
      />
      <KpiCard
        label="Failing / Poor"
        value={totalFailing.toString()}
        change={{ pct: 14.6, direction: 'up' }}
        stly="9"
        alert={totalFailing > 10}
      />
      <KpiCard
        label="YTD Repair Spend"
        value={formatCurrency(ytdSpend, true)}
        change={{ pct: PORTFOLIO_STLY.ytdRepairSpend.changePct, direction: 'up' }}
        stly={PORTFOLIO_STLY.ytdRepairSpend.formattedStly}
      />
      <KpiCard
        label="Preventive Compliance"
        value={`${totalPreventive}%`}
        change={{ pct: -6.4, direction: 'down' }}
        stly="43%"
      />
    </div>
  );
}
