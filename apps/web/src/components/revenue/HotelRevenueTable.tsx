'use client';

import { useState } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import type { Hotel, RevenueSummary } from '@hos/shared';
import { formatCurrency, formatPct } from '@hos/shared';
import { HealthBadge } from '@/components/common/HealthBadge';

interface Row { hotel: Hotel; revenue: RevenueSummary }
type SortKey = 'name' | 'occupancyPct' | 'adr' | 'revPar' | 'roomRevenue' | 'nonRoomRevenue' | 'totalRevenue';
type SortDir = 'asc' | 'desc';

function SortIcon({ col, sortKey, sortDir }: { col: SortKey; sortKey: SortKey; sortDir: SortDir }) {
  if (col !== sortKey) return <ChevronsUpDown className="w-3 h-3 opacity-30 inline ml-1" />;
  return sortDir === 'asc'
    ? <ChevronUp className="w-3 h-3 inline ml-1" style={{ color: '#ff385c' }} />
    : <ChevronDown className="w-3 h-3 inline ml-1" style={{ color: '#ff385c' }} />;
}

export function HotelRevenueTable({ rows }: { rows: Row[] }) {
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('asc'); }
  };

  const sorted = [...rows].sort((a, b) => {
    let av: string | number, bv: string | number;
    if (sortKey === 'name') { av = a.hotel.name; bv = b.hotel.name; }
    else if (sortKey === 'occupancyPct') { av = a.revenue.occupancyPct; bv = b.revenue.occupancyPct; }
    else if (sortKey === 'adr') { av = a.revenue.adr; bv = b.revenue.adr; }
    else if (sortKey === 'revPar') { av = a.revenue.revPar; bv = b.revenue.revPar; }
    else if (sortKey === 'roomRevenue') { av = a.revenue.roomRevenue; bv = b.revenue.roomRevenue; }
    else if (sortKey === 'nonRoomRevenue') { av = a.revenue.nonRoomRevenue; bv = b.revenue.nonRoomRevenue; }
    else { av = a.revenue.totalRevenue; bv = b.revenue.totalRevenue; }
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
            <th className={th} style={{ color: '#6a6a6a' }} onClick={() => handleSort('name')}>
              Property <SortIcon col="name" sortKey={sortKey} sortDir={sortDir} />
            </th>
            <th className={th} style={{ color: '#6a6a6a', textAlign: 'right' }}>Rooms</th>
            <th className={th} style={{ color: '#6a6a6a', textAlign: 'right' }} onClick={() => handleSort('occupancyPct')}>
              Occ% <SortIcon col="occupancyPct" sortKey={sortKey} sortDir={sortDir} />
            </th>
            <th className={th} style={{ color: '#6a6a6a', textAlign: 'right' }} onClick={() => handleSort('adr')}>
              ADR <SortIcon col="adr" sortKey={sortKey} sortDir={sortDir} />
            </th>
            <th className={th} style={{ color: '#6a6a6a', textAlign: 'right' }} onClick={() => handleSort('revPar')}>
              RevPAR <SortIcon col="revPar" sortKey={sortKey} sortDir={sortDir} />
            </th>
            <th className={th} style={{ color: '#6a6a6a', textAlign: 'right' }} onClick={() => handleSort('roomRevenue')}>
              Room Rev <SortIcon col="roomRevenue" sortKey={sortKey} sortDir={sortDir} />
            </th>
            <th className={th} style={{ color: '#6a6a6a', textAlign: 'right' }} onClick={() => handleSort('nonRoomRevenue')}>
              Non-Room <SortIcon col="nonRoomRevenue" sortKey={sortKey} sortDir={sortDir} />
            </th>
            <th className={th} style={{ color: '#6a6a6a', textAlign: 'right' }} onClick={() => handleSort('totalRevenue')}>
              Total Rev <SortIcon col="totalRevenue" sortKey={sortKey} sortDir={sortDir} />
            </th>
            <th className={th} style={{ color: '#6a6a6a' }}>Health</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((row, i) => (
            <tr
              key={row.hotel.id}
              style={{ borderBottom: i < sorted.length - 1 ? '1px solid #f0f0f0' : 'none' }}
            >
              <td className="py-3 px-4">
                <p className="font-medium text-sm" style={{ color: '#222222' }}>{row.hotel.shortName}</p>
                <p className="text-xs mt-0.5" style={{ color: '#929292' }}>{row.hotel.city}, {row.hotel.state}</p>
              </td>
              <td className="py-3 px-4 text-sm text-right" style={{ color: '#3f3f3f' }}>{row.hotel.rooms}</td>
              <td className="py-3 px-4 text-sm text-right font-medium" style={{ color: '#3f3f3f' }}>{formatPct(row.revenue.occupancyPct, 0)}</td>
              <td className="py-3 px-4 text-sm text-right font-medium" style={{ color: '#3f3f3f' }}>{formatCurrency(row.revenue.adr)}</td>
              <td className="py-3 px-4 text-sm text-right font-medium" style={{ color: '#3f3f3f' }}>{formatCurrency(row.revenue.revPar)}</td>
              <td className="py-3 px-4 text-sm text-right" style={{ color: '#3f3f3f' }}>{formatCurrency(row.revenue.roomRevenue, true)}</td>
              <td className="py-3 px-4 text-sm text-right" style={{ color: '#3f3f3f' }}>{formatCurrency(row.revenue.nonRoomRevenue, true)}</td>
              <td className="py-3 px-4 text-sm text-right font-semibold" style={{ color: '#222222' }}>{formatCurrency(row.revenue.totalRevenue, true)}</td>
              <td className="py-3 px-4"><HealthBadge health={row.revenue.health} showLabel /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
