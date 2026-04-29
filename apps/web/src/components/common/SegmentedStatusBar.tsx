interface Segment {
  label: string;
  pct: number;
  color: string;
  value?: string;
}

interface Props {
  segments: Segment[];
  height?: number;
  className?: string;
}

export function SegmentedStatusBar({ segments, height = 10, className }: Props) {
  const total = segments.reduce((s, seg) => s + seg.pct, 0) || 1;

  return (
    <div className={className}>
      {/* Header with percentages + dots */}
      <div className="flex items-baseline flex-wrap gap-x-6 gap-y-1 mb-3">
        {segments.map((s) => (
          <div key={s.label} className="flex items-baseline gap-2">
            <span className="font-bold" style={{ color: '#222', fontSize: 22, lineHeight: 1 }}>
              {s.pct}%
            </span>
            <div className="flex items-center gap-1.5">
              <span
                className="inline-block w-1.5 h-1.5 rounded-full"
                style={{ background: s.color }}
              />
              <span style={{ color: '#6a6a6a', fontSize: 13 }}>{s.label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Bar */}
      <div
        className="flex rounded-full overflow-hidden"
        style={{ height, background: '#f0f0f0' }}
      >
        {segments.map((s, i) => (
          <div
            key={`${s.label}-${i}`}
            style={{
              width: `${(s.pct / total) * 100}%`,
              background: s.color,
            }}
          />
        ))}
      </div>
    </div>
  );
}
