'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { GM_ROSTER, formatCurrency, formatPct } from '@hos/shared';
import { KpiCard } from '@/components/common/KpiCard';
import { HealthBadge } from '@/components/common/HealthBadge';
import { useScopedData } from '@/lib/use-scoped-data';

export default function HarshalRevenue() {
  const { hotels, scopeLabel, scopeSub, revenueRows, labourRows, period } = useScopedData();

  const rows = hotels.map((hotel) => {
    const rev = revenueRows.find((r) => r.hotelId === hotel.id)!;
    const lab = labourRows.find((l) => l.hotelId === hotel.id)!;
    const gm = GM_ROSTER.find((g) => g.hotelId === hotel.id);
    return {
      hotel, rev, gm,
      payrollPct: rev.totalRevenue > 0 ? (lab.payrollCost / rev.totalRevenue) * 100 : 0,
      adrVsMarket: rev.adr - rev.marketAdr,
    };
  }).sort((a, b) => b.rev.revPar - a.rev.revPar);

  const totalRevenue = rows.reduce((s, r) => s + r.rev.totalRevenue, 0);
  const avgOcc = rows.length > 0 ? rows.reduce((s, r) => s + r.rev.occupancyPct, 0) / rows.length : 0;
  const avgAdr = rows.length > 0 ? rows.reduce((s, r) => s + r.rev.adr, 0) / rows.length : 0;
  const avgRevPar = rows.length > 0 ? rows.reduce((s, r) => s + r.rev.revPar, 0) / rows.length : 0;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold" style={{ color: '#222' }}>Revenue — {scopeLabel}</h1>
        <p className="text-sm mt-0.5" style={{ color: '#929292' }}>{scopeSub}</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <KpiCard label="Total Revenue" value={formatCurrency(totalRevenue, true)} subtext={`All revenue · ${period.label}`} size="large" />
        <KpiCard label="Avg Occupancy" value={formatPct(avgOcc, 1)} subtext={hotels.length > 1 ? `Across ${hotels.length} hotels` : 'This property'} size="large" />
        <KpiCard label="Avg ADR" value={formatCurrency(avgAdr)} subtext="Daily rate" size="large" />
        <KpiCard label="Avg RevPAR" value={formatCurrency(avgRevPar)} subtext="Per available room" size="large" />
      </div>

      {rows.length > 1 && (
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wide mb-3" style={{ color: '#6a6a6a' }}>
            Revenue Ranking — Best to Worst
          </h2>
          <div className="overflow-x-auto rounded-2xl" style={{ border: '1px solid #dddddd', background: '#ffffff' }}>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr style={{ borderBottom: '1px solid #dddddd', background: '#f7f7f7' }}>
                  {['Hotel / GM', 'Occ %', 'ADR', 'Market ADR', 'Gap', 'RevPAR', 'Revenue', 'Payroll %', 'Health', ''].map((h) => (
                    <th key={h} className="text-xs font-semibold uppercase tracking-wide py-3 px-4 whitespace-nowrap" style={{ color: '#6a6a6a', textAlign: h === 'Hotel / GM' ? 'left' : 'right' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={row.hotel.id} className="cursor-pointer hover:bg-[#fafafa] transition-colors" style={{ borderBottom: i < rows.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                    <td className="py-3 px-4">
                      <p className="font-medium text-sm" style={{ color: '#222' }}>{row.hotel.shortName}</p>
                      {row.gm && <p className="text-xs mt-0.5" style={{ color: '#929292' }}>GM · {row.gm.name}</p>}
                    </td>
                    <td className="py-3 px-4 text-right text-sm font-medium" style={{ color: '#3f3f3f' }}>{formatPct(row.rev.occupancyPct, 0)}</td>
                    <td className="py-3 px-4 text-right text-sm" style={{ color: '#3f3f3f' }}>{formatCurrency(row.rev.adr)}</td>
                    <td className="py-3 px-4 text-right text-sm" style={{ color: '#929292' }}>{formatCurrency(row.rev.marketAdr)}</td>
                    <td className="py-3 px-4 text-right text-sm font-semibold" style={{ color: row.adrVsMarket >= 0 ? '#15803d' : '#b91c1c' }}>
                      {row.adrVsMarket >= 0 ? '+' : ''}{formatCurrency(row.adrVsMarket)}
                    </td>
                    <td className="py-3 px-4 text-right text-sm font-medium" style={{ color: '#3f3f3f' }}>{formatCurrency(row.rev.revPar)}</td>
                    <td className="py-3 px-4 text-right text-sm font-semibold" style={{ color: '#222' }}>{formatCurrency(row.rev.totalRevenue, true)}</td>
                    <td className="py-3 px-4 text-right text-sm" style={{ color: row.payrollPct > 28 ? '#b91c1c' : row.payrollPct > 24 ? '#b45309' : '#15803d' }}>
                      {formatPct(row.payrollPct, 1)}
                    </td>
                    <td className="py-3 px-4"><HealthBadge health={row.rev.health} showLabel /></td>
                    <td className="py-3 px-4 text-right">
                      <Link href={`/web/harshal/hotel/${row.hotel.id}`} className="inline-flex items-center gap-0.5 text-xs font-semibold hover:underline" style={{ color: '#ff385c' }}>
                        View <ChevronRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
