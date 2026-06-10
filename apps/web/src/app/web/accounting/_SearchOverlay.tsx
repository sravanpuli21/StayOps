'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Building2, Users, BookOpen, FileText, X, UploadCloud, CheckCheck } from 'lucide-react';
import { HOTEL_ENTITIES, ACCT_VENDORS, COA_TEMPLATE } from '@hos/shared/accounting-os';
import { useAcctOs } from './_context';

const REPORTS = ['Profit & Loss', 'Balance Sheet', 'Cash Flow', 'General Ledger', 'Trial Balance', 'Reconciliation Report', 'Vendor Spend'];

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
    if (!s) return { hotels: [], vendors: [], accounts: [], reports: [] };
    return {
      hotels: HOTEL_ENTITIES.filter((h) =>
        h.hotelName.toLowerCase().includes(s) || h.legalEntity.toLowerCase().includes(s)
        || h.propertyCode.toLowerCase().includes(s) || h.manager.toLowerCase().includes(s) || h.city.toLowerCase().includes(s)).slice(0, 5),
      vendors: ACCT_VENDORS.filter((v) => v.name.toLowerCase().includes(s)).slice(0, 5),
      accounts: COA_TEMPLATE.filter((a) => !a.isHeader && (a.name.toLowerCase().includes(s) || a.code.includes(s))).slice(0, 5),
      reports: REPORTS.filter((r) => r.toLowerCase().includes(s)).slice(0, 4),
    };
  }, [s]);

  const go = (p: string) => { router.push(p); onClose(); };
  const total = results.hotels.length + results.vendors.length + results.accounts.length + results.reports.length;

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center pt-24 px-4" style={{ background: 'rgba(0,0,0,0.35)' }} onClick={onClose}>
      <div className="w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl" style={{ background: '#fff', border: '1px solid #dddddd' }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 px-4 h-14" style={{ borderBottom: '1px solid #f0f0f0' }}>
          <Search className="w-5 h-5" style={{ color: '#929292' }} />
          <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search statements, transactions, vendors, accounts, reports…"
            className="flex-1 bg-transparent text-sm outline-none" style={{ color: '#222' }} />
          <button onClick={onClose}><X className="w-5 h-5" style={{ color: '#929292' }} /></button>
        </div>
        <div className="max-h-[60vh] overflow-y-auto">
          {!s && (
            <div className="px-4 py-3">
              <p className="text-[11px] font-bold uppercase tracking-wide mb-2" style={{ color: '#929292' }}>Quick Actions</p>
              <Row icon={<UploadCloud className="w-4 h-4" style={{ color: '#6a4ec0' }} />} title="Upload a statement" sub="Bank or credit card" onClick={() => go('/web/accounting/statements/upload')} />
              <Row icon={<CheckCheck className="w-4 h-4" style={{ color: '#6a4ec0' }} />} title="Open Reconciliation Workbench" sub="Code, post, clear, reconcile" onClick={() => go('/web/accounting/reconciliation-workbench')} />
            </div>
          )}
          {s && total === 0 && <p className="px-4 py-10 text-center text-sm" style={{ color: '#929292' }}>No results for “{q}”.</p>}
          {results.hotels.length > 0 && <Section title="Hotels">{results.hotels.map((h) => <Row key={h.id} icon={<Building2 className="w-4 h-4" style={{ color: '#6a4ec0' }} />} title={h.hotelName} sub={`${h.legalEntity} · ${h.propertyCode}`} onClick={() => { selectHotel(h.id); go('/web/accounting/dashboard'); }} />)}</Section>}
          {results.vendors.length > 0 && <Section title="Vendors">{results.vendors.map((v) => <Row key={v.name} icon={<Users className="w-4 h-4" style={{ color: '#6a4ec0' }} />} title={v.name} sub={v.defaultCategory} onClick={() => go('/web/accounting/vendors')} />)}</Section>}
          {results.accounts.length > 0 && <Section title="Chart of Accounts">{results.accounts.map((a) => <Row key={a.code} icon={<BookOpen className="w-4 h-4" style={{ color: '#6a4ec0' }} />} title={`${a.code} · ${a.name}`} sub={a.reportSection} onClick={() => go('/web/accounting/chart-of-accounts')} />)}</Section>}
          {results.reports.length > 0 && <Section title="Reports">{results.reports.map((r) => <Row key={r} icon={<FileText className="w-4 h-4" style={{ color: '#6a4ec0' }} />} title={r} onClick={() => go('/web/accounting/reports')} />)}</Section>}
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="px-4 py-2"><p className="text-[11px] font-bold uppercase tracking-wide mb-1" style={{ color: '#929292' }}>{title}</p>{children}</div>;
}
function Row({ icon, title, sub, onClick }: { icon: React.ReactNode; title: string; sub?: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-full flex items-center gap-3 px-2 py-2 rounded-lg text-left hover:bg-[#f7f7f7]">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#f0eefb' }}>{icon}</div>
      <div className="min-w-0"><p className="text-sm font-medium truncate" style={{ color: '#222' }}>{title}</p>{sub && <p className="text-[11px] truncate" style={{ color: '#929292' }}>{sub}</p>}</div>
    </button>
  );
}
