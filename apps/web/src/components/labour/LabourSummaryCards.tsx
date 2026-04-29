import { KpiCard } from '@/components/common/KpiCard';
import { formatCurrency, formatVariance } from '@hos/shared';
import type { LabourMetrics } from '@hos/shared';

interface Props {
  data: LabourMetrics[];
}

export function LabourSummaryCards({ data }: Props) {
  const totalSched = data.reduce((s, l) => s + l.scheduledHours, 0);
  const totalClocked = data.reduce((s, l) => s + l.clockedHours, 0);
  const totalVariance = totalClocked - totalSched;
  const totalOt = data.reduce((s, l) => s + l.overtimeHours, 0);
  const totalPayroll = data.reduce((s, l) => s + l.payrollCost, 0);

  return (
    <div className="grid grid-cols-5 gap-4">
      <KpiCard
        label="Scheduled Hours"
        value={totalSched.toLocaleString()}
        subtext="bi-weekly period"
        size="medium"
      />
      <KpiCard
        label="Clocked Hours"
        value={totalClocked.toLocaleString()}
        subtext="actual hours worked"
        size="medium"
      />
      <KpiCard
        label="Labour Variance"
        value={formatVariance(totalVariance) + ' hrs'}
        subtext="clocked vs. scheduled"
        trend={totalVariance > 0 ? 'down' : 'up'}
        alert={totalVariance > 200}
        size="medium"
      />
      <KpiCard
        label="Overtime Hours"
        value={totalOt.toLocaleString()}
        subtext="all properties"
        alert={totalOt > 100}
        size="medium"
      />
      <KpiCard
        label="Total Payroll"
        value={formatCurrency(totalPayroll, true)}
        subtext="bi-weekly labour cost"
        size="medium"
      />
    </div>
  );
}
