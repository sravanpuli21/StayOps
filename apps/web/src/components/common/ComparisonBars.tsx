interface Props {
  label: string;
  current: { value: number; formatted: string };
  previous: { value: number; formatted: string };
  changePct: number;
  accent?: 'primary' | 'secondary';
  className?: string;
}

export function ComparisonBars({
  label,
  current,
  previous,
  changePct,
  accent = 'primary',
  className,
}: Props) {
  const max = Math.max(current.value, previous.value, 1);
  const currentPct = (current.value / max) * 100;
  const previousPct = (previous.value / max) * 100;

  const fillColor = accent === 'primary' ? '#ff385c' : '#8b8b9a';
  const changeColor = changePct >= 0 ? '#15803d' : '#b91c1c';
  const changeGlyph = changePct >= 0 ? '↗' : '↘';
  const changeSign = changePct >= 0 ? '+' : '';

  return (
    <div className={className}>
      <div className="flex items-baseline gap-2 mb-2">
        <span className="text-sm" style={{ color: '#6a6a6a' }}>{label}</span>
        <span className="text-xs font-semibold flex items-center gap-0.5" style={{ color: changeColor }}>
          <span>{changeGlyph}</span>
          <span>{changeSign}{changePct.toFixed(1)}%</span>
        </span>
      </div>

      {/* Solid current bar */}
      <div
        className="relative rounded-md overflow-hidden"
        style={{ height: 22, background: '#f7f7f7' }}
      >
        <div
          className="absolute left-0 top-0 bottom-0 rounded-md transition-all"
          style={{ width: `${currentPct}%`, background: fillColor }}
        />
        <span
          className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-semibold text-white"
          style={{ textShadow: '0 0 2px rgba(0,0,0,0.2)' }}
        >
          {current.formatted}
        </span>
      </div>

      {/* Hatched LY bar */}
      <div
        className="relative rounded-md overflow-hidden mt-1.5"
        style={{ height: 22, background: '#f7f7f7' }}
      >
        <div
          className="absolute left-0 top-0 bottom-0 rounded-md"
          style={{
            width: `${previousPct}%`,
            backgroundImage:
              'repeating-linear-gradient(135deg, #e4e4e7 0 6px, #f3f4f6 6px 12px)',
          }}
        />
        <span
          className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium"
          style={{ color: '#6a6a6a' }}
        >
          {previous.formatted}
        </span>
      </div>
    </div>
  );
}
