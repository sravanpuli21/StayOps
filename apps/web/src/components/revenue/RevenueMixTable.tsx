import type { Hotel, RevenueSummary } from '@hos/shared';
import { formatCurrency } from '@hos/shared';

interface Row { hotel: Hotel; revenue: RevenueSummary }

const MIX_COLS: Array<{ key: keyof RevenueSummary['revenueMix']; label: string; color: string }> = [
  { key: 'room',   label: 'Rooms',   color: '#ff385c' },
  { key: 'fb',     label: 'F&B',     color: '#f97316' },
  { key: 'retail', label: 'Retail',  color: '#eab308' },
  { key: 'events', label: 'Events',  color: '#22c55e' },
  { key: 'other',  label: 'Other',   color: '#94a3b8' },
];

function MixCell({ value, total, color }: { value: number; total: number; color: string }) {
  const pct = total > 0 ? (value / total) * 100 : 0;
  return (
    <td className="py-3 px-4 text-sm" style={{ minWidth: 100 }}>
      <div className="flex flex-col gap-1">
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#f0f0f0', width: 80 }}>
          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
        </div>
        <span className="text-xs font-medium" style={{ color: '#3f3f3f' }}>
          {formatCurrency(value, true)}
          <span className="ml-1 font-normal" style={{ color: '#929292' }}>{pct.toFixed(0)}%</span>
        </span>
      </div>
    </td>
  );
}

export function RevenueMixTable({ rows }: { rows: Row[] }) {
  const thBase = 'text-left text-xs font-semibold uppercase tracking-wide py-3 px-4 whitespace-nowrap';

  return (
    <div className="overflow-x-auto rounded-2xl" style={{ border: '1px solid #dddddd', background: '#ffffff' }}>
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr style={{ borderBottom: '1px solid #dddddd', background: '#f7f7f7' }}>
            <th className={thBase} style={{ color: '#6a6a6a' }}>Property</th>
            {MIX_COLS.map((c) => (
              <th key={c.key} className={thBase} style={{ color: '#6a6a6a' }}>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full inline-block" style={{ background: c.color }} />
                  {c.label}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.hotel.id} style={{ borderBottom: i < rows.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
              <td className="py-3 px-4">
                <p className="font-medium text-sm" style={{ color: '#222222' }}>{row.hotel.shortName}</p>
                <p className="text-xs mt-0.5" style={{ color: '#929292' }}>{row.hotel.brand}</p>
              </td>
              {MIX_COLS.map((c) => (
                <MixCell
                  key={c.key}
                  value={row.revenue.revenueMix[c.key]}
                  total={row.revenue.totalRevenue}
                  color={c.color}
                />
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
