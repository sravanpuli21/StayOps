/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import { ArrowRight, ArrowUpRight } from 'lucide-react';

// Unsplash hotel-context photography as placeholders until real brand imagery lands.
const IMG = {
  hero:      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1800&q=80&auto=format',
  hallway:   'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1400&q=80&auto=format',
  reception: 'https://images.unsplash.com/photo-1551918120-9739cb430c6d?w=1400&q=80&auto=format',
  housekeep: 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=1400&q=80&auto=format',
  night:     'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1800&q=80&auto=format',
  room:      'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1400&q=80&auto=format',
};

export default function WebsiteHome() {
  return (
    <main>
      <Hero />
      <QuoteStrip />
      <ThreeScenes />
      <OperatorsNote />
      <FinalCta />
    </main>
  );
}

/* ---------------- Hero — full-bleed hotel lobby photo ---------------- */
function Hero() {
  return (
    <section className="relative" style={{ height: 'min(78vh, 760px)' }}>
      <img
        src={IMG.hero}
        alt="Hotel lobby at night"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.45) 60%, rgba(0,0,0,0.75) 100%)',
        }}
      />
      <div className="relative z-10 h-full mx-auto max-w-6xl px-5 sm:px-8 flex flex-col justify-end pb-16 sm:pb-20 text-white">
        <span
          className="inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em]"
          style={{
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
            backdropFilter: 'blur(6px)',
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#ff385c' }} />
          For independent ownership groups
        </span>
        <h1
          className="mt-5"
          style={{
            fontSize: 'clamp(2.5rem, 6vw, 5rem)',
            lineHeight: 1.02,
            letterSpacing: '-0.03em',
            maxWidth: '18ch',
            fontWeight: 600,
          }}
        >
          The hotel runs after everyone goes home.
        </h1>
        <p
          className="mt-5 text-base sm:text-lg lg:text-xl"
          style={{ color: 'rgba(255,255,255,0.85)', maxWidth: '44ch', lineHeight: 1.5 }}
        >
          Rooms turn. Repairs queue. Audits age. Handovers drift. By the time the owner asks,
          the answer is gone. StayOps gives the hotel a memory.
        </p>
        <div className="mt-8 flex items-center gap-3 flex-wrap">
          <Link
            href="/website/contact"
            className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold"
            style={{ background: '#fff', color: '#0a0a0a' }}
          >
            Book a demo <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="#scenes"
            className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white"
            style={{ border: '1px solid rgba(255,255,255,0.5)' }}
          >
            See how it works
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Pull quote ---------------- */
function QuoteStrip() {
  return (
    <section className="mx-auto max-w-4xl px-5 sm:px-8 py-20 sm:py-28 text-center">
      <p
        className="mx-auto"
        style={{
          fontFamily: 'var(--font-serif), serif',
          fontSize: 'clamp(1.5rem, 3vw, 2.25rem)',
          lineHeight: 1.3,
          color: '#222',
          letterSpacing: '-0.01em',
          maxWidth: '36ch',
        }}
      >
        &ldquo;I didn&apos;t need another dashboard. I needed the hotel to remember what
        happened yesterday.&rdquo;
      </p>
      <p
        className="mt-6 text-sm uppercase tracking-[0.16em]"
        style={{ color: '#929292', fontWeight: 500 }}
      >
        — what we kept hearing from operators
      </p>
    </section>
  );
}

/* ---------------- Three scenes — a day in the life without StayOps ---------------- */
function ThreeScenes() {
  const scenes = [
    {
      img: IMG.hallway,
      eyebrow: '11:08 PM',
      headline: 'A housekeeper finds a broken AC.',
      body: 'Room 214. She tells the front desk. The desk is checking in a guest. The note gets written on a sticky.',
    },
    {
      img: IMG.reception,
      eyebrow: '7:42 AM',
      headline: 'Morning handover runs thin.',
      body: 'Night Audit left three open items. The AM shift catches one. Two drift into the day, unknown to everyone but the sticky.',
    },
    {
      img: IMG.housekeep,
      eyebrow: '1:30 PM',
      headline: 'The GM gets the call.',
      body: 'Guest refused Room 214. Another guest moved. Everyone agrees something broke on Tuesday. Nobody can say exactly when.',
    },
  ];

  return (
    <section id="scenes" style={{ background: '#0a0a0a', color: '#fff' }}>
      <div className="mx-auto max-w-6xl px-5 sm:px-8 py-20 sm:py-28">
        <p className="text-xs font-semibold uppercase tracking-[0.14em]" style={{ color: '#ff385c' }}>
          What StayOps replaces
        </p>
        <h2
          className="mt-3"
          style={{
            fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)',
            lineHeight: 1.12,
            letterSpacing: '-0.02em',
            fontWeight: 600,
            maxWidth: '24ch',
          }}
        >
          A hotel running on memory, phone calls, and sticky notes.
        </h2>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-5">
          {scenes.map((s) => (
            <div
              key={s.eyebrow}
              className="rounded-2xl overflow-hidden"
              style={{ background: '#141414', border: '1px solid #222' }}
            >
              <div className="aspect-[4/3] overflow-hidden">
                <img src={s.img} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="p-5">
                <p
                  className="text-[11px] font-semibold uppercase tracking-[0.14em]"
                  style={{ color: '#ff385c' }}
                >
                  {s.eyebrow}
                </p>
                <p
                  className="mt-2 text-lg font-semibold"
                  style={{ color: '#fff', lineHeight: 1.3 }}
                >
                  {s.headline}
                </p>
                <p className="mt-2 text-sm" style={{ color: '#a8a8a8', lineHeight: 1.55 }}>
                  {s.body}
                </p>
              </div>
            </div>
          ))}
        </div>

        <p
          className="mt-12 text-lg sm:text-xl"
          style={{ color: '#c1c1c1', lineHeight: 1.5, maxWidth: '42ch' }}
        >
          That&apos;s four untracked hours, one moved guest, one lost revenue night, and a
          pattern the owner will never hear about.
        </p>

        {/* Resolution — same morning, with StayOps */}
        <div
          className="mt-10 rounded-2xl overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)',
            border: '1px solid rgba(255,56,92,0.25)',
            boxShadow: '0 0 0 1px rgba(255,56,92,0.08), 0 20px 60px -20px rgba(255,56,92,0.25)',
          }}
        >
          <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-[auto_1fr] gap-5 md:gap-8 items-center">
            <span
              className="inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]"
              style={{
                background: 'rgba(255,56,92,0.12)',
                border: '1px solid rgba(255,56,92,0.4)',
                color: '#ff6b85',
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#ff385c' }} />
              Same morning · with StayOps
            </span>
            <div>
              <p
                className="text-[11px] font-semibold uppercase tracking-[0.14em]"
                style={{ color: '#ff385c' }}
              >
                6:14 AM, Wednesday
              </p>
              <p
                className="mt-2 text-lg sm:text-xl font-semibold"
                style={{ color: '#fff', lineHeight: 1.35, letterSpacing: '-0.01em' }}
              >
                You open the app. Last night&apos;s AC ticket is at the top.
              </p>
              <p
                className="mt-2 text-sm sm:text-base"
                style={{ color: '#a8a8a8', lineHeight: 1.6 }}
              >
                Room 214 is already blocked from sale. Maintenance lead is assigned. By 8 AM
                the room is back online, and the moved guest has an apology waiting.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Operators note ---------------- */
function OperatorsNote() {
  return (
    <section className="relative overflow-hidden" style={{ background: '#f5f2ec' }}>
      <img
        src={IMG.night}
        alt="Hotel at night"
        className="absolute inset-0 w-full h-full object-cover opacity-[0.18]"
        style={{ mixBlendMode: 'multiply' }}
      />
      <div className="relative mx-auto max-w-4xl px-5 sm:px-8 py-20 sm:py-28">
        <p className="text-xs font-semibold uppercase tracking-[0.14em]" style={{ color: '#b64a3f' }}>
          Why we built it
        </p>
        <h2
          className="mt-3 font-semibold"
          style={{
            color: '#0a0a0a',
            fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)',
            lineHeight: 1.12,
            letterSpacing: '-0.02em',
          }}
        >
          Hotels track revenue. They don&apos;t track the gaps that quietly drain it.
        </h2>
        <p
          className="mt-5 text-base sm:text-lg"
          style={{ color: '#3f3f3f', lineHeight: 1.65, maxWidth: '56ch' }}
        >
          The PMS shows occupancy and ADR. Payroll shows hours. Neither remembers the AC
          that broke at 11 PM, the audit that&apos;s been overdue for six weeks, or the OTA
          channel quietly taking 18% on cancellations. StayOps closes those gaps — across
          every property, every shift, every team — so the loss stops being invisible.
        </p>
      </div>
    </section>
  );
}

/* ---------------- Final CTA — photo-backed ---------------- */
function FinalCta() {
  return (
    <section className="relative" style={{ height: 'min(60vh, 560px)' }}>
      <img
        src={IMG.room}
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, rgba(10,10,10,0.4) 0%, rgba(10,10,10,0.85) 100%)',
        }}
      />
      <div className="relative z-10 h-full mx-auto max-w-4xl px-5 sm:px-8 flex flex-col justify-center items-center text-center text-white">
        <h2
          style={{
            fontSize: 'clamp(2rem, 4vw, 3.5rem)',
            lineHeight: 1.08,
            letterSpacing: '-0.025em',
            fontWeight: 600,
            maxWidth: '22ch',
          }}
        >
          Give your hotels the memory they never had.
        </h2>
        <p
          className="mt-5 text-base sm:text-lg"
          style={{ color: 'rgba(255,255,255,0.85)', maxWidth: '42ch', lineHeight: 1.5 }}
        >
          30-minute demo. Bring one month of real operations. Walk out with a picture of
          what&apos;s actually happening.
        </p>
        <div className="mt-8">
          <Link
            href="/website/contact"
            className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold"
            style={{ background: '#fff', color: '#0a0a0a' }}
          >
            Book a demo <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
