import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Users } from 'lucide-react';
import { Breadcrumb } from './Breadcrumb';

export interface SolutionPageProps {
  breadcrumbLabel: string;
  pill: string;
  icon: React.ReactNode;
  heroHeadline: string;
  heroSubcopy: string;
  heroCtaLabel: string;
  problemTitle: string;
  problemBody: string;
  featuresTitle: string;
  features: string[];
  trustTitle?: string;
  trustBody?: string;
  ctaTitle: string;
  ctaBody?: string;
  ctaLabel: string;
  blobVariant: 'amber' | 'blue' | 'teal' | 'rose' | 'green';
  blobHeadline: string;
  blobPills: string[];
  relatedLinks?: Array<{ href: string; label: string; description: string }>;
}

export function SolutionPageShell({
  breadcrumbLabel, pill, icon, heroHeadline, heroSubcopy, heroCtaLabel,
  problemTitle, problemBody, featuresTitle, features, trustTitle, trustBody,
  ctaTitle, ctaBody, ctaLabel, blobVariant, blobHeadline, blobPills, relatedLinks,
}: SolutionPageProps) {
  return (
    <main>
      {/* Hero */}
      <section className="mx-auto max-w-7xl px-5 sm:px-8 pt-10 sm:pt-14 pb-14 sm:pb-20">
        <Breadcrumb items={[
          { label: 'Solutions', href: '/website/solutions' },
          { label: breadcrumbLabel },
        ]} />

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          <div className="lg:col-span-7">
            <span className="stayops-pill">
              {icon}
              {pill}
            </span>
            <h1
              className="display mt-6"
              style={{
                color: 'var(--so-ink)',
                fontSize: 'clamp(2.5rem, 6vw, 4.75rem)',
                maxWidth: '20ch',
                lineHeight: 1.02,
              }}
            >
              {heroHeadline}
            </h1>
            <p
              className="mt-6 text-base sm:text-lg lg:text-xl"
              style={{ color: 'var(--so-ink-muted)', maxWidth: '52ch', lineHeight: 1.55 }}
            >
              {heroSubcopy}
            </p>
            <div className="mt-8">
              <Link href="/website/contact" className="stayops-cta">
                {heroCtaLabel} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className={`blob-card blob-${blobVariant}`}>
              <div className="blob-pills">
                <span className="blob-pill" style={{ fontWeight: 600 }}>{blobHeadline}</span>
                {blobPills.map((p) => (
                  <span key={p} className="blob-pill">{p}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem */}
      <section
        className="border-y"
        style={{ borderColor: 'var(--so-hairline)', background: 'var(--so-canvas-soft)' }}
      >
        <div className="mx-auto max-w-6xl px-5 sm:px-8 py-16 sm:py-20">
          <span className="stayops-pill">The pain</span>
          <h2
            className="display mt-5"
            style={{
              color: 'var(--so-ink)',
              fontSize: 'clamp(1.75rem, 4vw, 3rem)',
              maxWidth: '24ch',
            }}
          >
            {problemTitle}
          </h2>
          <p className="mt-5 text-base sm:text-lg max-w-3xl" style={{ color: 'var(--so-ink-muted)', lineHeight: 1.65 }}>
            {problemBody}
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-5 sm:px-8 py-16 sm:py-24">
        <div className="max-w-3xl">
          <span className="stayops-pill">What they get</span>
          <h2
            className="display mt-5"
            style={{
              color: 'var(--so-ink)',
              fontSize: 'clamp(1.75rem, 4vw, 3rem)',
              maxWidth: '24ch',
            }}
          >
            {featuresTitle}
          </h2>
        </div>

        <ul className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-x-10">
          {features.map((f, i) => (
            <li key={f}>
              {i === 0 && <div className="stayops-divider" />}
              <div className="py-4 text-base sm:text-lg" style={{ color: 'var(--so-ink)' }}>
                {f}
              </div>
              <div className="stayops-divider" />
            </li>
          ))}
        </ul>
      </section>

      {/* Trust / employee-protection block */}
      {trustTitle && trustBody && (
        <section
          className="border-y"
          style={{ borderColor: 'var(--so-hairline)', background: 'var(--so-canvas-soft)' }}
        >
          <div className="mx-auto max-w-6xl px-5 sm:px-8 py-16 sm:py-20">
            <span className="stayops-pill">
              <Users className="w-3.5 h-3.5" />
              For the team
            </span>
            <h2
              className="display mt-5"
              style={{
                color: 'var(--so-ink)',
                fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
                maxWidth: '22ch',
              }}
            >
              {trustTitle}
            </h2>
            <p className="mt-5 text-base sm:text-lg max-w-3xl"
               style={{ color: 'var(--so-ink-muted)', lineHeight: 1.65 }}>
              {trustBody}
            </p>
          </div>
        </section>
      )}

      {/* Related links */}
      {relatedLinks && relatedLinks.length > 0 && (
        <section
          style={{ background: 'var(--so-canvas)' }}
        >
          <div className="mx-auto max-w-7xl px-5 sm:px-8 py-16 sm:py-20">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em]"
               style={{ color: 'var(--so-ink-dim)' }}>
              Other solutions
            </p>
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {relatedLinks.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="group rounded-2xl p-5 transition-shadow hover:shadow-md flex flex-col"
                  style={{ background: 'var(--so-canvas-soft)', border: '1px solid var(--so-hairline)' }}
                >
                  <p className="text-base font-semibold" style={{ color: 'var(--so-ink)' }}>{l.label}</p>
                  <p className="mt-1 text-sm" style={{ color: 'var(--so-ink-muted)', lineHeight: 1.55 }}>
                    {l.description}
                  </p>
                  <span
                    className="mt-3 inline-flex items-center gap-1 text-sm font-medium"
                    style={{ color: 'var(--so-ink)' }}
                  >
                    Explore
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Final CTA */}
      <section className="mx-auto max-w-4xl px-5 sm:px-8 py-24 sm:py-32 text-center">
        <h2
          className="display mx-auto"
          style={{
            color: 'var(--so-ink)',
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            maxWidth: '22ch',
          }}
        >
          {ctaTitle}
        </h2>
        {ctaBody && (
          <p className="mt-6 mx-auto text-base sm:text-lg"
             style={{ color: 'var(--so-ink-muted)', maxWidth: '54ch', lineHeight: 1.6 }}>
            {ctaBody}
          </p>
        )}
        <div className="mt-8 flex items-center justify-center">
          <Link href="/website/contact" className="stayops-cta">
            {ctaLabel} <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}
