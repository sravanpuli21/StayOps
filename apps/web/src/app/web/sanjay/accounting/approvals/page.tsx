'use client';

import { useMemo, useState } from 'react';
import { useAccountingData } from '@/lib/use-accounting-data';
import { DemoDataToggle } from '@/components/accounting/DemoDataToggle';
import { formatCurrency } from '@hos/shared';
import type { ApprovalStatus } from '@hos/shared';

const STATUS_STYLE: Record<ApprovalStatus, { bg: string; color: string; label: string }> = {
  'pending':                 { bg: '#fef3c7', color: '#92400e', label: 'PENDING' },
  'approved':                { bg: '#dcfce7', color: '#15803d', label: 'APPROVED' },
  'rejected':                { bg: '#fee2e2', color: '#b91c1c', label: 'REJECTED' },
  'approved-with-exception': { bg: '#fed7aa', color: '#9a3412', label: 'APPROVED · EXCEPTION' },
  'emergency-bypass':        { bg: '#fee2e2', color: '#b91c1c', label: 'EMERGENCY BYPASS' },
  'not-required':            { bg: '#f0f0f0', color: '#6a6a6a', label: 'NOT REQUIRED' },
};

const ROLE_STYLE = {
  'GM':                { bg: '#dcfce7', color: '#15803d' },
  'Regional Manager':  { bg: '#fef3c7', color: '#92400e' },
  'Owner':             { bg: '#fee2e2', color: '#b91c1c' },
};

type Filter = 'all' | ApprovalStatus;

export default function ApprovalsPage() {
  const data = useAccountingData();
  const [filter, setFilter] = useState<Filter>('all');

  const hotelById = useMemo(() => new Map(data.hotels.map((h) => [h.id, h])), [data.hotels]);

  const filtered = useMemo(() => {
    if (filter === 'all') return data.approvals;
    return data.approvals.filter((a) => a.status === filter);
  }, [data.approvals, filter]);

  const counts = useMemo(() => {
    const c: Record<ApprovalStatus, number> = {
      'not-required': 0, 'pending': 0, 'approved': 0, 'rejected': 0,
      'approved-with-exception': 0, 'emergency-bypass': 0,
    };
    for (const a of data.approvals) c[a.status] += 1;
    return c;
  }, [data.approvals]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold" style={{ color: '#222222' }}>Approvals</h1>
          <p className="text-sm mt-0.5" style={{ color: '#929292' }}>
            {data.approvals.length} requests · {counts.pending} pending · GM ≤$500 · Regional ≤$2k · Owner &gt;$2k
          </p>
        </div>
        <DemoDataToggle />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {([
          ['Pending', 'pending', '#92400e', '#fef3c7'],
          ['Approved', 'approved', '#15803d', '#f0fdf4'],
          ['Exception', 'approved-with-exception', '#9a3412', '#fed7aa'],
          ['Bypass', 'emergency-bypass', '#b91c1c', '#fee2e2'],
          ['Rejected', 'rejected', '#b91c1c', '#fee2e2'],
        ] as Array<[string, ApprovalStatus, string, string]>).map(([label, key, color, bg]) => (
          <div key={key} className="rounded-2xl p-4" style={{ border: '1px solid #dddddd', background: bg }}>
            <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color }}>{label}</p>
            <p className="text-2xl font-bold mt-0.5" style={{ color: '#222222' }}>{counts[key]}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {(['all', 'pending', 'approved', 'rejected', 'approved-with-exception', 'emergency-bypass'] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="text-xs font-semibold px-3 py-1.5 rounded-full transition-colors"
            style={{
              background: filter === f ? '#222222' : '#ffffff',
              color: filter === f ? '#ffffff' : '#6a6a6a',
              border: '1px solid #dddddd',
            }}
          >
            {f === 'all' ? 'All' : STATUS_STYLE[f].label}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-2xl" style={{ border: '1px solid #dddddd', background: '#ffffff' }}>
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr style={{ borderBottom: '1px solid #dddddd', background: '#f7f7f7' }}>
              <th className={th}>Date</th>
              <th className={th}>Hotel</th>
              <th className={th}>Category</th>
              <th className={th}>Requested By</th>
              <th className={th + ' text-right'}>Amount</th>
              <th className={th}>Approver</th>
              <th className={th}>Status</th>
              <th className={th}>Note</th>
            </tr>
          </thead>
          <tbody>
            {filtered.slice(0, 100).map((a, i) => {
              const status = STATUS_STYLE[a.status];
              const role = ROLE_STYLE[a.approverRole];
              const h = hotelById.get(a.hotelId);
              return (
                <tr key={a.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                  <td className="py-2.5 px-4 text-xs" style={{ color: '#3f3f3f' }}>{a.requestedIso}</td>
                  <td className="py-2.5 px-4 text-xs" style={{ color: '#3f3f3f' }}>{h?.shortName ?? a.hotelId}</td>
                  <td className="py-2.5 px-4 text-xs" style={{ color: '#222222' }}>{a.category}</td>
                  <td className="py-2.5 px-4 text-xs" style={{ color: '#3f3f3f' }}>{a.requestedBy}</td>
                  <td className="py-2.5 px-4 text-sm text-right font-semibold" style={{ color: '#b91c1c' }}>{formatCurrency(a.amount)}</td>
                  <td className="py-2.5 px-4">
                    <span className="text-[10px] font-bold tracking-wide px-1.5 py-0.5 rounded" style={{ background: role.bg, color: role.color }}>
                      {a.approverRole.toUpperCase()}
                    </span>
                    {a.approverName && (
                      <p className="text-[10px] mt-0.5" style={{ color: '#929292' }}>by {a.approverName}</p>
                    )}
                  </td>
                  <td className="py-2.5 px-4">
                    <span className="text-[10px] font-bold tracking-wide px-1.5 py-0.5 rounded" style={{ background: status.bg, color: status.color }}>
                      {status.label}
                    </span>
                    {a.decidedIso && a.status !== 'pending' && (
                      <p className="text-[10px] mt-0.5" style={{ color: '#929292' }}>{a.decidedIso}</p>
                    )}
                  </td>
                  <td className="py-2.5 px-4 text-[10px]" style={{ color: '#6a6a6a', maxWidth: 240 }}>
                    {a.reason ?? '—'}
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={8} className="py-8 px-4 text-center text-sm" style={{ color: '#929292' }}>No requests in this filter.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      {filtered.length > 100 && <p className="text-xs text-center" style={{ color: '#929292' }}>Showing 100 of {filtered.length}.</p>}
    </div>
  );
}

const th = 'text-left text-xs font-semibold uppercase tracking-wide py-3 px-4 whitespace-nowrap';
