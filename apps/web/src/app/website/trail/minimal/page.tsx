import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

export default function MinimalPreview() {
  return (
    <main style={{ background: '#fafafa' }}>
      <PreviewBadge />
      <Hero />
      <Divider />
      <TwoLines />
      <Divider />
      <ThreeThings />
      <Divider />
      <FinalCta />
    </main>
  );
}

function PreviewBadge() {
  return (
    <div className="text-center py-2 px-4 text-xs" style={{ background: '#0a0a0a', color: '#fff' }}>
      <Link href="/website/trail" className="hover:underline">← Back to trail index</Link>
      <span className="mx-3" style={{ color: '#666' }}>·</span>
      Preview: <strong className="font-semibold">Direction 3 — Minimal / restrained</strong>
    </div>
  );
}

function Divider() {
  return (
    <div className="mx-auto max-w-6xl px-5 sm:px-8">
      <div style={{ height: 1, background: '#e5e5e5' }} />
    </div>
  );
}

/* ---------------- Hero — one line, one CTA ---------------- */
function Hero() {
  return (
    <section style={{ minHeight: 'min(80vh, 720px)' }} className="flex items-center">
      <div className="mx-auto max-w-6xl w-full px-5 sm:px-8">
        <p className="text-xs font-medium uppercase tracking-[0.18em]" style={{ color: '#929292' }}>
          StayOps
        </p>
        <h1
          className="mt-10"
          style={{
            color: '#0a0a0a',
            fontSize: 'clamp(2.5rem, 7.5vw, 6.5rem)',
            fontWeight: 500,
            lineHeight: 1,
            letterSpacing: '-0.04em',
            maxWidth: '16ch',
          }}
        >
          Know the hotel before the hotel tells you.
        </h1>
        <p className="mt-10 text-lg sm:text-xl" style={{ color: '#6a6a6a', maxWidth: '44ch', lineHeight: 1.5 }}>
          The owner&apos;s control room for hotel operations.
        </p>
        <div className="mt-16 flex items-center gap-8">
          <Link
            href="/website/contact"
            className="inline-flex items-center gap-2 text-base font-medium transition-opacity hover:opacity-70"
            style={{ color: '#0a0a0a', borderBottom: '1.5px solid #0a0a0a', paddingBottom: 4 }}
          >
            Book a demo
            <ArrowUpRight className="w-4 h-4" />
          </Link>
          <Link
            href="#more"
            className="inline-flex items-center text-base transition-opacity hover:opacity-70"
            style={{ color: '#6a6a6a' }}
          >
            Keep reading ↓
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Two-line belief statement ---------------- */
function TwoLines() {
  return (
    <section id="more" className="mx-auto max-w-6xl px-5 sm:px-8 py-24 sm:py-32">
      <p className="text-xs font-medium uppercase tracking-[0.18em]" style={{ color: '#929292' }}>
        Our position
      </p>
      <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20">
        <p
          style={{
            color: '#0a0a0a',
            fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)',
            fontWeight: 500,
            lineHeight: 1.15,
            letterSpacing: '-0.025em',
          }}
        >
          Your occupancy is not your profit.
        </p>
        <p
          style={{ color: '#6a6a6a', fontSize: '1.125rem', lineHeight: 1.6 }}
        >
          Most hotels don&apos;t lose money from one mistake. They lose it through small
          operational gaps that repeat every day — a room that sits dirty an extra night,
          a repair that waits a week, an audit that slips. StayOps gives owners the one thing
          those gaps survive on: the absence of a record.
        </p>
      </div>
    </section>
  );
}

/* ---------------- Three things ---------------- */
function ThreeThings() {
  const items = [
    {
      number: '01',
      title: 'Visibility',
      body: 'Owners see every property in one place. Rooms, tickets, audits, labour, revenue — without a phone call.',
    },
    {
      number: '02',
      title: 'Clarity',
      body: 'Teams get clear assignments, proof of completion, and fewer communication gaps across shifts.',
    },
    {
      number: '03',
      title: 'Memory',
      body: 'Every room has a history. Every repair, audit, and handover is recorded. Patterns become visible.',
    },
  ];

  return (
    <section className="mx-auto max-w-6xl px-5 sm:px-8 py-24 sm:py-32">
      <p className="text-xs font-medium uppercase tracking-[0.18em]" style={{ color: '#929292' }}>
        What StayOps does
      </p>
      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-20">
        {items.map((it) => (
          <div key={it.number}>
            <p
              className="font-medium tabular-nums"
              style={{ color: '#c1c1c1', fontSize: '2.5rem', lineHeight: 1, letterSpacing: '-0.02em' }}
            >
              {it.number}
            </p>
            <p
              className="mt-6"
              style={{ color: '#0a0a0a', fontSize: '1.5rem', lineHeight: 1.2, fontWeight: 500, letterSpacing: '-0.015em' }}
            >
              {it.title}
            </p>
            <p className="mt-3" style={{ color: '#6a6a6a', fontSize: '1rem', lineHeight: 1.6 }}>
              {it.body}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------------- Final CTA — quiet ---------------- */
function FinalCta() {
  return (
    <section className="mx-auto max-w-6xl px-5 sm:px-8 py-24 sm:py-32">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-10">
        <h2
          style={{
            color: '#0a0a0a',
            fontSize: 'clamp(2rem, 5vw, 4rem)',
            fontWeight: 500,
            lineHeight: 1.05,
            letterSpacing: '-0.03em',
            maxWidth: '14ch',
          }}
        >
          See it on your own numbers.
        </h2>
        <div>
          <Link
            href="/website/contact"
            className="inline-flex items-center gap-2 text-base font-medium transition-opacity hover:opacity-70"
            style={{ color: '#0a0a0a', borderBottom: '1.5px solid #0a0a0a', paddingBottom: 4 }}
          >
            Book a demo
            <ArrowUpRight className="w-4 h-4" />
          </Link>
          <p className="mt-4 text-sm" style={{ color: '#929292' }}>30 minutes · your real data · pays for itself in 30 days</p>
        </div>
      </div>
    </section>
  );
}
