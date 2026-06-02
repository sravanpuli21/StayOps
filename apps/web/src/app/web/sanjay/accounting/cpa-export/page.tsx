'use client';

import { useState } from 'react';
import { Download, FileText, FileSpreadsheet, BookOpen, FileCheck2 } from 'lucide-react';
import { useAccountingData } from '@/lib/use-accounting-data';
import { DemoDataToggle } from '@/components/accounting/DemoDataToggle';
import { ENTITIES } from '@hos/shared';

const EXPORTS = [
  { id: 'gl',      label: 'General Ledger',          desc: 'Every journal line · debit/credit/account/date',   icon: BookOpen,         format: 'CSV' },
  { id: 'tb',      label: 'Trial Balance',           desc: 'All accounts with debit/credit balance summary',    icon: FileSpreadsheet,  format: 'Excel' },
  { id: 'pnl',     label: 'Profit & Loss',           desc: 'USALI departmental P&L for the period',             icon: FileText,         format: 'PDF' },
  { id: 'cf',      label: 'Cash Flow Statement',     desc: 'Operating · financing · non-operating',             icon: FileText,         format: 'PDF' },
  { id: 'bs',      label: 'Balance Sheet',           desc: 'Assets · liabilities · equity at period end',       icon: FileText,         format: 'PDF' },
  { id: 'tx',      label: 'Transaction Detail',      desc: 'Every reconciled transaction with vendor + memo',   icon: FileSpreadsheet,  format: 'CSV' },
  { id: 'splits',  label: 'Split Detail',            desc: 'Parent + child legs for every split transaction',   icon: FileSpreadsheet,  format: 'CSV' },
  { id: 'attach',  label: 'Receipt & Invoice Index', desc: 'Manifest of all attached docs with hashes',         icon: FileCheck2,       format: 'PDF' },
  { id: 'audit',   label: 'Audit Trail',             desc: 'Every edit · who · when · old → new value',         icon: FileCheck2,       format: 'CSV' },
  { id: 'pkg',     label: 'Full CPA Package (zip)',  desc: 'All of the above bundled into a dated archive',     icon: Download,         format: 'ZIP' },
];

export default function CpaExportPage() {
  const data = useAccountingData();
  const [entityId, setEntityId] = useState<string>('all');
  const [working, setWorking] = useState<string | null>(null);

  const handle = (id: string, label: string) => {
    setWorking(id);
    setTimeout(() => {
      setWorking(null);
      alert(`Demo only — would generate ${label} for ${entityId === 'all' ? 'all entities' : ENTITIES.find((e) => e.id === entityId)?.name} · ${data.period.from} → ${data.period.to}`);
    }, 700);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold" style={{ color: '#222222' }}>CPA Export</h1>
          <p className="text-sm mt-0.5" style={{ color: '#929292' }}>
            Bundle a CPA-ready package · {data.period.from} → {data.period.to}
          </p>
        </div>
        <DemoDataToggle />
      </div>

      <div className="rounded-2xl p-5 flex flex-wrap items-end gap-4" style={{ border: '1px solid #dddddd', background: '#ffffff' }}>
        <Field label="Entity">
          <select value={entityId} onChange={(e) => setEntityId(e.target.value)} className="text-sm px-3 py-2 rounded-lg" style={{ border: '1px solid #dddddd', minWidth: 280 }}>
            <option value="all">All entities · consolidated</option>
            {ENTITIES.map((e) => <option key={e.id} value={e.id}>{e.name} · {e.ein}</option>)}
          </select>
        </Field>
        <Field label="Period">
          <p className="text-sm font-medium" style={{ color: '#222222' }}>{data.period.from} → {data.period.to}</p>
          <p className="text-xs" style={{ color: '#929292' }}>Use the global date filter to change.</p>
        </Field>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {EXPORTS.map((x) => {
          const Icon = x.icon;
          const isPkg = x.id === 'pkg';
          return (
            <div
              key={x.id}
              className="rounded-2xl p-4 flex items-start gap-3"
              style={{
                border: isPkg ? '1px solid #ff385c' : '1px solid #dddddd',
                background: isPkg ? '#fff5f7' : '#ffffff',
              }}
            >
              <div className="rounded-lg p-2 flex-shrink-0" style={{ background: isPkg ? '#ff385c' : '#f0f0f0' }}>
                <Icon className="w-5 h-5" style={{ color: isPkg ? '#ffffff' : '#3f3f3f' }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold" style={{ color: '#222222' }}>{x.label}</p>
                  <span className="text-[10px] font-bold tracking-wide px-1.5 py-0.5 rounded" style={{ background: '#f0f0f0', color: '#6a6a6a' }}>{x.format}</span>
                </div>
                <p className="text-xs mt-0.5" style={{ color: '#6a6a6a' }}>{x.desc}</p>
              </div>
              <button
                onClick={() => handle(x.id, x.label)}
                disabled={working === x.id}
                className="text-xs font-semibold px-3 py-1.5 rounded-full whitespace-nowrap"
                style={{
                  background: isPkg ? '#ff385c' : working === x.id ? '#f0f0f0' : '#222222',
                  color: '#ffffff',
                }}
              >
                {working === x.id ? 'Preparing…' : 'Generate'}
              </button>
            </div>
          );
        })}
      </div>

      <p className="text-xs" style={{ color: '#929292' }}>
        Each export carries date range, entity, chart of accounts, transaction detail, splits, reconciliation status, attachment list, notes, and audit trail (per spec §25).
      </p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] font-bold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>{label}</label>
      {children}
    </div>
  );
}
