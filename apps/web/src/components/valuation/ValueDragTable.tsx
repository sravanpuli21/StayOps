import type { Hotel, PropertyValuation } from '@hos/shared';
import { formatCurrencyM } from '@hos/shared';

interface Row { hotel: Hotel; valuation: PropertyValuation }

interface Props {
  rows: Row[];
}

export function ValueDragTable({ rows }: Props) {
  const sorted = [...rows]
    .filter((r) => r.valuation.capExDragOnValue > 0)
    .sort((a, b) => b.valuation.capExDragOnValue - a.valuation.capExDragOnValue);
  const th = 'text-xs font-semibold uppercase tracking-wide py-3 px-4 whitespace-nowrap';

  if (sorted.length === 0) {
    return (
      <div className="rounded-2xl p-6 text-sm" style={{ border: '1px solid #dddddd', background: '#ffffff', color: '#6a6a6a' }}>
        No deferred-maintenance drag detected on the current scope.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl" style={{ border: '1px solid #dddddd', background: '#ffffff' }}>
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr style={{ borderBottom: '1px solid #dddddd', background: '#f7f7f7' }}>
            <th className={`${th} text-left`} style={{ color: '#6a6a6a' }}>Property</th>
            <th className={`${th} text-right`} style={{ color: '#6a6a6a' }}>Drag on Value</th>
            <th className={`${th} text-right`} style={{ color: '#6a6a6a' }}>% of Value</th>
            <th className={`${th} text-right`} style={{ color: '#6a6a6a' }}>Cap Rate Cost</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((row, i) => {
            const v = row.valuation;
            const dragPct = Math.round((v.capExDragOnValue / v.assetValue) * 1000) / 10;
            // Drag treated as lost value at current cap rate ⇒ implied NOI loss / value ratio.
            const capRateCost = Math.round((dragPct) * 10) / 100;
            return (
              <tr key={row.hotel.id} style={{ borderBottom: i < sorted.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                <td className="py-3 px-4">
                  <p className="font-medium text-sm" style={{ color: '#222222' }}>{row.hotel.shortName}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#929292' }}>{row.hotel.city}, {row.hotel.state}</p>
                </td>
                <td className="py-3 px-4 text-sm text-right font-semibold" style={{ color: '#b91c1c' }}>
                  -{formatCurrencyM(v.capExDragOnValue)}
                </td>
                <td className="py-3 px-4 text-sm text-right" style={{ color: dragPct > 1.5 ? '#b91c1c' : '#3f3f3f' }}>
                  {dragPct}%
                </td>
                <td className="py-3 px-4 text-sm text-right" style={{ color: '#3f3f3f' }}>
                  -{capRateCost} bps
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
