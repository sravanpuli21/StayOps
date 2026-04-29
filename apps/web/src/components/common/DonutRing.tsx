interface Props {
  value: number;            // 0-100
  size?: number;
  thickness?: number;
  accent?: string;
  trackColor?: string;
  label?: string;           // center text override; defaults to `${value}%`
  subLabel?: string;
  className?: string;
}

export function DonutRing({
  value,
  size = 140,
  thickness = 14,
  accent = '#ff385c',
  trackColor = '#eeeeee',
  label,
  subLabel,
  className,
}: Props) {
  const clamped = Math.max(0, Math.min(100, value));
  const r = (size - thickness) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - clamped / 100);
  const cx = size / 2;
  const cy = size / 2;

  return (
    <div className={className} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Track */}
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={trackColor}
          strokeWidth={thickness}
        />
        {/* Foreground arc */}
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={accent}
          strokeWidth={thickness}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${cx} ${cy})`}
        />
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="central"
          style={{
            fontSize: size * 0.24,
            fontWeight: 700,
            fill: '#222222',
            letterSpacing: '-0.5px',
          }}
        >
          {label ?? `${clamped.toFixed(0)}%`}
        </text>
        {subLabel && (
          <text
            x="50%"
            y="62%"
            textAnchor="middle"
            dominantBaseline="central"
            style={{
              fontSize: size * 0.09,
              fontWeight: 500,
              fill: '#6a6a6a',
            }}
          >
            {subLabel}
          </text>
        )}
      </svg>
    </div>
  );
}
