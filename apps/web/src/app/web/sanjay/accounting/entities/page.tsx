'use client';

import { useRouter } from 'next/navigation';
import { Building2, ChevronRight } from 'lucide-react';
import { HOTELS, getEntityByHotel, BILLS, defaultPeriodForHotel, formatCurrency } from '@hos/shared';
import { useAccountingScope } from '@/lib/accounting-scope-context';
import { useAccountingState } from '@/lib/accounting-store';

/**
 * Accounting entry point — pick the hotel (entity) whose books to work on.
 * Each hotel is its own set of books (its own LLC). The accountant picks one,
 * works it, then returns here to switch. No collective/mixed view.
 */
export default function EntitiesPage() {
  const router = useRouter();
  const { setHotel } = useAccountingScope();
  const overrides = useAccountingState();

  const open = (hotelId: string) => {
    setHotel(hotelId);
    router.push('/web/sanjay/accounting/dashboard');
  };

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold" style={{ color: '#222222' }}>Choose a hotel to work on</h1>
        <p className="text-sm mt-0.5" style={{ color: '#929292' }}>
          Each hotel keeps its own books, under its own legal entity. Pick one to open its ledger.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {HOTELS.map((h) => {
          const entity = getEntityByHotel(h.id);
          // Open AP for this hotel (bills not yet paid in-session).
          const openBills = BILLS.filter(
            (b) => b.hotelId === h.id && b.status !== 'paid' && overrides.billOverrides[b.id]?.status !== 'paid',
          );
          const openAp = openBills.reduce((s, b) => s + b.amount, 0);
          const period = defaultPeriodForHotel(h.id);

          return (
            <button
              key={h.id}
              onClick={() => open(h.id)}
              className="text-left rounded-2xl p-5 flex flex-col gap-3 transition-all hover:shadow-md hover:-translate-y-0.5"
              style={{ background: '#fff', border: '1px solid #dddddd' }}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#f0eefb' }}>
                  <Building2 className="w-5 h-5" style={{ color: '#6a4ec0' }} />
                </div>
                <ChevronRight className="w-4 h-4 mt-1" style={{ color: '#c1c1c1' }} />
              </div>

              <div>
                <p className="font-bold text-sm" style={{ color: '#222' }}>{h.shortName}</p>
                <p className="text-xs mt-0.5" style={{ color: '#929292' }}>{h.brand} · {h.city}, {h.state}</p>
              </div>

              <div className="pt-2.5" style={{ borderTop: '1px solid #f0f0f0' }}>
                <p className="text-[11px] font-semibold" style={{ color: '#6a6a6a' }}>{entity?.name ?? 'No entity'}</p>
                <p className="text-[11px]" style={{ color: '#929292' }}>EIN {entity?.ein ?? '—'} · {entity?.cpaContact ?? 'No CPA'}</p>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-xs" style={{ color: openAp > 0 ? '#b45309' : '#15803d' }}>
                  {openBills.length > 0 ? `${openBills.length} open bills · ${formatCurrency(openAp)}` : 'AP clear'}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded"
                  style={{ background: period.status === 'open' ? '#dbeafe' : '#dcfce7', color: period.status === 'open' ? '#1d4ed8' : '#15803d' }}>
                  {period.label}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
