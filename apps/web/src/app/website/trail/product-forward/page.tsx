import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Bell, Boxes, Brain, CheckCheck, DoorOpen, LayoutDashboard, ShieldCheck, Sparkles, Wrench } from 'lucide-react';

export default function ProductForwardPreview() {
  return (
    <main>
      <PreviewBadge />
      <Hero />
      <Modules />
      <ProofStrip />
      <TwoProducts />
      <FinalCta />
    </main>
  );
}

function PreviewBadge() {
  return (
    <div
      className="text-center py-2 px-4 text-xs"
      style={{ background: '#0a0a0a', color: '#fff' }}
    >
      <Link href="/website/trail" className="hover:underline">← Back to trail index</Link>
      <span className="mx-3" style={{ color: '#666' }}>·</span>
      Preview: <strong className="font-semibold">Direction 1 — Product-forward</strong>
    </div>
  );
}

/* ---------------- Hero ---------------- */
function Hero() {
  return (
    <section className="mx-auto max-w-7xl px-5 sm:px-8 pt-12 sm:pt-20 pb-16 sm:pb-24">
      <div className="text-center max-w-3xl mx-auto">
        <span
          className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide"
          style={{ background: '#f7f7f7', color: '#222', border: '1px solid #eee' }}
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#ff385c' }} />
          The control room for hotel operations
        </span>

        <h1
          className="mt-6 font-semibold tracking-tight"
          style={{
            color: '#0a0a0a',
            fontSize: 'clamp(2.25rem, 5vw, 4rem)',
            lineHeight: 1.04,
            letterSpacing: '-0.035em',
          }}
        >
          Every room, every ticket, every dollar — in one place.
        </h1>

        <p
          className="mt-5 text-base sm:text-lg"
          style={{ color: '#6a6a6a', lineHeight: 1.55 }}
        >
          StayOps is the operating system your hotels already needed. Owners see live visibility.
          Teams run the day without chaos.
        </p>

        <div className="mt-7 flex items-center justify-center gap-3 flex-wrap">
          <Link href="/website/contact" className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white" style={{ background: '#0a0a0a' }}>
            Book a demo <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href="#modules" className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold" style={{ color: '#222', border: '1px solid #dddddd' }}>
            See the product
          </Link>
        </div>
      </div>

      {/* Giant product mockup */}
      <div className="mt-14">
        <ProductMockup />
      </div>
    </section>
  );
}

function ProductMockup() {
  return (
    <div
      className="rounded-3xl overflow-hidden mx-auto relative"
      style={{
        background: 'linear-gradient(180deg, #fafafa 0%, #f2f2f2 100%)',
        border: '1px solid #e5e5e5',
        boxShadow: '0 24px 60px -20px rgba(0,0,0,0.12), 0 6px 16px -4px rgba(0,0,0,0.06)',
      }}
    >
      {/* Window chrome */}
      <div className="flex items-center gap-2 px-5 py-3" style={{ background: '#f0f0f0', borderBottom: '1px solid #e5e5e5' }}>
        <span className="w-3 h-3 rounded-full" style={{ background: '#fc625d' }} />
        <span className="w-3 h-3 rounded-full" style={{ background: '#fdbc40' }} />
        <span className="w-3 h-3 rounded-full" style={{ background: '#35cd4b' }} />
        <span className="ml-4 text-xs" style={{ color: '#929292' }}>stayops.com/web/harshal/dashboard</span>
      </div>

      {/* Two-pane app */}
      <div className="grid grid-cols-[200px_1fr] min-h-[520px] bg-white">
        {/* Sidebar */}
        <div className="p-4" style={{ borderRight: '1px solid #eee' }}>
          <div className="flex items-center gap-2 mb-6">
            <span className="w-2 h-2 rounded-full" style={{ background: '#ff385c' }} />
            <span className="font-bold text-sm" style={{ color: '#222' }}>StayOps</span>
          </div>
          {['Dashboard', 'Revenue', 'OTA Leakage', 'Operations', 'Audits', 'Labour', 'Alerts', 'Strategy'].map((item, i) => (
            <div
              key={item}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm mb-1"
              style={{
                background: i === 0 ? 'rgba(255,56,92,0.08)' : 'transparent',
                color: i === 0 ? '#ff385c' : '#6a6a6a',
                fontWeight: i === 0 ? 600 : 500,
              }}
            >
              <span className="w-1 h-1 rounded-full" style={{ background: i === 0 ? '#ff385c' : '#c1c1c1' }} />
              {item}
            </div>
          ))}
        </div>

        {/* Main panel — KPIs + table preview */}
        <div className="p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.12em]" style={{ color: '#929292' }}>
            Harshal&apos;s Region · Yesterday
          </p>
          <div className="mt-4 grid grid-cols-5 gap-3">
            {[
              { label: 'Occupancy', value: '82.4%' },
              { label: 'Total Revenue', value: '$1.24M' },
              { label: 'Rooms OOO', value: '4' },
              { label: 'Stale Dirty', value: '6' },
              { label: 'Score', value: '78' },
            ].map((k) => (
              <div key={k.label} className="rounded-xl p-3" style={{ border: '1px solid #eee' }}>
                <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: '#929292' }}>{k.label}</p>
                <p className="mt-1 text-lg font-bold tabular-nums" style={{ color: '#222' }}>{k.value}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-xl overflow-hidden" style={{ border: '1px solid #eee' }}>
            <div className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide flex items-center justify-between"
                 style={{ background: '#f7f7f7', color: '#6a6a6a' }}>
              <span>Revenue ranking — weakest first</span>
              <span>7 hotels</span>
            </div>
            {[
              { name: 'Hampton Gateway', occ: '68%', rev: '$132K', color: '#b91c1c' },
              { name: 'Woodspring Brunswick', occ: '71%', rev: '$118K', color: '#b45309' },
              { name: 'Holiday Inn Express', occ: '78%', rev: '$142K', color: '#3f3f3f' },
              { name: 'Home2 Baton Rouge', occ: '82%', rev: '$156K', color: '#3f3f3f' },
              { name: 'Hotel Amalga', occ: '89%', rev: '$189K', color: '#15803d' },
            ].map((r, i, arr) => (
              <div
                key={r.name}
                className="flex items-center justify-between px-4 py-2.5 text-sm"
                style={i < arr.length - 1 ? { borderBottom: '1px solid #f0f0f0' } : undefined}
              >
                <span style={{ color: '#222' }}>{r.name}</span>
                <span className="flex items-center gap-5 text-xs">
                  <span className="tabular-nums" style={{ color: '#6a6a6a' }}>{r.occ}</span>
                  <span className="tabular-nums font-semibold" style={{ color: r.color }}>{r.rev}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Modules ---------------- */
function Modules() {
  const modules = [
    { icon: <DoorOpen  className="w-5 h-5" />, title: 'Room Readiness',       body: 'Clean / dirty / inspected / ready / OOO — one shared view.' },
    { icon: <Wrench    className="w-5 h-5" />, title: 'Maintenance',          body: 'Tickets with photos, priorities, and proof of resolution.' },
    { icon: <ShieldCheck className="w-5 h-5" />, title: 'Audits',             body: 'Recurring inspections with history and scoring.' },
    { icon: <Boxes     className="w-5 h-5" />, title: 'Inventory & Assets',   body: 'Item-level history, repeat failures, vendor spend.' },
    { icon: <CheckCheck className="w-5 h-5" />, title: 'Labour & Tasks',      body: 'Assignments, handovers, completion proof.' },
    { icon: <LayoutDashboard className="w-5 h-5" />, title: 'Owner Dashboard', body: 'Portfolio visibility, property health, operational risk.' },
    { icon: <Brain     className="w-5 h-5" />, title: 'AI Memory',            body: 'Patterns, recurring issues, owner-ready summaries.' },
    { icon: <Bell      className="w-5 h-5" />, title: 'Alerts',               body: 'Routed to the right person before the weekend call.' },
  ];

  return (
    <section id="modules" className="border-y" style={{ borderColor: '#eee', background: '#fafafa' }}>
      <div className="mx-auto max-w-7xl px-5 sm:px-8 py-16 sm:py-24">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.14em]" style={{ color: '#ff385c' }}>
            The stack
          </p>
          <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight"
              style={{ color: '#0a0a0a', letterSpacing: '-0.025em', lineHeight: 1.08 }}>
            Eight modules. One operating layer.
          </h2>
        </div>

        <div className="mt-10 grid grid-cols-2 lg:grid-cols-4 gap-3">
          {modules.map((m) => (
            <div key={m.title} className="rounded-2xl p-5" style={{ background: '#fff', border: '1px solid #eee' }}>
              <span
                className="inline-flex w-10 h-10 rounded-xl items-center justify-center"
                style={{ background: 'rgba(255,56,92,0.08)', color: '#ff385c' }}
              >
                {m.icon}
              </span>
              <p className="mt-4 text-base font-semibold" style={{ color: '#222' }}>{m.title}</p>
              <p className="mt-1 text-sm" style={{ color: '#6a6a6a', lineHeight: 1.55 }}>{m.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Proof Strip (metric hero) ---------------- */
function ProofStrip() {
  const stats = [
    { value: '16', label: 'Hotels live on StayOps today' },
    { value: '<15 min', label: 'GM onboarding' },
    { value: '0', label: 'IT tickets required' },
    { value: '30 days', label: 'Pays for itself or you walk' },
  ];

  return (
    <section className="mx-auto max-w-7xl px-5 sm:px-8 py-16 sm:py-24">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl p-6" style={{ background: '#fafafa', border: '1px solid #eee' }}>
            <p className="font-bold tabular-nums"
               style={{ color: '#0a0a0a', fontSize: 'clamp(2rem, 3.5vw, 3rem)', letterSpacing: '-0.03em' }}>
              {s.value}
            </p>
            <p className="mt-1 text-sm" style={{ color: '#6a6a6a', lineHeight: 1.5 }}>{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------------- Two products ---------------- */
function TwoProducts() {
  return (
    <section className="border-y" style={{ borderColor: '#eee', background: '#0a0a0a', color: '#fff' }}>
      <div className="mx-auto max-w-7xl px-5 sm:px-8 py-16 sm:py-24">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.14em]" style={{ color: '#ff385c' }}>
            Who it&apos;s for
          </p>
          <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight"
              style={{ letterSpacing: '-0.025em', lineHeight: 1.08 }}>
            Built for owners. Designed for the team that actually runs the hotel.
          </h2>
        </div>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="rounded-2xl p-7" style={{ background: '#141414', border: '1px solid #252525' }}>
            <Sparkles className="w-6 h-6" style={{ color: '#ff385c' }} />
            <p className="mt-4 text-xl font-semibold">For hotel owners</p>
            <p className="mt-2 text-sm" style={{ color: '#c1c1c1', lineHeight: 1.6 }}>
              One screen for the whole portfolio. Leakage, labour, audits, operational risk —
              in dollars, every Monday morning.
            </p>
          </div>
          <div className="rounded-2xl p-7" style={{ background: '#141414', border: '1px solid #252525' }}>
            <CheckCheck className="w-6 h-6" style={{ color: '#ff385c' }} />
            <p className="mt-4 text-xl font-semibold">For hotel teams</p>
            <p className="mt-2 text-sm" style={{ color: '#c1c1c1', lineHeight: 1.6 }}>
              Clear work. Proof of completion. Fewer phone calls between housekeeping, front
              desk, maintenance, and the owner.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Final CTA ---------------- */
function FinalCta() {
  return (
    <section className="mx-auto max-w-4xl px-5 sm:px-8 py-20 sm:py-28 text-center">
      <h2
        className="font-semibold tracking-tight"
        style={{ color: '#0a0a0a', fontSize: 'clamp(2rem, 4vw, 3.25rem)', letterSpacing: '-0.03em', lineHeight: 1.1 }}
      >
        See your portfolio. On real numbers.
      </h2>
      <p className="mt-5 mx-auto text-base sm:text-lg" style={{ color: '#6a6a6a', maxWidth: '50ch', lineHeight: 1.6 }}>
        30-minute demo. Bring one month of your data. Walk out with the picture.
      </p>
      <div className="mt-8">
        <Link href="/website/contact" className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold text-white" style={{ background: '#0a0a0a' }}>
          Book a demo <ArrowUpRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
}
