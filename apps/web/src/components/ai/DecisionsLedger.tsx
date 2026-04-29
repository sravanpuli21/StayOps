import { Check, X, Edit3 } from 'lucide-react';
import type { DecisionLogEntry } from '@hos/shared';
import { HOTELS } from '@hos/shared';

interface Props {
  entries: DecisionLogEntry[];
}

const ACTION_CONFIG = {
  approved:   { Icon: Check,  bg: '#f0fdf4', color: '#15803d', label: 'Approved' },
  rejected:   { Icon: X,      bg: '#f7f7f7', color: '#6a6a6a', label: 'Rejected' },
  overridden: { Icon: Edit3,  bg: '#f5f3ff', color: '#6d28d9', label: 'Overridden' },
  pending:    { Icon: Edit3,  bg: '#fffbeb', color: '#b45309', label: 'Pending' },
} as const;

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function DecisionsLedger({ entries }: Props) {
  const th = 'text-left text-xs font-semibold uppercase tracking-wide py-3 px-4 whitespace-nowrap';

  return (
    <div className="overflow-x-auto rounded-2xl" style={{ border: '1px solid #dddddd', background: '#ffffff' }}>
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr style={{ borderBottom: '1px solid #dddddd', background: '#f7f7f7' }}>
            <th className={th} style={{ color: '#6a6a6a' }}>Date</th>
            <th className={th} style={{ color: '#6a6a6a' }}>Property</th>
            <th className={th} style={{ color: '#6a6a6a' }}>Module</th>
            <th className={th} style={{ color: '#6a6a6a' }}>Recommendation</th>
            <th className={th} style={{ color: '#6a6a6a' }}>Action</th>
            <th className={th} style={{ color: '#6a6a6a' }}>By</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((e, i) => {
            const hotel = HOTELS.find((h) => h.id === e.hotelId);
            const cfg = ACTION_CONFIG[e.action];
            return (
              <tr
                key={e.id}
                style={{ borderBottom: i < entries.length - 1 ? '1px solid #f0f0f0' : 'none' }}
              >
                <td className="py-3 px-4 text-xs" style={{ color: '#6a6a6a' }}>{formatDate(e.timestamp)}</td>
                <td className="py-3 px-4 text-sm font-medium" style={{ color: '#222222' }}>
                  {hotel?.shortName ?? e.hotelId}
                </td>
                <td className="py-3 px-4">
                  <span
                    className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide"
                    style={{ background: '#f7f7f7', color: '#6a6a6a' }}
                  >
                    {e.module}
                  </span>
                </td>
                <td className="py-3 px-4 text-sm" style={{ color: '#3f3f3f' }}>
                  <p className="leading-snug">{e.summary}</p>
                  {e.notes && (
                    <p className="text-xs mt-1 italic leading-snug" style={{ color: '#929292' }}>
                      "{e.notes}"
                    </p>
                  )}
                </td>
                <td className="py-3 px-4">
                  <span
                    className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-semibold"
                    style={{ background: cfg.bg, color: cfg.color }}
                  >
                    <cfg.Icon className="w-3 h-3" />
                    {cfg.label}
                  </span>
                </td>
                <td className="py-3 px-4 text-xs" style={{ color: '#6a6a6a' }}>{e.actor}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
