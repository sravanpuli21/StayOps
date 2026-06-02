'use client';

import { useAccountingData } from '@/lib/use-accounting-data';
import { CashKpiRow } from '@/components/accounting/CashKpiRow';
import { ApAgingCard } from '@/components/accounting/ApAgingCard';
import { RecentTransactions } from '@/components/accounting/RecentTransactions';
import { DemoDataToggle } from '@/components/accounting/DemoDataToggle';

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-sm font-bold uppercase tracking-wide mb-3" style={{ color: '#6a6a6a' }}>
      {children}
    </h2>
  );
}

export default function AccountingDashboardPage() {
  const data = useAccountingData();
  const netChange = data.transactions.reduce((s, t) => s + t.amount, 0);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold" style={{ color: '#222222' }}>{data.scopeLabel} Accounting</h1>
          <p className="text-sm mt-0.5" style={{ color: '#929292' }}>{data.scopeSub} · Books current through 2026-05-04</p>
        </div>
        <DemoDataToggle />
      </div>

      {data.mode === 'empty' ? (
        <div className="rounded-2xl p-12 flex flex-col items-center text-center gap-3" style={{ border: '1px dashed #dddddd', background: '#ffffff' }}>
          <p className="text-base font-semibold" style={{ color: '#222222' }}>No books yet</p>
          <p className="text-sm max-w-md" style={{ color: '#6a6a6a' }}>
            Drop a CSV from your bank or credit card on the Banking page to start, or load 3 months of seeded demo data.
          </p>
        </div>
      ) : (
        <>
          <CashKpiRow
            totalCash={data.totalCash}
            apOpen={data.apOpen}
            apOverdue={data.apOverdue}
            netChangeMtd={netChange}
            unreconciledCount={data.unreconciledCount}
          />

          <ApAgingCard bills={data.bills} />

          {/* Quick stats row: missing receipts, pending approvals, audit activity */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-2xl p-5" style={{ border: '1px solid #dddddd', background: '#ffffff' }}>
              <p className="text-xs font-bold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>Missing Receipts</p>
              <p className="text-2xl font-bold mt-1" style={{ color: '#222222' }}>
                {data.transactions.filter((t) => t.amount < 0 && t.source !== 'payroll' && t.source !== 'ota').length - data.receipts.length}
              </p>
              <p className="text-xs mt-1" style={{ color: '#929292' }}>Of {data.transactions.filter((t) => t.amount < 0 && t.source !== 'payroll' && t.source !== 'ota').length} expense tx</p>
            </div>
            <div className="rounded-2xl p-5" style={{ border: '1px solid #dddddd', background: '#ffffff' }}>
              <p className="text-xs font-bold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>Pending Approvals</p>
              <p className="text-2xl font-bold mt-1" style={{ color: '#222222' }}>
                {data.approvals.filter((a) => a.status === 'pending').length}
              </p>
              <p className="text-xs mt-1" style={{ color: '#929292' }}>Across {new Set(data.approvals.filter((a) => a.status === 'pending').map((a) => a.hotelId)).size} hotels</p>
            </div>
            <div className="rounded-2xl p-5" style={{ border: '1px solid #dddddd', background: '#ffffff' }}>
              <p className="text-xs font-bold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>Audit Events (30d)</p>
              <p className="text-2xl font-bold mt-1" style={{ color: '#222222' }}>{data.auditLog.length}</p>
              <p className="text-xs mt-1" style={{ color: '#929292' }}>Uploads · edits · reconciles · closes</p>
            </div>
          </div>

          <div>
            <SectionTitle>Recent Transactions</SectionTitle>
            <RecentTransactions transactions={data.transactions} coa={data.coa} vendors={data.vendors} />
          </div>

          <div>
            <SectionTitle>Recent Audit Activity</SectionTitle>
            <div className="rounded-2xl p-3 flex flex-col gap-1.5" style={{ border: '1px solid #dddddd', background: '#ffffff' }}>
              {data.auditLog.slice(0, 6).map((e) => (
                <div key={e.id} className="rounded-lg px-3 py-2 flex items-start gap-2" style={{ background: '#f7f7f7' }}>
                  <span className="text-[10px] font-bold tracking-wide px-1.5 py-0.5 rounded" style={{ background: '#222222', color: '#ffffff' }}>{e.action.toUpperCase()}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs" style={{ color: '#222222' }}>{e.actorName} <span style={{ color: '#929292' }}>· {e.timestampIso.slice(0, 16).replace('T', ' ')}</span></p>
                    {e.notes && <p className="text-[10px] mt-0.5 truncate" style={{ color: '#6a6a6a' }}>{e.notes}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
