'use client';

import { use, useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Layers, Lock } from 'lucide-react';
import {
  COA_TEMPLATES, COA_TEMPLATE, HOTEL_ENTITIES, getEntity,
} from '@hos/shared/accounting-os';
import { useAcctState } from '../../../_store';
import { useAcctOs } from '../../../_context';
import { coaSetupForHotel } from '../../../_coa';
import { card, Badge, fmtDate } from '../../../_ui';
import { TypeBadge } from '../../_shared';
import { ApplyTemplateModal } from '../../_ApplyTemplate';

const TABS = ['Accounts', 'Applied Hotels', 'Version History', 'Settings'] as const;
type Tab = typeof TABS[number];

function Inner({ id }: { id: string }) {
  const router = useRouter();
  const store = useAcctState();
  const { selectHotel } = useAcctOs();
  const tp = COA_TEMPLATES.find((t) => t.id === id);
  const [tab, setTab] = useState<Tab>('Accounts');
  const [applyOpen, setApplyOpen] = useState(false);

  if (!tp) return <div className="max-w-5xl mx-auto"><Link href="/web/accounting/chart-of-accounts/template" className="text-sm" style={{ color: '#6a6a6a' }}><ArrowLeft className="w-4 h-4 inline" /> Templates</Link><p className="mt-6 text-sm" style={{ color: '#929292' }}>Template not found.</p></div>;

  const isPrimary = tp.primary;
  const applied = HOTEL_ENTITIES.filter((h) => coaSetupForHotel(store, h.id).templateApplied);

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-5">
      <Link href="/web/accounting/chart-of-accounts/template" className="inline-flex items-center gap-1 text-sm" style={{ color: '#6a6a6a' }}><ArrowLeft className="w-4 h-4" /> Templates</Link>

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div><div className="flex items-center gap-2"><h1 className="text-xl font-bold" style={{ color: '#222' }}>{tp.name}</h1>{isPrimary && <Badge label="Primary" fg="#6a4ec0" bg="#ece4fb" />}</div><p className="text-sm" style={{ color: '#929292' }}>{isPrimary ? 'Default account structure for HOS hotel entities.' : `${tp.hotelType} template.`}</p></div>
        <div className="flex gap-2">
          <button className="h-9 px-3 rounded-xl text-xs font-semibold" style={{ background: '#fff', border: '1px solid #dddddd', color: '#6a6a6a' }}>Edit Template</button>
          <button onClick={() => setApplyOpen(true)} className="h-9 px-4 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5" style={{ background: '#6a4ec0', color: '#fff' }}><Layers className="w-3.5 h-3.5" /> Apply to Hotel</button>
        </div>
      </div>

      <div className="flex gap-1 overflow-x-auto" style={{ borderBottom: '1px solid #dddddd' }}>
        {TABS.map((t) => <button key={t} onClick={() => setTab(t)} className="px-3.5 py-2.5 text-sm font-semibold whitespace-nowrap" style={{ color: tab === t ? '#6a4ec0' : '#6a6a6a', borderBottom: tab === t ? '2px solid #6a4ec0' : '2px solid transparent' }}>{t}</button>)}
      </div>

      {tab === 'Accounts' && (
        <div className="overflow-x-auto rounded-2xl" style={card}>
          <table className="w-full text-sm border-collapse">
            <thead><tr style={{ background: '#f7f7f7', borderBottom: '1px solid #dddddd' }}>{['Code', 'Account Name', 'Type', 'Detail Type', 'Parent', 'Required', 'System', 'Status'].map((h) => <th key={h} className="text-left text-[10px] font-semibold uppercase tracking-wide py-2.5 px-3 whitespace-nowrap" style={{ color: '#6a6a6a' }}>{h}</th>)}</tr></thead>
            <tbody>
              {(isPrimary ? COA_TEMPLATE : COA_TEMPLATE.slice(0, 40)).map((a, i, arr) => (
                <tr key={a.code} style={{ borderBottom: i < arr.length - 1 ? '1px solid #f0f0f0' : 'none', background: a.isHeader ? '#fcfcfc' : undefined }}>
                  <td className="py-2 px-3 text-xs font-mono" style={{ color: '#6a6a6a' }}>{a.code}</td>
                  <td className="py-2 px-3" style={{ paddingLeft: a.parent ? 28 : 12 }}><span className="inline-flex items-center gap-1.5" style={{ color: '#222', fontWeight: a.isHeader ? 700 : 500 }}>{a.name}{a.systemLocked && <Lock className="w-3 h-3" style={{ color: '#6a4ec0' }} />}</span></td>
                  <td className="py-2 px-3"><TypeBadge type={a.type} /></td>
                  <td className="py-2 px-3 text-xs" style={{ color: '#6a6a6a' }}>{a.detailType}</td>
                  <td className="py-2 px-3 text-xs font-mono" style={{ color: '#929292' }}>{a.parent ?? '—'}</td>
                  <td className="py-2 px-3">{a.required ? <Badge label="Required" fg="#b45309" bg="#fef3c7" /> : <span className="text-xs" style={{ color: '#b0b0b0' }}>Optional</span>}</td>
                  <td className="py-2 px-3">{a.systemLocked ? <Badge label="System" fg="#6a4ec0" bg="#ece4fb" /> : <span className="text-xs" style={{ color: '#b0b0b0' }}>—</span>}</td>
                  <td className="py-2 px-3"><Badge label="Active" fg="#15803d" bg="#dcfce7" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'Applied Hotels' && (
        <div className="overflow-x-auto rounded-2xl" style={card}>
          <table className="w-full text-sm border-collapse">
            <thead><tr style={{ background: '#f7f7f7', borderBottom: '1px solid #dddddd' }}>{['Hotel', 'Property Code', 'Applied Date', 'Accounts Created', 'Custom Overrides', 'Status', 'Action'].map((h) => <th key={h} className="text-left text-[10px] font-semibold uppercase tracking-wide py-2.5 px-3 whitespace-nowrap" style={{ color: '#6a6a6a' }}>{h}</th>)}</tr></thead>
            <tbody>
              {applied.map((h, i) => { const s = coaSetupForHotel(store, h.id); return (
                <tr key={h.id} style={{ borderBottom: i < applied.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                  <td className="py-2.5 px-3 font-medium" style={{ color: '#222' }}>{h.hotelName}</td>
                  <td className="py-2.5 px-3 text-xs font-mono" style={{ color: '#6a6a6a' }}>{h.propertyCode}</td>
                  <td className="py-2.5 px-3 text-xs" style={{ color: '#6a6a6a' }}>{fmtDate(h.openingDate)}</td>
                  <td className="py-2.5 px-3 text-xs" style={{ color: '#3f3f3f' }}>{s.totalAccounts}</td>
                  <td className="py-2.5 px-3 text-xs" style={{ color: '#6a4ec0' }}>{s.customAccounts}</td>
                  <td className="py-2.5 px-3"><Badge label={s.status} fg={s.status === 'Complete' ? '#15803d' : '#b45309'} bg={s.status === 'Complete' ? '#dcfce7' : '#fef3c7'} /></td>
                  <td className="py-2.5 px-3"><button onClick={() => { selectHotel(h.id); router.push('/web/accounting/chart-of-accounts/accounts'); }} className="text-xs font-semibold" style={{ color: '#6a4ec0' }}>View Hotel COA</button></td>
                </tr>
              ); })}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'Version History' && (
        <div className="rounded-2xl overflow-hidden" style={card}>
          {[
            { v: 'v1.4', date: '2026-04-18', note: 'Added Tourism Tax Payable (2230) and Loyalty Program Fees (6440).' },
            { v: 'v1.3', date: '2026-02-02', note: 'Split Utilities into Electricity, Gas, Water/Sewer, Trash.' },
            { v: 'v1.2', date: '2025-11-10', note: 'Added Related Party Liabilities group (2500–2530).' },
            { v: 'v1.1', date: '2025-08-21', note: 'Added Extended Stay Revenue (4040).' },
            { v: 'v1.0', date: '2025-06-01', note: 'Initial Hotel Standard Chart of Accounts published.' },
          ].map((r, i, arr) => (
            <div key={r.v} className="flex items-start gap-3 px-5 py-3" style={{ borderBottom: i < arr.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
              <Badge label={r.v} fg="#6a4ec0" bg="#ece4fb" />
              <div className="flex-1"><p className="text-sm" style={{ color: '#222' }}>{r.note}</p><p className="text-[11px]" style={{ color: '#b0b0b0' }}>{fmtDate(r.date)} · Sanjay Narsee</p></div>
            </div>
          ))}
        </div>
      )}

      {tab === 'Settings' && (
        <div className="rounded-2xl p-5 grid grid-cols-1 md:grid-cols-2 gap-4" style={card}>
          <Setting label="Template Name" value={tp.name} />
          <Setting label="Description" value="Default account structure for HOS hotel entities." />
          <Setting label="Hotel Type" value={tp.hotelType} />
          <Setting label="Default Currency" value="USD" />
          <Setting label="Allow Hotel Overrides" value="On" />
          <Setting label="Required Accounts" value={`${COA_TEMPLATE.filter((a) => a.required).length} accounts`} />
        </div>
      )}

      {applyOpen && <ApplyTemplateModal onClose={() => setApplyOpen(false)} />}
    </div>
  );
}

function Setting({ label, value }: { label: string; value: string }) { return <div><p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: '#929292' }}>{label}</p><p className="text-sm mt-0.5" style={{ color: '#222' }}>{value}</p></div>; }

export default function TemplateDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <Suspense fallback={null}><Inner id={id} /></Suspense>;
}
