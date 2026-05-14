'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, ArrowRight } from 'lucide-react';

export interface DropdownItem {
  href: string;
  title: string;
  description: string;
}

interface Props {
  /** The visible label on the trigger ("Product", "Solutions", "Company"). */
  label: string;
  /** Where clicking the trigger itself goes (overview page). Also used for active-state matching. */
  href: string;
  /** Optional intro line shown at the top of the panel. */
  subtext?: string;
  /** Items rendered inside the panel. */
  items: DropdownItem[];
  /** The CTA pill at the bottom of the panel. */
  ctaLabel: string;
  ctaHref: string;
  /** Force two-column layout (used for the long Product menu). */
  wide?: boolean;
}

/**
 * Hover-triggered nav dropdown. Mouse enters the trigger or panel → opens.
 * Mouse leaves both → closes after a 150ms grace so cursor traversal between
 * trigger and panel doesn't dismiss the menu.
 */
export function NavDropdown({ label, href, subtext, items, ctaLabel, ctaHref, wide }: Props) {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(href + '/');

  const cancelClose = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };
  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = setTimeout(() => setOpen(false), 150);
  };

  const isWide = wide ?? items.length > 5;

  return (
    <div
      className="relative"
      onMouseEnter={() => { cancelClose(); setOpen(true); }}
      onMouseLeave={scheduleClose}
    >
      <Link
        href={href}
        className={`so-nav-link${active ? ' is-active' : ''} flex items-center gap-1`}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        {label}
        <ChevronDown
          className="w-3.5 h-3.5 transition-transform"
          style={{ opacity: 0.55, transform: open ? 'rotate(180deg)' : undefined }}
        />
      </Link>

      {open && (
        <div
          className="absolute top-full left-1/2 -translate-x-1/2 pt-3"
          style={{ width: isWide ? 'min(720px, 92vw)' : 380 }}
          role="menu"
        >
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              background: '#ffffff',
              border: '1px solid var(--so-hairline)',
              boxShadow:
                '0 30px 60px -18px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.04)',
            }}
          >
            {subtext && (
              <div
                className="px-5 py-3"
                style={{
                  borderBottom: '1px solid var(--so-hairline)',
                  background: 'var(--so-canvas-soft)',
                }}
              >
                <p
                  className="text-[11px] font-semibold uppercase tracking-[0.14em]"
                  style={{ color: '#ff385c' }}
                >
                  {label}
                </p>
                <p className="mt-1 text-sm" style={{ color: 'var(--so-ink-2)' }}>
                  {subtext}
                </p>
              </div>
            )}
            <div className={isWide ? 'grid grid-cols-2' : 'flex flex-col'}>
              {items.map((it) => (
                <Link
                  key={it.href + it.title}
                  href={it.href}
                  className="group block px-5 py-3.5 transition-colors hover:bg-[var(--so-canvas-soft)]"
                  onClick={() => setOpen(false)}
                  role="menuitem"
                >
                  <p
                    className="text-sm font-semibold flex items-center justify-between gap-2"
                    style={{ color: 'var(--so-ink)' }}
                  >
                    <span>{it.title}</span>
                    <ArrowRight
                      className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all"
                      style={{ color: '#ff385c' }}
                    />
                  </p>
                  <p className="mt-0.5 text-xs leading-snug" style={{ color: 'var(--so-ink-muted)' }}>
                    {it.description}
                  </p>
                </Link>
              ))}
            </div>
            <Link
              href={ctaHref}
              onClick={() => setOpen(false)}
              className="px-5 py-3 text-sm font-semibold flex items-center justify-between transition-colors hover:bg-[var(--so-canvas-soft)]"
              style={{
                borderTop: '1px solid var(--so-hairline)',
                background: '#fff',
                color: '#ff385c',
              }}
            >
              <span>{ctaLabel}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
