'use client';

import { useMemo, useState } from 'react';
import { Upload, Banknote } from 'lucide-react';
import { useAccountingData } from '@/lib/use-accounting-data';
import { DemoDataToggle } from '@/components/accounting/DemoDataToggle';
import { CsvUploadCard } from '@/components/accounting/CsvUploadCard';
import { TransactionRowQbo, type ReviewRow } from '@/components/accounting/TransactionRowQbo';
import { OtaPayoutSplitter } from '@/components/accounting/OtaPayoutSplitter';
import { ReconcileSheet } from '@/components/accounting/ReconcileSheet';
import { VendorRulesPanel } from '@/components/accounting/VendorRulesPanel';
import { formatCurrency } from '@hos/shared';
import { resolveReviewRow, useAccountingState } from '@/lib/accounting-store';

type Source = 'Bank' | 'Credit Card' | 'Payroll' | 'OTA';

export default function BankingPage() {
  const data = useAccountingData();
  const acctState = useAccountingState();
  const [source, setSource] = useState<Source>('Bank');
  const [uploadOpen, setUploadOpen] = useState(false);
  const [reconcileOpenId, setReconcileOpenId] = useState<string | null>(null);
  const coaById = useMemo(() => new Map(data.coa.map((a) => [a.id, a])), [data.coa]);

  const hotelLabelById = useMemo(() => {
    const m = new Map<string, string>();
    for (const h of data.hotels) m.set(h.id, h.shortName);
    return m;
  }, [data.hotels]);

  const reviewRows: ReviewRow[] = useMemo(() => {
    if (source === 'Bank') {
      return data.bankRows.filter((r) => !r.matchedTxId).map((r) => ({
        id: r.id, dateIso: r.dateIso, description: r.description, amount: r.amount,
        hotelLabel: hotelLabelById.get(r.hotelId) ?? r.hotelId,
      }));
    }
    if (source === 'Credit Card') {
      return data.ccRows.filter((r) => !r.matchedTxId).map((r) => ({
        id: r.id, dateIso: r.dateIso, description: r.description, amount: -r.amount,
        hotelLabel: hotelLabelById.get(r.hotelId) ?? r.hotelId,
      }));
    }
    if (source === 'Payroll') {
      return data.payrollRows.map((r) => ({
        id: r.id, dateIso: r.periodEndIso,
        description: `Payroll · ${r.employeeName} · ${r.department}`,
        amount: -(r.gross + r.employerTaxes),
        hotelLabel: hotelLabelById.get(r.hotelId) ?? r.hotelId,
      }));
    }
    return [];
  }, [source, data.bankRows, data.ccRows, data.payrollRows, hotelLabelById]);

  const otaRows = useMemo(
    () => data.otaRows.filter((r) => !r.matchedTxId),
    [data.otaRows],
  );

  // Rows the accountant has already categorized (persisted) drop out of review.
  const visibleReview = reviewRows.filter((r) => !acctState.resolvedRows[r.id]);
  const reconcileAccount = data.bankAccounts.find((b) => b.id === reconcileOpenId) ?? null;
  const reconcileRows = reconcileAccount ? data.bankRows.filter((r) => r.bankAccountId === reconcileAccount.id) : [];

  const handleAdd = (rowId: string, accountId: string) => {
    const row = reviewRows.find((r) => r.id === rowId);
    const acctName = coaById.get(accountId)?.name ?? accountId;
    resolveReviewRow(
      { id: rowId, hotelId: data.hotelId, description: row?.description ?? rowId },
      accountId, acctName,
    );
  };
  const handleSkip = (rowId: string) => {
    // Skip = defer to a generic "uncategorized/suspense" — for the demo, just resolve it out of the queue.
    resolveReviewRow({ id: rowId, hotelId: data.hotelId, description: 'Skipped — deferred' }, 'acc-1010', 'Deferred');
  };

  const sourceTab = (s: Source) => (
    <button
      key={s}
      type="button"
      onClick={() => setSource(s)}
      className="px-4 py-2 text-sm font-semibold transition-colors"
      style={{
        color: source === s ? '#222222' : '#6a6a6a',
        borderBottom: source === s ? '2px solid #ff385c' : '2px solid transparent',
      }}
    >
      {s}
    </button>
  );

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold" style={{ color: '#222222' }}>{data.scopeLabel} · Banking</h1>
          <p className="text-sm mt-0.5" style={{ color: '#929292' }}>{data.scopeSub} · CSV imports · auto-categorize · reconcile</p>
        </div>
        <div className="flex items-center gap-3">
          <DemoDataToggle />
          <button
            type="button"
            onClick={() => setUploadOpen(true)}
            className="text-xs font-semibold px-3 py-1.5 rounded-full inline-flex items-center gap-1.5"
            style={{ background: '#222222', color: '#ffffff' }}
          >
            <Upload className="w-3.5 h-3.5" /> Import CSV
          </button>
        </div>
      </div>

      {data.mode === 'empty' ? (
        <div className="rounded-2xl p-12 flex flex-col items-center text-center gap-3" style={{ border: '1px dashed #dddddd', background: '#ffffff' }}>
          <Banknote className="w-8 h-8" style={{ color: '#6a6a6a' }} />
          <p className="text-base font-semibold" style={{ color: '#222222' }}>Import your first statement</p>
          <p className="text-sm max-w-md" style={{ color: '#6a6a6a' }}>
            Drop a bank or credit card CSV. We&apos;ll auto-categorize using your learned rules and let AI suggest the rest.
          </p>
          <button
            type="button"
            onClick={() => setUploadOpen(true)}
            className="text-xs font-semibold px-4 py-2 rounded-full"
            style={{ background: '#222222', color: '#ffffff' }}
          >
            Import CSV
          </button>
        </div>
      ) : (
        <>
          {/* Bank account list with reconcile buttons */}
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wide mb-3" style={{ color: '#6a6a6a' }}>Bank Accounts</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {data.bankAccounts.filter((b) => b.hotelId !== 'CONSOLIDATED').slice(0, 6).map((b) => {
                const drift = b.statementBalance - b.bookBalance;
                return (
                  <div key={b.id} className="rounded-2xl p-4 flex flex-col gap-2" style={{ border: '1px solid #dddddd', background: '#ffffff' }}>
                    <div className="flex items-start justify-between">
                      <div className="min-w-0">
                        <p className="text-xs" style={{ color: '#929292' }}>····{b.last4} · {b.kind.toUpperCase()}</p>
                        <p className="text-sm font-semibold mt-0.5 truncate" style={{ color: '#222222' }}>{b.name}</p>
                      </div>
                      <p className="text-base font-bold" style={{ color: '#222222' }}>{formatCurrency(b.bookBalance)}</p>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <p style={{ color: Math.abs(drift) > 1 ? '#b45309' : '#15803d' }}>
                        {Math.abs(drift) > 1 ? `Drift ${formatCurrency(drift)}` : 'In balance'}
                      </p>
                      <button
                        type="button"
                        onClick={() => setReconcileOpenId(b.id)}
                        className="font-semibold px-3 py-1 rounded-full"
                        style={{ background: '#ff385c', color: '#ffffff' }}
                      >
                        Reconcile
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Source tabs */}
          <div>
            <div className="flex border-b" style={{ borderColor: '#dddddd' }}>
              {(['Bank', 'Credit Card', 'Payroll', 'OTA'] as Source[]).map(sourceTab)}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 flex flex-col gap-3">
              {source === 'OTA' ? (
                otaRows.length > 0 ? (
                  otaRows.map((r) => (
                    <OtaPayoutSplitter key={r.id} row={r} hotelLabel={hotelLabelById.get(r.hotelId) ?? r.hotelId} />
                  ))
                ) : (
                  <div className="rounded-2xl p-8 text-center text-sm" style={{ border: '1px solid #dddddd', background: '#ffffff', color: '#6a6a6a' }}>
                    No unmatched OTA remittances in current scope.
                  </div>
                )
              ) : (
                <>
                  <p className="text-xs" style={{ color: '#929292' }}>
                    {visibleReview.length} of {reviewRows.length} unmatched · review one at a time
                  </p>
                  {visibleReview.length > 0 ? (
                    visibleReview.slice(0, 12).map((r) => (
                      <TransactionRowQbo
                        key={r.id}
                        row={r}
                        coa={data.coa}
                        rules={data.rules}
                        onAdd={handleAdd}
                        onSkip={handleSkip}
                      />
                    ))
                  ) : (
                    <div className="rounded-2xl p-8 text-center text-sm" style={{ border: '1px solid #dddddd', background: '#ffffff', color: '#15803d' }}>
                      All caught up — no rows awaiting review for {source}.
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="flex flex-col gap-4">
              <VendorRulesPanel rules={data.rules} coa={data.coa} />
            </div>
          </div>
        </>
      )}

      <CsvUploadCard
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        source={source}
        rowsPreviewCount={reviewRows.length || 12}
      />

      <ReconcileSheet
        open={!!reconcileOpenId}
        onClose={() => setReconcileOpenId(null)}
        bankAccount={reconcileAccount}
        rows={reconcileRows}
      />
    </div>
  );
}
