import type { LedgerTransaction, ChartOfAccount } from '@hos/shared';
import { formatCurrency } from '@hos/shared';

interface Props {
  transactions: LedgerTransaction[];
  coa: ChartOfAccount[];
}

export function CashFlowTable({ transactions, coa }: Props) {
  const accountById = new Map(coa.map((a) => [a.id, a]));

  // Operating: revenue + operating expenses (4xxx, 5xxx, 6xxx, undistributed/fixed)
  let inflowRevenue = 0;
  let outflowOps = 0;
  let outflowFixed = 0;
  let outflowFinancing = 0;
  let outflowNonOp = 0;

  for (const t of transactions) {
    const a = accountById.get(t.accountId);
    if (!a) continue;
    if (a.type === 'revenue') inflowRevenue += t.amount;
    else if (a.type === 'expense') {
      if (a.usaliDept === 'rooms' || a.usaliDept === 'fb' || a.usaliDept === 'other-op' || a.usaliDept === 'undistributed') outflowOps += t.amount;
      else if (a.usaliDept === 'fixed') outflowFixed += t.amount;
      else if (a.usaliDept === 'non-op') outflowNonOp += t.amount;
    } else if (a.id === 'acc-2500') outflowFinancing += t.amount;
  }

  const netOperating = inflowRevenue + outflowOps + outflowFixed;
  const netNonOp = outflowNonOp + outflowFinancing;
  const netCashChange = netOperating + netNonOp;

  const rows = [
    { label: 'OPERATING ACTIVITIES', isHeader: true, value: 0 },
    { label: 'Revenue collected (Rooms · F&B · Other)', value: inflowRevenue, indent: 1 },
    { label: 'Departmental expenses paid',              value: outflowOps,    indent: 1 },
    { label: 'Fixed charges paid (Tax · Insurance · Mgmt · Lease)', value: outflowFixed, indent: 1 },
    { label: 'Net cash from operations', value: netOperating, isSubtotal: true },

    { label: 'FINANCING & NON-OPERATING', isHeader: true, value: 0 },
    { label: 'Interest expense',  value: outflowNonOp,    indent: 1 },
    { label: 'Mortgage payments', value: outflowFinancing, indent: 1 },
    { label: 'Net cash from financing & non-op', value: netNonOp, isSubtotal: true },

    { label: 'NET CHANGE IN CASH', value: netCashChange, isTotal: true },
  ];

  return (
    <div className="overflow-x-auto rounded-2xl" style={{ border: '1px solid #dddddd', background: '#ffffff' }}>
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr style={{ borderBottom: '1px solid #dddddd', background: '#f7f7f7' }}>
            <th className="text-left text-xs font-bold uppercase tracking-wide py-3 px-4" style={{ color: '#6a6a6a' }}>Line Item</th>
            <th className="text-right text-xs font-bold uppercase tracking-wide py-3 px-4" style={{ color: '#6a6a6a' }}>Cash Movement</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => {
            const isHeader = r.isHeader;
            const style: React.CSSProperties = {
              borderBottom: '1px solid #f0f0f0',
              ...(isHeader && { background: '#f7f7f7', fontWeight: 700, color: '#6a6a6a', fontSize: 11, letterSpacing: '0.05em', textTransform: 'uppercase' }),
              ...(r.isSubtotal && { background: '#fafafa', fontWeight: 600, color: '#222222' }),
              ...(r.isTotal && { background: '#f0fdf4', borderTop: '2px solid #15803d', borderBottom: '2px solid #15803d', fontWeight: 700, color: '#14532d' }),
            };
            return (
              <tr key={i} style={style}>
                <td className="py-2.5 px-4" style={{ paddingLeft: 16 + (r.indent ?? 0) * 16 }}>{r.label}</td>
                <td className="py-2.5 px-4 text-right tabular-nums">{isHeader ? '' : formatCurrency(r.value)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
