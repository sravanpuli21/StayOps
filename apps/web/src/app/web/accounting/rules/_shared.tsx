'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Globe, Building2 } from 'lucide-react';
import type { RichRule, RuleStatus } from '@hos/shared/accounting-os';
import { Badge } from '../_ui';

export const RULE_TABS = [
  { label: 'Overview', href: '/web/accounting/rules' },
  { label: 'All Rules', href: '/web/accounting/rules/all' },
  { label: 'Global Rules', href: '/web/accounting/rules/global' },
  { label: 'Hotel-Level Rules', href: '/web/accounting/rules/hotel-level' },
  { label: 'Suggested Rules', href: '/web/accounting/rules/suggested' },
  { label: 'Conflicts', href: '/web/accounting/rules/conflicts' },
  { label: 'Rule Tester', href: '/web/accounting/rules/test' },
  { label: 'Activity Log', href: '/web/accounting/rules/activity' },
  { label: 'Settings', href: '/web/accounting/rules/settings' },
];

export function RuleTabs() {
  const pathname = usePathname() ?? '';
  return (
    <div className="flex gap-1 overflow-x-auto" style={{ borderBottom: '1px solid #dddddd' }}>
      {RULE_TABS.map((t) => {
        const active = t.href === '/web/accounting/rules' ? pathname === t.href : pathname.startsWith(t.href);
        return <Link key={t.href} href={t.href} className="px-3 py-2.5 text-sm font-semibold whitespace-nowrap" style={{ color: active ? '#6a4ec0' : '#6a6a6a', borderBottom: active ? '2px solid #6a4ec0' : '2px solid transparent' }}>{t.label}</Link>;
      })}
    </div>
  );
}

export function ScopeBadge({ rule, code }: { rule?: RichRule; code?: string }) {
  const isGlobal = rule ? rule.scope === 'global' : false;
  if (isGlobal) return <span className="inline-flex items-center gap-1"><Globe className="w-3.5 h-3.5" style={{ color: '#6a4ec0' }} /><Badge label="Global" fg="#6a4ec0" bg="#ece4fb" /></span>;
  return <span className="inline-flex items-center gap-1"><Building2 className="w-3.5 h-3.5" style={{ color: '#1d4ed8' }} /><Badge label={code ? `Hotel · ${code}` : 'Hotel-Level'} fg="#1d4ed8" bg="#dbeafe" /></span>;
}

export const STATUS_BADGE: Record<RuleStatus, { label: string; fg: string; bg: string }> = {
  active: { label: 'Active', fg: '#15803d', bg: '#dcfce7' },
  disabled: { label: 'Disabled', fg: '#6a6a6a', bg: '#f0f0f0' },
  draft: { label: 'Draft', fg: '#b45309', bg: '#fef3c7' },
  needs_review: { label: 'Needs Review', fg: '#1d4ed8', bg: '#dbeafe' },
  conflict: { label: 'Conflict', fg: '#b91c1c', bg: '#fee2e2' },
};

export function RuleStatusBadge({ status }: { status: RuleStatus }) {
  const b = STATUS_BADGE[status];
  return <Badge label={b.label} fg={b.fg} bg={b.bg} />;
}

export function SummaryCard({ label, value, accent = '#222' }: { label: string; value: string | number; accent?: string }) {
  return (
    <div className="p-4 rounded-2xl" style={{ background: '#fff', border: '1px solid #dddddd' }}>
      <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: '#929292' }}>{label}</p>
      <p className="text-2xl font-bold mt-1" style={{ color: accent }}>{value}</p>
    </div>
  );
}

export function SourceLabel(source: string) {
  return source === 'both' ? 'Bank & Card' : source === 'bank' ? 'Bank' : 'Credit Card';
}
