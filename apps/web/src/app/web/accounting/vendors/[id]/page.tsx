'use client';

import { use, useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Pencil, Wand2, Receipt, Building2, Plus } from 'lucide-react';
import { getEntity, txForHotel } from '@hos/shared/accounting-os';
import { useAcctState, editVendor } from '../../_store';
import { oneVendor } from '../../_vendors';
import { money, Badge, card, fmtDate } from '../../_ui';
import { EXPENSE_CATS, DEPTS } from '../_constants';

const TABS = ['Overview', 'Transactions', 'Rules', 'Documents', 'Activity Log'] as const;
type Tab = typeof TABS[number];

function VendorDetailInner({ id }: { id: string }) {
  const router = useRouter();
  const store = useAcctState();
  const v = oneVendor(store, id);
  const [tab, setTab] = useState<Tab>('Overview');
  const [editing, setEditing] = useState(false);
  const [cat, setCat] = useState(v?.defaultCategory ?? '');
  const [dept, setDept] = useState(v?.defaultDepartment ?? '');

  if (!v) return <div className="max-w-4xl mx-auto"><Link href="/web/accounting/vendors" className="text-sm" style={{ color: '#6a6a6a' }}><ArrowLeft className="w-4 h-4 inline" /> Vendors</Link><p className="mt-6 text-sm" style={{ color: '#929292' }}>Vendor not found.</p></div>;
  const h = getEntity(v.hotelId);
  // Vendor's transactions = this hotel's transactions whose vendor/description matches.
  const vtx = txForHotel(v.hotelId).filter((t) => (t.vendor === v.name) || t.description.toLowerCase().includes(v.name.toLowerCase().split(' ')[0]));

  const saveDefaults = () => { editVendor(v.id, v.hotelId, { defaultCategory: cat || undefined, defaultDepartment: dept || undefined }, 'Edited defaults'); setEditing(false); };

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-5">
      <Link href="/web/accounting/vendors" className="inline-flex items-center gap-1 text-sm" style={{ color: '#6a6a6a' }}><ArrowLeft className="w-4 h-4" /> Vendors</Link>

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2"><h1 className="text-xl font-bold" style={{ color: '#222' }}>{v.name}</h1><Badge label="Hotel-specific vendor" fg="#6a4ec0" bg="#ece4fb" /></div>
          <p className="text-sm" style={{ color: '#929292' }}>{h?.hotelName} · {h?.legalEntity} · {h?.propertyCode}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setEditing(true)} className="h-9 px-3 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5" style={{ background: '#fff', border: '1px solid #dddddd', color: '#6a6a6a' }}><Pencil className="w-3.5 h-3.5" /> Edit Vendor</button>
          <Link href="/web/accounting/rules" className="h-9 px-3 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5" style={{ background: '#6a4ec0', color: '#fff' }}><Wand2 className="w-3.5 h-3.5" /> Create Rule</Link>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <SC label="Spend This Month" value={money(v.spendMonth)} />
        <SC label="Spend YTD" value={money(v.spendYtd)} />
        <SC label="Transactions" value={String(v.txCount)} />
        <SC label="Missing Receipts" value={String(v.missingReceipts)} accent={v.missingReceipts ? '#b91c1c' : '#15803d'} />
        <SC label="Default Category" value={v.defaultCategory ?? '—'} />
        <SC label="Default Dept" value={v.defaultDepartment ?? '—'} />
      </div>

      <div className="flex gap-1 overflow-x-auto" style={{ borderBottom: '1px solid #dddddd' }}>
        {TABS.map((t) => <button key={t} onClick={() => setTab(t)} className="px-3.5 py-2.5 text-sm font-semibold whitespace-nowrap" style={{ color: tab === t ? '#6a4ec0' : '#6a6a6a', borderBottom: tab === t ? '2px solid #6a4ec0' : '2px solid transparent' }}>{t}</button>)}
      </div>

      {tab === 'Overview' && (
        <div className="flex flex-col gap-5">
          <Sect title="Vendor Identity"><Info label="Vendor Name" value={v.name} /><Info label="Legal Name" value={v.legalName ?? '—'} /><Info label="Vendor Type" value={v.type} /><Info label="Status" value={v.status} /><Info label="Hotel Entity" value={h?.hotelName ?? '—'} /><Info label="Legal Entity" value={h?.legalEntity ?? '—'} /></Sect>
          <Sect title="Default Accounting" action={editing ? undefined : <button onClick={() => setEditing(true)} className="text-xs font-semibold" style={{ color: '#6a4ec0' }}>Edit Defaults</button>}>
            {editing ? (
              <>
                <div className="flex flex-col gap-1"><label className="text-[10px] font-bold uppercase tracking-wide" style={{ color: '#929292' }}>Default Category</label><select value={cat} onChange={(e) => setCat(e.target.value)} className="h-9 px-2 rounded-lg text-sm" style={{ border: '1px solid #dddddd' }}><option value="">Select…</option>{EXPENSE_CATS.map((c) => <option key={c} value={c}>{c}</option>)}</select></div>
                <div className="flex flex-col gap-1"><label className="text-[10px] font-bold uppercase tracking-wide" style={{ color: '#929292' }}>Default Department</label><select value={dept} onChange={(e) => setDept(e.target.value)} className="h-9 px-2 rounded-lg text-sm" style={{ border: '1px solid #dddddd' }}><option value="">Select…</option>{DEPTS.map((d) => <option key={d} value={d}>{d}</option>)}</select></div>
                <div className="md:col-span-2 flex gap-2"><button onClick={saveDefaults} className="h-9 px-4 rounded-xl text-xs font-semibold" style={{ background: '#6a4ec0', color: '#fff' }}>Save</button><button onClick={() => setEditing(false)} className="h-9 px-3 rounded-xl text-xs font-semibold" style={{ background: '#f7f7f7', border: '1px solid #dddddd', color: '#6a6a6a' }}>Cancel</button></div>
              </>
            ) : (<><Info label="Default Category" value={v.defaultCategory ?? 'Not set'} /><Info label="Default Department" value={v.defaultDepartment ?? 'Not set'} /><Info label="Receipt Rule" value="Required above $250" /><Info label="Active Rules" value={String(v.ruleCount)} /></>)}
          </Sect>
          <Sect title="Spend Summary"><Info label="This Month" value={money(v.spendMonth)} /><Info label="Last Month" value={money(v.spendLastMonth)} /><Info label="YTD" value={money(v.spendYtd)} /><Info label="Last Transaction" value={fmtDate(v.lastUsed)} /></Sect>
        </div>
      )}

      {tab === 'Transactions' && (
        <div className="flex flex-col gap-2">
          <p className="text-xs" style={{ color: '#929292' }}>Transactions for this vendor within {h?.hotelName} only.</p>
          <div className="overflow-x-auto rounded-2xl" style={card}>
            <table className="w-full text-sm border-collapse">
              <thead><tr style={{ background: '#f7f7f7', borderBottom: '1px solid #dddddd' }}>{['Date', 'Source', 'Description', 'Amount', 'Category', 'Receipt', 'Status'].map((x, i) => <th key={x} className="text-[11px] font-semibold uppercase tracking-wide py-2.5 px-3" style={{ color: '#6a6a6a', textAlign: i === 3 ? 'right' : 'left' }}>{x}</th>)}</tr></thead>
              <tbody>
                {vtx.slice(0, 30).map((t, i) => (
                  <tr key={t.id} style={{ borderBottom: i < Math.min(vtx.length, 30) - 1 ? '1px solid #f0f0f0' : 'none' }}>
                    <td className="py-2.5 px-3 text-xs" style={{ color: '#6a6a6a' }}>{t.dateIso.slice(5)}</td>
                    <td className="py-2.5 px-3 text-xs" style={{ color: '#6a6a6a' }}>{t.source === 'bank' ? 'Bank' : 'Card'}</td>
                    <td className="py-2.5 px-3 text-sm" style={{ color: '#222' }}>{t.description}</td>
                    <td className="py-2.5 px-3 text-sm font-semibold text-right" style={{ color: t.amount < 0 ? '#b91c1c' : '#15803d' }}>{money(Math.abs(t.amount))}</td>
                    <td className="py-2.5 px-3 text-xs" style={{ color: '#3f3f3f' }}>{t.category ?? '—'}</td>
                    <td className="py-2.5 px-3 text-xs" style={{ color: '#6a6a6a' }}>{t.receipt}</td>
                    <td className="py-2.5 px-3 text-xs" style={{ color: '#6a6a6a' }}>{t.status}</td>
                  </tr>
                ))}
                {vtx.length === 0 && <tr><td colSpan={7} className="py-8 text-center text-sm" style={{ color: '#929292' }}>No transactions for this vendor yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'Rules' && (
        <div className="flex flex-col gap-3">
          <div className="flex justify-end"><Link href="/web/accounting/rules" className="h-9 px-4 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5" style={{ background: '#6a4ec0', color: '#fff' }}><Plus className="w-4 h-4" /> Create Vendor Rule</Link></div>
          <Empty text={`Vendor rules for ${v.name} (hotel-specific) appear here. Create one to auto-categorize this vendor's transactions for ${h?.propertyCode}.`} />
        </div>
      )}
      {tab === 'Documents' && <Empty text="Vendor documents (receipts, invoices, contracts) for this hotel appear here." />}
      {tab === 'Activity Log' && (
        <div className="rounded-2xl overflow-hidden" style={card}>
          {store.entityActivity.filter((a) => a.recordType === 'Vendor' && a.hotelId === v.hotelId).length === 0
            ? <Empty text="No activity yet for this vendor." />
            : store.entityActivity.filter((a) => a.recordType === 'Vendor' && a.hotelId === v.hotelId).slice(0, 20).map((a, i, arr) => (
              <div key={a.id} className="flex items-center gap-3 px-4 py-2.5" style={{ borderBottom: i < arr.length - 1 ? '1px solid #f0f0f0' : 'none' }}><span className="w-1.5 h-1.5 rounded-full" style={{ background: '#6a4ec0' }} /><span className="text-sm" style={{ color: '#222' }}>{a.action}</span>{a.detail && <span className="text-xs" style={{ color: '#929292' }}>· {a.detail}</span>}</div>
            ))}
        </div>
      )}
    </div>
  );
}

function SC({ label, value, accent = '#222' }: { label: string; value: string; accent?: string }) { return <div className="p-3" style={card}><p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: '#929292' }}>{label}</p><p className="text-sm font-bold mt-0.5 truncate" style={{ color: accent }}>{value}</p></div>; }
function Sect({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) { return <div className="rounded-2xl overflow-hidden" style={card}><div className="px-5 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid #f0f0f0' }}><h2 className="text-sm font-bold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>{title}</h2>{action}</div><div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div></div>; }
function Info({ label, value }: { label: string; value: string }) { return <div><p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: '#929292' }}>{label}</p><p className="text-sm mt-0.5 capitalize" style={{ color: '#222' }}>{value}</p></div>; }
function Empty({ text }: { text: string }) { return <div className="rounded-2xl p-10 text-center text-sm" style={{ border: '1px dashed #dddddd', background: '#fff', color: '#929292' }}>{text}</div>; }

export default function VendorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <Suspense fallback={<div className="text-sm" style={{ color: '#929292' }}>Loading…</div>}><VendorDetailInner id={id} /></Suspense>;
}
