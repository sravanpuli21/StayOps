'use client';

import Link from 'next/link';
import { AlertTriangle, Receipt, Copy, CalendarClock, TrendingUp, CheckCheck } from 'lucide-react';
import { useAcctOs } from '../_context';
import { useAcctState, allTransactions } from '../_store';
import { card, Badge } from '../_ui';

type Sev = 'High' | 'Medium' | 'Low';
const SEV: Record<Sev, { fg: string; bg: string }> = { High: { fg: '#b91c1c', bg: '#fee2e2' }, Medium: { fg: '#b45309', bg: '#fef3c7' }, Low: { fg: '#1d4ed8', bg: '#dbeafe' } };

export default function InsightsPage() {
  const { selection } = useAcctOs();
  const state = useAcctState();
  const txs = allTransactions(state);
  const scoped = selection.kind === 'hotel' ? txs.filter((t) => t.hotelId === selection.hotelId) : txs;

  const insights: Array<{ sev: Sev; icon: React.ReactNode; msg: string; action: string; href: string }> = [
    { sev: 'High', icon: <AlertTriangle className="w-4 h-4" />, msg: 'Cambria Hotel - Savannah has 18 transactions waiting for review.', action: 'Review Transactions', href: '/web/accounting/transactions' },
    { sev: 'High', icon: <Receipt className="w-4 h-4" />, msg: 'Home2 Suites Baton Rouge has 6 missing receipts over $250.', action: 'View Missing', href: '/web/accounting/transactions?tab=missing' },
    { sev: 'Medium', icon: <TrendingUp className="w-4 h-4" />, msg: 'Home Depot spend increased 32% compared to last month.', action: 'View Vendor', href: '/web/accounting/vendors?v=HOME%20DEPOT' },
    { sev: 'Medium', icon: <CalendarClock className="w-4 h-4" />, msg: 'Cotton Sail Hotel has not uploaded a credit card statement for May 2026.', action: 'Upload Statement', href: '/web/accounting/credit-cards/upload' },
    { sev: 'High', icon: <CheckCheck className="w-4 h-4" />, msg: 'Four Points by Marriott reconciliation difference is $187.42.', action: 'Reconcile Account', href: '/web/accounting/reconciliation' },
    { sev: 'Low', icon: <Copy className="w-4 h-4" />, msg: `${scoped.filter((t) => t.status === 'duplicate').length} possible duplicate transactions detected.`, action: 'Review Duplicates', href: '/web/accounting/transactions?tab=duplicate' },
  ];

  const cards = [
    { label: 'High Expense Alerts', value: 4, tone: '#b91c1c' },
    { label: 'Missing Receipts', value: scoped.filter((t) => t.receipt === 'missing').length, tone: '#b45309' },
    { label: 'Duplicate Warnings', value: scoped.filter((t) => t.status === 'duplicate').length, tone: '#b91c1c' },
    { label: 'Hotels Behind Close', value: 4, tone: '#b45309' },
    { label: 'Reconciliation Differences', value: 3, tone: '#b91c1c' },
    { label: 'Vendor Spend Increases', value: 2, tone: '#1d4ed8' },
  ];

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-5">
      <div><h1 className="text-xl font-bold" style={{ color: '#222' }}>Insights</h1><p className="text-sm mt-0.5" style={{ color: '#929292' }}>Find accounting issues, unusual expenses, missing receipts, and close blockers.</p></div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {cards.map((c) => (
          <div key={c.label} className="p-4" style={card}><p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: '#929292' }}>{c.label}</p><p className="text-2xl font-bold mt-1" style={{ color: c.tone }}>{c.value}</p></div>
        ))}
      </div>

      <div className="rounded-2xl overflow-hidden" style={card}>
        {insights.map((it, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: i < insights.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
            <span style={{ color: SEV[it.sev].fg }}>{it.icon}</span>
            <Badge label={it.sev} fg={SEV[it.sev].fg} bg={SEV[it.sev].bg} />
            <p className="flex-1 text-sm" style={{ color: '#222' }}>{it.msg}</p>
            <Link href={it.href} className="text-xs font-semibold whitespace-nowrap" style={{ color: '#6a4ec0' }}>{it.action}</Link>
          </div>
        ))}
      </div>
    </div>
  );
}
