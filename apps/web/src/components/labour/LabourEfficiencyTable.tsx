import type { Hotel, RevenueSummary, LabourMetrics } from '@hos/shared';
import { formatCurrency, formatPct } from '@hos/shared';
import { HealthBadge } from '@/components/common/HealthBadge';

interface Row {
  hotel: Hotel;
  revenue: RevenueSummary;
  labour: LabourMetrics;
}

export function LabourEfficiencyTable({ rows }: { rows: Row[] }) {
  const sorted = [...rows].sort((a, b) => {
    const revA = a.revenue.totalRevenue / a.labour.clockedHours;
    const revB = b.revenue.totalRevenue / b.labour.clockedHours;
    return revB - revA;
  });

  const thBase = 'text-left text-xs font-semibold uppercase tracking-wide py-3 px-4 whitespace-nowrap';

  return (
    <div className="overflow-x-auto rounded-2xl" style={{ border: '1px solid #dddddd', background: '#ffffff' }}>
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr style={{ borderBottom: '1px solid #dddddd', background: '#f7f7f7' }}>
            <th className={thBase} style={{ color: '#6a6a6a' }}>Property</th>
            <th className={thBase} style={{ color: '#6a6a6a', textAlign: 'right' }}>Rev / Clocked Hr</th>
            <th className={thBase} style={{ color: '#6a6a6a', textAlign: 'right' }}>Payroll / Avail Room</th>
            <th className={thBase} style={{ color: '#6a6a6a', textAlign: 'right' }}>Payroll %</th>
            <th className={thBase} style={{ color: '#6a6a6a' }}>Health</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((row, i) => {
            const revPerHour = row.revenue.totalRevenue / row.labour.clockedHours;
            const payrollPerRoom = row.labour.payrollCost / row.hotel.rooms;
            const payrollPct = (row.labour.payrollCost / row.revenue.totalRevenue) * 100;
            return (
              <tr key={row.hotel.id} style={{ borderBottom: i < sorted.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                <td className="py-3 px-4">
                  <p className="font-medium text-sm" style={{ color: '#222222' }}>{row.hotel.shortName}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#929292' }}>{row.hotel.brand} · {row.hotel.rooms} rooms</p>
                </td>
                <td className="py-3 px-4 text-sm text-right font-medium" style={{ color: '#222222' }}>
                  {formatCurrency(revPerHour)}
                </td>
                <td className="py-3 px-4 text-sm text-right" style={{ color: '#3f3f3f' }}>
                  {formatCurrency(payrollPerRoom)}
                </td>
                <td className="py-3 px-4 text-sm text-right" style={{ color: payrollPct > 25 ? '#dc2626' : payrollPct > 20 ? '#b45309' : '#15803d' }}>
                  {formatPct(payrollPct, 1)}
                </td>
                <td className="py-3 px-4"><HealthBadge health={row.labour.health} showLabel /></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
