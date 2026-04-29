import type { DepartmentLabour } from '@hos/shared';
import { formatCurrency, formatVariance } from '@hos/shared';

interface Props {
  departments: DepartmentLabour[];
}

export function DepartmentDrilldown({ departments }: Props) {
  const totalSched = departments.reduce((s, d) => s + d.scheduledHours, 0);
  const totalClocked = departments.reduce((s, d) => s + d.clockedHours, 0);
  const totalVariance = totalClocked - totalSched;
  const totalOt = departments.reduce((s, d) => s + d.overtimeHours, 0);
  const totalPayroll = departments.reduce((s, d) => s + (d.payrollCost ?? 0), 0);

  const th = 'text-left text-xs font-semibold uppercase tracking-wide py-2 px-3 whitespace-nowrap';

  return (
    <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #e5e7eb' }}>
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr style={{ background: '#f0f0f0', borderBottom: '1px solid #e5e7eb' }}>
            <th className={th} style={{ color: '#6a6a6a' }}>Department</th>
            <th className={th} style={{ color: '#6a6a6a', textAlign: 'right' }}>Sched</th>
            <th className={th} style={{ color: '#6a6a6a', textAlign: 'right' }}>Clocked</th>
            <th className={th} style={{ color: '#6a6a6a', textAlign: 'right' }}>Variance</th>
            <th className={th} style={{ color: '#6a6a6a', textAlign: 'right' }}>OT Hrs</th>
            <th className={th} style={{ color: '#6a6a6a', textAlign: 'right' }}>Payroll</th>
          </tr>
        </thead>
        <tbody>
          {departments.map((dept, i) => {
            const varColor = dept.variance > 0 ? '#dc2626' : dept.variance < 0 ? '#16a34a' : '#6a6a6a';
            return (
              <tr key={dept.department} style={{ borderBottom: i < departments.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                <td className="py-2 px-3 font-medium text-sm" style={{ color: '#3f3f3f' }}>{dept.department}</td>
                <td className="py-2 px-3 text-sm text-right" style={{ color: '#3f3f3f' }}>{dept.scheduledHours}</td>
                <td className="py-2 px-3 text-sm text-right" style={{ color: '#3f3f3f' }}>{dept.clockedHours}</td>
                <td className="py-2 px-3 text-sm text-right font-semibold" style={{ color: varColor }}>
                  {formatVariance(dept.variance)}
                </td>
                <td className="py-2 px-3 text-sm text-right" style={{ color: dept.overtimeHours > 5 ? '#dc2626' : '#3f3f3f' }}>
                  {dept.overtimeHours}
                </td>
                <td className="py-2 px-3 text-sm text-right" style={{ color: '#3f3f3f' }}>
                  {dept.payrollCost != null ? formatCurrency(dept.payrollCost, true) : '—'}
                </td>
              </tr>
            );
          })}
          {/* Totals row */}
          <tr style={{ borderTop: '1px solid #e5e7eb', background: '#f7f7f7' }}>
            <td className="py-2 px-3 text-xs font-bold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>Total</td>
            <td className="py-2 px-3 text-sm text-right font-bold" style={{ color: '#222222' }}>{totalSched}</td>
            <td className="py-2 px-3 text-sm text-right font-bold" style={{ color: '#222222' }}>{totalClocked}</td>
            <td className="py-2 px-3 text-sm text-right font-bold" style={{ color: totalVariance > 0 ? '#dc2626' : '#16a34a' }}>
              {formatVariance(totalVariance)}
            </td>
            <td className="py-2 px-3 text-sm text-right font-bold" style={{ color: '#222222' }}>{totalOt}</td>
            <td className="py-2 px-3 text-sm text-right font-bold" style={{ color: '#222222' }}>
              {formatCurrency(totalPayroll, true)}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
