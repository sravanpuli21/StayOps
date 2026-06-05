'use client';

import { useAccountingData } from '@/lib/use-accounting-data';
import { BillsTable } from '@/components/accounting/BillsTable';
import { DemoDataToggle } from '@/components/accounting/DemoDataToggle';

export default function BillsPage() {
  const { bills, vendors, hotels, scopeLabel, scopeSub, mode, periodEndIso } = useAccountingData();

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold" style={{ color: '#222222' }}>{scopeLabel} · Bills</h1>
          <p className="text-sm mt-0.5" style={{ color: '#929292' }}>{scopeSub} · Vendor bills · batch pay</p>
        </div>
        <DemoDataToggle />
      </div>

      {mode === 'empty' ? (
        <div className="rounded-2xl p-12 flex flex-col items-center text-center gap-3" style={{ border: '1px dashed #dddddd', background: '#ffffff' }}>
          <p className="text-base font-semibold" style={{ color: '#222222' }}>No bills yet</p>
          <p className="text-sm max-w-md" style={{ color: '#6a6a6a' }}>
            Add a bill manually or import vendor invoices to start.
          </p>
        </div>
      ) : (
        <BillsTable bills={bills} vendors={vendors} hotels={hotels} paidIso={periodEndIso} />
      )}
    </div>
  );
}
