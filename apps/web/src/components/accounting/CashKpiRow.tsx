import { KpiCard } from '@/components/common/KpiCard';
import { formatCurrencyM } from '@hos/shared';

interface Props {
  totalCash: number;
  apOpen: number;
  apOverdue: number;
  netChangeMtd: number;
  unreconciledCount: number;
}

export function CashKpiRow({ totalCash, apOpen, apOverdue, netChangeMtd, unreconciledCount }: Props) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
      <KpiCard
        label="Cash on Hand"
        value={formatCurrencyM(totalCash)}
        subtext="Operating accounts · all hotels"
        size="medium"
      />
      <KpiCard
        label="AP Open"
        value={formatCurrencyM(apOpen)}
        subtext="Bills due, not yet paid"
        size="medium"
      />
      <KpiCard
        label="AP Overdue"
        value={formatCurrencyM(apOverdue)}
        subtext="Past due date"
        alert={apOverdue > 0}
        size="medium"
      />
      <KpiCard
        label="Net Change (period)"
        value={`${netChangeMtd >= 0 ? '+' : ''}${formatCurrencyM(netChangeMtd)}`}
        subtext="Inflows − outflows in window"
        trend={netChangeMtd > 0 ? 'up' : netChangeMtd < 0 ? 'down' : 'neutral'}
        size="medium"
      />
      <KpiCard
        label="Unreconciled"
        value={unreconciledCount.toString()}
        subtext="Imported rows awaiting match"
        alert={unreconciledCount > 25}
        size="medium"
      />
    </div>
  );
}
