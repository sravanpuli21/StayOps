import type { Hotel, PropertyValuation } from '@hos/shared';
import { formatCurrencyM } from '@hos/shared';

interface Row { hotel: Hotel; valuation: PropertyValuation }

interface Props {
  rows: Row[];
}

export function AppreciationRefinanceTable({ rows }: Props) {
  // Refi only applies to owned properties.
  const owned = rows
    .filter((r) => r.valuation.ownership === 'owned')
    .sort((a, b) => b.valuation.equityBuilt - a.valuation.equityBuilt);

  if (owned.length === 0) {
    return (
      <div className="rounded-2xl p-6 text-sm" style={{ border: '1px solid #dddddd', background: '#ffffff', color: '#6a6a6a' }}>
        No owned properties in current scope.
      </div>
    );
  }

  const th = 'text-xs font-semibold uppercase tracking-wide py-3 px-4 whitespace-nowrap';

  return (
    <div className="overflow-x-auto rounded-2xl" style={{ border: '1px solid #dddddd', background: '#ffffff' }}>
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr style={{ borderBottom: '1px solid #dddddd', background: '#f7f7f7' }}>
            <th className={`${th} text-left`} style={{ color: '#6a6a6a' }}>Property</th>
            <th className={`${th} text-right`} style={{ color: '#6a6a6a' }}>Asset Value</th>
            <th className={`${th} text-right`} style={{ color: '#6a6a6a' }}>Loan</th>
            <th className={`${th} text-right`} style={{ color: '#6a6a6a' }}>Equity</th>
            <th className={`${th} text-right`} style={{ color: '#6a6a6a' }}>LTV</th>
            <th className={`${th} text-right`} style={{ color: '#6a6a6a' }}>Note</th>
            <th className={`${th} text-left`} style={{ color: '#6a6a6a' }}>Refi Signal</th>
          </tr>
        </thead>
        <tbody>
          {owned.map((row, i) => {
            const v = row.valuation;
            const equityPct = Math.round(((v.assetValue - v.loanBalance) / v.assetValue) * 100);
            return (
              <tr key={row.hotel.id} style={{ borderBottom: i < owned.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                <td className="py-3 px-4">
                  <p className="font-medium text-sm" style={{ color: '#222222' }}>{row.hotel.shortName}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#929292' }}>{row.hotel.city}, {row.hotel.state}</p>
                </td>
                <td className="py-3 px-4 text-sm text-right font-semibold" style={{ color: '#222222' }}>
                  {formatCurrencyM(v.assetValue)}
                </td>
                <td className="py-3 px-4 text-sm text-right" style={{ color: '#3f3f3f' }}>
                  {formatCurrencyM(v.loanBalance)}
                </td>
                <td className="py-3 px-4 text-sm text-right font-medium" style={{ color: '#15803d' }}>
                  {formatCurrencyM(v.equityBuilt)} <span className="text-xs" style={{ color: '#6a6a6a' }}>({equityPct}%)</span>
                </td>
                <td className="py-3 px-4 text-sm text-right" style={{ color: v.ltv >= 70 ? '#b45309' : '#3f3f3f' }}>
                  {v.ltv}%
                </td>
                <td className="py-3 px-4 text-sm text-right" style={{ color: '#3f3f3f' }}>
                  {v.noteRate.toFixed(1)}%
                </td>
                <td className="py-3 px-4">
                  {v.refinanceReady ? (
                    <span
                      className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full"
                      style={{ background: '#dcfce7', color: '#15803d' }}
                    >
                      Ready
                    </span>
                  ) : (
                    <span className="text-xs" style={{ color: '#929292' }}>Hold</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
