'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Plus, Download, Upload, Search, Eye, EyeOff, LayoutGrid, List as ListIcon,
  MoreHorizontal, ChevronDown, X, CheckCircle2, ClipboardCheck,
} from 'lucide-react';
import { closeForHotel } from '@hos/shared/accounting-os';
import { useAcctOs } from '../_context';
import { useAcctState } from '../_store';
import { allEntities, banksFor, cardsFor, maskTaxId } from '../_entities';
import { setupForHotel } from '../_setup';
import { card, Badge, CLOSE_STATUS } from '../_ui';
import { EditEntityDrawer } from './_EditDrawer';

const SETUP_BADGE = (label: string) => label === 'Complete'
  ? { fg: '#15803d', bg: '#dcfce7' } : { fg: '#b45309', bg: '#fef3c7' };

export default function EntitiesPage() {
  const router = useRouter();
  const { selectHotel } = useAcctOs();
  const store = useAcctState();
  const [q, setQ] = useState('');
  const [view, setView] = useState<'table' | 'card'>('table');
  const [stateF, setStateF] = useState('all');
  const [setupF, setSetupF] = useState('all');
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [editId, setEditId] = useState<string | null>(null);

  const entities = allEntities(store);
  const rows = useMemo(() => entities.filter((h) => {
    const s = q.toLowerCase();
    const matchesQ = !s || [h.hotelName, h.legalEntity, h.propertyCode, h.manager, h.city, h.taxId].some((v) => v.toLowerCase().includes(s));
    const matchesState = stateF === 'all' || h.state === stateF;
    const setup = setupForHotel(h.id, store);
    const matchesSetup = setupF === 'all' || (setupF === 'complete' ? setup.label === 'Complete' : setup.label !== 'Complete');
    return matchesQ && matchesState && matchesSetup;
  }), [entities, q, stateF, setupF, store]);

  const openBooks = (id: string) => { selectHotel(id); router.push('/web/accounting/dashboard'); };
  const toggleReveal = (id: string) => setRevealed((p) => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleSel = (id: string) => setSelected((p) => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const states = [...new Set(entities.map((h) => h.state))];

  return (
    <div className="max-w-[1400px] mx-auto flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold" style={{ color: '#222' }}>Hotel Entities</h1>
          <p className="text-sm mt-0.5" style={{ color: '#929292' }}>Manage each hotel as a separate accounting entity under HOS Management.</p>
          <p className="text-xs mt-0.5" style={{ color: '#b0b0b0' }}>Each hotel has its own books, bank accounts, credit cards, reports, and month close process.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/web/accounting/entities/setup-status" className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl text-xs font-semibold" style={{ background: '#fff', border: '1px solid #dddddd', color: '#6a6a6a' }}><ClipboardCheck className="w-3.5 h-3.5" /> Setup Status</Link>
          <Link href="/web/accounting/entities/import" className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl text-xs font-semibold" style={{ background: '#fff', border: '1px solid #dddddd', color: '#6a6a6a' }}><Upload className="w-3.5 h-3.5" /> Import</Link>
          <button className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl text-xs font-semibold" style={{ background: '#fff', border: '1px solid #dddddd', color: '#6a6a6a' }}><Download className="w-3.5 h-3.5" /> Export</button>
          <Link href="/web/accounting/entities/new" className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl text-xs font-semibold" style={{ background: '#6a4ec0', color: '#fff' }}><Plus className="w-4 h-4" /> Add Hotel Entity</Link>
        </div>
      </div>

      {/* Search + filters + view toggle */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-2 h-9 px-3 rounded-full flex-1 min-w-[260px]" style={{ background: '#fff', border: '1px solid #dddddd' }}>
          <Search className="w-4 h-4" style={{ color: '#929292' }} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by hotel name, legal entity, property code, manager, city, or tax ID..." className="flex-1 text-sm outline-none bg-transparent" style={{ color: '#222' }} />
        </div>
        <select value={stateF} onChange={(e) => setStateF(e.target.value)} className="h-9 px-2.5 rounded-lg text-xs" style={{ border: '1px solid #dddddd', background: '#fff', color: '#6a6a6a' }}>
          <option value="all">All States</option>{states.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={setupF} onChange={(e) => setSetupF(e.target.value)} className="h-9 px-2.5 rounded-lg text-xs" style={{ border: '1px solid #dddddd', background: '#fff', color: '#6a6a6a' }}>
          <option value="all">All Setup</option><option value="complete">Complete</option><option value="needs">Needs Setup</option>
        </select>
        <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid #dddddd' }}>
          <button onClick={() => setView('table')} className="h-9 px-2.5 flex items-center" style={{ background: view === 'table' ? '#6a4ec0' : '#fff', color: view === 'table' ? '#fff' : '#929292' }}><ListIcon className="w-4 h-4" /></button>
          <button onClick={() => setView('card')} className="h-9 px-2.5 flex items-center" style={{ background: view === 'card' ? '#6a4ec0' : '#fff', color: view === 'card' ? '#fff' : '#929292' }}><LayoutGrid className="w-4 h-4" /></button>
        </div>
      </div>

      {/* Bulk bar */}
      {selected.size > 0 && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: '#f0eefb' }}>
          <span className="text-xs font-semibold" style={{ color: '#6a4ec0' }}>{selected.size} selected</span>
          {['Export Selected', 'Assign Regional Manager', 'Apply COA Template', 'Update Setup Status'].map((b) => (
            <button key={b} className="h-7 px-2.5 rounded-lg text-xs font-semibold" style={{ background: '#fff', border: '1px solid #dddddd', color: '#6a6a6a' }}>{b}</button>
          ))}
          <button onClick={() => setSelected(new Set())} className="ml-auto text-xs" style={{ color: '#929292' }}>Clear</button>
        </div>
      )}

      {rows.length === 0 ? (
        <div className="rounded-2xl p-12 text-center" style={{ ...card, borderStyle: 'dashed' }}>
          <p className="text-base font-semibold" style={{ color: '#222' }}>No hotel entities found.</p>
          <p className="text-sm mt-1" style={{ color: '#6a6a6a' }}>Try searching by hotel name, legal entity, property code, manager, or city.</p>
          <button onClick={() => { setQ(''); setStateF('all'); setSetupF('all'); }} className="mt-3 h-9 px-4 rounded-xl text-xs font-semibold" style={{ background: '#6a4ec0', color: '#fff' }}>Clear Search</button>
        </div>
      ) : view === 'card' ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rows.map((h) => {
            const setup = setupForHotel(h.id, store);
            const cl = closeForHotel(h.id);
            const cs = cl ? CLOSE_STATUS[cl.status] : null;
            return (
              <div key={h.id} className="p-5 flex flex-col gap-3" style={card}>
                <div>
                  <p className="font-bold text-sm" style={{ color: '#222' }}>{h.hotelName}</p>
                  <p className="text-xs" style={{ color: '#929292' }}>{h.legalEntity}</p>
                  <p className="text-[11px] mt-0.5" style={{ color: '#b0b0b0' }}>{h.propertyCode} · {h.city}, {h.state} · {h.rooms} rooms</p>
                  <p className="text-[11px]" style={{ color: '#b0b0b0' }}>Manager: {h.manager}</p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <Badge label={`Setup: ${setup.label}`} {...SETUP_BADGE(setup.label)} />
                  {cs && <Badge label={`Close: ${cs.label}`} fg={cs.fg} bg={cs.bg} />}
                  <Badge label={`${banksFor(store, h.id).length} bank`} fg="#1d4ed8" bg="#dbeafe" />
                  <Badge label={`${cardsFor(store, h.id).length} cards`} fg="#b45309" bg="#fef3c7" />
                </div>
                <div className="flex gap-2 pt-1">
                  <button onClick={() => router.push(`/web/accounting/entities/${h.id}`)} className="flex-1 h-9 rounded-xl text-xs font-semibold" style={{ background: '#f7f7f7', border: '1px solid #dddddd', color: '#6a6a6a' }}>View Entity</button>
                  <button onClick={() => openBooks(h.id)} className="flex-1 h-9 rounded-xl text-xs font-semibold" style={{ background: '#6a4ec0', color: '#fff' }}>Open Books</button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl" style={card}>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr style={{ background: '#f7f7f7', borderBottom: '1px solid #dddddd' }}>
                <th className="w-8 py-2.5 px-3"></th>
                {['Hotel / Business Name', 'Legal Entity', 'Code', 'City/State', 'Rooms', 'Manager', 'Tax ID', 'Bank', 'Cards', 'Setup', 'Close', 'Status', ''].map((h, i) => (
                  <th key={h} className="text-[11px] font-semibold uppercase tracking-wide py-2.5 px-3 whitespace-nowrap" style={{ color: '#6a6a6a', textAlign: i >= 4 && i <= 8 ? 'center' : 'left' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((h) => {
                const setup = setupForHotel(h.id, store);
                const cl = closeForHotel(h.id);
                const cs = cl ? CLOSE_STATUS[cl.status] : null;
                const shown = revealed.has(h.id);
                return (
                  <tr key={h.id} className="hover:bg-[#fafafa] cursor-pointer" style={{ borderBottom: '1px solid #f0f0f0' }} onClick={() => router.push(`/web/accounting/entities/${h.id}`)}>
                    <td className="py-2.5 px-3" onClick={(e) => e.stopPropagation()}><input type="checkbox" checked={selected.has(h.id)} onChange={() => toggleSel(h.id)} /></td>
                    <td className="py-2.5 px-3"><p className="font-medium" style={{ color: '#222' }}>{h.hotelName}</p><p className="text-[11px]" style={{ color: '#929292' }}>{h.city}, {h.state}</p></td>
                    <td className="py-2.5 px-3 text-xs" style={{ color: '#3f3f3f' }}>{h.legalEntity}</td>
                    <td className="py-2.5 px-3 text-xs font-mono" style={{ color: '#6a6a6a' }}>{h.propertyCode}</td>
                    <td className="py-2.5 px-3 text-xs" style={{ color: '#6a6a6a' }}>{h.city}, {h.state}</td>
                    <td className="py-2.5 px-3 text-center text-xs" style={{ color: '#3f3f3f' }}>{h.rooms}</td>
                    <td className="py-2.5 px-3 text-center text-xs" style={{ color: '#3f3f3f' }}>{h.manager}</td>
                    <td className="py-2.5 px-3 text-xs font-mono" style={{ color: '#6a6a6a' }} onClick={(e) => e.stopPropagation()}>
                      <span className="inline-flex items-center gap-1">{shown ? h.taxId : maskTaxId(h.taxId)}<button onClick={() => toggleReveal(h.id)}>{shown ? <EyeOff className="w-3 h-3" style={{ color: '#929292' }} /> : <Eye className="w-3 h-3" style={{ color: '#929292' }} />}</button></span>
                    </td>
                    <td className="py-2.5 px-3 text-center text-xs" style={{ color: '#3f3f3f' }}>{banksFor(store, h.id).length}</td>
                    <td className="py-2.5 px-3 text-center text-xs" style={{ color: '#3f3f3f' }}>{cardsFor(store, h.id).length}</td>
                    <td className="py-2.5 px-3"><Badge label={setup.label} {...SETUP_BADGE(setup.label)} /></td>
                    <td className="py-2.5 px-3">{cs && <Badge label={cs.label} fg={cs.fg} bg={cs.bg} />}</td>
                    <td className="py-2.5 px-3"><Badge label={h.status === 'archived' ? 'Archived' : 'Active'} fg={h.status === 'archived' ? '#929292' : '#15803d'} bg={h.status === 'archived' ? '#f0f0f0' : '#dcfce7'} /></td>
                    <td className="py-2.5 px-3" onClick={(e) => e.stopPropagation()}>
                      <RowActions hotelId={h.id} onView={() => router.push(`/web/accounting/entities/${h.id}`)} onOpenBooks={() => openBooks(h.id)} onEdit={() => setEditId(h.id)} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {editId && <EditEntityDrawer hotelId={editId} onClose={() => setEditId(null)} />}
    </div>
  );
}

function RowActions({ hotelId, onView, onOpenBooks, onEdit }: { hotelId: string; onView: () => void; onOpenBooks: () => void; onEdit: () => void }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) { setOpen(false); setUploadOpen(false); } }; document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h); }, []);

  return (
    <div ref={ref} className="relative flex items-center gap-2 whitespace-nowrap">
      <button onClick={onView} className="text-xs font-semibold" style={{ color: '#6a4ec0' }}>View</button>
      <button onClick={onOpenBooks} className="text-xs font-semibold" style={{ color: '#6a6a6a' }}>Open Books</button>
      <button onClick={() => { setUploadOpen((o) => !o); setOpen(false); }} className="text-xs font-semibold inline-flex items-center" style={{ color: '#6a6a6a' }}>Upload <ChevronDown className="w-3 h-3" /></button>
      <button onClick={() => { setOpen((o) => !o); setUploadOpen(false); }}><MoreHorizontal className="w-4 h-4" style={{ color: '#929292' }} /></button>

      {uploadOpen && (
        <div className="absolute right-0 top-7 z-50 w-52 rounded-xl overflow-hidden shadow-xl" style={{ background: '#fff', border: '1px solid #dddddd' }}>
          <MenuI label="Upload Bank Statement" onClick={() => router.push(`/web/accounting/banking/upload?hotel=${hotelId}`)} />
          <MenuI label="Upload Credit Card Statement" onClick={() => router.push(`/web/accounting/credit-cards/upload?hotel=${hotelId}`)} />
        </div>
      )}
      {open && (
        <div className="absolute right-0 top-7 z-50 w-48 rounded-xl overflow-hidden shadow-xl" style={{ background: '#fff', border: '1px solid #dddddd' }}>
          <MenuI label="Edit Entity" onClick={onEdit} />
          <MenuI label="Add Bank Account" onClick={() => router.push(`/web/accounting/entities/${hotelId}?tab=Bank+Accounts`)} />
          <MenuI label="Add Credit Card" onClick={() => router.push(`/web/accounting/entities/${hotelId}?tab=Credit+Cards`)} />
          <MenuI label="Manage Users" onClick={() => router.push(`/web/accounting/entities/${hotelId}?tab=Users`)} />
          <MenuI label="View Activity Log" onClick={() => router.push(`/web/accounting/entities/${hotelId}?tab=Activity`)} />
          <MenuI label="Archive Entity" disabled tooltip="This entity has active accounting records and cannot be archived." />
        </div>
      )}
    </div>
  );
}
function MenuI({ label, onClick, disabled, tooltip }: { label: string; onClick?: () => void; disabled?: boolean; tooltip?: string }) {
  return <button onClick={disabled ? undefined : onClick} disabled={disabled} title={tooltip} className="w-full text-left px-3 py-2 text-xs hover:bg-[#f7f7f7]" style={{ color: disabled ? '#c1c1c1' : '#222', cursor: disabled ? 'not-allowed' : 'pointer' }}>{label}</button>;
}
