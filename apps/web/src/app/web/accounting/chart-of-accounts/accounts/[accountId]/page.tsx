'use client';

import { use, useMemo, useState, Suspense } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, FileText } from 'lucide-react';
import { useAcctOs } from '../../../_context';
import { useStore2 } from '../../../_store2';
import { getEntity, COA_TYPE_LABEL } from '@hos/shared/accounting-os';
import { postedJournalLines } from '../../../reports/_reports';
import { hotelLabel } from '../../../_domain';
import { card, money, fmtDate, Badge, EmptyState, PURPLE } from '../../../_ui';
import { oneAccount, TYPE_COLORS } from '../../_data';

const TABS = ['Overview', 'Register', 'Transactions', 'Journal Entries', 'Used By', 'Settings', 'Activity Log'];

function Inner({ accountId }: { accountId: string }) {
  const { selection } = useAcctOs();
  const store = useStore2();
  const hotelId = selection.kind === 'hotel' ? selection.hotelId : 'GA989';
  const acct = useMemo(() => oneAccount(store, hotelId, accountId), [store, hotelId, accountId]);
  const [tab, setTab] = useState('Overview');

  const register = useMemo(() => acct ? postedJournalLines(store, hotelId).filter((l) => l.account === acct.name) : [], [store, hotelId, acct]);

  if (!acct) return <div className="max-w-3xl mx-auto flex flex-col gap-4"><Back /><EmptyState title="Account not found." body="This account is not part of the selected hotel's Chart of Accounts." /></div>;

  const h = getEntity(hotelId)!;
  const tc = TYPE_COLORS[acct.type];
  const normalBalance = ['Asset', 'Expense', 'COGS', 'Other Expense'].includes(acct.type) ? 'Debit' : 'Credit';

  return (
    <div className="max-w-[1200px] mx-auto flex flex-col gap-5">
      <Back />
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold" style={{ color: '#222' }}><span className="font-mono mr-2" style={{ color: '#929292' }}>{acct.code}</span>{acct.name}</h1>
          <p className="text-sm" style={{ color: '#929292' }}>{h.hotelName} · {COA_TYPE_LABEL[acct.type]} · {acct.reportSection}</p>
          <div className="flex items-center gap-1.5 mt-1.5">
            {acct.systemLocked ? <Badge label="System Locked" fg="#6a6a6a" bg="#f0f0f0" /> : <Badge label="Active" fg="#15803d" bg="#dcfce7" />}
            <Badge label={COA_TYPE_LABEL[acct.type]} fg={tc.fg} bg={tc.bg} />
            {acct.usedIn.includes('Report') && <Badge label="Used in Reports" fg="#1d4ed8" bg="#dbeafe" />}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <Card label="Current Balance" value={money(acct.balance)} />
        <Card label="Transactions" value={String(acct.txCount)} />
        <Card label="Journal Entries" value={String(acct.txCount)} />
        <Card label="Normal Balance" value={normalBalance} />
        <Card label="Type" value={COA_TYPE_LABEL[acct.type]} />
        <Card label="Report Section" value={acct.reportSection} />
      </div>

      <div className="flex gap-1 overflow-x-auto" style={{ borderBottom: '1px solid #dddddd' }}>
        {TABS.map((t) => <button key={t} onClick={() => setTab(t)} className="px-3 py-2 text-xs font-semibold whitespace-nowrap" style={{ color: tab === t ? PURPLE : '#6a6a6a', borderBottom: tab === t ? `2px solid ${PURPLE}` : '2px solid transparent' }}>{t}</button>)}
      </div>

      {tab === 'Overview' && (
        <div className="grid lg:grid-cols-2 gap-5">
          <Section title="Account Information">
            <Info k="Account Code" v={acct.code} /><Info k="Account Name" v={acct.name} />
            <Info k="Account Type" v={COA_TYPE_LABEL[acct.type]} /><Info k="Detail Type" v={acct.detailType} />
            <Info k="Normal Balance" v={normalBalance} /><Info k="Report Section" v={acct.reportSection} />
            <Info k="Hotel Entity" v={h.hotelName} /><Info k="Status" v={acct.systemLocked ? 'System Locked' : 'Active'} />
            <Info k="Posting Allowed" v={acct.isHeader ? 'No (parent)' : 'Yes'} /><Info k="Available in Workbench" v={!acct.isHeader ? 'Yes' : 'No'} />
          </Section>
          <Section title="Usage Summary">
            <Info k="Transactions" v={String(acct.txCount)} /><Info k="Journal Entries" v={String(acct.txCount)} />
            <Info k="Used In" v={acct.usedIn.join(', ') || 'No usage'} />
            <Info k="Report" v={`${COA_TYPE_LABEL[acct.type]} → ${acct.reportSection}`} />
          </Section>
        </div>
      )}

      {(tab === 'Register' || tab === 'Transactions' || tab === 'Journal Entries') && (
        register.length === 0 ? <EmptyState title="No activity for this account yet." body="Posted transactions and journal entries using this account will appear here." /> : (
          <div className="overflow-x-auto rounded-2xl" style={card}>
            <table className="w-full text-sm border-collapse">
              <thead><tr style={{ background: '#f7f7f7', borderBottom: '1px solid #dddddd' }}>{['Date', 'Description', 'Debit', 'Credit', 'Source'].map((hd) => <th key={hd} className="text-[10px] font-semibold uppercase tracking-wide py-2.5 px-3 whitespace-nowrap" style={{ color: '#6a6a6a', textAlign: ['Debit', 'Credit'].includes(hd) ? 'right' : 'left' }}>{hd}</th>)}</tr></thead>
              <tbody>
                {register.map((l, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td className="py-2 px-3 text-xs" style={{ color: '#6a6a6a' }}>{fmtDate(l.dateIso)}</td>
                    <td className="py-2 px-3 text-sm" style={{ color: '#222' }}>{l.description}</td>
                    <td className="py-2 px-3 text-xs text-right" style={{ color: l.debit ? '#222' : '#ddd' }}>{l.debit ? money(l.debit) : '—'}</td>
                    <td className="py-2 px-3 text-xs text-right" style={{ color: l.credit ? '#222' : '#ddd' }}>{l.credit ? money(l.credit) : '—'}</td>
                    <td className="py-2 px-3"><Link href={`/web/accounting/reconciliation-workbench/${l.sessionId}`} className="text-xs font-semibold" style={{ color: PURPLE }}>Source line</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {tab === 'Used By' && (
        <div className="flex flex-col gap-2">
          {acct.usedIn.length === 0 ? <EmptyState title="Not used anywhere yet." /> : acct.usedIn.map((u) => (
            <div key={u} className="rounded-xl p-3.5 flex items-center gap-3" style={card}><CheckCircle2 className="w-4 h-4" style={{ color: '#15803d' }} /><span className="text-sm" style={{ color: '#222' }}>{u}</span></div>
          ))}
        </div>
      )}

      {tab === 'Settings' && (
        <div className="rounded-2xl overflow-hidden max-w-2xl" style={card}>
          {[['Account Name', acct.name], ['Account Code', acct.code], ['Available in Workbench', acct.isHeader ? 'No' : 'Yes'], ['Allow direct posting', acct.isHeader ? 'No' : 'Yes'], ['Require department', acct.type === 'Expense' || acct.type === 'Revenue' ? 'Yes' : 'No'], ['Report section', acct.reportSection], ['Status', acct.systemLocked ? 'System Locked' : 'Active']].map(([k, v], i, arr) => (
            <div key={k} className="flex items-center justify-between px-4 py-2.5" style={{ borderBottom: i < arr.length - 1 ? '1px solid #f7f7f7' : 'none' }}><span className="text-sm" style={{ color: '#6a6a6a' }}>{k}</span><span className="text-sm font-medium" style={{ color: '#222' }}>{v}</span></div>
          ))}
          {acct.systemLocked && <div className="px-4 py-2.5 text-[11px]" style={{ background: '#f7f7f7', color: '#b45309' }}>This is a system account used by StayOps accounting workflows. Some fields cannot be changed.</div>}
        </div>
      )}

      {tab === 'Activity Log' && <EmptyState icon={<FileText className="w-8 h-8" />} title="Account activity" body="Account edits, report-mapping changes, and usage events appear here." />}
    </div>
  );
}

function Back() { return <Link href="/web/accounting/chart-of-accounts" className="inline-flex items-center gap-1 text-sm self-start" style={{ color: '#6a6a6a' }}><ArrowLeft className="w-4 h-4" /> Chart of Accounts</Link>; }
function Card({ label, value }: { label: string; value: string }) { return <div className="p-3.5" style={card}><p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: '#929292' }}>{label}</p><p className="text-base font-bold mt-0.5" style={{ color: '#222' }}>{value}</p></div>; }
function Section({ title, children }: { title: string; children: React.ReactNode }) { return <section className="flex flex-col gap-2"><h2 className="text-sm font-bold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>{title}</h2><div className="rounded-2xl p-4 grid grid-cols-2 gap-x-4 gap-y-2" style={card}>{children}</div></section>; }
function Info({ k, v }: { k: string; v: string }) { return <div><p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: '#929292' }}>{k}</p><p className="text-sm" style={{ color: '#222' }}>{v}</p></div>; }

export default function AccountDetailPage({ params }: { params: Promise<{ accountId: string }> }) {
  const { accountId } = use(params);
  return <Suspense fallback={null}><Inner accountId={decodeURIComponent(accountId)} /></Suspense>;
}
