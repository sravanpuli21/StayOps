import { DonutRing } from './DonutRing';

interface Ring {
  value: number;
  label: string;
  compareLabel: string;
  compareValue: string;
  compareChange: string;
  compareDirection: 'up' | 'down';
}

interface Props {
  rings: Ring[];
  size?: number;
  className?: string;
}

export function DonutPair({ rings, size = 140, className }: Props) {
  return (
    <div className={`flex justify-around items-start gap-4 ${className ?? ''}`}>
      {rings.map((ring, i) => {
        const color = ring.compareDirection === 'up' ? '#15803d' : '#b91c1c';
        const glyph = ring.compareDirection === 'up' ? '↗' : '↘';
        const sign = ring.compareDirection === 'up' ? '+' : '';
        return (
          <div key={i} className="flex flex-col items-center gap-2">
            <p className="text-sm font-medium" style={{ color: '#222' }}>
              {ring.label}
            </p>
            <DonutRing
              value={ring.value}
              size={size}
              accent={i === 1 ? '#8b8b9a' : '#ff385c'}
            />
            <div className="flex flex-col items-center">
              <p className="text-xs mt-1" style={{ color: '#6a6a6a' }}>
                {ring.compareLabel}
              </p>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-sm font-semibold" style={{ color: '#222' }}>
                  {ring.compareValue}
                </span>
                <span className="text-xs font-semibold flex items-center gap-0.5" style={{ color }}>
                  <span>{glyph}</span>
                  <span>{sign}{ring.compareChange}</span>
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
