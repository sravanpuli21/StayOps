import { cn } from '@/lib/utils';
import { Sparkline } from '@/components/common/Sparkline';

interface KpiChange {
  pct: number;
  direction: 'up' | 'down';
}

type KpiSize = 'sm' | 'md' | 'lg' | 'medium' | 'large';

interface KpiCardProps {
  label: string;
  value: string;
  change?: KpiChange;
  stly?: string;
  stlyLabel?: string;
  sparkline?: number[];
  size?: KpiSize;
  alert?: boolean;
  className?: string;
  // Legacy props — kept for backward compatibility with existing call sites
  subtext?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
}

export function KpiCard({
  label,
  value,
  change,
  stly,
  stlyLabel = 'STLY',
  sparkline,
  size = 'md',
  alert = false,
  className,
  // Legacy
  subtext,
  trend,
  trendValue,
}: KpiCardProps) {
  // Bridge legacy props to new model
  const effectiveChange: KpiChange | undefined =
    change ??
    (trend && trend !== 'neutral' && trendValue
      ? { direction: trend, pct: parseFloat(trendValue.replace(/[^\d.-]/g, '')) || 0 }
      : undefined);

  const normalizedSize: 'sm' | 'md' | 'lg' =
    size === 'large' ? 'lg' : size === 'medium' ? 'md' : (size as 'sm' | 'md' | 'lg');
  const valueSize =
    normalizedSize === 'lg' ? 'text-[28px]' : normalizedSize === 'sm' ? 'text-[20px]' : 'text-[24px]';

  const changeColor = effectiveChange
    ? effectiveChange.direction === 'up'
      ? 'var(--color-trend-up)'
      : 'var(--color-trend-down)'
    : 'var(--color-ash)';
  const changeGlyph = effectiveChange?.direction === 'up' ? '↗' : '↘';

  return (
    <div
      className={cn(
        'flex flex-col bg-white transition-shadow',
        'hover:shadow-[var(--shadow-card)]',
        className
      )}
      style={{
        borderRadius: '14px',
        border: alert ? '1px solid #ff385c' : '1px solid #dddddd',
        boxShadow: alert ? '0 0 0 3px rgba(255,56,92,0.1)' : 'none',
        padding: '20px',
      }}
    >
      {/* Title — centered, caption-sm muted */}
      <p
        className="text-center font-medium"
        style={{
          color: 'var(--color-ash)',
          fontSize: 'var(--text-caption)',
          lineHeight: 'var(--leading-caption)',
        }}
      >
        {label}
      </p>

      {/* Value — centered, bold ink */}
      <p
        className={cn('text-center font-bold mt-1', valueSize)}
        style={{
          color: 'var(--color-ink)',
          lineHeight: 1.1,
          letterSpacing: '-0.5px',
        }}
      >
        {value}
      </p>

      {/* Optional sparkline */}
      {sparkline && sparkline.length > 1 && (
        <div className="flex justify-center mt-2">
          <Sparkline data={sparkline} height={24} width={140} />
        </div>
      )}

      {/* Legacy subtext (non-STLY usage) */}
      {subtext && !stly && !effectiveChange && (
        <p
          className="text-center mt-2"
          style={{
            color: 'var(--color-ash)',
            fontSize: 'var(--text-caption-sm)',
            lineHeight: 'var(--leading-caption-sm)',
          }}
        >
          {subtext}
        </p>
      )}

      {/* MEWS 3-part footer: Change | STLY */}
      {(effectiveChange || stly) && (
        <div className="flex items-stretch justify-center gap-4 mt-3 pt-2">
          {effectiveChange && (
            <div className="flex flex-col items-center">
              <div
                className="flex items-center gap-1 font-semibold"
                style={{
                  color: changeColor,
                  fontSize: 'var(--text-body-sm)',
                  lineHeight: 1,
                }}
              >
                <span className="text-[13px]">{changeGlyph}</span>
                <span>
                  {effectiveChange.direction === 'up' ? '+' : '−'}
                  {Math.abs(effectiveChange.pct).toFixed(1)}%
                </span>
              </div>
              <p
                className="mt-1"
                style={{
                  color: 'var(--color-ash)',
                  fontSize: 'var(--text-caption-sm)',
                  lineHeight: 1,
                }}
              >
                Change
              </p>
            </div>
          )}
          {effectiveChange && stly && (
            <div className="w-px self-stretch" style={{ background: 'var(--color-hairline)' }} />
          )}
          {stly && (
            <div className="flex flex-col items-center">
              <span
                className="font-semibold"
                style={{
                  color: 'var(--color-charcoal)',
                  fontSize: 'var(--text-body-sm)',
                  lineHeight: 1,
                }}
              >
                {stly}
              </span>
              <p
                className="mt-1"
                style={{
                  color: 'var(--color-ash)',
                  fontSize: 'var(--text-caption-sm)',
                  lineHeight: 1,
                }}
              >
                {stlyLabel}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Legacy subtext rendered under footer when used alongside STLY */}
      {subtext && (stly || effectiveChange) && (
        <p
          className="text-center mt-2"
          style={{
            color: 'var(--color-mute)',
            fontSize: 'var(--text-caption-sm)',
            lineHeight: 'var(--leading-caption-sm)',
          }}
        >
          {subtext}
        </p>
      )}
    </div>
  );
}
