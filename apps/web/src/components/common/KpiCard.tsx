import { cn } from '@/lib/utils';

interface KpiCardProps {
  label: string;
  value: string;
  subtext?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  size?: 'large' | 'medium';
  alert?: boolean;
  className?: string;
}

export function KpiCard({
  label,
  value,
  subtext,
  trend,
  trendValue,
  size = 'medium',
  alert = false,
  className,
}: KpiCardProps) {
  const trendColor =
    trend === 'up' ? '#16a34a' : trend === 'down' ? '#dc2626' : '#6a6a6a';
  const trendPrefix = trend === 'up' ? '▲' : trend === 'down' ? '▼' : '';

  return (
    <div
      className={cn('bg-white rounded-2xl p-6 flex flex-col gap-1', className)}
      style={{
        border: alert ? '1px solid #d97706' : '1px solid #dddddd',
        boxShadow: alert
          ? '0 0 0 3px rgba(217,119,6,0.1)'
          : 'rgba(0,0,0,0.02) 0 0 0 1px, rgba(0,0,0,0.04) 0 2px 6px 0',
      }}
    >
      <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#929292' }}>
        {label}
      </p>
      <p
        className={cn('font-bold leading-none', size === 'large' ? 'text-3xl' : 'text-2xl')}
        style={{ color: '#222222' }}
      >
        {value}
      </p>
      {(subtext || trendValue) && (
        <p className="text-xs mt-1" style={{ color: '#6a6a6a' }}>
          {trendValue && (
            <span style={{ color: trendColor }} className="font-semibold mr-1">
              {trendPrefix} {trendValue}
            </span>
          )}
          {subtext}
        </p>
      )}
    </div>
  );
}
