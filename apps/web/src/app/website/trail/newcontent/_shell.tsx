'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useRef, type CSSProperties } from 'react';
import { Menu, X, ArrowRight, ChevronDown } from 'lucide-react';
import type { Palette, Flavor } from './_palette';
import { fp } from './_palette';

/* ─── Dropdown data — mirrors the IA spec ──────────────────────────────── */
interface DropdownItem { href: string; title: string; description: string }

const productItems = (flavor: Flavor): DropdownItem[] => [
  { href: fp(flavor, '/products'),                              title: 'Platform Overview',     description: 'See the full StayOps system.' },
  { href: fp(flavor, '/products/portfolio-dashboard'),          title: 'Portfolio Dashboard',   description: 'Every property and key number in one view.' },
  { href: fp(flavor, '/products/revenue-occupancy'),            title: 'Revenue & Occupancy',   description: 'Track performance, ADR, RevPAR, and leakage.' },
  { href: fp(flavor, '/products/labour-control'),               title: 'Labour Control',        description: 'Monitor hours, overtime, payroll cost, and variance.' },
  { href: fp(flavor, '/products/operations'),                   title: 'Operations',            description: 'See rooms, tickets, housekeeping, and daily issues.' },
  { href: fp(flavor, '/products/audits'),                       title: 'Audits',                description: 'Track compliance, missed checks, and findings.' },
  { href: fp(flavor, '/products/maintenance-tickets'),          title: 'Maintenance & Tickets', description: 'Manage repairs, urgent issues, and ticket history.' },
  { href: fp(flavor, '/products/assets-room-history'),          title: 'Assets & Room History', description: 'Track repair cost, replacement history, and repeat failures.' },
  { href: fp(flavor, '/products/reports'),                      title: 'Reports',               description: 'Build owner-ready reports faster.' },
  { href: fp(flavor, '/products/mobile-team-app'),              title: 'Mobile Team App',       description: 'Connect dashboard visibility to floor execution.' },
];

const solutionItems = (flavor: Flavor): DropdownItem[] => [
  { href: fp(flavor, '/solutions/owners'),       title: 'Hotel Owners',       description: 'See money, risk, and portfolio performance.' },
  { href: fp(flavor, '/solutions/regional'),     title: 'Regional Managers',  description: 'Know which hotel needs attention today.' },
  { href: fp(flavor, '/solutions/gms'),          title: 'General Managers',   description: 'Run one property with clearer visibility.' },
  { href: fp(flavor, '/solutions/accountant'),   title: 'Accounting-Ready Operations', description: 'Coming soon · Capture purchase, repair, vendor, room, asset, and cost context at the source.' },
  { href: fp(flavor, '/solutions/maintenance'),  title: 'Maintenance Teams',  description: 'Prioritise urgent tickets and preventive work.' },
  { href: fp(flavor, '/solutions/housekeeping'), title: 'Housekeeping Teams', description: 'Assign rooms and track readiness.' },
  { href: fp(flavor, '/solutions/employees'),    title: 'Employees',          description: 'View shifts, hours, tasks, SOPs, and updates.' },
  { href: fp(flavor, '/solutions/front-desk'),   title: 'Front Desk Access',  description: 'Stay aligned with rooms, guests, and handoffs.' },
];

const companyItems = (flavor: Flavor): DropdownItem[] => [
  { href: fp(flavor, '/company/about'), title: 'About Us', description: 'The story behind StayOps and why we are building it.' },
  { href: fp(flavor, '/why'),           title: 'Why StayOps', description: 'Hidden operational losses and the gap StayOps is built to close.' },
  { href: fp(flavor, '/contact'),       title: 'Contact',  description: 'Talk to the StayOps team.' },
];

/* ─── Flavored top nav ─────────────────────────────────────────────────── */
export function FlavoredSiteNav({ palette: P, flavor }: { palette: Palette; flavor: Flavor }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isDark = P.flavor === 'night';

  /* Set CSS vars used by .flavor-nav-link so hover/active animation works */
  const navLinkVars: CSSProperties = {
    '--fnav-color':  isDark ? '#a8a8a8' : P.muted,
    '--fnav-hover':  P.text,
    '--fnav-accent': P.brand,
  } as CSSProperties;

  const isActive = (path: string) =>
    path === fp(flavor, '/') ? pathname === path : pathname === path || pathname.startsWith(path + '/');

  return (
    <header
      className="sticky top-0 z-50 backdrop-blur"
      style={{
        background: isDark ? 'rgba(10,10,10,0.85)' : 'rgba(255,255,255,0.85)',
        borderBottom: `1px solid ${P.border}`,
      }}
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8 h-16 flex items-center justify-between">
        <Link href={fp(flavor, '/')} onClick={() => setMobileOpen(false)} className="flex items-center gap-2">
          <Logo inkColor={P.text} />
          <span className="font-semibold text-base tracking-tight">
            <span style={{ color: P.text }}>Stay</span>
            <span style={{ color: P.brand }}>Ops</span>
          </span>
          <span className="ml-1 text-[10px] uppercase tracking-widest opacity-60" style={{ color: P.muted }}>
            {flavor}
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-7 text-sm">
          <Link href={fp(flavor, '/')}
            className={`flavor-nav-link${isActive(fp(flavor, '/')) ? ' is-active' : ''}`}
            style={navLinkVars}>
            Home
          </Link>

          <FlavoredNavDropdown palette={P} flavor={flavor}
            label="Product" href={fp(flavor, '/products')}
            subtext="One platform for portfolio visibility, property operations, reporting, and team execution."
            items={productItems(flavor)}
            ctaLabel="View Product" ctaHref={fp(flavor, '/products')}
            wide
            navLinkVars={navLinkVars}
          />

          <FlavoredNavDropdown palette={P} flavor={flavor}
            label="Solutions" href={fp(flavor, '/solutions')}
            subtext="Role-based views for hotel leaders and property teams."
            items={solutionItems(flavor)}
            ctaLabel="View Solutions" ctaHref={fp(flavor, '/solutions')}
            wide
            navLinkVars={navLinkVars}
          />

          <Link href={fp(flavor, '/why')}
            className={`flavor-nav-link${isActive(fp(flavor, '/why')) ? ' is-active' : ''}`}
            style={navLinkVars}>
            Why StayOps
          </Link>

          <FlavoredNavDropdown palette={P} flavor={flavor}
            label="Company" href={fp(flavor, '/company')}
            items={companyItems(flavor)}
            ctaLabel="Contact Us" ctaHref={fp(flavor, '/contact')}
            navLinkVars={navLinkVars}
          />
        </nav>

        <div className="flex items-center gap-3">
          <Link href={fp(flavor, '/contact')}
            className="hidden sm:inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition-all hover:scale-[1.03] hover:shadow-lg"
            style={{ background: P.buttonPrimary.bg, color: P.buttonPrimary.text }}>
            Book a demo <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <button type="button" aria-label="Toggle menu" onClick={() => setMobileOpen((v) => !v)}
            className="md:hidden inline-flex w-10 h-10 items-center justify-center rounded-full"
            style={{ border: `1px solid ${P.border}`, color: P.text }}>
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && <MobileMenu palette={P} flavor={flavor} pathname={pathname} onClose={() => setMobileOpen(false)} />}
    </header>
  );
}

/* ─── Flavored dropdown — mirror of NavDropdown with palette tokens ───── */
function FlavoredNavDropdown({
  palette: P, flavor, label, href, subtext, items, ctaLabel, ctaHref, wide, navLinkVars,
}: {
  palette: Palette;
  flavor: Flavor;
  label: string;
  href: string;
  subtext?: string;
  items: DropdownItem[];
  ctaLabel: string;
  ctaHref: string;
  wide?: boolean;
  navLinkVars: CSSProperties;
}) {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(href + '/');
  const isWide = wide ?? items.length > 5;

  const cancelClose = () => {
    if (closeTimer.current) { clearTimeout(closeTimer.current); closeTimer.current = null; }
  };
  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = setTimeout(() => setOpen(false), 150);
  };

  /* Hover bg for menu items — tint depends on flavor */
  const menuItemVars: CSSProperties = {
    '--fmenu-hover-bg': P.flavor === 'night' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
  } as CSSProperties;

  return (
    <div className="relative"
      onMouseEnter={() => { cancelClose(); setOpen(true); }}
      onMouseLeave={scheduleClose}>
      <Link href={href}
        className={`flavor-nav-link${active ? ' is-active' : ''} flex items-center gap-1`}
        style={navLinkVars}
        aria-haspopup="menu" aria-expanded={open}>
        {label}
        <ChevronDown className="w-3.5 h-3.5 transition-transform"
          style={{ opacity: 0.55, transform: open ? 'rotate(180deg)' : undefined }} />
      </Link>

      {open && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 pt-3"
          style={{ width: isWide ? 'min(720px, 92vw)' : 380 }}
          role="menu">
          <div className="rounded-2xl overflow-hidden"
            style={{
              background: P.card,
              border: `1px solid ${P.border}`,
              boxShadow: '0 30px 60px -18px rgba(0,0,0,0.35), 0 0 0 1px rgba(0,0,0,0.04)',
            }}>
            {subtext && (
              <div className="px-5 py-3"
                style={{ borderBottom: `1px solid ${P.border}`, background: P.cardAlt }}>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em]"
                  style={{ color: P.brand }}>
                  {label}
                </p>
                <p className="mt-1 text-sm" style={{ color: P.body }}>{subtext}</p>
              </div>
            )}
            <div className={isWide ? 'grid grid-cols-2' : 'flex flex-col'}>
              {items.map((it) => (
                <Link key={it.href + it.title} href={it.href}
                  onClick={() => setOpen(false)}
                  role="menuitem"
                  className="group flavor-menu-item block px-5 py-3.5"
                  style={menuItemVars}>
                  <p className="text-sm font-semibold flex items-center justify-between gap-2"
                    style={{ color: P.text }}>
                    <span>{it.title}</span>
                    <ArrowRight
                      className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all"
                      style={{ color: P.brand }} />
                  </p>
                  <p className="mt-0.5 text-xs leading-snug" style={{ color: P.muted }}>{it.description}</p>
                </Link>
              ))}
            </div>
            <Link href={ctaHref} onClick={() => setOpen(false)}
              className="flavor-menu-item px-5 py-3 text-sm font-semibold flex items-center justify-between"
              style={{
                ...menuItemVars,
                borderTop: `1px solid ${P.border}`,
                background: P.cardAlt,
                color: P.brand,
              }}>
              <span>{ctaLabel}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Mobile drawer with expandable parents ───────────────────────────── */
function MobileMenu({
  palette: P, flavor, pathname, onClose,
}: {
  palette: Palette;
  flavor: Flavor;
  pathname: string;
  onClose: () => void;
}) {
  const isDark = P.flavor === 'night';
  const sections: Array<{ label: string; href: string; items?: DropdownItem[] }> = [
    { label: 'Home',         href: fp(flavor, '/') },
    { label: 'Product',      href: fp(flavor, '/products'),  items: productItems(flavor)  },
    { label: 'Solutions',    href: fp(flavor, '/solutions'), items: solutionItems(flavor) },
    { label: 'Why StayOps',  href: fp(flavor, '/why') },
    { label: 'Company',      href: fp(flavor, '/company'),   items: companyItems(flavor)  },
  ];

  return (
    <div style={{ borderTop: `1px solid ${P.border}`, background: P.pageBg }}>
      <div className="mx-auto max-w-7xl px-5 py-4 flex flex-col gap-1">
        {sections.map((s) =>
          s.items
            ? <MobileExpandable key={s.label} palette={P} section={s as { label: string; href: string; items: DropdownItem[] }}
                pathname={pathname} onClose={onClose} />
            : (
                <Link key={s.label} href={s.href} onClick={onClose}
                  className="py-3 px-2 rounded-lg text-base"
                  style={{
                    color: pathname === s.href ? P.text : (isDark ? '#a8a8a8' : P.muted),
                    background: pathname === s.href ? (isDark ? 'rgba(255,255,255,0.05)' : '#f5f2ec') : 'transparent',
                    fontWeight: 500,
                  }}>
                  {s.label}
                </Link>
              )
        )}
        <Link href={fp(flavor, '/contact')} onClick={onClose}
          className="mt-3 inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold"
          style={{ background: P.buttonPrimary.bg, color: P.buttonPrimary.text }}>
          Book a demo <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}

function MobileExpandable({
  palette: P, section, pathname, onClose,
}: {
  palette: Palette;
  section: { label: string; href: string; items: DropdownItem[] };
  pathname: string;
  onClose: () => void;
}) {
  const isDark = P.flavor === 'night';
  const active = pathname === section.href || pathname.startsWith(section.href + '/');
  const [expanded, setExpanded] = useState(active);

  return (
    <div>
      <button type="button" onClick={() => setExpanded((v) => !v)}
        className="py-3 px-2 rounded-lg text-base w-full flex items-center justify-between"
        style={{
          color: active ? P.text : (isDark ? '#a8a8a8' : P.muted),
          background: active ? (isDark ? 'rgba(255,255,255,0.05)' : '#f5f2ec') : 'transparent',
          fontWeight: 500,
        }}>
        <span>{section.label}</span>
        <ChevronDown className="w-4 h-4 transition-transform"
          style={{ opacity: 0.6, transform: expanded ? 'rotate(180deg)' : undefined }} />
      </button>
      {expanded && (
        <div className="ml-3 mt-1 mb-2 flex flex-col gap-0.5"
          style={{ borderLeft: `1px solid ${P.border}` }}>
          <Link href={section.href} onClick={onClose}
            className="block pl-4 py-2 text-sm font-semibold"
            style={{ color: P.text }}>
            {section.label} overview
          </Link>
          {section.items.map((it) => (
            <Link key={it.href + it.title} href={it.href} onClick={onClose}
              className="block pl-4 py-2 text-sm transition-colors hover:bg-[var(--fmenu-hover-bg)] rounded"
              style={{
                ...({'--fmenu-hover-bg': isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)'} as CSSProperties),
                color: isDark ? '#a8a8a8' : P.muted,
              }}>
              {it.title}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Flavored footer ──────────────────────────────────────────────────── */
export function FlavoredSiteFooter({ palette: P, flavor }: { palette: Palette; flavor: Flavor }) {
  const isDark = P.flavor === 'night';
  const productLinks = [
    'Platform Overview', 'Portfolio Dashboard', 'Revenue & Occupancy', 'Labour Control',
    'Operations', 'Audits', 'Maintenance & Tickets', 'Assets & Room History', 'Reports', 'Mobile Team App',
  ];
  const productSlugs = [
    '', 'portfolio-dashboard', 'revenue-occupancy', 'labour-control',
    'operations', 'audits', 'maintenance-tickets', 'assets-room-history', 'reports', 'mobile-team-app',
  ];
  const solutionLinks = [
    { label: 'Hotel Owners',      slug: 'owners' },
    { label: 'Regional Managers', slug: 'regional' },
    { label: 'General Managers',  slug: 'gms' },
    { label: 'Accounting-Ready Ops', slug: 'accountant' },
    { label: 'Maintenance Teams', slug: 'maintenance' },
    { label: 'Housekeeping Teams',slug: 'housekeeping' },
    { label: 'Employees',         slug: 'employees' },
    { label: 'Front Desk Access', slug: 'front-desk' },
  ];

  return (
    <footer style={{
      background: isDark ? '#080808' : P.sectionAlt,
      borderTop: `1px solid ${P.border}`,
      color: P.text,
    }}>
      <div className="mx-auto max-w-7xl px-5 sm:px-8 py-12 grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10 text-sm">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] mb-3" style={{ color: P.muted }}>Product</p>
          <ul className="flex flex-col gap-2">
            {productLinks.map((label, i) => (
              <li key={label}>
                <Link href={fp(flavor, `/products${productSlugs[i] ? `/${productSlugs[i]}` : ''}`)}
                  className="transition-colors hover:opacity-70" style={{ color: P.body }}>
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] mb-3" style={{ color: P.muted }}>Solutions</p>
          <ul className="flex flex-col gap-2">
            {solutionLinks.map((s) => (
              <li key={s.slug}>
                <Link href={fp(flavor, `/solutions/${s.slug}`)}
                  className="transition-colors hover:opacity-70" style={{ color: P.body }}>
                  {s.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] mb-3" style={{ color: P.muted }}>Company</p>
          <ul className="flex flex-col gap-2">
            {[
              { label: 'About Us',     href: fp(flavor, '/company/about') },
              { label: 'Why StayOps',  href: fp(flavor, '/why')           },
              { label: 'Contact',      href: fp(flavor, '/contact')       },
              { label: 'Book a Demo',  href: fp(flavor, '/contact')       },
            ].map((l) => (
              <li key={l.label}>
                <Link href={l.href} className="transition-colors hover:opacity-70" style={{ color: P.body }}>{l.label}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] mb-3" style={{ color: P.muted }}>Contact</p>
          <ul className="flex flex-col gap-2" style={{ color: P.body }}>
            <li>hello@stayops.com</li>
            <li>Weekdays · 9 AM – 6 PM ET</li>
            <li>
              <Link href={fp(flavor, '/demo')} className="transition-colors hover:opacity-70">
                Request demo →
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-5 sm:px-8 py-5 flex items-center justify-between flex-wrap gap-3 text-xs"
        style={{ borderTop: `1px solid ${P.border}`, color: P.subtle }}>
        <p>© StayOps · {new Date().getFullYear()}</p>
        <p className="uppercase tracking-[0.14em]">Preview · {flavor}</p>
        <Link href="/website" className="transition-colors hover:opacity-70" style={{ color: P.subtle }}>
          ← Back to live site
        </Link>
      </div>
    </footer>
  );
}

function Logo({ inkColor = '#0a0a0a' }: { inkColor?: string }) {
  // Portfolio-grid mark: four tiles "coming into one dashboard". One accent tile.
  return (
    <svg aria-hidden width="22" height="22" viewBox="0 0 22 22" fill="none">
      <rect x="2"  y="2"  width="8" height="8" rx="1.5" fill={inkColor} />
      <rect x="12" y="2"  width="8" height="8" rx="1.5" fill={inkColor} opacity="0.55" />
      <rect x="2"  y="12" width="8" height="8" rx="1.5" fill={inkColor} opacity="0.55" />
      <rect x="12" y="12" width="8" height="8" rx="1.5" fill="#ff385c" />
    </svg>
  );
}
