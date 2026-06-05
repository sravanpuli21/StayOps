'use client';

import { useState, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Plus, Search, Download, Building2, AlertTriangle } from 'lucide-react';
import { HOTEL_ENTITIES, getEntity } from '@hos/shared/accounting-os';
import { useAcctOs } from '../_context';
import { useAcctState, editVendor } from '../_store';
import { allVendors, vendorsForHotelLive, duplicateGroups } from '../_vendors';
import { money, moneyShort, Badge, card } from '../_ui';
import { ModuleNav, ScopeHeader } from '../_ModuleNav';
import { AddVendorModal } from './_AddVendor';
import { EXPENSE_CATS, DEPTS } from './_constants';

const TABS = ['Overview', 'All Vendors', 'Vendor Spend', 'Missing Info', 'Duplicates', 'Activity', 'Settings'] as const;
type Tab = typeof TABS[number];

const STATUS_STYLE: Record<string, { fg: string; bg: string; label: string }> = {
  active: { fg: '#15803d', bg: '#dcfce7', label: 'Active' },
  'needs-review': { fg: '#b45309', bg: '#fef3c7', label: 'Needs Review' },
  inactive: { fg: '#929292', bg: '#f0f0f0', label: 'Inactive' },
  duplicate: { fg: '#b91c1c', bg: '#fee2e2', label: 'Duplicate' },
  archived: { fg: '#929292', bg: '#f0f0f0', label: 'Archived' },
};

function VendorsInner() {
  const router = useRouter();
  const params = useSearchParams();
  const { selection, selectHotel } = useAcctOs();
  const store = useAcctState();
  const [tab, setTab] = useState<Tab>('Overview');
  const [q, setQ] = useState(params.get('v') ?? '');
  const [addOpen, setAddOpen] = useState(false);

  const single = selection.kind === 'hotel';
  const hotelId = single ? selection.hotelId : null;
  const h = hotelId ? getEntity(hotelId) : null;

  const vendors = useMemo(() => {
    const base = single && hotelId ? vendorsForHotelLive(store, hotelId) : allVendors(store);
    const s = q.toLowerCase();
    return base.filter((v) => !s || v.name.toLowerCase().includes(s) || (getEntity(v.hotelId)?.propertyCode ?? '').toLowerCase().includes(s) || (v.defaultCategory ?? '').toLowerCase().includes(s));
  }, [store, single, hotelId, q]);

  const missingInfo = vendors.filter((v) => !v.defaultCategory || !v.defaultDepartment);
  const dups = duplicateGroups(store).filter((g) => !single || g.hotelId === hotelId);

  return (
    <div className="max-w-[1300px] mx-auto flex flex-col gap-5">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <ScopeHeader single={single} title={single ? `Vendors · ${h?.hotelName}` : 'Vendors'} sub={single ? `${h?.legalEntity} · ${h?.propertyCode} · vendors belong only to this hotel` : 'Hotel-specific vendors used in bank and credit card transactions. The same name can exist under multiple hotels.'} />
        <div className="flex gap-2">
          <button onClick={() => setAddOpen(true)} className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl text-xs font-semibold" style={{ background: '#6a4ec0', color: '#fff' }}><Plus className="w-4 h-4" /> Add Vendor</button>
          <button className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl text-xs font-semibold" style={{ background: '#fff', border: '1px solid #dddddd', color: '#6a6a6a' }}><Download className="w-3.5 h-3.5" /> Export</button>
        </div>
      </div>

      <ModuleNav tabs={TABS} active={tab} onChange={setTab} counts={{ 'Missing Info': missingInfo.length, Duplicates: dups.length }} />

      {/* OVERVIEW */}
      {tab === 'Overview' && (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <KC label={single ? 'Total Vendors' : 'Total Vendor Records'} value={String(vendors.length)} />
            <KC label="Active" value={String(vendors.filter((v) => v.status === 'active').length)} accent="#15803d" />
            <KC label="Missing Info" value={String(missingInfo.length)} accent="#b45309" />
            <KC label="Duplicate Names (same hotel)" value={String(dups.length)} accent="#b91c1c" />
          </div>
          {!single && (
            <div className="overflow-x-auto rounded-2xl" style={card}>
              <table className="w-full text-sm border-collapse">
                <thead><tr style={{ background: '#f7f7f7', borderBottom: '1px solid #dddddd' }}>{['Hotel', 'Vendor Records', 'Active', 'Missing Info', ''].map((x, i) => <th key={x} className="text-[11px] font-semibold uppercase tracking-wide py-2.5 px-3" style={{ color: '#6a6a6a', textAlign: i >= 1 && i <= 3 ? 'center' : 'left' }}>{x}</th>)}</tr></thead>
                <tbody>
                  {HOTEL_ENTITIES.map((he, i) => {
                    const hv = vendorsForHotelLive(store, he.id);
                    return (
                      <tr key={he.id} className="hover:bg-[#fafafa]" style={{ borderBottom: i < HOTEL_ENTITIES.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                        <td className="py-2.5 px-3"><p className="font-medium" style={{ color: '#222' }}>{he.hotelName}</p><p className="text-[11px]" style={{ color: '#929292' }}>{he.legalEntity} · {he.propertyCode}</p></td>
                        <td className="py-2.5 px-3 text-center text-xs" style={{ color: '#3f3f3f' }}>{hv.length}</td>
                        <td className="py-2.5 px-3 text-center text-xs" style={{ color: '#15803d' }}>{hv.filter((v) => v.status === 'active').length}</td>
                        <td className="py-2.5 px-3 text-center text-xs" style={{ color: '#b45309', fontWeight: 600 }}>{hv.filter((v) => !v.defaultCategory || !v.defaultDepartment).length}</td>
                        <td className="py-2.5 px-3"><button onClick={() => selectHotel(he.id)} className="text-xs font-semibold" style={{ color: '#6a4ec0' }}>View Vendors</button></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          {single && <p className="text-xs px-1" style={{ color: '#929292' }}>These vendors belong only to {h?.hotelName}. The same vendor name may exist separately under other hotels.</p>}
        </div>
      )}

      {/* ALL VENDORS + SPEND share the table */}
      {(tab === 'All Vendors' || tab === 'Vendor Spend') && (
        <>
          <div className="flex items-center gap-2 h-9 px-3 rounded-full max-w-md" style={{ background: '#fff', border: '1px solid #dddddd' }}>
            <Search className="w-4 h-4" style={{ color: '#929292' }} />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search vendor name, hotel, property code, category..." className="flex-1 text-sm outline-none bg-transparent" style={{ color: '#222' }} />
          </div>
          <div className="overflow-x-auto rounded-2xl" style={card}>
            <table className="w-full text-sm border-collapse">
              <thead><tr style={{ background: '#f7f7f7', borderBottom: '1px solid #dddddd' }}>
                {[...(single ? ['Vendor'] : ['Vendor', 'Hotel']), 'Category', 'Dept', 'Spend (Mo)', ...(tab === 'Vendor Spend' ? ['Last Mo', 'Change'] : ['YTD']), 'Txns', 'Receipts', 'Status', ''].map((x, i) => <th key={x + i} className="text-[11px] font-semibold uppercase tracking-wide py-2.5 px-3 whitespace-nowrap" style={{ color: '#6a6a6a' }}>{x}</th>)}
              </tr></thead>
              <tbody>
                {vendors.map((v, i) => {
                  const st = STATUS_STYLE[v.status];
                  const change = v.spendLastMonth ? Math.round(((v.spendMonth - v.spendLastMonth) / v.spendLastMonth) * 100) : 0;
                  return (
                    <tr key={v.id} className="hover:bg-[#fafafa] cursor-pointer" style={{ borderBottom: i < vendors.length - 1 ? '1px solid #f0f0f0' : 'none' }} onClick={() => router.push(`/web/accounting/vendors/${v.id}`)}>
                      <td className="py-2.5 px-3 font-medium" style={{ color: '#222' }}>{v.name}</td>
                      {!single && <td className="py-2.5 px-3 text-xs"><span style={{ color: '#3f3f3f' }}>{getEntity(v.hotelId)?.hotelName}</span><br /><span className="text-[11px] font-mono" style={{ color: '#929292' }}>{getEntity(v.hotelId)?.propertyCode}</span></td>}
                      <td className="py-2.5 px-3 text-xs" style={{ color: v.defaultCategory ? '#3f3f3f' : '#c1c1c1' }}>{v.defaultCategory ?? 'Missing'}</td>
                      <td className="py-2.5 px-3 text-xs" style={{ color: v.defaultDepartment ? '#6a6a6a' : '#c1c1c1' }}>{v.defaultDepartment ?? 'Missing'}</td>
                      <td className="py-2.5 px-3 text-sm font-semibold" style={{ color: '#222' }}>{money(v.spendMonth)}</td>
                      {tab === 'Vendor Spend'
                        ? <><td className="py-2.5 px-3 text-xs" style={{ color: '#6a6a6a' }}>{money(v.spendLastMonth)}</td><td className="py-2.5 px-3 text-xs font-semibold" style={{ color: change > 0 ? '#b91c1c' : change < 0 ? '#15803d' : '#929292' }}>{change > 0 ? `▲ ${change}%` : change < 0 ? `▼ ${Math.abs(change)}%` : '—'}</td></>
                        : <td className="py-2.5 px-3 text-xs" style={{ color: '#6a6a6a' }}>{money(v.spendYtd)}</td>}
                      <td className="py-2.5 px-3 text-center text-xs" style={{ color: '#6a6a6a' }}>{v.txCount}</td>
                      <td className="py-2.5 px-3 text-center">{v.missingReceipts > 0 ? <Badge label={String(v.missingReceipts)} fg="#b91c1c" bg="#fee2e2" /> : <span className="text-xs" style={{ color: '#15803d' }}>0</span>}</td>
                      <td className="py-2.5 px-3"><Badge label={st.label} fg={st.fg} bg={st.bg} /></td>
                      <td className="py-2.5 px-3"><span className="text-xs font-semibold" style={{ color: '#6a4ec0' }}>View</span></td>
                    </tr>
                  );
                })}
                {vendors.length === 0 && <tr><td colSpan={10} className="py-10 text-center text-sm" style={{ color: '#929292' }}>No vendors{single ? ' for this hotel' : ''} yet. Add one or create from a transaction.</td></tr>}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* MISSING INFO — inline assign */}
      {tab === 'Missing Info' && (
        missingInfo.length === 0
          ? <Empty text="No vendor information missing. All active vendors have the required details." />
          : <div className="overflow-x-auto rounded-2xl" style={card}>
              <table className="w-full text-sm border-collapse">
                <thead><tr style={{ background: '#f7f7f7', borderBottom: '1px solid #dddddd' }}>{['Vendor', ...(single ? [] : ['Hotel']), 'Missing', 'Assign Category', 'Assign Department'].map((x) => <th key={x} className="text-left text-[11px] font-semibold uppercase tracking-wide py-2.5 px-3" style={{ color: '#6a6a6a' }}>{x}</th>)}</tr></thead>
                <tbody>
                  {missingInfo.map((v, i) => (
                    <tr key={v.id} style={{ borderBottom: i < missingInfo.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                      <td className="py-2.5 px-3 font-medium" style={{ color: '#222' }}>{v.name}</td>
                      {!single && <td className="py-2.5 px-3 text-xs" style={{ color: '#929292' }}>{getEntity(v.hotelId)?.propertyCode}</td>}
                      <td className="py-2.5 px-3">{!v.defaultCategory && <Badge label="Category" fg="#b45309" bg="#fef3c7" />} {!v.defaultDepartment && <Badge label="Dept" fg="#b45309" bg="#fef3c7" />}</td>
                      <td className="py-2.5 px-3"><select defaultValue={v.defaultCategory ?? ''} onChange={(e) => editVendor(v.id, v.hotelId, { defaultCategory: e.target.value, status: 'active' }, `Set category ${e.target.value}`)} className="h-8 px-2 rounded-lg text-xs" style={{ border: '1px solid #dddddd', background: '#fff', color: '#222' }}><option value="">Select…</option>{EXPENSE_CATS.map((c) => <option key={c} value={c}>{c}</option>)}</select></td>
                      <td className="py-2.5 px-3"><select defaultValue={v.defaultDepartment ?? ''} onChange={(e) => editVendor(v.id, v.hotelId, { defaultDepartment: e.target.value }, `Set dept ${e.target.value}`)} className="h-8 px-2 rounded-lg text-xs" style={{ border: '1px solid #dddddd', background: '#fff', color: '#222' }}><option value="">Select…</option>{DEPTS.map((d) => <option key={d} value={d}>{d}</option>)}</select></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
      )}

      {/* DUPLICATES — same hotel only */}
      {tab === 'Duplicates' && (
        <div className="flex flex-col gap-3">
          <div className="px-3 py-2 rounded-xl text-xs flex items-center gap-2" style={{ background: '#fff7ed', color: '#b45309' }}><AlertTriangle className="w-4 h-4" /> Vendors from different hotel entities cannot be merged in this version. Only same-hotel duplicates are shown.</div>
          {dups.length === 0
            ? <Empty text="No duplicate vendors found. Duplicate vendor names within the same hotel will appear here." />
            : <div className="overflow-x-auto rounded-2xl" style={card}>
                <table className="w-full text-sm border-collapse">
                  <thead><tr style={{ background: '#f7f7f7', borderBottom: '1px solid #dddddd' }}>{['Hotel', 'Vendor A', 'Vendor B', 'Reason', ''].map((x) => <th key={x} className="text-left text-[11px] font-semibold uppercase tracking-wide py-2.5 px-3" style={{ color: '#6a6a6a' }}>{x}</th>)}</tr></thead>
                  <tbody>{dups.map((g, i) => (
                    <tr key={i} style={{ borderBottom: i < dups.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                      <td className="py-2.5 px-3 text-xs" style={{ color: '#6a6a6a' }}>{getEntity(g.hotelId)?.propertyCode}</td>
                      <td className="py-2.5 px-3 text-sm" style={{ color: '#222' }}>{g.a.name}</td>
                      <td className="py-2.5 px-3 text-sm" style={{ color: '#222' }}>{g.b.name}</td>
                      <td className="py-2.5 px-3 text-xs" style={{ color: '#6a6a6a' }}>{g.reason}</td>
                      <td className="py-2.5 px-3"><button onClick={() => router.push(`/web/accounting/vendors/${g.a.id}`)} className="text-xs font-semibold" style={{ color: '#6a4ec0' }}>Compare</button></td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>}
        </div>
      )}

      {tab === 'Activity' && (
        <div className="rounded-2xl overflow-hidden" style={card}>
          {store.entityActivity.filter((a) => a.recordType === 'Vendor').length === 0
            ? <Empty text="No vendor activity yet. Vendor creation, edits, merges, and rules appear here." />
            : store.entityActivity.filter((a) => a.recordType === 'Vendor').slice(0, 40).map((a, i, arr) => (
              <div key={a.id} className="flex items-center gap-3 px-4 py-2.5" style={{ borderBottom: i < arr.length - 1 ? '1px solid #f0f0f0' : 'none' }}><span className="w-1.5 h-1.5 rounded-full" style={{ background: '#6a4ec0' }} /><span className="text-sm" style={{ color: '#222' }}>{a.action}</span>{a.detail && <span className="text-xs" style={{ color: '#929292' }}>· {a.detail}</span>}<span className="ml-auto text-[11px]" style={{ color: '#c1c1c1' }}>{getEntity(a.hotelId ?? '')?.propertyCode}</span></div>
            ))}
        </div>
      )}

      {tab === 'Settings' && (
        <div className="flex flex-col gap-4">
          <div className="p-4 flex items-center justify-between" style={card}>
            <div><p className="text-sm font-bold" style={{ color: '#222' }}>Vendor Scope</p><p className="text-xs mt-0.5" style={{ color: '#929292' }}>Vendors are created separately for each hotel entity in this version.</p></div>
            <Badge label="Hotel Entity Level" fg="#6a4ec0" bg="#ece4fb" />
          </div>
          <div className="p-4 flex items-center justify-between" style={card}>
            <div><p className="text-sm font-bold" style={{ color: '#222' }}>Global Vendor Master</p><p className="text-xs mt-0.5" style={{ color: '#929292' }}>Group vendor records across hotels for portfolio reporting and shared management.</p></div>
            <Badge label="Coming Soon" fg="#929292" bg="#f0f0f0" />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {[['Allow vendors from transaction review', true], ['Require hotel entity when creating', true], ['Warn when same name in same hotel', true], ['Warn when same name in another hotel', true], ['Detect duplicates within same hotel', true], ['Ignore cross-hotel duplicates', true]].map(([l, on]) => (
              <div key={l as string} className="p-4 flex items-center justify-between" style={card}><span className="text-sm" style={{ color: '#222' }}>{l as string}</span><Badge label={on ? 'On' : 'Off'} fg={on ? '#15803d' : '#929292'} bg={on ? '#dcfce7' : '#f0f0f0'} /></div>
            ))}
          </div>
        </div>
      )}

      {addOpen && <AddVendorModal preHotel={hotelId ?? ''} onClose={() => setAddOpen(false)} />}
    </div>
  );
}

function KC({ label, value, accent = '#222' }: { label: string; value: string; accent?: string }) {
  return <div className="p-3.5" style={card}><p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: '#929292' }}>{label}</p><p className="text-xl font-bold mt-1" style={{ color: accent }}>{value}</p></div>;
}
function Empty({ text }: { text: string }) { return <div className="rounded-2xl p-10 text-center text-sm" style={{ border: '1px dashed #dddddd', background: '#fff', color: '#929292' }}>{text}</div>; }

export default function VendorsPage() {
  return <Suspense fallback={<div className="text-sm" style={{ color: '#929292' }}>Loading…</div>}><VendorsInner /></Suspense>;
}
