'use client';

import { useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Upload, Download, Search, ArrowRight, Plus } from 'lucide-react';
import { getEntity, HOTEL_ENTITIES, type AcctTransaction, type TxStatus } from '@hos/shared/accounting-os';
import { useAcctOs } from '../_context';
import { useAcctState, allTransactions, editTx } from '../_store';
import { card, money, moneyShort, Badge, TX_STATUS, RECEIPT_STATUS } from '../_ui';
import { ModuleNav, ScopeHeader } from '../_ModuleNav';
import { TxDrawer } from './_TxDrawer';
import { SplitModal, RuleModal } from './_Modals';

const TABS = ['Overview', 'All', 'Needs Review', 'Uncategorized', 'Missing Receipts', 'Possible Duplicates', 'Approved', 'Posted', 'Excluded', 'Transfers', 'Owner Activity', 'Asset Purchases', 'Activity', 'Settings'] as const;
type Tab = typeof TABS[number];

function TransactionsInner() {
  const params = useSearchParams();
  const { selection, selectHotel } = useAcctOs();
  const store = useAcctState();
  const tabParam = params.get('tab');
  const initial: Tab = tabParam === 'needs-review' ? 'Needs Review' : tabParam === 'missing' ? 'Missing Receipts' : 'Needs Review';
  const [tab, setTab] = useState<Tab>(initial);
  const [q, setQ] = useState('');
  const [drawer, setDrawer] = useState<AcctTransaction | null>(null);
  const [split, setSplit] = useState<AcctTransaction | null>(null);
  const [ruleTx, setRuleTx] = useState<AcctTransaction | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const single = selection.kind === 'hotel';
  const all = allTransactions(store);
  const scoped = single ? all.filter((t) => t.hotelId === selection.hotelId) : all;

  const filtered = useMemo(() => {
    let rows = scoped;
    if (tab === 'Needs Review') rows = rows.filter((t) => t.status === 'needs-review');
    else if (tab === 'Uncategorized') rows = rows.filter((t) => t.status === 'uncategorized');
    else if (tab === 'Missing Receipts') rows = rows.filter((t) => t.receipt === 'missing' || t.receipt === 'required');
    else if (tab === 'Possible Duplicates') rows = rows.filter((t) => t.status === 'duplicate');
    else if (tab === 'Approved') rows = rows.filter((t) => t.status === 'approved');
    else if (tab === 'Posted') rows = rows.filter((t) => t.status === 'posted');
    else if (tab === 'Excluded') rows = rows.filter((t) => t.status === 'excluded');
    else if (tab === 'Asset Purchases') rows = rows.filter((t) => Math.abs(t.amount) > 500 && (t.category === 'Equipment' || t.category === 'Furniture & Fixtures' || (t.description.match(/best buy|tv/i) && t.status !== 'posted')));
    if (q.trim()) { const s = q.toLowerCase(); rows = rows.filter((t) => t.description.toLowerCase().includes(s) || (t.vendor ?? '').toLowerCase().includes(s) || (t.category ?? '').toLowerCase().includes(s)); }
    return rows;
  }, [scoped, tab, q]);

  const count = (key: Tab) => {
    if (key === 'All') return scoped.length;
    if (key === 'Needs Review') return scoped.filter((t) => t.status === 'needs-review').length;
    if (key === 'Uncategorized') return scoped.filter((t) => t.status === 'uncategorized').length;
    if (key === 'Missing Receipts') return scoped.filter((t) => t.receipt === 'missing' || t.receipt === 'required').length;
    if (key === 'Possible Duplicates') return scoped.filter((t) => t.status === 'duplicate').length;
    if (key === 'Approved') return scoped.filter((t) => t.status === 'approved').length;
    if (key === 'Posted') return scoped.filter((t) => t.status === 'posted').length;
    return 0;
  };

  const toggle = (id: string) => setSelected((p) => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const bulk = (status: TxStatus, note: string) => { selected.forEach((id) => { const t = scoped.find((x) => x.id === id); if (t) editTx(id, { status }, t.hotelId, note); }); setSelected(new Set()); };

  const isList = ['All', 'Needs Review', 'Uncategorized', 'Missing Receipts', 'Possible Duplicates', 'Approved', 'Posted', 'Excluded', 'Asset Purchases'].includes(tab);

  return (
    <div className="max-w-[1400px] mx-auto flex flex-col gap-4">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <ScopeHeader single={single} title="Transactions" sub="Review, categorize, approve, and post imported bank and credit card activity." />
        <div className="flex gap-2">
          <Link href="/web/accounting/banking/upload" className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl text-xs font-semibold" style={{ background: '#fff', border: '1px solid #dddddd', color: '#6a6a6a' }}><Upload className="w-3.5 h-3.5" /> Upload</Link>
          <button className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl text-xs font-semibold" style={{ background: '#fff', border: '1px solid #dddddd', color: '#6a6a6a' }}><Plus className="w-3.5 h-3.5" /> Manual</button>
          <button className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl text-xs font-semibold" style={{ background: '#fff', border: '1px solid #dddddd', color: '#6a6a6a' }}><Download className="w-3.5 h-3.5" /> Export</button>
        </div>
      </div>

      <ModuleNav tabs={TABS} active={tab} onChange={setTab} counts={{ 'Needs Review': count('Needs Review'), 'Missing Receipts': count('Missing Receipts'), 'Possible Duplicates': count('Possible Duplicates'), Approved: count('Approved') }} />

      {/* OVERVIEW */}
      {tab === 'Overview' && (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <KC label="This Month" value={String(scoped.length)} />
            <KC label="Needs Review" value={String(count('Needs Review'))} accent="#b45309" />
            <KC label="Uncategorized" value={String(count('Uncategorized'))} accent="#6a6a6a" />
            <KC label="Missing Receipts" value={String(count('Missing Receipts'))} accent="#b91c1c" />
            <KC label="Possible Duplicates" value={String(count('Possible Duplicates'))} accent="#b91c1c" />
            <KC label="Approved Not Posted" value={String(count('Approved'))} accent="#6a4ec0" />
            <KC label="Posted" value={String(count('Posted'))} accent="#15803d" />
            <KC label="Bank / Card" value={`${scoped.filter((t) => t.source === 'bank').length}/${scoped.filter((t) => t.source === 'credit-card').length}`} />
          </div>
          {!single && (
            <div className="overflow-x-auto rounded-2xl" style={card}>
              <table className="w-full text-sm border-collapse">
                <thead><tr style={{ background: '#f7f7f7', borderBottom: '1px solid #dddddd' }}>{['Hotel', 'To Review', 'Missing Receipts', 'Duplicates', 'Approved', ''].map((x, i) => <th key={x} className="text-[11px] font-semibold uppercase tracking-wide py-2.5 px-3" style={{ color: '#6a6a6a', textAlign: i >= 1 && i <= 4 ? 'center' : 'left' }}>{x}</th>)}</tr></thead>
                <tbody>
                  {HOTEL_ENTITIES.map((he, i) => {
                    const ht = all.filter((t) => t.hotelId === he.id);
                    return (
                      <tr key={he.id} className="hover:bg-[#fafafa]" style={{ borderBottom: i < HOTEL_ENTITIES.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                        <td className="py-2.5 px-3"><p className="font-medium" style={{ color: '#222' }}>{he.hotelName}</p><p className="text-[11px]" style={{ color: '#929292' }}>{he.propertyCode}</p></td>
                        <td className="py-2.5 px-3 text-center text-xs" style={{ color: '#b45309', fontWeight: 600 }}>{ht.filter((t) => t.status === 'needs-review' || t.status === 'uncategorized').length}</td>
                        <td className="py-2.5 px-3 text-center text-xs" style={{ color: '#b91c1c' }}>{ht.filter((t) => t.receipt === 'missing').length}</td>
                        <td className="py-2.5 px-3 text-center text-xs" style={{ color: '#6a6a6a' }}>{ht.filter((t) => t.status === 'duplicate').length}</td>
                        <td className="py-2.5 px-3 text-center text-xs" style={{ color: '#6a4ec0' }}>{ht.filter((t) => t.status === 'approved').length}</td>
                        <td className="py-2.5 px-3"><button onClick={() => selectHotel(he.id)} className="text-xs font-semibold" style={{ color: '#6a4ec0' }}>Review</button></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* LIST TABS */}
      {isList && (
        <>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 h-9 px-3 rounded-full flex-1 min-w-[200px]" style={{ background: '#fff', border: '1px solid #dddddd' }}>
              <Search className="w-4 h-4" style={{ color: '#929292' }} />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search description, vendor, category" className="flex-1 text-sm outline-none bg-transparent" style={{ color: '#222' }} />
            </div>
            {selected.size > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold" style={{ color: '#6a4ec0' }}>{selected.size} selected</span>
                <button onClick={() => bulk('approved', 'Bulk approved')} className="h-8 px-3 rounded-lg text-xs font-semibold" style={{ background: '#ece4fb', color: '#6a4ec0' }}>Approve</button>
                <button onClick={() => bulk('categorized', 'Bulk reviewed')} className="h-8 px-3 rounded-lg text-xs font-semibold" style={{ background: '#f7f7f7', border: '1px solid #dddddd', color: '#6a6a6a' }}>Mark Reviewed</button>
                <button onClick={() => bulk('excluded', 'Bulk excluded')} className="h-8 px-3 rounded-lg text-xs font-semibold" style={{ background: '#fef2f2', color: '#b91c1c' }}>Exclude</button>
              </div>
            )}
          </div>

          <div className="overflow-x-auto rounded-2xl" style={card}>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr style={{ background: '#f7f7f7', borderBottom: '1px solid #dddddd' }}>
                  <th className="w-8 py-2.5 px-3"></th>
                  {['Date', 'Hotel', 'Source', 'Description', 'Vendor', 'Amount', 'Direction', 'Category', 'Receipt', 'Status', ''].map((h, i) => (
                    <th key={h} className="text-[11px] font-semibold uppercase tracking-wide py-2.5 px-3 whitespace-nowrap" style={{ color: '#6a6a6a', textAlign: i === 5 ? 'right' : 'left' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((t, i) => {
                  const he = getEntity(t.hotelId);
                  const s = TX_STATUS[t.status];
                  const rc = RECEIPT_STATUS[t.receipt];
                  const dir = t.source === 'credit-card' ? (t.amount < 0 ? 'Charge' : 'Credit') : (t.amount < 0 ? 'Money Out' : 'Money In');
                  return (
                    <tr key={t.id} className="hover:bg-[#fafafa] cursor-pointer" style={{ borderBottom: i < filtered.length - 1 ? '1px solid #f0f0f0' : 'none' }} onClick={() => setDrawer(t)}>
                      <td className="py-2.5 px-3" onClick={(e) => e.stopPropagation()}><input type="checkbox" checked={selected.has(t.id)} onChange={() => toggle(t.id)} /></td>
                      <td className="py-2.5 px-3 text-xs" style={{ color: '#6a6a6a' }}>{t.dateIso.slice(5)}</td>
                      <td className="py-2.5 px-3 text-xs" style={{ color: '#6a6a6a' }}>{he?.propertyCode}</td>
                      <td className="py-2.5 px-3 text-xs"><Badge label={t.source === 'bank' ? 'Bank' : 'Card'} fg={t.source === 'bank' ? '#1d4ed8' : '#b45309'} bg={t.source === 'bank' ? '#dbeafe' : '#fef3c7'} /></td>
                      <td className="py-2.5 px-3"><p className="text-sm truncate max-w-[180px]" style={{ color: '#222' }}>{t.description}</p></td>
                      <td className="py-2.5 px-3 text-xs" style={{ color: t.vendor ? '#3f3f3f' : '#c1c1c1' }}>{t.vendor ?? '—'}</td>
                      <td className="py-2.5 px-3 text-sm font-semibold text-right whitespace-nowrap" style={{ color: t.amount < 0 ? '#b91c1c' : '#15803d' }}>{money(Math.abs(t.amount))}</td>
                      <td className="py-2.5 px-3 text-xs" style={{ color: '#6a6a6a' }}>{dir}</td>
                      <td className="py-2.5 px-3 text-xs" style={{ color: t.category ? '#3f3f3f' : '#c1c1c1' }}>{t.category ?? '—'}</td>
                      <td className="py-2.5 px-3"><Badge label={rc.label} fg={rc.fg} bg={rc.bg} /></td>
                      <td className="py-2.5 px-3"><Badge label={s.label} fg={s.fg} bg={s.bg} /></td>
                      <td className="py-2.5 px-3"><span className="text-xs font-semibold" style={{ color: '#6a4ec0' }}>Review</span></td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && <tr><td colSpan={12} className="py-10 text-center text-sm" style={{ color: '#929292' }}>Nothing in this view. Upload a statement or pick another tab.</td></tr>}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* SPECIAL TABS */}
      {tab === 'Transfers' && <Info text="Transfers between bank accounts and credit card payments appear here. Suggested matches are created when a bank statement shows a transfer or card payment. Confirm a match to post Debit destination / Credit source." />}
      {tab === 'Owner Activity' && <Info text="Owner contributions, draws, and owner-paid expenses appear here. Set a transaction's type to Owner Contribution / Owner Draw in the review drawer to route it to the right equity account." />}
      {tab === 'Activity' && (
        <div className="rounded-2xl overflow-hidden" style={card}>{store.activity.length === 0 ? <Info text="No transaction activity yet this session." /> : store.activity.slice(0, 40).map((a, i, arr) => (<div key={a.id} className="flex items-center gap-3 px-4 py-2.5" style={{ borderBottom: i < arr.length - 1 ? '1px solid #f0f0f0' : 'none' }}><span className="w-1.5 h-1.5 rounded-full" style={{ background: '#6a4ec0' }} /><span className="text-sm" style={{ color: '#222' }}>{a.action}</span>{a.detail && <span className="text-xs" style={{ color: '#929292' }}>· {a.detail}</span>}<span className="ml-auto text-[11px]" style={{ color: '#c1c1c1' }}>{a.actor}</span></div>))}</div>
      )}
      {tab === 'Settings' && (
        <div className="grid md:grid-cols-2 gap-4">
          {[['Require review before posting', true], ['Require category before approval', true], ['Require department before posting', true], ['Require balanced journal entry', true], ['Lock posted transactions', true], ['Prevent posting to closed months', true], ['Require receipts above $250', true], ['Auto-exclude exact duplicates', true]].map(([l, on]) => (
            <div key={l as string} className="p-4 flex items-center justify-between" style={card}><span className="text-sm" style={{ color: '#222' }}>{l as string}</span><Badge label={on ? 'On' : 'Off'} fg={on ? '#15803d' : '#929292'} bg={on ? '#dcfce7' : '#f0f0f0'} /></div>
          ))}
        </div>
      )}

      {drawer && <TxDrawer tx={drawer} onClose={() => setDrawer(null)} onSplit={(t) => { setDrawer(null); setSplit(t); }} onRule={(t) => { setDrawer(null); setRuleTx(t); }} />}
      {split && <SplitModal tx={split} onClose={() => setSplit(null)} />}
      {ruleTx && <RuleModal tx={ruleTx} onClose={() => setRuleTx(null)} />}
    </div>
  );
}

function KC({ label, value, accent = '#222' }: { label: string; value: string; accent?: string }) {
  return <div className="p-3.5" style={card}><p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: '#929292' }}>{label}</p><p className="text-xl font-bold mt-1" style={{ color: accent }}>{value}</p></div>;
}
function Info({ text }: { text: string }) { return <div className="rounded-2xl p-8 text-center text-sm" style={{ border: '1px dashed #dddddd', background: '#fff', color: '#929292', lineHeight: 1.6 }}>{text}</div>; }

export default function TransactionsPage() {
  return <Suspense fallback={<div className="text-sm" style={{ color: '#929292' }}>Loading…</div>}><TransactionsInner /></Suspense>;
}
