/**
 * Skeleton primitives — pulse animations sized to match the real components.
 * Used during initial SQL fetch so dashboards don't show "0 of 0" layouts.
 */

export function SkeletonBlock({
  width = '100%', height = 16, className = '', radius = 6,
}: { width?: number | string; height?: number | string; className?: string; radius?: number }) {
  return (
    <div
      className={`animate-pulse ${className}`}
      style={{
        width:  typeof width  === 'number' ? `${width}px`  : width,
        height: typeof height === 'number' ? `${height}px` : height,
        background: '#e8e8e8',
        borderRadius: radius,
      }}
    />
  );
}

export function KpiCardSkeleton({ size = 'medium' }: { size?: 'medium' | 'large' }) {
  const valueH = size === 'large' ? 36 : 28;
  return (
    <div
      className="rounded-2xl p-4 flex flex-col gap-3 h-full"
      style={{ background: '#ffffff', border: '1px solid #dddddd' }}
    >
      <SkeletonBlock width={90} height={11} />
      <SkeletonBlock width="65%" height={valueH} />
      <SkeletonBlock width="80%" height={11} />
    </div>
  );
}

export function TableRowSkeleton({ cols = 6 }: { cols?: number }) {
  return (
    <div
      className="grid items-center gap-4 px-4 py-3"
      style={{ gridTemplateColumns: `repeat(${cols}, 1fr)`, borderBottom: '1px solid #f0f0f0' }}
    >
      {Array.from({ length: cols }).map((_, i) => (
        <SkeletonBlock key={i} width={i === 0 ? '70%' : '50%'} height={12} />
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 6, cols = 6 }: { rows?: number; cols?: number }) {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: '#ffffff', border: '1px solid #dddddd' }}>
      {Array.from({ length: rows }).map((_, i) => <TableRowSkeleton key={i} cols={cols} />)}
    </div>
  );
}

export function DashboardSkeleton({ kpiCount = 4, large = true }: { kpiCount?: number; large?: boolean }) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <SkeletonBlock width={220} height={22} />
        <div className="mt-2"><SkeletonBlock width={320} height={12} /></div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: kpiCount }).map((_, i) => (
          <KpiCardSkeleton key={i} size={large ? 'large' : 'medium'} />
        ))}
      </div>
      <TableSkeleton rows={6} cols={6} />
    </div>
  );
}
