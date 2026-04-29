import { KpiCard } from '@/components/common/KpiCard';
import type { LabourMetrics } from '@hos/shared';
import { PORTFOLIO_STLY } from '@hos/shared';

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
    <div className="grid grid-cols-5 gap-3">
      <KpiCard
        label="Scheduled Hours"
        value={totalSched.toLocaleString()}
        change={{ pct: PORTFOLIO_STLY.scheduledHours.changePct, direction: 'up' }}
        stly={PORTFOLIO_STLY.scheduledHours.formattedStly}
      />
      <KpiCard
        label="Clocked Hours"
        value={totalClocked.toLocaleString()}
        change={{ pct: PORTFOLIO_STLY.clockedHours.changePct, direction: 'up' }}
        stly={PORTFOLIO_STLY.clockedHours.formattedStly}
      />
      <KpiCard
        label="Labour Variance"
        value={`+${totalVariance} hrs`}
        change={{ pct: PORTFOLIO_STLY.labourVariance.changePct, direction: 'up' }}
        stly={PORTFOLIO_STLY.labourVariance.formattedStly}
        alert={totalVariance > 200}
      />
      <KpiCard
        label="Overtime Hours"
        value={totalOt.toLocaleString()}
        change={{ pct: PORTFOLIO_STLY.overtimeHours.changePct, direction: 'up' }}
        stly={PORTFOLIO_STLY.overtimeHours.formattedStly}
      />
      <KpiCard
        label="Total Payroll"
        value={`$${(totalPayroll / 1000).toFixed(1)}k`}
        change={{ pct: PORTFOLIO_STLY.payrollCost.changePct, direction: 'up' }}
        stly={PORTFOLIO_STLY.payrollCost.formattedStly}
      />
    </div>
  );
}
