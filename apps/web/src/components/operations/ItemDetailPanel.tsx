import type { RoomInventoryItem } from '@hos/shared';
import { HOTELS } from '@hos/shared';
import { SlidePanel } from './SlidePanel';
import { ConditionBadge } from './OpsBadges';
import { AlertTriangle, TrendingUp } from 'lucide-react';

interface Props {
  item: RoomInventoryItem | null;
  onClose: () => void;
  backLabel?: string;
  onBack?: () => void;
}

const HISTORY_ICON: Record<string, string> = {
  repair: '🔧',
  replacement: '📦',
  inspection: '🔍',
  complaint: '💬',
};

const HISTORY_COLOR: Record<string, string> = {
  repair: '#c0392b',
  replacement: '#1d6fa4',
  inspection: '#15803d',
  complaint: '#d97706',
};

function fmtDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

export function ItemDetailPanel({ item, onClose, backLabel, onBack }: Props) {
  if (!item) return null;
  const hotel = HOTELS.find((h) => h.id === item.hotelId);
  const repairThresholdExceeded = item.repairCount >= 3;
  const costRatio = item.replacementCost > 0 ? item.totalRepairCost / item.replacementCost : 0;

  return (
    <SlidePanel
      open={!!item}
      onClose={onClose}
      title={item.name}
      subtitle={`${item.roomNumber !== 'N/A' ? `Room ${item.roomNumber} · ` : ''}${hotel?.shortName ?? item.hotelId}`}
      backLabel={backLabel}
      onBack={onBack}
    >
      <div className="px-6 py-5 flex flex-col gap-6">
        {/* Condition + meta */}
        <div className="flex flex-wrap gap-4">
          <div>
            <p className="text-xs" style={{ color: '#929292' }}>Condition</p>
            <div className="mt-0.5"><ConditionBadge condition={item.condition} /></div>
          </div>
          <div>
            <p className="text-xs" style={{ color: '#929292' }}>Category</p>
            <p className="text-sm font-semibold capitalize" style={{ color: '#222222' }}>{item.category}</p>
          </div>
          <div>
            <p className="text-xs" style={{ color: '#929292' }}>Installed</p>
            <p className="text-sm font-semibold" style={{ color: '#222222' }}>{fmtDate(item.installedDate)}</p>
          </div>
          {item.lastServiceDate && (
            <div>
              <p className="text-xs" style={{ color: '#929292' }}>Last service</p>
              <p className="text-sm font-semibold" style={{ color: '#222222' }}>{fmtDate(item.lastServiceDate)}</p>
            </div>
          )}
        </div>

        {/* Cost summary */}
        <div
          className="grid grid-cols-3 gap-3 rounded-xl p-4"
          style={{ background: '#f7f7f7', border: '1px solid #ebebeb' }}
        >
          <div className="text-center">
            <p className="text-lg font-bold" style={{ color: '#222222' }}>{item.repairCount}</p>
            <p className="text-xs" style={{ color: '#929292' }}>Repairs</p>
          </div>
          <div className="text-center" style={{ borderLeft: '1px solid #dddddd', borderRight: '1px solid #dddddd' }}>
            <p className="text-lg font-bold" style={{ color: item.totalRepairCost > 0 ? '#c0392b' : '#15803d' }}>
              ${item.totalRepairCost.toLocaleString()}
            </p>
            <p className="text-xs" style={{ color: '#929292' }}>Total repair spend</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold" style={{ color: '#222222' }}>${item.replacementCost.toLocaleString()}</p>
            <p className="text-xs" style={{ color: '#929292' }}>Replace cost</p>
          </div>
        </div>

        {/* Analysis / Recommendation */}
        {(repairThresholdExceeded || costRatio > 0.5) && (
          <div
            className="rounded-xl p-4 flex gap-3"
            style={{ background: '#fff8f0', border: '1px solid #fcd8a8' }}
          >
            <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#b45309' }} />
            <div>
              <p className="text-sm font-semibold mb-1" style={{ color: '#b45309' }}>Replacement recommended</p>
              <p className="text-xs leading-relaxed" style={{ color: '#6a6a6a' }}>
                {repairThresholdExceeded
                  ? `This item has ${item.repairCount} repairs — above the 3-repair threshold. `
                  : ''}
                {costRatio > 0.5
                  ? `Repair spend ($${item.totalRepairCost.toLocaleString()}) is ${Math.round(costRatio * 100)}% of replacement cost ($${item.replacementCost.toLocaleString()}). `
                  : ''}
                Replacement delivers better long-term value.
              </p>
            </div>
          </div>
        )}

        {/* Repair efficiency bar */}
        {item.replacementCost > 0 && item.totalRepairCost > 0 && (
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-xs font-semibold" style={{ color: '#6a6a6a' }}>Repair spend vs replacement</p>
              <span className="text-xs font-bold" style={{ color: costRatio > 0.5 ? '#c0392b' : '#15803d' }}>
                {Math.round(costRatio * 100)}%
              </span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: '#ebebeb' }}>
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${Math.min(costRatio * 100, 100)}%`,
                  background: costRatio > 0.75 ? '#c0392b' : costRatio > 0.5 ? '#d97706' : '#16a34a',
                }}
              />
            </div>
          </div>
        )}

        {/* History timeline */}
        <div>
          <p className="text-xs font-bold uppercase tracking-wide mb-3 flex items-center gap-2" style={{ color: '#929292' }}>
            <TrendingUp className="w-3.5 h-3.5" />
            Item History
          </p>
          <div className="flex flex-col gap-0">
            {item.history.map((entry, i) => (
              <div key={i} className="flex gap-3 pb-4">
                <div className="flex flex-col items-center">
                  <span className="text-sm leading-none">{HISTORY_ICON[entry.type]}</span>
                  {i < item.history.length - 1 && (
                    <div className="w-px flex-1 mt-1" style={{ background: '#ebebeb', minHeight: 16 }} />
                  )}
                </div>
                <div className="flex-1 min-w-0 pb-0.5">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span
                      className="text-xs font-semibold capitalize"
                      style={{ color: HISTORY_COLOR[entry.type] }}
                    >
                      {entry.type}
                    </span>
                    <span className="text-xs" style={{ color: '#929292' }}>{fmtDate(entry.date)}</span>
                    {entry.cost !== undefined && (
                      <span className="text-xs font-semibold ml-auto" style={{ color: '#c0392b' }}>
                        ${entry.cost.toLocaleString()}
                      </span>
                    )}
                  </div>
                  <p className="text-sm mt-0.5" style={{ color: '#333' }}>{entry.description}</p>
                  {entry.technician && (
                    <p className="text-xs mt-0.5" style={{ color: '#929292' }}>By {entry.technician}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SlidePanel>
  );
}
