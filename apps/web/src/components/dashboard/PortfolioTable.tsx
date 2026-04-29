'use client';

import { useState } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import type { Hotel, RevenueSummary } from '@hos/shared';
import { formatCurrency, formatPct } from '@hos/shared';
import { HealthBadge } from '@/components/common/HealthBadge';

interface PortfolioRow {
  hotel: Hotel;
  revenue: RevenueSummary;
}

type SortKey = 'name' | 'rooms' | 'occupancyPct' | 'totalRevenue';
type SortDir = 'asc' | 'desc';

interface PortfolioTableProps {
  rows: PortfolioRow[];
}

function SortIcon({ col, sortKey, sortDir }: { col: SortKey; sortKey: SortKey; sortDir: SortDir }) {
  if (col !== sortKey) return <ChevronsUpDown className="w-3 h-3 opacity-30 inline ml-1" />;
  return sortDir === 'asc'
    ? <ChevronUp className="w-3 h-3 inline ml-1" style={{ color: '#ff385c' }} />
    : <ChevronDown className="w-3 h-3 inline ml-1" style={{ color: '#ff385c' }} />;
}

export function PortfolioTable({ rows }: PortfolioTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const sorted = [...rows].sort((a, b) => {
    let av: string | number = 0, bv: string | number = 0;
    if (sortKey === 'name') { av = a.hotel.name; bv = b.hotel.name; }
    else if (sortKey === 'rooms') { av = a.hotel.rooms; bv = b.hotel.rooms; }
    else if (sortKey === 'occupancyPct') { av = a.revenue.occupancyPct; bv = b.revenue.occupancyPct; }
    else if (sortKey === 'totalRevenue') { av = a.revenue.totalRevenue; bv = b.revenue.totalRevenue; }
    if (av < bv) return sortDir === 'asc' ? -1 : 1;
    if (av > bv) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  const thClass = 'text-left text-xs font-semibold uppercase tracking-wide cursor-pointer select-none py-3 px-4 whitespace-nowrap';

  return (
    <div className="overflow-x-auto rounded-2xl" style={{ border: '1px solid #dddddd', background: '#ffffff' }}>
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr style={{ borderBottom: '1px solid #dddddd', background: '#f7f7f7' }}>
            <th className={thClass} style={{ color: '#6a6a6a' }} onClick={() => handleSort('name')}>
              Property <SortIcon col="name" sortKey={sortKey} sortDir={sortDir} />
            </th>
            <th className={thClass} style={{ color: '#6a6a6a' }} onClick={() => handleSort('rooms')}>
              Rooms <SortIcon col="rooms" sortKey={sortKey} sortDir={sortDir} />
            </th>
            <th className={thClass} style={{ color: '#6a6a6a' }} onClick={() => handleSort('occupancyPct')}>
              Occ % <SortIcon col="occupancyPct" sortKey={sortKey} sortDir={sortDir} />
            </th>
            <th className={thClass} style={{ color: '#6a6a6a' }} onClick={() => handleSort('totalRevenue')}>
              Revenue <SortIcon col="totalRevenue" sortKey={sortKey} sortDir={sortDir} />
            </th>
            <th className={thClass} style={{ color: '#6a6a6a' }}>Health</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((row, i) => (
            <tr
              key={row.hotel.id}
              style={{
                borderBottom: i < sorted.length - 1 ? '1px solid #f0f0f0' : 'none',
              }}
            >
              <td className="py-3 px-4">
                <div>
                  <p className="font-medium text-sm" style={{ color: '#222222' }}>
                    {row.hotel.name}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: '#929292' }}>
                    {row.hotel.city}, {row.hotel.state} · {row.hotel.brand}
                  </p>
                </div>
              </td>
              <td className="py-3 px-4 text-sm font-medium" style={{ color: '#3f3f3f' }}>
                {row.hotel.rooms}
              </td>
              <td className="py-3 px-4 text-sm font-medium" style={{ color: '#3f3f3f' }}>
                {formatPct(row.revenue.occupancyPct, 0)}
              </td>
              <td className="py-3 px-4 text-sm font-medium" style={{ color: '#3f3f3f' }}>
                {formatCurrency(row.revenue.totalRevenue, true)}
              </td>
              <td className="py-3 px-4">
                <HealthBadge health={row.revenue.health} showLabel />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
