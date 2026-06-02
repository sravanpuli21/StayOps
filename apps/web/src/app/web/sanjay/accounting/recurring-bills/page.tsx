'use client';

import { useMemo } from 'react';
import { AlertTriangle, CheckCircle2, RefreshCw } from 'lucide-react';
import { useAccountingData } from '@/lib/use-accounting-data';
import { DemoDataToggle } from '@/components/accounting/DemoDataToggle';
import { RECURRING_BILLS, formatCurrency, HOTELS } from '@hos/shared';
import type { RecurringBill } from '@hos/shared';

const STATUS: Record<RecurringBill['status'], { bg: string; color: string; label: string }> = {
  'on-track':         { bg: '#dcfce7', color: '#15803d', label: 'ON TRACK' },
  'missing':          { bg: '#fee2e2', color: '#b91c1c', label: 'MISSING' },
  'over-budget':      { bg: '#fef3c7', color: '#92400e', label: 'OVER BUDGET' },
  'duplicate-charge': { bg: '#fee2e2', color: '#b91c1c', label: 'DUPLICATE' },
};

export default function RecurringBillsPage() {
  const data = useAccountingData();

  const scoped = useMemo(
    () => RECURRING_BILLS.filter((b) => data.hotelIdSet.has(b.hotelId)),
    [data.hotelIdSet],
  );
  const alerts = scoped.filter((b) => b.status !== 'on-track');

  const vendorById = useMemo(() => new Map(data.vendors.map((v) => [v.id, v])), [data.vendors]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold" style={{ color: '#222222' }}>Recurring Bills</h1>
          <p className="text-sm mt-0.5" style={{ color: '#929292' }}>
            {scoped.length} active · {alerts.length} need attention
          </p>
        </div>
        <DemoDataToggle />
      </div>

      {alerts.length > 0 && (
        <div className="rounded-2xl p-5 flex flex-col gap-3" style={{ border: '1px solid #fde68a', background: '#fffbeb' }}>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" style={{ color: '#92400e' }} />
            <p className="text-sm font-bold" style={{ color: '#92400e' }}>{alerts.length} alerts</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {alerts.map((b) => {
              const v = vendorById.get(b.vendorId);
              const h = HOTELS.find((x) => x.id === b.hotelId);
              const expected = formatCurrency(b.expectedAmount);
              const actual = b.lastPaidAmount ? formatCurrency(b.lastPaidAmount) : '—';
              const reason =
                b.status === 'missing' ? 'No payment found this month' :
                b.status === 'over-budget' ? `${actual} vs expected ${expected}` :
                b.status === 'duplicate-charge' ? `Charged twice — total ${actual}` : '';
              return (
                <div key={b.id} className="rounded-lg px-3 py-2 flex items-start justify-between" style={{ background: '#ffffff', border: '1px solid #fde68a' }}>
                  <div className="min-w-0">
                    <p className="text-sm font-medium" style={{ color: '#222222' }}>{v?.name ?? b.vendorId}</p>
                    <p className="text-xs mt-0.5" style={{ color: '#6a6a6a' }}>{h?.shortName} · {reason}</p>
                  </div>
                  <span className="text-[10px] font-bold tracking-wide px-1.5 py-0.5 rounded ml-2" style={{ background: STATUS[b.status].bg, color: STATUS[b.status].color }}>
                    {STATUS[b.status].label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="overflow-x-auto rounded-2xl" style={{ border: '1px solid #dddddd', background: '#ffffff' }}>
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr style={{ borderBottom: '1px solid #dddddd', background: '#f7f7f7' }}>
              <th className={th}>Vendor</th>
              <th className={th}>Hotel</th>
              <th className={th}>Category</th>
              <th className={th}>Frequency</th>
              <th className={th + ' text-right'}>Expected</th>
              <th className={th + ' text-right'}>Last Paid</th>
              <th className={th}>Last Date</th>
              <th className={th}>Status</th>
            </tr>
          </thead>
          <tbody>
            {scoped.map((b, i) => {
              const v = vendorById.get(b.vendorId);
              const h = HOTELS.find((x) => x.id === b.hotelId);
              return (
                <tr key={b.id} style={{ borderBottom: i < scoped.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                  <td className="py-2.5 px-4 font-medium" style={{ color: '#222222' }}>
                    <RefreshCw className="w-3 h-3 inline mr-1" style={{ color: '#6a6a6a' }} />
                    {v?.name ?? b.vendorId}
                  </td>
                  <td className="py-2.5 px-4 text-xs" style={{ color: '#3f3f3f' }}>{h?.shortName ?? b.hotelId}</td>
                  <td className="py-2.5 px-4 text-xs" style={{ color: '#3f3f3f' }}>{b.category}</td>
                  <td className="py-2.5 px-4 text-xs uppercase tracking-wide" style={{ color: '#6a6a6a' }}>{b.frequency}</td>
                  <td className="py-2.5 px-4 text-sm text-right" style={{ color: '#3f3f3f' }}>{formatCurrency(b.expectedAmount)}</td>
                  <td className="py-2.5 px-4 text-sm text-right font-semibold" style={{ color: '#222222' }}>
                    {b.lastPaidAmount !== undefined ? formatCurrency(b.lastPaidAmount) : '—'}
                  </td>
                  <td className="py-2.5 px-4 text-xs" style={{ color: '#3f3f3f' }}>{b.lastPaidIso ?? '—'}</td>
                  <td className="py-2.5 px-4">
                    <span className="text-[10px] font-bold tracking-wide px-1.5 py-0.5 rounded" style={{ background: STATUS[b.status].bg, color: STATUS[b.status].color }}>
                      {STATUS[b.status].label}
                    </span>
                  </td>
                </tr>
              );
            })}
            {scoped.length === 0 && (
              <tr><td colSpan={8} className="py-8 px-4 text-center text-sm" style={{ color: '#929292' }}>No recurring bills configured.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="text-xs" style={{ color: '#929292' }}>
        <CheckCircle2 className="w-3 h-3 inline mr-1" style={{ color: '#15803d' }} />
        Cost-increase alerts trigger when actual amount exceeds expected by the variance percentage set per recurring bill.
      </div>
    </div>
  );
}

const th = 'text-left text-xs font-semibold uppercase tracking-wide py-3 px-4 whitespace-nowrap';
