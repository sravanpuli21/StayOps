import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

export default function FullRewriteScope() {
  return (
    <main style={{ background: '#fafafa', minHeight: '80vh' }}>
      <PreviewBadge />
      <div className="mx-auto max-w-4xl px-5 sm:px-8 py-20 sm:py-32 flex flex-col items-center justify-center text-center" style={{ minHeight: 'calc(80vh - 60px)' }}>
        <p className="text-xs font-medium uppercase tracking-[0.18em]" style={{ color: '#929292' }}>
          StayOps
        </p>
        <h1
          className="mt-10"
          style={{
            color: '#0a0a0a',
            fontSize: 'clamp(3rem, 8vw, 7rem)',
            fontWeight: 500,
            lineHeight: 1,
            letterSpacing: '-0.035em',
            maxWidth: '14ch',
          }}
        >
          The hotel control room.
        </h1>
        <p className="mt-8 text-lg sm:text-xl" style={{ color: '#6a6a6a', maxWidth: '40ch', lineHeight: 1.5 }}>
          Visibility for owners. Clarity for teams.
        </p>
        <div className="mt-12">
          <Link
            href="/website/contact"
            className="inline-flex items-center gap-2 text-base font-medium transition-opacity hover:opacity-70"
            style={{ color: '#0a0a0a', borderBottom: '1.5px solid #0a0a0a', paddingBottom: 4 }}
          >
            Book a demo
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="mt-20 pt-10 text-left" style={{ borderTop: '1px solid #e5e5e5', maxWidth: '44ch' }}>
          <p className="text-xs font-semibold uppercase tracking-[0.14em]" style={{ color: '#b64a3f' }}>
            What this scope is
          </p>
          <p className="mt-3 text-sm" style={{ color: '#6a6a6a', lineHeight: 1.6 }}>
            This is the &ldquo;full rewrite&rdquo; scope — blank page, one headline, one call to action,
            one footer. All current sections (Announcement, Problem, 7 modules, Money Impact,
            Owners/Teams, AI Memory, Before/After, Demo Preview, Final CTA) — deleted. You trust
            the pitch to land in one line and the demo to do the rest.
          </p>
        </div>
      </div>
    </main>
  );
}

function PreviewBadge() {
  return (
    <div className="text-center py-2 px-4 text-xs" style={{ background: '#0a0a0a', color: '#fff' }}>
      <Link href="/website/trail" className="hover:underline">← Back to trail index</Link>
      <span className="mx-3" style={{ color: '#666' }}>·</span>
      Scope A — <strong className="font-semibold">Full rewrite (blank slate)</strong>
    </div>
  );
}
