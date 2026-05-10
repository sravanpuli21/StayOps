import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight, ArrowUpRight, Bed, ConciergeBell, Eye, LayoutDashboard,
  UserCheck, Wrench,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Solutions',
  description:
    'One system for owners, managers, and the teams running the hotel every day. Owners get visibility. Teams get clarity.',
};

const ROLES = [
  {
    icon: <Eye className="w-5 h-5" />,
    title: 'Hotel Owners',
    body: 'See what is happening across every property and protect revenue.',
    href: '/website/solutions/owners',
  },
  {
    icon: <UserCheck className="w-5 h-5" />,
    title: 'General Managers',
    body: 'Run daily operations without chasing every department manually.',
    href: '/website/solutions/gms',
  },
  {
    icon: <LayoutDashboard className="w-5 h-5" />,
    title: 'Regional Managers',
    body: 'Compare property health, operational risk, and open issues across hotels.',
    href: '/website/solutions/regional',
  },
  {
    icon: <Bed className="w-5 h-5" />,
    title: 'Housekeeping Teams',
    body: 'Get clear room assignments, priorities, and proof of completed work.',
    href: '/website/solutions/housekeeping',
  },
  {
    icon: <Wrench className="w-5 h-5" />,
    title: 'Maintenance Teams',
    body: 'Receive clear issues, photos, priorities, and repair history.',
    href: '/website/solutions/maintenance',
  },
  {
    icon: <ConciergeBell className="w-5 h-5" />,
    title: 'Front Desk Teams',
    body: 'Know which rooms are ready, delayed, blocked, or under maintenance.',
    href: '/website/solutions/front-desk',
  },
];

export default function SolutionsPage() {
  return (
    <main>
      <Hero />
      <RoleGrid />
      <SharedSystem />
      <FinalCta />
    </main>
  );
}

function Hero() {
  return (
    <section className="mx-auto max-w-7xl px-5 sm:px-8 pt-16 sm:pt-20 pb-12 sm:pb-16 text-center">
      <span className="stayops-pill">Solutions</span>
      <h1
        className="display mx-auto mt-6"
        style={{
          color: 'var(--so-ink)',
          fontSize: 'clamp(2.5rem, 6vw, 5rem)',
          maxWidth: '22ch',
          lineHeight: 1.02,
        }}
      >
        One system for owners, managers, and the teams running the hotel every day.
      </h1>
      <p
        className="mt-6 mx-auto text-base sm:text-lg lg:text-xl"
        style={{ color: 'var(--so-ink-muted)', maxWidth: '56ch', lineHeight: 1.55 }}
      >
        StayOps gives owners visibility, managers control, and employees clear work with
        proof — so every property can run with less chaos and fewer hidden losses.
      </p>
      <div className="mt-8 flex items-center justify-center">
        <Link href="#roles" className="stayops-cta">
          Find Your Role <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
}

function RoleGrid() {
  return (
    <section
      id="roles"
      className="border-y"
      style={{ borderColor: 'var(--so-hairline)', background: 'var(--so-canvas-soft)' }}
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8 py-20 sm:py-28">
        <div className="max-w-3xl">
          <span className="stayops-pill">Every level</span>
          <h2
            className="display mt-5"
            style={{
              color: 'var(--so-ink)',
              fontSize: 'clamp(2rem, 4.5vw, 3.5rem)',
              maxWidth: '20ch',
            }}
          >
            Built for every level of hotel operations.
          </h2>
        </div>

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {ROLES.map((r) => (
            <Link
              key={r.title}
              href={r.href}
              className="group rounded-2xl p-6 transition-shadow hover:shadow-md flex flex-col"
              style={{ background: 'var(--so-canvas)', border: '1px solid var(--so-hairline)' }}
            >
              <span
                className="inline-flex w-10 h-10 rounded-full items-center justify-center"
                style={{ background: 'var(--so-cream)', color: 'var(--so-ink)' }}
              >
                {r.icon}
              </span>
              <h3 className="mt-4 text-lg font-semibold" style={{ color: 'var(--so-ink)' }}>
                {r.title}
              </h3>
              <p className="mt-2 text-sm sm:text-base" style={{ color: 'var(--so-ink-muted)', lineHeight: 1.6 }}>
                {r.body}
              </p>
              <span
                className="mt-5 inline-flex items-center gap-1 text-sm font-medium"
                style={{ color: 'var(--so-ink)' }}
              >
                See the workflow
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function SharedSystem() {
  return (
    <section className="mx-auto max-w-7xl px-5 sm:px-8 py-20 sm:py-28">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
        <div className="lg:col-span-7">
          <span className="stayops-pill">One shared system</span>
          <h2
            className="display mt-5"
            style={{
              color: 'var(--so-ink)',
              fontSize: 'clamp(2rem, 4.5vw, 3.25rem)',
              maxWidth: '22ch',
            }}
          >
            Everyone sees what they need. Owners see the bigger picture.
          </h2>
          <p className="mt-5 text-base sm:text-lg" style={{ color: 'var(--so-ink-muted)', lineHeight: 1.65 }}>
            StayOps gives each team a simple workflow for their daily work, while turning
            those actions into owner-level visibility.
          </p>

          <div className="mt-10 rounded-2xl overflow-hidden"
               style={{ background: 'var(--so-canvas)', border: '1px solid var(--so-hairline)' }}>
            {[
              'Housekeeping marks a room as cleaned.',
              'Maintenance resolves an issue.',
              'Front desk sees readiness.',
              'Managers see progress.',
              'Owners see downtime, risk, and operational impact.',
            ].map((line, i, arr) => (
              <div
                key={line}
                className="flex items-start gap-4 px-5 py-4 text-base"
                style={i < arr.length - 1 ? { borderBottom: '1px solid var(--so-hairline)' } : undefined}
              >
                <span
                  className="inline-flex w-7 h-7 rounded-full items-center justify-center text-xs font-semibold tabular-nums flex-shrink-0 mt-0.5"
                  style={{ background: 'var(--so-cream)', color: 'var(--so-ink)' }}
                >
                  {i + 1}
                </span>
                <span style={{ color: 'var(--so-ink)', lineHeight: 1.55 }}>{line}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="blob-card blob-teal">
            <div className="blob-pills">
              <span className="blob-pill" style={{ fontWeight: 600 }}>One system · every role</span>
              <span className="blob-pill">Housekeeping</span>
              <span className="blob-pill">Front desk</span>
              <span className="blob-pill">Maintenance</span>
              <span className="blob-pill">GM</span>
              <span className="blob-pill">Regional</span>
              <span className="blob-pill">Owner</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="mx-auto max-w-4xl px-5 sm:px-8 py-24 sm:py-32 text-center">
      <h2
        className="display mx-auto"
        style={{
          color: 'var(--so-ink)',
          fontSize: 'clamp(2.25rem, 5vw, 4rem)',
          maxWidth: '22ch',
        }}
      >
        See how StayOps works for your hotel team.
      </h2>
      <div className="mt-8 flex items-center justify-center">
        <Link href="/website/contact" className="stayops-cta">
          Book a Demo <ArrowUpRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
}
