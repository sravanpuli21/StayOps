/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, FileText, BellRing, TrendingDown, Sparkles, Mail, Phone, MapPin } from 'lucide-react';
import type { Palette, Flavor } from './_palette';
import { getPalette, fp, altPaletteFor } from './_palette';
import {
  Hero, PageHero, Section, SectionHeader, CardGrid, Bullets, NumberedSteps,
  DrillPath, StrongLine, FinalCtaBanner, MockSlot, PrimaryButton, SecondaryButton,
} from './_ui';
import {
  PortfolioMock, OwnerKpiMock, RegionalMock, ReportMock,
  MaintenanceAppMock, HousekeepingAppMock, EmployeeAppMock, MobileAppTriptych,
} from './_mocks';
import {
  HERO, PROBLEM, CORE_VALUE, OWNER_LENS, REGIONAL_LENS, PRODUCT_GLIMPSE,
  DRILL_DOWN, REPORTS, AI_ALERTS, HOW_IT_WORKS, FINAL_CTA,
} from './_content';
import {
  PRODUCT_LIST, SOLUTION_LIST, PRODUCT_SUBPAGES, SOLUTION_SUBPAGES,
  PHOTOS, FOOTER_CTA, type ProductSubpage, type SolutionSubpage, type MockKey,
} from './_site';
/* Wrap a CTA's href so it stays inside the flavor preview. */
const cta = (flavor: Flavor, c: { label: string; href: string }) => ({ label: c.label, href: fp(flavor, c.href) });

/* ============================================================
 *  HOME — full IA homepage with all 11 sections + mocks
 * ============================================================ */
export function HomePage({ flavor }: { flavor: Flavor }) {
  const P = getPalette(flavor);
  const Pa = altPaletteFor(P);
  const photos = PHOTOS[flavor];

  return (
    <main style={{ background: P.pageBg, color: P.text }}>
      <Hero
        palette={P}
        photo={photos.hero}
        eyebrow={HERO.eyebrow}
        headline={HERO.headline}
        subhead={HERO.subheadline}
        supporting={HERO.supporting}
        primaryCta={cta(flavor, HERO.primaryCta)}
        secondaryCta={cta(flavor, HERO.secondaryCta)}
        trustLine={HERO.trustLine}
      />

      {/* Portfolio mock floating after hero */}
      <section style={{ background: P.pageBg }}>
        <div className="mx-auto max-w-6xl px-5 sm:px-8 -mt-20 sm:-mt-24 pb-16 sm:pb-20 relative z-10">
          <PortfolioMock />
          <p className="mt-5 text-xs sm:text-sm text-center" style={{ color: P.subtle }}>
            A glimpse of the portfolio dashboard. Real data, real properties, in one view.
          </p>
        </div>
      </section>

      {/* Problem */}
      <Section palette={P}>
        <SectionHeader palette={P}
          eyebrow="What's getting in the way"
          headline={PROBLEM.headline}
          body={PROBLEM.body}
        />
        <CardGrid palette={P} items={[...PROBLEM.cards]} columns={2} icon="dot" />
      </Section>

      {/* Core Value */}
      <Section palette={P} alt>
        <SectionHeader palette={Pa}
          eyebrow="What StayOps does"
          headline={CORE_VALUE.headline}
          body={CORE_VALUE.body}
        />
        <CardGrid palette={Pa} items={[...CORE_VALUE.cards]} columns={4} icon="check" />
      </Section>

      {/* Owner Lens */}
      <Section palette={P} photo={photos.secondary}>
        <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-10 items-center">
          <div>
            <SectionHeader palette={P} eyebrow={OWNER_LENS.eyebrow} headline={OWNER_LENS.headline} body={OWNER_LENS.body} />
            <Bullets palette={P} items={OWNER_LENS.bullets} />
            <div className="mt-8"><PrimaryButton palette={P} {...cta(flavor, OWNER_LENS.cta)} /></div>
          </div>
          <OwnerKpiMock />
        </div>
      </Section>

      {/* Regional Lens */}
      <Section palette={P} alt>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-10 items-center">
          <RegionalMock />
          <div>
            <SectionHeader palette={Pa} eyebrow={REGIONAL_LENS.eyebrow} headline={REGIONAL_LENS.headline} body={REGIONAL_LENS.body} />
            <Bullets palette={Pa} items={REGIONAL_LENS.bullets} />
            <div className="mt-8"><PrimaryButton palette={Pa} {...cta(flavor, REGIONAL_LENS.cta)} /></div>
          </div>
        </div>
      </Section>

      {/* Product Glimpse */}
      <Section palette={P}>
        <SectionHeader palette={P} headline={PRODUCT_GLIMPSE.headline} body={PRODUCT_GLIMPSE.body} />
        <CardGrid
          palette={P}
          columns={4}
          linkable
          items={PRODUCT_GLIMPSE.tiles.map((t, i) => ({
            ...t,
            href: `/website/trail/newcontent/${flavor}/products/${PRODUCT_LIST[i]?.slug ?? ''}`,
          }))}
        />
        <div className="mt-12 flex justify-center"><PrimaryButton palette={P} {...cta(flavor, PRODUCT_GLIMPSE.cta)} /></div>
      </Section>

      {/* Drill Down */}
      <Section palette={P} alt>
        <SectionHeader palette={Pa} headline={DRILL_DOWN.headline} body={DRILL_DOWN.body} />
        <DrillPath palette={Pa} path={DRILL_DOWN.path} />
        <StrongLine palette={Pa}>{DRILL_DOWN.strongLine}</StrongLine>
      </Section>

      {/* Reports */}
      <Section palette={P}>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-10 items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em]" style={{ color: P.brand }}>
              <FileText className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" /> Reports
            </p>
            <h2 className="mt-3" style={{
              fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)', lineHeight: 1.12,
              letterSpacing: '-0.02em', fontWeight: 600, maxWidth: '22ch', color: P.text,
            }}>
              {REPORTS.headline}
            </h2>
            <p className="mt-5 text-base sm:text-lg" style={{ color: P.body, lineHeight: 1.6, maxWidth: '52ch' }}>
              {REPORTS.body}
            </p>
            <Bullets palette={P} items={REPORTS.reportTypes} />
            <div className="mt-8"><PrimaryButton palette={P} {...cta(flavor, REPORTS.cta)} /></div>
          </div>
          <ReportMock />
        </div>
      </Section>

      {/* AI Alerts */}
      <Section palette={P} alt>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] inline-flex items-center gap-1.5" style={{ color: Pa.brand }}>
          <BellRing className="w-3.5 h-3.5" /> Alerts
        </p>
        <h2 className="mt-3" style={{
          fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)', lineHeight: 1.12,
          letterSpacing: '-0.02em', fontWeight: 600, maxWidth: '24ch', color: Pa.text,
        }}>
          {AI_ALERTS.headline}
        </h2>
        <p className="mt-5 text-base sm:text-lg" style={{ color: Pa.body, lineHeight: 1.65, maxWidth: '64ch' }}>
          {AI_ALERTS.body}
        </p>
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-3">
          {AI_ALERTS.alerts.map((a) => (
            <div key={a} className={`rounded-xl p-4 flex items-start gap-3 ${Pa.hoverLift}`}
              style={{ background: Pa.card, border: `1px solid ${Pa.border}` }}>
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg flex-shrink-0"
                style={{ background: '#fffbeb' }}>
                <Sparkles className="w-3.5 h-3.5" style={{ color: Pa.accent }} />
              </span>
              <span className="text-sm pt-0.5" style={{ color: Pa.text, lineHeight: 1.5 }}>{a}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* How It Works */}
      <Section palette={P}>
        <SectionHeader palette={P} headline={HOW_IT_WORKS.headline} />
        <NumberedSteps palette={P} steps={HOW_IT_WORKS.steps} />
        <div className="mt-12 flex justify-center"><PrimaryButton palette={P} {...cta(flavor, HOW_IT_WORKS.cta)} /></div>
      </Section>

      {/* Final CTA */}
      <FinalCtaBanner
        palette={P}
        photo={photos.finalBg}
        headline={FINAL_CTA.headline}
        body={FINAL_CTA.body}
        ctaLabel={FINAL_CTA.cta.label}
        ctaHref={fp(flavor, FINAL_CTA.cta.href)}
        smallText={FINAL_CTA.smallText}
      />
    </main>
  );
}

/* ============================================================
 *  PRODUCT OVERVIEW
 * ============================================================ */
export function ProductOverviewPage({ flavor }: { flavor: Flavor }) {
  const P = getPalette(flavor);
  const Pa = altPaletteFor(P);
  const photos = PHOTOS[flavor];
  return (
    <main style={{ background: P.pageBg, color: P.text }}>
      <PageHero palette={P}
        eyebrow="Product"
        headline="One dashboard for the full hotel portfolio."
        subhead="StayOps brings revenue, occupancy, labour, operations, audits, maintenance, assets, reports, and team execution into one platform for multi-property hotel groups."
        primaryCta={{ label: 'Book a demo', href: fp(flavor, '/website/contact') }}
        secondaryCta={{ label: 'See it in action', href: '#modules' }}
      />

      {/* Platform Summary — three pillars */}
      <Section palette={P} alt>
        <SectionHeader palette={Pa}
          eyebrow="Platform summary"
          headline="See the business. Track the work. Report faster."
          body="StayOps gives leadership a clear portfolio view while helping property teams complete the work that keeps hotels running."
        />
        <CardGrid palette={Pa} columns={3} icon="check" items={[
          { title: 'Portfolio Visibility', body: 'See revenue, occupancy, labour, room status, and property performance across every hotel.' },
          { title: 'Operational Control',  body: 'Track tickets, audits, maintenance, housekeeping, scheduling, and daily issues.' },
          { title: 'Reports & Alerts',     body: 'Generate reports and catch problems earlier with AI-supported alerts and summaries.' },
        ]} />
      </Section>

      {/* Modules */}
      <Section palette={P} id="modules">
        <SectionHeader palette={P}
          eyebrow="Modules"
          headline="What StayOps brings together"
        />
        <CardGrid palette={P} columns={4} linkable
          items={PRODUCT_LIST.map((p) => ({
            title: p.label,
            body: p.subhead,
            href: `/website/trail/newcontent/${flavor}/products/${p.slug}`,
            ctaLabel: `Explore ${p.label}`,
          }))}
        />
      </Section>

      {/* Product flow */}
      <Section palette={P} alt>
        <SectionHeader palette={Pa}
          eyebrow="Product flow"
          headline="From leadership view to floor execution."
          body="StayOps connects the numbers leadership cares about with the daily work happening at each property."
        />
        <DrillPath palette={Pa} path={['Portfolio', 'Property', 'Department', 'Room', 'Ticket / Audit / Asset', 'Report']} />
      </Section>

      <FinalCtaBanner palette={P} photo={photos.finalBg}
        headline="Want to see how the platform looks for your hotel group?"
        body={FOOTER_CTA.body}
        ctaLabel={FOOTER_CTA.ctaLabel} ctaHref={fp(flavor, FOOTER_CTA.ctaHref)}
        smallText={FOOTER_CTA.smallText}
      />
    </main>
  );
}

/* ============================================================
 *  PRODUCT SUBPAGE — generic, fed by content
 * ============================================================ */
export function ProductSubpagePage({ flavor, slug }: { flavor: Flavor; slug: string }) {
  const P = getPalette(flavor);
  const Pa = altPaletteFor(P);
  const photos = PHOTOS[flavor];
  const subpage: ProductSubpage | undefined = PRODUCT_SUBPAGES[slug];
  if (!subpage) return null; // route handler will 404

  return (
    <main style={{ background: P.pageBg, color: P.text }}>
      <PageHero palette={P}
        eyebrow={subpage.eyebrow}
        headline={subpage.headline}
        subhead={subpage.subhead}
        primaryCta={{ label: 'Book a demo', href: fp(flavor, '/website/contact') }}
        secondaryCta={{ label: 'See it in action', href: '#mock' }}
      />

      <Section palette={P} alt id="mock">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-10 items-center">
          <div>
            <SectionHeader palette={Pa} eyebrow="What you can see" headline="Everything in one place."
              body={subpage.whyItMatters} />
            <Bullets palette={Pa} items={subpage.whatYouSee} />
            {subpage.bestFor && (
              <div className="mt-8">
                <p className="text-xs font-semibold uppercase tracking-[0.14em]" style={{ color: Pa.brand }}>Best for</p>
                <p className="mt-2 text-sm" style={{ color: Pa.body }}>{subpage.bestFor.join(' · ')}</p>
              </div>
            )}
            <StrongLine palette={Pa}>{subpage.keyValue}</StrongLine>
            <div className="mt-8"><PrimaryButton palette={Pa} label="Book a demo" href={fp(flavor, '/website/contact')} /></div>
          </div>
          <MockResolver mock={subpage.mock} />
        </div>
      </Section>

      <FinalCtaBanner palette={P} photo={photos.finalBg}
        headline={FOOTER_CTA.headline} body={FOOTER_CTA.body}
        ctaLabel={FOOTER_CTA.ctaLabel} ctaHref={fp(flavor, FOOTER_CTA.ctaHref)}
        smallText={FOOTER_CTA.smallText}
      />
    </main>
  );
}

/* ============================================================
 *  SOLUTIONS OVERVIEW
 * ============================================================ */
export function SolutionsOverviewPage({ flavor }: { flavor: Flavor }) {
  const P = getPalette(flavor);
  const Pa = altPaletteFor(P);
  const photos = PHOTOS[flavor];
  return (
    <main style={{ background: P.pageBg, color: P.text }}>
      <PageHero palette={P}
        eyebrow="Solutions"
        headline="Built for every leader responsible for hotel performance."
        subhead="StayOps gives owners, regional managers, GMs, and property teams the right view for their role — while keeping the whole hotel group connected."
        primaryCta={{ label: 'Book a demo', href: fp(flavor, '/website/contact') }}
      />

      <Section palette={P} alt>
        <SectionHeader palette={Pa} eyebrow="By role" headline="Pick your seat at the table." />
        <CardGrid palette={Pa} columns={3} linkable
          items={SOLUTION_LIST.map((s) => ({
            title: s.label,
            body: s.subhead,
            href: `/website/trail/newcontent/${flavor}/solutions/${s.slug}`,
            ctaLabel: `View ${s.label}`,
          }))}
        />
      </Section>

      <Section palette={P}>
        <SectionHeader palette={P}
          eyebrow="Shared view"
          headline="Different roles. One source of truth."
          body="Owners care about money and performance. Regional managers care about execution and accountability. Property teams care about what needs to get done. StayOps connects all three."
        />
        <StrongLine palette={P}>
          Ownership gets visibility. Regional managers get control. Property teams get clarity.
        </StrongLine>
      </Section>

      <FinalCtaBanner palette={P} photo={photos.finalBg}
        headline={FOOTER_CTA.headline} body={FOOTER_CTA.body}
        ctaLabel={FOOTER_CTA.ctaLabel} ctaHref={fp(flavor, FOOTER_CTA.ctaHref)}
        smallText={FOOTER_CTA.smallText}
      />
    </main>
  );
}

/* ============================================================
 *  SOLUTION SUBPAGE — generic, fed by content
 * ============================================================ */
export function SolutionSubpagePage({ flavor, slug }: { flavor: Flavor; slug: string }) {
  const P = getPalette(flavor);
  const Pa = altPaletteFor(P);
  const photos = PHOTOS[flavor];
  const subpage: SolutionSubpage | undefined = SOLUTION_SUBPAGES[slug];
  if (!subpage) return null;

  return (
    <main style={{ background: P.pageBg, color: P.text }}>
      <PageHero palette={P}
        eyebrow={subpage.eyebrow}
        headline={subpage.headline}
        subhead={subpage.subhead}
        primaryCta={{ label: subpage.ctaLabel, href: fp(flavor, '/website/contact') }}
        secondaryCta={{ label: 'See it in action', href: '#mock' }}
      />

      <Section palette={P} alt>
        <SectionHeader palette={Pa} eyebrow="The pain" headline="What's not working today."
          body={subpage.pain} />
      </Section>

      <Section palette={P} id="mock">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-10 items-center">
          <div>
            <SectionHeader palette={P} eyebrow="What StayOps does" headline="Here's what changes." />
            <Bullets palette={P} items={subpage.helps} />
            <StrongLine palette={P}>{subpage.keyOutcome}</StrongLine>
            <div className="mt-8"><PrimaryButton palette={P} label={subpage.ctaLabel} href={fp(flavor, '/website/contact')} /></div>
          </div>
          <MockResolver mock={subpage.mock} />
        </div>
      </Section>

      <FinalCtaBanner palette={P} photo={photos.finalBg}
        headline={FOOTER_CTA.headline} body={FOOTER_CTA.body}
        ctaLabel={FOOTER_CTA.ctaLabel} ctaHref={fp(flavor, FOOTER_CTA.ctaHref)}
        smallText={FOOTER_CTA.smallText}
      />
    </main>
  );
}

/* ============================================================
 *  COMPANY OVERVIEW
 * ============================================================ */
export function CompanyOverviewPage({ flavor }: { flavor: Flavor }) {
  const P = getPalette(flavor);
  const Pa = altPaletteFor(P);
  const photos = PHOTOS[flavor];
  return (
    <main style={{ background: P.pageBg, color: P.text }}>
      <PageHero palette={P}
        headline="Building better visibility for hotel ownership groups."
        subhead="StayOps is built for the hotel leaders who manage multiple properties, brands, teams, reports, and daily issues — and need one clear place to see what is happening."
        primaryCta={{ label: 'Contact us', href: fp(flavor, '/website/contact') }}
      />

      <Section palette={P} alt>
        <CardGrid palette={Pa} columns={3} linkable items={[
          { title: 'About Us',   body: 'Learn why StayOps is being built for hotel owners and regional operations teams.', href: `/website/trail/newcontent/${flavor}/company/about` },
          { title: 'Contact',    body: 'Have questions or want to see the product? Contact the StayOps team.',           href: `/website/trail/newcontent/${flavor}/contact` },
          { title: 'Book a Demo',body: 'See how StayOps can work for your current hotel portfolio and workflows.',        href: fp(flavor, '/website/contact') },
        ]} />
      </Section>

      <FinalCtaBanner palette={P} photo={photos.finalBg}
        headline={FOOTER_CTA.headline} body={FOOTER_CTA.body}
        ctaLabel={FOOTER_CTA.ctaLabel} ctaHref={fp(flavor, FOOTER_CTA.ctaHref)}
        smallText={FOOTER_CTA.smallText}
      />
    </main>
  );
}

/* ============================================================
 *  ABOUT
 * ============================================================ */
export function AboutPage({ flavor }: { flavor: Flavor }) {
  const P = getPalette(flavor);
  const Pa = altPaletteFor(P);
  const photos = PHOTOS[flavor];
  return (
    <main style={{ background: P.pageBg, color: P.text }}>
      <PageHero palette={P}
        eyebrow="About StayOps"
        headline="We are building StayOps for the way hotel groups actually operate."
        subhead="Many hotel ownership groups run properties across different brands, cities, teams, and systems. But leadership still needs one clear view of performance, issues, reports, and daily execution."
      />

      <Section palette={P} alt>
        <SectionHeader palette={Pa} headline="Hotels may run separately. Ownership does not."
          body="A hotel group may operate Marriott, Hilton, IHG, Choice, Hyatt, Wyndham, and independent properties at the same time. Each property may use different systems and send different reports. But for ownership and regional leadership, every hotel is part of one business. StayOps is built to bring that business into one view." />
      </Section>

      <Section palette={P}>
        <SectionHeader palette={P} headline="Our focus is simple: visibility, control, and faster decisions."
          body="StayOps helps hotel leaders see revenue, labour, rooms, tickets, audits, maintenance, assets, and reports across every property — so they can find problems faster and act with better information." />
      </Section>

      <Section palette={P} alt>
        <SectionHeader palette={Pa} headline="Built for owners. Useful for teams."
          body="The product starts with leadership visibility, but connects to the teams doing the work. Owners and regional managers see the full picture. GMs and supervisors manage execution. Property teams update the work from the floor." />
        <div className="mt-8"><PrimaryButton palette={Pa} label="Book a demo" href={fp(flavor, '/website/contact')} /></div>
      </Section>

      <FinalCtaBanner palette={P} photo={photos.finalBg}
        headline={FOOTER_CTA.headline} body={FOOTER_CTA.body}
        ctaLabel={FOOTER_CTA.ctaLabel} ctaHref={fp(flavor, FOOTER_CTA.ctaHref)}
        smallText={FOOTER_CTA.smallText}
      />
    </main>
  );
}

/* ============================================================
 *  CONTACT
 * ============================================================ */
export function ContactPage({ flavor }: { flavor: Flavor }) {
  const P = getPalette(flavor);
  const Pa = altPaletteFor(P);
  return (
    <main style={{ background: P.pageBg, color: P.text }}>
      <PageHero palette={P}
        eyebrow="Contact"
        headline="Talk to StayOps."
        subhead="Have a question, want to see the product, or want to discuss your hotel portfolio? Send us a message."
      />

      <Section palette={P} alt>
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-10">
          {/* Form */}
          <div className="rounded-2xl p-6 sm:p-8" style={{ background: Pa.card, border: `1px solid ${Pa.border}` }}>
            <form className="flex flex-col gap-4">
              {[
                { label: 'Full name',     type: 'text',     name: 'name'    },
                { label: 'Company name',  type: 'text',     name: 'company' },
                { label: 'Role',          type: 'text',     name: 'role'    },
                { label: 'Email',         type: 'email',    name: 'email'   },
                { label: 'Phone number',  type: 'tel',      name: 'phone'   },
                { label: 'Number of hotels', type: 'number', name: 'hotels' },
              ].map((f) => (
                <label key={f.name} className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: Pa.muted }}>{f.label}</span>
                  <input type={f.type} name={f.name}
                    className="h-10 px-3 rounded-lg text-sm outline-none transition-colors focus:ring-2 focus:ring-[#ff385c]"
                    style={{ background: Pa.cardAlt, border: `1px solid ${Pa.border}`, color: Pa.text }} />
                </label>
              ))}
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: Pa.muted }}>Message</span>
                <textarea name="message" rows={4}
                  className="px-3 py-2 rounded-lg text-sm outline-none transition-colors focus:ring-2 focus:ring-[#ff385c]"
                  style={{ background: Pa.cardAlt, border: `1px solid ${Pa.border}`, color: Pa.text }} />
              </label>
              <button type="button"
                className="h-11 rounded-full text-sm font-semibold transition-all duration-200 hover:scale-[1.02] hover:shadow-lg"
                style={{ background: Pa.buttonPrimary.bg, color: Pa.buttonPrimary.text }}>
                Send message
              </button>
            </form>
          </div>

          {/* Contact options */}
          <div className="flex flex-col gap-5">
            {[
              { icon: Mail,   label: 'Sales / Demo',     body: 'For hotel owners, regional managers, and operators interested in seeing StayOps.' },
              { icon: FileText,label: 'Product Questions',body: 'For questions about modules, workflows, and reports.' },
              { icon: Phone,  label: 'General Contact',  body: 'For partnerships, support, or other questions.' },
            ].map((c) => (
              <div key={c.label} className={`rounded-2xl p-5 ${Pa.hoverLift}`}
                style={{ background: Pa.card, border: `1px solid ${Pa.border}` }}>
                <c.icon className="w-5 h-5" style={{ color: Pa.brand }} />
                <p className="mt-3 text-base font-semibold" style={{ color: Pa.text }}>{c.label}</p>
                <p className="mt-1 text-sm" style={{ color: Pa.body, lineHeight: 1.55 }}>{c.body}</p>
              </div>
            ))}
            <div className={`rounded-2xl p-5`}
              style={{ background: Pa.card, border: `1px solid ${Pa.border}` }}>
              <MapPin className="w-5 h-5" style={{ color: Pa.brand }} />
              <p className="mt-3 text-base font-semibold" style={{ color: Pa.text }}>Where to reach us</p>
              <p className="mt-1 text-sm" style={{ color: Pa.body, lineHeight: 1.55 }}>
                hello@stayops.com
                <br />Hours: weekdays, 9 AM – 6 PM ET
              </p>
            </div>
          </div>
        </div>
      </Section>
    </main>
  );
}

/* ============================================================
 *  DEMO
 * ============================================================ */
export function DemoPage({ flavor }: { flavor: Flavor }) {
  const P = getPalette(flavor);
  const Pa = altPaletteFor(P);
  return (
    <main style={{ background: P.pageBg, color: P.text }}>
      <PageHero palette={P}
        eyebrow="Book a demo"
        headline="See your hotel portfolio in one dashboard."
        subhead="We'll show how StayOps can help your ownership and regional operations teams see revenue, labour, rooms, tickets, audits, maintenance, reports, and team execution across every property."
      />

      <Section palette={P} alt>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-10">
          {/* Left: who/what */}
          <div className="flex flex-col gap-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em]" style={{ color: Pa.brand }}>Who it's for</p>
              <h3 className="mt-2" style={{
                fontSize: 'clamp(1.25rem, 2.5vw, 1.75rem)', lineHeight: 1.2,
                fontWeight: 600, color: Pa.text,
              }}>
                Hotel leaders managing more than one property.
              </h3>
              <ul className="mt-4 flex flex-col gap-1.5">
                {['Hotel owners','Managing directors','Regional managers','Regional directors','Corporate operations leaders','Independent hotel operators','Multi-brand hotel groups'].map((x) => (
                  <li key={x} className="text-sm flex items-center gap-2" style={{ color: Pa.body }}>
                    <span className="w-1 h-1 rounded-full" style={{ background: Pa.brand }} />
                    {x}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em]" style={{ color: Pa.brand }}>What we'll walk through</p>
              <h3 className="mt-2" style={{
                fontSize: 'clamp(1.25rem, 2.5vw, 1.75rem)', lineHeight: 1.2,
                fontWeight: 600, color: Pa.text,
              }}>
                30 minutes. End to end. Bring your real reports.
              </h3>
              <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5">
                {['Portfolio dashboard','Revenue and occupancy visibility','Labour and overtime tracking','Room status + OOO','Maintenance tickets','Audit tracking','Reports','Regional manager view','Owner view','Room-level drill-down','Mobile team execution'].map((x) => (
                  <li key={x} className="text-sm flex items-start gap-2" style={{ color: Pa.body }}>
                    <ArrowRight className="w-3 h-3 mt-1 flex-shrink-0" style={{ color: Pa.brand }} />
                    {x}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right: form */}
          <div className="rounded-2xl p-6 sm:p-8" style={{ background: Pa.card, border: `1px solid ${Pa.border}` }}>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] mb-4" style={{ color: Pa.brand }}>Request demo</p>
            <form className="flex flex-col gap-4">
              {[
                { label: 'Full name',          type: 'text',  name: 'name'    },
                { label: 'Company name',       type: 'text',  name: 'company' },
                { label: 'Role',               type: 'text',  name: 'role'    },
                { label: 'Email',              type: 'email', name: 'email'   },
                { label: 'Phone number',       type: 'tel',   name: 'phone'   },
                { label: 'Number of hotels',   type: 'number',name: 'hotels'  },
                { label: 'Hotel brands operated', type: 'text', name: 'brands' },
                { label: 'Biggest current challenge', type: 'text', name: 'challenge' },
                { label: 'Preferred demo time', type: 'text', name: 'when' },
              ].map((f) => (
                <label key={f.name} className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: Pa.muted }}>{f.label}</span>
                  <input type={f.type} name={f.name}
                    className="h-10 px-3 rounded-lg text-sm outline-none transition-colors focus:ring-2 focus:ring-[#ff385c]"
                    style={{ background: Pa.cardAlt, border: `1px solid ${Pa.border}`, color: Pa.text }} />
                </label>
              ))}
              <button type="button"
                className="h-11 mt-2 rounded-full text-sm font-semibold transition-all duration-200 hover:scale-[1.02] hover:shadow-lg"
                style={{ background: Pa.buttonPrimary.bg, color: Pa.buttonPrimary.text }}>
                Request demo
              </button>
              <p className="text-xs text-center" style={{ color: Pa.subtle }}>
                No commitment. We'll show how StayOps can work with your current portfolio.
              </p>
            </form>
          </div>
        </div>
      </Section>
    </main>
  );
}

/* ─── Mock resolver — picks the right mock by key ─────────────────────── */
function MockResolver({ mock }: { mock: MockKey }) {
  switch (mock) {
    case 'portfolio':       return <PortfolioMock />;
    case 'ownerKpi':        return <OwnerKpiMock />;
    case 'regional':        return <RegionalMock />;
    case 'report':          return <ReportMock />;
    case 'maintenanceApp':  return <MaintenanceAppMock />;
    case 'housekeepingApp': return <HousekeepingAppMock />;
    case 'employeeApp':     return <EmployeeAppMock />;
    case 'mobileTriptych':  return <MobileAppTriptych />;
  }
}
