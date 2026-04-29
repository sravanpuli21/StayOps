import type { HealthStatus } from '@hos/shared';
import { cn } from '@/lib/utils';

interface HealthBadgeProps {
  health: HealthStatus;
  showLabel?: boolean;
  className?: string;
}

const CONFIG: Record<HealthStatus, { dot: string; bg: string; text: string; label: string }> = {
  green: { dot: '#16a34a', bg: '#f0fdf4', text: '#15803d', label: 'Healthy' },
  amber: { dot: '#d97706', bg: '#fffbeb', text: '#b45309', label: 'Monitor' },
  red:   { dot: '#dc2626', bg: '#fef2f2', text: '#b91c1c', label: 'At Risk' },
};

export function HealthBadge({ health, showLabel = false, className }: HealthBadgeProps) {
  const c = CONFIG[health];
  return (
    <span
      className={cn('inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium', className)}
      style={{ background: c.bg, color: c.text }}
    >
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: c.dot }} />
      {showLabel && c.label}
    </span>
  );
}
