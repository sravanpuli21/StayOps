import { TrendingUp, TrendingDown, Layers, BarChart3, Calendar } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { PortfolioPattern as Pattern } from '@hos/shared';
import { HOTELS } from '@hos/shared';

interface Props {
  pattern: Pattern;
}

const ICON_MAP: Record<Pattern['icon'], LucideIcon> = {
  'trend-up':   TrendingUp,
  'trend-down': TrendingDown,
  'cluster':    Layers,
  'comp':       BarChart3,
  'seasonal':   Calendar,
};

const CONFIDENCE_COLOR = {
  high:   { bg: '#f0fdf4', color: '#15803d' },
  medium: { bg: '#fffbeb', color: '#b45309' },
  low:    { bg: '#f5f3ff', color: '#6d28d9' },
} as const;

export function PatternCard({ pattern }: Props) {
  const Icon = ICON_MAP[pattern.icon];
  const cfg = CONFIDENCE_COLOR[pattern.confidence];

  return (
    <div
      className="rounded-2xl p-5"
      style={{ background: '#ffffff', border: '1px solid #dddddd' }}
    >
      <div className="flex items-start gap-3 mb-3">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(255,56,92,0.08)' }}
        >
          <Icon className="w-4 h-4" style={{ color: '#ff385c' }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm leading-snug" style={{ color: '#222222' }}>
            {pattern.title}
          </p>
        </div>
        <span
          className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide flex-shrink-0"
          style={{ background: cfg.bg, color: cfg.color }}
        >
          {pattern.confidence.toUpperCase()}
        </span>
      </div>

      <p className="text-sm leading-relaxed mb-4" style={{ color: '#6a6a6a' }}>
        {pattern.narrative}
      </p>

      <div className="flex flex-wrap gap-1.5">
        <span className="text-[10px] font-bold uppercase tracking-wide mr-1" style={{ color: '#929292' }}>
          Affected ({pattern.affectedHotelIds.length})
        </span>
        {pattern.affectedHotelIds.slice(0, 6).map((hid) => {
          const hotel = HOTELS.find((h) => h.id === hid);
          return (
            <span
              key={hid}
              className="px-2 py-0.5 rounded-full text-[10px] font-medium"
              style={{ background: '#f7f7f7', border: '1px solid #eeeeee', color: '#6a6a6a' }}
            >
              {hotel?.shortName ?? hid}
            </span>
          );
        })}
        {pattern.affectedHotelIds.length > 6 && (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium" style={{ color: '#929292' }}>
            +{pattern.affectedHotelIds.length - 6} more
          </span>
        )}
      </div>
    </div>
  );
}
