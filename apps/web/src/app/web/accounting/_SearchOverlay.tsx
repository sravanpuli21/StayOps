'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Building2, Receipt, Users, BookOpen, FileText, X } from 'lucide-react';
import { HOTEL_ENTITIES, ACCT_VENDORS, ACCT_TRANSACTIONS } from '@hos/shared/accounting-os';
import { useAcctOs } from './_context';
import { money } from './_ui';

const REPORTS = ['Profit & Loss', 'Balance Sheet', 'Cash Flow', 'General Ledger', 'Trial Balance', 'Hotel Comparison', 'Vendor Spend'];

export function SearchOverlay({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const { selectHotel } = useAcctOs();
  const [q, setQ] = useState('');

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [onClose]);

  const s = q.trim().toLowerCase();
  const results = useMemo(() => {
    if (!s) return { hotels: [], vendors: [], transactions: [], reports: [] };
    return {
      hotels: HOTEL_ENTITIES.filter((h) =>
        h.hotelName.toLowerCase().includes(s) || h.legalEntity.toLowerCase().includes(s)
        || h.propertyCode.toLowerCase().includes(s) || h.manager.toLowerCase().includes(s) || h.city.toLowerCase().includes(s)).slice(0, 6),
      vendors: ACCT_VENDORS.filter((v) => v.name.toLowerCase().includes(s)).slice(0, 5),
      transactions: ACCT_TRANSACTIONS.filter((t) => t.description.toLowerCase().includes(s) || String(Math.abs(t.amount)).includes(s)).slice(0, 6),
      reports: REPORTS.filter((r) => r.toLowerCase().includes(s)).slice(0, 5),
    };
  }, [s]);

  const go = (path: string) => { router.push(path); onClose(); };

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center pt-24 px-4" style={{ background: 'rgba(0,0,0,0.35)' }} onClick={onClose}>
      <div className="w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl" style={{ background: '#fff' }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 px-4 h-14" style={{ borderBottom: '1px solid #f0f0f0' }}>
          <Search className="w-5 h-5" style={{ color: '#929292' }} />
          <input autoFocus value={q} onChange={(e) => setQ(e.target.value)}
            placeholder="Search transactions, vendors, hotels, accounts, reports…"
            className="flex-1 text-sm outline-none bg-transparent" style={{ color: '#222' }} />
          <button onClick={onClose}><X className="w-4 h-4" style={{ color: '#929292' }} /></button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2">
          {!s && <p className="px-3 py-6 text-center text-sm" style={{ color: '#929292' }}>Try “BTRCI”, “Home Depot”, or “P&L”.</p>}

          <Group title="Hotels" icon={<Building2 className="w-3.5 h-3.5" />} show={results.hotels.length > 0}>
            {results.hotels.map((h) => (
              <Row key={h.id} title={h.hotelName} sub={`${h.legalEntity} · ${h.propertyCode} · ${h.city}, ${h.state}`}
                onClick={() => { selectHotel(h.id); go('/web/accounting/dashboard'); }} />
            ))}
          </Group>

          <Group title="Vendors" icon={<Users className="w-3.5 h-3.5" />} show={results.vendors.length > 0}>
            {results.vendors.map((v) => (
              <Row key={v.name} title={v.name} sub={`${v.defaultCategory} · ${money(v.spendMonth)} this month`}
                onClick={() => go(`/web/accounting/vendors?v=${encodeURIComponent(v.name)}`)} />
            ))}
          </Group>

          <Group title="Transactions" icon={<Receipt className="w-3.5 h-3.5" />} show={results.transactions.length > 0}>
            {results.transactions.map((t) => (
              <Row key={t.id} title={t.description} sub={`${money(t.amount, { sign: true })} · ${t.dateIso}`}
                onClick={() => go('/web/accounting/transactions')} />
            ))}
          </Group>

          <Group title="Reports" icon={<BookOpen className="w-3.5 h-3.5" />} show={results.reports.length > 0}>
            {results.reports.map((r) => (
              <Row key={r} title={r} sub="Report" onClick={() => go('/web/accounting/reports')} />
            ))}
          </Group>

          {s && results.hotels.length + results.vendors.length + results.transactions.length + results.reports.length === 0 && (
            <p className="px-3 py-6 text-center text-sm" style={{ color: '#929292' }}>No results for “{q}”.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function Group({ title, icon, show, children }: { title: string; icon: React.ReactNode; show: boolean; children: React.ReactNode }) {
  if (!show) return null;
  return (
    <div className="mb-1">
      <div className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide" style={{ color: '#929292' }}>{icon}{title}</div>
      {children}
    </div>
  );
}
function Row({ title, sub, onClick }: { title: string; sub: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#f7f7f7]">
      <p className="text-sm font-medium truncate" style={{ color: '#222' }}>{title}</p>
      <p className="text-[11px] truncate" style={{ color: '#929292' }}>{sub}</p>
    </button>
  );
}
