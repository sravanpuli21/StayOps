'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Plus, Layers, Upload, Download, Search, List as ListIcon, Network,
  MoreHorizontal, ChevronRight, ChevronDown, Lock,
} from 'lucide-react';
import { getEntity, COA_FULL_TYPES, COA_TYPE_LABEL, type CoaFullType } from '@hos/shared/accounting-os';
import { useAcctOs } from '../../_context';
import { useAcctState, setAccountStatus } from '../../_store';
import { accountsForHotel, type LiveAccount } from '../../_coa';
import { card, Badge, money } from '../../_ui';
import { CoaTabs, TypeBadge, StatusBadge } from '../_shared';
import { ApplyTemplateModal } from '../_ApplyTemplate';
import { AccountForm } from '../_AccountForm';

export default function AccountsListPage() {
  const router = useRouter();
  const { selection } = useAcctOs();
  const store = useAcctState();

  if (selection.kind !== 'hotel') {
    return (
      <div className="max-w-[1400px] mx-auto flex flex-col gap-5">
        <CoaTabs />
        <div className="rounded-2xl p-12 text-center" style={{ ...card, borderStyle: 'dashed' }}>
          <p className="text-base font-semibold" style={{ color: '#222' }}>Select a hotel to view its accounts.</p>
          <p className="text-sm mt-1" style={{ color: '#6a6a6a' }}>The Accounts list works on one hotel’s books at a time. Use the hotel selector in the top bar, or open a hotel from the Setup Status tab.</p>
          <Link href="/web/accounting/chart-of-accounts/setup-status" className="inline-block mt-3 h-9 leading-9 px-4 rounded-xl text-xs font-semibold" style={{ background: '#6a4ec0', color: '#fff' }}>Go to Setup Status</Link>
        </div>
      </div>
    );
  }
  return <HotelAccounts hotelId={selection.hotelId} store={store} router={router} />;
}

function HotelAccounts({ hotelId, store, router }: { hotelId: string; store: ReturnType<typeof useAcctState>; router: ReturnType<typeof useRouter> }) {
  const h = getEntity(hotelId);
  const [q, setQ] = useState('');
  const [typeF, setTypeF] = useState<CoaFullType | 'all'>('all');
  const [statusF, setStatusF] = useState('all');
  const [usedF, setUsedF] = useState('all');
  const [view, setView] = useState<'list' | 'tree'>('list');
  const [addOpen, setAddOpen] = useState(false);
  const [applyOpen, setApplyOpen] = useState(false);
  const [editAcct, setEditAcct] = useState<LiveAccount | null>(null);

  const all = accountsForHotel(store, hotelId);
  const rows = useMemo(() => all.filter((a) => {
    if (a.isHeader && view === 'list') { /* keep headers visible in list too */ }
    const s = q.toLowerCase();
    const matchesQ = !s || [a.code, a.name, a.type, a.detailType, a.reportSection].some((v) => v.toLowerCase().includes(s));
    const matchesType = typeF === 'all' || a.type === typeF;
    const matchesStatus = statusF === 'all'
      || (statusF === 'active' && a.status === 'active')
      || (statusF === 'inactive' && a.status === 'inactive')
      || (statusF === 'system' && a.status === 'system-locked');
    const matchesUsed = usedF === 'all'
      || (usedF === 'none' && a.usedBy.length === 0)
      || a.usedBy.includes(usedF);
    return matchesQ && matchesType && matchesStatus && matchesUsed;
  }), [all, q, typeF, statusF, usedF, view]);

  const clearFilters = () => { setQ(''); setTypeF('all'); setStatusF('all'); setUsedF('all'); };

  return (
    <div className="max-w-[1400px] mx-auto flex flex-col gap-4">
      <CoaTabs />

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Badge label="One Hotel" fg="#1d4ed8" bg="#dbeafe" />
          <div><h1 className="text-xl font-bold" style={{ color: '#222' }}>Accounts</h1><p className="text-sm" style={{ color: '#929292' }}>{h?.hotelName} · View and manage the accounts used to organize this hotel’s accounting records.</p></div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => setApplyOpen(true)} className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl text-xs font-semibold" style={{ background: '#fff', border: '1px solid #dddddd', color: '#6a6a6a' }}><Layers className="w-3.5 h-3.5" /> Apply Template</button>
          <Link href="/web/accounting/chart-of-accounts/import" className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl text-xs font-semibold" style={{ background: '#fff', border: '1px solid #dddddd', color: '#6a6a6a' }}><Upload className="w-3.5 h-3.5" /> Import</Link>
          <Link href="/web/accounting/chart-of-accounts/export" className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl text-xs font-semibold" style={{ background: '#fff', border: '1px solid #dddddd', color: '#6a6a6a' }}><Download className="w-3.5 h-3.5" /> Export</Link>
          <button onClick={() => setAddOpen(true)} className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl text-xs font-semibold" style={{ background: '#6a4ec0', color: '#fff' }}><Plus className="w-4 h-4" /> Add Account</button>
        </div>
      </div>

      {/* search + filters + view toggle */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-2 h-9 px-3 rounded-full flex-1 min-w-[260px]" style={{ background: '#fff', border: '1px solid #dddddd' }}>
          <Search className="w-4 h-4" style={{ color: '#929292' }} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search account code, account name, type, category, or report section..." className="flex-1 text-sm outline-none bg-transparent" style={{ color: '#222' }} />
        </div>
        <select value={typeF} onChange={(e) => setTypeF(e.target.value as CoaFullType | 'all')} className={fil}><option value="all">All Types</option>{COA_FULL_TYPES.map((t) => <option key={t} value={t}>{COA_TYPE_LABEL[t]}</option>)}</select>
        <select value={statusF} onChange={(e) => setStatusF(e.target.value)} className={fil}><option value="all">All Status</option><option value="active">Active</option><option value="inactive">Inactive</option><option value="system">System Locked</option></select>
        <select value={usedF} onChange={(e) => setUsedF(e.target.value)} className={fil}><option value="all">All Usage</option><option value="Bank Account">Bank Account</option><option value="Credit Card">Credit Card</option><option value="Vendor Default">Vendor Default</option><option value="Transaction">Transaction</option><option value="Report">Report</option><option value="none">No Usage</option></select>
        <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid #dddddd' }}>
          <button onClick={() => setView('list')} className="h-9 px-2.5 flex items-center gap-1 text-xs font-semibold" style={{ background: view === 'list' ? '#6a4ec0' : '#fff', color: view === 'list' ? '#fff' : '#929292' }}><ListIcon className="w-4 h-4" /> List</button>
          <button onClick={() => setView('tree')} className="h-9 px-2.5 flex items-center gap-1 text-xs font-semibold" style={{ background: view === 'tree' ? '#6a4ec0' : '#fff', color: view === 'tree' ? '#fff' : '#929292' }}><Network className="w-4 h-4" /> Tree</button>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-2xl p-12 text-center" style={{ ...card, borderStyle: 'dashed' }}>
          <p className="text-base font-semibold" style={{ color: '#222' }}>No accounts found.</p>
          <p className="text-sm mt-1" style={{ color: '#6a6a6a' }}>Try changing filters or search terms.</p>
          <button onClick={clearFilters} className="mt-3 h-9 px-4 rounded-xl text-xs font-semibold" style={{ background: '#6a4ec0', color: '#fff' }}>Clear Filters</button>
        </div>
      ) : view === 'tree' ? (
        <TreeView accounts={all} onOpen={(c) => router.push(`/web/accounting/chart-of-accounts/accounts/${c}`)} />
      ) : (
        <div className="overflow-x-auto rounded-2xl" style={card}>
          <table className="w-full text-sm border-collapse">
            <thead><tr style={{ background: '#f7f7f7', borderBottom: '1px solid #dddddd' }}>
              {['Code', 'Account Name', 'Type', 'Detail Type', 'Parent', 'Report Section', 'Balance', 'Used In', 'Status', ''].map((x, i) => <th key={x} className="text-[10px] font-semibold uppercase tracking-wide py-2.5 px-3 whitespace-nowrap" style={{ color: '#6a6a6a', textAlign: i === 6 ? 'right' : 'left' }}>{x}</th>)}
            </tr></thead>
            <tbody>
              {rows.map((a) => (
                <tr key={a.code} className="hover:bg-[#fafafa] cursor-pointer" style={{ borderBottom: '1px solid #f0f0f0', background: a.isHeader ? '#fcfcfc' : undefined }} onClick={() => router.push(`/web/accounting/chart-of-accounts/accounts/${a.code}`)}>
                  <td className="py-2.5 px-3 text-xs font-mono" style={{ color: '#6a6a6a' }}>{a.code}</td>
                  <td className="py-2.5 px-3" style={{ paddingLeft: a.parent ? 28 : 12 }}><span className="font-medium inline-flex items-center gap-1.5" style={{ color: '#222', fontWeight: a.isHeader ? 700 : 500 }}>{a.name}{a.systemLocked && <Lock className="w-3 h-3" style={{ color: '#6a4ec0' }} />}{a.custom && <Badge label="Custom" fg="#6a4ec0" bg="#ece4fb" />}</span></td>
                  <td className="py-2.5 px-3"><TypeBadge type={a.type} /></td>
                  <td className="py-2.5 px-3 text-xs" style={{ color: '#6a6a6a' }}>{a.detailType}</td>
                  <td className="py-2.5 px-3 text-xs font-mono" style={{ color: '#929292' }}>{a.parent ?? '—'}</td>
                  <td className="py-2.5 px-3 text-xs" style={{ color: '#6a6a6a' }}>{a.reportSection}</td>
                  <td className="py-2.5 px-3 text-right text-xs" style={{ color: '#3f3f3f' }}>{a.balance ? money(a.balance) : '—'}</td>
                  <td className="py-2.5 px-3 text-xs" style={{ color: '#929292' }}>{a.usedBy.length ? a.usedBy.length + (a.usedBy.length === 1 ? ' use' : ' uses') : '—'}</td>
                  <td className="py-2.5 px-3"><StatusBadge status={a.status} /></td>
                  <td className="py-2.5 px-3" onClick={(e) => e.stopPropagation()}>
                    <RowActions a={a} router={router} onEdit={() => setEditAcct(a)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {addOpen && <AccountForm preHotel={hotelId} onClose={() => setAddOpen(false)} onSaved={(c) => router.push(`/web/accounting/chart-of-accounts/accounts/${c}`)} />}
      {applyOpen && <ApplyTemplateModal preHotel={hotelId} onClose={() => setApplyOpen(false)} />}
      {editAcct && <AccountForm editAcct={editAcct} onClose={() => setEditAcct(null)} />}
    </div>
  );
}

function RowActions({ a, router, onEdit }: { a: LiveAccount; router: ReturnType<typeof useRouter>; onEdit: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { const fn = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); }; document.addEventListener('mousedown', fn); return () => document.removeEventListener('mousedown', fn); }, []);
  const canDelete = a.usedBy.length === 0 && !a.systemLocked && a.txCount === 0 && a.custom;

  return (
    <div ref={ref} className="relative flex items-center gap-2 whitespace-nowrap">
      <button onClick={() => router.push(`/web/accounting/chart-of-accounts/accounts/${a.code}`)} className="text-xs font-semibold" style={{ color: '#6a4ec0' }}>View</button>
      <button onClick={onEdit} className="text-xs font-semibold" style={{ color: '#6a6a6a' }}>Edit</button>
      <button onClick={() => setOpen((o) => !o)}><MoreHorizontal className="w-4 h-4" style={{ color: '#929292' }} /></button>
      {open && (
        <div className="absolute right-0 top-7 z-50 w-52 rounded-xl overflow-hidden shadow-xl" style={{ background: '#fff', border: '1px solid #dddddd' }}>
          <MenuI label="View Register" onClick={() => router.push(`/web/accounting/chart-of-accounts/accounts/${a.code}/register`)} />
          <MenuI label="View Journal Entries" onClick={() => router.push(`/web/accounting/chart-of-accounts/accounts/${a.code}?tab=Journal+Entries`)} />
          <MenuI label="View Transactions" onClick={() => router.push(`/web/accounting/chart-of-accounts/accounts/${a.code}?tab=Transactions`)} />
          <MenuI label="Add Sub-Account" onClick={() => router.push(`/web/accounting/chart-of-accounts/accounts/new?parent=${a.code}`)} />
          {a.status === 'inactive'
            ? <MenuI label="Make Active" onClick={() => { setAccountStatus(a.hotelId, a.code, true); setOpen(false); }} />
            : <MenuI label="Make Inactive" disabled={a.systemLocked && a.txCount > 0} tooltip={a.systemLocked ? 'System accounts with activity stay active.' : undefined} onClick={() => { setAccountStatus(a.hotelId, a.code, false); setOpen(false); }} />}
          <MenuI label="Delete" disabled={!canDelete} tooltip={!canDelete ? 'This account has accounting activity and cannot be deleted. You can make it inactive instead.' : undefined} />
        </div>
      )}
    </div>
  );
}
function MenuI({ label, onClick, disabled, tooltip }: { label: string; onClick?: () => void; disabled?: boolean; tooltip?: string }) {
  return <button onClick={disabled ? undefined : onClick} disabled={disabled} title={tooltip} className="w-full text-left px-3 py-2 text-xs hover:bg-[#f7f7f7]" style={{ color: disabled ? '#c1c1c1' : '#222', cursor: disabled ? 'not-allowed' : 'pointer' }}>{label}</button>;
}

/* ── Tree view: group by type → header accounts → children ───────────── */
function TreeView({ accounts, onOpen }: { accounts: LiveAccount[]; onOpen: (code: string) => void }) {
  const types: Array<[CoaFullType, string]> = [['Asset', 'Assets'], ['Liability', 'Liabilities'], ['Equity', 'Equity'], ['Revenue', 'Revenue'], ['COGS', 'Cost of Goods Sold'], ['Expense', 'Expenses'], ['Other Income', 'Other Income'], ['Other Expense', 'Other Expenses']];
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const toggle = (k: string) => setCollapsed((p) => { const n = new Set(p); n.has(k) ? n.delete(k) : n.add(k); return n; });

  return (
    <div className="rounded-2xl overflow-hidden" style={card}>
      {types.map(([type, label]) => {
        const ofType = accounts.filter((a) => a.type === type);
        if (!ofType.length) return null;
        const headers = ofType.filter((a) => a.isHeader);
        const orphans = ofType.filter((a) => !a.isHeader && !a.parent);
        const typeCollapsed = collapsed.has(type);
        return (
          <div key={type} style={{ borderBottom: '1px solid #f0f0f0' }}>
            <button onClick={() => toggle(type)} className="w-full flex items-center gap-2 px-4 py-2.5" style={{ background: '#f7f7f7' }}>
              {typeCollapsed ? <ChevronRight className="w-4 h-4" style={{ color: '#6a6a6a' }} /> : <ChevronDown className="w-4 h-4" style={{ color: '#6a6a6a' }} />}
              <span className="text-sm font-bold" style={{ color: '#222' }}>{label}</span>
              <span className="text-xs" style={{ color: '#929292' }}>{ofType.filter((a) => !a.isHeader).length} accounts</span>
            </button>
            {!typeCollapsed && (
              <div>
                {headers.map((hdr) => {
                  const children = ofType.filter((a) => a.parent === hdr.code);
                  const hc = collapsed.has(hdr.code);
                  return (
                    <div key={hdr.code}>
                      <div className="flex items-center gap-2 px-4 py-2 pl-8 hover:bg-[#fafafa]" style={{ borderTop: '1px solid #f7f7f7' }}>
                        {children.length > 0 ? <button onClick={() => toggle(hdr.code)}>{hc ? <ChevronRight className="w-3.5 h-3.5" style={{ color: '#929292' }} /> : <ChevronDown className="w-3.5 h-3.5" style={{ color: '#929292' }} />}</button> : <span className="w-3.5" />}
                        <span className="text-xs font-mono" style={{ color: '#929292' }}>{hdr.code}</span>
                        <button onClick={() => onOpen(hdr.code)} className="text-sm font-semibold text-left flex-1" style={{ color: '#222' }}>{hdr.name}</button>
                      </div>
                      {!hc && children.map((c) => (
                        <button key={c.code} onClick={() => onOpen(c.code)} className="w-full flex items-center gap-2 px-4 py-1.5 pl-16 hover:bg-[#fafafa] text-left" style={{ borderTop: '1px solid #f7f7f7' }}>
                          <span className="text-xs font-mono" style={{ color: '#b0b0b0' }}>{c.code}</span>
                          <span className="text-sm inline-flex items-center gap-1.5" style={{ color: '#3f3f3f' }}>{c.name}{c.systemLocked && <Lock className="w-3 h-3" style={{ color: '#6a4ec0' }} />}</span>
                          <span className="ml-auto text-xs" style={{ color: '#929292' }}>{c.balance ? money(c.balance) : ''}</span>
                          {c.status === 'inactive' && <Badge label="Inactive" fg="#6a6a6a" bg="#f0f0f0" />}
                        </button>
                      ))}
                    </div>
                  );
                })}
                {orphans.map((c) => (
                  <button key={c.code} onClick={() => onOpen(c.code)} className="w-full flex items-center gap-2 px-4 py-1.5 pl-8 hover:bg-[#fafafa] text-left" style={{ borderTop: '1px solid #f7f7f7' }}>
                    <span className="text-xs font-mono" style={{ color: '#b0b0b0' }}>{c.code}</span>
                    <span className="text-sm" style={{ color: '#3f3f3f' }}>{c.name}</span>
                    <span className="ml-auto text-xs" style={{ color: '#929292' }}>{c.balance ? money(c.balance) : ''}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

const fil = 'h-9 px-2.5 rounded-lg text-xs border border-[#dddddd] bg-white text-[#6a6a6a]';
