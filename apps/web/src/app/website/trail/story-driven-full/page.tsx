/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import { ArrowRight, ArrowUpRight } from 'lucide-react';

const IMG = {
  hero:       'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1800&q=80&auto=format',
  hallway:    'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1400&q=80&auto=format',
  reception:  'https://images.unsplash.com/photo-1551918120-9739cb430c6d?w=1400&q=80&auto=format',
  housekeep:  'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=1400&q=80&auto=format',
  night:      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1800&q=80&auto=format',
  room:       'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1400&q=80&auto=format',
  room2:      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=1400&q=80&auto=format',
  exterior:   'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=1800&q=80&auto=format',
  stairs:     'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1400&q=80&auto=format',
};

export default function StoryDrivenFull() {
  return (
    <main>
      <PreviewBadge />
      <AnnouncementBar />
      <Hero />
      <OperatorRealityStrip />
      <Problem />
      <ProductOverview />
      <MoneyImpact />
      <OwnersAndTeams />
      <AiMemory />
      <BeforeAfter />
      <DemoPreview />
      <FinalCta />
    </main>
  );
}

function PreviewBadge() {
  return (
    <div className="text-center py-2 px-4 text-xs" style={{ background: '#0a0a0a', color: '#fff' }}>
      <Link href="/website/trail" className="hover:underline">← Back to trail index</Link>
      <span className="mx-3" style={{ color: '#666' }}>·</span>
      Story-driven · <strong className="font-semibold">Full (all 11 sections)</strong>
    </div>
  );
}

/* ---------------- 1. Announcement ---------------- */
function AnnouncementBar() {
  return (
    <div className="text-center py-2.5 px-4 text-sm" style={{ background: '#ede8dc', color: '#0a0a0a', borderBottom: '1px solid #d4d0c5' }}>
      Built for hotel ownership groups that want clearer operations and fewer hidden losses.
    </div>
  );
}

/* ---------------- 2. Hero ---------------- */
function Hero() {
  return (
    <section className="relative" style={{ height: 'min(78vh, 760px)' }}>
      <img src={IMG.hero} alt="Hotel lobby at night" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.45) 60%, rgba(0,0,0,0.75) 100%)' }} />
      <div className="relative z-10 h-full mx-auto max-w-6xl px-5 sm:px-8 flex flex-col justify-end pb-16 sm:pb-20 text-white">
        <span
          className="inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em]"
          style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(6px)' }}
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#ff385c' }} />
          The owner&apos;s control room
        </span>
        <h1 className="mt-5" style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)', lineHeight: 1.02, letterSpacing: '-0.03em', maxWidth: '18ch', fontWeight: 600 }}>
          The hotel runs after everyone goes home.
        </h1>
        <p className="mt-5 text-base sm:text-lg lg:text-xl" style={{ color: 'rgba(255,255,255,0.85)', maxWidth: '44ch', lineHeight: 1.5 }}>
          Rooms turn. Repairs queue. Audits age. Handovers drift. StayOps keeps the record so
          the owner sees the truth in the morning.
        </p>
        <div className="mt-8 flex items-center gap-3 flex-wrap">
          <Link href="/website/contact" className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold" style={{ background: '#fff', color: '#0a0a0a' }}>
            Book a demo <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href="#problem" className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white" style={{ border: '1px solid rgba(255,255,255,0.5)' }}>
            See how it works
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ---------------- 3. Operator reality strip ---------------- */
function OperatorRealityStrip() {
  const items = ['Room readiness', 'Maintenance delays', 'Missed audits', 'Labour handovers', 'Inventory loss', 'Owner reporting'];
  return (
    <section className="border-y" style={{ background: '#f5f2ec', borderColor: '#d4d0c5' }}>
      <div className="mx-auto max-w-6xl px-5 sm:px-8 py-10 text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: '#6a6a6a' }}>
          Built around the realities of hotel operations
        </p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          {items.map((item) => (
            <span
              key={item}
              className="inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium"
              style={{ background: '#fff', color: '#0a0a0a', border: '1px solid #d4d0c5' }}
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- 4. Problem ---------------- */
function Problem() {
  const cards = [
    { title: 'Out-of-order rooms', body: 'Every extra night a room stays unavailable can mean revenue lost.' },
    { title: 'Delayed repairs',    body: 'Small maintenance issues become bigger problems when they aren\'t handled quickly.' },
    { title: 'Missed audits',      body: 'Skipped checks create compliance risk, brand issues, and property damage.' },
    { title: 'Labour confusion',   body: 'Unclear work makes teams chase updates instead of moving rooms.' },
    { title: 'Inventory loss',     body: 'Missing or damaged items become silent expenses with no clear history.' },
    { title: 'No proof of work',   body: 'Without records, completed work gets questioned and teams get blamed.' },
  ];
  return (
    <section id="problem" className="relative overflow-hidden" style={{ background: '#0a0a0a', color: '#fff' }}>
      <img src={IMG.exterior} alt="" className="absolute inset-0 w-full h-full object-cover opacity-[0.12]" />
      <div className="relative mx-auto max-w-6xl px-5 sm:px-8 py-20 sm:py-28">
        <p className="text-xs font-semibold uppercase tracking-[0.14em]" style={{ color: '#ff385c' }}>The problem</p>
        <h2 style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)', lineHeight: 1.12, letterSpacing: '-0.02em', fontWeight: 600, maxWidth: '22ch' }} className="mt-3">
          Hotel losses hide inside daily operations.
        </h2>
        <p className="mt-5 text-base sm:text-lg" style={{ color: '#c1c1c1', lineHeight: 1.6, maxWidth: '56ch' }}>
          Most hotels don&apos;t lose money from one big mistake. They lose it through small
          operational gaps that repeat every day.
        </p>
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {cards.map((c) => (
            <div key={c.title} className="rounded-2xl p-5" style={{ background: '#141414', border: '1px solid #222' }}>
              <p className="text-base font-semibold">{c.title}</p>
              <p className="mt-2 text-sm" style={{ color: '#a8a8a8', lineHeight: 1.55 }}>{c.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- 5. Product Overview ---------------- */
function ProductOverview() {
  const modules = [
    { name: 'Room Readiness',    body: 'Clean / dirty / inspected / ready / OOO in one shared view.' },
    { name: 'Maintenance',       body: 'Tickets with photos, priorities, assignments, and proof.' },
    { name: 'Audits',            body: 'Recurring inspections with history and scoring.' },
    { name: 'Inventory & Assets',body: 'Item-level history, repeat failures, vendor spend.' },
    { name: 'Labour & Tasks',    body: 'Clear assignments, handovers, proof of completion.' },
    { name: 'Owner Dashboard',   body: 'Property health, room downtime, operational risk.' },
    { name: 'AI Memory',         body: 'Patterns, recurring issues, owner-ready summaries.' },
  ];
  return (
    <section className="mx-auto max-w-6xl px-5 sm:px-8 py-20 sm:py-28">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
        <div className="lg:col-span-5 lg:sticky lg:top-24">
          <p className="text-xs font-semibold uppercase tracking-[0.14em]" style={{ color: '#b64a3f' }}>The tool</p>
          <h2 style={{ fontFamily: 'var(--font-serif), serif', fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)', lineHeight: 1.12, letterSpacing: '-0.015em', color: '#0a0a0a', maxWidth: '20ch' }} className="mt-3">
            Seven modules. One operating layer.
          </h2>
        </div>
        <div className="lg:col-span-7">
          <div className="rounded-3xl overflow-hidden" style={{ border: '1px solid #eee' }}>
            {modules.map((m, i) => (
              <div
                key={m.name}
                className="flex items-start gap-5 px-5 py-4"
                style={i < modules.length - 1 ? { borderBottom: '1px solid #f0f0f0' } : undefined}
              >
                <p
                  className="tabular-nums"
                  style={{ fontFamily: 'var(--font-serif), serif', fontSize: '1.25rem', color: '#c1c1c1', lineHeight: 1.1, minWidth: 36, paddingTop: 2 }}
                >
                  {String(i + 1).padStart(2, '0')}
                </p>
                <div className="flex-1">
                  <p className="text-base font-semibold" style={{ color: '#0a0a0a' }}>{m.name}</p>
                  <p className="mt-1 text-sm" style={{ color: '#6a6a6a', lineHeight: 1.55 }}>{m.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- 6. Money Impact ---------------- */
function MoneyImpact() {
  const rows: Array<[string, string]> = [
    ['Room out of order',       'Lost room revenue'],
    ['Delayed maintenance',     'Longer downtime'],
    ['Missed audit',            'Compliance and brand risk'],
    ['Poor handover',           'Repeated work and confusion'],
    ['Lost inventory',          'Silent expense'],
    ['Overtime confusion',      'Margin pressure'],
    ['No repair history',       'Recurring problems stay hidden'],
    ['No owner visibility',     'Slow decisions and delayed action'],
  ];
  return (
    <section className="border-y" style={{ background: '#f5f2ec', borderColor: '#d4d0c5' }}>
      <div className="mx-auto max-w-6xl px-5 sm:px-8 py-20 sm:py-28">
        <p className="text-xs font-semibold uppercase tracking-[0.14em]" style={{ color: '#b64a3f' }}>Business impact</p>
        <h2 style={{ fontFamily: 'var(--font-serif), serif', fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)', lineHeight: 1.12, letterSpacing: '-0.015em', color: '#0a0a0a', maxWidth: '20ch' }} className="mt-3">
          See problems before they become losses.
        </h2>
        <div className="mt-10 rounded-2xl overflow-hidden" style={{ background: '#fff', border: '1px solid #d4d0c5' }}>
          <div className="grid grid-cols-2 text-[11px] font-semibold uppercase tracking-[0.14em] px-6 py-4"
               style={{ color: '#6a6a6a', borderBottom: '1px solid #d4d0c5', background: '#ede8dc' }}>
            <span>Operational issue</span>
            <span>Business impact</span>
          </div>
          {rows.map(([issue, impact], i) => (
            <div
              key={issue}
              className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-0 px-6 py-4 text-sm sm:text-base"
              style={i < rows.length - 1 ? { borderBottom: '1px solid #ede8dc' } : undefined}
            >
              <span style={{ color: '#0a0a0a', fontWeight: 500 }}>{issue}</span>
              <span style={{ color: '#6a6a6a' }}>{impact}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- 7. Owners and Teams ---------------- */
function OwnersAndTeams() {
  const audiences = [
    { title: 'Owners',           body: 'See every property clearly, track issues, and protect revenue.' },
    { title: 'General Managers', body: 'Run the day without chasing every department through calls and texts.' },
    { title: 'Regional Managers',body: 'Compare property health, open issues, and risk across multiple hotels.' },
    { title: 'Housekeeping',     body: 'Get clear room assignments, priorities, and proof of completion.' },
    { title: 'Maintenance',      body: 'Know what\'s broken, what matters first, and what was fixed.' },
    { title: 'Front Desk',       body: 'Know room readiness before the guest reaches the desk.' },
  ];
  return (
    <section className="mx-auto max-w-6xl px-5 sm:px-8 py-20 sm:py-28">
      <div className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.14em]" style={{ color: '#b64a3f' }}>For every role</p>
        <h2 style={{ fontFamily: 'var(--font-serif), serif', fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)', lineHeight: 1.12, letterSpacing: '-0.015em', color: '#0a0a0a' }} className="mt-3">
          Built for owners. Designed for the teams who run the hotel.
        </h2>
      </div>
      <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {audiences.map((a) => (
          <div key={a.title} className="rounded-2xl p-6" style={{ background: '#fff', border: '1px solid #eee' }}>
            <p className="text-lg font-semibold" style={{ color: '#0a0a0a' }}>{a.title}</p>
            <p className="mt-2 text-sm" style={{ color: '#6a6a6a', lineHeight: 1.6 }}>{a.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------------- 8. AI Memory ---------------- */
function AiMemory() {
  const bullets = [
    'Rooms with frequent maintenance problems',
    'Items replaced too often',
    'Recurring audit failures',
    'Delayed task patterns',
    'Property health summaries',
    'Room-level operational history',
    'Asset lifecycle traceability',
    'Owner-ready daily summaries',
  ];
  return (
    <section className="relative overflow-hidden" style={{ background: '#0a0a0a', color: '#fff' }}>
      <img src={IMG.stairs} alt="" className="absolute inset-0 w-full h-full object-cover opacity-[0.18]" />
      <div className="relative mx-auto max-w-6xl px-5 sm:px-8 py-20 sm:py-28">
        <p className="text-xs font-semibold uppercase tracking-[0.14em]" style={{ color: '#ff385c' }}>AI Operational Memory</p>
        <h2 style={{ fontFamily: 'var(--font-serif), serif', fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)', lineHeight: 1.12, letterSpacing: '-0.015em', maxWidth: '24ch' }} className="mt-3">
          Your hotel operations should remember what happened.
        </h2>
        <p className="mt-5 text-base sm:text-lg" style={{ color: '#c1c1c1', lineHeight: 1.65, maxWidth: '56ch' }}>
          StayOps builds a history of rooms, assets, repairs, audits, and recurring issues. Over
          time, owners see patterns, repeated problems, and operational risks before they become expensive.
        </p>
        <ul className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-3">
          {bullets.map((b) => (
            <li key={b} className="text-sm" style={{ color: '#e5e5e5', borderTop: '1px solid #222', paddingTop: 10 }}>
              {b}
            </li>
          ))}
        </ul>
        <p className="mt-8 text-sm italic" style={{ color: '#929292' }}>
          AI in StayOps is not about replacing people. It&apos;s about helping owners and teams see patterns faster.
        </p>
      </div>
    </section>
  );
}

/* ---------------- 9. Before / After ---------------- */
function BeforeAfter() {
  const rows: Array<[string, string]> = [
    ['Calls, texts, paper, and spreadsheets',   'One control room'],
    ['Owners wait for updates',                  'Owners see live visibility'],
    ['Staff get blamed without proof',           'Staff have recorded proof'],
    ['Tasks disappear after completion',         'Operational history stays'],
    ['Issues handled reactively',                'Patterns become visible'],
    ['Maintenance history is scattered',         'Room and asset history is traceable'],
    ['Audits are easy to miss',                  'Recurring checks stay visible'],
    ['Every property reports differently',       'Owners see one consistent view'],
  ];
  return (
    <section className="relative overflow-hidden" style={{ background: '#f5f2ec' }}>
      <img src={IMG.room2} alt="" className="absolute inset-0 w-full h-full object-cover opacity-[0.1]" style={{ mixBlendMode: 'multiply' }} />
      <div className="relative mx-auto max-w-5xl px-5 sm:px-8 py-20 sm:py-28">
        <p className="text-xs font-semibold uppercase tracking-[0.14em]" style={{ color: '#b64a3f' }}>What changes</p>
        <h2 style={{ fontFamily: 'var(--font-serif), serif', fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)', lineHeight: 1.12, letterSpacing: '-0.02em', color: '#0a0a0a', maxWidth: '22ch' }} className="mt-3">
          Before and after the control room.
        </h2>
        <div className="mt-10 rounded-2xl overflow-hidden" style={{ background: '#fff', border: '1px solid #d4d0c5' }}>
          <div className="grid grid-cols-2 text-[11px] font-semibold uppercase tracking-[0.14em] px-6 py-4"
               style={{ color: '#6a6a6a', borderBottom: '1px solid #d4d0c5', background: '#ede8dc' }}>
            <span>Before StayOps</span>
            <span>After StayOps</span>
          </div>
          {rows.map(([before, after], i) => (
            <div
              key={before}
              className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-0 px-6 py-4 text-sm sm:text-base"
              style={i < rows.length - 1 ? { borderBottom: '1px solid #ede8dc' } : undefined}
            >
              <span style={{ color: '#6a6a6a' }}>{before}</span>
              <span style={{ color: '#0a0a0a', fontWeight: 500 }}>{after}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- 10. Demo preview ---------------- */
function DemoPreview() {
  const steps = [
    'Housekeeping reports an issue in Room 214.',
    'Maintenance receives the ticket with photo and priority.',
    'The room is marked unavailable until resolved.',
    'The technician uploads proof of completion.',
    'The room returns to the readiness workflow.',
    'The owner dashboard records downtime, repair history, and revenue risk.',
  ];
  return (
    <section className="mx-auto max-w-6xl px-5 sm:px-8 py-20 sm:py-28">
      <p className="text-xs font-semibold uppercase tracking-[0.14em]" style={{ color: '#b64a3f' }}>Demo preview</p>
      <h2 style={{ fontFamily: 'var(--font-serif), serif', fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)', lineHeight: 1.12, letterSpacing: '-0.015em', color: '#0a0a0a' }} className="mt-3">
        See StayOps in action.
      </h2>
      <ol className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {steps.map((s, i) => (
          <li key={s} className="rounded-2xl p-6" style={{ background: '#fafafa', border: '1px solid #eee' }}>
            <span
              className="inline-flex w-8 h-8 rounded-full items-center justify-center text-sm font-semibold tabular-nums"
              style={{ background: '#0a0a0a', color: '#fff' }}
            >
              {i + 1}
            </span>
            <p className="mt-4 text-base" style={{ color: '#0a0a0a', lineHeight: 1.5 }}>{s}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

/* ---------------- 11. Final CTA ---------------- */
function FinalCta() {
  return (
    <section className="relative" style={{ height: 'min(60vh, 560px)' }}>
      <img src={IMG.room} alt="" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(10,10,10,0.4) 0%, rgba(10,10,10,0.85) 100%)' }} />
      <div className="relative z-10 h-full mx-auto max-w-4xl px-5 sm:px-8 flex flex-col justify-center items-center text-center text-white">
        <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', lineHeight: 1.08, letterSpacing: '-0.025em', fontWeight: 600, maxWidth: '22ch' }}>
          Give your hotels the memory they never had.
        </h2>
        <p className="mt-5 text-base sm:text-lg" style={{ color: 'rgba(255,255,255,0.85)', maxWidth: '42ch', lineHeight: 1.5 }}>
          30-minute demo. Bring one month of real operations. Walk out with a picture of what&apos;s actually happening.
        </p>
        <div className="mt-8">
          <Link href="/website/contact" className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold" style={{ background: '#fff', color: '#0a0a0a' }}>
            Book a demo <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
