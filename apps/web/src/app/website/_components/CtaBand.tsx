import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function CtaBand({
  headline,
  body,
  ctaLabel = 'Book a demo',
  ctaHref = '/website/contact',
}: {
  headline: string;
  body: string;
  ctaLabel?: string;
  ctaHref?: string;
}) {
  return (
    <section className="mx-auto max-w-6xl px-5 sm:px-8 py-16 sm:py-24">
      <div
        className="rounded-3xl px-6 sm:px-12 py-12 sm:py-16 text-center"
        style={{ background: '#ff385c', color: '#fff' }}
      >
        <h2 className="text-3xl sm:text-5xl font-bold tracking-tight leading-tight">
          {headline}
        </h2>
        <p className="mt-4 text-base sm:text-lg max-w-xl mx-auto" style={{ color: '#ffe0e6' }}>
          {body}
        </p>
        <Link
          href={ctaHref}
          className="mt-8 inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold hover:opacity-90"
          style={{ background: '#fff', color: '#ff385c' }}
        >
          {ctaLabel} <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
}
