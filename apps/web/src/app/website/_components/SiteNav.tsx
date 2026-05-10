'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

const LINKS = [
  { href: '/website/products',  label: 'Product'      },
  { href: '/website/solutions', label: 'Solutions'    },
  { href: '/website/why',       label: 'Why StayOps'  },
  { href: '/website/company',   label: 'Company'      },
];

export function SiteNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header
      className="sticky top-0 z-50 backdrop-blur"
      style={{
        background: 'rgba(255,255,255,0.8)',
        borderBottom: '1px solid var(--so-hairline)',
      }}
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8 h-16 flex items-center justify-between">
        <Link
          href="/website"
          className="flex items-center gap-2"
          onClick={() => setOpen(false)}
        >
          <Logo />
          <span
            className="font-semibold text-base tracking-tight"
            style={{ color: 'var(--so-ink)' }}
          >
            StayOps
          </span>
        </Link>

        <nav
          className="hidden md:flex items-center gap-8 text-sm"
        >
          {LINKS.map((l) => {
            const active = pathname === l.href || pathname.startsWith(l.href + '/');
            return (
              <Link
                key={l.href}
                href={l.href}
                className="transition-colors"
                style={{
                  color: active ? 'var(--so-ink)' : 'var(--so-ink-muted)',
                  fontWeight: 500,
                }}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/website/contact"
            className="hidden sm:inline-flex stayops-cta"
            style={{ padding: '0.55rem 1.2rem', fontSize: '0.88rem' }}
          >
            Book a demo
          </Link>
          <button
            type="button"
            aria-label="Toggle menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="md:hidden inline-flex w-10 h-10 items-center justify-center rounded-full"
            style={{ border: '1px solid var(--so-border)', color: 'var(--so-ink)' }}
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div
          className="md:hidden"
          style={{ borderTop: '1px solid var(--so-hairline)', background: 'var(--so-canvas)' }}
        >
          <div className="mx-auto max-w-7xl px-5 py-4 flex flex-col gap-1">
            {LINKS.map((l) => {
              const active = pathname === l.href || pathname.startsWith(l.href + '/');
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="py-3 px-2 rounded-lg text-base transition-colors"
                  style={{
                    color: active ? 'var(--so-ink)' : 'var(--so-ink-muted)',
                    background: active ? 'var(--so-cream)' : 'transparent',
                    fontWeight: 500,
                  }}
                >
                  {l.label}
                </Link>
              );
            })}
            <Link
              href="/website/contact"
              onClick={() => setOpen(false)}
              className="mt-3 stayops-cta w-full justify-center"
            >
              Book a demo
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

function Logo() {
  // Small mark: three stacked horizontal bars suggesting "layers / clarity"
  return (
    <svg
      aria-hidden
      width="22" height="22" viewBox="0 0 22 22" fill="none"
    >
      <rect x="2"  y="5"  width="18" height="2" rx="1" fill="currentColor" />
      <rect x="2"  y="10" width="18" height="2" rx="1" fill="currentColor" />
      <rect x="2"  y="15" width="12" height="2" rx="1" fill="currentColor" />
    </svg>
  );
}
