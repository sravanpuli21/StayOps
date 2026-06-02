'use client';

import { useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import { useAccountingData } from '@/lib/use-accounting-data';
import { DemoDataToggle } from '@/components/accounting/DemoDataToggle';
import { formatCurrency } from '@hos/shared';
import type { Vendor } from '@hos/shared';

export default function VendorsPage() {
  const data = useAccountingData();
  const [query, setQuery] = useState('');
  const [openVendor, setOpenVendor] = useState<Vendor | null>(null);

  const accountById = useMemo(() => new Map(data.coa.map((a) => [a.id, a])), [data.coa]);

  const spendByVendor = useMemo(() => {
    const m = new Map<string, { spend: number; count: number }>();
    for (const t of data.transactions) {
      if (!t.vendorId) continue;
      const cur = m.get(t.vendorId) ?? { spend: 0, count: 0 };
      cur.spend += Math.abs(t.amount);
      cur.count += 1;
      m.set(t.vendorId, cur);
    }
    return m;
  }, [data.transactions]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return data.vendors;
    return data.vendors.filter((v) =>
      v.name.toLowerCase().includes(q) ||
      v.category.toLowerCase().includes(q),
    );
  }, [data.vendors, query]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold" style={{ color: '#222222' }}>Vendors</h1>
          <p className="text-sm mt-0.5" style={{ color: '#929292' }}>
            {data.vendors.length} active vendors · {data.rules.length} learned categorization rules
          </p>
        </div>
        <DemoDataToggle />
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#929292' }} />
          <input
            type="text"
            placeholder="Search vendors by name or category"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full text-sm pl-9 pr-3 py-2 rounded-full"
            style={{ border: '1px solid #dddddd', background: '#ffffff' }}
          />
        </div>
        <button className="text-xs font-semibold px-3 py-1.5 rounded-full" style={{ background: '#222222', color: '#ffffff' }}>
          + Add vendor
        </button>
      </div>

      <div className="overflow-x-auto rounded-2xl" style={{ border: '1px solid #dddddd', background: '#ffffff' }}>
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr style={{ borderBottom: '1px solid #dddddd', background: '#f7f7f7' }}>
              <th className={th}>Vendor</th>
              <th className={th}>Type</th>
              <th className={th}>Default Account</th>
              <th className={th}>Terms</th>
              <th className={th + ' text-right'}>YTD Spend</th>
              <th className={th + ' text-right'}>Tx Count</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((v, i) => {
              const stats = spendByVendor.get(v.id) ?? { spend: 0, count: 0 };
              const acct = accountById.get(v.defaultAccountId);
              return (
                <tr
                  key={v.id}
                  onClick={() => setOpenVendor(v)}
                  className="cursor-pointer hover:bg-[#fafafa]"
                  style={{ borderBottom: i < filtered.length - 1 ? '1px solid #f0f0f0' : 'none' }}
                >
                  <td className="py-3 px-4 font-medium" style={{ color: '#222222' }}>{v.name}</td>
                  <td className="py-3 px-4 text-xs uppercase tracking-wide" style={{ color: '#6a6a6a' }}>{v.category}</td>
                  <td className="py-3 px-4 text-xs" style={{ color: '#3f3f3f' }}>{acct?.name ?? v.defaultAccountId}</td>
                  <td className="py-3 px-4 text-xs" style={{ color: '#3f3f3f' }}>{v.terms}</td>
                  <td className="py-3 px-4 text-sm text-right font-semibold" style={{ color: '#222222' }}>
                    {formatCurrency(stats.spend)}
                  </td>
                  <td className="py-3 px-4 text-xs text-right" style={{ color: '#3f3f3f' }}>{stats.count}</td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 px-4 text-center text-sm" style={{ color: '#929292' }}>No vendors match the search.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {openVendor && (
        <VendorDrawer
          vendor={openVendor}
          accountName={accountById.get(openVendor.defaultAccountId)?.name ?? openVendor.defaultAccountId}
          onClose={() => setOpenVendor(null)}
          stats={spendByVendor.get(openVendor.id) ?? { spend: 0, count: 0 }}
        />
      )}
    </div>
  );
}

const th = 'text-left text-xs font-semibold uppercase tracking-wide py-3 px-4 whitespace-nowrap';

function VendorDrawer({ vendor, accountName, onClose, stats }: { vendor: Vendor; accountName: string; onClose: () => void; stats: { spend: number; count: number } }) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end" style={{ background: 'rgba(0,0,0,0.4)' }}>
      <aside className="bg-white h-full w-full max-w-md flex flex-col" style={{ borderLeft: '1px solid #dddddd' }}>
        <div className="px-6 py-4 flex items-start justify-between" style={{ borderBottom: '1px solid #dddddd' }}>
          <div>
            <p className="text-xs font-bold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>Vendor</p>
            <h3 className="text-base font-bold mt-0.5" style={{ color: '#222222' }}>{vendor.name}</h3>
            <p className="text-xs mt-0.5" style={{ color: '#929292' }}>{vendor.category} · {vendor.terms}</p>
          </div>
          <button onClick={onClose} className="text-[#6a6a6a] hover:text-[#222222]"><X className="w-4 h-4" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <Stat label="YTD Spend" value={formatCurrency(stats.spend)} />
            <Stat label="Transactions" value={stats.count.toString()} />
          </div>

          <Group title="Default Categorization">
            <Row label="Account">{accountName}</Row>
            <Row label="Category">{vendor.category}</Row>
          </Group>

          <Group title="Terms & Payment">
            <Row label="Payment Terms">{vendor.terms}</Row>
            <Row label="Preferred Method">ACH</Row>
            <Row label="Recurring">Yes</Row>
          </Group>

          <Group title="Compliance (Demo)">
            <Row label="W-9">On file</Row>
            <Row label="Insurance Cert">Current · expires 2026-12-31</Row>
          </Group>

          <p className="text-xs" style={{ color: '#929292' }}>Vendor profile editing UI ships next push. Demo data only.</p>
        </div>
      </aside>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl p-4" style={{ border: '1px solid #dddddd', background: '#ffffff' }}>
      <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>{label}</p>
      <p className="text-lg font-bold mt-0.5" style={{ color: '#222222' }}>{value}</p>
    </div>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: '#6a6a6a' }}>{title}</h4>
      <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #f0f0f0' }}>{children}</div>
    </div>
  );
}
function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-4 py-2" style={{ borderBottom: '1px solid #f0f0f0', background: '#ffffff' }}>
      <p className="text-xs" style={{ color: '#6a6a6a' }}>{label}</p>
      <p className="text-sm font-medium" style={{ color: '#222222' }}>{children}</p>
    </div>
  );
}
