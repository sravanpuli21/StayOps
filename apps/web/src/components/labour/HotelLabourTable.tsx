'use client';

import { useState } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown, ChevronRight } from 'lucide-react';
import type { Hotel, LabourMetrics } from '@hos/shared';
import { formatCurrency, formatVariance, formatPct } from '@hos/shared';
import { HealthBadge } from '@/components/common/HealthBadge';
import { DepartmentDrilldown } from './DepartmentDrilldown';

interface Row { hotel: Hotel; labour: LabourMetrics; revenueTotalForPayrollPct: number }
type SortKey = 'name' | 'scheduledHours' | 'clockedHours' | 'variance' | 'overtimeHours' | 'payrollCost';
type SortDir = 'asc' | 'desc';

function SortIcon({ col, sortKey, sortDir }: { col: SortKey; sortKey: SortKey; sortDir: SortDir }) {
  if (col !== sortKey) return <ChevronsUpDown className="w-3 h-3 opacity-30 inline ml-1" />;
  return sortDir === 'asc'
    ? <ChevronUp className="w-3 h-3 inline ml-1" style={{ color: '#ff385c' }} />
    : <ChevronDown className="w-3 h-3 inline ml-1" style={{ color: '#ff385c' }} />;
}

export function HotelLabourTable({ rows }: { rows: Row[] }) {
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('asc'); }
  };

  const sorted = [...rows].sort((a, b) => {
    let av: string | number, bv: string | number;
    if (sortKey === 'name') { av = a.hotel.name; bv = b.hotel.name; }
    else if (sortKey === 'scheduledHours') { av = a.labour.scheduledHours; bv = b.labour.scheduledHours; }
    else if (sortKey === 'clockedHours') { av = a.labour.clockedHours; bv = b.labour.clockedHours; }
    else if (sortKey === 'variance') { av = a.labour.variance; bv = b.labour.variance; }
    else if (sortKey === 'overtimeHours') { av = a.labour.overtimeHours; bv = b.labour.overtimeHours; }
    else { av = a.labour.payrollCost; bv = b.labour.payrollCost; }
    if (av < bv) return sortDir === 'asc' ? -1 : 1;
    if (av > bv) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  const th = 'text-left text-xs font-semibold uppercase tracking-wide cursor-pointer select-none py-3 px-4 whitespace-nowrap';

  return (
    <div className="overflow-x-auto rounded-2xl" style={{ border: '1px solid #dddddd', background: '#ffffff' }}>
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr style={{ borderBottom: '1px solid #dddddd', background: '#f7f7f7' }}>
            <th className="py-3 px-4 w-8" />
            <th className={th} style={{ color: '#6a6a6a' }} onClick={() => handleSort('name')}>
              Property <SortIcon col="name" sortKey={sortKey} sortDir={sortDir} />
            </th>
            <th className={th} style={{ color: '#6a6a6a', textAlign: 'right' }} onClick={() => handleSort('scheduledHours')}>
              Sched Hrs <SortIcon col="scheduledHours" sortKey={sortKey} sortDir={sortDir} />
            </th>
            <th className={th} style={{ color: '#6a6a6a', textAlign: 'right' }} onClick={() => handleSort('clockedHours')}>
              Clocked Hrs <SortIcon col="clockedHours" sortKey={sortKey} sortDir={sortDir} />
            </th>
            <th className={th} style={{ color: '#6a6a6a', textAlign: 'right' }} onClick={() => handleSort('variance')}>
              Variance <SortIcon col="variance" sortKey={sortKey} sortDir={sortDir} />
            </th>
            <th className={th} style={{ color: '#6a6a6a', textAlign: 'right' }} onClick={() => handleSort('overtimeHours')}>
              OT Hrs <SortIcon col="overtimeHours" sortKey={sortKey} sortDir={sortDir} />
            </th>
            <th className={th} style={{ color: '#6a6a6a', textAlign: 'right' }} onClick={() => handleSort('payrollCost')}>
              Payroll <SortIcon col="payrollCost" sortKey={sortKey} sortDir={sortDir} />
            </th>
            <th className={th} style={{ color: '#6a6a6a', textAlign: 'right' }}>Payroll %</th>
            <th className={th} style={{ color: '#6a6a6a' }}>Health</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((row, i) => {
            const isExpanded = expandedId === row.hotel.id;
            const payrollPct = row.revenueTotalForPayrollPct > 0
              ? (row.labour.payrollCost / row.revenueTotalForPayrollPct) * 100
              : 0;
            const varColor = row.labour.variance > 0 ? '#dc2626' : '#16a34a';
            const isLast = i === sorted.length - 1 && !isExpanded;
            return (
              <>
                <tr
                  key={row.hotel.id}
                  style={{
                    borderBottom: isExpanded ? 'none' : (i < sorted.length - 1 ? '1px solid #f0f0f0' : 'none'),
                    cursor: 'pointer',
                    background: isExpanded ? '#fafafa' : undefined,
                  }}
                  onClick={() => setExpandedId(isExpanded ? null : row.hotel.id)}
                >
                  <td className="py-3 px-4">
                    <ChevronRight
                      className="w-3.5 h-3.5 transition-transform"
                      style={{
                        color: '#929292',
                        transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                      }}
                    />
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-medium text-sm" style={{ color: '#222222' }}>{row.hotel.shortName}</p>
                    <p className="text-xs mt-0.5" style={{ color: '#929292' }}>{row.hotel.city}, {row.hotel.state}</p>
                  </td>
                  <td className="py-3 px-4 text-sm text-right" style={{ color: '#3f3f3f' }}>{row.labour.scheduledHours.toLocaleString()}</td>
                  <td className="py-3 px-4 text-sm text-right" style={{ color: '#3f3f3f' }}>{row.labour.clockedHours.toLocaleString()}</td>
                  <td className="py-3 px-4 text-sm text-right font-semibold" style={{ color: varColor }}>
                    {formatVariance(row.labour.variance)}
                  </td>
                  <td className="py-3 px-4 text-sm text-right" style={{ color: row.labour.overtimeHours > 15 ? '#dc2626' : '#3f3f3f' }}>
                    {row.labour.overtimeHours}
                  </td>
                  <td className="py-3 px-4 text-sm text-right font-medium" style={{ color: '#3f3f3f' }}>
                    {formatCurrency(row.labour.payrollCost, true)}
                  </td>
                  <td className="py-3 px-4 text-sm text-right" style={{ color: payrollPct > 25 ? '#dc2626' : payrollPct > 20 ? '#b45309' : '#3f3f3f' }}>
                    {formatPct(payrollPct, 1)}
                  </td>
                  <td className="py-3 px-4"><HealthBadge health={row.labour.health} showLabel /></td>
                </tr>
                {isExpanded && (
                  <tr key={`${row.hotel.id}-drill`} style={{ borderBottom: i < sorted.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                    <td colSpan={9} className="px-4 pb-4 pt-0" style={{ background: '#fafafa' }}>
                      <DepartmentDrilldown departments={row.labour.departments} />
                    </td>
                  </tr>
                )}
              </>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
