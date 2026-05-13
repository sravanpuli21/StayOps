import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const SECTIONS = [
  { n: '01', title: 'Announcement bar',         copy: '"Built for hotel ownership groups that want clearer operations and fewer hidden losses."' },
  { n: '02', title: 'Hero',                      copy: 'The control room for hotel owners to run cleaner, more profitable operations.' },
  { n: '03', title: 'Operator reality strip',    copy: 'Room readiness · Maintenance delays · Missed audits · Labour handovers · Inventory loss · Owner reporting' },
  { n: '04', title: 'Problem',                   copy: 'Hotel losses hide inside daily operations. 6 problem cards below.' },
  { n: '05', title: 'Product overview',          copy: '7 modules: Room Readiness · Maintenance · Audits · Inventory & Assets · Labour & Tasks · Owner Dashboard · AI Memory' },
  { n: '06', title: 'Money impact',              copy: '8-row issue→impact table + "Less guessing. Less chasing. More control."' },
  { n: '07', title: 'Built for owners and teams',copy: '6 audience cards: Owners · GMs · Regionals · Housekeeping · Maintenance · Front Desk' },
  { n: '08', title: 'AI Operational Memory',     copy: '8 feature bullets + the "AI that supports, doesn\'t replace" trust line' },
  { n: '09', title: 'Before and After',          copy: '8-row comparison table. Scattered → connected.' },
  { n: '10', title: 'Demo preview',              copy: '6-step walkthrough of how Room 214 moves from issue to resolution.' },
  { n: '11', title: 'Final CTA',                 copy: '"Ready to see what your operations are hiding?"' },
];

export default function KeepContentScope() {
  return (
    <main style={{ background: '#fff' }}>
      <PreviewBadge />

      <section className="mx-auto max-w-5xl px-5 sm:px-8 pt-16 sm:pt-20 pb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.14em]" style={{ color: '#b64a3f' }}>
          Scope B — Keep the content, redesign the visuals
        </p>
        <h1
          className="mt-4"
          style={{
            fontFamily: 'var(--font-serif), serif',
            color: '#0a0a0a',
            fontSize: 'clamp(2.5rem, 5vw, 4rem)',
            lineHeight: 1.08,
            letterSpacing: '-0.02em',
            maxWidth: '24ch',
          }}
        >
          All 11 current sections stay. New visual language on top.
        </h1>
        <p className="mt-5 text-base sm:text-lg" style={{ color: '#3f3f3f', lineHeight: 1.65, maxWidth: '52ch' }}>
          This scope preserves every section we have on the current homepage — same copy,
          same ordering, same calls to action. What changes is the visual language: whichever
          direction you pick from the four previews becomes the treatment applied across all
          sections below.
        </p>
      </section>

      <section className="mx-auto max-w-5xl px-5 sm:px-8 pb-20">
        <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #ddd', background: '#fff' }}>
          {SECTIONS.map((s, i) => (
            <div
              key={s.n}
              className="flex items-start gap-5 px-6 py-5"
              style={i < SECTIONS.length - 1 ? { borderBottom: '1px solid #eee' } : undefined}
            >
              <p
                className="tabular-nums"
                style={{
                  fontFamily: 'var(--font-serif), serif',
                  fontSize: '1.25rem',
                  color: '#c1c1c1',
                  lineHeight: 1.1,
                  minWidth: 32,
                }}
              >
                {s.n}
              </p>
              <div className="flex-1">
                <p className="text-base font-semibold" style={{ color: '#0a0a0a' }}>{s.title}</p>
                <p className="mt-1 text-sm" style={{ color: '#6a6a6a', lineHeight: 1.55 }}>{s.copy}</p>
              </div>
              <span
                className="text-[10px] font-semibold uppercase tracking-[0.14em] rounded-full px-2.5 py-1"
                style={{ background: '#dcfce7', color: '#166534' }}
              >
                Kept
              </span>
            </div>
          ))}
        </div>

        <p className="mt-10 text-sm" style={{ color: '#6a6a6a', maxWidth: '56ch', lineHeight: 1.6 }}>
          <strong>Trade-off:</strong> safest scope — nothing lost, no copy decisions re-opened. But
          the page stays long (the current home is already 10+ screens of scroll). If the goal is
          a shorter, punchier homepage, this isn&apos;t it.
        </p>
      </section>

      <section className="border-t" style={{ borderColor: '#eee' }}>
        <div className="mx-auto max-w-5xl px-5 sm:px-8 py-12 flex items-center justify-between flex-wrap gap-4">
          <p className="text-sm" style={{ color: '#6a6a6a' }}>
            Compare this with the &ldquo;Keep some, drop some&rdquo; scope.
          </p>
          <Link href="/website/trail/scope/keepsome" className="inline-flex items-center gap-1.5 text-sm font-semibold" style={{ color: '#0a0a0a' }}>
            Scope C: Keep some <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}

function PreviewBadge() {
  return (
    <div className="text-center py-2 px-4 text-xs" style={{ background: '#0a0a0a', color: '#fff' }}>
      <Link href="/website/trail" className="hover:underline">← Back to trail index</Link>
      <span className="mx-3" style={{ color: '#666' }}>·</span>
      Scope B — <strong className="font-semibold">Keep the content</strong>
    </div>
  );
}
