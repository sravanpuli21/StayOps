import type { Asset } from '@hos/shared';
import { HOTELS, formatCurrency } from '@hos/shared';

interface Props {
  assets: Asset[];
}

function daysSince(iso: string): number {
  const d = new Date(iso);
  const now = new Date('2026-04-28');
  return Math.floor((now.getTime() - d.getTime()) / (24 * 60 * 60 * 1000));
}

export function RepeatFailuresTable({ assets }: Props) {
  const flagged = assets
    .filter((a) => a.failureCount12mo >= 3)
    .sort((a, b) => b.failureCount12mo - a.failureCount12mo);

  if (flagged.length === 0) return null;

  const th = 'text-left text-xs font-semibold uppercase tracking-wide py-3 px-4 whitespace-nowrap';

  return (
    <div className="overflow-x-auto rounded-2xl" style={{ border: '1px solid #dddddd', background: '#ffffff' }}>
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr style={{ borderBottom: '1px solid #dddddd', background: '#f7f7f7' }}>
            <th className={th} style={{ color: '#6a6a6a' }}>Asset</th>
            <th className={th} style={{ color: '#6a6a6a' }}>Property</th>
            <th className={th} style={{ color: '#6a6a6a', textAlign: 'right' }}>Failures (12mo)</th>
            <th className={th} style={{ color: '#6a6a6a', textAlign: 'right' }}>Last Service</th>
            <th className={th} style={{ color: '#6a6a6a', textAlign: 'right' }}>Replacement Cost</th>
            <th className={th} style={{ color: '#6a6a6a' }}>Condition</th>
          </tr>
        </thead>
        <tbody>
          {flagged.map((asset, i) => {
            const hotel = HOTELS.find((h) => h.id === asset.hotelId);
            const days = daysSince(asset.lastServiceDate);
            return (
              <tr key={asset.id} style={{ borderBottom: i < flagged.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                <td className="py-3 px-4">
                  <p className="font-medium text-sm" style={{ color: '#222222' }}>{asset.label}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#929292' }}>{asset.category}</p>
                </td>
                <td className="py-3 px-4 text-sm" style={{ color: '#3f3f3f' }}>{hotel?.shortName ?? asset.hotelId}</td>
                <td className="py-3 px-4 text-sm text-right font-bold" style={{ color: asset.failureCount12mo >= 5 ? '#b91c1c' : '#b45309' }}>
                  {asset.failureCount12mo}
                </td>
                <td className="py-3 px-4 text-sm text-right" style={{ color: '#6a6a6a' }}>{days}d ago</td>
                <td className="py-3 px-4 text-sm text-right" style={{ color: '#3f3f3f' }}>{formatCurrency(asset.replacementCost, true)}</td>
                <td className="py-3 px-4">
                  <span
                    className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold"
                    style={{
                      background: asset.condition === 'failing' ? '#fef2f2' : asset.condition === 'poor' ? '#fef2f2' : asset.condition === 'fair' ? '#fffbeb' : '#f0fdf4',
                      color: asset.condition === 'failing' ? '#b91c1c' : asset.condition === 'poor' ? '#b91c1c' : asset.condition === 'fair' ? '#b45309' : '#15803d',
                    }}
                  >
                    {asset.condition.toUpperCase()}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
