import Link from 'next/link';

const COLS: Array<{ title: string; links: Array<{ label: string; href: string }> }> = [
  {
    title: 'Product',
    links: [
      { label: 'Products',    href: '/website/products' },
      { label: 'Solutions',   href: '/website/solutions' },
      { label: 'Book a demo', href: '/website/contact' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About',   href: '/website/company/about' },
      { label: 'Story',   href: '/website/company/story' },
      { label: 'Contact', href: '/website/contact' },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer
      style={{
        borderTop: '1px solid var(--so-hairline)',
        background: 'var(--so-canvas-soft)',
      }}
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8 py-16 sm:py-20">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-10">
          <div className="sm:col-span-2">
            <Link href="/website" className="inline-flex items-center gap-2">
              <svg aria-hidden width="22" height="22" viewBox="0 0 22 22" fill="none" style={{ color: 'var(--so-ink)' }}>
                <rect x="2" y="5" width="18" height="2" rx="1" fill="currentColor" />
                <rect x="2" y="10" width="18" height="2" rx="1" fill="currentColor" />
                <rect x="2" y="15" width="12" height="2" rx="1" fill="currentColor" />
              </svg>
              <span className="font-semibold tracking-tight text-lg" style={{ color: 'var(--so-ink)' }}>
                StayOps
              </span>
            </Link>
            <p className="mt-5 text-sm max-w-md" style={{ color: 'var(--so-ink-muted)', lineHeight: 1.65 }}>
              Your occupancy is not your profit. StayOps shows hotel owners where the money
              actually goes — and gives their teams a clearer way to run the day.
            </p>
          </div>

          {COLS.map((col) => (
            <div key={col.title}>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em]"
                 style={{ color: 'var(--so-ink-dim)' }}>
                {col.title}
              </p>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-sm transition-colors"
                      style={{ color: 'var(--so-ink-2)' }}
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div
          className="mt-14 pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
          style={{ borderTop: '1px solid var(--so-hairline)' }}
        >
          <p className="text-xs" style={{ color: 'var(--so-ink-dim)' }}>
            © {new Date().getFullYear()} StayOps. Built by operators, for operators.
          </p>
          <p className="text-xs" style={{ color: 'var(--so-ink-dim)' }}>
            Made for independent &amp; franchise hotel operators.
          </p>
        </div>
      </div>
    </footer>
  );
}
