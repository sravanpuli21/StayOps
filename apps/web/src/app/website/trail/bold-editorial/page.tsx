import Link from 'next/link';
import { ArrowRight, ArrowUpRight } from 'lucide-react';

export default function BoldEditorialPreview() {
  return (
    <main style={{ background: '#f5f2ec' }}>
      <PreviewBadge />
      <Masthead />
      <GiantNumberHero />
      <DepartmentStrip />
      <OpenLetter />
      <StatsGrid />
      <FinalCta />
    </main>
  );
}

function PreviewBadge() {
  return (
    <div className="text-center py-2 px-4 text-xs" style={{ background: '#0a0a0a', color: '#fff' }}>
      <Link href="/website/trail" className="hover:underline">← Back to trail index</Link>
      <span className="mx-3" style={{ color: '#666' }}>·</span>
      Preview: <strong className="font-semibold">Direction 4 — Bold editorial</strong>
    </div>
  );
}

/* ---------------- Masthead — newspaper-style ---------------- */
function Masthead() {
  return (
    <section className="border-y" style={{ borderColor: '#0a0a0a' }}>
      <div className="mx-auto max-w-7xl px-5 sm:px-8 py-4 flex items-center justify-between flex-wrap gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color: '#0a0a0a' }}>
          Vol. 1 · May 2026 · The owner&apos;s edition
        </p>
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color: '#6a6a6a' }}>
          For independent hotel ownership groups
        </p>
      </div>
    </section>
  );
}

/* ---------------- Giant numeric hero ---------------- */
function GiantNumberHero() {
  return (
    <section className="mx-auto max-w-7xl px-5 sm:px-8 pt-14 sm:pt-20 pb-16">
      <p
        className="text-xs font-bold uppercase tracking-[0.18em]"
        style={{ color: '#b64a3f' }}
      >
        The leakage report
      </p>

      <div className="mt-4 flex items-start gap-6 flex-wrap">
        <p
          style={{
            fontFamily: 'var(--font-serif), serif',
            fontSize: 'clamp(6rem, 22vw, 20rem)',
            lineHeight: 0.9,
            color: '#0a0a0a',
            letterSpacing: '-0.04em',
            fontWeight: 400,
          }}
        >
          $47K
        </p>
        <div className="flex-1 min-w-[280px] pt-8">
          <p
            style={{
              fontFamily: 'var(--font-serif), serif',
              fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)',
              lineHeight: 1.15,
              letterSpacing: '-0.015em',
              color: '#0a0a0a',
              maxWidth: '22ch',
            }}
          >
            The average monthly profit leak, per property, no owner ever saw.
          </p>
          <p className="mt-5 text-base" style={{ color: '#3f3f3f', lineHeight: 1.6, maxWidth: '50ch' }}>
            Booking.com commission. Expedia virtual card fees. Cancellations
            refunded without reason codes. A room sitting dirty for two days.
            A missed audit. An overtime shift nobody approved. Individually small.
            Together: the money the report never showed you.
          </p>
        </div>
      </div>

      <div className="mt-10 pt-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
           style={{ borderTop: '2px solid #0a0a0a' }}>
        <p className="text-sm" style={{ color: '#3f3f3f' }}>
          StayOps is the control room that finds it, shows it in dollars, and delivers it to
          your owner Monday morning.
        </p>
        <Link
          href="/website/contact"
          className="inline-flex items-center gap-2 rounded-none px-6 py-3 text-sm font-semibold text-white"
          style={{ background: '#0a0a0a' }}
        >
          Read the full brief <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
}

/* ---------------- Department strip (newspaper-style column heads) ---------------- */
function DepartmentStrip() {
  const sections = [
    { tag: 'Rooms',         title: 'Out of order vs. out of mind',       meta: '4 properties tracked' },
    { tag: 'Maintenance',   title: 'What a $40 part becomes at 3 weeks', meta: '12 tickets aging' },
    { tag: 'Audits',        title: 'The quiet brand-standard miss',       meta: '2 overdue audits' },
    { tag: 'Labour',        title: 'Overtime without an approver',        meta: '+$1,840 this period' },
  ];

  return (
    <section className="border-y" style={{ borderColor: '#0a0a0a', background: '#0a0a0a', color: '#f5f2ec' }}>
      <div className="mx-auto max-w-7xl px-5 sm:px-8 py-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-6 gap-x-8">
          {sections.map((s, i) => (
            <div key={s.tag} className="flex gap-5" style={i > 0 ? { borderLeft: '1px solid #222', paddingLeft: 24 } : undefined}>
              <div className="flex-1">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: '#b64a3f' }}>{s.tag}</p>
                <p
                  className="mt-1.5"
                  style={{
                    fontFamily: 'var(--font-serif), serif',
                    fontSize: '1.125rem',
                    lineHeight: 1.25,
                    color: '#f5f2ec',
                  }}
                >
                  {s.title}
                </p>
                <p className="mt-2 text-[11px]" style={{ color: '#929292' }}>{s.meta}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Open letter ---------------- */
function OpenLetter() {
  return (
    <section className="mx-auto max-w-4xl px-5 sm:px-8 py-20 sm:py-28">
      <p className="text-xs font-bold uppercase tracking-[0.18em]" style={{ color: '#b64a3f' }}>
        An open letter to hotel owners
      </p>

      <div
        className="mt-8 space-y-6"
        style={{
          fontFamily: 'var(--font-serif), serif',
          fontSize: 'clamp(1.125rem, 1.8vw, 1.375rem)',
          lineHeight: 1.55,
          color: '#0a0a0a',
        }}
      >
        <p style={{ fontWeight: 500 }}>
          You built your portfolio by counting every dollar.
        </p>
        <p>
          Then the tools arrived. A PMS. A payroll system. An accounting feed. Extranets
          for every OTA. A group chat for every property. And somewhere in that mess, the
          single thing you actually wanted — a clear picture of what happened yesterday —
          never got built.
        </p>
        <p>
          Your GMs aren&apos;t hiding anything from you. They&apos;re drowning in WhatsApp
          messages and paper sticky notes, and they can&apos;t reconstruct the day either.
        </p>
        <p>
          StayOps isn&apos;t software that will change how you run hotels. It&apos;s
          software that remembers what happened while you were running them.
        </p>
      </div>

      <p className="mt-10 text-sm" style={{ color: '#6a6a6a' }}>
        — The StayOps team, operator-led, 16-hotel customer zero
      </p>
    </section>
  );
}

/* ---------------- Stats grid — newspaper-grade density ---------------- */
function StatsGrid() {
  const stats = [
    { value: '21%',       label: 'Of OTA gross revenue lost to commission, fees, and cancellations' },
    { value: '$31',       label: 'Lower net ADR per Booking.com stay vs. a direct booking' },
    { value: '1–3',       label: 'Rooms per property sitting dirty past a normal turnover window' },
    { value: '2–3',       label: 'Zero-rate rooms per property: comp, house use, employee stays' },
    { value: '15 min',    label: 'GM onboarding — no IT ticket required' },
    { value: '0 tools',   label: 'Current systems StayOps needs to replace on day one' },
  ];

  return (
    <section className="border-t-2" style={{ borderColor: '#0a0a0a' }}>
      <div className="mx-auto max-w-7xl px-5 sm:px-8 py-16 sm:py-20">
        <p className="text-xs font-bold uppercase tracking-[0.18em]" style={{ color: '#b64a3f' }}>
          By the numbers
        </p>
        <div className="mt-8 grid grid-cols-2 md:grid-cols-3 gap-y-10 gap-x-8">
          {stats.map((s, i, arr) => (
            <div key={s.label} className={i < arr.length - 1 ? 'md:pr-8' : ''}
                 style={i < arr.length - 3 ? { borderBottom: '1px solid rgba(0,0,0,0.1)', paddingBottom: 24, marginBottom: 0 } : undefined}>
              <p
                style={{
                  fontFamily: 'var(--font-serif), serif',
                  fontSize: 'clamp(3rem, 5vw, 4.5rem)',
                  lineHeight: 0.95,
                  color: '#0a0a0a',
                  letterSpacing: '-0.03em',
                }}
              >
                {s.value}
              </p>
              <p className="mt-3 text-sm" style={{ color: '#3f3f3f', lineHeight: 1.55, maxWidth: '28ch' }}>
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Final CTA ---------------- */
function FinalCta() {
  return (
    <section className="border-t-2" style={{ borderColor: '#0a0a0a', background: '#0a0a0a', color: '#f5f2ec' }}>
      <div className="mx-auto max-w-4xl px-5 sm:px-8 py-20 sm:py-28 text-center">
        <p
          style={{
            fontFamily: 'var(--font-serif), serif',
            fontSize: 'clamp(2.5rem, 5vw, 4rem)',
            lineHeight: 1.08,
            letterSpacing: '-0.025em',
            color: '#f5f2ec',
            fontWeight: 400,
            maxWidth: '22ch',
            margin: '0 auto',
          }}
        >
          The number will not leak itself.
        </p>
        <div className="mt-10">
          <Link
            href="/website/contact"
            className="inline-flex items-center gap-2 px-7 py-3.5 text-sm font-semibold"
            style={{ background: '#f5f2ec', color: '#0a0a0a' }}
          >
            Book a demo <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
