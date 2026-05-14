/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import { ArrowRight, Bed, Boxes, Clock, ShieldAlert, UserCheck, Wrench } from 'lucide-react';
import type { Flavor } from './_palette';
import { getPalette, fp, altPaletteFor } from './_palette';
import { Section, SectionHeader, FinalCtaBanner } from './_ui';
import { PHOTOS, FOOTER_CTA } from './_site';

/* ============================================================
 *  WHY STAYOPS — hidden operational losses
 * ============================================================ */
export function WhyPage({ flavor }: { flavor: Flavor }) {
  const P = getPalette(flavor);
  const Pa = altPaletteFor(P);
  const photos = PHOTOS[flavor];

  return (
    <main style={{ background: P.pageBg, color: P.text }}>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section style={{ background: P.pageBg }}>
        <div className="mx-auto max-w-5xl px-5 sm:px-8 pt-24 sm:pt-32 pb-12 sm:pb-16 text-center">
          <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em]"
            style={{ background: P.cardAlt, border: `1px solid ${P.border}`, color: P.brand }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: P.brand }} />
            Why StayOps
          </span>
          <h1 className="mt-6 mx-auto"
            style={{
              fontSize: 'clamp(2.5rem, 6vw, 5rem)', lineHeight: 1.02,
              letterSpacing: '-0.03em', maxWidth: '22ch', fontWeight: 600, color: P.text,
            }}>
            Hidden operational losses are costing hotels more than they realise.
          </h1>
          <p className="mt-6 mx-auto text-base sm:text-lg lg:text-xl"
            style={{ color: P.body, maxWidth: '56ch', lineHeight: 1.55 }}>
            StayOps helps hotel ownership groups see the small daily issues that affect room
            revenue, labour cost, maintenance spend, inventory, audits, and property performance.
          </p>
          <div className="mt-8 flex items-center justify-center">
            <Link href="#losses"
              className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-all duration-200 hover:scale-[1.03] hover:shadow-lg"
              style={{ background: P.buttonPrimary.bg, color: P.buttonPrimary.text }}>
              See the Hidden Losses <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Hidden loss intro ────────────────────────────────── */}
      <Section palette={P} alt>
        <SectionHeader palette={Pa}
          eyebrow="The hidden loss problem"
          headline="Small gaps become expensive when nobody sees them early."
          body="A hotel can look busy and still lose money through daily operational gaps. A room stays out of order longer than necessary. A repair is delayed. A safety check is missed. A replacement item is not recorded. A task is completed but not documented. Over time, those gaps become real financial loss."
        />
      </Section>

      {/* ── Six quiet categories ─────────────────────────────── */}
      <Section palette={P} id="losses">
        <SectionHeader palette={P}
          eyebrow="Six quiet categories"
          headline="Where hotels quietly lose money."
        />
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {[
            { Icon: Bed,         title: 'Room revenue loss',         body: 'Out-of-order rooms directly affect available inventory and revenue.' },
            { Icon: Wrench,      title: 'Maintenance delay loss',    body: 'Delayed repairs increase downtime, guest complaints, and repeated work.' },
            { Icon: UserCheck,   title: 'Labour waste',              body: 'Unclear work and poor handovers create unnecessary follow-ups and overtime pressure.' },
            { Icon: ShieldAlert, title: 'Audit risk',                body: 'Missed inspections create compliance, brand, and safety concerns.' },
            { Icon: Boxes,       title: 'Inventory and asset loss',  body: 'Missing, damaged, or frequently replaced items create silent expenses.' },
            { Icon: Clock,       title: 'Management time loss',      body: 'Owners and GMs waste time chasing updates instead of making decisions.' },
          ].map(({ Icon, title, body }) => (
            <div key={title}
              className={`rounded-2xl p-6 ${P.hoverLift}`}
              style={{ background: P.card, border: `1px solid ${P.border}` }}>
              <span className="inline-flex w-10 h-10 rounded-full items-center justify-center"
                style={{ background: P.cardAlt, color: P.brand }}>
                <Icon className="w-5 h-5" />
              </span>
              <h3 className="mt-4 text-lg font-semibold" style={{ color: P.text }}>{title}</h3>
              <p className="mt-2 text-sm sm:text-base" style={{ color: P.body, lineHeight: 1.6 }}>{body}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Existing tools gap ───────────────────────────────── */}
      <Section palette={P} alt>
        <SectionHeader palette={Pa}
          eyebrow="The missing layer"
          headline="Hotels may have tools, but they still lack operational memory."
          body="A hotel may already have a PMS, payroll system, accounting system, maintenance process, reports, spreadsheets, and group chats. But these systems often do not create one clear operational memory for ownership."
        />
        <p className="mt-4 text-base sm:text-lg" style={{ color: Pa.body, lineHeight: 1.65, maxWidth: '60ch' }}>
          StayOps sits above daily work and connects the signals owners need to see.
        </p>
      </Section>

      {/* ── Before / After ───────────────────────────────────── */}
      <Section palette={P}>
        <SectionHeader palette={P}
          eyebrow="StayOps difference"
          headline="StayOps connects daily work to business impact."
        />
        <div className="mt-10 rounded-2xl overflow-hidden"
          style={{ background: P.card, border: `1px solid ${P.border}` }}>
          <div className="grid grid-cols-2 text-[11px] font-semibold uppercase tracking-[0.14em] px-6 py-4"
            style={{
              color: P.muted,
              borderBottom: `1px solid ${P.border}`,
              background: P.cardAlt,
            }}>
            <span>Traditional hotel operations</span>
            <span>StayOps</span>
          </div>
          {([
            ['Calls, texts, paper, and spreadsheets',  'One control room'],
            ['Tasks disappear after completion',        'Operational history stays'],
            ['Owners depend on updates',                'Owners see live visibility'],
            ['Employees fear blame',                    'Employees get proof of work'],
            ['Issues are reactive',                     'Patterns become visible'],
            ['Data is scattered',                       'Property intelligence is connected'],
            ['Audits are easy to miss',                 'Recurring checks stay visible'],
            ['Inventory issues are hard to trace',      'Item history stays connected'],
          ] as const).map(([before, after], i, rows) => (
            <div key={before}
              className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-0 px-6 py-4 text-sm sm:text-base"
              style={i < rows.length - 1 ? { borderBottom: `1px solid ${P.border}` } : undefined}>
              <span style={{ color: P.body }}>{before}</span>
              <span style={{ color: P.text, fontWeight: 500 }}>{after}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Final CTA ────────────────────────────────────────── */}
      <FinalCtaBanner palette={P}
        photo={photos.finalBg}
        headline="See the daily gaps that affect your bottom line."
        body="Bring revenue, labour, rooms, tickets, audits, maintenance, assets, and reports into one place — for every property in your portfolio."
        ctaLabel={FOOTER_CTA.ctaLabel}
        ctaHref={fp(flavor, FOOTER_CTA.ctaHref)}
        smallText={FOOTER_CTA.smallText}
      />
    </main>
  );
}
