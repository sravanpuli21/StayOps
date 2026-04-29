interface SparklineProps {
  data: number[];
  height?: number;
  width?: number;
  accent?: string;
  showBars?: boolean;
  className?: string;
}

export function Sparkline({
  data,
  height = 32,
  width = 140,
  accent = '#ff385c',
  showBars = true,
  className,
}: SparklineProps) {
  if (!data || data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const n = data.length;

  const points = data.map((v, i) => {
    const x = (i / (n - 1)) * width;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  // Smooth path via cubic bezier midpoints
  const path = points.reduce((acc, p, i) => {
    if (i === 0) return `M${p}`;
    const [px, py] = points[i - 1].split(',').map(Number);
    const [cx, cy] = p.split(',').map(Number);
    const mx = (px + cx) / 2;
    return `${acc} Q${px},${py} ${mx},${(py + cy) / 2} T${cx},${cy}`;
  }, '');

  const barWidth = (width / n) * 0.6;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      role="img"
      aria-label="trend sparkline"
    >
      {showBars && (
        <g opacity="0.35">
          {data.map((v, i) => {
            const x = (i / (n - 1)) * width;
            const barH = ((v - min) / range) * (height - 4);
            return (
              <rect
                key={i}
                x={x - barWidth / 2}
                y={height - barH - 2}
                width={barWidth}
                height={Math.max(barH, 1)}
                fill="#dddddd"
                rx="1"
              />
            );
          })}
        </g>
      )}
      <path
        d={path}
        fill="none"
        stroke={accent}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
