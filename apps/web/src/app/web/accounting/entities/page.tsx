'use client';

import { useMemo, useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Building2, Landmark, CreditCard, Search, Plus, Download, Upload, Settings,
  CheckCircle2, AlertTriangle, XCircle, MoreHorizontal, ChevronRight, BarChart3,
} from 'lucide-react';
import { HOTEL_ENTITIES, getEntity } from '@hos/shared/accounting-os';
import { useAcctOs } from '../_context';
import { useStore2 } from '../_store2';
import { card, Badge, PageHeader, CLOSE_STATUS, PURPLE, inputStyle } from '../_ui';
import { SummaryCard } from '../dashboard/_components';
import { allEntitySetups, entitySummary, SETUP_STATUS_LABEL, reconStatusLabel, type EntitySetup, type SetupStatus } from './_data';

export default function EntitiesPage() {
  return <EntityList />;
}

const STATES = [...new Set(HOTEL_ENTITIES.map((h) => h.state))];

function EntityList() {
  const router = useRouter();
  const { selectHotel } = useAcctOs();
  const store = useStore2();
  const setups = useMemo(() => allEntitySetups(store), [store]);
  const sum = useMemo(() => entitySummary(store), [store]);

  const [q, setQ] = useState('');
  const [fState, setFState] = useState('');
  const [fStatus, setFStatus] = useState<SetupStatus | ''>('');

  const rows = setups.filter((s) => {
    const h = getEntity(s.hotelId)!;
    if (q) { const t = q.toLowerCase(); if (![h.hotelName, h.legalEntity, h.propertyCode, h.city, h.state, h.manager].some((x) => x.toLowerCase().includes(t))) return false; }
    if (fState && h.state !== fState) return false;
    if (fStatus && s.status !== fStatus) return false;
    return true;
  });

  const openHotelDash = (id: string) => { selectHotel(id); router.push('/web/accounting/dashboard'); };

  return (
    <div className="max-w-[1500px] mx-auto flex flex-col gap-5">
      <PageHeader
        scope="All Hotels"
        title="Hotel Entities"
        subtitle="Manage accounting setup and readiness for each hotel entity under HOS Management."
        actions={
          <>
            <Link href="/web/accounting/entities/new" className="h-9 px-3.5 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5" style={{ background: PURPLE, color: '#fff' }}><Plus className="w-4 h-4" /> Add Hotel Entity</Link>
            <button className="h-9 px-3 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5" style={{ background: '#fff', border: '1px solid #dddddd', color: '#6a6a6a' }}><Upload className="w-3.5 h-3.5" /> Import Entities</button>
            <button className="h-9 px-3 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5" style={{ background: '#fff', border: '1px solid #dddddd', color: '#6a6a6a' }}><Download className="w-3.5 h-3.5" /> Export</button>
            <Link href="/web/accounting/settings" className="h-9 px-3 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5" style={{ background: '#fff', border: '1px solid #dddddd', color: '#6a6a6a' }}><Settings className="w-3.5 h-3.5" /> Entity Settings</Link>
          </>
        }
      />
      <p className="text-xs -mt-3" style={{ color: '#929292' }}>Each hotel has its own books, bank accounts, credit cards, vendors, reconciliations, reports, and month close.</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <SummaryCard icon={<Building2 className="w-4 h-4" />} value={String(sum.total)} label="Total Hotel Entities" subtext="Active HOS entities" tone="neutral" onClick={() => { setFStatus(''); setFState(''); }} />
        <SummaryCard icon={<CheckCircle2 className="w-4 h-4" />} value={String(sum.accountingReady)} label="Accounting Ready" subtext="Core setup complete" tone="good" onClick={() => setFStatus('accounting-ready')} />
        <SummaryCard icon={<AlertTriangle className="w-4 h-4" />} value={String(sum.setupIncomplete)} label="Setup Incomplete" subtext="Missing COA, accounts, balances" tone="warning" onClick={() => setFStatus('')} />
        <SummaryCard icon={<Landmark className="w-4 h-4" />} value={String(sum.missingBank)} label="Bank Mapping Needed" subtext="Hotels needing bank setup" tone={sum.missingBank ? 'warning' : 'good'} onClick={() => setFStatus('needs-bank-mapping')} />
        <SummaryCard icon={<CreditCard className="w-4 h-4" />} value={String(sum.missingCards)} label="Credit Card Setup" subtext="Hotels without card setup" tone={sum.missingCards ? 'warning' : 'good'} onClick={() => setFStatus('needs-credit-card-setup')} />
        <SummaryCard icon={<XCircle className="w-4 h-4" />} value={String(sum.reconBlocked)} label="Reconciliation Blocked" subtext="Blocked by setup or statements" tone={sum.reconBlocked ? 'critical' : 'good'} onClick={() => router.push('/web/accounting/reconciliation-workbench?tab=difference')} />
        <SummaryCard icon={<AlertTriangle className="w-4 h-4" />} value={`${sum.closeBlocked} Hotels`} label="Month Close Blocked" subtext="Not ready to close" tone={sum.closeBlocked ? 'critical' : 'good'} onClick={() => router.push('/web/accounting/month-close')} />
        <SummaryCard icon={<BarChart3 className="w-4 h-4" />} value={String(sum.reportsReady)} label="Reports Ready" subtext="Posted & reconciled data" tone={sum.reportsReady ? 'good' : 'neutral'} onClick={() => router.push('/web/accounting/reports')} />
      </div>

      <div className="flex flex-wrap gap-2">
        <div className="flex items-center gap-2 h-9 px-2.5 rounded-lg flex-1 max-w-sm" style={inputStyle}>
          <Search className="w-3.5 h-3.5" style={{ color: '#929292' }} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search hotel, legal entity, code, city, manager…" className="flex-1 bg-transparent text-sm outline-none" style={{ color: '#222' }} />
        </div>
        <select value={fState} onChange={(e) => setFState(e.target.value)} className="h-9 px-2.5 rounded-lg text-xs" style={inputStyle}>
          <option value="">All States</option>
          {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={fStatus} onChange={(e) => setFStatus(e.target.value as SetupStatus | '')} className="h-9 px-2.5 rounded-lg text-xs" style={inputStyle}>
          <option value="">All Setup Statuses</option>
          {Object.entries(SETUP_STATUS_LABEL).filter(([k]) => k !== 'archived').map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <span className="ml-auto text-xs self-center" style={{ color: '#929292' }}>{rows.length} of {setups.length} hotels</span>
      </div>

      <div className="overflow-x-auto rounded-2xl" style={card}>
        <table className="w-full text-sm border-collapse">
          <thead><tr style={{ background: '#f7f7f7', borderBottom: '1px solid #dddddd' }}>
            {['Hotel', 'Code', 'City / State', 'Rooms', 'COA', 'Bank', 'Cards', 'Vendors', 'Reconciliation', 'Month Close', 'Setup Status', ''].map((h) => (
              <th key={h} className="text-[10px] font-semibold uppercase tracking-wide py-2.5 px-2.5 whitespace-nowrap" style={{ color: '#6a6a6a', textAlign: ['Rooms', 'Bank', 'Cards', 'Vendors'].includes(h) ? 'center' : 'left' }}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {rows.map((s) => <EntityRow key={s.hotelId} s={s} onOpen={() => router.push(`/web/accounting/entities/${s.hotelId}`)} />)}
            {rows.length === 0 && <tr><td colSpan={12} className="py-10 text-center text-sm" style={{ color: '#929292' }}>No hotels match.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function EntityRow({ s, onOpen }: { s: EntitySetup; onOpen: () => void }) {
  const router = useRouter();
  const { selectHotel } = useAcctOs();
  const h = getEntity(s.hotelId)!;
  const ss = SETUP_STATUS_LABEL[s.status];
  const recon = reconStatusLabel(s);
  const cls = CLOSE_STATUS[s.close.status];
  const [menu, setMenu] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { const fn = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setMenu(false); }; document.addEventListener('mousedown', fn); return () => document.removeEventListener('mousedown', fn); }, []);
  const goScoped = (path: string) => { selectHotel(s.hotelId); router.push(path); };

  return (
    <tr className="hover:bg-[#fafafa]" style={{ borderBottom: '1px solid #f0f0f0' }}>
      <td className="py-2.5 px-2.5 cursor-pointer" onClick={onOpen}><p className="font-medium truncate max-w-[200px]" style={{ color: '#222' }}>{h.hotelName}</p><p className="text-[11px] truncate max-w-[200px]" style={{ color: '#929292' }}>{h.legalEntity}</p></td>
      <td className="py-2.5 px-2.5 text-xs font-mono" style={{ color: '#6a6a6a' }}>{h.propertyCode}</td>
      <td className="py-2.5 px-2.5 text-xs" style={{ color: '#6a6a6a' }}>{h.city}, {h.state}</td>
      <td className="py-2.5 px-2.5 text-xs text-center" style={{ color: '#6a6a6a' }}>{h.rooms}</td>
      <td className="py-2.5 px-2.5">{s.coaApplied ? <Badge label="Applied" fg="#15803d" bg="#dcfce7" /> : <Badge label="Not Applied" fg="#b91c1c" bg="#fee2e2" />}</td>
      <td className="py-2.5 px-2.5 text-xs text-center" style={{ color: '#6a6a6a' }}>{s.bankCount}</td>
      <td className="py-2.5 px-2.5 text-xs text-center" style={{ color: s.cardCount ? '#6a6a6a' : '#b45309' }}>{s.cardCount || '—'}</td>
      <td className="py-2.5 px-2.5 text-xs text-center" style={{ color: '#6a6a6a' }}>{s.vendorCount}</td>
      <td className="py-2.5 px-2.5"><Badge label={recon.label} fg={recon.fg} bg={recon.bg} /></td>
      <td className="py-2.5 px-2.5"><Badge label={cls.label} fg={cls.fg} bg={cls.bg} /></td>
      <td className="py-2.5 px-2.5"><Badge label={ss.label} fg={ss.fg} bg={ss.bg} /></td>
      <td className="py-2.5 px-2.5">
        <div className="flex items-center gap-1.5 justify-end">
          <button onClick={onOpen} className="text-xs font-semibold inline-flex items-center gap-1" style={{ color: PURPLE }}>Open <ChevronRight className="w-3 h-3" /></button>
          <div className="relative" ref={ref}>
            <button onClick={() => setMenu((m) => !m)} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: '#f7f7f7' }}><MoreHorizontal className="w-4 h-4" style={{ color: '#6a6a6a' }} /></button>
            {menu && (
              <div className="absolute right-0 top-9 z-50 w-52 rounded-xl overflow-hidden shadow-xl" style={{ background: '#fff', border: '1px solid #dddddd' }}>
                <MenuItem label="Open Dashboard" onClick={() => goScoped('/web/accounting/dashboard')} />
                <MenuItem label="Open Statement Inbox" onClick={() => goScoped('/web/accounting/statements')} />
                <MenuItem label="Open Workbench" onClick={() => goScoped('/web/accounting/reconciliation-workbench')} />
                <MenuItem label="Open Chart of Accounts" onClick={() => goScoped('/web/accounting/chart-of-accounts')} />
                <MenuItem label="Run Reports" onClick={() => goScoped('/web/accounting/reports')} />
                <MenuItem label="Edit Entity" onClick={() => router.push(`/web/accounting/entities/${s.hotelId}?tab=settings`)} />
                <MenuItem label="View Setup Checklist" onClick={() => router.push(`/web/accounting/entities/${s.hotelId}?tab=accounting-setup`)} />
              </div>
            )}
          </div>
        </div>
      </td>
    </tr>
  );
}

function MenuItem({ label, onClick }: { label: string; onClick: () => void }) {
  return <button onClick={onClick} className="w-full text-left px-3 py-2 text-sm hover:bg-[#f7f7f7]" style={{ color: '#222' }}>{label}</button>;
}
