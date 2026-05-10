import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight, Briefcase } from 'lucide-react';
import { Breadcrumb } from '../../_components/Breadcrumb';

export const metadata: Metadata = {
  title: 'Careers',
  description:
    'We are not hiring at this moment, but we are building something meaningful for hotel operators.',
};

export default function CareersPage() {
  return (
    <main>
      <section className="mx-auto max-w-7xl px-5 sm:px-8 pt-10 sm:pt-14 pb-16 sm:pb-20">
        <Breadcrumb items={[
          { label: 'Company', href: '/website/company' },
          { label: 'Careers' },
        ]} />

        <div className="mt-6 max-w-3xl">
          <span className="stayops-pill">
            <Briefcase className="w-3.5 h-3.5" />
            Careers
          </span>
          <h1
            className="display mt-6"
            style={{
              color: 'var(--so-ink)',
              fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
              maxWidth: '22ch',
              lineHeight: 1.02,
            }}
          >
            We are not hiring right now.
          </h1>
          <p
            className="mt-6 text-base sm:text-lg lg:text-xl"
            style={{ color: 'var(--so-ink-muted)', maxWidth: '52ch', lineHeight: 1.55 }}
          >
            StayOps is a small, operator-led team. We are focused on building something
            meaningful for hotel ownership groups before we grow the team. If you operate
            hotels, work in hospitality operations, or care about solving the messy parts
            of hotel work, we&apos;d still like to hear from you.
          </p>

          <div className="mt-10 rounded-2xl p-6 sm:p-8"
               style={{ background: 'var(--so-canvas-soft)', border: '1px solid var(--so-hairline)' }}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em]"
               style={{ color: 'var(--so-ink-dim)' }}>
              Stay in touch
            </p>
            <p className="mt-3 text-base sm:text-lg" style={{ color: 'var(--so-ink-2)', lineHeight: 1.6 }}>
              Email us with your background, what you&apos;ve built or operated, and the
              hotel operations problems you care about. We keep every note and will reach
              out when the right role opens.
            </p>
            <a
              href="mailto:hello@stayops.com"
              className="mt-5 inline-flex items-center gap-1.5 font-semibold hover:underline"
              style={{ color: 'var(--so-ink)' }}
            >
              hello@stayops.com
              <ArrowUpRight className="w-4 h-4" />
            </a>
          </div>

          <div className="mt-10 flex flex-col sm:flex-row gap-3">
            <Link href="/website/company/about" className="stayops-cta-ghost justify-center">
              Read about the team
            </Link>
            <Link href="/website/contact" className="stayops-cta justify-center">
              Book a demo instead
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
