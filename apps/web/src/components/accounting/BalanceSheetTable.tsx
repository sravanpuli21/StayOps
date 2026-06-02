import type { BankAccount, LedgerTransaction, ChartOfAccount, Bill } from '@hos/shared';
import { formatCurrency } from '@hos/shared';

interface Props {
  bankAccounts: BankAccount[];
  transactions: LedgerTransaction[];
  bills: Bill[];
  coa: ChartOfAccount[];
}

export function BalanceSheetTable({ bankAccounts, transactions, bills, coa }: Props) {
  const accountById = new Map(coa.map((a) => [a.id, a]));

  const cashOps = bankAccounts.filter((b) => b.kind === 'operating' && b.hotelId !== 'CONSOLIDATED').reduce((s, b) => s + b.bookBalance, 0);
  const ccLiability = bankAccounts.filter((b) => b.kind === 'cc').reduce((s, b) => s + Math.abs(b.bookBalance), 0);
  const apOpen = bills.filter((b) => b.status === 'open' || b.status === 'overdue').reduce((s, b) => s + b.amount, 0);

  // PP&E + accrued payroll + other balance-sheet account totals
  let ppe = 0, accruedPayroll = 0, occupancyTax = 0;
  for (const t of transactions) {
    const a = accountById.get(t.accountId);
    if (a?.id === 'acc-1500') ppe += t.amount;
    if (a?.id === 'acc-2100') accruedPayroll += Math.abs(t.amount);
    if (a?.id === 'acc-2210') occupancyTax += Math.abs(t.amount);
  }

  // Mock values for static balance-sheet items not driven by tx data
  const mockPPE = ppe || 12_500_000;
  const mockMortgage = 8_200_000;
  const mockOwnerEquity = 3_400_000;

  const totalAssets = cashOps + 0 /* AR */ + 250_000 /* inventory */ + mockPPE;
  const totalLiabilities = ccLiability + apOpen + accruedPayroll + occupancyTax + mockMortgage;
  const retainedEarnings = totalAssets - totalLiabilities - mockOwnerEquity;
  const totalEquity = mockOwnerEquity + retainedEarnings;

  const rows = [
    { label: 'ASSETS', isHeader: true, value: 0 },
    { label: 'Cash – Operating',                          value: cashOps,          indent: 1 },
    { label: 'Accounts Receivable',                       value: 0,                indent: 1 },
    { label: 'Inventory (F&B + Operating Supplies)',      value: 250_000,          indent: 1 },
    { label: 'Property, Plant & Equipment',               value: mockPPE,          indent: 1 },
    { label: 'Total Assets',                              value: totalAssets,      isSubtotal: true },

    { label: 'LIABILITIES', isHeader: true, value: 0 },
    { label: 'Credit Card Payable',                       value: ccLiability,      indent: 1 },
    { label: 'Accounts Payable',                          value: apOpen,           indent: 1 },
    { label: 'Accrued Payroll',                           value: accruedPayroll,   indent: 1 },
    { label: 'Occupancy Tax Payable',                     value: occupancyTax,     indent: 1 },
    { label: 'Mortgage Payable',                          value: mockMortgage,     indent: 1 },
    { label: 'Total Liabilities',                         value: totalLiabilities, isSubtotal: true },

    { label: 'EQUITY', isHeader: true, value: 0 },
    { label: 'Owner Equity',                              value: mockOwnerEquity,  indent: 1 },
    { label: 'Retained Earnings',                         value: retainedEarnings, indent: 1 },
    { label: 'Total Equity',                              value: totalEquity,      isSubtotal: true },

    { label: 'TOTAL LIABILITIES & EQUITY',                value: totalLiabilities + totalEquity, isTotal: true },
  ];

  return (
    <div className="overflow-x-auto rounded-2xl" style={{ border: '1px solid #dddddd', background: '#ffffff' }}>
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr style={{ borderBottom: '1px solid #dddddd', background: '#f7f7f7' }}>
            <th className="text-left text-xs font-bold uppercase tracking-wide py-3 px-4" style={{ color: '#6a6a6a' }}>Account</th>
            <th className="text-right text-xs font-bold uppercase tracking-wide py-3 px-4" style={{ color: '#6a6a6a' }}>Balance</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => {
            const style: React.CSSProperties = {
              borderBottom: '1px solid #f0f0f0',
              ...(r.isHeader && { background: '#f7f7f7', fontWeight: 700, color: '#6a6a6a', fontSize: 11, letterSpacing: '0.05em', textTransform: 'uppercase' }),
              ...(r.isSubtotal && { background: '#fafafa', fontWeight: 600, color: '#222222' }),
              ...(r.isTotal && { background: '#fff7ed', borderTop: '2px solid #d97706', borderBottom: '2px solid #d97706', fontWeight: 700, color: '#7c2d12' }),
            };
            return (
              <tr key={i} style={style}>
                <td className="py-2.5 px-4" style={{ paddingLeft: 16 + (r.indent ?? 0) * 16 }}>{r.label}</td>
                <td className="py-2.5 px-4 text-right tabular-nums">{r.isHeader ? '' : formatCurrency(r.value)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
