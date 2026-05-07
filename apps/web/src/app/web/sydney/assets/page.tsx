'use client';

import { useMemo } from 'react';
import { Package, AlertTriangle, TrendingDown } from 'lucide-react';
import { formatCurrency } from '@hos/shared';
import { SYDNEY_HOTEL, getHotelAssets, getAssetSummary, getHotelVendorSpend } from '@/lib/sydney-data';

function fmtDate(iso?: string): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

const CONDITION_CFG: Record<string, { color: string; bg: string }> = {
  good:    { color: '#15803d', bg: '#f0fdf4' },
  fair:    { color: '#b45309', bg: '#fffbeb' },
  failing: { color: '#b91c1c', bg: '#fef2f2' },
};

export default function SydneyAssetsPage() {
  const assets = useMemo(() => getHotelAssets(), []);
  const summary = useMemo(() => getAssetSummary(), []);
  const vendors = useMemo(() => getHotelVendorSpend(), []);

  const byCategory = useMemo(() => {
    const m = new Map<string, typeof assets>();
    for (const a of assets) {
      if (!m.has(a.category)) m.set(a.category, []);
      m.get(a.category)!.push(a);
    }
    return Array.from(m.entries()).sort((a, b) => b[1].length - a[1].length);
  }, [assets]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold" style={{ color: '#222222' }}>Building Systems & Assets</h1>
        <p className="text-sm mt-0.5" style={{ color: '#929292' }}>
          {SYDNEY_HOTEL.shortName} · {assets.length} tracked assets · {summary?.failingAssets ?? 0} failing · {summary?.agingAssets ?? 0} aging
        </p>
      </div>

      {/* Summary cards */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Stat label="Total value"  value={formatCurrency(summary.totalValue, true)} sub={`${summary.totalAssets} assets`} />
          <Stat label="Aging"        value={summary.agingAssets.toString()} sub="> 80% of life" color="#b45309" />
          <Stat label="Failing"      value={summary.failingAssets.toString()} sub="need action"   color="#b91c1c" alert={summary.failingAssets > 2} />
          <Stat label="YTD spend"    value={formatCurrency(summary.ytdSpend, true)} sub="repairs + preventive" />
        </div>
      )}

      {/* By category */}
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wide mb-3" style={{ color: '#6a6a6a' }}>Assets by system</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {byCategory.map(([cat, catAssets]) => {
            const failing = catAssets.filter((a) => a.condition === 'failing').length;
            return (
              <div key={cat} className="rounded-2xl p-4" style={{ background: '#ffffff', border: '1px solid #dddddd' }}>
                <div className="flex items-baseline justify-between mb-3">
                  <div>
                    <p className="text-sm font-bold" style={{ color: '#222' }}>{cat}</p>
                    <p className="text-[11px]" style={{ color: '#929292' }}>{catAssets.length} asset{catAssets.length === 1 ? '' : 's'}{failing > 0 ? ` · ${failing} need attention` : ''}</p>
                  </div>
                  {failing > 0 && <AlertTriangle className="w-4 h-4" style={{ color: '#b91c1c' }} />}
                </div>
                <div className="flex flex-col gap-1.5">
                  {catAssets.slice(0, 5).map((a) => {
                    const cfg = CONDITION_CFG[a.condition] ?? CONDITION_CFG.good;
                    return (
                      <div
                        key={a.id}
                        className="rounded-lg px-3 py-2 flex items-center gap-2"
                        style={{ background: '#fafafa', border: '1px solid #f0f0f0' }}
                      >
                        <Package className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#6a6a6a' }} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate" style={{ color: '#222' }}>{a.label}</p>
                          <p className="text-[11px] truncate" style={{ color: '#929292' }}>
                            {a.vendor} · installed {fmtDate(a.installDate)}
                          </p>
                        </div>
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full capitalize" style={{ background: cfg.bg, color: cfg.color }}>
                          {a.condition}
                        </span>
                      </div>
                    );
                  })}
                  {catAssets.length > 5 && (
                    <p className="text-[11px] italic text-center" style={{ color: '#929292' }}>
                      +{catAssets.length - 5} more
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Vendor spend */}
      {vendors.length > 0 && (
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wide mb-3" style={{ color: '#6a6a6a' }}>Vendor spend</h2>
          <div className="rounded-2xl overflow-hidden" style={{ background: '#ffffff', border: '1px solid #dddddd' }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: '#f7f7f7', borderBottom: '1px solid #dddddd' }}>
                  <th className="text-left py-3 px-4 text-xs font-bold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>Vendor</th>
                  <th className="text-left py-3 px-4 text-xs font-bold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>Category</th>
                  <th className="text-right py-3 px-4 text-xs font-bold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>YTD spend</th>
                  <th className="text-right py-3 px-4 text-xs font-bold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>Work orders</th>
                </tr>
              </thead>
              <tbody>
                {vendors.map((v, i) => (
                  <tr key={v.vendor} style={{ borderBottom: i < vendors.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                    <td className="py-2 px-4 text-sm font-semibold" style={{ color: '#222' }}>{v.vendor}</td>
                    <td className="py-2 px-4 text-xs" style={{ color: '#6a6a6a' }}>—</td>
                    <td className="py-2 px-4 text-sm text-right font-semibold" style={{ color: '#222' }}>{formatCurrency(v.totalSpend, true)}</td>
                    <td className="py-2 px-4 text-sm text-right" style={{ color: '#6a6a6a' }}>{v.workOrderCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, sub, color, alert }: { label: string; value: string; sub: string; color?: string; alert?: boolean }) {
  return (
    <div className="rounded-2xl p-4" style={{ background: '#ffffff', border: `1px solid ${alert ? '#fca5a5' : '#dddddd'}` }}>
      <p className="text-[10px] uppercase tracking-wide font-semibold" style={{ color: '#929292' }}>{label}</p>
      <p className="text-xl font-bold mt-0.5" style={{ color: color ?? '#222' }}>{value}</p>
      <p className="text-[11px] mt-0.5" style={{ color: '#929292' }}>{sub}</p>
    </div>
  );
}
