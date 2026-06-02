import type { LedgerTransaction, ChartOfAccount, Vendor } from '@hos/shared';
import { formatCurrency } from '@hos/shared';

interface Props {
  transactions: LedgerTransaction[];
  coa: ChartOfAccount[];
  vendors: Vendor[];
  limit?: number;
}

const SOURCE_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  bank:    { bg: '#e0f2fe', color: '#0369a1', label: 'BANK' },
  cc:      { bg: '#fef3c7', color: '#92400e', label: 'CC' },
  ota:     { bg: '#fce7f3', color: '#be185d', label: 'OTA' },
  payroll: { bg: '#ede9fe', color: '#6d28d9', label: 'PAYROLL' },
  manual:  { bg: '#e5e7eb', color: '#374151', label: 'MANUAL' },
};

export function RecentTransactions({ transactions, coa, vendors, limit = 8 }: Props) {
  const accountById = new Map(coa.map((a) => [a.id, a]));
  const vendorById = new Map(vendors.map((v) => [v.id, v]));
  const rows = transactions.slice(0, limit);

  if (rows.length === 0) {
    return (
      <div className="rounded-2xl p-6 text-sm" style={{ border: '1px solid #dddddd', background: '#ffffff', color: '#6a6a6a' }}>
        No transactions in current scope.
      </div>
    );
  }

  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #dddddd', background: '#ffffff' }}>
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr style={{ borderBottom: '1px solid #dddddd', background: '#f7f7f7' }}>
            <th className="text-left text-xs font-semibold uppercase tracking-wide py-3 px-4" style={{ color: '#6a6a6a' }}>Date</th>
            <th className="text-left text-xs font-semibold uppercase tracking-wide py-3 px-4" style={{ color: '#6a6a6a' }}>Source</th>
            <th className="text-left text-xs font-semibold uppercase tracking-wide py-3 px-4" style={{ color: '#6a6a6a' }}>Account</th>
            <th className="text-left text-xs font-semibold uppercase tracking-wide py-3 px-4" style={{ color: '#6a6a6a' }}>Memo</th>
            <th className="text-right text-xs font-semibold uppercase tracking-wide py-3 px-4" style={{ color: '#6a6a6a' }}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((t, i) => {
            const acct = accountById.get(t.accountId);
            const vendor = t.vendorId ? vendorById.get(t.vendorId) : null;
            const style = SOURCE_STYLE[t.source];
            return (
              <tr key={t.id} style={{ borderBottom: i < rows.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                <td className="py-3 px-4 text-sm" style={{ color: '#3f3f3f' }}>{t.dateIso}</td>
                <td className="py-3 px-4">
                  <span className="text-[10px] font-bold tracking-wide px-1.5 py-0.5 rounded" style={{ background: style.bg, color: style.color }}>
                    {style.label}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <p className="font-medium text-sm" style={{ color: '#222222' }}>{acct?.name ?? t.accountId}</p>
                  {vendor && <p className="text-xs mt-0.5" style={{ color: '#929292' }}>{vendor.name}</p>}
                </td>
                <td className="py-3 px-4 text-xs" style={{ color: '#6a6a6a' }}>{t.memo}</td>
                <td className="py-3 px-4 text-sm text-right font-semibold" style={{ color: t.amount >= 0 ? '#15803d' : '#b91c1c' }}>
                  {t.amount >= 0 ? '+' : ''}{formatCurrency(t.amount)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
