import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight, ArrowUpRight, Boxes, Brain, CheckCheck, DoorOpen,
  LayoutDashboard, ShieldCheck, Wrench,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Product',
  description:
    'Everything hotel operations need, connected in one control room. Rooms, maintenance, audits, inventory, labour, owner dashboards, and AI operational memory.',
};

export default function ProductPage() {
  return (
    <main>
      <Hero />
      <Philosophy />
      <ModuleSection
        pill="Room readiness"
        headline="Know which rooms are ready, delayed, blocked, or out of order."
        body="StayOps gives housekeeping, front desk, maintenance, and managers one shared view of room status so teams can move faster and avoid confusion."
        features={[
          'Clean / dirty / inspected / ready status',
          'Out-of-order room tracking',
          'Maintenance blockers',
          'Priority rooms',
          'Late checkout visibility',
          'Early arrival priority',
          'Front desk visibility',
          'Room readiness history',
        ]}
        ownerBenefit="See how room readiness affects availability and revenue."
        teamBenefit="Give housekeeping and front desk a clear shared view."
        icon={<DoorOpen className="w-5 h-5" />}
        variant="blue"
      />
      <ModuleSection
        pill="Maintenance"
        headline="Fix issues faster with clear tickets, photos, priority, and proof."
        body="Maintenance issues should not get lost in calls, texts, or verbal handovers. StayOps helps teams capture what is broken, assign the right person, and record what was fixed."
        features={[
          'Photo-based issue reporting',
          'Priority levels',
          'Room or asset tagging',
          'Assigned technician',
          'Notes and updates',
          'Resolution photos',
          'Repair history',
          'Repeat issue detection',
        ]}
        ownerBenefit="Reduce room downtime and understand recurring maintenance costs."
        teamBenefit="Give maintenance clear information and fewer random calls."
        icon={<Wrench className="w-5 h-5" />}
        variant="amber"
      />
      <ModuleSection
        pill="Audits"
        headline="Keep every audit scheduled, visible, and recorded."
        body="StayOps helps hotels manage recurring room audits, safety checks, brand standards, and property inspections without losing records across paper or spreadsheets."
        features={[
          'Recurring audit schedules',
          'Room audit templates',
          'Safety checks',
          'Brand standard checks',
          'Missed audit alerts',
          'Audit history',
          'Person responsible',
          'Photos and notes',
        ]}
        ownerBenefit="See audit health across properties."
        teamBenefit="Make inspections easier to complete and prove."
        icon={<ShieldCheck className="w-5 h-5" />}
        variant="teal"
      />
      <ModuleSection
        pill="Inventory & assets"
        headline="Track what changed, what broke, what was replaced, and how often."
        body="StayOps gives ownership groups item-level and asset-level history so missing, damaged, or frequently replaced items do not stay invisible."
        features={[
          'Item tracking',
          'Replacement history',
          'Damage reports',
          'Missing item records',
          'Room-level asset history',
          'Lifecycle traceability',
          'Cost visibility',
          'Repeated replacement alerts',
        ]}
        ownerBenefit="Reduce silent inventory and asset loss."
        teamBenefit="Make item issues easier to record and explain."
        icon={<Boxes className="w-5 h-5" />}
        variant="rose"
      />
      <ModuleSection
        pill="Labour & tasks"
        headline="Clear work, clear ownership, clear proof."
        body="StayOps helps managers assign work, track completion, manage handovers, and reduce communication gaps across departments."
        features={[
          'Task assignments',
          'Shift-level visibility',
          'Department workflows',
          'Handover notes',
          'Completion proof',
          'Open task views',
          'Priority work queues',
          'Bottleneck detection',
        ]}
        ownerBenefit="Understand where work slows down and where labour is being spent."
        teamBenefit="Help employees know exactly what to do and show what they completed."
        icon={<CheckCheck className="w-5 h-5" />}
        variant="green"
      />
      <ModuleSection
        pill="Owner dashboard"
        headline="Owner-level visibility across every property."
        body="The StayOps owner dashboard gives ownership groups a clear view of property health, room downtime, open issues, audit status, labour activity, and operational risk."
        features={[
          'Open maintenance issues',
          'Rooms out of order',
          'Revenue at risk',
          'Missed audits',
          'Task completion',
          'Property health score',
          'Recurring issue alerts',
          'Inventory replacement patterns',
          'Room readiness status',
          'Department bottlenecks',
        ]}
        ownerBenefit="See where attention is needed before issues become expensive."
        teamBenefit="Give GMs a consistent way to report to ownership."
        icon={<LayoutDashboard className="w-5 h-5" />}
        variant="blue"
      />
      <ModuleSection
        pill="AI operational memory"
        headline="Turn daily hotel activity into operational intelligence."
        body="StayOps builds memory across rooms, assets, repairs, audits, and tasks. It helps owners and managers see repeated problems, property risks, delayed work, and patterns that are hard to catch manually."
        features={[
          'Repeated issue detection',
          'Room-level history',
          'Asset lifecycle summaries',
          'Audit pattern analysis',
          'Maintenance delay summaries',
          'Property health summaries',
          'Owner-ready daily summaries',
          'Risk alerts',
        ]}
        ownerBenefit="See patterns across properties earlier."
        teamBenefit="Let teams work clearly without the tool policing them."
        trust="StayOps AI is not built to replace hotel teams. It is built to help teams work clearly and help owners see patterns earlier."
        icon={<Brain className="w-5 h-5" />}
        variant="amber"
      />
      <FinalCta />
    </main>
  );
}

/* -------------------- Hero -------------------- */
function Hero() {
  return (
    <section className="mx-auto max-w-7xl px-5 sm:px-8 pt-16 sm:pt-20 pb-12 sm:pb-16 text-center">
      <span className="stayops-pill">Product</span>
      <h1
        className="display mx-auto mt-6"
        style={{
          color: 'var(--so-ink)',
          fontSize: 'clamp(2.5rem, 6vw, 5rem)',
          maxWidth: '22ch',
          lineHeight: 1.02,
        }}
      >
        Everything hotel operations need, connected in one control room.
      </h1>
      <p
        className="mt-6 mx-auto text-base sm:text-lg lg:text-xl"
        style={{ color: 'var(--so-ink-muted)', maxWidth: '52ch', lineHeight: 1.55 }}
      >
        StayOps brings rooms, maintenance, audits, labour, inventory, assets, and reporting
        into one system built for hotel ownership groups and the teams who run the property
        every day.
      </p>
      <div className="mt-8 flex items-center justify-center">
        <Link href="/website/contact" className="stayops-cta">
          Book a Product Demo <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
}

/* -------------------- Philosophy -------------------- */
function Philosophy() {
  return (
    <section
      className="border-y"
      style={{ borderColor: 'var(--so-hairline)', background: 'var(--so-canvas-soft)' }}
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8 py-16 sm:py-20">
        <div className="max-w-3xl">
          <span className="stayops-pill">Not another task app</span>
          <h2
            className="display mt-5"
            style={{
              color: 'var(--so-ink)',
              fontSize: 'clamp(1.75rem, 4vw, 3rem)',
              maxWidth: '24ch',
            }}
          >
            A connected operating layer for hotel operations.
          </h2>
          <p className="mt-5 text-base sm:text-lg" style={{ color: 'var(--so-ink-muted)', lineHeight: 1.65 }}>
            Most hotel teams already use enough tools, messages, spreadsheets, and reports.
            The problem is that daily operations do not connect into one clear memory for
            owners and managers.
          </p>
          <p className="mt-4 text-base sm:text-lg" style={{ color: 'var(--so-ink-muted)', lineHeight: 1.65 }}>
            StayOps connects the work happening on the ground with the visibility needed at
            the ownership level.
          </p>
        </div>
      </div>
    </section>
  );
}

/* -------------------- Module section -------------------- */
function ModuleSection({
  pill, headline, body, features, ownerBenefit, teamBenefit, trust, icon, variant,
}: {
  pill: string;
  headline: string;
  body: string;
  features: string[];
  ownerBenefit: string;
  teamBenefit: string;
  trust?: string;
  icon: React.ReactNode;
  variant: 'amber' | 'blue' | 'teal' | 'rose' | 'green';
}) {
  const pillsForBlob = features.slice(0, 5);

  return (
    <section className="mx-auto max-w-7xl px-5 sm:px-8 py-20 sm:py-28">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-start">
        <div>
          <span className="stayops-pill">
            {icon}
            {pill}
          </span>
          <h2
            className="display mt-6"
            style={{
              color: 'var(--so-ink)',
              fontSize: 'clamp(2rem, 4.5vw, 3.5rem)',
              maxWidth: '18ch',
            }}
          >
            {headline}
          </h2>
          <p className="mt-5 text-base sm:text-lg" style={{ color: 'var(--so-ink-muted)', lineHeight: 1.6 }}>
            {body}
          </p>

          <div className="mt-10">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] mb-3"
               style={{ color: 'var(--so-ink-dim)' }}>
              Features
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5">
              {features.map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm sm:text-base"
                    style={{ color: 'var(--so-ink-2)' }}>
                  <span className="mt-2.5 w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ background: 'var(--so-ink)' }} />
                  <span style={{ lineHeight: 1.55 }}>{f}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <BenefitBlock label="Owner benefit" body={ownerBenefit} />
            <BenefitBlock label="Team benefit" body={teamBenefit} />
          </div>

          {trust && (
            <p className="mt-8 text-sm italic" style={{ color: 'var(--so-ink-dim)', lineHeight: 1.6 }}>
              {trust}
            </p>
          )}
        </div>

        <div className="lg:pt-4">
          <div className={`blob-card blob-${variant}`}>
            <div className="blob-pills">
              <span className="blob-pill" style={{ fontWeight: 600 }}>{pill}</span>
              {pillsForBlob.map((f) => (
                <span key={f} className="blob-pill">{f}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function BenefitBlock({ label, body }: { label: string; body: string }) {
  return (
    <div
      className="rounded-2xl p-5"
      style={{ background: 'var(--so-canvas-soft)', border: '1px solid var(--so-hairline)' }}
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em]"
         style={{ color: 'var(--so-ink-dim)' }}>
        {label}
      </p>
      <p className="mt-2 text-sm sm:text-base" style={{ color: 'var(--so-ink-2)', lineHeight: 1.55 }}>
        {body}
      </p>
    </div>
  );
}

/* -------------------- Final CTA -------------------- */
function FinalCta() {
  return (
    <section className="mx-auto max-w-4xl px-5 sm:px-8 py-24 sm:py-32 text-center">
      <h2
        className="display mx-auto"
        style={{
          color: 'var(--so-ink)',
          fontSize: 'clamp(2.25rem, 5vw, 4rem)',
          maxWidth: '22ch',
        }}
      >
        Bring every hotel operation into one control room.
      </h2>
      <p
        className="mt-6 mx-auto text-base sm:text-lg"
        style={{ color: 'var(--so-ink-muted)', maxWidth: '54ch', lineHeight: 1.6 }}
      >
        See how StayOps can help your team reduce chaos, protect revenue, and create cleaner
        ownership visibility.
      </p>
      <div className="mt-8 flex items-center justify-center">
        <Link href="/website/contact" className="stayops-cta">
          Book a Product Demo <ArrowUpRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
}
