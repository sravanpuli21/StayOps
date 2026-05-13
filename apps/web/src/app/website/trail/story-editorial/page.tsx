/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

// Architectural / detail-focused hotel photography.
const IMG = {
  hero:      'https://images.unsplash.com/photo-1549294413-26f195200c16?w=1800&q=80&auto=format',
  exterior:  'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=1400&q=80&auto=format',
  key:       'https://images.unsplash.com/photo-1551776235-dde6d482980b?w=1400&q=80&auto=format',
  hallway:   'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1400&q=80&auto=format',
  detail:    'https://images.unsplash.com/photo-1586611292717-f828b167408c?w=1400&q=80&auto=format',
  facade:    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1800&q=80&auto=format',
};

export default function StoryEditorialPreview() {
  return (
    <main style={{ background: '#fafaf7' }}>
      <PreviewBadge />
      <Masthead />
      <Hero />
      <Spread
        side="left"
        img={IMG.exterior}
        eyebrow="Chapter I"
        title="A property is a living document."
        body={[
          'Every hotel is a building, yes — but really it is an accumulating record of small events. A bulb replaced in March. A rug professionally cleaned before the holiday rush. A door lock recoded after a complaint.',
          'Most of these events are never written down. The record of the building is scattered across twelve phones, six sticky notes, and one manager\'s memory. When that manager leaves, the record leaves.',
        ]}
      />
      <Spread
        side="right"
        img={IMG.hallway}
        eyebrow="Chapter II"
        title="The quiet operations problem."
        body={[
          'Hotels don\'t lose money to one dramatic event. They lose it to a thousand small gaps. A room sitting dirty an extra night. A repair delayed from Monday to Friday. An audit unfilled. An overtime shift no one approved.',
          'Each gap, individually, is unremarkable. Together, they are the difference between a hotel that runs and a hotel that leaks.',
        ]}
      />
      <Spread
        side="left"
        img={IMG.key}
        eyebrow="Chapter III"
        title="What StayOps is — and isn’t."
        body={[
          'StayOps is not a dashboard. Not an AI platform. Not a replacement for your PMS.',
          'StayOps is the operational memory your hotel has never had. Every room, every ticket, every handover — tracked, timestamped, and visible to the owner. No phone call needed.',
        ]}
      />
      <PullQuote />
      <FinalCta />
    </main>
  );
}

function PreviewBadge() {
  return (
    <div className="text-center py-2 px-4 text-xs" style={{ background: '#0a0a0a', color: '#fff' }}>
      <Link href="/website/trail" className="hover:underline">← Back to trail index</Link>
      <span className="mx-3" style={{ color: '#666' }}>·</span>
      Story-driven · <strong className="font-semibold">Editorial (slow magazine scroll)</strong>
    </div>
  );
}

function Masthead() {
  return (
    <div className="border-y" style={{ borderColor: '#0a0a0a' }}>
      <div className="mx-auto max-w-6xl px-5 sm:px-8 py-3 flex items-center justify-between flex-wrap gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color: '#0a0a0a' }}>
          An essay on hotel operations
        </p>
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color: '#6a6a6a' }}>
          Vol. 1 · For ownership groups
        </p>
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section className="mx-auto max-w-6xl px-5 sm:px-8 pt-16 sm:pt-24 pb-16">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-end">
        <div className="lg:col-span-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: '#b64a3f' }}>
            The operator&apos;s essay
          </p>
          <h1
            className="mt-5"
            style={{
              fontFamily: 'var(--font-serif), serif',
              fontSize: 'clamp(2.5rem, 5.5vw, 4.75rem)',
              lineHeight: 1.02,
              letterSpacing: '-0.02em',
              color: '#0a0a0a',
              fontWeight: 400,
            }}
          >
            What a hotel forgets, it loses.
          </h1>
          <p className="mt-6 text-lg" style={{ color: '#3f3f3f', lineHeight: 1.65, maxWidth: '46ch' }}>
            An essay on the operational memory every hotel is missing — and the slow accumulation
            of revenue it quietly costs.
          </p>
          <p className="mt-8 text-sm" style={{ color: '#929292' }}>
            By the StayOps team, operator-led · 8 min read
          </p>
        </div>
        <div className="lg:col-span-6">
          <img
            src={IMG.hero}
            alt="Hotel detail at sunset"
            className="w-full aspect-[4/5] object-cover rounded-none"
          />
          <p className="mt-2 text-[11px]" style={{ color: '#929292' }}>
            Fig. 1 — A building accumulates.
          </p>
        </div>
      </div>
    </section>
  );
}

interface SpreadProps {
  side: 'left' | 'right';
  img: string;
  eyebrow: string;
  title: string;
  body: string[];
}

function Spread({ side, img, eyebrow, title, body }: SpreadProps) {
  const text = (
    <div className="lg:col-span-6 max-w-[48ch]">
      <p className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: '#b64a3f' }}>
        {eyebrow}
      </p>
      <h2
        className="mt-4"
        style={{
          fontFamily: 'var(--font-serif), serif',
          fontSize: 'clamp(1.75rem, 3.25vw, 2.5rem)',
          lineHeight: 1.15,
          letterSpacing: '-0.015em',
          color: '#0a0a0a',
          fontWeight: 400,
        }}
      >
        {title}
      </h2>
      <div className="mt-6 space-y-5 text-base sm:text-lg" style={{ color: '#3f3f3f', lineHeight: 1.65 }}>
        {body.map((p, i) => <p key={i}>{p}</p>)}
      </div>
    </div>
  );
  const image = (
    <div className="lg:col-span-6">
      <img src={img} alt="" className="w-full aspect-[4/5] object-cover" />
    </div>
  );

  return (
    <section className="mx-auto max-w-6xl px-5 sm:px-8 py-16 sm:py-24">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
        {side === 'left' ? image : text}
        {side === 'left' ? text : image}
      </div>
    </section>
  );
}

function PullQuote() {
  return (
    <section className="relative overflow-hidden" style={{ background: '#0a0a0a', color: '#fff' }}>
      <img src={IMG.facade} alt="" className="absolute inset-0 w-full h-full object-cover opacity-[0.25]" />
      <div className="relative mx-auto max-w-4xl px-5 sm:px-8 py-24 sm:py-32 text-center">
        <p
          style={{
            fontFamily: 'var(--font-serif), serif',
            fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)',
            lineHeight: 1.3,
            letterSpacing: '-0.01em',
            maxWidth: '32ch',
            margin: '0 auto',
            fontWeight: 400,
          }}
        >
          &ldquo;A hotel is only as profitable as the record it keeps of itself.&rdquo;
        </p>
        <p className="mt-8 text-sm" style={{ color: '#929292' }}>
          — The StayOps team · operator-led
        </p>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="mx-auto max-w-4xl px-5 sm:px-8 py-24 sm:py-32">
      <p className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: '#b64a3f' }}>
        Epilogue
      </p>
      <h2
        className="mt-4"
        style={{
          fontFamily: 'var(--font-serif), serif',
          fontSize: 'clamp(2rem, 4.5vw, 3.5rem)',
          lineHeight: 1.1,
          letterSpacing: '-0.015em',
          color: '#0a0a0a',
          fontWeight: 400,
          maxWidth: '26ch',
        }}
      >
        The argument for StayOps fits in a single meeting.
      </h2>
      <p className="mt-6 text-base sm:text-lg" style={{ color: '#3f3f3f', lineHeight: 1.65, maxWidth: '48ch' }}>
        Bring one month of real operations. We&apos;ll show you what your hotels remember — and
        what they&apos;ve been quietly losing. 30 minutes. No slides, no pitch deck.
      </p>
      <div className="mt-10">
        <Link
          href="/website/contact"
          className="inline-flex items-center gap-2 text-base font-medium"
          style={{ color: '#0a0a0a', borderBottom: '1.5px solid #0a0a0a', paddingBottom: 4 }}
        >
          Book the meeting
          <ArrowUpRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
}
