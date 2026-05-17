import Link from 'next/link';
import { Inbox, Database, BarChart3, Mail } from 'lucide-react';

type IconKey = 'inbox' | 'database' | 'chart' | 'mail';

interface EmptyStateProps {
  title: string;
  message: string;
  ctaHref?: string;
  ctaLabel?: string;
  hint?: string;
  icon?: IconKey;
}

const ICONS: Record<IconKey, typeof Inbox> = {
  inbox: Inbox,
  database: Database,
  chart: BarChart3,
  mail: Mail,
};

/**
 * Standard "no data yet" panel. Renders when a query succeeds but returns 0 rows.
 * Pair with <ErrorBanner> for the failure case and <Skeleton> for loading.
 */
export function EmptyState({
  title,
  message,
  ctaHref,
  ctaLabel,
  hint,
  icon = 'inbox',
}: EmptyStateProps) {
  const Icon = ICONS[icon];
  return (
    <div
      className="w-full flex flex-col items-center justify-center text-center px-6 py-12 rounded-2xl"
      style={{ background: '#ffffff', border: '1px dashed #dddddd' }}
    >
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
        style={{ background: '#f7f7f7' }}
      >
        <Icon className="w-6 h-6" style={{ color: '#6a6a6a' }} aria-hidden />
      </div>
      <h3 className="font-semibold text-base mb-1" style={{ color: '#222222' }}>
        {title}
      </h3>
      <p className="text-sm max-w-md" style={{ color: '#6a6a6a' }}>
        {message}
      </p>
      {ctaHref && ctaLabel && (
        <Link
          href={ctaHref}
          className="inline-block mt-4 text-xs font-semibold px-4 py-2 rounded-full text-white"
          style={{ background: '#ff385c' }}
        >
          {ctaLabel}
        </Link>
      )}
      {hint && (
        <p className="text-xs mt-3" style={{ color: '#929292' }}>
          {hint}
        </p>
      )}
    </div>
  );
}
