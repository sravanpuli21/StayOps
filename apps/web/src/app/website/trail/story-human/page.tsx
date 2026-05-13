/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import { ArrowRight, ArrowUpRight } from 'lucide-react';

// People-focused hotel photography.
const IMG = {
  hero:       'https://images.unsplash.com/photo-1587564899635-8869ae93e6ae?w=1800&q=80&auto=format',
  gm:         'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=900&q=80&auto=format',
  housekeep:  'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=900&q=80&auto=format',
  maintenance:'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=900&q=80&auto=format',
  owner:      'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=1400&q=80&auto=format',
  staff:      'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1800&q=80&auto=format',
};

export default function StoryHumanPreview() {
  return (
    <main>
      <PreviewBadge />
      <Hero />
      <QuoteStrip />
      <ThreeVoices />
      <OperatorsNote />
      <FinalCta />
    </main>
  );
}

function PreviewBadge() {
  return (
    <div className="text-center py-2 px-4 text-xs" style={{ background: '#0a0a0a', color: '#fff' }}>
      <Link href="/website/trail" className="hover:underline">← Back to trail index</Link>
      <span className="mx-3" style={{ color: '#666' }}>·</span>
      Story-driven · <strong className="font-semibold">Human (people & voices)</strong>
    </div>
  );
}

function Hero() {
  return (
    <section className="relative" style={{ height: 'min(82vh, 780px)' }}>
      <img src={IMG.hero} alt="Hotel front desk" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.5) 55%, rgba(0,0,0,0.8) 100%)' }} />
      <div className="relative z-10 h-full mx-auto max-w-6xl px-5 sm:px-8 flex flex-col justify-end pb-16 sm:pb-20 text-white">
        <span
          className="inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em]"
          style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(6px)' }}
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#ff385c' }} />
          Built for the people who run hotels
        </span>
        <h1 className="mt-5" style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)', lineHeight: 1.02, letterSpacing: '-0.03em', maxWidth: '18ch', fontWeight: 600 }}>
          The hotel is never the problem. The handoffs are.
        </h1>
        <p className="mt-5 text-base sm:text-lg lg:text-xl" style={{ color: 'rgba(255,255,255,0.85)', maxWidth: '46ch', lineHeight: 1.5 }}>
          Housekeeping to front desk. Front desk to maintenance. Maintenance to GM. GM to
          owner. StayOps keeps the chain.
        </p>
        <div className="mt-8 flex items-center gap-3 flex-wrap">
          <Link href="/website/contact" className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold" style={{ background: '#fff', color: '#0a0a0a' }}>
            Book a demo <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href="#voices" className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white" style={{ border: '1px solid rgba(255,255,255,0.5)' }}>
            Hear from the team
          </Link>
        </div>
      </div>
    </section>
  );
}

function QuoteStrip() {
  return (
    <section className="mx-auto max-w-4xl px-5 sm:px-8 py-20 sm:py-28 text-center">
      <p
        className="mx-auto"
        style={{
          fontFamily: 'var(--font-serif), serif',
          fontSize: 'clamp(1.75rem, 3.25vw, 2.5rem)',
          lineHeight: 1.25,
          color: '#0a0a0a',
          letterSpacing: '-0.015em',
          maxWidth: '34ch',
        }}
      >
        &ldquo;My team isn&apos;t lazy. They&apos;re drowning in sticky notes and phone calls. StayOps is the life preserver.&rdquo;
      </p>
      <p className="mt-6 text-sm" style={{ color: '#6a6a6a' }}>
        — Family operator, 16 hotels · second generation
      </p>
    </section>
  );
}

function ThreeVoices() {
  const voices = [
    {
      img: IMG.housekeep,
      role: 'Housekeeping',
      name: 'Sandra',
      quote: '&ldquo;I used to get blamed for rooms I already cleaned. Now the timestamp proves it.&rdquo;',
    },
    {
      img: IMG.maintenance,
      role: 'Maintenance',
      name: 'Devin',
      quote: '&ldquo;Fewer random phone calls. I see the ticket, the photo, the room. I fix it.&rdquo;',
    },
    {
      img: IMG.gm,
      role: 'General Manager',
      name: 'Laswanda',
      quote: '&ldquo;When the owner asks, I don&apos;t guess anymore. I show.&rdquo;',
    },
  ];

  return (
    <section id="voices" style={{ background: '#f5f2ec' }}>
      <div className="mx-auto max-w-6xl px-5 sm:px-8 py-20 sm:py-28">
        <p className="text-xs font-semibold uppercase tracking-[0.14em]" style={{ color: '#b64a3f' }}>
          The people on the floor
        </p>
        <h2
          className="mt-3"
          style={{
            fontFamily: 'var(--font-serif), serif',
            fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)',
            lineHeight: 1.12,
            letterSpacing: '-0.015em',
            color: '#0a0a0a',
            maxWidth: '24ch',
          }}
        >
          We don&apos;t watch your team. We give them clarity.
        </h2>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-5">
          {voices.map((v) => (
            <figure key={v.name} className="rounded-2xl overflow-hidden" style={{ background: '#fff', border: '1px solid #e3ddd0' }}>
              <div className="aspect-[4/5] overflow-hidden">
                <img src={v.img} alt={v.name} className="w-full h-full object-cover" />
              </div>
              <figcaption className="p-6">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: '#b64a3f' }}>
                  {v.role}
                </p>
                <p
                  className="mt-3"
                  style={{
                    fontFamily: 'var(--font-serif), serif',
                    fontSize: '1.125rem',
                    lineHeight: 1.35,
                    color: '#0a0a0a',
                  }}
                  dangerouslySetInnerHTML={{ __html: v.quote }}
                />
                <p className="mt-4 text-sm" style={{ color: '#6a6a6a' }}>
                  — {v.name}
                </p>
              </figcaption>
            </figure>
          ))}
        </div>

        <p className="mt-12 text-base sm:text-lg" style={{ color: '#3f3f3f', lineHeight: 1.6, maxWidth: '50ch' }}>
          Owners care about the number. The people moving rooms care about their shift going
          cleanly. StayOps answers both — because the same system that feeds the owner also
          protects the team from blame.
        </p>
      </div>
    </section>
  );
}

function OperatorsNote() {
  return (
    <section className="relative overflow-hidden" style={{ background: '#0a0a0a', color: '#fff' }}>
      <img src={IMG.staff} alt="" className="absolute inset-0 w-full h-full object-cover opacity-[0.22]" />
      <div className="relative mx-auto max-w-4xl px-5 sm:px-8 py-20 sm:py-28">
        <p className="text-xs font-semibold uppercase tracking-[0.14em]" style={{ color: '#ff385c' }}>
          A note from the operators
        </p>
        <h2
          className="mt-3"
          style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)', lineHeight: 1.12, letterSpacing: '-0.02em', fontWeight: 600 }}
        >
          We built this for the team first. The owners came second.
        </h2>
        <p className="mt-5 text-base sm:text-lg" style={{ color: '#c1c1c1', lineHeight: 1.65, maxWidth: '56ch' }}>
          Every owner we&apos;ve shown StayOps to asks the same thing: &ldquo;Will my team actually
          use it?&rdquo; The honest answer: they use it because it makes their day easier, not because
          you told them to. That&apos;s the design principle. Tool for the floor first.
        </p>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="mx-auto max-w-4xl px-5 sm:px-8 py-24 sm:py-32 text-center">
      <h2
        style={{
          fontFamily: 'var(--font-serif), serif',
          fontSize: 'clamp(2.25rem, 4.5vw, 4rem)',
          lineHeight: 1.08,
          letterSpacing: '-0.02em',
          color: '#0a0a0a',
          maxWidth: '22ch',
          margin: '0 auto',
        }}
      >
        Give your team the tool they deserve.
      </h2>
      <p className="mt-6 text-base sm:text-lg" style={{ color: '#3f3f3f', lineHeight: 1.55, maxWidth: '44ch', margin: '24px auto 0' }}>
        30 minutes. We&apos;ll show you the GM view, the housekeeping view, and the owner view —
        so you can see the full handoff chain.
      </p>
      <div className="mt-10">
        <Link
          href="/website/contact"
          className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold text-white"
          style={{ background: '#0a0a0a' }}
        >
          Book a demo <ArrowUpRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
}
