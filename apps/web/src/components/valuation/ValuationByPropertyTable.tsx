'use client';

import { useState } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import type { Hotel, PropertyValuation } from '@hos/shared';
import { formatCurrencyM } from '@hos/shared';

export interface ValuationRow { hotel: Hotel; valuation: PropertyValuation }
type SortKey = 'name' | 'purchasePrice' | 'assetValue' | 'incomeBasedValue' | 'inPlaceCapRate' | 'appreciationYoYPct';
type SortDir = 'asc' | 'desc';

function SortIcon({ col, sortKey, sortDir }: { col: SortKey; sortKey: SortKey; sortDir: SortDir }) {
  if (col !== sortKey) return <ChevronsUpDown className="w-3 h-3 opacity-30 inline ml-1" />;
  return sortDir === 'asc'
    ? <ChevronUp className="w-3 h-3 inline ml-1" style={{ color: '#ff385c' }} />
    : <ChevronDown className="w-3 h-3 inline ml-1" style={{ color: '#ff385c' }} />;
}

function OwnershipPill({ ownership }: { ownership: 'owned' | 'leased' }) {
  if (ownership === 'owned') {
    return (
      <span
        className="inline-flex items-center text-[10px] font-semibold px-1.5 py-0.5 rounded"
        style={{ background: '#eef2ff', color: '#3730a3' }}
      >
        OWNED
      </span>
    );
  }
  return (
    <span
      className="inline-flex items-center text-[10px] font-semibold px-1.5 py-0.5 rounded"
      style={{ background: '#fef3c7', color: '#92400e' }}
    >
      LEASED
    </span>
  );
}

interface Props {
  rows: ValuationRow[];
}

export function ValuationByPropertyTable({ rows }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('assetValue');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('desc'); }
  };

  const sorted = [...rows].sort((a, b) => {
    let av: string | number, bv: string | number;
    if (sortKey === 'name') { av = a.hotel.name; bv = b.hotel.name; }
    else { av = a.valuation[sortKey]; bv = b.valuation[sortKey]; }
    if (av < bv) return sortDir === 'asc' ? -1 : 1;
    if (av > bv) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  const th = 'text-xs font-semibold uppercase tracking-wide cursor-pointer select-none py-3 px-4 whitespace-nowrap';

  return (
    <div className="overflow-x-auto rounded-2xl" style={{ border: '1px solid #dddddd', background: '#ffffff' }}>
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr style={{ borderBottom: '1px solid #dddddd', background: '#f7f7f7' }}>
            <th className={`${th} text-left`} style={{ color: '#6a6a6a' }} onClick={() => handleSort('name')}>
              Property <SortIcon col="name" sortKey={sortKey} sortDir={sortDir} />
            </th>
            <th className={`${th} text-right`} style={{ color: '#6a6a6a' }} onClick={() => handleSort('purchasePrice')}>
              Bought For <SortIcon col="purchasePrice" sortKey={sortKey} sortDir={sortDir} />
            </th>
            <th className={`${th} text-right`} style={{ color: '#6a6a6a' }} onClick={() => handleSort('assetValue')}>
              Asset Value <SortIcon col="assetValue" sortKey={sortKey} sortDir={sortDir} />
            </th>
            <th className={`${th} text-right`} style={{ color: '#6a6a6a' }} onClick={() => handleSort('incomeBasedValue')}>
              Income Valuation <SortIcon col="incomeBasedValue" sortKey={sortKey} sortDir={sortDir} />
            </th>
            <th className={`${th} text-right`} style={{ color: '#6a6a6a' }} onClick={() => handleSort('inPlaceCapRate')}>
              In-Place Cap <SortIcon col="inPlaceCapRate" sortKey={sortKey} sortDir={sortDir} />
            </th>
            <th className={`${th} text-right`} style={{ color: '#6a6a6a' }} onClick={() => handleSort('appreciationYoYPct')}>
              YoY <SortIcon col="appreciationYoYPct" sortKey={sortKey} sortDir={sortDir} />
            </th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((row, i) => {
            const v = row.valuation;
            const yoyColor = v.appreciationYoYPct >= 2.5
              ? '#15803d'
              : v.appreciationYoYPct < 1
                ? '#b45309'
                : '#3f3f3f';
            const incomeVsAsset = v.incomeBasedValue - v.assetValue;
            return (
              <tr key={row.hotel.id} style={{ borderBottom: i < sorted.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm" style={{ color: '#222222' }}>{row.hotel.shortName}</p>
                    <OwnershipPill ownership={v.ownership} />
                  </div>
                  <p className="text-xs mt-0.5" style={{ color: '#929292' }}>
                    {row.hotel.city}, {row.hotel.state} · {row.hotel.rooms} keys · {v.ownership === 'owned' ? 'bought' : 'lease since'} {v.purchaseYear}
                  </p>
                </td>
                <td className="py-3 px-4 text-sm text-right" style={{ color: '#3f3f3f' }}>
                  {formatCurrencyM(v.purchasePrice)}
                  {v.ownership === 'leased' && (
                    <span className="block text-[10px]" style={{ color: '#929292' }}>FF&amp;E + leasehold</span>
                  )}
                </td>
                <td className="py-3 px-4 text-sm text-right font-semibold" style={{ color: '#222222' }}>
                  {formatCurrencyM(v.assetValue)}
                  {v.ownership === 'owned' && (
                    <span className="block text-[10px] font-normal" style={{ color: '#15803d' }}>
                      +{v.appreciationPct}% since buy
                    </span>
                  )}
                </td>
                <td className="py-3 px-4 text-sm text-right font-semibold" style={{ color: '#222222' }}>
                  {formatCurrencyM(v.incomeBasedValue)}
                  <span className="block text-[10px] font-normal" style={{ color: incomeVsAsset >= 0 ? '#15803d' : '#b45309' }}>
                    {incomeVsAsset >= 0 ? '+' : ''}{formatCurrencyM(incomeVsAsset)} vs asset
                  </span>
                </td>
                <td className="py-3 px-4 text-sm text-right" style={{ color: '#3f3f3f' }}>
                  {v.inPlaceCapRate}%
                </td>
                <td className="py-3 px-4 text-sm text-right font-semibold" style={{ color: yoyColor }}>
                  {v.appreciationYoYPct >= 0 ? '+' : ''}{v.appreciationYoYPct}%
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
