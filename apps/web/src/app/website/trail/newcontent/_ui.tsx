/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, ChevronRight, CheckCircle2 } from 'lucide-react';
import type { Palette } from './_palette';
import { altPaletteFor } from './_palette';

/* ─── Hero ───────────────────────────────────────────────────────────────── */
export function Hero({
  palette: P, photo, eyebrow, headline, subhead, supporting,
  primaryCta, secondaryCta, trustLine,
}: {
  palette: Palette;
  photo: string;
  eyebrow: string;
  headline: string;
  subhead?: string;
  supporting?: string;
  primaryCta?: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  trustLine?: string;
}) {
  const isDark = P.flavor === 'night';
  return (
    <section className="relative" style={{ height: 'min(82vh, 820px)' }}>
      <img src={photo} alt="" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0" style={{ background: P.heroOverlay }} />
      <div className="relative z-10 h-full mx-auto max-w-6xl px-5 sm:px-8 flex flex-col justify-end pb-16 sm:pb-20" style={{ color: P.text }}>
        <span className="inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em]"
          style={{
            background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.85)',
            border:     isDark ? '1px solid rgba(255,255,255,0.2)' : `1px solid ${P.border}`,
            color:      P.text,
            backdropFilter: 'blur(6px)',
          }}>
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: P.brand }} />
          {eyebrow}
        </span>
        <h1 className="mt-5"
          style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)', lineHeight: 1.02, letterSpacing: '-0.03em', maxWidth: '18ch', fontWeight: 600, color: P.text }}>
          {headline}
        </h1>
        {subhead && (
          <p className="mt-5 text-base sm:text-lg lg:text-xl whitespace-normal lg:whitespace-pre-line"
            style={{ color: isDark ? 'rgba(255,255,255,0.85)' : P.body, maxWidth: '52ch', lineHeight: 1.55 }}>
            {subhead}
          </p>
        )}
        {supporting && (
          <p className="mt-3 text-sm sm:text-base whitespace-normal lg:whitespace-pre-line"
            style={{ color: isDark ? 'rgba(255,255,255,0.65)' : P.subtle, maxWidth: '52ch' }}>
            {supporting}
          </p>
        )}
        {(primaryCta || secondaryCta) && (
          <div className="mt-8 flex items-center gap-3 flex-wrap">
            {primaryCta && <PrimaryButton palette={P} {...primaryCta} />}
            {secondaryCta && <SecondaryButton palette={P} {...secondaryCta} />}
          </div>
        )}
        {trustLine && (
          <p className="mt-5 text-xs sm:text-sm" style={{ color: P.subtle }}>{trustLine}</p>
        )}
      </div>
    </section>
  );
}

/* ─── Page Hero (no image, used on inner pages) ─────────────────────────── */
export function PageHero({
  palette: P, eyebrow, headline, subhead, primaryCta, secondaryCta,
}: {
  palette: Palette;
  eyebrow?: string;
  headline: string;
  subhead?: string;
  primaryCta?: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
}) {
  return (
    <section style={{ background: P.pageBg }}>
      <div className="mx-auto max-w-5xl px-5 sm:px-8 pt-24 sm:pt-32 pb-12 sm:pb-16">
        {eyebrow && (
          <p className="text-xs font-semibold uppercase tracking-[0.14em]" style={{ color: P.brand }}>
            {eyebrow}
          </p>
        )}
        <h1 className="mt-3"
          style={{
            fontSize: 'clamp(2.25rem, 5vw, 4rem)', lineHeight: 1.05,
            letterSpacing: '-0.025em', maxWidth: '24ch', fontWeight: 600, color: P.text,
          }}>
          {headline}
        </h1>
        {subhead && (
          <p className="mt-5 text-base sm:text-lg lg:text-xl"
            style={{ color: P.body, maxWidth: '60ch', lineHeight: 1.55 }}>
            {subhead}
          </p>
        )}
        {(primaryCta || secondaryCta) && (
          <div className="mt-8 flex items-center gap-3 flex-wrap">
            {primaryCta && <PrimaryButton palette={P} {...primaryCta} />}
            {secondaryCta && <SecondaryButton palette={P} {...secondaryCta} />}
          </div>
        )}
      </div>
    </section>
  );
}

/* ─── Buttons ────────────────────────────────────────────────────────────── */
export function PrimaryButton({ palette: P, label, href }: { palette: Palette; label: string; href: string }) {
  return (
    <Link href={href}
      className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-all duration-200 hover:scale-[1.03] hover:shadow-lg"
      style={{ background: P.buttonPrimary.bg, color: P.buttonPrimary.text }}>
      {label} <ArrowRight className="w-4 h-4" />
    </Link>
  );
}
export function SecondaryButton({ palette: P, label, href }: { palette: Palette; label: string; href: string }) {
  const isDark = P.flavor === 'night';
  return (
    <Link href={href}
      className={`inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-all duration-200 ${isDark ? 'hover:bg-white/10' : 'hover:bg-white'}`}
      style={{
        border: `1px solid ${P.buttonSecondary.border}`,
        background: P.buttonSecondary.bg,
        color: P.buttonSecondary.text,
      }}>
      {label}
    </Link>
  );
}

/* ─── Section header ─────────────────────────────────────────────────────── */
export function SectionHeader({
  palette: P, eyebrow, headline, body, accent = 'brand',
}: {
  palette: Palette;
  eyebrow?: string;
  headline: string;
  body?: string;
  accent?: 'brand' | 'accent';
}) {
  const eyebrowColor = accent === 'brand' ? P.brand : P.accent;
  return (
    <>
      {eyebrow && (
        <p className="text-xs font-semibold uppercase tracking-[0.14em]" style={{ color: eyebrowColor }}>
          {eyebrow}
        </p>
      )}
      <h2 className={`whitespace-normal lg:whitespace-pre-line ${eyebrow ? 'mt-3' : ''}`}
        style={{
          fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)', lineHeight: 1.12,
          letterSpacing: '-0.02em', fontWeight: 600, maxWidth: '24ch', color: P.text,
        }}>
        {headline}
      </h2>
      {body && (
        <p className="mt-5 text-base sm:text-lg" style={{ color: P.body, lineHeight: 1.65, maxWidth: '64ch' }}>
          {body}
        </p>
      )}
    </>
  );
}

/* ─── Card grid (used for problem cards, value cards, role cards, etc.) ─── */
export function CardGrid({
  palette: P, items, columns = 4, icon, linkable,
}: {
  palette: Palette;
  items: Array<{ title: string; body: string; href?: string; ctaLabel?: string }>;
  columns?: 2 | 3 | 4;
  icon?: 'check' | 'dot' | null;
  linkable?: boolean;
}) {
  const gridClass =
    columns === 2 ? 'grid grid-cols-1 sm:grid-cols-2 gap-4' :
    columns === 3 ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4' :
                    'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4';

  return (
    <div className={`mt-12 ${gridClass}`}>
      {items.map((c) => {
        const inner = (
          <>
            {icon === 'check' && <CheckCircle2 className="w-5 h-5" style={{ color: P.brand }} />}
            {icon === 'dot' && (
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ background: P.accent }} />
                <p className="text-base font-semibold" style={{ color: P.text }}>{c.title}</p>
              </div>
            )}
            {icon !== 'dot' && (
              <p className={`${icon === 'check' ? 'mt-3' : ''} text-base font-semibold flex items-center justify-between gap-2`}
                style={{ color: P.text }}>
                <span>{c.title}</span>
                {(linkable || c.href) && (
                  <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: P.brand }} />
                )}
              </p>
            )}
            <p className="mt-2 text-sm" style={{ color: P.body, lineHeight: 1.55 }}>{c.body}</p>
            {c.ctaLabel && (
              <p className="mt-3 text-xs font-semibold inline-flex items-center gap-1" style={{ color: P.brand }}>
                {c.ctaLabel} <ArrowRight className="w-3 h-3" />
              </p>
            )}
          </>
        );
        const cls = `${linkable || c.href ? 'group block' : 'block'} rounded-2xl p-5 ${P.hoverLift}`;
        const sty = { background: P.card, border: `1px solid ${P.border}` };
        return (linkable || c.href)
          ? <Link key={c.title} href={c.href ?? '#'} className={cls} style={sty}>{inner}</Link>
          : <div key={c.title} className={cls} style={sty}>{inner}</div>;
      })}
    </div>
  );
}

/* ─── Bullet list (used in Owner Lens / Solutions pages) ─────────────────── */
export function Bullets({
  palette: P, items, columns = 2,
}: { palette: Palette; items: readonly string[]; columns?: 1 | 2 }) {
  // Detect surface darkness from the actual bg, not flavor — the alt palette
  // for Night keeps flavor:'night' but renders on cream. Use pageBg luminance.
  const onDark = isDarkHex(P.pageBg);
  return (
    <ul className={`mt-6 grid grid-cols-1 ${columns === 2 ? 'sm:grid-cols-2' : ''} gap-x-6`}>
      {items.map((b) => (
        <li key={b}
          className={`flex items-start gap-2.5 py-2 -mx-2 px-2 rounded transition-colors ${onDark ? 'hover:bg-white/[0.03]' : 'hover:bg-white/60'}`}>
          {onDark
            ? <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: P.brand }} />
            : <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: P.brand }} />}
          <span className="text-sm" style={{ color: P.text }}>{b}</span>
        </li>
      ))}
    </ul>
  );
}

function isDarkHex(hex: string): boolean {
  const h = hex.replace('#', '');
  if (h.length !== 6) return false;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return 0.299 * r + 0.587 * g + 0.114 * b < 128;
}

/* ─── Section wrapper — handles bg, alternation, padding ─────────────────── */
export function Section({
  palette: P, alt = false, children, id, photo, photoOpacity,
}: {
  palette: Palette;
  alt?: boolean;
  children: React.ReactNode;
  id?: string;
  photo?: string;
  photoOpacity?: number;
}) {
  const effective = alt ? altPaletteFor(P) : P;
  const bg = alt ? P.sectionAlt : P.pageBg;
  return (
    <section id={id} className="relative overflow-hidden" style={{ background: bg, color: effective.text }}>
      {photo && (
        <>
          <img src={photo} alt="" className="absolute inset-0 w-full h-full object-cover"
            style={{ opacity: photoOpacity ?? effective.ghostPhotoOpacity }} />
          <div className="absolute inset-0" style={{
            background: alt
              ? 'linear-gradient(135deg, rgba(245,242,236,0.95) 0%, rgba(245,242,236,0.85) 100%)'
              : 'linear-gradient(135deg, rgba(10,10,10,0.95) 0%, rgba(10,10,10,0.82) 100%)',
          }} />
        </>
      )}
      <div className="relative z-10 mx-auto max-w-6xl px-5 sm:px-8 py-20 sm:py-28">
        {children}
      </div>
    </section>
  );
}

/* ─── Final CTA banner ───────────────────────────────────────────────────── */
export function FinalCtaBanner({
  palette: P, photo, headline, body, ctaLabel, ctaHref, smallText,
}: {
  palette: Palette;
  photo: string;
  headline: string;
  body?: string;
  ctaLabel: string;
  ctaHref: string;
  smallText?: string;
}) {
  const isDark = P.flavor === 'night';
  return (
    <section className="relative" style={{ height: 'min(64vh, 600px)' }}>
      <img src={photo} alt="" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0" style={{
        background: isDark
          ? 'linear-gradient(180deg, rgba(10,10,10,0.5) 0%, rgba(10,10,10,0.9) 100%)'
          : 'linear-gradient(180deg, rgba(255,247,232,0.4) 0%, rgba(245,242,236,0.95) 100%)',
      }} />
      <div className="relative z-10 h-full mx-auto max-w-4xl px-5 sm:px-8 flex flex-col justify-center items-center text-center"
        style={{ color: P.text }}>
        <h2 style={{
          fontSize: 'clamp(2rem, 4vw, 3.5rem)', lineHeight: 1.08,
          letterSpacing: '-0.025em', fontWeight: 600, maxWidth: '22ch', color: P.text,
        }}>
          {headline}
        </h2>
        {body && (
          <p className="mt-5 text-base sm:text-lg"
            style={{ color: isDark ? 'rgba(255,255,255,0.85)' : P.body, maxWidth: '52ch', lineHeight: 1.55 }}>
            {body}
          </p>
        )}
        <div className="mt-8">
          <Link href={ctaHref}
            className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold transition-all duration-200 hover:scale-[1.04] hover:shadow-2xl"
            style={{ background: P.buttonPrimary.bg, color: P.buttonPrimary.text }}>
            {ctaLabel} <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
        {smallText && (
          <p className="mt-5 text-xs sm:text-sm" style={{ color: P.subtle }}>{smallText}</p>
        )}
      </div>
    </section>
  );
}

/* ─── Drill-down path ────────────────────────────────────────────────────── */
export function DrillPath({ palette: P, path }: { palette: Palette; path: readonly string[] }) {
  return (
    <div className="mt-10 rounded-2xl p-5 sm:p-6 overflow-x-auto"
      style={{ background: P.card, border: `1px solid ${P.border}` }}>
      <div className="flex items-center gap-2 sm:gap-3 min-w-max">
        {path.map((step, i) => (
          <div key={step} className="flex items-center gap-2 sm:gap-3">
            <span className="inline-flex items-center rounded-full px-3.5 py-1.5 text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-200 hover:scale-[1.06] cursor-default"
              style={{
                background: i === 0 ? P.text : P.cardAlt,
                color:      i === 0 ? P.pageBg : P.text,
                border:     i === 0 ? `1px solid ${P.text}` : `1px solid ${P.border}`,
              }}>
              {step}
            </span>
            {i < path.length - 1 && <ChevronRight className="w-3.5 h-3.5" style={{ color: '#cfcfcf' }} />}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Numbered steps ─────────────────────────────────────────────────────── */
export function NumberedSteps({
  palette: P, steps,
}: {
  palette: Palette;
  steps: readonly { n: number; title: string; body: string }[];
}) {
  return (
    <div className="mt-14 relative">
      {/* Horizontal connector line — runs through the row of numbered nodes on lg+ */}
      <div className="hidden lg:block absolute left-[8%] right-[8%] h-px"
        style={{
          top: 28,
          background: `linear-gradient(to right, transparent 0%, ${P.borderSoft} 8%, ${P.borderSoft} 92%, transparent 100%)`,
        }} />

      <ol className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-x-4 gap-y-10 relative">
        {steps.map((s) => (
          <li key={s.n} className="text-center px-2">
            {/* Numbered node */}
            <span className="relative z-10 inline-flex items-center justify-center w-14 h-14 rounded-full mx-auto"
              style={{
                background: P.card,
                border: `1px solid ${P.border}`,
                boxShadow: `0 0 0 5px ${P.pageBg}, 0 6px 18px -8px rgba(0,0,0,0.18)`,
              }}>
              <span className="text-base font-bold tracking-tight" style={{ color: P.brand }}>
                {s.n.toString().padStart(2, '0')}
              </span>
            </span>

            <p className="mt-5 text-base font-semibold leading-snug"
              style={{ color: P.text, letterSpacing: '-0.01em' }}>
              {s.title}
            </p>
            {s.body && (
              <p className="mt-2 text-sm mx-auto"
                style={{ color: P.body, lineHeight: 1.55, maxWidth: '22ch' }}>
                {s.body}
              </p>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}

/* ─── Strong serif line (used for "No matter what brand…") ──────────────── */
export function StrongLine({ palette: P, children }: { palette: Palette; children: React.ReactNode }) {
  return (
    <p className="mt-10 font-semibold"
      style={{
        fontFamily: 'var(--font-serif), serif',
        fontSize: 'clamp(1.25rem, 2.5vw, 1.75rem)',
        lineHeight: 1.3, color: P.text, maxWidth: '32ch',
      }}>
      {children}
    </p>
  );
}

/* ─── Mock frame wrapper — for embedding mocks in dark sections ─────────── */
export function MockSlot({ children }: { children: React.ReactNode }) {
  return <div className="mt-10">{children}</div>;
}
