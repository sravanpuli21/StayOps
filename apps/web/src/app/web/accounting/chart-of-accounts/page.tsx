'use client';

import { useState } from 'react';
import { ListTree, Search } from 'lucide-react';
import { COA_TEMPLATE, COA_TYPE_LABEL, type CoaFullType } from '@hos/shared/accounting-os';
import { useAcctOs } from '../_context';
import { hotelLabel } from '../_domain';
import { card, Badge, PageHeader, inputStyle, PURPLE } from '../_ui';

const TYPE_COLORS: Record<string, { fg: string; bg: string }> = {
  Asset: { fg: '#1d4ed8', bg: '#dbeafe' }, Liability: { fg: '#b45309', bg: '#fef3c7' },
  Equity: { fg: '#6a4ec0', bg: '#ece4fb' }, Revenue: { fg: '#15803d', bg: '#dcfce7' },
  COGS: { fg: '#0e7490', bg: '#cffafe' }, Expense: { fg: '#b91c1c', bg: '#fee2e2' },
  'Other Income': { fg: '#15803d', bg: '#dcfce7' }, 'Other Expense': { fg: '#6a6a6a', bg: '#f0f0f0' },
};

export default function ChartOfAccountsPage() {
  const { selection } = useAcctOs();
  const hotelId = selection.kind === 'hotel' ? selection.hotelId : undefined;
  const [q, setQ] = useState('');
  const [type, setType] = useState<CoaFullType | ''>('');

  const accounts = COA_TEMPLATE.filter((a) => {
    if (type && a.type !== type) return false;
    if (q && !a.name.toLowerCase().includes(q.toLowerCase()) && !a.code.includes(q)) return false;
    return true;
  });
  const sections = [...new Set(accounts.map((a) => a.reportSection))];

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-5">
      <PageHeader
        scope={hotelId ? hotelLabel(hotelId).name : 'All Hotels'} scopeFg={hotelId ? '#1d4ed8' : PURPLE} scopeBg={hotelId ? '#dbeafe' : '#ece4fb'}
        title="Chart of Accounts" subtitle={hotelId ? 'This hotel’s chart of accounts. Workbench category pickers show only these accounts.' : 'Standard hotel chart of accounts — applied per entity. Select one hotel to manage its accounts.'} />
      <div className="flex flex-wrap gap-2">
        <div className="flex items-center gap-2 h-9 px-2.5 rounded-lg flex-1 max-w-xs" style={inputStyle}>
          <Search className="w-3.5 h-3.5" style={{ color: '#929292' }} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search code or name…" className="flex-1 bg-transparent text-sm outline-none" style={{ color: '#222' }} />
        </div>
        <select value={type} onChange={(e) => setType(e.target.value as CoaFullType | '')} className="h-9 px-2.5 rounded-lg text-xs" style={inputStyle}>
          <option value="">All Types</option>
          {Object.entries(COA_TYPE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <span className="ml-auto text-xs self-center" style={{ color: '#929292' }}>{accounts.filter((a) => !a.isHeader).length} accounts</span>
      </div>
      <div className="flex flex-col gap-4">
        {sections.map((section) => (
          <div key={section} className="rounded-2xl overflow-hidden" style={card}>
            <div className="px-4 py-2" style={{ background: '#fafafa', borderBottom: '1px solid #f0f0f0' }}><p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>{section}</p></div>
            {accounts.filter((a) => a.reportSection === section).map((a) => {
              const c = TYPE_COLORS[a.type];
              return (
                <div key={a.code} className="flex items-center gap-3 px-4 py-2" style={{ borderBottom: '1px solid #f7f7f7', paddingLeft: a.parent ? 32 : 16 }}>
                  <span className="text-xs font-mono w-12" style={{ color: '#929292' }}>{a.code}</span>
                  <span className="text-sm flex-1" style={{ color: '#222', fontWeight: a.isHeader ? 700 : 400 }}>{a.name}</span>
                  {a.systemLocked && <Badge label="System" fg="#6a6a6a" bg="#f0f0f0" />}
                  <Badge label={COA_TYPE_LABEL[a.type]} fg={c.fg} bg={c.bg} />
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
