import type { VendorSpend } from '@hos/shared';
import { formatCurrency } from '@hos/shared';

interface Props {
  vendors: VendorSpend[];
}

export function VendorSpendTable({ vendors }: Props) {
  const top = vendors.slice(0, 10);
  const th = 'text-left text-xs font-semibold uppercase tracking-wide py-3 px-4 whitespace-nowrap';

  return (
    <div className="overflow-x-auto rounded-2xl" style={{ border: '1px solid #dddddd', background: '#ffffff' }}>
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr style={{ borderBottom: '1px solid #dddddd', background: '#f7f7f7' }}>
            <th className={th} style={{ color: '#6a6a6a' }}>Vendor</th>
            <th className={th} style={{ color: '#6a6a6a', textAlign: 'right' }}>Work Orders</th>
            <th className={th} style={{ color: '#6a6a6a', textAlign: 'right' }}>Properties Served</th>
            <th className={th} style={{ color: '#6a6a6a', textAlign: 'right' }}>Total Spend (12mo)</th>
            <th className={th} style={{ color: '#6a6a6a', textAlign: 'right' }}>Avg / Order</th>
          </tr>
        </thead>
        <tbody>
          {top.map((v, i) => (
            <tr key={v.vendor} style={{ borderBottom: i < top.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
              <td className="py-3 px-4 text-sm font-medium" style={{ color: '#222222' }}>{v.vendor}</td>
              <td className="py-3 px-4 text-sm text-right" style={{ color: '#3f3f3f' }}>{v.workOrderCount}</td>
              <td className="py-3 px-4 text-sm text-right" style={{ color: '#3f3f3f' }}>{v.hotelIds.length}</td>
              <td className="py-3 px-4 text-sm text-right font-semibold" style={{ color: '#222222' }}>{formatCurrency(v.totalSpend, true)}</td>
              <td className="py-3 px-4 text-sm text-right" style={{ color: '#6a6a6a' }}>{formatCurrency(v.totalSpend / v.workOrderCount)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
