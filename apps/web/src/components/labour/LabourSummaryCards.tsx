import { KpiCard } from '@/components/common/KpiCard';
import { formatCurrency, formatVariance } from '@hos/shared';
import type { LabourMetrics } from '@hos/shared';

interface Props {
  data: LabourMetrics[];
  multiplier?: number;
  periodLabel?: string;
}

export function LabourSummaryCards({ data, multiplier = 1, periodLabel = 'bi-weekly period' }: Props) {
  const mult = multiplier;
  const totalSched = Math.round(data.reduce((s, l) => s + l.scheduledHours, 0) * mult);
  const totalClocked = Math.round(data.reduce((s, l) => s + l.clockedHours, 0) * mult);
  const totalVariance = totalClocked - totalSched;
  const totalOt = Math.round(data.reduce((s, l) => s + l.overtimeHours, 0) * mult);
  const totalPayroll = data.reduce((s, l) => s + l.payrollCost, 0) * mult;

  const varAlert = totalVariance > Math.max(50, totalSched * 0.04);
  const otAlert = totalOt > Math.max(40, totalSched * 0.03);

  return (
    <div className="grid grid-cols-5 gap-4">
      <KpiCard label="Scheduled Hours" value={totalSched.toLocaleString()} subtext={periodLabel} size="medium" />
      <KpiCard label="Clocked Hours" value={totalClocked.toLocaleString()} subtext="actual hours worked" size="medium" />
      <KpiCard
        label="Labour Variance"
        value={formatVariance(totalVariance) + ' hrs'}
        subtext="clocked vs. scheduled"
        trend={totalVariance > 0 ? 'down' : 'up'}
        alert={varAlert}
        size="medium"
      />
      <KpiCard label="Overtime Hours" value={totalOt.toLocaleString()} subtext="all properties" alert={otAlert} size="medium" />
      <KpiCard label="Total Payroll" value={formatCurrency(totalPayroll, true)} subtext={`${periodLabel} labour cost`} size="medium" />
    </div>
  );
}
