'use client';

import { use, useState, Suspense, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft, Pencil, BookOpen, Plus, Power, MoreHorizontal, Lock,
} from 'lucide-react';
import { getEntity, txForHotel } from '@hos/shared/accounting-os';
import { useAcctOs } from '../../../_context';
import { useAcctState, setAccountStatus } from '../../../_store';
import { oneAccount, accountsForHotel } from '../../../_coa';
import { card, Badge, money, fmtDate } from '../../../_ui';
import { TypeBadge, StatusBadge } from '../../_shared';
import { AccountForm } from '../../_AccountForm';

const TABS = ['Overview', 'Register', 'Transactions', 'Journal Entries', 'Used By', 'Activity Log'] as const;
type Tab = typeof TABS[number];

function Inner({ code }: { code: string }) {
  const router = useRouter();
  const params = useSearchParams();
  const { selection } = useAcctOs();
  const store = useAcctState();
  const hotelId = selection.kind === 'hotel' ? selection.hotelId : '';
  const a = hotelId ? oneAccount(store, hotelId, code) : undefined;
  const [tab, setTab] = useState<Tab>((params.get('tab') as Tab) || 'Overview');
  const [editOpen, setEditOpen] = useState(false);

  if (!hotelId) return <Wrap><Empty text="Select a hotel from the top bar to view this account." /></Wrap>;
  if (!a) return <Wrap><Empty text={`Account ${code} not found for this hotel.`} /></Wrap>;
  const h = getEntity(hotelId);

  // Transactions whose category = this account's name (seed links by name).
  const txs = txForHotel(hotelId).filter((t) => t.category === a.name);
  const children = accountsForHotel(store, hotelId).filter((x) => x.parent === a.code);

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-5">
      <Link href="/web/accounting/chart-of-accounts/accounts" className="inline-flex items-center gap-1 text-sm" style={{ color: '#6a6a6a' }}><ArrowLeft className="w-4 h-4" /> Accounts</Link>

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 flex-wrap"><h1 className="text-xl font-bold" style={{ color: '#222' }}>{a.code} {a.name}</h1><TypeBadge type={a.type} /><StatusBadge status={a.status} />{a.custom && <Badge label="Custom" fg="#6a4ec0" bg="#ece4fb" />}</div>
          <p className="text-sm" style={{ color: '#929292' }}>{h?.hotelName} · {a.detailType} · {a.reportSection}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setEditOpen(true)} className="h-9 px-3 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5" style={{ background: '#fff', border: '1px solid #dddddd', color: '#6a6a6a' }}><Pencil className="w-3.5 h-3.5" /> Edit Account</button>
          <Link href={`/web/accounting/chart-of-accounts/accounts/${a.code}/register`} className="h-9 px-3 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5" style={{ background: '#fff', border: '1px solid #dddddd', color: '#6a6a6a' }}><BookOpen className="w-3.5 h-3.5" /> View Register</Link>
          <Link href={`/web/accounting/chart-of-accounts/accounts/new?parent=${a.code}`} className="h-9 px-3 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5" style={{ background: '#fff', border: '1px solid #dddddd', color: '#6a6a6a' }}><Plus className="w-3.5 h-3.5" /> Add Sub-Account</Link>
          {!a.systemLocked && (
            <button onClick={() => setAccountStatus(hotelId, a.code, a.status === 'inactive')} className="h-9 px-3 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5" style={{ background: a.status === 'inactive' ? '#6a4ec0' : '#fff', border: '1px solid #dddddd', color: a.status === 'inactive' ? '#fff' : '#6a6a6a' }}><Power className="w-3.5 h-3.5" /> {a.status === 'inactive' ? 'Make Active' : 'Make Inactive'}</button>
          )}
        </div>
      </div>

      {a.systemLocked && <div className="px-4 py-2.5 rounded-xl text-sm flex items-center gap-2" style={{ background: '#ece4fb', color: '#6a4ec0' }}><Lock className="w-4 h-4" /> This is a system account used by StayOps accounting workflows. Some fields cannot be changed and it cannot be deleted.</div>}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <SC label="Current Balance" value={money(a.balance)} />
        <SC label="Transactions This Month" value={String(a.txCount)} />
        <SC label="Posted Journal Entries" value={String(a.jeCount)} />
        <SC label="Used By Vendors" value={a.usedBy.includes('Vendor Default') ? '1+' : '0'} />
        <SC label="Used By Rules" value={a.usedBy.includes('Transaction') ? '1+' : '0'} />
        <SC label="Status" value={a.status === 'system-locked' ? 'System' : a.status === 'inactive' ? 'Inactive' : 'Active'} accent={a.status === 'inactive' ? '#6a6a6a' : '#15803d'} />
      </div>

      <div className="flex gap-1 overflow-x-auto" style={{ borderBottom: '1px solid #dddddd' }}>
        {TABS.map((t) => <button key={t} onClick={() => setTab(t)} className="px-3.5 py-2.5 text-sm font-semibold whitespace-nowrap" style={{ color: tab === t ? '#6a4ec0' : '#6a6a6a', borderBottom: tab === t ? '2px solid #6a4ec0' : '2px solid transparent' }}>{t}</button>)}
      </div>

      {tab === 'Overview' && (
        <div className="flex flex-col gap-5">
          <Sect title="Account Information"><Info label="Account Code" value={a.code} /><Info label="Account Name" value={a.name} /><Info label="Account Type" value={a.type} /><Info label="Detail Type" value={a.detailType} /><Info label="Parent Account" value={a.parent ?? 'None'} /><Info label="Report Section" value={a.reportSection} /><Info label="Hotel Entity" value={h?.hotelName ?? '—'} /><Info label="System Account" value={a.systemLocked ? 'Yes' : 'No'} /></Sect>
          <Sect title="Balance Summary"><Info label="Opening Balance" value={a.openingBalance != null ? money(a.openingBalance) : '—'} /><Info label="Current Balance" value={money(a.balance)} /><Info label="Month to Date Activity" value={money(a.balance)} /><Info label="Year to Date Activity" value={money(a.balance * 4)} /></Sect>
          <Sect title="Usage Summary">
            <Info label="Transactions" value={String(a.txCount)} /><Info label="Journal Entries" value={String(a.jeCount)} /><Info label="Vendor Defaults" value={a.usedBy.includes('Vendor Default') ? 'Yes' : 'No'} /><Info label="Reports" value={a.usedBy.includes('Report') ? a.reportSection : 'Not on reports'} /><Info label="Bank / Card Mapping" value={a.usedBy.includes('Bank Account') ? 'Bank account' : a.usedBy.includes('Credit Card') ? 'Credit card' : 'None'} /><Info label="Sub-Accounts" value={String(children.length)} />
          </Sect>
          <div className="flex gap-2 flex-wrap">
            <Link href={`/web/accounting/chart-of-accounts/accounts/${a.code}/register`} className="h-9 px-4 rounded-xl text-xs font-semibold inline-flex items-center" style={{ background: '#f7f7f7', border: '1px solid #dddddd', color: '#6a6a6a' }}>View Register</Link>
            <button onClick={() => setTab('Transactions')} className="h-9 px-4 rounded-xl text-xs font-semibold" style={{ background: '#f7f7f7', border: '1px solid #dddddd', color: '#6a6a6a' }}>View Transactions</button>
            <button onClick={() => setTab('Journal Entries')} className="h-9 px-4 rounded-xl text-xs font-semibold" style={{ background: '#f7f7f7', border: '1px solid #dddddd', color: '#6a6a6a' }}>View Journal Entries</button>
            <button onClick={() => setEditOpen(true)} className="h-9 px-4 rounded-xl text-xs font-semibold" style={{ background: '#6a4ec0', color: '#fff' }}>Edit Account</button>
          </div>
        </div>
      )}

      {tab === 'Register' && <Register a={a} txs={txs} />}

      {tab === 'Transactions' && (
        <TableWrap empty={txs.length === 0} emptyText="No transactions categorized to this account yet.">
          <THead cols={['Date', 'Source', 'Account/Card', 'Vendor', 'Description', 'Amount', 'Dept', 'Status']} right={[5]} />
          <tbody>{txs.map((t, i) => (
            <tr key={t.id} style={{ borderBottom: i < txs.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
              <td className={td} style={{ color: '#6a6a6a' }}>{fmtDate(t.dateIso)}</td><td className={td} style={{ color: '#6a6a6a' }}>{t.source === 'bank' ? 'Bank' : 'Card'}</td><td className={td} style={{ color: '#6a6a6a' }}>••{t.accountId.slice(-4)}</td><td className={td} style={{ color: '#222' }}>{t.vendor ?? '—'}</td><td className={td} style={{ color: '#3f3f3f' }}>{t.description}</td><td className={td + ' text-right font-semibold'} style={{ color: t.amount < 0 ? '#b91c1c' : '#15803d' }}>{money(Math.abs(t.amount))}</td><td className={td} style={{ color: '#6a6a6a' }}>{t.department ?? '—'}</td><td className={td} style={{ color: '#6a6a6a' }}>{t.status}</td>
            </tr>
          ))}</tbody>
        </TableWrap>
      )}

      {tab === 'Journal Entries' && (
        <TableWrap empty={txs.length === 0} emptyText="No journal entries use this account yet.">
          <THead cols={['Date', 'JE Number', 'Description', 'Debit', 'Credit', 'Created By', 'Source']} right={[3, 4]} />
          <tbody>{txs.map((t, i) => { const debit = t.amount < 0; return (
            <tr key={t.id} style={{ borderBottom: i < txs.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
              <td className={td} style={{ color: '#6a6a6a' }}>{fmtDate(t.dateIso)}</td><td className={td + ' font-mono'} style={{ color: '#6a4ec0' }}>JE-{1000 + i}</td><td className={td} style={{ color: '#3f3f3f' }}>{t.description}</td><td className={td + ' text-right'} style={{ color: '#222' }}>{debit ? money(Math.abs(t.amount)) : '—'}</td><td className={td + ' text-right'} style={{ color: '#222' }}>{!debit ? money(Math.abs(t.amount)) : '—'}</td><td className={td} style={{ color: '#6a6a6a' }}>Sanjay Narsee</td><td className={td} style={{ color: '#6a6a6a' }}>{t.source === 'bank' ? 'Bank' : 'Credit Card'}</td>
            </tr>
          ); })}</tbody>
        </TableWrap>
      )}

      {tab === 'Used By' && (
        <div className="flex flex-col gap-3">
          <UsedBySection title="Bank Account Mappings" items={a.usedBy.includes('Bank Account') ? [`Mapped to a bank account at ${h?.hotelName}`] : []} />
          <UsedBySection title="Credit Card Mappings" items={a.usedBy.includes('Credit Card') ? [`Mapped to a credit card at ${h?.hotelName}`] : []} />
          <UsedBySection title="Vendor Defaults" items={a.usedBy.includes('Vendor Default') ? [`Default category for vendors posting to ${a.name}`] : []} />
          <UsedBySection title="Transaction Rules" items={a.txCount > 0 ? [`Rule output: ${a.name}`] : []} />
          <UsedBySection title="Reports" items={a.usedBy.includes('Report') ? [`Profit & Loss / Balance Sheet under ${a.reportSection}`] : []} />
          <UsedBySection title="Opening Balances" items={a.openingBalance != null ? [`Opening balance ${money(a.openingBalance)}`] : []} />
        </div>
      )}

      {tab === 'Activity Log' && (
        <div className="rounded-2xl overflow-hidden" style={card}>
          {(() => { const acts = store.entityActivity.filter((x) => x.recordType === 'Account' && x.hotelId === hotelId && (x.detail?.includes(a.code) || x.detail?.includes(a.name))); return acts.length === 0
            ? <Empty text="No activity yet for this account. Edits and status changes will appear here." />
            : acts.slice(0, 20).map((x, i, arr) => (
              <div key={x.id} className="flex items-center gap-3 px-4 py-2.5" style={{ borderBottom: i < arr.length - 1 ? '1px solid #f0f0f0' : 'none' }}><span className="w-1.5 h-1.5 rounded-full" style={{ background: '#6a4ec0' }} /><span className="text-sm" style={{ color: '#222' }}>{x.action}</span>{x.detail && <span className="text-xs" style={{ color: '#929292' }}>· {x.detail}</span>}<span className="ml-auto text-[11px]" style={{ color: '#b0b0b0' }}>{fmtDate(x.ts.slice(0, 10))}</span></div>
            )); })()}
        </div>
      )}

      {editOpen && <AccountForm editAcct={a} onClose={() => setEditOpen(false)} />}
    </div>
  );
}

function Register({ a, txs }: { a: ReturnType<typeof oneAccount>; txs: ReturnType<typeof txForHotel> }) {
  let running = a?.openingBalance ?? 0;
  return (
    <TableWrap empty={txs.length === 0} emptyText="No activity for this account yet. Transactions and journal entries using this account will appear here.">
      <THead cols={['Date', 'Source', 'Transaction', 'Memo', 'Debit', 'Credit', 'Balance', 'JE']} right={[4, 5, 6]} />
      <tbody>
        {[...txs].reverse().map((t, i, arr) => {
          const debit = t.amount < 0; running += Math.abs(t.amount);
          return (
            <tr key={t.id} style={{ borderBottom: i < arr.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
              <td className={td} style={{ color: '#6a6a6a' }}>{fmtDate(t.dateIso)}</td><td className={td} style={{ color: '#6a6a6a' }}>{t.source === 'bank' ? 'Bank' : 'Card'}</td><td className={td} style={{ color: '#222' }}>{t.description}</td><td className={td} style={{ color: '#929292' }}>{t.memo ?? '—'}</td><td className={td + ' text-right'} style={{ color: '#222' }}>{debit ? money(Math.abs(t.amount)) : '—'}</td><td className={td + ' text-right'} style={{ color: '#222' }}>{!debit ? money(Math.abs(t.amount)) : '—'}</td><td className={td + ' text-right font-semibold'} style={{ color: '#222' }}>{money(running)}</td><td className={td + ' font-mono'} style={{ color: '#6a4ec0' }}>JE-{1000 + i}</td>
            </tr>
          );
        })}
      </tbody>
    </TableWrap>
  );
}

function SC({ label, value, accent = '#222' }: { label: string; value: string; accent?: string }) { return <div className="p-3" style={card}><p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: '#929292' }}>{label}</p><p className="text-sm font-bold mt-0.5 truncate" style={{ color: accent }}>{value}</p></div>; }
function Sect({ title, children }: { title: string; children: React.ReactNode }) { return <div className="rounded-2xl overflow-hidden" style={card}><div className="px-5 py-3" style={{ borderBottom: '1px solid #f0f0f0' }}><h2 className="text-sm font-bold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>{title}</h2></div><div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div></div>; }
function Info({ label, value }: { label: string; value: string }) { return <div><p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: '#929292' }}>{label}</p><p className="text-sm mt-0.5" style={{ color: '#222' }}>{value}</p></div>; }
function Empty({ text }: { text: string }) { return <div className="rounded-2xl p-10 text-center text-sm" style={{ border: '1px dashed #dddddd', background: '#fff', color: '#929292' }}>{text}</div>; }
function Wrap({ children }: { children: React.ReactNode }) { return <div className="max-w-5xl mx-auto flex flex-col gap-5"><Link href="/web/accounting/chart-of-accounts/accounts" className="inline-flex items-center gap-1 text-sm" style={{ color: '#6a6a6a' }}><ArrowLeft className="w-4 h-4" /> Accounts</Link>{children}</div>; }
function TableWrap({ children, empty, emptyText }: { children: React.ReactNode; empty: boolean; emptyText: string }) { if (empty) return <Empty text={emptyText} />; return <div className="overflow-x-auto rounded-2xl" style={card}><table className="w-full text-sm border-collapse">{children}</table></div>; }
function THead({ cols, right = [] }: { cols: string[]; right?: number[] }) { return <thead><tr style={{ background: '#f7f7f7', borderBottom: '1px solid #dddddd' }}>{cols.map((c, i) => <th key={c} className="text-[10px] font-semibold uppercase tracking-wide py-2.5 px-3 whitespace-nowrap" style={{ color: '#6a6a6a', textAlign: right.includes(i) ? 'right' : 'left' }}>{c}</th>)}</tr></thead>; }
function UsedBySection({ title, items }: { title: string; items: string[] }) { return <div className="rounded-2xl overflow-hidden" style={card}><div className="px-5 py-2.5" style={{ borderBottom: '1px solid #f0f0f0' }}><h3 className="text-xs font-bold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>{title}</h3></div><div className="px-5 py-3">{items.length === 0 ? <p className="text-xs" style={{ color: '#b0b0b0' }}>Not used here.</p> : items.map((it) => <p key={it} className="text-sm" style={{ color: '#3f3f3f' }}>{it}</p>)}</div></div>; }
const td = 'py-2.5 px-3 text-xs';

export default function AccountDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <Suspense fallback={null}><Inner code={id} /></Suspense>;
}
