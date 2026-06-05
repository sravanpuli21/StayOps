'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Badge } from '../_ui';
import type { ReconUiStatus } from '../_recon';

export const RECON_TABS = [
  { label: 'Overview', href: '/web/accounting/reconciliation' },
  { label: 'Bank Reconciliation', href: '/web/accounting/reconciliation/bank' },
  { label: 'Credit Card Reconciliation', href: '/web/accounting/reconciliation/credit-cards' },
  { label: 'Differences', href: '/web/accounting/reconciliation/differences' },
  { label: 'Blockers', href: '/web/accounting/reconciliation/blockers' },
  { label: 'History', href: '/web/accounting/reconciliation/history' },
  { label: 'Activity Log', href: '/web/accounting/reconciliation/activity' },
  { label: 'Settings', href: '/web/accounting/reconciliation/settings' },
];

export function ReconTabs() {
  const pathname = usePathname() ?? '';
  return (
    <div className="flex gap-1 overflow-x-auto" style={{ borderBottom: '1px solid #dddddd' }}>
      {RECON_TABS.map((t) => {
        const active = t.href === '/web/accounting/reconciliation' ? pathname === t.href : pathname.startsWith(t.href);
        return <Link key={t.href} href={t.href} className="px-3 py-2.5 text-sm font-semibold whitespace-nowrap" style={{ color: active ? '#6a4ec0' : '#6a6a6a', borderBottom: active ? '2px solid #6a4ec0' : '2px solid transparent' }}>{t.label}</Link>;
      })}
    </div>
  );
}

export const RECON_BADGE: Record<ReconUiStatus, { label: string; fg: string; bg: string }> = {
  'not-started': { label: 'Not Started', fg: '#6a6a6a', bg: '#f0f0f0' },
  'in-progress': { label: 'In Progress', fg: '#1d4ed8', bg: '#dbeafe' },
  difference: { label: 'Difference Found', fg: '#b91c1c', bg: '#fee2e2' },
  'ready-to-finish': { label: 'Ready to Finish', fg: '#b45309', bg: '#fef3c7' },
  reconciled: { label: 'Reconciled', fg: '#15803d', bg: '#dcfce7' },
  blocked: { label: 'Blocked', fg: '#b91c1c', bg: '#fee2e2' },
  reopened: { label: 'Reopened', fg: '#6a4ec0', bg: '#ece4fb' },
};

export function ReconStatusBadge({ status }: { status: ReconUiStatus }) {
  const b = RECON_BADGE[status];
  return <Badge label={b.label} fg={b.fg} bg={b.bg} />;
}

export function SummaryCard({ label, value, accent = '#222', sub }: { label: string; value: string | number; accent?: string; sub?: string }) {
  return (
    <div className="p-4 rounded-2xl" style={{ background: '#fff', border: '1px solid #dddddd' }}>
      <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: '#929292' }}>{label}</p>
      <p className="text-2xl font-bold mt-1" style={{ color: accent }}>{value}</p>
      {sub && <p className="text-[11px] mt-0.5" style={{ color: '#b0b0b0' }}>{sub}</p>}
    </div>
  );
}

/** Action verb for an account given its status. */
export function actionFor(status: ReconUiStatus): string {
  if (status === 'reconciled') return 'View Report';
  if (status === 'in-progress' || status === 'ready-to-finish' || status === 'difference') return 'Continue';
  if (status === 'blocked') return 'View Blockers';
  return 'Start';
}
