import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight, Compass, Eye, Smartphone, TrendingDown } from 'lucide-react';
import { Breadcrumb } from '../../_components/Breadcrumb';

export const metadata: Metadata = {
  title: 'About StayOps',
  description:
    'Built for independent hotel ownership groups that need better operational visibility.',
};

export default function AboutPage() {
  return (
    <main>
      <section className="mx-auto max-w-7xl px-5 sm:px-8 pt-10 sm:pt-14 pb-10 sm:pb-14">
        <Breadcrumb items={[
          { label: 'Company', href: '/website/company' },
          { label: 'About' },
        ]} />

        <div className="mt-6">
          <span className="stayops-pill">About StayOps</span>
          <h1
            className="display mt-6"
            style={{
              color: 'var(--so-ink)',
              fontSize: 'clamp(2.5rem, 6vw, 5rem)',
              maxWidth: '22ch',
              lineHeight: 1.02,
            }}
          >
            Built for independent hotel ownership groups.
          </h1>
          <p
            className="mt-6 text-base sm:text-lg lg:text-xl"
            style={{ color: 'var(--so-ink-muted)', maxWidth: '54ch', lineHeight: 1.55 }}
          >
            StayOps is a clarity platform for hotel ownership groups and the teams who run
            the property every day. Owners get visibility. Teams get clarity. Hotels
            protect money.
          </p>
        </div>
      </section>

      <section
        className="border-y"
        style={{ borderColor: 'var(--so-hairline)', background: 'var(--so-canvas-soft)' }}
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-8 py-16 sm:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-14">
            <div className="lg:col-span-2">
              <span className="stayops-pill">Our mission</span>
              <h2
                className="display mt-5"
                style={{
                  color: 'var(--so-ink)',
                  fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
                  maxWidth: '24ch',
                }}
              >
                Help independent hotel ownership groups protect revenue, support their
                teams, and run every property with better visibility.
              </h2>
              <p className="mt-5 text-base sm:text-lg" style={{ color: 'var(--so-ink-muted)', lineHeight: 1.65 }}>
                StayOps was created after seeing how much money and time hotels lose
                through small operational gaps — missed repairs, unclear room status,
                forgotten audits, poor handovers, and work that is completed but not
                recorded.
              </p>
              <p className="mt-4 text-base sm:text-lg" style={{ color: 'var(--so-ink-muted)', lineHeight: 1.65 }}>
                We are a small, operator-led team. We don&apos;t sell revenue optimization.
                We don&apos;t promise RevPAR lift. We sell clarity — the one thing every
                hotel owner says they&apos;re missing and no one is actually delivering.
              </p>
            </div>

            <div className="rounded-2xl p-6 sm:p-7" style={{ background: 'var(--so-ink)', color: '#fff' }}>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em]"
                 style={{ color: 'var(--so-accent-warm, #d97a4a)' }}>
                What we believe
              </p>
              <ul className="mt-4 space-y-3 text-sm sm:text-base" style={{ lineHeight: 1.55 }}>
                {[
                  'Owners deserve clear visibility without chasing every update.',
                  'Hotel teams deserve tools that make work easier, not more stressful.',
                  'Small operational gaps can create serious financial loss.',
                  'Every room, repair, audit, and asset should have history.',
                  'AI should support hotel teams, not replace them.',
                  'Independent operators should have access to ownership-level control without enterprise complexity.',
                ].map((b) => (
                  <li key={b} className="flex items-start gap-3">
                    <span className="mt-2 w-1.5 h-1.5 rounded-full flex-shrink-0"
                          style={{ background: '#d97a4a' }} />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 sm:px-8 py-16 sm:py-20">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em]"
           style={{ color: 'var(--so-ink-dim)' }}>
          How we work
        </p>
        <h2
          className="display mt-4"
          style={{
            color: 'var(--so-ink)',
            fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
            maxWidth: '22ch',
          }}
        >
          Four principles we won&apos;t break.
        </h2>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          <Value icon={<TrendingDown className="w-5 h-5" />} title="Money-aware"
                 body="Every operational signal on every screen connects back to a business impact." />
          <Value icon={<Eye className="w-5 h-5" />} title="Calm, not scary"
                 body="We help owners spot problems early. We don’t create panic about leaks everywhere." />
          <Value icon={<Compass className="w-5 h-5" />} title="Operator-first"
                 body="We speak the language of rooms, repairs, audits, handovers, and team activity." />
          <Value icon={<Smartphone className="w-5 h-5" />} title="Respectful to teams"
                 body="Built to help employees, not watch them. Clear work. Clear proof. Less blame." />
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-5 sm:px-8 py-20 sm:py-24 text-center">
        <h2
          className="display mx-auto"
          style={{
            color: 'var(--so-ink)',
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            maxWidth: '24ch',
          }}
        >
          We are building StayOps for hotel operators who want cleaner control.
        </h2>
        <div className="mt-8 flex items-center justify-center">
          <Link href="/website/contact" className="stayops-cta">
            Contact Us <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}

function Value({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div
      className="rounded-2xl p-5"
      style={{ background: 'var(--so-canvas-soft)', border: '1px solid var(--so-hairline)' }}
    >
      <span
        className="inline-flex w-9 h-9 rounded-full items-center justify-center"
        style={{ background: 'var(--so-canvas)', color: 'var(--so-ink)' }}
      >
        {icon}
      </span>
      <h4 className="mt-4 text-base font-semibold" style={{ color: 'var(--so-ink)' }}>{title}</h4>
      <p className="mt-2 text-sm" style={{ color: 'var(--so-ink-muted)', lineHeight: 1.55 }}>{body}</p>
    </div>
  );
}
