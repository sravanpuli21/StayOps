'use client';

import { useState } from 'react';
import { Printer, Download } from 'lucide-react';
import { useAccountingData } from '@/lib/use-accounting-data';
import { UsaliPnlTable } from '@/components/accounting/UsaliPnlTable';
import { CashFlowTable } from '@/components/accounting/CashFlowTable';
import { BalanceSheetTable } from '@/components/accounting/BalanceSheetTable';
import { DemoDataToggle } from '@/components/accounting/DemoDataToggle';

type Report = 'pnl' | 'cashflow' | 'balance' | 'budget';

export default function ReportsPage() {
  const data = useAccountingData();
  const [report, setReport] = useState<Report>('pnl');

  const tab = (r: Report, label: string) => (
    <button
      key={r}
      onClick={() => setReport(r)}
      className="px-4 py-2 text-sm font-semibold"
      style={{ color: report === r ? '#222222' : '#6a6a6a', borderBottom: report === r ? '2px solid #ff385c' : '2px solid transparent' }}
    >
      {label}
    </button>
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4 flex-wrap no-print">
        <div>
          <h1 className="text-xl font-bold" style={{ color: '#222222' }}>{data.scopeLabel} · Reports</h1>
          <p className="text-sm mt-0.5" style={{ color: '#929292' }}>
            {data.scopeSub} · {data.period.from} → {data.period.to}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <DemoDataToggle />
          <button onClick={() => window.print()} className="text-xs font-semibold px-3 py-1.5 rounded-full inline-flex items-center gap-1.5" style={{ border: '1px solid #dddddd', background: '#ffffff', color: '#3f3f3f' }}>
            <Printer className="w-3.5 h-3.5" /> Print
          </button>
          <button onClick={() => alert('Demo only — would export CSV.')} className="text-xs font-semibold px-3 py-1.5 rounded-full inline-flex items-center gap-1.5" style={{ background: '#222222', color: '#ffffff' }}>
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
        </div>
      </div>

      <div className="flex border-b" style={{ borderColor: '#dddddd' }}>
        {tab('pnl', 'P&L (USALI)')}
        {tab('cashflow', 'Cash Flow')}
        {tab('balance', 'Balance Sheet')}
        {tab('budget', 'Budget vs Actual')}
      </div>

      {data.mode === 'empty' || data.transactions.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          {report === 'pnl' && <UsaliPnlTable transactions={data.transactions} coa={data.coa} />}
          {report === 'cashflow' && <CashFlowTable transactions={data.transactions} coa={data.coa} />}
          {report === 'balance' && (
            <BalanceSheetTable bankAccounts={data.bankAccounts} transactions={data.transactions} bills={data.bills} coa={data.coa} />
          )}
          {report === 'budget' && (
            <div className="rounded-2xl p-6 text-sm" style={{ border: '1px solid #dddddd', background: '#ffffff', color: '#6a6a6a' }}>
              Budget vs Actual lives at <a className="font-semibold underline" href="/web/sanjay/accounting/budgets" style={{ color: '#ff385c' }}>/budgets</a> as a dedicated page. Click that nav item for the full view.
            </div>
          )}
        </>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl p-12 flex flex-col items-center text-center gap-3" style={{ border: '1px dashed #dddddd', background: '#ffffff' }}>
      <p className="text-base font-semibold" style={{ color: '#222222' }}>No activity in window</p>
      <p className="text-sm max-w-md" style={{ color: '#6a6a6a' }}>
        Reports populate from categorized transactions. Adjust the date range or load demo data.
      </p>
    </div>
  );
}
