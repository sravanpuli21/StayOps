import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Trail — Homepage redesign previews',
  description: 'Internal preview: compare 4 design directions and 3 scope-of-redo options for the StayOps homepage.',
};

interface PreviewCard {
  href: string;
  label: string;
  title: string;
  subtitle: string;
  accent?: string;
}

const DIRECTIONS: PreviewCard[] = [
  {
    href: '/website/trail/product-forward',
    label: 'Direction 1',
    title: 'Product-forward',
    subtitle: 'Hero leads with a giant dashboard mockup. Tool-first energy. Linear / Notion school.',
    accent: '#ff385c',
  },
  {
    href: '/website/trail/story-driven',
    label: 'Direction 2',
    title: 'Story-driven',
    subtitle: 'Full-bleed hotel photography. Atmospheric. Brand becomes about hotel reality, not software.',
    accent: '#d97a4a',
  },
  {
    href: '/website/trail/minimal',
    label: 'Direction 3',
    title: 'Minimal / restrained',
    subtitle: 'Apple-lite. Fewer sections, bigger whitespace, big type, sparse color. Quiet.',
    accent: '#222',
  },
  {
    href: '/website/trail/bold-editorial',
    label: 'Direction 4',
    title: 'Bold editorial',
    subtitle: 'Huge numeric hero ($47K). Serif-heavy, dense, newspaper-grade information. NYT / FT.',
    accent: '#0a0a0a',
  },
];

const STORY_FLAVORS: PreviewCard[] = [
  {
    href: '/website/trail/story-driven',
    label: 'Flavor 1',
    title: 'Dark & Night',
    subtitle: 'The original. Night-lit hotel lobby, things-go-wrong narrative, dark middle section, somber and contemplative. The version that\'s live right now.',
    accent: '#0a0a0a',
  },
  {
    href: '/website/trail/story-daylight',
    label: 'Flavor 2',
    title: 'Daylight & Warm',
    subtitle: 'Same 5-section structure, but sunlit photography and an optimistic narrative — "a day that runs cleanly." Cream palette, no dark sections.',
    accent: '#f7a968',
  },
  {
    href: '/website/trail/story-human',
    label: 'Flavor 3',
    title: 'People & Voices',
    subtitle: 'Photos of staff (housekeeper · maintenance · GM) with direct quotes from each. Hospitality-as-people-work angle. "We built this for the team first."',
    accent: '#b64a3f',
  },
  {
    href: '/website/trail/story-editorial',
    label: 'Flavor 4',
    title: 'Editorial / Essay',
    subtitle: 'Slow-scroll magazine essay. Alternating photo-text spreads, serif-heavy, no CTA stacks — one quiet link at the bottom. "What a hotel forgets, it loses."',
    accent: '#6a6a6a',
  },
];

const STORY_SCOPES: PreviewCard[] = [
  {
    href: '/website/trail/story-driven',
    label: 'Scope 1',
    title: 'Preview as-is (5 sections)',
    subtitle: 'Hero photo · pull quote · 3-scene story · operators note · photo-backed CTA. The version that\'s live now.',
    accent: '#d97a4a',
  },
  {
    href: '/website/trail/story-driven-hybrid',
    label: 'Scope 2',
    title: 'Hybrid (7 sections)',
    subtitle: 'The 5 above + Product Overview (7 modules) + Before/After comparison table. Middle ground.',
    accent: '#d97a4a',
  },
  {
    href: '/website/trail/story-driven-full',
    label: 'Scope 3',
    title: 'Full (all 11 sections)',
    subtitle: 'Every current homepage section retinted in the story-driven language.',
    accent: '#d97a4a',
  },
  {
    href: '/website',
    label: 'Live',
    title: 'Current homepage',
    subtitle: 'The version of /website running right now (currently: story-driven as-is).',
    accent: '#929292',
  },
];

const SCOPES: PreviewCard[] = [
  {
    href: '/website/trail/scope/full-rewrite',
    label: 'Scope A',
    title: 'Full rewrite',
    subtitle: 'Blank slate. Just hero + one CTA + footer. What "start from zero" feels like.',
  },
  {
    href: '/website/trail/scope/keepthecontent',
    label: 'Scope B',
    title: 'Keep the content',
    subtitle: 'All 10 current sections preserved, new visual language applied on top.',
  },
  {
    href: '/website/trail/scope/keepsome',
    label: 'Scope C',
    title: 'Keep some, drop some',
    subtitle: '6 sections kept, 4 dropped. A tighter homepage — what stays, what goes.',
  },
];

export default function TrailIndexPage() {
  return (
    <main>
      <section className="mx-auto max-w-5xl px-5 sm:px-8 pt-16 sm:pt-20 pb-12">
        <p className="text-xs font-semibold uppercase tracking-[0.14em]" style={{ color: '#929292' }}>
          Internal · homepage redesign previews
        </p>
        <h1 className="display mt-3 text-4xl sm:text-5xl" style={{ color: '#222', lineHeight: 1.05, letterSpacing: '-0.02em' }}>
          Pick a direction. Pick a scope.
        </h1>
        <p className="mt-4 text-base sm:text-lg max-w-2xl" style={{ color: '#6a6a6a', lineHeight: 1.6 }}>
          Seven preview pages — four visual directions and three scope-of-redo options — so you can
          see every option before we commit.
        </p>
      </section>

      <section className="mx-auto max-w-5xl px-5 sm:px-8 pb-12">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] mb-4" style={{ color: '#d97a4a' }}>
          ✓ Picked: Story-driven — 4 flavors within the direction
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {STORY_FLAVORS.map((d) => (
            <PreviewTile key={d.href} card={d} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 sm:px-8 pb-12">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] mb-4" style={{ color: '#929292' }}>
          Story-driven scope comparison (same Dark & Night flavor, different section depth)
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {STORY_SCOPES.map((d) => (
            <PreviewTile key={d.href} card={d} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 sm:px-8 pb-12">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] mb-4" style={{ color: '#929292' }}>
          Other directions — for reference
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {DIRECTIONS.map((d) => (
            <PreviewTile key={d.href} card={d} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 sm:px-8 pb-20">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] mb-4" style={{ color: '#929292' }}>
          Scope of redo — what stays, what goes
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {SCOPES.map((d) => (
            <PreviewTile key={d.href} card={d} />
          ))}
        </div>
      </section>
    </main>
  );
}

function PreviewTile({ card }: { card: PreviewCard }) {
  return (
    <Link
      href={card.href}
      className="group rounded-2xl p-6 block transition-colors"
      style={{ background: '#fff', border: '1px solid #eee' }}
    >
      <div className="flex items-center gap-2">
        {card.accent && (
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: card.accent }} />
        )}
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em]" style={{ color: '#929292' }}>
          {card.label}
        </p>
      </div>
      <p className="mt-3 text-lg font-semibold" style={{ color: '#222' }}>{card.title}</p>
      <p className="mt-2 text-sm" style={{ color: '#6a6a6a', lineHeight: 1.55 }}>{card.subtitle}</p>
      <span
        className="mt-4 inline-flex items-center gap-1 text-sm font-medium"
        style={{ color: '#222' }}
      >
        Open preview
        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}
