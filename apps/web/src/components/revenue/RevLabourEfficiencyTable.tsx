import type { Hotel, RevenueSummary, LabourMetrics } from '@hos/shared';
import { formatCurrency, formatPct } from '@hos/shared';

interface Row {
  hotel: Hotel;
  revenue: RevenueSummary;
  labour: LabourMetrics;
}

function PayrollPctBadge({ pct }: { pct: number }) {
  const config =
    pct > 25
      ? { bg: '#fef2f2', text: '#b91c1c' }
      : pct > 20
      ? { bg: '#fffbeb', text: '#b45309' }
      : { bg: '#f0fdf4', text: '#15803d' };
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold"
      style={{ background: config.bg, color: config.text }}
    >
      {formatPct(pct, 1)}
    </span>
  );
}

export function RevLabourEfficiencyTable({ rows }: { rows: Row[] }) {
  const sorted = [...rows].sort((a, b) => {
    const pA = (a.labour.payrollCost / a.revenue.totalRevenue) * 100;
    const pB = (b.labour.payrollCost / b.revenue.totalRevenue) * 100;
    return pB - pA;
  });

  const thBase = 'text-left text-xs font-semibold uppercase tracking-wide py-3 px-4 whitespace-nowrap';

  return (
    <div className="overflow-x-auto rounded-2xl" style={{ border: '1px solid #dddddd', background: '#ffffff' }}>
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr style={{ borderBottom: '1px solid #dddddd', background: '#f7f7f7' }}>
            <th className={thBase} style={{ color: '#6a6a6a' }}>Property</th>
            <th className={thBase} style={{ color: '#6a6a6a', textAlign: 'right' }}>Total Revenue</th>
            <th className={thBase} style={{ color: '#6a6a6a', textAlign: 'right' }}>Payroll Cost</th>
            <th className={thBase} style={{ color: '#6a6a6a', textAlign: 'right' }}>Payroll %</th>
            <th className={thBase} style={{ color: '#6a6a6a', textAlign: 'right' }}>Rev / Labour Hr</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((row, i) => {
            const payrollPct = (row.labour.payrollCost / row.revenue.totalRevenue) * 100;
            const revPerHour = row.revenue.totalRevenue / row.labour.clockedHours;
            return (
              <tr key={row.hotel.id} style={{ borderBottom: i < sorted.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                <td className="py-3 px-4">
                  <p className="font-medium text-sm" style={{ color: '#222222' }}>{row.hotel.shortName}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#929292' }}>{row.hotel.brand}</p>
                </td>
                <td className="py-3 px-4 text-sm text-right font-medium" style={{ color: '#3f3f3f' }}>
                  {formatCurrency(row.revenue.totalRevenue, true)}
                </td>
                <td className="py-3 px-4 text-sm text-right" style={{ color: '#3f3f3f' }}>
                  {formatCurrency(row.labour.payrollCost, true)}
                </td>
                <td className="py-3 px-4 text-right">
                  <PayrollPctBadge pct={payrollPct} />
                </td>
                <td className="py-3 px-4 text-sm text-right font-medium" style={{ color: '#3f3f3f' }}>
                  {formatCurrency(revPerHour)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
