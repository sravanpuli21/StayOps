export function LeakagePreviewCard() {
  const rows = [
    { channel: 'Direct',      gross: 129, net: 124, tone: 'good' as const },
    { channel: 'Brand.com',   gross: 135, net: 126, tone: 'ok'   as const },
    { channel: 'Booking.com', gross: 131, net: 100, tone: 'bad'  as const },
    { channel: 'Expedia',     gross: 126, net:  91, tone: 'bad'  as const },
  ];
  const toneColor = (t: 'good' | 'ok' | 'bad') =>
    t === 'good' ? 'var(--so-good)' : t === 'ok' ? 'var(--so-warn)' : 'var(--so-bad)';

  return (
    <div
      className="rounded-2xl p-5 sm:p-6 stayops-grain"
      style={{
        background: 'linear-gradient(180deg, rgba(247,169,104,0.04) 0%, var(--so-card) 100%)',
        border: '1px solid var(--so-border)',
        boxShadow: '0 20px 60px -20px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.02) inset',
      }}
    >
      <div className="flex items-center justify-between">
        <p
          className="text-[11px] font-medium uppercase tracking-[0.14em]"
          style={{ color: 'var(--so-ink-dim)' }}
        >
          Last 30 days
        </p>
        <span
          className="text-[11px] font-medium"
          style={{ color: 'var(--so-ink-dim)' }}
        >
          sample
        </span>
      </div>

      <p
        className="mt-4 text-4xl sm:text-5xl font-semibold tabular-nums tracking-tight"
        style={{ color: 'var(--so-ink)', letterSpacing: '-0.02em' }}
      >
        $47,300
      </p>
      <p className="mt-1 text-sm" style={{ color: 'var(--so-bad)' }}>
        leaked to OTAs this month
      </p>

      <div className="mt-6" style={{ borderTop: '1px solid var(--so-border-soft)' }}>
        {rows.map((r, i) => (
          <div
            key={r.channel}
            className="flex items-center justify-between py-3 text-sm"
            style={i < rows.length - 1 ? { borderBottom: '1px solid var(--so-border-soft)' } : undefined}
          >
            <span className="font-medium" style={{ color: 'var(--so-ink)' }}>{r.channel}</span>
            <span className="flex items-baseline gap-3">
              <span className="tabular-nums text-xs" style={{ color: 'var(--so-ink-dim)' }}>
                ${r.gross}
              </span>
              <span
                className="tabular-nums font-semibold"
                style={{ color: toneColor(r.tone) }}
              >
                ${r.net}
              </span>
            </span>
          </div>
        ))}
      </div>

      <p
        className="mt-5 text-xs leading-relaxed rounded-lg p-3"
        style={{
          background: 'rgba(239, 122, 114, 0.08)',
          color: 'var(--so-bad)',
          border: '1px solid rgba(239, 122, 114, 0.2)',
        }}
      >
        Booking.com leaves you $31 less per night than Direct. Across 390 bookings, that&apos;s
        $12,090 you didn&apos;t see on any report.
      </p>
    </div>
  );
}
