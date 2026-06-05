'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { card } from '../../_ui';
import { ReportTabs } from '../_shell';

const STATEMENTS = [
  { name: 'Profit and Loss', desc: 'Revenue, expenses, and net income.', href: '/web/accounting/reports/profit-loss' },
  { name: 'Balance Sheet', desc: 'Assets, liabilities, and equity. Assets = Liabilities + Equity.', href: '/web/accounting/reports/balance-sheet' },
  { name: 'Cash Flow', desc: 'Operating, investing, and financing cash movement.', href: '/web/accounting/reports/cash-flow' },
  { name: 'Trial Balance', desc: 'Debit and credit balances for all accounts.', href: '/web/accounting/reports/trial-balance' },
  { name: 'General Ledger', desc: 'Every journal entry line by account.', href: '/web/accounting/reports/general-ledger' },
  { name: 'Transaction Detail', desc: 'Transaction-level detail by source, vendor, category.', href: '/web/accounting/reports/transaction-detail' },
];

export default function FinancialStatementsPage() {
  return (
    <div className="max-w-[1400px] mx-auto flex flex-col gap-5">
      <ReportTabs />
      <div><h1 className="text-xl font-bold" style={{ color: '#222' }}>Financial Statements</h1><p className="text-sm" style={{ color: '#929292' }}>Core accounting statements — run for one hotel or the whole portfolio.</p></div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {STATEMENTS.map((s) => (
          <Link key={s.name} href={s.href} className="p-5 flex flex-col gap-2" style={card}>
            <p className="font-bold text-sm" style={{ color: '#222' }}>{s.name}</p>
            <p className="text-xs flex-1" style={{ color: '#6a6a6a' }}>{s.desc}</p>
            <span className="text-xs font-semibold inline-flex items-center gap-1" style={{ color: '#6a4ec0' }}>Open Report <ArrowRight className="w-3.5 h-3.5" /></span>
          </Link>
        ))}
      </div>
    </div>
  );
}
