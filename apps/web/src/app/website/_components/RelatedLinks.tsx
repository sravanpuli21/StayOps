import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export interface RelatedLink {
  href: string;
  label: string;
  description: string;
}

export function RelatedLinks({
  heading,
  links,
}: {
  heading: string;
  links: RelatedLink[];
}) {
  return (
    <section className="border-t" style={{ borderColor: '#eee', background: '#fafafa' }}>
      <div className="mx-auto max-w-6xl px-5 sm:px-8 py-12 sm:py-16">
        <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#929292' }}>
          {heading}
        </p>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="group rounded-2xl p-5 transition-shadow hover:shadow-md"
              style={{ background: '#fff', border: '1px solid #eee' }}
            >
              <p className="text-base font-bold" style={{ color: '#222' }}>{l.label}</p>
              <p className="mt-1 text-sm" style={{ color: '#3f3f3f', lineHeight: 1.55 }}>
                {l.description}
              </p>
              <span
                className="mt-3 inline-flex items-center gap-1 text-sm font-semibold"
                style={{ color: '#ff385c' }}
              >
                Explore
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
