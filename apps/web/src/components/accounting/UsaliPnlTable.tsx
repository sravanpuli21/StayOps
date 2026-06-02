import type { LedgerTransaction, ChartOfAccount } from '@hos/shared';
import { formatCurrency } from '@hos/shared';

interface Props {
  transactions: LedgerTransaction[];
  coa: ChartOfAccount[];
}

interface RowDef {
  key: string;
  label: string;
  indent: number;
  /** Sum of all transactions whose accountId is in `accounts`. */
  accounts?: string[];
  /** Computed from other rows by key. */
  formula?: (rows: Record<string, number>) => number;
  /** Display style. */
  style?: 'normal' | 'subtotal' | 'total' | 'gop' | 'noi';
}

const ROWS: RowDef[] = [
  // Operating Departments
  { key: 'rooms-rev',  label: 'Rooms Revenue',                  indent: 1, accounts: ['acc-4100', 'acc-4110'] },
  { key: 'rooms-exp',  label: 'Rooms Expenses',                 indent: 1, accounts: ['acc-5100', 'acc-5110', 'acc-5120', 'acc-5130', 'acc-5210', 'acc-5220'] },
  { key: 'rooms-prof', label: 'Rooms Departmental Profit',      indent: 0, formula: (r) => r['rooms-rev'] + r['rooms-exp'], style: 'subtotal' },

  { key: 'fb-rev',     label: 'F&B Revenue',                    indent: 1, accounts: ['acc-4200', 'acc-4210', 'acc-4220'] },
  { key: 'fb-exp',     label: 'F&B Expenses',                   indent: 1, accounts: ['acc-5300', 'acc-5310', 'acc-5320'] },
  { key: 'fb-prof',    label: 'F&B Departmental Profit',        indent: 0, formula: (r) => r['fb-rev'] + r['fb-exp'], style: 'subtotal' },

  { key: 'oth-rev',    label: 'Other Operated Revenue',         indent: 1, accounts: ['acc-4300', 'acc-4310', 'acc-4320'] },
  { key: 'oth-exp',    label: 'Other Operated Expenses',        indent: 1, accounts: ['acc-5400'] },
  { key: 'oth-prof',   label: 'Other Departmental Profit',      indent: 0, formula: (r) => r['oth-rev'] + r['oth-exp'], style: 'subtotal' },

  { key: 'tot-dept',   label: 'Total Departmental Profit',      indent: 0, formula: (r) => r['rooms-prof'] + r['fb-prof'] + r['oth-prof'], style: 'total' },

  // Undistributed
  { key: 'ag',         label: 'Administrative & General',       indent: 1, accounts: ['acc-6100', 'acc-6110', 'acc-6120'] },
  { key: 'it',         label: 'IT & Telecom',                   indent: 1, accounts: ['acc-6200'] },
  { key: 'sm',         label: 'Sales & Marketing',              indent: 1, accounts: ['acc-6300'] },
  { key: 'util',       label: 'Utilities',                      indent: 1, accounts: ['acc-6400', 'acc-6410', 'acc-6420', 'acc-6430'] },
  { key: 'rm',         label: 'Repairs & Maintenance',          indent: 1, accounts: ['acc-6500'] },

  { key: 'gop',        label: 'GROSS OPERATING PROFIT (GOP)',   indent: 0, formula: (r) => r['tot-dept'] + r['ag'] + r['it'] + r['sm'] + r['util'] + r['rm'], style: 'gop' },

  // Fixed
  { key: 'tax',        label: 'Property Tax',                   indent: 1, accounts: ['acc-7100'] },
  { key: 'ins',        label: 'Insurance',                      indent: 1, accounts: ['acc-7200'] },
  { key: 'mgmt',       label: 'Mgmt & Franchise Fees',          indent: 1, accounts: ['acc-7300'] },
  { key: 'lease',      label: 'Lease / Rent',                   indent: 1, accounts: ['acc-7400'] },

  { key: 'noi',        label: 'NET OPERATING INCOME (NOI)',     indent: 0, formula: (r) => r['gop'] + r['tax'] + r['ins'] + r['mgmt'] + r['lease'], style: 'noi' },
];

export function UsaliPnlTable({ transactions, coa: _coa }: Props) {
  const totalsByAccount = new Map<string, number>();
  for (const t of transactions) {
    totalsByAccount.set(t.accountId, (totalsByAccount.get(t.accountId) ?? 0) + t.amount);
  }

  const totalRevenue =
    (totalsByAccount.get('acc-4100') ?? 0) +
    (totalsByAccount.get('acc-4110') ?? 0) +
    (totalsByAccount.get('acc-4200') ?? 0) +
    (totalsByAccount.get('acc-4210') ?? 0) +
    (totalsByAccount.get('acc-4220') ?? 0) +
    (totalsByAccount.get('acc-4300') ?? 0) +
    (totalsByAccount.get('acc-4310') ?? 0) +
    (totalsByAccount.get('acc-4320') ?? 0);

  const computed: Record<string, number> = {};
  for (const row of ROWS) {
    if (row.accounts) {
      computed[row.key] = row.accounts.reduce((s, a) => s + (totalsByAccount.get(a) ?? 0), 0);
    } else if (row.formula) {
      computed[row.key] = row.formula(computed);
    } else {
      computed[row.key] = 0;
    }
  }

  const pct = (v: number) => (totalRevenue > 0 ? `${Math.round((v / totalRevenue) * 1000) / 10}%` : '—');

  const styleFor = (s: RowDef['style']) => {
    if (s === 'gop') return { background: '#fff7ed', borderTop: '2px solid #d97706', borderBottom: '2px solid #d97706', fontWeight: 700, color: '#7c2d12' };
    if (s === 'noi') return { background: '#f0fdf4', borderTop: '2px solid #15803d', borderBottom: '2px solid #15803d', fontWeight: 700, color: '#14532d' };
    if (s === 'total')    return { background: '#f7f7f7', fontWeight: 700, color: '#222222' };
    if (s === 'subtotal') return { background: '#fafafa', fontWeight: 600, color: '#222222' };
    return { color: '#3f3f3f' };
  };

  return (
    <div className="overflow-x-auto rounded-2xl" style={{ border: '1px solid #dddddd', background: '#ffffff' }}>
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr style={{ borderBottom: '1px solid #dddddd', background: '#f7f7f7' }}>
            <th className="text-left text-xs font-bold uppercase tracking-wide py-3 px-4" style={{ color: '#6a6a6a' }}>Line Item</th>
            <th className="text-right text-xs font-bold uppercase tracking-wide py-3 px-4" style={{ color: '#6a6a6a' }}>Actual</th>
            <th className="text-right text-xs font-bold uppercase tracking-wide py-3 px-4" style={{ color: '#6a6a6a' }}>% Total Rev</th>
          </tr>
        </thead>
        <tbody>
          {ROWS.map((row) => {
            const value = computed[row.key];
            const s = styleFor(row.style);
            return (
              <tr key={row.key} style={{ borderBottom: '1px solid #f0f0f0', ...s }}>
                <td className="py-2.5 px-4" style={{ paddingLeft: 16 + row.indent * 16 }}>
                  {row.label}
                </td>
                <td className="py-2.5 px-4 text-right tabular-nums">
                  {value === 0 ? '—' : formatCurrency(value)}
                </td>
                <td className="py-2.5 px-4 text-right tabular-nums" style={{ color: '#6a6a6a' }}>
                  {row.label === 'Rooms Revenue' || value === 0 ? '—' : pct(value)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
