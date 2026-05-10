import Link from 'next/link';
import {
  ArrowRight, ArrowUpRight, Bed, Box, Boxes, Brain, CheckCheck, ConciergeBell,
  DoorOpen, Eye, LayoutDashboard, ShieldCheck, Sparkles, UserCheck, Wrench,
} from 'lucide-react';

export default function WebsiteHome() {
  return (
    <main>
      <AnnouncementBar />
      <Hero />
      <OperatorRealityStrip />
      <ProblemSection />
      <ProductOverview />
      <MoneyImpact />
      <OwnersAndTeams />
      <AiMemory />
      <BeforeAndAfter />
      <DemoPreview />
      <FinalCta />
    </main>
  );
}

/* -------------------- 1. Announcement bar -------------------- */
function AnnouncementBar() {
  return (
    <div
      className="text-center py-2 px-4 text-sm"
      style={{
        background: 'var(--so-cream)',
        color: 'var(--so-ink-2)',
        borderBottom: '1px solid var(--so-hairline)',
      }}
    >
      <span>
        Built for hotel ownership groups that want clearer operations and fewer hidden losses.
      </span>
    </div>
  );
}

/* -------------------- 3. Hero -------------------- */
function Hero() {
  return (
    <section className="mx-auto max-w-7xl px-5 sm:px-8 pt-16 sm:pt-20 pb-12 sm:pb-16">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
        <div className="lg:col-span-7">
          <span className="stayops-pill">Owner&apos;s control room</span>

          <h1
            className="display mt-5"
            style={{
              color: 'var(--so-ink)',
              fontSize: 'clamp(2.5rem, 6vw, 5rem)',
              maxWidth: '18ch',
              lineHeight: 1.02,
            }}
          >
            The control room for hotel owners to run cleaner, more profitable operations.
          </h1>

          <p
            className="mt-6 text-base sm:text-lg lg:text-xl max-w-2xl"
            style={{ color: 'var(--so-ink-muted)', lineHeight: 1.55 }}
          >
            StayOps brings rooms, maintenance, audits, labour, inventory, and team activity
            into one place — so ownership groups can see what&apos;s happening, fix issues
            faster, and stop hidden operational losses.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Link href="/website/contact" className="stayops-cta justify-center">
              Book a Demo <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/website/products" className="stayops-cta-ghost justify-center">
              See How It Works
            </Link>
          </div>

          <p className="mt-6 text-sm" style={{ color: 'var(--so-ink-dim)' }}>
            Built for ownership visibility. Designed for daily hotel teams.
          </p>
        </div>

        <div className="lg:col-span-5">
          <HeroDashboard />
        </div>
      </div>
    </section>
  );
}

function HeroDashboard() {
  return (
    <div
      className="rounded-3xl p-5 sm:p-6"
      style={{
        background: 'var(--so-canvas)',
        border: '1px solid var(--so-hairline)',
        boxShadow: '0 24px 60px -30px rgba(0,0,0,0.15), 0 2px 10px -4px rgba(0,0,0,0.05)',
      }}
    >
      <div className="flex items-center justify-between mb-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em]"
           style={{ color: 'var(--so-ink-dim)' }}>
          Portfolio — today
        </p>
        <span className="text-[11px]" style={{ color: 'var(--so-ink-dim)' }}>sample</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Metric label="Total properties"     value="16"     tone="ink" />
        <Metric label="Rooms out of order"   value="4"      tone="warn" />
        <Metric label="Open maintenance"     value="12"     tone="warn" />
        <Metric label="Missed audits"        value="1"      tone="bad" />
        <Metric label="Revenue at risk"      value="$8,240" tone="bad" />
        <Metric label="Tasks completed"      value="87 %"   tone="good" />
      </div>

      <div
        className="mt-5 pt-5 flex items-start gap-3"
        style={{ borderTop: '1px solid var(--so-hairline)' }}
      >
        <span
          className="mt-0.5 inline-flex w-8 h-8 rounded-full items-center justify-center flex-shrink-0"
          style={{ background: 'var(--so-cream)' }}
        >
          <Sparkles className="w-4 h-4" style={{ color: 'var(--so-ink)' }} />
        </span>
        <p className="text-sm" style={{ color: 'var(--so-ink-2)', lineHeight: 1.55 }}>
          Room 214 at Hampton Gateway had 3 maintenance tickets this month. Pattern detected — cost pattern suggests a deeper issue.
        </p>
      </div>
    </div>
  );
}

function Metric({ label, value, tone }: { label: string; value: string; tone: 'ink' | 'good' | 'warn' | 'bad' }) {
  const color =
    tone === 'good' ? '#2f8a5e'
    : tone === 'warn' ? '#b4752a'
    : tone === 'bad' ? '#b64a3f'
    : 'var(--so-ink)';
  return (
    <div
      className="rounded-2xl p-4"
      style={{ background: 'var(--so-canvas-soft)', border: '1px solid var(--so-hairline)' }}
    >
      <p className="text-[11px] font-medium uppercase tracking-[0.1em]"
         style={{ color: 'var(--so-ink-dim)' }}>
        {label}
      </p>
      <p className="mt-1.5 text-2xl font-semibold tabular-nums"
         style={{ color, letterSpacing: '-0.02em' }}>
        {value}
      </p>
    </div>
  );
}

/* -------------------- 4. Operator reality strip -------------------- */
function OperatorRealityStrip() {
  const items = [
    { label: 'Room readiness',    icon: <Bed             className="w-4 h-4" /> },
    { label: 'Maintenance delays', icon: <Wrench          className="w-4 h-4" /> },
    { label: 'Missed audits',     icon: <ShieldCheck     className="w-4 h-4" /> },
    { label: 'Labour handovers',  icon: <UserCheck       className="w-4 h-4" /> },
    { label: 'Inventory loss',    icon: <Box             className="w-4 h-4" /> },
    { label: 'Owner reporting',   icon: <LayoutDashboard className="w-4 h-4" /> },
  ];

  return (
    <section
      className="border-y"
      style={{ borderColor: 'var(--so-hairline)', background: 'var(--so-canvas-soft)' }}
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8 py-12 sm:py-16">
        <div className="text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em]"
             style={{ color: 'var(--so-ink-dim)' }}>
            Built around the realities of hotel operations
          </p>
          <p className="mt-4 mx-auto text-base sm:text-lg max-w-2xl"
             style={{ color: 'var(--so-ink-muted)', lineHeight: 1.6 }}>
            StayOps is designed around the everyday issues that affect revenue, guest
            experience, and property performance.
          </p>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-2.5">
          {items.map((it) => (
            <span
              key={it.label}
              className="stayops-pill"
              style={{ background: 'var(--so-canvas)' }}
            >
              {it.icon}
              {it.label}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------- 5. Problem -------------------- */
function ProblemSection() {
  const cards = [
    { title: 'Out-of-order rooms', body: 'Every extra night a room stays unavailable can mean revenue lost.' },
    { title: 'Delayed repairs',    body: 'Small maintenance issues become bigger problems when they are not handled quickly.' },
    { title: 'Missed audits',      body: 'Skipped checks create compliance risk, brand issues, and property damage over time.' },
    { title: 'Labour confusion',   body: 'When work is unclear, teams waste time chasing updates instead of moving rooms.' },
    { title: 'Inventory loss',     body: 'Missing or damaged items become silent expenses when there is no clear history.' },
    { title: 'No proof of work',   body: 'Without records, completed work gets questioned and teams get blamed unfairly.' },
  ];

  return (
    <section className="mx-auto max-w-7xl px-5 sm:px-8 py-20 sm:py-28">
      <div className="max-w-3xl">
        <span className="stayops-pill">The problem</span>
        <h2
          className="display mt-5"
          style={{
            color: 'var(--so-ink)',
            fontSize: 'clamp(2rem, 4.5vw, 3.5rem)',
            maxWidth: '18ch',
          }}
        >
          Hotel losses hide inside daily operations.
        </h2>
        <p className="mt-5 text-base sm:text-lg" style={{ color: 'var(--so-ink-muted)', lineHeight: 1.6 }}>
          A delayed repair, a missed audit, an unclear handover, one room left out of order,
          or inventory that quietly disappears — small issues become real money loss when
          owners cannot see them early.
        </p>
        <p className="mt-4 text-base sm:text-lg" style={{ color: 'var(--so-ink-muted)', lineHeight: 1.6 }}>
          Most hotels do not lose money from one big mistake. They lose it through small
          operational gaps that repeat every day.
        </p>
      </div>

      <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {cards.map((c) => (
          <div
            key={c.title}
            className="rounded-2xl p-6"
            style={{ background: 'var(--so-canvas-soft)', border: '1px solid var(--so-hairline)' }}
          >
            <h3 className="text-lg font-semibold" style={{ color: 'var(--so-ink)' }}>{c.title}</h3>
            <p className="mt-2 text-sm sm:text-base" style={{ color: 'var(--so-ink-muted)', lineHeight: 1.6 }}>{c.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* -------------------- 6. Product overview -------------------- */
function ProductOverview() {
  const modules = [
    { icon: <DoorOpen        className="w-5 h-5" />, title: 'Room Readiness',       body: 'Know which rooms are clean, dirty, inspected, blocked, or ready for the next guest.' },
    { icon: <Wrench          className="w-5 h-5" />, title: 'Maintenance',          body: 'Create and resolve issues with photos, priorities, assignments, and repair history.' },
    { icon: <ShieldCheck     className="w-5 h-5" />, title: 'Audits',               body: 'Schedule recurring inspections and keep a clear record of what was checked, when, and by whom.' },
    { icon: <Boxes           className="w-5 h-5" />, title: 'Inventory & Assets',   body: 'Track damage, replacements, missing items, and lifecycle history across rooms and properties.' },
    { icon: <CheckCheck      className="w-5 h-5" />, title: 'Labour & Tasks',       body: 'Assign work, manage handovers, and see what is completed without chasing every update.' },
    { icon: <LayoutDashboard className="w-5 h-5" />, title: 'Owner Dashboard',      body: 'See open issues, room downtime, audit health, property performance, and operational risks.' },
    { icon: <Brain           className="w-5 h-5" />, title: 'AI Operational Memory', body: 'Turn daily activity into patterns, summaries, repeated issue detection, and owner-level insight.' },
  ];

  return (
    <section
      className="border-y"
      style={{ borderColor: 'var(--so-hairline)', background: 'var(--so-canvas-soft)' }}
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8 py-20 sm:py-28">
        <div className="max-w-3xl">
          <span className="stayops-pill">Product</span>
          <h2
            className="display mt-5"
            style={{
              color: 'var(--so-ink)',
              fontSize: 'clamp(2rem, 4.5vw, 3.5rem)',
              maxWidth: '18ch',
            }}
          >
            One place for every property, room, task, and issue.
          </h2>
          <p className="mt-5 text-base sm:text-lg" style={{ color: 'var(--so-ink-muted)', lineHeight: 1.6 }}>
            StayOps connects the daily work happening inside every property with the
            visibility owners need to protect revenue and run better operations.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {modules.map((m) => (
            <div
              key={m.title}
              className="rounded-2xl p-6 transition-shadow hover:shadow-md"
              style={{ background: 'var(--so-canvas)', border: '1px solid var(--so-hairline)' }}
            >
              <span
                className="inline-flex w-10 h-10 rounded-full items-center justify-center"
                style={{ background: 'var(--so-cream)', color: 'var(--so-ink)' }}
              >
                {m.icon}
              </span>
              <h3 className="mt-4 text-lg font-semibold" style={{ color: 'var(--so-ink)' }}>
                {m.title}
              </h3>
              <p className="mt-2 text-sm sm:text-base" style={{ color: 'var(--so-ink-muted)', lineHeight: 1.6 }}>
                {m.body}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          <Link href="/website/products" className="stayops-cta-ghost">
            Explore Product <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* -------------------- 7. Money impact -------------------- */
function MoneyImpact() {
  const rows: Array<[string, string]> = [
    ['Room out of order',        'Lost room revenue'],
    ['Delayed maintenance',      'Longer downtime'],
    ['Missed audit',             'Compliance and brand risk'],
    ['Poor handover',            'Repeated work and confusion'],
    ['Lost inventory',           'Silent expense'],
    ['Overtime confusion',       'Margin pressure'],
    ['No repair history',        'Recurring problems stay hidden'],
    ['No owner visibility',      'Slow decisions and delayed action'],
  ];

  return (
    <section className="mx-auto max-w-7xl px-5 sm:px-8 py-20 sm:py-28">
      <div className="max-w-3xl">
        <span className="stayops-pill">Business impact</span>
        <h2
          className="display mt-5"
          style={{
            color: 'var(--so-ink)',
            fontSize: 'clamp(2rem, 4.5vw, 3.5rem)',
            maxWidth: '18ch',
          }}
        >
          See problems before they become losses.
        </h2>
        <p className="mt-5 text-base sm:text-lg" style={{ color: 'var(--so-ink-muted)', lineHeight: 1.6 }}>
          StayOps helps ownership groups understand which operational issues are affecting
          room revenue, labour cost, maintenance spend, asset life, and property performance.
        </p>
      </div>

      <div
        className="mt-10 rounded-2xl overflow-hidden"
        style={{ background: 'var(--so-canvas)', border: '1px solid var(--so-hairline)' }}
      >
        <div
          className="grid grid-cols-2 text-[11px] font-semibold uppercase tracking-[0.14em] px-6 py-4"
          style={{ color: 'var(--so-ink-dim)', borderBottom: '1px solid var(--so-hairline)', background: 'var(--so-canvas-soft)' }}
        >
          <span>Operational issue</span>
          <span>Business impact</span>
        </div>
        {rows.map(([issue, impact], i) => (
          <div
            key={issue}
            className="grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-0 px-6 py-4 text-sm sm:text-base"
            style={i < rows.length - 1 ? { borderBottom: '1px solid var(--so-hairline)' } : undefined}
          >
            <span style={{ color: 'var(--so-ink)', fontWeight: 500 }}>{issue}</span>
            <span style={{ color: 'var(--so-ink-muted)' }}>{impact}</span>
          </div>
        ))}
      </div>

      <div className="mt-10 max-w-2xl">
        <h3
          className="display"
          style={{
            color: 'var(--so-ink)',
            fontSize: 'clamp(1.5rem, 2.8vw, 2rem)',
          }}
        >
          Less guessing. Less chasing. More control.
        </h3>
        <p className="mt-4 text-base sm:text-lg" style={{ color: 'var(--so-ink-muted)', lineHeight: 1.6 }}>
          When operations are scattered, owners find out too late. StayOps brings the
          signals together so problems can be handled before they become expensive.
        </p>
      </div>
    </section>
  );
}

/* -------------------- 8. Built for owners and teams -------------------- */
function OwnersAndTeams() {
  const audiences = [
    { icon: <Eye              className="w-5 h-5" />, title: 'Owners',             body: 'See every property clearly, track issues, and protect revenue.' },
    { icon: <UserCheck        className="w-5 h-5" />, title: 'General Managers',   body: 'Run the day without chasing every department through calls and texts.' },
    { icon: <LayoutDashboard  className="w-5 h-5" />, title: 'Regional Managers',  body: 'Compare property health, open issues, and risk across multiple hotels.' },
    { icon: <Bed              className="w-5 h-5" />, title: 'Housekeeping',       body: 'Get clear room assignments, priorities, and proof of completion.' },
    { icon: <Wrench           className="w-5 h-5" />, title: 'Maintenance',        body: 'Know what is broken, what matters first, and what was fixed.' },
    { icon: <ConciergeBell    className="w-5 h-5" />, title: 'Front Desk',         body: 'Know room readiness before the guest reaches the desk.' },
  ];

  return (
    <section
      className="border-y"
      style={{ borderColor: 'var(--so-hairline)', background: 'var(--so-canvas-soft)' }}
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8 py-20 sm:py-28">
        <div className="max-w-3xl">
          <span className="stayops-pill">For every role</span>
          <h2
            className="display mt-5"
            style={{
              color: 'var(--so-ink)',
              fontSize: 'clamp(2rem, 4.5vw, 3.5rem)',
              maxWidth: '22ch',
            }}
          >
            Built for owners. Designed for the teams who run the hotel.
          </h2>
          <p className="mt-5 text-base sm:text-lg" style={{ color: 'var(--so-ink-muted)', lineHeight: 1.6 }}>
            StayOps gives owners the visibility they need while giving hotel teams clearer
            work, better proof, and fewer communication gaps.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {audiences.map((a) => (
            <div
              key={a.title}
              className="rounded-2xl p-6"
              style={{ background: 'var(--so-canvas)', border: '1px solid var(--so-hairline)' }}
            >
              <span
                className="inline-flex w-10 h-10 rounded-full items-center justify-center"
                style={{ background: 'var(--so-cream)', color: 'var(--so-ink)' }}
              >
                {a.icon}
              </span>
              <h3 className="mt-4 text-lg font-semibold" style={{ color: 'var(--so-ink)' }}>{a.title}</h3>
              <p className="mt-2 text-sm sm:text-base" style={{ color: 'var(--so-ink-muted)', lineHeight: 1.6 }}>{a.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------- 9. AI Operational Memory -------------------- */
function AiMemory() {
  const bullets = [
    'Rooms with frequent maintenance problems',
    'Items replaced too often',
    'Recurring audit failures',
    'Delayed task patterns',
    'Open issues by property',
    'Property health summaries',
    'Room-level operational history',
    'Asset lifecycle traceability',
  ];

  return (
    <section className="mx-auto max-w-7xl px-5 sm:px-8 py-20 sm:py-28">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
        <div className="lg:col-span-7">
          <span className="stayops-pill">AI Operational Memory</span>
          <h2
            className="display mt-5"
            style={{
              color: 'var(--so-ink)',
              fontSize: 'clamp(2rem, 4.5vw, 3.25rem)',
              maxWidth: '20ch',
            }}
          >
            Your hotel operations should remember what happened.
          </h2>
          <p className="mt-5 text-base sm:text-lg" style={{ color: 'var(--so-ink-muted)', lineHeight: 1.6 }}>
            StayOps does not just store tasks. It builds a history of rooms, assets,
            repairs, audits, and recurring issues. Over time, owners can see patterns,
            repeated problems, and operational risks before they become expensive.
          </p>

          <ul className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-x-8">
            {bullets.map((b, i) => (
              <li key={b}>
                {i === 0 && <div className="stayops-divider" />}
                <div className="py-4 text-base" style={{ color: 'var(--so-ink)' }}>
                  {b}
                </div>
                <div className="stayops-divider" />
              </li>
            ))}
          </ul>

          <p className="mt-8 text-sm" style={{ color: 'var(--so-ink-dim)' }}>
            AI in StayOps is not about replacing people. It is about helping owners and
            teams see patterns faster.
          </p>
        </div>

        <div className="lg:col-span-5">
          <AiMemoryVisual />
        </div>
      </div>
    </section>
  );
}

function AiMemoryVisual() {
  return (
    <div className="blob-card blob-amber">
      <div className="blob-pills">
        <span className="blob-pill" style={{ fontWeight: 600 }}>Property health — this week</span>
        <span className="blob-pill">Room 214 · 3 tickets</span>
        <span className="blob-pill">TV replacements ↑ Hampton</span>
        <span className="blob-pill">Audit missed · Cambria</span>
        <span className="blob-pill">Handover gap · Cotton Sail</span>
        <span className="blob-pill">Pattern: 3 properties affected</span>
      </div>
    </div>
  );
}

/* -------------------- 10. Before and After -------------------- */
function BeforeAndAfter() {
  const rows: Array<[string, string]> = [
    ['Calls, texts, paper, and spreadsheets',   'One control room'],
    ['Owners wait for updates',                  'Owners see live visibility'],
    ['Staff get blamed without proof',           'Staff have recorded proof'],
    ['Tasks disappear after completion',         'Operational history stays'],
    ['Issues are handled reactively',            'Patterns become visible'],
    ['Maintenance history is scattered',         'Room and asset history is traceable'],
    ['Audits are easy to miss',                  'Recurring checks stay visible'],
    ['Every property reports differently',       'Owners see one consistent view'],
  ];

  return (
    <section
      className="border-y"
      style={{ borderColor: 'var(--so-hairline)', background: 'var(--so-canvas-soft)' }}
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8 py-20 sm:py-28">
        <div className="max-w-3xl">
          <span className="stayops-pill">Before vs. After</span>
          <h2
            className="display mt-5"
            style={{
              color: 'var(--so-ink)',
              fontSize: 'clamp(2rem, 4.5vw, 3.5rem)',
              maxWidth: '22ch',
            }}
          >
            What changes when hotel operations are connected?
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
            <span>Before StayOps</span>
            <span>After StayOps</span>
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
      </div>
    </section>
  );
}

/* -------------------- 11. Demo preview -------------------- */
function DemoPreview() {
  const steps = [
    'Housekeeping reports an issue in Room 214.',
    'Maintenance receives the ticket with photo and priority.',
    'The room is marked unavailable until resolved.',
    'The technician uploads proof of completion.',
    'The room returns to readiness workflow.',
    'The owner dashboard records downtime, repair history, and revenue risk.',
  ];

  return (
    <section className="mx-auto max-w-7xl px-5 sm:px-8 py-20 sm:py-28">
      <div className="max-w-3xl">
        <span className="stayops-pill">Demo preview</span>
        <h2
          className="display mt-5"
          style={{
            color: 'var(--so-ink)',
            fontSize: 'clamp(2rem, 4.5vw, 3.5rem)',
          }}
        >
          See StayOps in action.
        </h2>
        <p className="mt-5 text-base sm:text-lg" style={{ color: 'var(--so-ink-muted)', lineHeight: 1.6 }}>
          Walk through how a room issue moves from discovery to repair, inspection, owner
          visibility, and operational memory.
        </p>
      </div>

      <ol className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {steps.map((s, i) => (
          <li
            key={s}
            className="rounded-2xl p-6"
            style={{ background: 'var(--so-canvas)', border: '1px solid var(--so-hairline)' }}
          >
            <span
              className="inline-flex w-8 h-8 rounded-full items-center justify-center text-sm font-semibold tabular-nums"
              style={{ background: 'var(--so-ink)', color: '#fff' }}
            >
              {i + 1}
            </span>
            <p className="mt-4 text-base" style={{ color: 'var(--so-ink)', lineHeight: 1.55 }}>
              {s}
            </p>
          </li>
        ))}
      </ol>

      <div className="mt-10 flex justify-start">
        <Link href="/website/contact" className="stayops-cta">
          Book a Demo <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
}

/* -------------------- 12. Final CTA -------------------- */
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
        Ready to see what your operations are hiding?
      </h2>
      <p
        className="mt-6 mx-auto text-base sm:text-lg"
        style={{ color: 'var(--so-ink-muted)', maxWidth: '54ch', lineHeight: 1.6 }}
      >
        Book a demo and see how StayOps can help your hotels reduce blind spots, improve
        accountability, and protect property-level revenue.
      </p>
      <div className="mt-8 flex items-center justify-center">
        <Link href="/website/contact" className="stayops-cta">
          Book a Demo <ArrowUpRight className="w-4 h-4" />
        </Link>
      </div>
      <p className="mt-5 text-sm" style={{ color: 'var(--so-ink-dim)' }}>
        Start with one property. Scale across every hotel.
      </p>
    </section>
  );
}

