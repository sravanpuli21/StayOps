'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Building2, Search, Loader2, AlertCircle } from 'lucide-react';

interface AdminHotel {
  code: string;
  name: string;
  shortName: string;
  brand: string;
  city: string | null;
  state: string | null;
  rooms: number;
  pms: string | null;
  region: string | null;
  gm: string | null;
  marketAdr: number | null;
  lastDataDate: string | null;
}

const BRAND_COLOR: Record<string, string> = {
  Hilton: '#1d4ed8',
  Marriott: '#b91c1c',
  Choice: '#15803d',
  IHG: '#9a3412',
  Wyndham: '#6d28d9',
};

export default function AdminHotelsPage() {
  const [hotels, setHotels] = useState<AdminHotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [region, setRegion] = useState<string>('all');

  useEffect(() => {
    const secret = window.localStorage.getItem('stayops_admin') ?? '';
    fetch('/api/admin/hotels', { headers: { 'x-admin-secret': secret } })
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((d) => setHotels(d.hotels ?? []))
      .catch((e) => setErr(e instanceof Error ? e.message : 'failed to load'))
      .finally(() => setLoading(false));
  }, []);

  const regions = useMemo(
    () => Array.from(new Set(hotels.map((h) => h.region).filter(Boolean))) as string[],
    [hotels],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return hotels.filter((h) => {
      if (region !== 'all' && h.region !== region) return false;
      if (!q) return true;
      return (
        h.name.toLowerCase().includes(q) ||
        h.code.toLowerCase().includes(q) ||
        (h.city ?? '').toLowerCase().includes(q) ||
        h.brand.toLowerCase().includes(q)
      );
    });
  }, [hotels, query, region]);

  const totalRooms = filtered.reduce((s, h) => s + h.rooms, 0);

  return (
    <div className="min-h-screen p-8" style={{ background: '#f7f7f7' }}>
      <div className="max-w-6xl mx-auto">
        <Link href="/web/admin" className="inline-flex items-center gap-1 text-sm mb-4" style={{ color: '#6a6a6a' }}>
          <ArrowLeft className="w-4 h-4" /> Back to admin
        </Link>
        <div className="flex items-center gap-2 mb-1">
          <Building2 className="w-5 h-5" style={{ color: '#ff385c' }} />
          <h1 className="text-2xl font-bold" style={{ color: '#222' }}>Hotels</h1>
        </div>
        <p className="text-sm mb-6" style={{ color: '#929292' }}>
          {filtered.length} propert{filtered.length === 1 ? 'y' : 'ies'} · {totalRooms.toLocaleString()} rooms · live from Postgres
        </p>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#929292' }} />
            <input
              type="text"
              placeholder="Search name, code, city, brand"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full text-sm pl-9 pr-3 py-2 rounded-full"
              style={{ border: '1px solid #dddddd', background: '#ffffff' }}
            />
          </div>
          <button
            onClick={() => setRegion('all')}
            className="text-xs font-semibold px-3 py-1.5 rounded-full"
            style={{ background: region === 'all' ? '#222' : '#fff', color: region === 'all' ? '#fff' : '#6a6a6a', border: '1px solid #dddddd' }}
          >
            All regions
          </button>
          {regions.map((r) => (
            <button
              key={r}
              onClick={() => setRegion(r)}
              className="text-xs font-semibold px-3 py-1.5 rounded-full"
              style={{ background: region === r ? '#222' : '#fff', color: region === r ? '#fff' : '#6a6a6a', border: '1px solid #dddddd' }}
            >
              {r}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="rounded-2xl p-12 flex items-center justify-center gap-2" style={{ background: '#fff', border: '1px solid #dddddd' }}>
            <Loader2 className="w-4 h-4 animate-spin" style={{ color: '#6a6a6a' }} />
            <span className="text-sm" style={{ color: '#929292' }}>Loading hotels…</span>
          </div>
        ) : err ? (
          <div className="rounded-2xl p-5 flex items-start gap-2" style={{ background: '#fef2f2', border: '1px solid #fca5a5' }}>
            <AlertCircle className="w-4 h-4 mt-0.5" style={{ color: '#b91c1c' }} />
            <p className="text-sm" style={{ color: '#b91c1c' }}>Failed to load: {err}</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl" style={{ border: '1px solid #dddddd', background: '#ffffff' }}>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr style={{ borderBottom: '1px solid #dddddd', background: '#f7f7f7' }}>
                  <th className={th}>Code</th>
                  <th className={th}>Property</th>
                  <th className={th}>Brand</th>
                  <th className={th}>Location</th>
                  <th className={th + ' text-right'}>Rooms</th>
                  <th className={th}>Region</th>
                  <th className={th}>GM</th>
                  <th className={th}>PMS</th>
                  <th className={th}>Last Data</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((h, i) => (
                  <tr key={h.code} style={{ borderBottom: i < filtered.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                    <td className="py-3 px-4 font-mono text-xs" style={{ color: '#6a6a6a' }}>{h.code}</td>
                    <td className="py-3 px-4">
                      <p className="font-medium" style={{ color: '#222' }}>{h.shortName}</p>
                      <p className="text-[10px] mt-0.5" style={{ color: '#929292' }}>{h.name}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[10px] font-bold tracking-wide px-1.5 py-0.5 rounded" style={{ background: '#f0f0f0', color: BRAND_COLOR[h.brand] ?? '#3f3f3f' }}>
                        {h.brand.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs" style={{ color: '#3f3f3f' }}>{h.city}{h.city && h.state ? ', ' : ''}{h.state}</td>
                    <td className="py-3 px-4 text-sm text-right" style={{ color: '#3f3f3f' }}>{h.rooms}</td>
                    <td className="py-3 px-4 text-xs" style={{ color: '#3f3f3f' }}>{h.region ?? '—'}</td>
                    <td className="py-3 px-4 text-xs" style={{ color: h.gm ? '#3f3f3f' : '#c1c1c1' }}>{h.gm ?? 'unassigned'}</td>
                    <td className="py-3 px-4 text-xs uppercase" style={{ color: '#6a6a6a' }}>{h.pms ?? '—'}</td>
                    <td className="py-3 px-4 text-xs" style={{ color: h.lastDataDate ? '#15803d' : '#b45309' }}>
                      {h.lastDataDate ?? 'no data'}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={9} className="py-8 px-4 text-center text-sm" style={{ color: '#929292' }}>No hotels match.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

const th = 'text-left text-xs font-semibold uppercase tracking-wide py-3 px-4 whitespace-nowrap';
