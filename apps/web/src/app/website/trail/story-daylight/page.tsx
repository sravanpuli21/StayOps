/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import { ArrowRight, ArrowUpRight } from 'lucide-react';

// Warm, daylight hotel photography — optimistic tone.
const IMG = {
  hero:       'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=1800&q=80&auto=format',
  breakfast:  'https://images.unsplash.com/photo-1606744888344-493238951221?w=1400&q=80&auto=format',
  hallway:    'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1400&q=80&auto=format',
  pool:       'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=1400&q=80&auto=format',
  exterior:   'https://images.unsplash.com/photo-1518733057094-95b53143d2a7?w=1800&q=80&auto=format',
  room:       'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1400&q=80&auto=format',
};

export default function StoryDaylightPreview() {
  return (
    <main>
      <PreviewBadge />
      <Hero />
      <QuoteStrip />
      <ThreeScenes />
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
      Story-driven · <strong className="font-semibold">Daylight (optimistic, warm)</strong>
    </div>
  );
}

function Hero() {
  return (
    <section className="relative" style={{ height: 'min(78vh, 760px)' }}>
      <img src={IMG.hero} alt="Bright hotel lobby" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.0) 0%, rgba(255,250,240,0.35) 60%, rgba(10,10,10,0.55) 100%)' }} />
      <div className="relative z-10 h-full mx-auto max-w-6xl px-5 sm:px-8 flex flex-col justify-end pb-16 sm:pb-20 text-white">
        <span
          className="inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em]"
          style={{ background: 'rgba(255,255,255,0.85)', color: '#0a0a0a', backdropFilter: 'blur(6px)' }}
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#ff385c' }} />
          Built by hotel operators
        </span>
        <h1 className="mt-5" style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)', lineHeight: 1.02, letterSpacing: '-0.03em', maxWidth: '18ch', fontWeight: 600 }}>
          A hotel that knows itself.
        </h1>
        <p className="mt-5 text-base sm:text-lg lg:text-xl" style={{ color: 'rgba(255,255,255,0.92)', maxWidth: '46ch', lineHeight: 1.5 }}>
          Every room, every repair, every handover — kept in order and visible to the owner.
          So the team can run the day, not reconstruct it.
        </p>
        <div className="mt-8 flex items-center gap-3 flex-wrap">
          <Link href="/website/contact" className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold" style={{ background: '#fff', color: '#0a0a0a' }}>
            Book a demo <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href="#scenes" className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white" style={{ border: '1px solid rgba(255,255,255,0.6)' }}>
            See a cleaner day
          </Link>
        </div>
      </div>
    </section>
  );
}

function QuoteStrip() {
  return (
    <section className="mx-auto max-w-4xl px-5 sm:px-8 py-20 sm:py-28 text-center" style={{ background: '#fdfaf3' }}>
      <p
        className="mx-auto"
        style={{
          fontFamily: 'var(--font-serif), serif',
          fontSize: 'clamp(1.5rem, 3vw, 2.25rem)',
          lineHeight: 1.3,
          color: '#222',
          letterSpacing: '-0.01em',
          maxWidth: '38ch',
        }}
      >
        &ldquo;For the first time in fifteen years, I actually know what my GMs did on Tuesday.&rdquo;
      </p>
      <p className="mt-6 text-sm" style={{ color: '#6a6a6a' }}>
        — 16-hotel AAHOA operator · customer zero
      </p>
    </section>
  );
}

function ThreeScenes() {
  const scenes = [
    {
      img: IMG.breakfast,
      eyebrow: '6:30 AM',
      headline: 'Shift opens with the day already mapped.',
      body: 'Overnight handover surfaces the three rooms the GM needs to watch. Breakfast, arrivals, and housekeeping coverage — planned before coffee.',
    },
    {
      img: IMG.hallway,
      eyebrow: '11:15 AM',
      headline: 'Housekeeping moves, and so does the record.',
      body: 'Room 214 clean, inspected, photographed. Maintenance marks a small AC fix. Front desk sees the room flip to ready. Nothing on paper.',
    },
    {
      img: IMG.pool,
      eyebrow: '4:45 PM',
      headline: 'The owner opens the Monday digest.',
      body: 'Revenue pace, open issues, audit health — one email. No chasing, no clarifying, no phone calls. Ten minutes, back to the day.',
    },
  ];

  return (
    <section id="scenes" style={{ background: '#fdfaf3' }}>
      <div className="mx-auto max-w-6xl px-5 sm:px-8 py-20 sm:py-28">
        <p className="text-xs font-semibold uppercase tracking-[0.14em]" style={{ color: '#b64a3f' }}>
          A day on StayOps
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
          The hotel has memory. The team has clarity.
        </h2>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-5">
          {scenes.map((s) => (
            <div key={s.eyebrow} className="rounded-2xl overflow-hidden" style={{ background: '#fff', border: '1px solid #ebe9e4' }}>
              <div className="aspect-[4/3] overflow-hidden">
                <img src={s.img} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em]" style={{ color: '#b64a3f' }}>
                  {s.eyebrow}
                </p>
                <p className="mt-2 text-lg font-semibold" style={{ color: '#0a0a0a', lineHeight: 1.3 }}>
                  {s.headline}
                </p>
                <p className="mt-2 text-sm" style={{ color: '#6a6a6a', lineHeight: 1.55 }}>
                  {s.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function OperatorsNote() {
  return (
    <section className="relative overflow-hidden" style={{ background: '#f5f2ec' }}>
      <img src={IMG.exterior} alt="" className="absolute inset-0 w-full h-full object-cover opacity-[0.16]" style={{ mixBlendMode: 'multiply' }} />
      <div className="relative mx-auto max-w-4xl px-5 sm:px-8 py-20 sm:py-28">
        <p className="text-xs font-semibold uppercase tracking-[0.14em]" style={{ color: '#b64a3f' }}>
          A note from the operators
        </p>
        <h2 className="mt-3 font-semibold" style={{ color: '#0a0a0a', fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)', lineHeight: 1.12, letterSpacing: '-0.02em' }}>
          We built this tool because we needed it. Now it&apos;s here for every owner who wants cleaner days.
        </h2>
        <p className="mt-5 text-base sm:text-lg" style={{ color: '#3f3f3f', lineHeight: 1.65, maxWidth: '56ch' }}>
          StayOps started in a 16-hotel family operator&apos;s office — second generation, AAHOA,
          multi-brand. We wanted the kind of clarity that lets you walk into Monday already
          knowing the answer. So we built it. Now it&apos;s here for you.
        </p>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="relative" style={{ height: 'min(60vh, 560px)' }}>
      <img src={IMG.room} alt="" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(253,250,243,0.45) 0%, rgba(10,10,10,0.75) 100%)' }} />
      <div className="relative z-10 h-full mx-auto max-w-4xl px-5 sm:px-8 flex flex-col justify-center items-center text-center text-white">
        <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', lineHeight: 1.08, letterSpacing: '-0.025em', fontWeight: 600, maxWidth: '22ch' }}>
          A cleaner Monday. Starts with one demo.
        </h2>
        <p className="mt-5 text-base sm:text-lg" style={{ color: 'rgba(255,255,255,0.9)', maxWidth: '42ch', lineHeight: 1.5 }}>
          30 minutes. Your real hotels. You&apos;ll see the picture on day one.
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
