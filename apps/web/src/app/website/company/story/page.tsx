import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight, BookOpen } from 'lucide-react';
import { Breadcrumb } from '../../_components/Breadcrumb';

export const metadata: Metadata = {
  title: 'Founder Story',
  description:
    'From real hotel operations pain to a smarter control room for owners and teams.',
};

export default function StoryPage() {
  return (
    <main>
      <section className="mx-auto max-w-7xl px-5 sm:px-8 pt-10 sm:pt-14 pb-12 sm:pb-16">
        <Breadcrumb items={[
          { label: 'Company', href: '/website/company' },
          { label: 'Founder Story' },
        ]} />

        <div className="mt-6 max-w-3xl">
          <span className="stayops-pill">
            <BookOpen className="w-3.5 h-3.5" />
            Founder Story
          </span>
          <h1
            className="display mt-6"
            style={{
              color: 'var(--so-ink)',
              fontSize: 'clamp(2.5rem, 6vw, 5rem)',
              maxWidth: '20ch',
              lineHeight: 1.02,
            }}
          >
            Why StayOps exists.
          </h1>
          <p
            className="mt-6 text-base sm:text-lg lg:text-xl"
            style={{ color: 'var(--so-ink-muted)', maxWidth: '54ch', lineHeight: 1.55 }}
          >
            Hotels move fast. Rooms turn over. Guests arrive. Repairs happen. Audits are due.
            Inventory moves. Staff change shifts. Owners need answers. But too much of hotel
            operations still depends on calls, texts, paper, spreadsheets, and memory.
          </p>
        </div>
      </section>

      <Chapter
        alt
        label="Chapter 1"
        title="Operations get lost between rooms and reports."
        paragraphs={[
          'A housekeeper notices a broken AC in Room 214. She tells the front desk. The front desk is checking in a guest. The note gets written on a sticky. By the time maintenance hears about it, the room has been blocked, a guest has been moved, and no one agrees on when the issue started.',
          'Multiply that by every room, every shift, every property. Most hotels don’t lose money from one big mistake. They lose it through small operational gaps that repeat every day — and nobody can see them early enough to act.',
        ]}
      />

      <Chapter
        label="Chapter 2"
        title="Owners end up depending on phone calls."
        paragraphs={[
          'If you own a property — or five — you probably know the feeling. Monday arrives, reports come in from every GM, and somewhere between WhatsApp messages, PMS exports, accounting sheets, and hallway conversations, the picture you actually want never forms.',
          'You want to know which rooms are out of order. Which repair has been sitting too long. Which audit was missed. Where inventory is leaking. StayOps exists to give ownership groups that picture — in one place, without chasing every GM for updates.',
        ]}
      />

      <Chapter
        alt
        label="Chapter 3"
        title="One control room. Two audiences."
        paragraphs={[
          'StayOps is built for two sides of the same hotel: owners who need visibility, and teams who need clarity and proof of their work. Employees get clear room assignments, simple updates, and proof of completion. Owners get a calm operational view that updates itself.',
          'We are not building surveillance software. We are building the operational memory that hotels have never had — the thing that turns a dozen scattered tools into one clear line of sight.',
        ]}
        closer="We are not trying to be the next big hotel-tech company. We are trying to be the one tool you actually use every Monday morning."
      />

      <section className="mx-auto max-w-4xl px-5 sm:px-8 py-20 sm:py-24 text-center">
        <h2
          className="display mx-auto"
          style={{
            color: 'var(--so-ink)',
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            maxWidth: '24ch',
          }}
        >
          Want the same clarity for your hotels?
        </h2>
        <p
          className="mt-6 mx-auto text-base sm:text-lg"
          style={{ color: 'var(--so-ink-muted)', maxWidth: '50ch', lineHeight: 1.6 }}
        >
          30-minute demo. Bring your numbers. Walk out with the picture.
        </p>
        <div className="mt-8 flex items-center justify-center">
          <Link href="/website/contact" className="stayops-cta">
            Book a Demo <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}

function Chapter({
  label, title, paragraphs, closer, alt,
}: {
  label: string;
  title: string;
  paragraphs: string[];
  closer?: string;
  alt?: boolean;
}) {
  return (
    <section
      className="border-y"
      style={{
        borderColor: 'var(--so-hairline)',
        background: alt ? 'var(--so-canvas-soft)' : 'var(--so-canvas)',
      }}
    >
      <div className="mx-auto max-w-4xl px-5 sm:px-8 py-16 sm:py-20">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em]"
           style={{ color: 'var(--so-ink-dim)' }}>
          {label}
        </p>
        <h2
          className="display mt-3"
          style={{
            color: 'var(--so-ink)',
            fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
            maxWidth: '28ch',
          }}
        >
          {title}
        </h2>
        <div className="mt-6 space-y-5 text-base sm:text-lg"
             style={{ color: 'var(--so-ink-muted)', lineHeight: 1.7 }}>
          {paragraphs.map((p, i) => <p key={i}>{p}</p>)}
          {closer && (
            <p style={{ color: 'var(--so-ink)', fontWeight: 500 }}>{closer}</p>
          )}
        </div>
      </div>
    </section>
  );
}
