'use client';

import { useMemo, useState } from 'react';
import { CheckCircle2, AlertTriangle } from 'lucide-react';
import { useAccountingData } from '@/lib/use-accounting-data';
import { DemoDataToggle } from '@/components/accounting/DemoDataToggle';
import { ReconcileSheet } from '@/components/accounting/ReconcileSheet';
import { formatCurrency, HOTELS } from '@hos/shared';

export default function ReconciliationPage() {
  const data = useAccountingData();
  const [openId, setOpenId] = useState<string | null>(null);

  const accounts = useMemo(
    () => data.bankAccounts.filter((b) => b.hotelId !== 'CONSOLIDATED'),
    [data.bankAccounts],
  );

  const summary = useMemo(() => {
    const total = accounts.length;
    const reconciled = accounts.filter((a) => Math.abs(a.statementBalance - a.bookBalance) < 1).length;
    const drift = accounts.filter((a) => Math.abs(a.statementBalance - a.bookBalance) >= 1).length;
    return { total, reconciled, drift };
  }, [accounts]);

  const reconAccount = accounts.find((a) => a.id === openId) ?? null;
  const reconRows = reconAccount ? data.bankRows.filter((r) => r.bankAccountId === reconAccount.id) : [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold" style={{ color: '#222222' }}>Reconciliation</h1>
          <p className="text-sm mt-0.5" style={{ color: '#929292' }}>
            Date-wise reconciliation across {summary.total} accounts · {summary.reconciled} balanced · {summary.drift} with drift
          </p>
        </div>
        <DemoDataToggle />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <SummaryCard label="Reconciled" value={summary.reconciled} total={summary.total} accent="#15803d" bg="#f0fdf4" icon={<CheckCircle2 className="w-4 h-4" style={{ color: '#15803d' }} />} />
        <SummaryCard label="Drift" value={summary.drift} total={summary.total} accent="#b45309" bg="#fffbeb" icon={<AlertTriangle className="w-4 h-4" style={{ color: '#b45309' }} />} />
        <SummaryCard label="Unreconciled Tx" value={data.unreconciledCount} total={data.bankRows.length + data.ccRows.length + data.otaRows.length} accent="#3f3f3f" bg="#ffffff" icon={null} />
      </div>

      <div className="overflow-x-auto rounded-2xl" style={{ border: '1px solid #dddddd', background: '#ffffff' }}>
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr style={{ borderBottom: '1px solid #dddddd', background: '#f7f7f7' }}>
              <th className={th}>Hotel</th>
              <th className={th}>Account</th>
              <th className={th}>Last 4</th>
              <th className={th + ' text-right'}>Statement</th>
              <th className={th + ' text-right'}>Book</th>
              <th className={th + ' text-right'}>Drift</th>
              <th className={th}>Period Status</th>
              <th className={th}>Action</th>
            </tr>
          </thead>
          <tbody>
            {accounts.map((b, i) => {
              const drift = b.statementBalance - b.bookBalance;
              const balanced = Math.abs(drift) < 1;
              const closeForApr = data.closePeriods.find((c) => c.accountId === b.id && c.periodEndIso === '2026-04-30');
              const closeForMay = data.closePeriods.find((c) => c.accountId === b.id && c.periodEndIso === '2026-05-31');
              const period = closeForMay ?? closeForApr;
              const periodPill = period?.status === 'closed' ? { bg: '#dcfce7', color: '#15803d', label: 'CLOSED · APR' }
                : period?.status === 'closed-with-exceptions' ? { bg: '#fed7aa', color: '#9a3412', label: 'CLOSED w/ EXC' }
                : period?.status === 'reopened' ? { bg: '#fef3c7', color: '#92400e', label: 'REOPENED' }
                : { bg: '#fef3c7', color: '#92400e', label: 'OPEN' };
              return (
                <tr key={b.id} style={{ borderBottom: i < accounts.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                  <td className="py-2.5 px-4 text-xs" style={{ color: '#3f3f3f' }}>{HOTELS.find((h) => h.id === b.hotelId)?.shortName ?? b.hotelId}</td>
                  <td className="py-2.5 px-4 text-sm font-medium" style={{ color: '#222222' }}>{b.kind.toUpperCase()}</td>
                  <td className="py-2.5 px-4 text-xs font-mono" style={{ color: '#3f3f3f' }}>····{b.last4}</td>
                  <td className="py-2.5 px-4 text-sm text-right" style={{ color: '#3f3f3f' }}>{formatCurrency(b.statementBalance)}</td>
                  <td className="py-2.5 px-4 text-sm text-right font-semibold" style={{ color: '#222222' }}>{formatCurrency(b.bookBalance)}</td>
                  <td className="py-2.5 px-4 text-sm text-right" style={{ color: balanced ? '#15803d' : '#b45309' }}>
                    {drift >= 0 ? '+' : ''}{formatCurrency(drift)}
                  </td>
                  <td className="py-2.5 px-4">
                    <span className="text-[10px] font-bold tracking-wide px-1.5 py-0.5 rounded" style={{ background: periodPill.bg, color: periodPill.color }}>
                      {periodPill.label}
                    </span>
                    {period?.exceptionCount ? (
                      <p className="text-[10px] mt-0.5" style={{ color: '#92400e' }}>{period.exceptionCount} exception{period.exceptionCount === 1 ? '' : 's'}</p>
                    ) : null}
                  </td>
                  <td className="py-2.5 px-4">
                    <button
                      onClick={() => setOpenId(b.id)}
                      className="text-[10px] font-semibold px-3 py-1 rounded-full"
                      style={{ background: balanced ? '#f0f0f0' : '#ff385c', color: balanced ? '#3f3f3f' : '#ffffff' }}
                    >
                      {balanced ? 'Review' : 'Reconcile'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <ReconcileSheet open={!!openId} onClose={() => setOpenId(null)} bankAccount={reconAccount} rows={reconRows} />
    </div>
  );
}

const th = 'text-left text-xs font-semibold uppercase tracking-wide py-3 px-4 whitespace-nowrap';

function SummaryCard({ label, value, total, accent, bg, icon }: { label: string; value: number; total: number; accent: string; bg: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-2xl p-4" style={{ border: '1px solid #dddddd', background: bg }}>
      <div className="flex items-center gap-2">
        {icon}
        <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: accent }}>{label}</p>
      </div>
      <p className="text-2xl font-bold mt-1" style={{ color: '#222222' }}>{value}<span className="text-sm font-normal" style={{ color: '#929292' }}> / {total}</span></p>
    </div>
  );
}
