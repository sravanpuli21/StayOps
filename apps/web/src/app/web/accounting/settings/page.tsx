'use client';

import { useState } from 'react';
import { Settings as SettingsIcon, RotateCcw, AlertTriangle } from 'lucide-react';
import { ACCT_COMPANY } from '@hos/shared/accounting-os';
import { useStore2, resetAccounting2 } from '../_store2';
import { card, PageHeader, PURPLE } from '../_ui';

export default function SettingsPage() {
  const store = useStore2();
  const [confirm, setConfirm] = useState(false);

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-5">
      <PageHeader scope="Settings" title="Settings" subtitle="Company, accounting defaults, and demo controls." />

      <Section title="Company">
        <Row k="Management Company" v={ACCT_COMPANY.name} />
        <Row k="Address" v={ACCT_COMPANY.address} />
        <Row k="Currency" v={ACCT_COMPANY.currency} />
        <Row k="Fiscal Year Start" v={ACCT_COMPANY.fiscalYearStart} />
        <Row k="Time Zone" v={ACCT_COMPANY.timeZone} />
      </Section>

      <Section title="Statement-to-Books Defaults">
        <Row k="Receipt required over" v="$250" />
        <Row k="Rules auto-post" v="Off (suggest only)" />
        <Row k="Block posting when receipt missing" v="On" />
        <Row k="Closed months editable" v="No (reopen required)" />
      </Section>

      <Section title="Your Work This Session">
        <Row k="Statements uploaded" v={String(store.addedImports.length)} />
        <Row k="Lines coded" v={String(Object.keys(store.coding).length)} />
        <Row k="Journal entries posted" v={String(store.journals.length)} />
        <Row k="Months closed" v={String(store.closed.length)} />
        <Row k="Activity log entries" v={String(store.activity.length)} />
      </Section>

      <div className="rounded-2xl p-4 flex items-center justify-between gap-3" style={{ ...card, borderColor: '#fecaca' }}>
        <div className="flex items-start gap-2"><AlertTriangle className="w-4 h-4 mt-0.5" style={{ color: '#b91c1c' }} /><div><p className="text-sm font-semibold" style={{ color: '#222' }}>Reset demo data</p><p className="text-xs" style={{ color: '#929292' }}>Clears all uploads, coding, posts, and closes back to the seed.</p></div></div>
        {confirm ? (
          <div className="flex gap-2">
            <button onClick={() => { resetAccounting2(); setConfirm(false); }} className="h-9 px-3 rounded-xl text-xs font-semibold" style={{ background: '#b91c1c', color: '#fff' }}>Confirm Reset</button>
            <button onClick={() => setConfirm(false)} className="h-9 px-3 rounded-xl text-xs font-semibold" style={{ background: '#f7f7f7', border: '1px solid #ddd', color: '#6a6a6a' }}>Cancel</button>
          </div>
        ) : (
          <button onClick={() => setConfirm(true)} className="h-9 px-3 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5" style={{ background: '#fff', border: '1px solid #fecaca', color: '#b91c1c' }}><RotateCcw className="w-3.5 h-3.5" /> Reset</button>
        )}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="rounded-2xl overflow-hidden" style={card}><div className="px-4 py-2.5" style={{ background: '#fafafa', borderBottom: '1px solid #f0f0f0' }}><p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>{title}</p></div>{children}</div>;
}
function Row({ k, v }: { k: string; v: string }) {
  return <div className="flex items-center justify-between px-4 py-2.5" style={{ borderBottom: '1px solid #f7f7f7' }}><span className="text-sm" style={{ color: '#6a6a6a' }}>{k}</span><span className="text-sm font-medium" style={{ color: '#222' }}>{v}</span></div>;
}
