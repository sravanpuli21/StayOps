'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu, X, ChevronDown } from 'lucide-react';
import { NavDropdown, type DropdownItem } from './NavDropdown';

/* ─── Nav data — mirrors the IA spec ─── */

const PRODUCT_ITEMS: DropdownItem[] = [
  { href: '/website/products', title: 'Platform Overview',     description: 'See the full StayOps system.' },
  { href: '/website/products', title: 'Portfolio Dashboard',   description: 'Every property and key number in one view.' },
  { href: '/website/products', title: 'Revenue & Occupancy',   description: 'Track performance, ADR, RevPAR, and leakage.' },
  { href: '/website/products', title: 'Labour Control',        description: 'Monitor hours, overtime, payroll cost, and variance.' },
  { href: '/website/products', title: 'Operations',            description: 'See rooms, tickets, housekeeping, and daily issues.' },
  { href: '/website/products', title: 'Audits',                description: 'Track compliance, missed checks, and findings.' },
  { href: '/website/products', title: 'Maintenance & Tickets', description: 'Manage repairs, urgent issues, and ticket history.' },
  { href: '/website/products', title: 'Assets & Room History', description: 'Track repair cost, replacement history, and repeat failures.' },
  { href: '/website/products', title: 'Reports',               description: 'Build owner-ready reports faster.' },
  { href: '/website/products', title: 'Mobile Team App',       description: 'Connect dashboard visibility to floor execution.' },
];

const SOLUTIONS_ITEMS: DropdownItem[] = [
  { href: '/website/solutions/owners',       title: 'Hotel Owners',       description: 'See money, risk, and portfolio performance.' },
  { href: '/website/solutions/regional',     title: 'Regional Managers',  description: 'Know which hotel needs attention today.' },
  { href: '/website/solutions/gms',          title: 'General Managers',   description: 'Run one property with clearer visibility.' },
  { href: '/website/solutions/maintenance',  title: 'Maintenance Teams',  description: 'Prioritise urgent tickets and preventive work.' },
  { href: '/website/solutions/housekeeping', title: 'Housekeeping Teams', description: 'Assign rooms and track readiness.' },
  { href: '/website/solutions',              title: 'Employees',          description: 'View shifts, hours, tasks, SOPs, and updates.' },
  { href: '/website/solutions/front-desk',   title: 'Front Desk Access',  description: 'Stay aligned with rooms, guests, and handoffs.' },
];

const COMPANY_ITEMS: DropdownItem[] = [
  { href: '/website/company/about', title: 'About Us', description: 'Why StayOps is being built.' },
  { href: '/website/contact',       title: 'Contact',  description: 'Talk to the StayOps team.' },
];

export function SiteNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Hide the live SiteNav when previewing the flavored end-to-end site
  // — those routes render their own FlavoredSiteNav.
  if (pathname.startsWith('/website/trail/newcontent/')) return null;

  return (
    <header
      className="sticky top-0 z-50 backdrop-blur"
      style={{
        background: 'rgba(255,255,255,0.85)',
        borderBottom: '1px solid var(--so-hairline)',
      }}
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8 h-16 flex items-center justify-between">
        <Link href="/website" className="flex items-center gap-2" onClick={() => setOpen(false)}>
          <Logo />
          <span className="font-semibold text-base tracking-tight">
            <span style={{ color: 'var(--so-ink)' }}>Stay</span>
            <span style={{ color: '#ff385c' }}>Ops</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-7 text-sm">
          {/* Home */}
          <Link
            href="/website"
            className={`so-nav-link${pathname === '/website' ? ' is-active' : ''}`}
          >
            Home
          </Link>

          {/* Product (wide dropdown — 10 items, 2 cols) */}
          <NavDropdown
            label="Product"
            href="/website/products"
            subtext="One platform for portfolio visibility, property operations, reporting, and team execution."
            items={PRODUCT_ITEMS}
            ctaLabel="View Product"
            ctaHref="/website/products"
            wide
          />

          {/* Solutions */}
          <NavDropdown
            label="Solutions"
            href="/website/solutions"
            subtext="Role-based views for hotel leaders and property teams."
            items={SOLUTIONS_ITEMS}
            ctaLabel="View Solutions"
            ctaHref="/website/solutions"
            wide
          />

          {/* Company */}
          <NavDropdown
            label="Company"
            href="/website/company"
            items={COMPANY_ITEMS}
            ctaLabel="Contact Us"
            ctaHref="/website/contact"
          />
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
        <MobileMenu
          pathname={pathname}
          onNavigate={() => setOpen(false)}
        />
      )}
    </header>
  );
}

/* ─── Mobile drawer with expandable parents ─────────────────────────────── */

function MobileMenu({ pathname, onNavigate }: { pathname: string; onNavigate: () => void }) {
  const sections = [
    { href: '/website',          label: 'Home',      items: undefined as DropdownItem[] | undefined },
    { href: '/website/products', label: 'Product',   items: PRODUCT_ITEMS   },
    { href: '/website/solutions',label: 'Solutions', items: SOLUTIONS_ITEMS },
    { href: '/website/company',  label: 'Company',   items: COMPANY_ITEMS   },
  ];

  return (
    <div
      className="md:hidden"
      style={{ borderTop: '1px solid var(--so-hairline)', background: 'var(--so-canvas)' }}
    >
      <div className="mx-auto max-w-7xl px-5 py-4 flex flex-col gap-1">
        {sections.map((s) =>
          s.items
            ? <MobileExpandable key={s.label} section={{ href: s.href, label: s.label, items: s.items }} pathname={pathname} onNavigate={onNavigate} />
            : (
                <Link
                  key={s.label}
                  href={s.href}
                  onClick={onNavigate}
                  className={`so-nav-link-mobile${pathname === s.href ? ' is-active' : ''}`}
                >
                  {s.label}
                </Link>
              )
        )}
        <Link
          href="/website/contact"
          onClick={onNavigate}
          className="mt-3 stayops-cta w-full justify-center"
        >
          Book a demo
        </Link>
      </div>
    </div>
  );
}

function MobileExpandable({
  section, pathname, onNavigate,
}: {
  section: { href: string; label: string; items: DropdownItem[] };
  pathname: string;
  onNavigate: () => void;
}) {
  const active = pathname === section.href || pathname.startsWith(section.href + '/');
  const [expanded, setExpanded] = useState(active);

  return (
    <div>
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className={`so-nav-link-mobile w-full flex items-center justify-between${active ? ' is-active' : ''}`}
      >
        <span>{section.label}</span>
        <ChevronDown
          className="w-4 h-4 transition-transform"
          style={{ opacity: 0.6, transform: expanded ? 'rotate(180deg)' : undefined }}
        />
      </button>
      {expanded && (
        <div className="ml-3 mt-1 mb-2 flex flex-col gap-0.5"
          style={{ borderLeft: '1px solid var(--so-hairline)' }}>
          <Link
            href={section.href}
            onClick={onNavigate}
            className="block pl-4 py-2 text-sm font-semibold"
            style={{ color: 'var(--so-ink)' }}
          >
            {section.label} overview
          </Link>
          {section.items.map((it) => (
            <Link
              key={it.href + it.title}
              href={it.href}
              onClick={onNavigate}
              className="block pl-4 py-2 text-sm transition-colors hover:bg-[var(--so-canvas-soft)] rounded"
              style={{ color: 'var(--so-ink-muted)' }}
            >
              {it.title}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function Logo() {
  // Portfolio-grid mark: four tiles "coming into one dashboard". One accent tile.
  return (
    <svg aria-hidden width="22" height="22" viewBox="0 0 22 22" fill="none">
      <rect x="2"  y="2"  width="8" height="8" rx="1.5" fill="var(--so-ink)" />
      <rect x="12" y="2"  width="8" height="8" rx="1.5" fill="var(--so-ink)" opacity="0.55" />
      <rect x="2"  y="12" width="8" height="8" rx="1.5" fill="var(--so-ink)" opacity="0.55" />
      <rect x="12" y="12" width="8" height="8" rx="1.5" fill="#ff385c" />
    </svg>
  );
}
