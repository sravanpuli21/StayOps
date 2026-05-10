import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-xs" style={{ color: '#6a6a6a' }}>
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((item, i) => (
          <li key={`${item.label}-${i}`} className="inline-flex items-center gap-1">
            {item.href ? (
              <Link href={item.href} className="font-medium hover:text-[#ff385c] transition-colors">
                {item.label}
              </Link>
            ) : (
              <span style={{ color: '#222' }} className="font-semibold">{item.label}</span>
            )}
            {i < items.length - 1 && <ChevronRight className="w-3 h-3" />}
          </li>
        ))}
      </ol>
    </nav>
  );
}
