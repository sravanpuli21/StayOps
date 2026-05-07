'use client';

import { useEffect, useState } from 'react';
import { ChevronRight, ChevronUp, ChevronDown, ChevronsUpDown, Sunrise, Sunset, FileSpreadsheet, Printer } from 'lucide-react';
import {
  HOTELS,
  REGIONAL_ROSTER,
  AM_PM_REPORT_AM,
  AM_PM_REPORT_PM,
  formatCurrency,
  formatPct,
  type AmPmSnapshot,
  type Hotel,
} from '@hos/shared';
import { exportAmPmReportXlsx } from '@/lib/export-am-pm-xlsx';
import { useHotelFilter } from '@/lib/hotel-filter-context';
import { PrintableAmPmReport } from './PrintableAmPmReport';

type Slot = 'AM' | 'PM';
type SortKey = 'name' | 'totalRooms' | 'leftToSell' | 'adr' | 'avgPrice' | 'revPar' | 'occupancyPct';
type SortDir = 'asc' | 'desc';

function SortIcon({ col, sortKey, sortDir }: { col: SortKey; sortKey: SortKey; sortDir: SortDir }) {
  if (col !== sortKey) return <ChevronsUpDown className="w-3 h-3 opacity-30 inline ml-1" />;
  return sortDir === 'asc'
    ? <ChevronUp className="w-3 h-3 inline ml-1" style={{ color: '#ff385c' }} />
    : <ChevronDown className="w-3 h-3 inline ml-1" style={{ color: '#ff385c' }} />;
}

function RoomTypeBreakdown({ snapshot }: { snapshot: AmPmSnapshot }) {
  const th = 'text-left text-xs font-semibold uppercase tracking-wide py-2 px-3 whitespace-nowrap';
  return (
    <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #e5e7eb' }}>
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr style={{ background: '#f0f0f0', borderBottom: '1px solid #e5e7eb' }}>
            <th className={th} style={{ color: '#6a6a6a' }}>Room Type</th>
            <th className={th} style={{ color: '#6a6a6a', textAlign: 'right' }}>Code</th>
            <th className={th} style={{ color: '#6a6a6a', textAlign: 'right' }}># Rooms</th>
            <th className={th} style={{ color: '#6a6a6a', textAlign: 'right' }}>Sold</th>
            <th className={th} style={{ color: '#6a6a6a', textAlign: 'right' }}>OOO</th>
            <th className={th} style={{ color: '#6a6a6a', textAlign: 'right' }}>Left to Sell</th>
            <th className={th} style={{ color: '#6a6a6a', textAlign: 'right' }}>ADR</th>
            <th className={th} style={{ color: '#6a6a6a', textAlign: 'right' }}>Avg Price</th>
            <th className={th} style={{ color: '#6a6a6a', textAlign: 'right' }}>RevPAR</th>
            <th className={th} style={{ color: '#6a6a6a', textAlign: 'right' }}>Occupancy</th>
          </tr>
        </thead>
        <tbody>
          {snapshot.roomTypes.map((rt, i) => (
            <tr
              key={rt.type}
              style={{ borderBottom: i < snapshot.roomTypes.length - 1 ? '1px solid #f0f0f0' : 'none' }}
            >
              <td className="py-2 px-3 text-sm" style={{ color: '#222222' }}>{rt.label}</td>
              <td className="py-2 px-3 text-xs font-mono text-right" style={{ color: '#929292' }}>{rt.type}</td>
              <td className="py-2 px-3 text-sm text-right" style={{ color: '#3f3f3f' }}>{rt.total}</td>
              <td className="py-2 px-3 text-sm text-right" style={{ color: '#3f3f3f' }}>{rt.sold}</td>
              <td className="py-2 px-3 text-sm text-right" style={{ color: rt.ooo > 0 ? '#b45309' : '#929292' }}>{rt.ooo}</td>
              <td className="py-2 px-3 text-sm text-right font-medium" style={{ color: rt.leftToSell > 0 ? '#16a34a' : '#929292' }}>{rt.leftToSell}</td>
              <td className="py-2 px-3 text-sm text-right" style={{ color: '#3f3f3f' }}>{formatCurrency(rt.adr)}</td>
              <td className="py-2 px-3 text-sm text-right" style={{ color: '#3f3f3f' }}>{formatCurrency(rt.avgPrice)}</td>
              <td className="py-2 px-3 text-sm text-right" style={{ color: '#3f3f3f' }}>{formatCurrency(rt.revPar)}</td>
              <td className="py-2 px-3 text-sm text-right font-medium" style={{ color: '#3f3f3f' }}>{formatPct(rt.occupancyPct, 0)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface Row { hotel: Hotel; snapshot: AmPmSnapshot }

function ReportTable({ rows }: { rows: Row[] }) {
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const soleHotelId = rows.length === 1 ? rows[0].hotel.id : null;
  useEffect(() => {
    if (soleHotelId) setExpandedId(soleHotelId);
  }, [soleHotelId]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('asc'); }
  };

  const sorted = [...rows].sort((a, b) => {
    let av: string | number, bv: string | number;
    if (sortKey === 'name') { av = a.hotel.shortName; bv = b.hotel.shortName; }
    else if (sortKey === 'totalRooms') { av = a.snapshot.totalRooms; bv = b.snapshot.totalRooms; }
    else if (sortKey === 'leftToSell') { av = a.snapshot.roomsLeftToSell; bv = b.snapshot.roomsLeftToSell; }
    else if (sortKey === 'adr') { av = a.snapshot.adr; bv = b.snapshot.adr; }
    else if (sortKey === 'avgPrice') { av = a.snapshot.avgPrice; bv = b.snapshot.avgPrice; }
    else if (sortKey === 'revPar') { av = a.snapshot.revPar; bv = b.snapshot.revPar; }
    else { av = a.snapshot.occupancyPct; bv = b.snapshot.occupancyPct; }
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
            <th className={th} style={{ color: '#6a6a6a', textAlign: 'right' }} onClick={() => handleSort('totalRooms')}>
              # Rooms <SortIcon col="totalRooms" sortKey={sortKey} sortDir={sortDir} />
            </th>
            <th className={th} style={{ color: '#6a6a6a', textAlign: 'right' }} onClick={() => handleSort('leftToSell')}>
              Left to Sell <SortIcon col="leftToSell" sortKey={sortKey} sortDir={sortDir} />
            </th>
            <th className={th} style={{ color: '#6a6a6a', textAlign: 'right' }} onClick={() => handleSort('adr')}>
              ADR <SortIcon col="adr" sortKey={sortKey} sortDir={sortDir} />
            </th>
            <th className={th} style={{ color: '#6a6a6a', textAlign: 'right' }} onClick={() => handleSort('avgPrice')}>
              Avg Price <SortIcon col="avgPrice" sortKey={sortKey} sortDir={sortDir} />
            </th>
            <th className={th} style={{ color: '#6a6a6a', textAlign: 'right' }} onClick={() => handleSort('revPar')}>
              RevPAR <SortIcon col="revPar" sortKey={sortKey} sortDir={sortDir} />
            </th>
            <th className={th} style={{ color: '#6a6a6a', textAlign: 'right' }} onClick={() => handleSort('occupancyPct')}>
              Occupancy <SortIcon col="occupancyPct" sortKey={sortKey} sortDir={sortDir} />
            </th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((row, i) => {
            const isExpanded = expandedId === row.hotel.id;
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
                  <td className="py-3 px-4 text-sm text-right" style={{ color: '#3f3f3f' }}>
                    {row.snapshot.totalRooms}
                    {row.snapshot.roomsOoo > 0 && (
                      <span className="block text-[10px] font-medium mt-0.5" style={{ color: '#b45309' }}>
                        {row.snapshot.roomsOoo} OOO
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-sm text-right font-semibold" style={{ color: row.snapshot.roomsLeftToSell === 0 ? '#16a34a' : row.snapshot.roomsLeftToSell > row.snapshot.totalRooms * 0.25 ? '#b45309' : '#3f3f3f' }}>
                    {row.snapshot.roomsLeftToSell}
                  </td>
                  <td className="py-3 px-4 text-sm text-right" style={{ color: '#3f3f3f' }}>{formatCurrency(row.snapshot.adr)}</td>
                  <td className="py-3 px-4 text-sm text-right" style={{ color: '#3f3f3f' }}>{formatCurrency(row.snapshot.avgPrice)}</td>
                  <td className="py-3 px-4 text-sm text-right font-medium" style={{ color: '#3f3f3f' }}>{formatCurrency(row.snapshot.revPar)}</td>
                  <td className="py-3 px-4 text-sm text-right font-semibold" style={{ color: row.snapshot.occupancyPct >= 85 ? '#16a34a' : row.snapshot.occupancyPct >= 70 ? '#3f3f3f' : '#b45309' }}>
                    {formatPct(row.snapshot.occupancyPct, 0)}
                  </td>
                </tr>
                {isExpanded && (
                  <tr key={`${row.hotel.id}-drill`} style={{ borderBottom: i < sorted.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                    <td colSpan={8} className="px-4 pb-4 pt-0" style={{ background: '#fafafa' }}>
                      <RoomTypeBreakdown snapshot={row.snapshot} />
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

interface AmPmReportClientProps {
  territoryIds?: readonly string[];
  scopeLabel?: string;
}

export function AmPmReportClient({ territoryIds, scopeLabel = 'All Hotels' }: AmPmReportClientProps = {}) {
  const [slot, setSlot] = useState<Slot>('AM');
  const fullReport = slot === 'AM' ? AM_PM_REPORT_AM : AM_PM_REPORT_PM;
  const { selection } = useHotelFilter();

  let effectiveIds: readonly string[];
  let effectiveScopeLabel: string;

  if (selection.kind === 'all') {
    effectiveIds = HOTELS.map((h) => h.id);
    effectiveScopeLabel = 'All Hotels';
  } else if (selection.kind === 'my-territory') {
    effectiveIds = territoryIds ?? HOTELS.map((h) => h.id);
    effectiveScopeLabel = territoryIds ? scopeLabel : 'All Hotels';
  } else if (selection.kind === 'regional') {
    const regional = REGIONAL_ROSTER.find((r) => r.id === selection.regionalId);
    effectiveIds = regional ? regional.hotelIds : HOTELS.map((h) => h.id);
    effectiveScopeLabel = regional ? `${regional.name.split(' ')[0]}'s Hotels` : 'All Hotels';
  } else {
    effectiveIds = [selection.hotelId];
    const hotel = HOTELS.find((h) => h.id === selection.hotelId);
    effectiveScopeLabel = hotel ? hotel.shortName : selection.hotelId;
  }

  const scopedHotels = HOTELS.filter((h) => effectiveIds.includes(h.id));
  const report = {
    ...fullReport,
    rows: fullReport.rows.filter((r) => effectiveIds.includes(r.hotelId)),
  };

  const rows: Row[] = scopedHotels.map((hotel) => {
    const snapshot = report.rows.find((s) => s.hotelId === hotel.id)!;
    return { hotel, snapshot };
  });

  const totalRooms = rows.reduce((s, r) => s + r.snapshot.totalRooms, 0);
  const totalSold = rows.reduce((s, r) => s + r.snapshot.roomsSold, 0);
  const totalOoo = rows.reduce((s, r) => s + r.snapshot.roomsOoo, 0);
  const totalLeftToSell = rows.reduce((s, r) => s + r.snapshot.roomsLeftToSell, 0);
  const sellable = Math.max(1, totalRooms - totalOoo);
  const portfolioOcc = (totalSold / sellable) * 100;
  const portfolioAdr = Math.round(
    rows.reduce((s, r) => s + r.snapshot.adr * r.snapshot.roomsSold, 0) / Math.max(1, totalSold),
  );
  const portfolioRevPar = Math.round(portfolioAdr * (portfolioOcc / 100));

  return (
    <div className="flex flex-col gap-6">
      {/* Slot toggle + summary stats + actions — all hidden on print */}
      <div className="no-print flex items-center justify-between gap-4 flex-wrap">
        <div
          className="inline-flex rounded-xl p-1"
          style={{ background: '#f7f7f7', border: '1px solid #dddddd' }}
        >
          <button
            onClick={() => setSlot('AM')}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors"
            style={{
              background: slot === 'AM' ? '#ffffff' : 'transparent',
              color: slot === 'AM' ? '#ff385c' : '#6a6a6a',
              boxShadow: slot === 'AM' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
            }}
          >
            <Sunrise className="w-3.5 h-3.5" />
            9:00 AM
          </button>
          <button
            onClick={() => setSlot('PM')}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors"
            style={{
              background: slot === 'PM' ? '#ffffff' : 'transparent',
              color: slot === 'PM' ? '#ff385c' : '#6a6a6a',
              boxShadow: slot === 'PM' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
            }}
          >
            <Sunset className="w-3.5 h-3.5" />
            5:00 PM
          </button>
        </div>

        <div className="flex items-center gap-6 text-xs" style={{ color: '#6a6a6a' }}>
          <div>
            <span className="block text-[10px] uppercase tracking-wide" style={{ color: '#929292' }}>Portfolio Occ</span>
            <span className="text-sm font-semibold" style={{ color: '#222222' }}>{formatPct(portfolioOcc, 1)}</span>
          </div>
          <div>
            <span className="block text-[10px] uppercase tracking-wide" style={{ color: '#929292' }}>Portfolio ADR</span>
            <span className="text-sm font-semibold" style={{ color: '#222222' }}>{formatCurrency(portfolioAdr)}</span>
          </div>
          <div>
            <span className="block text-[10px] uppercase tracking-wide" style={{ color: '#929292' }}>Portfolio RevPAR</span>
            <span className="text-sm font-semibold" style={{ color: '#222222' }}>{formatCurrency(portfolioRevPar)}</span>
          </div>
          <div>
            <span className="block text-[10px] uppercase tracking-wide" style={{ color: '#929292' }}>Rooms Sold</span>
            <span className="text-sm font-semibold" style={{ color: '#222222' }}>{totalSold} / {totalRooms}</span>
          </div>
          <div>
            <span className="block text-[10px] uppercase tracking-wide" style={{ color: '#929292' }}>Left to Sell</span>
            <span className="text-sm font-semibold" style={{ color: '#222222' }}>
              {totalLeftToSell}
              {totalOoo > 0 && (
                <span className="text-[10px] font-medium ml-1.5" style={{ color: '#b45309' }}>
                  ({totalOoo} OOO excl.)
                </span>
              )}
            </span>
          </div>

          <button
            onClick={() => window.print()}
            className="no-print inline-flex items-center gap-1.5 h-9 px-3 rounded-xl text-xs font-semibold transition-colors"
            style={{ background: '#ffffff', color: '#222', border: '1px solid #dddddd' }}
          >
            <Printer className="w-3.5 h-3.5" />
            Print
          </button>

          <button
            onClick={() => exportAmPmReportXlsx(report, scopedHotels, effectiveScopeLabel)}
            className="no-print inline-flex items-center gap-1.5 h-9 px-3 rounded-xl text-xs font-semibold transition-colors"
            style={{ background: '#ff385c', color: '#ffffff', border: '1px solid #ff385c' }}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            Export to Excel
          </button>
        </div>
      </div>

      <p className="text-xs -mt-2 no-print" style={{ color: '#929292' }}>
        Click any property to expand the room-type breakdown · Printing will output {rows.length + (rows.length > 1 ? 1 : 0)} page{rows.length + (rows.length > 1 ? 1 : 0) === 1 ? '' : 's'}, one per hotel fully expanded{rows.length > 1 ? ' (plus overview)' : ''}.
      </p>

      <div className="no-print">
        <ReportTable rows={rows} />
      </div>

      {/* Print-only: one page per hotel + overview if > 1 */}
      <PrintableAmPmReport
        rows={rows}
        slot={slot}
        scopeLabel={effectiveScopeLabel}
        reportDate={report.label}
      />
    </div>
  );
}
