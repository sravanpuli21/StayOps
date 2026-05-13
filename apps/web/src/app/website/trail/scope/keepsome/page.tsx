import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface SectionRow {
  n: string;
  title: string;
  copy: string;
  verdict: 'keep' | 'drop' | 'merge';
  reason: string;
}

const SECTIONS: SectionRow[] = [
  { n: '01', title: 'Announcement bar',          copy: 'Built for hotel ownership groups...',                       verdict: 'drop',  reason: 'Low information value. Removes scroll weight before hero.' },
  { n: '02', title: 'Hero',                       copy: 'The control room for hotel owners...',                      verdict: 'keep',  reason: 'Anchors the whole page. Must stay.' },
  { n: '03', title: 'Operator reality strip',     copy: 'Room readiness · Maintenance delays · ...',                 verdict: 'drop',  reason: 'Pill chip row is decorative. The modules section already covers this.' },
  { n: '04', title: 'Problem',                    copy: '6 problem cards: Out-of-order rooms, etc.',                 verdict: 'keep',  reason: 'Sets up the WHY. Non-negotiable.' },
  { n: '05', title: 'Product overview',           copy: '7 module cards',                                            verdict: 'keep',  reason: 'The core WHAT. Must stay.' },
  { n: '06', title: 'Money impact',               copy: '8-row issue→impact table',                                  verdict: 'merge', reason: 'Fold into the Problem section as a table — less repetition.' },
  { n: '07', title: 'Built for owners and teams', copy: '6 audience cards',                                          verdict: 'keep',  reason: 'Answers WHO. Short version of the Solutions page.' },
  { n: '08', title: 'AI Operational Memory',      copy: '8 feature bullets',                                         verdict: 'drop',  reason: 'Already in the modules. Dedicated AI section reads as buzzword real estate.' },
  { n: '09', title: 'Before and After',           copy: '8-row comparison table',                                    verdict: 'keep',  reason: 'Best single-visual argument on the page. Stays.' },
  { n: '10', title: 'Demo preview',               copy: '6-step walkthrough of Room 214',                             verdict: 'drop',  reason: 'Long list of steps right before the CTA — it\'s what the demo itself is for.' },
  { n: '11', title: 'Final CTA',                  copy: 'Ready to see what your operations are hiding?',             verdict: 'keep',  reason: 'Close the deal. Stays.' },
];

const VERDICT_STYLES: Record<SectionRow['verdict'], { bg: string; color: string; label: string }> = {
  keep:  { bg: '#dcfce7', color: '#166534', label: 'Keep' },
  drop:  { bg: '#fee2e2', color: '#991b1b', label: 'Drop' },
  merge: { bg: '#fef3c7', color: '#854d0e', label: 'Merge' },
};

export default function KeepSomeScope() {
  const keeps  = SECTIONS.filter((s) => s.verdict === 'keep').length;
  const drops  = SECTIONS.filter((s) => s.verdict === 'drop').length;
  const merges = SECTIONS.filter((s) => s.verdict === 'merge').length;

  return (
    <main style={{ background: '#fff' }}>
      <PreviewBadge />

      <section className="mx-auto max-w-5xl px-5 sm:px-8 pt-16 sm:pt-20 pb-10">
        <p className="text-xs font-semibold uppercase tracking-[0.14em]" style={{ color: '#b64a3f' }}>
          Scope C — Keep some, drop some, merge others
        </p>
        <h1
          className="mt-4"
          style={{
            fontFamily: 'var(--font-serif), serif',
            color: '#0a0a0a',
            fontSize: 'clamp(2.5rem, 5vw, 4rem)',
            lineHeight: 1.08,
            letterSpacing: '-0.02em',
            maxWidth: '26ch',
          }}
        >
          Tighter homepage. {keeps} sections stay, {drops} get dropped, {merges} gets merged.
        </h1>
        <p className="mt-5 text-base sm:text-lg" style={{ color: '#3f3f3f', lineHeight: 1.65, maxWidth: '56ch' }}>
          The full 11-section homepage covers everything but reads long. This scope trims it to the
          spine — hero, problem, product, owners/teams, before/after, CTA — and drops the sections
          that either overlap, repeat, or decorate.
        </p>
        <div className="mt-6 flex items-center gap-3 flex-wrap">
          <Badge count={keeps}  verdict="keep"  />
          <Badge count={drops}  verdict="drop"  />
          <Badge count={merges} verdict="merge" />
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 sm:px-8 pb-20">
        <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #ddd', background: '#fff' }}>
          {SECTIONS.map((s, i) => {
            const v = VERDICT_STYLES[s.verdict];
            return (
              <div
                key={s.n}
                className="px-6 py-5"
                style={i < SECTIONS.length - 1 ? { borderBottom: '1px solid #eee' } : undefined}
              >
                <div className="flex items-start gap-5">
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
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div>
                        <p
                          className="text-base font-semibold"
                          style={{ color: '#0a0a0a', textDecoration: s.verdict === 'drop' ? 'line-through' : 'none', textDecorationColor: '#c1c1c1' }}
                        >
                          {s.title}
                        </p>
                        <p className="mt-1 text-sm" style={{ color: '#6a6a6a' }}>{s.copy}</p>
                      </div>
                      <span
                        className="text-[10px] font-semibold uppercase tracking-[0.14em] rounded-full px-2.5 py-1 flex-shrink-0"
                        style={{ background: v.bg, color: v.color }}
                      >
                        {v.label}
                      </span>
                    </div>
                    <p className="mt-2.5 text-xs italic" style={{ color: '#929292', lineHeight: 1.5 }}>
                      Reason: {s.reason}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <p className="mt-10 text-sm" style={{ color: '#6a6a6a', maxWidth: '56ch', lineHeight: 1.6 }}>
          <strong>Trade-off:</strong> the page is ~45% shorter and reads more decisively. Risk: if
          a dropped section (like AI Memory) is one of the things you think a prospect needs to
          see, this is the wrong scope.
        </p>
      </section>

      <section className="border-t" style={{ borderColor: '#eee' }}>
        <div className="mx-auto max-w-5xl px-5 sm:px-8 py-12 flex items-center justify-between flex-wrap gap-4">
          <p className="text-sm" style={{ color: '#6a6a6a' }}>
            Or see everything kept.
          </p>
          <Link href="/website/trail/scope/keepthecontent" className="inline-flex items-center gap-1.5 text-sm font-semibold" style={{ color: '#0a0a0a' }}>
            Scope B: Keep the content <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}

function Badge({ count, verdict }: { count: number; verdict: SectionRow['verdict'] }) {
  const v = VERDICT_STYLES[verdict];
  return (
    <span
      className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] rounded-full px-3 py-1.5"
      style={{ background: v.bg, color: v.color }}
    >
      <span className="tabular-nums">{count}</span>
      {v.label}
    </span>
  );
}

function PreviewBadge() {
  return (
    <div className="text-center py-2 px-4 text-xs" style={{ background: '#0a0a0a', color: '#fff' }}>
      <Link href="/website/trail" className="hover:underline">← Back to trail index</Link>
      <span className="mx-3" style={{ color: '#666' }}>·</span>
      Scope C — <strong className="font-semibold">Keep some, drop some</strong>
    </div>
  );
}
