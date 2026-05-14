/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { Flavor } from './_palette';
import { getPalette, fp, altPaletteFor } from './_palette';
import {
  Section, SectionHeader, CardGrid, Bullets, DrillPath, StrongLine,
  PrimaryButton, SecondaryButton,
} from './_ui';

/* ============================================================
 *  ACCOUNTING-READY OPERATIONS — Coming Soon / Wishlist page
 *  Future vision. Not selling a finished product. Validate interest.
 * ============================================================ */
export function AccountantPage({ flavor }: { flavor: Flavor }) {
  const P = getPalette(flavor);
  const Pa = altPaletteFor(P);

  const ctaJoin = { label: 'Join Wishlist', href: '#wishlist' };
  const ctaTalk = { label: 'Talk to Us',    href: fp(flavor, '/website/contact') };

  return (
    <main style={{ background: P.pageBg, color: P.text }}>
      {/* ── HERO ─────────────────────────────────────────────── */}
      <section style={{ background: P.pageBg }}>
        <div className="mx-auto max-w-5xl px-5 sm:px-8 pt-24 sm:pt-32 pb-12 sm:pb-16">
          <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em]"
            style={{ background: P.cardAlt, border: `1px solid ${P.border}`, color: P.brand }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: P.brand }} />
            Coming soon: accounting-ready operations
          </span>
          <h1 className="mt-5"
            style={{
              fontSize: 'clamp(2.25rem, 5vw, 4rem)', lineHeight: 1.05,
              letterSpacing: '-0.025em', maxWidth: '24ch', fontWeight: 600, color: P.text,
            }}>
            The cleanest books start at the moment work happens.
          </h1>
          <p className="mt-5 text-base sm:text-lg lg:text-xl"
            style={{ color: P.body, maxWidth: '60ch', lineHeight: 1.55 }}>
            StayOps is exploring an accounting-ready operations layer for hotel owners,
            regional managers, bookkeepers, accountants, controllers, and CPAs — helping
            capture purchase, repair, vendor, room, asset, and cost context while the work
            is being done.
          </p>
          <p className="mt-3 text-sm sm:text-base"
            style={{ color: P.subtle, maxWidth: '60ch' }}>
            Because 30 days later, nobody should have to guess what a transaction was for.
          </p>
          <div className="mt-8 flex items-center gap-3 flex-wrap">
            <PrimaryButton palette={P} {...ctaJoin} />
            <SecondaryButton palette={P} {...ctaTalk} />
          </div>
          <p className="mt-5 text-xs sm:text-sm" style={{ color: P.subtle, maxWidth: '60ch' }}>
            Join the wishlist to share what your hotel accounting and operations teams need.
            We&apos;ll use your input to shape this future feature.
          </p>
        </div>
      </section>

      {/* ── 1. PROBLEM ───────────────────────────────────────── */}
      <Section palette={P} alt>
        <SectionHeader palette={Pa}
          eyebrow="The problem"
          headline="Most accounting confusion starts before the accountant ever sees the books."
          body="At the property level, managers and supervisors make purchases, approve repairs, order supplies, pay vendors, and handle daily expenses. They know exactly what happened in the moment. But by month-end, the accounting team may only see a bank transaction, credit card charge, invoice, or receipt with missing context. That creates delays, back-and-forth questions, assumptions, and messy categorization."
        />
        <CardGrid palette={Pa} columns={2} icon="dot" items={[
          { title: 'The person who knows the context is not doing the books',
            body: 'A maintenance supervisor knows the part, room, asset, and reason for the repair. The bookkeeper may only see a charge later.' },
          { title: 'Receipts lose meaning over time',
            body: 'After 15–30 days, even the person who made the purchase may not remember the exact purpose.' },
          { title: 'Categorization becomes guesswork',
            body: 'Without context, expenses can be misclassified, delayed, or repeatedly questioned.' },
          { title: 'At portfolio level, the problem multiplies',
            body: 'One hotel is already busy. Across 10, 15, or 20 hotels, missing context becomes a serious reporting problem.' },
        ]} />
      </Section>

      {/* ── 2. CORE INSIGHT ──────────────────────────────────── */}
      <Section palette={P}>
        <SectionHeader palette={P}
          eyebrow="Core insight"
          headline="Operations already create the data accounting needs. We just need to capture it properly."
          body="When a GM places an order, a maintenance supervisor buys a part, or a manager approves a vendor repair, the most important accounting context is already known. StayOps will help capture that context while the action is happening — not weeks later."
        />
        <div className="mt-10">
          <p className="text-xs font-semibold uppercase tracking-[0.14em]" style={{ color: P.brand }}>
            What the team already knows in the moment
          </p>
          <Bullets palette={P} columns={2} items={[
            'What was purchased',
            'Why it was purchased',
            'Which room, area, or asset it belongs to',
            'Which vendor was used',
            'How much it cost',
            'Whether it was repair, replacement, restock, or emergency work',
            'Who approved it',
            'Which property it belongs to',
          ]} />
        </div>
        <StrongLine palette={P}>
          The bookkeeper should not have to guess. They should verify.
        </StrongLine>
      </Section>

      {/* ── 3. FUTURE WORKFLOW ───────────────────────────────── */}
      <Section palette={P} alt>
        <SectionHeader palette={Pa}
          eyebrow="Future workflow"
          headline="From operational action to accounting-ready context."
        />
        <DrillPath palette={Pa} path={[
          'Manager buys or approves',
          'StayOps captures context',
          'Tagged to property, room, asset, vendor, reason',
          'Bookkeeper verifies',
          'Cleaner reports',
        ]} />

        <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-4">
          {[
            {
              eyebrow: 'Example 1',
              title: 'Maintenance purchase',
              lead: 'A maintenance supervisor buys a part for Room 214. Instead of saving a receipt and explaining it weeks later, they can tag:',
              tags: ['Property', 'Room 214', 'Asset: HVAC / PTAC', 'Vendor', 'Cost', 'Reason: repair or replacement', 'Photo of receipt', 'Notes'],
              footer: 'That same data supports maintenance history, repair vs replacement decisions, and bookkeeping context.',
            },
            {
              eyebrow: 'Example 2',
              title: 'Housekeeping restock',
              lead: 'A housekeeping manager orders linens. They can tag:',
              tags: ['Property', 'Department: Housekeeping', 'Category: linen supplies', 'Vendor', 'Quantity', 'Cost', 'Reason: restock', 'Approval status'],
              footer: 'Now accounting knows what the transaction was for without chasing the team later.',
            },
            {
              eyebrow: 'Example 3',
              title: 'Vendor repair',
              lead: 'A vendor repairs a pool pump. The repair can be connected to:',
              tags: ['Property', 'Area: Pool', 'Asset: pool pump', 'Vendor', 'Invoice', 'Cost', 'Repair notes', 'Before/after photos'],
              footer: 'Now the same event supports operations, asset history, vendor tracking, and accounting context.',
            },
          ].map((ex) => (
            <div key={ex.title} className={`rounded-2xl p-5 flex flex-col ${Pa.hoverLift}`}
              style={{ background: Pa.card, border: `1px solid ${Pa.border}` }}>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em]" style={{ color: Pa.brand }}>
                {ex.eyebrow}
              </p>
              <p className="mt-2 text-base font-semibold" style={{ color: Pa.text }}>{ex.title}</p>
              <p className="mt-2 text-sm" style={{ color: Pa.body, lineHeight: 1.55 }}>{ex.lead}</p>
              <ul className="mt-3 flex flex-wrap gap-1.5">
                {ex.tags.map((t) => (
                  <li key={t}
                    className="text-[11px] px-2 py-0.5 rounded-full"
                    style={{ background: Pa.cardAlt, color: Pa.muted, border: `1px solid ${Pa.borderSoft}` }}>
                    {t}
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-xs" style={{ color: Pa.subtle, lineHeight: 1.55 }}>{ex.footer}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ── 4. WHY IT MATTERS FOR OWNERS ─────────────────────── */}
      <Section palette={P}>
        <SectionHeader palette={P}
          eyebrow="For owners"
          headline="This is not just for taxes. This is hotel health."
          body="Accounting is not only about filing year-end taxes. It helps owners understand how healthy the hotel business is. When operational spend is captured properly, owners can see where money is going, which properties are bleeding, which rooms are costing too much, and which assets should be replaced instead of repaired again."
        />
        <Bullets palette={P} columns={2} items={[
          'Cleaner P&L visibility',
          'Faster monthly close support',
          'Better expense categorization',
          'Less missing context',
          'Clearer repair and replacement history',
          'Property-level spend visibility',
          'Room-level cost visibility',
          'Better vendor accountability',
          'More accurate owner reports',
        ]} />
        <StrongLine palette={P}>
          Accounting tells the result. Operations explain why the result happened.
        </StrongLine>
      </Section>

      {/* ── 5. WHY IT MATTERS AT PORTFOLIO LEVEL ─────────────── */}
      <Section palette={P} alt>
        <SectionHeader palette={Pa}
          eyebrow="At portfolio level"
          headline="One hotel is difficult. A portfolio makes it a nightmare."
          body="For a single hotel, missing transaction context creates extra work. For a hotel group, that problem multiplies across properties, managers, vendors, cards, departments, and reports. StayOps will help ownership and corporate teams create a cleaner flow from property-level action to portfolio-level financial visibility."
        />
        <Bullets palette={Pa} columns={2} items={[
          'Uncategorized transactions',
          'Repeated questions between accounting and property teams',
          'Missing receipts or unclear invoices',
          'Expenses assigned to the wrong department or property',
          'Weak repair vs replacement visibility',
          'Delayed owner reports',
          'Inconsistent categorization across hotels',
          'Poor visibility into vendor and asset spend',
        ]} />
      </Section>

      {/* ── 6. COMING SOON FEATURES ──────────────────────────── */}
      <Section palette={P}>
        <SectionHeader palette={P}
          eyebrow="Coming soon"
          headline="A future layer for cleaner hotel financial operations."
          body="StayOps is exploring tools that connect daily hotel operations with the context accounting teams need."
        />
        <CardGrid palette={P} columns={4} icon="check" items={[
          { title: 'Purchase Context Capture',     body: 'Let managers tag purchases by property, department, room, asset, vendor, reason, and cost.' },
          { title: 'Receipt and Invoice Capture',  body: 'Attach receipts, invoices, notes, and photos to the operational event.' },
          { title: 'Repair vs Replacement Tracking', body: 'Connect costs to specific assets and rooms so owners can see when something keeps failing.' },
          { title: 'Vendor Spend Visibility',      body: 'Track spend by vendor, property, department, asset, and repair category.' },
          { title: 'Reconciliation Support',       body: 'Help accounting teams compare bank activity, card charges, invoices, reports, and operational context.' },
          { title: 'Accounting Categories',        body: 'Prepare cleaner categories for bookkeeping review without claiming to replace accounting software.' },
          { title: 'Owner Financial Summaries',    body: 'Create summaries that connect revenue, labour, expenses, repairs, assets, and property performance.' },
          { title: 'Export Support',               body: 'Prepare cleaner exports for bookkeepers, accountants, controllers, CPAs, or existing accounting systems.' },
        ]} />
      </Section>

      {/* ── 7. WHO THIS IS FOR ───────────────────────────────── */}
      <Section palette={P} alt>
        <SectionHeader palette={Pa}
          eyebrow="Who this is for"
          headline="Built for the people between operations and accounting."
        />
        <CardGrid palette={Pa} columns={4} icon="dot" items={[
          { title: 'Owners',                   body: 'See where money is going and why property performance is changing.' },
          { title: 'Regional Managers',        body: 'Connect operational issues like repairs, labour, rooms, and audits to financial impact.' },
          { title: 'General Managers',         body: 'Approve and explain purchases closer to when they happen.' },
          { title: 'Maintenance Supervisors',  body: 'Tag repairs, parts, vendors, rooms, and assets at the source.' },
          { title: 'Housekeeping Managers',    body: 'Track supply orders, linen purchases, restocks, and department spend.' },
          { title: 'Bookkeepers',              body: 'Spend less time guessing and more time verifying clean context.' },
          { title: 'Accountants / Controllers',body: 'Review cleaner financial data, reporting flows, and controls across properties.' },
          { title: 'CPAs',                     body: 'Receive cleaner reports and summaries for review, tax preparation, and advisory work.' },
        ]} />
      </Section>

      {/* ── 8. WISHLIST FORM ─────────────────────────────────── */}
      <Section palette={P} id="wishlist">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em]" style={{ color: P.brand }}>
              Wishlist
            </p>
            <h2 className="mt-3" style={{
              fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)', lineHeight: 1.12,
              letterSpacing: '-0.02em', fontWeight: 600, maxWidth: '22ch', color: P.text,
            }}>
              Join the Accounting-Ready Operations Wishlist
            </h2>
            <p className="mt-5 text-base" style={{ color: P.body, lineHeight: 1.65, maxWidth: '52ch' }}>
              Tell us how your hotel group handles purchases, repairs, receipts, reconciliation,
              bookkeeping, and owner reports. Your input will help shape this future StayOps feature.
            </p>
          </div>

          <form className="rounded-2xl p-6 sm:p-8 flex flex-col gap-5"
            style={{ background: P.card, border: `1px solid ${P.border}` }}>

            {/* Required fields */}
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em]" style={{ color: P.brand }}>
              Required
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput palette={P} label="Full name"     name="name"    required />
              <FormInput palette={P} label="Work email"    name="email"   type="email" required />
              <FormInput palette={P} label="Phone number"  name="phone"   type="tel"   required />
              <FormInput palette={P} label="Company name"  name="company" required />
              <FormSelect palette={P} label="Role" name="role" required options={[
                'Hotel Owner', 'Managing Director', 'Regional Manager', 'General Manager',
                'Maintenance Lead', 'Housekeeping Lead', 'Bookkeeper', 'Accountant',
                'Controller', 'CPA', 'Corporate / Admin', 'Other',
              ]} />
              <FormSelect palette={P} label="Number of hotels" name="hotels" required options={[
                '1 hotel', '2–5 hotels', '6–10 hotels', '11–20 hotels', '21+ hotels',
              ]} />
            </div>

            {/* Optional fields */}
            <div className="mt-2 pt-4" style={{ borderTop: `1px solid ${P.border}` }}>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em]" style={{ color: P.muted }}>
                Optional
              </p>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormInput palette={P} label="Current accounting software or system"
                  name="accounting_software"
                  placeholder="e.g. QuickBooks, HIA, M3, Sage, NetSuite, Excel, other" />
                <FormInput palette={P} label="Current PMS / hotel systems" name="pms"
                  placeholder="e.g. OnQ, MGS, Opera, Choice Advantage" />
                <FormInput palette={P}
                  label="Do you handle bookkeeping, reconciliation, accounting, tax prep, or owner reporting?"
                  name="responsibilities" />
                <FormInput palette={P}
                  label="Biggest accounting or reporting challenge"
                  name="challenge"
                  placeholder="e.g. reconciliation, unclear transactions, missing receipts, owner reports, repair cost tracking, too many spreadsheets" />
              </div>
              <div className="mt-4">
                <FormInput palette={P}
                  label="Would you like to join a feedback call?"
                  name="feedback_call"
                  placeholder="Yes / No / preferred time" />
              </div>
            </div>

            {/* Checkbox */}
            <label className="flex items-start gap-3 mt-2 text-sm cursor-pointer"
              style={{ color: P.body }}>
              <input type="checkbox" name="early_demo" className="mt-1"
                style={{ accentColor: P.brand }} />
              <span>I&apos;m interested in giving feedback or seeing an early demo.</span>
            </label>

            {/* Submit */}
            <button type="button"
              className="h-11 mt-2 rounded-full text-sm font-semibold transition-all duration-200 hover:scale-[1.02] hover:shadow-lg inline-flex items-center justify-center gap-2"
              style={{ background: P.buttonPrimary.bg, color: P.buttonPrimary.text }}>
              Join Wishlist <ArrowRight className="w-4 h-4" />
            </button>
            <p className="text-xs text-center" style={{ color: P.subtle }}>
              No commitment. We&apos;ll reach out as the accounting-ready operations layer
              develops and early feedback opportunities open.
            </p>
          </form>
        </div>
      </Section>

      {/* ── 9. FINAL CTA ─────────────────────────────────────── */}
      <Section palette={P} alt>
        <div className="text-center max-w-3xl mx-auto">
          <h2 style={{
            fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)', lineHeight: 1.12,
            letterSpacing: '-0.02em', fontWeight: 600, color: Pa.text,
          }}>
            Help shape the future of hotel accounting-ready operations.
          </h2>
          <p className="mt-5 text-base sm:text-lg mx-auto"
            style={{ color: Pa.body, lineHeight: 1.65, maxWidth: '52ch' }}>
            If your hotel group struggles with unclear transactions, missing context, repair
            cost tracking, reconciliation, owner reports, or month-end back-and-forth, join the
            wishlist and tell us what would make your workflow easier.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3 flex-wrap">
            <PrimaryButton palette={Pa} {...ctaJoin} />
            <SecondaryButton palette={Pa} {...ctaTalk} />
          </div>
        </div>
      </Section>

      {/* ── 10. TRUST / LEGAL CLARITY ────────────────────────── */}
      <section style={{ background: P.pageBg, borderTop: `1px solid ${P.border}` }}>
        <div className="mx-auto max-w-4xl px-5 sm:px-8 py-12 sm:py-16 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.14em]" style={{ color: P.muted }}>
            Trust note
          </p>
          <h3 className="mt-3" style={{
            fontSize: 'clamp(1.25rem, 2.5vw, 1.75rem)', lineHeight: 1.2,
            fontWeight: 600, color: P.text, maxWidth: '36ch', margin: '0.75rem auto 0',
          }}>
            Built to support accounting teams, not replace them.
          </h3>
          <p className="mt-4 text-sm sm:text-base mx-auto"
            style={{ color: P.body, lineHeight: 1.65, maxWidth: '60ch' }}>
            StayOps is not a CPA firm and does not provide tax advice. The goal is to help
            hotel teams capture better operational and financial context so bookkeepers,
            accountants, controllers, CPAs, owners, and managers can work with cleaner
            information.
          </p>
        </div>
      </section>
    </main>
  );
}

/* ─── Form helpers ─────────────────────────────────────────── */

function FormInput({
  palette: P, label, name, type = 'text', required, placeholder,
}: {
  palette: ReturnType<typeof getPalette>;
  label: string; name: string; type?: string; required?: boolean; placeholder?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: P.muted }}>
        {label}{required && <span style={{ color: P.brand }}> *</span>}
      </span>
      <input type={type} name={name} placeholder={placeholder}
        className="h-10 px-3 rounded-lg text-sm outline-none transition-colors focus:ring-2 focus:ring-[#ff385c]"
        style={{ background: P.cardAlt, border: `1px solid ${P.border}`, color: P.text }} />
    </label>
  );
}

function FormSelect({
  palette: P, label, name, options, required,
}: {
  palette: ReturnType<typeof getPalette>;
  label: string; name: string; options: string[]; required?: boolean;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: P.muted }}>
        {label}{required && <span style={{ color: P.brand }}> *</span>}
      </span>
      <select name={name} defaultValue=""
        className="h-10 px-3 rounded-lg text-sm outline-none transition-colors focus:ring-2 focus:ring-[#ff385c]"
        style={{ background: P.cardAlt, border: `1px solid ${P.border}`, color: P.text }}>
        <option value="" disabled>Select…</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  );
}

/* Avoid unused-import lint */
void Link;
