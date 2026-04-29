import type { Hotel, RevenueSummary, DailyMetrics } from '@hos/shared';
import { formatCurrency, formatPct } from '@hos/shared';

interface Row {
  hotel: Hotel;
  revenue: RevenueSummary;
  daily: DailyMetrics;
}

export function OpportunityLeakageTable({ rows }: { rows: Row[] }) {
  const sorted = [...rows].sort((a, b) => {
    const missA = (a.hotel.rooms - a.daily.roomsSold) * a.revenue.adr;
    const missB = (b.hotel.rooms - b.daily.roomsSold) * b.revenue.adr;
    return missB - missA;
  });

  const thBase = 'text-left text-xs font-semibold uppercase tracking-wide py-3 px-4 whitespace-nowrap';

  return (
    <div className="overflow-x-auto rounded-2xl" style={{ border: '1px solid #dddddd', background: '#ffffff' }}>
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr style={{ borderBottom: '1px solid #dddddd', background: '#f7f7f7' }}>
            <th className={thBase} style={{ color: '#6a6a6a' }}>Property</th>
            <th className={thBase} style={{ color: '#6a6a6a', textAlign: 'right' }}>Avail Rooms</th>
            <th className={thBase} style={{ color: '#6a6a6a', textAlign: 'right' }}>Not Sold</th>
            <th className={thBase} style={{ color: '#6a6a6a', textAlign: 'right' }}>Occ%</th>
            <th className={thBase} style={{ color: '#6a6a6a', textAlign: 'right' }}>ADR</th>
            <th className={thBase} style={{ color: '#6a6a6a', textAlign: 'right' }}>Est. Missed Rev</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((row, i) => {
            const available = row.hotel.rooms - row.daily.roomsOoo;
            const notSold = available - row.daily.roomsSold;
            const missedRev = notSold * row.revenue.adr;
            return (
              <tr key={row.hotel.id} style={{ borderBottom: i < sorted.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                <td className="py-3 px-4">
                  <p className="font-medium text-sm" style={{ color: '#222222' }}>{row.hotel.shortName}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#929292' }}>{row.hotel.city}, {row.hotel.state}</p>
                </td>
                <td className="py-3 px-4 text-sm text-right" style={{ color: '#3f3f3f' }}>{available}</td>
                <td className="py-3 px-4 text-sm text-right font-medium" style={{ color: notSold > 20 ? '#dc2626' : '#3f3f3f' }}>
                  {notSold}
                </td>
                <td className="py-3 px-4 text-sm text-right" style={{ color: '#3f3f3f' }}>{formatPct(row.daily.occupancyPct, 0)}</td>
                <td className="py-3 px-4 text-sm text-right" style={{ color: '#3f3f3f' }}>{formatCurrency(row.revenue.adr)}</td>
                <td className="py-3 px-4 text-sm text-right font-semibold" style={{ color: missedRev > 3000 ? '#dc2626' : '#3f3f3f' }}>
                  {formatCurrency(missedRev, true)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
