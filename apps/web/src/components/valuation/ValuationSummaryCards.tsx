import { KpiCard } from '@/components/common/KpiCard';
import { formatCurrencyM } from '@hos/shared';
import type { PropertyValuation } from '@hos/shared';

interface Props {
  valuations: PropertyValuation[];
}

export function ValuationSummaryCards({ valuations }: Props) {
  const totalAssetValue = valuations.reduce((s, v) => s + v.assetValue, 0);
  const totalIncomeValue = valuations.reduce((s, v) => s + v.incomeBasedValue, 0);
  const totalNoi = valuations.reduce((s, v) => s + v.noi, 0);
  const totalDrag = valuations.reduce((s, v) => s + v.capExDragOnValue, 0);

  const ownedValuations = valuations.filter((v) => v.ownership === 'owned');
  const totalOwnedAsset = ownedValuations.reduce((s, v) => s + v.assetValue, 0);
  const totalOwnedPurchase = ownedValuations.reduce((s, v) => s + v.purchasePrice, 0);
  const ownedAppreciationPct = totalOwnedPurchase > 0
    ? Math.round(((totalOwnedAsset - totalOwnedPurchase) / totalOwnedPurchase) * 1000) / 10
    : 0;

  const leasedCount = valuations.length - ownedValuations.length;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
      <KpiCard
        label="Asset Value"
        value={formatCurrencyM(totalAssetValue)}
        subtext={`Land · building · FF&E · inventory${leasedCount > 0 ? ` · ${leasedCount} leased` : ''}`}
        size="medium"
      />
      <KpiCard
        label="Income Valuation"
        value={formatCurrencyM(totalIncomeValue)}
        subtext="NOI ÷ market cap rate"
        size="medium"
      />
      <KpiCard
        label="T12 NOI"
        value={formatCurrencyM(totalNoi)}
        subtext="Net operating income"
        size="medium"
      />
      <KpiCard
        label="Owned Appreciation"
        value={`${ownedAppreciationPct > 0 ? '+' : ''}${ownedAppreciationPct}%`}
        subtext={`Since purchase · ${ownedValuations.length} owned`}
        trend={ownedAppreciationPct >= 25 ? 'up' : ownedAppreciationPct < 10 ? 'down' : 'neutral'}
        size="medium"
      />
      <KpiCard
        label="CapEx Drag"
        value={`-${formatCurrencyM(totalDrag)}`}
        subtext="Deferred maintenance · aging assets"
        alert={totalDrag > 1_000_000}
        size="medium"
      />
    </div>
  );
}
