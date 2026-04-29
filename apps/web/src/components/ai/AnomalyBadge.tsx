import type { AnomalyKind } from '@hos/shared';

interface Props {
  kind: AnomalyKind;
}

const CONFIG: Record<AnomalyKind, { label: string; bg: string; color: string }> = {
  new:       { label: 'NEW',       bg: '#eef2ff', color: '#4338ca' },
  trending:  { label: 'TRENDING',  bg: '#fef2f2', color: '#b91c1c' },
  recurring: { label: 'RECURRING', bg: '#fffbeb', color: '#b45309' },
  resolved:  { label: 'RESOLVED',  bg: '#f0fdf4', color: '#15803d' },
};

export function AnomalyBadge({ kind }: Props) {
  const c = CONFIG[kind];
  return (
    <span
      className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wide"
      style={{ background: c.bg, color: c.color }}
    >
      {c.label}
    </span>
  );
}
