'use client';

import { useMemo, useState } from 'react';
import type { Bill, Vendor, Hotel } from '@hos/shared';
import { formatCurrency, daysOverdue } from '@hos/shared';
import { payBills } from '@/lib/accounting-store';

type Filter = 'all' | 'open' | 'overdue' | 'paid';

interface Props {
  bills: Bill[];
  vendors: Vendor[];
  hotels: Hotel[];
  /** Date to stamp paid bills with (statement close date). */
  paidIso?: string;
}

const STATUS_STYLE: Record<Bill['status'], { bg: string; color: string; label: string }> = {
  open:    { bg: '#dbeafe', color: '#1d4ed8', label: 'OPEN' },
  overdue: { bg: '#fee2e2', color: '#b91c1c', label: 'OVERDUE' },
  paid:    { bg: '#dcfce7', color: '#15803d', label: 'PAID' },
};

export function BillsTable({ bills, vendors, hotels, paidIso }: Props) {
  const [filter, setFilter] = useState<Filter>('all');
  const [vendorQuery, setVendorQuery] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const handlePay = () => {
    const toPay = bills.filter((b) => selected.has(b.id) && b.status !== 'paid');
    if (toPay.length === 0) return;
    payBills(
      toPay.map((b) => ({ id: b.id, hotelId: b.hotelId, vendorId: b.vendorId, amount: b.amount })),
      paidIso ?? new Date().toISOString().slice(0, 10),
    );
    setSelected(new Set());
  };

  const vendorById = useMemo(() => new Map(vendors.map((v) => [v.id, v])), [vendors]);
  const hotelById = useMemo(() => new Map(hotels.map((h) => [h.id, h])), [hotels]);

  const filtered = useMemo(() => {
    let rows = bills;
    if (filter !== 'all') rows = rows.filter((b) => b.status === filter);
    if (vendorQuery.trim()) {
      const q = vendorQuery.toLowerCase();
      rows = rows.filter((b) => {
        const v = vendorById.get(b.vendorId);
        return v?.name.toLowerCase().includes(q) || b.billNumber.toLowerCase().includes(q);
      });
    }
    return rows.sort((a, b) => (a.dueDateIso > b.dueDateIso ? 1 : -1));
  }, [bills, filter, vendorQuery, vendorById]);

  const selectedTotal = useMemo(
    () => filtered.filter((b) => selected.has(b.id) && b.status !== 'paid').reduce((s, b) => s + b.amount, 0),
    [filtered, selected],
  );

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filterChip = (f: Filter, label: string) => (
    <button
      key={f}
      type="button"
      onClick={() => setFilter(f)}
      className="px-3 py-1.5 rounded-full text-xs font-semibold transition-colors"
      style={{
        background: filter === f ? '#222222' : '#ffffff',
        color: filter === f ? '#ffffff' : '#6a6a6a',
        border: '1px solid #dddddd',
      }}
    >
      {label}
    </button>
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2 justify-between">
        <div className="flex flex-wrap gap-2">
          {filterChip('all', 'All')}
          {filterChip('open', 'Open')}
          {filterChip('overdue', 'Overdue')}
          {filterChip('paid', 'Paid')}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            placeholder="Search vendor or bill #"
            value={vendorQuery}
            onChange={(e) => setVendorQuery(e.target.value)}
            className="text-sm px-3 py-1.5 rounded-full"
            style={{ border: '1px solid #dddddd', minWidth: 220 }}
          />
          <button
            type="button"
            disabled={selected.size === 0}
            className="text-xs font-semibold px-3 py-1.5 rounded-full transition-colors"
            style={{
              background: selected.size === 0 ? '#f0f0f0' : '#ff385c',
              color: selected.size === 0 ? '#929292' : '#ffffff',
              cursor: selected.size === 0 ? 'not-allowed' : 'pointer',
            }}
            onClick={handlePay}
          >
            Pay Selected · {formatCurrency(selectedTotal)}
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl" style={{ border: '1px solid #dddddd', background: '#ffffff' }}>
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr style={{ borderBottom: '1px solid #dddddd', background: '#f7f7f7' }}>
              <th className="w-10 py-3 px-4"></th>
              <th className="text-left text-xs font-semibold uppercase tracking-wide py-3 px-4" style={{ color: '#6a6a6a' }}>Vendor</th>
              <th className="text-left text-xs font-semibold uppercase tracking-wide py-3 px-4" style={{ color: '#6a6a6a' }}>Hotel</th>
              <th className="text-left text-xs font-semibold uppercase tracking-wide py-3 px-4" style={{ color: '#6a6a6a' }}>Bill #</th>
              <th className="text-left text-xs font-semibold uppercase tracking-wide py-3 px-4" style={{ color: '#6a6a6a' }}>Due Date</th>
              <th className="text-right text-xs font-semibold uppercase tracking-wide py-3 px-4" style={{ color: '#6a6a6a' }}>Days Overdue</th>
              <th className="text-right text-xs font-semibold uppercase tracking-wide py-3 px-4" style={{ color: '#6a6a6a' }}>Amount</th>
              <th className="text-left text-xs font-semibold uppercase tracking-wide py-3 px-4" style={{ color: '#6a6a6a' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((b, i) => {
              const v = vendorById.get(b.vendorId);
              const h = hotelById.get(b.hotelId);
              const overdue = daysOverdue(b);
              const style = STATUS_STYLE[b.status];
              return (
                <tr key={b.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                  <td className="py-3 px-4">
                    {b.status !== 'paid' && (
                      <input
                        type="checkbox"
                        checked={selected.has(b.id)}
                        onChange={() => toggle(b.id)}
                      />
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-medium text-sm" style={{ color: '#222222' }}>{v?.name ?? b.vendorId}</p>
                    <p className="text-xs mt-0.5" style={{ color: '#929292' }}>{v?.terms}</p>
                  </td>
                  <td className="py-3 px-4 text-xs" style={{ color: '#3f3f3f' }}>{h?.shortName ?? b.hotelId}</td>
                  <td className="py-3 px-4 text-xs" style={{ color: '#6a6a6a' }}>{b.billNumber}</td>
                  <td className="py-3 px-4 text-sm" style={{ color: '#3f3f3f' }}>{b.dueDateIso}</td>
                  <td className="py-3 px-4 text-sm text-right" style={{ color: overdue > 0 ? '#b91c1c' : '#3f3f3f', fontWeight: overdue > 0 ? 600 : 400 }}>
                    {overdue > 0 ? overdue : '—'}
                  </td>
                  <td className="py-3 px-4 text-sm text-right font-semibold" style={{ color: '#222222' }}>
                    {formatCurrency(b.amount)}
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-[10px] font-bold tracking-wide px-1.5 py-0.5 rounded" style={{ background: style.bg, color: style.color }}>
                      {style.label}
                    </span>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="py-8 px-4 text-center text-sm" style={{ color: '#929292' }}>
                  No bills match the current filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
