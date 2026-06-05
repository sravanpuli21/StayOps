'use client';

import { useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { ACCT_COMPANY, TOTAL_ROOMS } from '@hos/shared/accounting-os';
import { resetAccountingOs } from '../_store';
import { card, Badge } from '../_ui';

const SECTIONS = ['Company', 'Accounting', 'Entity', 'Import', 'Notifications', 'Security'] as const;

export default function SettingsPage() {
  const [section, setSection] = useState<typeof SECTIONS[number]>('Company');

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-5">
      <div><h1 className="text-xl font-bold" style={{ color: '#222' }}>Settings</h1><p className="text-sm mt-0.5" style={{ color: '#929292' }}>Company, accounting, import, notification, and security settings.</p></div>

      <div className="flex gap-1 overflow-x-auto" style={{ borderBottom: '1px solid #dddddd' }}>
        {SECTIONS.map((s) => <button key={s} onClick={() => setSection(s)} className="px-3.5 py-2.5 text-sm font-semibold whitespace-nowrap" style={{ color: section === s ? '#6a4ec0' : '#6a6a6a', borderBottom: section === s ? '2px solid #6a4ec0' : '2px solid transparent' }}>{s}</button>)}
      </div>

      {section === 'Company' && (
        <div className="grid md:grid-cols-2 gap-4">
          <Row label="Company Name" value={ACCT_COMPANY.name} />
          <Row label="Entities" value="16 hotel entities" />
          <Row label="Total Rooms" value={String(TOTAL_ROOMS)} />
          <Row label="Default Currency" value={ACCT_COMPANY.currency} />
          <Row label="Fiscal Year Start" value={ACCT_COMPANY.fiscalYearStart} />
          <Row label="Time Zone" value={ACCT_COMPANY.timeZone} />
          <div className="md:col-span-2 flex gap-2">
            <button className="h-9 px-3 rounded-xl text-xs font-semibold" style={{ background: '#fff', border: '1px solid #dddddd', color: '#6a6a6a' }}>Edit Company</button>
            <button className="h-9 px-3 rounded-xl text-xs font-semibold" style={{ background: '#fff', border: '1px solid #dddddd', color: '#6a6a6a' }}>Manage Subscription</button>
            <button disabled className="h-9 px-3 rounded-xl text-xs font-semibold" style={{ background: '#f7f7f7', color: '#c1c1c1', cursor: 'not-allowed' }}>Switch Company · Soon</button>
          </div>
        </div>
      )}

      {section === 'Accounting' && (
        <div className="grid md:grid-cols-2 gap-4">
          <Row label="Default Accounting Method" value="Accrual" />
          <Row label="Default COA Template" value="Hotel Standard COA" />
          <Toggle label="Require balanced journal entries" on note="Always on" locked />
          <Toggle label="Lock closed months" on />
        </div>
      )}

      {section === 'Entity' && (
        <div className="rounded-2xl p-6 text-sm" style={card}>
          <p style={{ color: '#3f3f3f' }}>Each hotel is its own accounting entity with its own legal name, EIN, bank accounts, books, and month close. Manage individual entities under <b>Hotel Entities</b>.</p>
        </div>
      )}

      {section === 'Import' && (
        <div className="grid md:grid-cols-2 gap-4">
          <Toggle label="Allow CSV upload" on />
          <Row label="Bank feed connections" value="Coming Soon" muted />
          <Toggle label="Auto-map known columns" on />
          <Toggle label="Duplicate detection" on />
          <Toggle label="Require review before posting" on />
        </div>
      )}

      {section === 'Notifications' && (
        <div className="grid md:grid-cols-2 gap-4">
          {['Missing receipts', 'Reconciliation differences', 'Month close blockers', 'Large expenses', 'Upload reminders'].map((n) => <Toggle key={n} label={n} on />)}
        </div>
      )}

      {section === 'Security' && (
        <div className="flex flex-col gap-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Toggle label="Two-factor authentication" on={false} />
            <Toggle label="Auto-lock after 15 min idle" on />
          </div>
          <div className="p-4 flex items-center justify-between" style={{ ...card, borderColor: '#fca5a5' }}>
            <div><p className="text-sm font-semibold" style={{ color: '#b91c1c' }}>Reset demo data</p><p className="text-xs" style={{ color: '#929292' }}>Clear everything you&rsquo;ve done this session (uploads, categorizations, closes) back to the seed.</p></div>
            <button onClick={() => { resetAccountingOs(); alert('Demo data reset.'); }} className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl text-xs font-semibold" style={{ background: '#fee2e2', color: '#b91c1c' }}><RotateCcw className="w-3.5 h-3.5" /> Reset</button>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return <div className="p-4" style={card}><p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: '#929292' }}>{label}</p><p className="text-sm font-medium mt-1" style={{ color: muted ? '#929292' : '#222' }}>{value}</p></div>;
}
function Toggle({ label, on, note, locked }: { label: string; on: boolean; note?: string; locked?: boolean }) {
  const [v, setV] = useState(on);
  return (
    <div className="p-4 flex items-center justify-between" style={card}>
      <div><p className="text-sm font-medium" style={{ color: '#222' }}>{label}</p>{note && <p className="text-[11px]" style={{ color: '#929292' }}>{note}</p>}</div>
      <button onClick={() => !locked && setV((x) => !x)} className="w-11 h-6 rounded-full relative transition-colors" style={{ background: v ? '#6a4ec0' : '#dddddd', cursor: locked ? 'not-allowed' : 'pointer' }}>
        <span className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all" style={{ left: v ? 22 : 2 }} />
      </button>
    </div>
  );
}
