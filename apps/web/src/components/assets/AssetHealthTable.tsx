'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronUp, ChevronDown, ChevronsUpDown, ChevronRight } from 'lucide-react';
import type { Hotel, AssetHotelSummary } from '@hos/shared';
import { formatCurrency } from '@hos/shared';
import { HealthBadge } from '@/components/common/HealthBadge';

interface Row { hotel: Hotel; summary: AssetHotelSummary }
type SortKey = 'name' | 'totalAssets' | 'agingAssets' | 'failingAssets' | 'ytdSpend' | 'preventiveCompliancePct';
type SortDir = 'asc' | 'desc';

function SortIcon({ col, sortKey, sortDir }: { col: SortKey; sortKey: SortKey; sortDir: SortDir }) {
  if (col !== sortKey) return <ChevronsUpDown className="w-3 h-3 opacity-30 inline ml-1" />;
  return sortDir === 'asc'
    ? <ChevronUp className="w-3 h-3 inline ml-1" style={{ color: '#ff385c' }} />
    : <ChevronDown className="w-3 h-3 inline ml-1" style={{ color: '#ff385c' }} />;
}

interface AssetHealthTableProps {
  rows: Row[];
  /** When provided, each row gets a "View" link to `${hrefPrefix}/${hotelId}` */
  hrefPrefix?: string;
}

export function AssetHealthTable({ rows, hrefPrefix }: AssetHealthTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('failingAssets');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('desc'); }
  };

  const sorted = [...rows].sort((a, b) => {
    let av: string | number, bv: string | number;
    if (sortKey === 'name') { av = a.hotel.name; bv = b.hotel.name; }
    else if (sortKey === 'totalAssets') { av = a.summary.totalAssets; bv = b.summary.totalAssets; }
    else if (sortKey === 'agingAssets') { av = a.summary.agingAssets; bv = b.summary.agingAssets; }
    else if (sortKey === 'failingAssets') { av = a.summary.failingAssets; bv = b.summary.failingAssets; }
    else if (sortKey === 'ytdSpend') { av = a.summary.ytdSpend; bv = b.summary.ytdSpend; }
    else { av = a.summary.preventiveCompliancePct; bv = b.summary.preventiveCompliancePct; }
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
            <th className={th} style={{ color: '#6a6a6a', textAlign: 'right' }} onClick={() => handleSort('totalAssets')}>
              Assets <SortIcon col="totalAssets" sortKey={sortKey} sortDir={sortDir} />
            </th>
            <th className={th} style={{ color: '#6a6a6a', textAlign: 'right' }} onClick={() => handleSort('agingAssets')}>
              Aging <SortIcon col="agingAssets" sortKey={sortKey} sortDir={sortDir} />
            </th>
            <th className={th} style={{ color: '#6a6a6a', textAlign: 'right' }} onClick={() => handleSort('failingAssets')}>
              Failing <SortIcon col="failingAssets" sortKey={sortKey} sortDir={sortDir} />
            </th>
            <th className={th} style={{ color: '#6a6a6a', textAlign: 'right' }} onClick={() => handleSort('ytdSpend')}>
              YTD Spend <SortIcon col="ytdSpend" sortKey={sortKey} sortDir={sortDir} />
            </th>
            <th className={th} style={{ color: '#6a6a6a', textAlign: 'right' }} onClick={() => handleSort('preventiveCompliancePct')}>
              Preventive % <SortIcon col="preventiveCompliancePct" sortKey={sortKey} sortDir={sortDir} />
            </th>
            <th className={th} style={{ color: '#6a6a6a' }}>Health</th>
            {hrefPrefix && <th className={th} />}
          </tr>
        </thead>
        <tbody>
          {sorted.map((row, i) => (
            <tr
              key={row.hotel.id}
              className={hrefPrefix ? 'cursor-pointer hover:bg-[#fafafa] transition-colors' : ''}
              style={{ borderBottom: i < sorted.length - 1 ? '1px solid #f0f0f0' : 'none' }}
            >
              <td className="py-3 px-4">
                <p className="font-medium text-sm" style={{ color: '#222222' }}>{row.hotel.shortName}</p>
                <p className="text-xs mt-0.5" style={{ color: '#929292' }}>{row.hotel.city}, {row.hotel.state}</p>
              </td>
              <td className="py-3 px-4 text-sm text-right" style={{ color: '#3f3f3f' }}>{row.summary.totalAssets}</td>
              <td className="py-3 px-4 text-sm text-right font-medium" style={{ color: row.summary.agingAssets > 2 ? '#b45309' : '#3f3f3f' }}>
                {row.summary.agingAssets}
              </td>
              <td className="py-3 px-4 text-sm text-right font-semibold" style={{ color: row.summary.failingAssets > 0 ? '#b91c1c' : '#3f3f3f' }}>
                {row.summary.failingAssets}
              </td>
              <td className="py-3 px-4 text-sm text-right" style={{ color: '#3f3f3f' }}>{formatCurrency(row.summary.ytdSpend, true)}</td>
              <td className="py-3 px-4 text-sm text-right" style={{ color: row.summary.preventiveCompliancePct < 40 ? '#b91c1c' : row.summary.preventiveCompliancePct < 60 ? '#b45309' : '#15803d' }}>
                {row.summary.preventiveCompliancePct}%
              </td>
              <td className="py-3 px-4"><HealthBadge health={row.summary.health} showLabel /></td>
              {hrefPrefix && (
                <td className="py-3 px-4 text-right">
                  <Link
                    href={`${hrefPrefix}/${row.hotel.id}`}
                    className="inline-flex items-center gap-0.5 text-xs font-semibold hover:underline"
                    style={{ color: '#ff385c' }}
                  >
                    View <ChevronRight className="w-3 h-3" />
                  </Link>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
