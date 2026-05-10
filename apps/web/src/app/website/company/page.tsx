import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, BookOpen, Briefcase, Info, Mail } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Company',
  description:
    'Built from the ground reality of hotel operations. Meet the team behind StayOps and read why we built it.',
};

const CARDS = [
  {
    href: '/website/company/about',
    icon: <Info className="w-5 h-5" />,
    label: 'About StayOps',
    title: 'Who we are today.',
    body: 'Our mission, our team, and the principles behind how we build.',
  },
  {
    href: '/website/company/story',
    icon: <BookOpen className="w-5 h-5" />,
    label: 'Founder Story',
    title: 'How we got here.',
    body: 'From real hotel operations pain to a smarter control room for owners and teams.',
  },
  {
    href: '/website/company/careers',
    icon: <Briefcase className="w-5 h-5" />,
    label: 'Careers',
    title: 'Work with us — one day.',
    body: 'We are not hiring right now, but we are building something meaningful.',
  },
];

export default function CompanyPage() {
  return (
    <main>
      <section className="mx-auto max-w-7xl px-5 sm:px-8 pt-16 sm:pt-20 pb-12 sm:pb-16 text-center">
        <span className="stayops-pill">Company</span>
        <h1
          className="display mx-auto mt-6"
          style={{
            color: 'var(--so-ink)',
            fontSize: 'clamp(2.5rem, 6vw, 5rem)',
            maxWidth: '22ch',
            lineHeight: 1.02,
          }}
        >
          Built from the ground reality of hotel operations.
        </h1>
        <p
          className="mt-6 mx-auto text-base sm:text-lg lg:text-xl"
          style={{ color: 'var(--so-ink-muted)', maxWidth: '56ch', lineHeight: 1.55 }}
        >
          StayOps was created after seeing how much money and time hotels lose through
          small operational gaps — missed repairs, unclear room status, forgotten audits,
          poor handovers, and work that is completed but not recorded.
        </p>
      </section>

      <section
        className="border-y"
        style={{ borderColor: 'var(--so-hairline)', background: 'var(--so-canvas-soft)' }}
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-8 py-16 sm:py-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
            {CARDS.map((c) => (
              <Link
                key={c.href}
                href={c.href}
                className="group rounded-2xl p-6 sm:p-7 transition-shadow hover:shadow-md flex flex-col"
                style={{ background: 'var(--so-canvas)', border: '1px solid var(--so-hairline)' }}
              >
                <span
                  className="inline-flex w-10 h-10 rounded-full items-center justify-center"
                  style={{ background: 'var(--so-cream)', color: 'var(--so-ink)' }}
                >
                  {c.icon}
                </span>
                <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.14em]"
                   style={{ color: 'var(--so-ink-dim)' }}>
                  {c.label}
                </p>
                <h2 className="mt-2 text-xl sm:text-2xl font-semibold leading-snug"
                    style={{ color: 'var(--so-ink)' }}>
                  {c.title}
                </h2>
                <p className="mt-3 text-sm sm:text-base flex-1"
                   style={{ color: 'var(--so-ink-muted)', lineHeight: 1.6 }}>
                  {c.body}
                </p>
                <span className="mt-5 inline-flex items-center gap-1 text-sm font-medium"
                      style={{ color: 'var(--so-ink)' }}>
                  Read more
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 sm:px-8 py-16 sm:py-20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <span
            className="inline-flex w-11 h-11 rounded-full items-center justify-center flex-shrink-0"
            style={{ background: 'var(--so-cream)', color: 'var(--so-ink)' }}
          >
            <Mail className="w-5 h-5" />
          </span>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em]"
               style={{ color: 'var(--so-ink-dim)' }}>
              Press &amp; partnerships
            </p>
            <a
              href="mailto:hello@stayops.com"
              className="mt-1 inline-block text-lg sm:text-xl font-semibold hover:underline"
              style={{ color: 'var(--so-ink)' }}
            >
              hello@stayops.com
            </a>
          </div>
        </div>
        <Link href="/website/contact" className="stayops-cta">
          Book a Demo <ArrowUpRight className="w-4 h-4" />
        </Link>
      </section>
    </main>
  );
}
