import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight, ArrowUpRight, Bed, Boxes, Clock, ShieldAlert, UserCheck, Wrench,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Why StayOps',
  description:
    'Hidden operational losses are costing hotels more than they realise. StayOps helps hotel ownership groups see the small daily issues that affect room revenue, labour cost, maintenance spend, inventory, and audits.',
};

export default function WhyStayOpsPage() {
  return (
    <main>
      <Hero />
      <HiddenLossIntro />
      <LossCategories />
      <ExistingToolsGap />
      <BeforeAfter />
      <FinalCta />
    </main>
  );
}

function Hero() {
  return (
    <section className="mx-auto max-w-7xl px-5 sm:px-8 pt-16 sm:pt-20 pb-12 sm:pb-16 text-center">
      <span className="stayops-pill">Why StayOps</span>
      <h1
        className="display mx-auto mt-6"
        style={{
          color: 'var(--so-ink)',
          fontSize: 'clamp(2.5rem, 6vw, 5rem)',
          maxWidth: '22ch',
          lineHeight: 1.02,
        }}
      >
        Hidden operational losses are costing hotels more than they realise.
      </h1>
      <p
        className="mt-6 mx-auto text-base sm:text-lg lg:text-xl"
        style={{ color: 'var(--so-ink-muted)', maxWidth: '56ch', lineHeight: 1.55 }}
      >
        StayOps helps hotel ownership groups see the small daily issues that affect room
        revenue, labour cost, maintenance spend, inventory, audits, and property performance.
      </p>
      <div className="mt-8 flex items-center justify-center">
        <Link href="#losses" className="stayops-cta">
          See the Hidden Losses <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
}

function HiddenLossIntro() {
  return (
    <section
      className="border-y"
      style={{ borderColor: 'var(--so-hairline)', background: 'var(--so-canvas-soft)' }}
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-8 py-16 sm:py-20">
        <span className="stayops-pill">The hidden loss problem</span>
        <h2
          className="display mt-5"
          style={{
            color: 'var(--so-ink)',
            fontSize: 'clamp(2rem, 4.5vw, 3.25rem)',
            maxWidth: '24ch',
          }}
        >
          Small gaps become expensive when nobody sees them early.
        </h2>
        <p className="mt-5 text-base sm:text-lg max-w-3xl" style={{ color: 'var(--so-ink-muted)', lineHeight: 1.65 }}>
          A hotel can look busy and still lose money through daily operational gaps. A room
          stays out of order longer than necessary. A repair is delayed. A safety check is
          missed. A replacement item is not recorded. A task is completed but not
          documented. Over time, those gaps become real financial loss.
        </p>
      </div>
    </section>
  );
}

function LossCategories() {
  const categories = [
    {
      icon: <Bed className="w-5 h-5" />,
      title: 'Room revenue loss',
      body: 'Out-of-order rooms directly affect available inventory and revenue.',
    },
    {
      icon: <Wrench className="w-5 h-5" />,
      title: 'Maintenance delay loss',
      body: 'Delayed repairs increase downtime, guest complaints, and repeated work.',
    },
    {
      icon: <UserCheck className="w-5 h-5" />,
      title: 'Labour waste',
      body: 'Unclear work and poor handovers create unnecessary follow-ups and overtime pressure.',
    },
    {
      icon: <ShieldAlert className="w-5 h-5" />,
      title: 'Audit risk',
      body: 'Missed inspections create compliance, brand, and safety concerns.',
    },
    {
      icon: <Boxes className="w-5 h-5" />,
      title: 'Inventory and asset loss',
      body: 'Missing, damaged, or frequently replaced items create silent expenses.',
    },
    {
      icon: <Clock className="w-5 h-5" />,
      title: 'Management time loss',
      body: 'Owners and GMs waste time chasing updates instead of making decisions.',
    },
  ];

  return (
    <section id="losses" className="mx-auto max-w-7xl px-5 sm:px-8 py-20 sm:py-28">
      <div className="max-w-3xl">
        <span className="stayops-pill">Six quiet categories</span>
        <h2
          className="display mt-5"
          style={{
            color: 'var(--so-ink)',
            fontSize: 'clamp(2rem, 4.5vw, 3.25rem)',
            maxWidth: '22ch',
          }}
        >
          Where hotels quietly lose money.
        </h2>
      </div>

      <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {categories.map((c) => (
          <div
            key={c.title}
            className="rounded-2xl p-6"
            style={{ background: 'var(--so-canvas-soft)', border: '1px solid var(--so-hairline)' }}
          >
            <span
              className="inline-flex w-10 h-10 rounded-full items-center justify-center"
              style={{ background: 'var(--so-canvas)', color: 'var(--so-ink)' }}
            >
              {c.icon}
            </span>
            <h3 className="mt-4 text-lg font-semibold" style={{ color: 'var(--so-ink)' }}>
              {c.title}
            </h3>
            <p className="mt-2 text-sm sm:text-base" style={{ color: 'var(--so-ink-muted)', lineHeight: 1.6 }}>
              {c.body}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function ExistingToolsGap() {
  return (
    <section
      className="border-y"
      style={{ borderColor: 'var(--so-hairline)', background: 'var(--so-canvas-soft)' }}
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-8 py-20 sm:py-24">
        <span className="stayops-pill">The missing layer</span>
        <h2
          className="display mt-5"
          style={{
            color: 'var(--so-ink)',
            fontSize: 'clamp(2rem, 4.5vw, 3.25rem)',
            maxWidth: '26ch',
          }}
        >
          Hotels may have tools, but they still lack operational memory.
        </h2>
        <p className="mt-5 text-base sm:text-lg max-w-3xl" style={{ color: 'var(--so-ink-muted)', lineHeight: 1.65 }}>
          A hotel may already have a PMS, payroll system, accounting system, maintenance
          process, reports, spreadsheets, and group chats. But these systems often do not
          create one clear operational memory for ownership.
        </p>
        <p className="mt-4 text-base sm:text-lg max-w-3xl" style={{ color: 'var(--so-ink-muted)', lineHeight: 1.65 }}>
          StayOps sits above daily work and connects the signals owners need to see.
        </p>
      </div>
    </section>
  );
}

function BeforeAfter() {
  const rows: Array<[string, string]> = [
    ['Calls, texts, paper, and spreadsheets',  'One control room'],
    ['Tasks disappear after completion',        'Operational history stays'],
    ['Owners depend on updates',                'Owners see live visibility'],
    ['Employees fear blame',                    'Employees get proof of work'],
    ['Issues are reactive',                     'Patterns become visible'],
    ['Data is scattered',                       'Property intelligence is connected'],
    ['Audits are easy to miss',                 'Recurring checks stay visible'],
    ['Inventory issues are hard to trace',      'Item history stays connected'],
  ];

  return (
    <section className="mx-auto max-w-7xl px-5 sm:px-8 py-20 sm:py-28">
      <div className="max-w-3xl">
        <span className="stayops-pill">StayOps difference</span>
        <h2
          className="display mt-5"
          style={{
            color: 'var(--so-ink)',
            fontSize: 'clamp(2rem, 4.5vw, 3.25rem)',
            maxWidth: '24ch',
          }}
        >
          StayOps connects daily work to business impact.
        </h2>
      </div>

      <div
        className="mt-10 rounded-2xl overflow-hidden"
        style={{ background: 'var(--so-canvas)', border: '1px solid var(--so-hairline)' }}
      >
        <div
          className="grid grid-cols-2 text-[11px] font-semibold uppercase tracking-[0.14em] px-6 py-4"
          style={{
            color: 'var(--so-ink-dim)',
            borderBottom: '1px solid var(--so-hairline)',
            background: 'var(--so-canvas-soft)',
          }}
        >
          <span>Traditional hotel operations</span>
          <span>StayOps</span>
        </div>
        {rows.map(([before, after], i) => (
          <div
            key={before}
            className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-0 px-6 py-4 text-sm sm:text-base"
            style={i < rows.length - 1 ? { borderBottom: '1px solid var(--so-hairline)' } : undefined}
          >
            <span style={{ color: 'var(--so-ink-muted)' }}>{before}</span>
            <span style={{ color: 'var(--so-ink)', fontWeight: 500 }}>{after}</span>
          </div>
        ))}
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
        See the daily gaps that affect your bottom line.
      </h2>
      <div className="mt-8 flex items-center justify-center">
        <Link href="/website/contact" className="stayops-cta">
          Book a Demo <ArrowUpRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
}
