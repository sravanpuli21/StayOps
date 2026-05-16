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
  MdDashboardIpadMock, MaintenanceSpendMock, FfeAuditMock, RoomDrillMock,
  LabourMiniMock, TicketsMiniMock, AssetMiniMock,
} from './_mocks';
import { CoreValueScroll } from './_corevalue-scroll';
import {
  HERO, PROBLEM, CORE_VALUE, OWNER_LENS, REGIONAL_LENS, PRODUCT_GLIMPSE,
  DRILL_DOWN, REPORTS, AI_ALERTS, HOW_IT_WORKS, FINAL_CTA,
  ROOM_DEEP_DIVE, AUDITS_INSPECTIONS,
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

      {/* Core Value — pinned scrollytelling section (no Section wrapper because
          overflow-hidden on Section breaks position: sticky) */}
      <section style={{ background: P.sectionAlt, color: Pa.text }}>
        {/* Mobile-only intro — desktop renders intro inside the pinned area */}
        <div className="lg:hidden mx-auto max-w-6xl px-5 sm:px-8 pt-20 sm:pt-28">
          <SectionHeader palette={Pa}
            eyebrow="What StayOps does"
            headline={CORE_VALUE.headline}
            body={CORE_VALUE.body}
          />
        </div>
        <CoreValueScroll
          palette={Pa}
          intro={{ eyebrow: 'What StayOps does', headline: CORE_VALUE.headline, body: CORE_VALUE.body }}
          cards={CORE_VALUE.cards}
        />
        <div className="lg:hidden pb-20 sm:pb-28" />
      </section>

      {/* Brand integrations — horizontal logo marquee */}
      <BrandLogosSection palette={P} flavor={flavor} />

      {/* Room deep-dive — full-width iPad mock (alt cream bg) */}
      <Section palette={P} alt>
        <CenteredHeader palette={Pa}
          eyebrow={ROOM_DEEP_DIVE.eyebrow}
          headline={
            <>
              Every hotel. Every room.{'\n'}Every{' '}
              <span style={{
                background: Pa.brand,
                color: '#ffffff',
                padding: '0.02em 0.18em',
                borderRadius: 4,
              }}>dollar</span>{' '}spent.
            </>
          }
          body={ROOM_DEEP_DIVE.body}
        />
        <div className="mt-12">
          <RoomDrillMock />
        </div>
        <FeatureChips palette={Pa} items={ROOM_DEEP_DIVE.bullets} />
        <div className="mt-8 flex justify-center">
          <PrimaryButton palette={Pa} {...cta(flavor, ROOM_DEEP_DIVE.cta)} />
        </div>
      </Section>

      {/* Audits & inspections — full-width iPad mock (regular dark bg) */}
      <Section palette={P}>
        <CenteredHeader palette={P} {...AUDITS_INSPECTIONS} />
        <div className="mt-12">
          <FfeAuditMock />
        </div>
        <FeatureChips palette={P} items={AUDITS_INSPECTIONS.bullets} />
        <div className="mt-8 flex justify-center">
          <PrimaryButton palette={P} {...cta(flavor, AUDITS_INSPECTIONS.cta)} />
        </div>
      </Section>



      {/* Owner Lens — full-width iPad mock with MD home dashboard */}
      <Section palette={P} alt>
        <CenteredHeader palette={Pa}
          eyebrow={OWNER_LENS.eyebrow}
          headline={OWNER_LENS.headline}
          body={OWNER_LENS.body}
        />
        <div className="mt-12">
          <MdDashboardIpadMock />
        </div>
        <FeatureChips palette={Pa} items={OWNER_LENS.bullets} />
        <div className="mt-8 flex justify-center">
          <PrimaryButton palette={Pa} {...cta(flavor, OWNER_LENS.cta)} />
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

      {/* Reports */}
      <Section palette={P}>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-10 items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em]" style={{ color: P.brand }}>
              <Sparkles className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" /> Reports · AI-built
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


      {/* How It Works */}
      <Section palette={P}>
        <CenteredHeader palette={P}
          eyebrow="How it works"
          headline={HOW_IT_WORKS.headline}
          body="Five steps. No replatforming, no migrations. StayOps fits the way ownership groups already run."
        />
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

      {/* Product glimpses — one section per module. Hero modules use the
          centered iPad pattern, the rest use compact 2-col side-by-side. */}

      {/* 1. Portfolio Dashboard — full iPad */}
      <Section palette={P} alt>
        <CenteredHeader palette={Pa}
          eyebrow={PRODUCT_SUBPAGES['portfolio-dashboard'].eyebrow}
          headline={PRODUCT_SUBPAGES['portfolio-dashboard'].label}
          body={PRODUCT_SUBPAGES['portfolio-dashboard'].subhead}
        />
        <div className="mt-12">
          <MdDashboardIpadMock />
        </div>
        <FeatureChips palette={Pa} items={PRODUCT_SUBPAGES['portfolio-dashboard'].whatYouSee} />
        <div className="mt-8 flex justify-center">
          <PrimaryButton palette={Pa}
            label="Explore Portfolio Dashboard"
            href={fp(flavor, '/products/portfolio-dashboard')}
          />
        </div>
      </Section>

      {/* 2. Revenue & Occupancy — compact 2-col */}
      <Section palette={P}>
        <ProductGlimpse2Col palette={P} flavor={flavor}
          slug="revenue-occupancy" mockOnRight
          mock={<OwnerKpiMock />} />
      </Section>

      {/* 3. Labour Control — compact 2-col, mock on left */}
      <Section palette={P} alt>
        <ProductGlimpse2Col palette={Pa} flavor={flavor}
          slug="labour-control" mockOnRight={false}
          mock={<LabourMiniMock />} />
      </Section>

      {/* 4. Operations — full iPad */}
      <Section palette={P}>
        <CenteredHeader palette={P}
          eyebrow={PRODUCT_SUBPAGES['operations'].eyebrow}
          headline={PRODUCT_SUBPAGES['operations'].label}
          body={PRODUCT_SUBPAGES['operations'].subhead}
        />
        <div className="mt-12">
          <RoomDrillMock />
        </div>
        <FeatureChips palette={P} items={PRODUCT_SUBPAGES['operations'].whatYouSee} />
        <div className="mt-8 flex justify-center">
          <PrimaryButton palette={P}
            label="Explore Operations"
            href={fp(flavor, '/products/operations')}
          />
        </div>
      </Section>

      {/* 5. Audits — full iPad */}
      <Section palette={P} alt>
        <CenteredHeader palette={Pa}
          eyebrow={PRODUCT_SUBPAGES['audits'].eyebrow}
          headline={PRODUCT_SUBPAGES['audits'].label}
          body={PRODUCT_SUBPAGES['audits'].subhead}
        />
        <div className="mt-12">
          <FfeAuditMock />
        </div>
        <FeatureChips palette={Pa} items={PRODUCT_SUBPAGES['audits'].whatYouSee} />
        <div className="mt-8 flex justify-center">
          <PrimaryButton palette={Pa}
            label="Explore Audits"
            href={fp(flavor, '/products/audits')}
          />
        </div>
      </Section>

      {/* 6. Maintenance & Tickets — compact 2-col, mock on right */}
      <Section palette={P}>
        <ProductGlimpse2Col palette={P} flavor={flavor}
          slug="maintenance-tickets" mockOnRight
          mock={<TicketsMiniMock />} />
      </Section>

      {/* 7. Assets & Room History — compact 2-col, mock on left */}
      <Section palette={P} alt>
        <ProductGlimpse2Col palette={Pa} flavor={flavor}
          slug="assets-room-history" mockOnRight={false}
          mock={<AssetMiniMock />} />
      </Section>

      {/* 8. Reports — full iPad */}
      <Section palette={P}>
        <CenteredHeader palette={P}
          eyebrow={PRODUCT_SUBPAGES['reports'].eyebrow}
          headline={PRODUCT_SUBPAGES['reports'].label}
          body={PRODUCT_SUBPAGES['reports'].subhead}
        />
        <div className="mt-12">
          <ReportMock />
        </div>
        <FeatureChips palette={P} items={PRODUCT_SUBPAGES['reports'].whatYouSee} />
        <div className="mt-8 flex justify-center">
          <PrimaryButton palette={P}
            label="Explore Reports"
            href={fp(flavor, '/products/reports')}
          />
        </div>
      </Section>

      {/* 9. Mobile Team App — full width triptych */}
      <Section palette={P} alt>
        <CenteredHeader palette={Pa}
          eyebrow={PRODUCT_SUBPAGES['mobile-team-app'].eyebrow}
          headline={PRODUCT_SUBPAGES['mobile-team-app'].label}
          body={PRODUCT_SUBPAGES['mobile-team-app'].subhead}
        />
        <div className="mt-12">
          <MobileAppTriptych />
        </div>
        <FeatureChips palette={Pa} items={PRODUCT_SUBPAGES['mobile-team-app'].whatYouSee} />
        <div className="mt-8 flex justify-center">
          <PrimaryButton palette={Pa}
            label="Explore Mobile Team App"
            href={fp(flavor, '/products/mobile-team-app')}
          />
        </div>
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
        eyebrow="Company"
        headline="Building better visibility for hotel ownership groups."
        subhead="StayOps is built for the hotel leaders who manage multiple properties, brands, teams, reports, and daily issues — and need one clear place to see what is happening."
        primaryCta={{ label: 'Contact us', href: fp(flavor, '/website/contact') }}
        secondaryCta={{ label: 'About StayOps', href: fp(flavor, '/website/company/about') }}
      />

      {/* Mission / belief */}
      <Section palette={P} alt>
        <SectionHeader palette={Pa}
          eyebrow="What we believe"
          headline="Operational data — not month-end reports — is the fastest path to understanding hotel health."
          body="Hotel groups today run properties across different brands, cities, teams, and systems. But ownership still needs one clear view of how the business is performing. We are building StayOps to make that view possible — without replacing the tools, people, or systems already in place."
        />
        <StrongLine palette={Pa}>
          Ownership should not have to call ten managers to know what is happening across the business.
        </StrongLine>
      </Section>

      {/* Principles */}
      <Section palette={P}>
        <SectionHeader palette={P}
          eyebrow="Principles"
          headline="Four ideas we keep coming back to."
        />
        <CardGrid palette={P} columns={4} icon="check" items={[
          { title: 'Calm control',
            body: 'Hotel leadership should not feel like an inbox. The right view at the right moment, not more noise.' },
          { title: 'Every brand. One dashboard.',
            body: 'Marriott, Hilton, IHG, Choice, Hyatt, Wyndham, independents — one operational layer above them all.' },
          { title: 'Operations explain the numbers.',
            body: 'When the P&L moves, the operational record explains why. Owners should never have to guess.' },
          { title: 'Built for operators.',
            body: 'Not an AI demo. Not a surveillance tool. A working dashboard for the people who run hotels.' },
        ]} />
      </Section>

      {/* What StayOps is not */}
      <Section palette={P} alt>
        <SectionHeader palette={Pa}
          eyebrow="To be clear"
          headline="What StayOps is not."
          body="We sit alongside the systems hotels already use, not on top of them. The clarity comes from connecting operational signals — not from replacing what works."
        />
        <CardGrid palette={Pa} columns={3} icon="dot" items={[
          { title: 'Not a PMS',
            body: 'OnQ, MGS, Opera, Choice Advantage — keep what you have. StayOps reads the operational signals that flow out of them.' },
          { title: 'Not accounting software',
            body: 'QuickBooks, M3, Sage, NetSuite, Excel — your books still live where they live. We capture operational context for the people doing the work.' },
          { title: 'Not a surveillance tool',
            body: 'Property teams should have proof of work, not blame for missed updates. StayOps respects the people on the floor.' },
        ]} />
      </Section>

      {/* Three doors */}
      <Section palette={P}>
        <SectionHeader palette={P}
          eyebrow="Find what you need"
          headline="Three quick doors into StayOps."
        />
        <CardGrid palette={P} columns={3} linkable items={[
          { title: 'About Us',    body: 'Learn why StayOps is being built for hotel owners and regional operations teams.', href: fp(flavor, '/website/company/about') },
          { title: 'Contact',     body: 'Have questions or want to see the product? Talk to the StayOps team.',            href: fp(flavor, '/website/contact') },
          { title: 'Book a Demo', body: 'See how StayOps can work for your current hotel portfolio and workflows.',         href: fp(flavor, '/website/contact') },
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
        eyebrow="Our story"
        headline="It started with a simple question."
        subhead="How is it possible that a hotel ownership group can run multiple properties across different brands — and still have to call ten managers to know what is happening across the business?"
        primaryCta={{ label: 'Book a demo', href: fp(flavor, '/website/contact') }}
        secondaryCta={{ label: 'Why StayOps', href: fp(flavor, '/why') }}
      />

      {/* What we saw */}
      <Section palette={P} alt>
        <SectionHeader palette={Pa}
          eyebrow="What we saw"
          headline="Hotels are run by people. Portfolios are run on guesswork."
          body="Hotel groups today operate Marriott, Hilton, IHG, Choice, Hyatt, Wyndham, and independent properties at the same time. Each property has its own PMS, its own payroll, its own accounting workflow, its own reports, its own group chats. The data exists — but it does not roll up. So ownership ends up depending on month-end P&Ls, fragmented updates, and gut feel."
        />
        <StrongLine palette={Pa}>
          The bigger the portfolio, the further leadership drifts from what is actually happening.
        </StrongLine>
      </Section>

      {/* What we kept hearing */}
      <Section palette={P}>
        <SectionHeader palette={P}
          eyebrow="What we kept hearing"
          headline="Owners do not need another report. They need clarity."
          body="The pattern showed up the same way across every conversation with hotel ownership and regional operations teams."
        />
        <CardGrid palette={P} columns={2} icon="dot" items={[
          { title: 'Numbers come too late.',
            body: 'By the time the monthly P&L lands, the month is already over and the questions cannot be answered.' },
          { title: 'Problems show up through guests.',
            body: 'Owners often hear about issues from guest complaints, brand calls, or escalations — not from their own systems.' },
          { title: 'GMs are great. The view is not.',
            body: 'Property teams know what is happening. The challenge is connecting that knowledge to leadership in real time.' },
          { title: 'Hotels forget.',
            body: 'A repair, an audit, a fix, a follow-up — completed and then disappeared. No history, no proof, no pattern.' },
        ]} />
      </Section>

      {/* What we're building */}
      <Section palette={P} alt>
        <SectionHeader palette={Pa}
          eyebrow="What we are building"
          headline="One operational layer for the hotel group — not just the property."
          body="StayOps is the dashboard for the people responsible for performance across multiple hotels. It connects revenue, occupancy, labour, rooms, tickets, audits, maintenance, assets, reports, and team execution — across brands, across systems, across properties — into one clear place."
        />
      </Section>

      {/* Where we are */}
      <Section palette={P}>
        <SectionHeader palette={P}
          eyebrow="Where we are"
          headline="Early. Honest. Building with operators in the room."
          body="We are early. We are building StayOps with hotel owners, regional managers, GMs, and property teams — listening, learning, and shipping carefully. Some parts are live. Others are on the roadmap. We will always tell you which is which."
        />
        <Bullets palette={P} columns={2} items={[
          'Building alongside hotel ownership and regional operations teams',
          'Talking to GMs, supervisors, bookkeepers, and property staff',
          'Connecting to the systems hotels already use',
          'Shipping in small, useful steps',
          'Learning what every brand actually exports',
          'Refusing to fake what we have not built yet',
        ]} />
      </Section>

      {/* Where this is going */}
      <Section palette={P} alt>
        <SectionHeader palette={Pa}
          eyebrow="Where this is going"
          headline="A control room for hotel ownership."
          body="A future where ownership groups can see their portfolio in real time — without waiting for the monthly close, without calling ten managers, without rebuilding the same spreadsheet every morning. Operations that explain the numbers. Property teams that have proof of work. Owners that act on signal, not noise."
        />
        <StrongLine palette={Pa}>
          Every hotel. Every brand. One dashboard.
        </StrongLine>
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

/* ─── Centered section header (eyebrow + headline + body, all centered) ─── */
function CenteredHeader({
  palette: P, eyebrow, headline, body,
}: { palette: Palette; eyebrow: string; headline: React.ReactNode; body: string }) {
  return (
    <div className="text-center max-w-3xl mx-auto">
      <p className="text-xs font-semibold uppercase tracking-[0.14em]" style={{ color: P.brand }}>
        {eyebrow}
      </p>
      <h2 className="mt-3 mx-auto whitespace-normal lg:whitespace-pre-line"
        style={{
          fontSize: 'clamp(1.75rem, 3.4vw, 2.75rem)',
          lineHeight: 1.12,
          letterSpacing: '-0.02em',
          fontWeight: 600,
          color: P.text,
          maxWidth: '24ch',
        }}>
        {headline}
      </h2>
      <p className="mt-4 mx-auto text-base sm:text-lg whitespace-normal lg:whitespace-pre-line"
        style={{ color: P.body, lineHeight: 1.6, maxWidth: '60ch' }}>
        {body}
      </p>
    </div>
  );
}

/* ─── Feature chip row — bullets rendered as a compact horizontal pill row ─── */
function FeatureChips({
  palette: P, items,
}: { palette: Palette; items: readonly string[] }) {
  return (
    <ul className="mt-10 flex flex-wrap items-center justify-center gap-2">
      {items.map((b) => (
        <li key={b}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm"
          style={{
            background: 'transparent',
            border: `1px solid ${P.border}`,
            color: P.body,
          }}>
          <span className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: P.brand }} />
          {b}
        </li>
      ))}
    </ul>
  );
}

/* ─── Compact 2-col product glimpse: text + bullets + CTA on one side, mock on the other ─── */
function ProductGlimpse2Col({
  palette: P, flavor, slug, mock, mockOnRight = true,
}: {
  palette: Palette;
  flavor: Flavor;
  slug: string;
  mock: React.ReactNode;
  mockOnRight?: boolean;
}) {
  const sub = PRODUCT_SUBPAGES[slug];
  if (!sub) return null;
  const text = (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.14em]" style={{ color: P.brand }}>
        {sub.label}
      </p>
      <h2 className="mt-3"
        style={{
          fontSize: 'clamp(1.5rem, 2.8vw, 2.25rem)',
          lineHeight: 1.15,
          letterSpacing: '-0.02em',
          fontWeight: 600,
          color: P.text,
          maxWidth: '22ch',
        }}>
        {sub.headline}
      </h2>
      <p className="mt-4 text-base" style={{ color: P.body, lineHeight: 1.6, maxWidth: '50ch' }}>
        {sub.subhead}
      </p>
      <Bullets palette={P} items={sub.whatYouSee.slice(0, 6)} />
      <div className="mt-6">
        <PrimaryButton palette={P}
          label={`Explore ${sub.label}`}
          href={fp(flavor, `/products/${sub.slug}`)}
        />
      </div>
    </div>
  );
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-10 items-center">
      {mockOnRight ? (
        <>
          {text}
          <div>{mock}</div>
        </>
      ) : (
        <>
          <div>{mock}</div>
          {text}
        </>
      )}
    </div>
  );
}

/* ─── Brand logos — infinite horizontal marquee ─────────────────────────── */
const BRAND_LOGOS = [
  { name: 'Marriott',     src: '/brand-logos/logo-marriott.webp'      },
  { name: 'Hilton',       src: '/brand-logos/logo-hilton.webp'        },
  { name: 'IHG',          src: '/brand-logos/logo-ihg.webp'           },
  { name: 'Hyatt',        src: '/brand-logos/logo-hyatt.webp'         },
  { name: 'Choice',       src: '/brand-logos/logo-choice-hotels.webp' },
  { name: 'Wyndham',      src: '/brand-logos/logo-wyndham.webp'       },
  { name: 'Best Western', src: '/brand-logos/logo-best-western.webp'  },
];

function BrandLogosSection({ palette: P, flavor }: { palette: Palette; flavor: Flavor }) {
  const isDark = P.flavor === 'night';
  // Doubled list so the marquee loop is seamless
  const loopList = [...BRAND_LOGOS, ...BRAND_LOGOS];
  return (
    <section style={{ background: P.pageBg, color: P.text }}>
      <div className="mx-auto max-w-6xl px-5 sm:px-8 pt-20 sm:pt-28 pb-10 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.14em]" style={{ color: P.brand }}>
          Integrations
        </p>
        <h2 className="mt-3 mx-auto"
          style={{
            fontSize: 'clamp(1.75rem, 3.4vw, 2.75rem)',
            lineHeight: 1.12,
            letterSpacing: '-0.02em',
            fontWeight: 600,
            color: P.text,
            maxWidth: '24ch',
          }}>
          Works with the hotel brands you already operate.
        </h2>
        <p className="mt-4 mx-auto text-base sm:text-lg"
          style={{ color: P.body, lineHeight: 1.6, maxWidth: '60ch' }}>
          No replacement, no migration.
        </p>
        <div className="mt-7 flex justify-center">
          <PrimaryButton palette={P} label="Integrate today" href={fp(flavor, '/website/contact')} />
        </div>
      </div>

      {/* Marquee strip */}
      <div className="relative pb-20 sm:pb-28">
        {/* edge fades */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-20 sm:bottom-28 w-16 sm:w-24 z-10"
          style={{
            background: `linear-gradient(to right, ${P.pageBg}, ${P.pageBg}00)`,
          }} />
        <div className="pointer-events-none absolute right-0 top-0 bottom-20 sm:bottom-28 w-16 sm:w-24 z-10"
          style={{
            background: `linear-gradient(to left, ${P.pageBg}, ${P.pageBg}00)`,
          }} />

        <div className="overflow-hidden">
          <div className="so-logo-marquee flex items-center w-max">
            {loopList.map((logo, i) => (
              <div key={`${logo.name}-${i}`}
                className="flex-shrink-0 mx-3 sm:mx-4 flex items-center justify-center rounded-2xl"
                style={{
                  width: 200,
                  height: 96,
                  background: isDark ? '#ffffff' : '#ffffff',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : P.border}`,
                  boxShadow: isDark
                    ? '0 10px 30px -15px rgba(0,0,0,0.5)'
                    : '0 6px 24px -12px rgba(0,0,0,0.08)',
                }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={logo.src} alt={logo.name}
                  className="max-h-12 max-w-[140px] object-contain"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
