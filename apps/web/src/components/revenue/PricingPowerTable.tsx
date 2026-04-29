import type { Hotel, RevenueSummary } from '@hos/shared';
import { formatCurrency } from '@hos/shared';

interface Row { hotel: Hotel; revenue: RevenueSummary }

function GapBadge({ gap }: { gap: number }) {
  const isPos = gap > 0;
  const isStrong = gap > 15;
  const isWeak = gap < -10;

  if (isStrong) return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: '#f0fdf4', color: '#15803d' }}>
      +{formatCurrency(gap)}
    </span>
  );
  if (isWeak) return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: '#fef2f2', color: '#b91c1c' }}>
      {formatCurrency(gap)}
    </span>
  );
  return (
    <span className="text-sm font-medium" style={{ color: isPos ? '#15803d' : '#b91c1c' }}>
      {isPos ? '+' : ''}{formatCurrency(gap)}
    </span>
  );
}

export function PricingPowerTable({ rows }: { rows: Row[] }) {
  const sorted = [...rows].sort((a, b) => {
    const gA = a.revenue.adr - a.revenue.marketAdr;
    const gB = b.revenue.adr - b.revenue.marketAdr;
    return gB - gA;
  });

  const thBase = 'text-left text-xs font-semibold uppercase tracking-wide py-3 px-4 whitespace-nowrap';

  return (
    <div className="overflow-x-auto rounded-2xl" style={{ border: '1px solid #dddddd', background: '#ffffff' }}>
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr style={{ borderBottom: '1px solid #dddddd', background: '#f7f7f7' }}>
            <th className={thBase} style={{ color: '#6a6a6a' }}>Property</th>
            <th className={thBase} style={{ color: '#6a6a6a', textAlign: 'right' }}>Our ADR</th>
            <th className={thBase} style={{ color: '#6a6a6a', textAlign: 'right' }}>Market ADR</th>
            <th className={thBase} style={{ color: '#6a6a6a', textAlign: 'right' }}>Gap ($)</th>
            <th className={thBase} style={{ color: '#6a6a6a', textAlign: 'right' }}>Gap (%)</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((row, i) => {
            const gap = row.revenue.adr - row.revenue.marketAdr;
            const gapPct = (gap / row.revenue.marketAdr) * 100;
            return (
              <tr key={row.hotel.id} style={{ borderBottom: i < sorted.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                <td className="py-3 px-4">
                  <p className="font-medium text-sm" style={{ color: '#222222' }}>{row.hotel.shortName}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#929292' }}>{row.hotel.brand} · {row.hotel.city}</p>
                </td>
                <td className="py-3 px-4 text-sm text-right font-medium" style={{ color: '#222222' }}>
                  {formatCurrency(row.revenue.adr)}
                </td>
                <td className="py-3 px-4 text-sm text-right" style={{ color: '#929292' }}>
                  {formatCurrency(row.revenue.marketAdr)}
                </td>
                <td className="py-3 px-4 text-right">
                  <GapBadge gap={gap} />
                </td>
                <td className="py-3 px-4 text-sm text-right font-medium" style={{ color: gap >= 0 ? '#15803d' : '#b91c1c' }}>
                  {gap >= 0 ? '+' : ''}{gapPct.toFixed(1)}%
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
