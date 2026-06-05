'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { CoaFullType } from '@hos/shared/accounting-os';
import { Badge } from '../_ui';
import type { LiveAccount } from '../_coa';

export const TYPE_COLOR: Record<CoaFullType, { fg: string; bg: string }> = {
  Asset: { fg: '#1d4ed8', bg: '#dbeafe' },
  Liability: { fg: '#b45309', bg: '#fef3c7' },
  Equity: { fg: '#6a4ec0', bg: '#ece4fb' },
  Revenue: { fg: '#15803d', bg: '#dcfce7' },
  COGS: { fg: '#0e7490', bg: '#cffafe' },
  Expense: { fg: '#b91c1c', bg: '#fee2e2' },
  'Other Income': { fg: '#15803d', bg: '#dcfce7' },
  'Other Expense': { fg: '#6a6a6a', bg: '#f0f0f0' },
};

export function TypeBadge({ type }: { type: CoaFullType }) {
  const c = TYPE_COLOR[type];
  return <Badge label={type} fg={c.fg} bg={c.bg} />;
}

export function StatusBadge({ status }: { status: LiveAccount['status'] }) {
  if (status === 'system-locked') return <Badge label="System Locked" fg="#6a4ec0" bg="#ece4fb" />;
  if (status === 'inactive') return <Badge label="Inactive" fg="#6a6a6a" bg="#f0f0f0" />;
  return <Badge label="Active" fg="#15803d" bg="#dcfce7" />;
}

export const COA_TABS = [
  { label: 'Overview', href: '/web/accounting/chart-of-accounts' },
  { label: 'Accounts', href: '/web/accounting/chart-of-accounts/accounts' },
  { label: 'Templates', href: '/web/accounting/chart-of-accounts/template' },
  { label: 'Account Mapping', href: '/web/accounting/chart-of-accounts/mapping' },
  { label: 'Opening Balances', href: '/web/accounting/chart-of-accounts/opening-balances' },
  { label: 'Setup Status', href: '/web/accounting/chart-of-accounts/setup-status' },
  { label: 'Activity Log', href: '/web/accounting/chart-of-accounts/activity' },
  { label: 'Settings', href: '/web/accounting/chart-of-accounts/settings' },
];

/** In-module sub-navigation bar (link-based, matches the route states). */
export function CoaTabs() {
  const pathname = usePathname() ?? '';
  return (
    <div className="flex gap-1 overflow-x-auto" style={{ borderBottom: '1px solid #dddddd' }}>
      {COA_TABS.map((t) => {
        const active = t.href === '/web/accounting/chart-of-accounts'
          ? pathname === t.href
          : pathname.startsWith(t.href);
        return (
          <Link key={t.href} href={t.href} className="px-3 py-2.5 text-sm font-semibold whitespace-nowrap"
            style={{ color: active ? '#6a4ec0' : '#6a6a6a', borderBottom: active ? '2px solid #6a4ec0' : '2px solid transparent' }}>
            {t.label}
          </Link>
        );
      })}
    </div>
  );
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
