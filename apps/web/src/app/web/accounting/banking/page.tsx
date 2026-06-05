'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Upload, Plus, Landmark, ArrowRight } from 'lucide-react';
import { ACCT_BANK_ACCOUNTS, bankAccountsForHotel, getEntity, HOTEL_ENTITIES } from '@hos/shared/accounting-os';
import { useAcctOs } from '../_context';
import { useAcctState, allTransactions } from '../_store';
import { banksFor } from '../_entities';
import { card, money, moneyShort, Badge, RECON_STATUS, fmtMonth } from '../_ui';
import { ModuleNav, ScopeHeader } from '../_ModuleNav';

const TABS = ['Overview', 'Accounts', 'Imported Files', 'To Review', 'Payments', 'Activity', 'Settings'] as const;
type Tab = typeof TABS[number];

export default function BankingPage() {
  const { selection, selectHotel } = useAcctOs();
  const store = useAcctState();
  const [tab, setTab] = useState<Tab>('Overview');
  const single = selection.kind === 'hotel';
  const hotelId = single ? selection.hotelId : null;
  const txs = allTransactions(store).filter((t) => t.source === 'bank');
  const scopedTx = hotelId ? txs.filter((t) => t.hotelId === hotelId) : txs;
  const toReview = (id: string) => txs.filter((t) => t.accountId === id && (t.status === 'needs-review' || t.status === 'uncategorized')).length;

  const h = hotelId ? getEntity(hotelId) : null;
  const allBank = single && hotelId ? banksFor(store, hotelId) : ACCT_BANK_ACCOUNTS;
  const bankBatches = store.batches.filter((b) => b.source === 'bank' && (!hotelId || b.hotelId === hotelId));

  return (
    <div className="max-w-[1300px] mx-auto flex flex-col gap-5">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <ScopeHeader single={single} title={single ? `Banking · ${h?.hotelName}` : 'Banking'} sub={single ? `${h?.legalEntity} · ${h?.propertyCode} · upload statements, review, and reconcile` : 'Manage bank statement uploads and bank reconciliation across all hotels.'} />
        <div className="flex gap-2">
          <Link href={`/web/accounting/banking/upload${hotelId ? `?hotel=${hotelId}` : ''}`} className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl text-xs font-semibold" style={{ background: '#6a4ec0', color: '#fff' }}><Upload className="w-3.5 h-3.5" /> Upload Bank Statement</Link>
        </div>
      </div>

      <ModuleNav tabs={TABS} active={tab} onChange={setTab} counts={{ 'To Review': scopedTx.filter((t) => t.status === 'needs-review' || t.status === 'uncategorized').length }} />

      {/* OVERVIEW */}
      {tab === 'Overview' && (single ? (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <KC label="Total Cash" value={moneyShort(allBank.reduce((s, a) => s + a.currentBalance, 0))} />
            <KC label="Bank Accounts" value={String(allBank.length)} />
            <KC label="To Review" value={String(scopedTx.filter((t) => t.status === 'needs-review' || t.status === 'uncategorized').length)} accent="#b45309" />
            <KC label="Reconciled" value={`${allBank.filter((a: any) => a.reconStatus === 'reconciled').length}/${allBank.length}`} accent="#15803d" />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {allBank.map((a: any) => {
              const rs = RECON_STATUS[a.reconStatus as keyof typeof RECON_STATUS];
              return (
                <div key={a.id} className="p-5 flex flex-col gap-3" style={card}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5"><div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#dbeafe' }}><Landmark className="w-5 h-5" style={{ color: '#1d4ed8' }} /></div><div><p className="font-bold text-sm" style={{ color: '#222' }}>{a.name}</p><p className="text-[11px]" style={{ color: '#929292' }}>{a.bank} · ••{a.last4}</p></div></div>
                    <Badge label={rs.label} fg={rs.fg} bg={rs.bg} />
                  </div>
                  <div className="flex items-end justify-between">
                    <div><p className="text-[11px] uppercase tracking-wide" style={{ color: '#929292' }}>Current Balance</p><p className="text-xl font-bold" style={{ color: '#222' }}>{money(a.currentBalance)}</p></div>
                    <p className="text-xs" style={{ color: toReview(a.id) ? '#b45309' : '#15803d' }}>{toReview(a.id)} to review</p>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/web/accounting/banking/upload?hotel=${hotelId}&account=${a.id}`} className="flex-1 h-9 rounded-xl text-xs font-semibold inline-flex items-center justify-center" style={{ background: '#6a4ec0', color: '#fff' }}>Upload</Link>
                    <Link href="/web/accounting/transactions" className="flex-1 h-9 rounded-xl text-xs font-semibold inline-flex items-center justify-center" style={{ background: '#f7f7f7', border: '1px solid #dddddd', color: '#6a6a6a' }}>Register</Link>
                    <Link href={`/web/accounting/reconciliation?account=${a.id}`} className="flex-1 h-9 rounded-xl text-xs font-semibold inline-flex items-center justify-center" style={{ background: '#f7f7f7', border: '1px solid #dddddd', color: '#6a6a6a' }}>Reconcile</Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <KC label="Total Bank Accounts" value={String(ACCT_BANK_ACCOUNTS.length)} />
            <KC label="Total Cash" value={moneyShort(ACCT_BANK_ACCOUNTS.reduce((s, a) => s + a.currentBalance, 0))} accent="#15803d" />
            <KC label="To Review" value={String(txs.filter((t) => t.status === 'needs-review' || t.status === 'uncategorized').length)} accent="#b45309" />
            <KC label="Reconciliations Pending" value={String(ACCT_BANK_ACCOUNTS.filter((a) => a.reconStatus !== 'reconciled').length)} accent="#b45309" />
          </div>
          <div className="overflow-x-auto rounded-2xl" style={card}>
            <table className="w-full text-sm border-collapse">
              <thead><tr style={{ background: '#f7f7f7', borderBottom: '1px solid #dddddd' }}>{['Hotel', 'Bank Accounts', 'Cash', 'To Review', 'Reconciliation', ''].map((x, i) => <th key={x} className="text-[11px] font-semibold uppercase tracking-wide py-2.5 px-3" style={{ color: '#6a6a6a', textAlign: i >= 1 && i <= 3 ? 'center' : 'left' }}>{x}</th>)}</tr></thead>
              <tbody>
                {HOTEL_ENTITIES.map((he, i) => {
                  const accts = bankAccountsForHotel(he.id);
                  const review = txs.filter((t) => t.hotelId === he.id && (t.status === 'needs-review' || t.status === 'uncategorized')).length;
                  const reconciled = accts.every((a) => a.reconStatus === 'reconciled');
                  return (
                    <tr key={he.id} className="hover:bg-[#fafafa]" style={{ borderBottom: i < HOTEL_ENTITIES.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                      <td className="py-2.5 px-3"><p className="font-medium" style={{ color: '#222' }}>{he.hotelName}</p><p className="text-[11px]" style={{ color: '#929292' }}>{he.propertyCode}</p></td>
                      <td className="py-2.5 px-3 text-center text-xs" style={{ color: '#3f3f3f' }}>{accts.length}</td>
                      <td className="py-2.5 px-3 text-center text-xs font-semibold" style={{ color: '#15803d' }}>{moneyShort(accts.reduce((s, a) => s + a.currentBalance, 0))}</td>
                      <td className="py-2.5 px-3 text-center text-xs" style={{ color: review ? '#b45309' : '#15803d', fontWeight: 600 }}>{review}</td>
                      <td className="py-2.5 px-3 text-center"><Badge label={reconciled ? 'Reconciled' : 'Pending'} fg={reconciled ? '#15803d' : '#b45309'} bg={reconciled ? '#dcfce7' : '#fef3c7'} /></td>
                      <td className="py-2.5 px-3"><button onClick={() => selectHotel(he.id)} className="text-xs font-semibold" style={{ color: '#6a4ec0' }}>View</button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      {/* ACCOUNTS */}
      {tab === 'Accounts' && (
        <div className="overflow-x-auto rounded-2xl" style={card}>
          <table className="w-full text-sm border-collapse">
            <thead><tr style={{ background: '#f7f7f7', borderBottom: '1px solid #dddddd' }}>{[...(single ? [] : ['Hotel']), 'Account', 'Bank', 'Last 4', 'Balance', 'Last Statement', 'To Review', 'Reconciliation', ''].map((x, i) => <th key={x} className="text-[11px] font-semibold uppercase tracking-wide py-2.5 px-3 whitespace-nowrap" style={{ color: '#6a6a6a' }}>{x}</th>)}</tr></thead>
            <tbody>
              {(single && hotelId ? banksFor(store, hotelId) : ACCT_BANK_ACCOUNTS).map((a: any, i, arr) => {
                const rs = RECON_STATUS[a.reconStatus as keyof typeof RECON_STATUS];
                return (
                  <tr key={a.id} className="hover:bg-[#fafafa]" style={{ borderBottom: i < arr.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                    {!single && <td className="py-2.5 px-3 text-xs"><button onClick={() => selectHotel(a.hotelId)} className="text-left"><span style={{ color: '#222', fontWeight: 500 }}>{getEntity(a.hotelId)?.hotelName}</span></button></td>}
                    <td className="py-2.5 px-3 text-xs font-medium" style={{ color: '#222' }}>{a.name}</td>
                    <td className="py-2.5 px-3 text-xs" style={{ color: '#6a6a6a' }}>{a.bank}</td>
                    <td className="py-2.5 px-3 text-xs font-mono" style={{ color: '#6a6a6a' }}>••{a.last4}</td>
                    <td className="py-2.5 px-3 text-sm font-semibold" style={{ color: '#222' }}>{money(a.currentBalance)}</td>
                    <td className="py-2.5 px-3 text-xs" style={{ color: '#6a6a6a' }}>{a.lastStatementMonth ? fmtMonth(a.lastStatementMonth) : '—'}</td>
                    <td className="py-2.5 px-3 text-center text-xs" style={{ color: toReview(a.id) ? '#b45309' : '#15803d', fontWeight: 600 }}>{toReview(a.id)}</td>
                    <td className="py-2.5 px-3"><Badge label={rs.label} fg={rs.fg} bg={rs.bg} /></td>
                    <td className="py-2.5 px-3"><Link href={`/web/accounting/banking/upload?hotel=${a.hotelId}&account=${a.id}`} className="text-xs font-semibold" style={{ color: '#6a4ec0' }}>Upload</Link></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* IMPORTED FILES */}
      {tab === 'Imported Files' && (
        bankBatches.length === 0
          ? <Empty text="No bank statements uploaded yet. Upload a CSV bank statement to import transactions." />
          : <div className="overflow-x-auto rounded-2xl" style={card}>
              <table className="w-full text-sm border-collapse">
                <thead><tr style={{ background: '#f7f7f7', borderBottom: '1px solid #dddddd' }}>{['Hotel', 'Account', 'Month', 'Imported', 'Duplicates', 'Status'].map((x) => <th key={x} className="text-left text-[11px] font-semibold uppercase tracking-wide py-2.5 px-3" style={{ color: '#6a6a6a' }}>{x}</th>)}</tr></thead>
                <tbody>{bankBatches.map((b, i) => (
                  <tr key={b.id} style={{ borderBottom: i < bankBatches.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                    <td className="py-2.5 px-3 text-xs" style={{ color: '#222' }}>{getEntity(b.hotelId)?.propertyCode}</td>
                    <td className="py-2.5 px-3 text-xs" style={{ color: '#6a6a6a' }}>{b.accountId}</td>
                    <td className="py-2.5 px-3 text-xs" style={{ color: '#6a6a6a' }}>{fmtMonth(b.month)}</td>
                    <td className="py-2.5 px-3 text-xs font-semibold" style={{ color: '#15803d' }}>{b.count}</td>
                    <td className="py-2.5 px-3 text-xs" style={{ color: '#b45309' }}>{b.duplicates}</td>
                    <td className="py-2.5 px-3"><Badge label="Imported" fg="#15803d" bg="#dcfce7" /></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
      )}

      {/* TO REVIEW */}
      {tab === 'To Review' && (
        <div className="rounded-2xl overflow-hidden" style={card}>
          {scopedTx.filter((t) => t.status === 'needs-review' || t.status === 'uncategorized').length === 0
            ? <Empty text="No bank transactions need review." />
            : scopedTx.filter((t) => t.status === 'needs-review' || t.status === 'uncategorized').slice(0, 30).map((t, i, arr) => (
              <Link key={t.id} href="/web/accounting/transactions" className="flex items-center justify-between px-4 py-2.5 hover:bg-[#fafafa]" style={{ borderBottom: i < arr.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                <div><p className="text-sm" style={{ color: '#222' }}>{t.description}</p><p className="text-[11px]" style={{ color: '#929292' }}>{getEntity(t.hotelId)?.propertyCode} · {t.dateIso}</p></div>
                <span className="text-sm font-semibold" style={{ color: t.amount < 0 ? '#b91c1c' : '#15803d' }}>{money(t.amount, { sign: true })}</span>
              </Link>
            ))}
        </div>
      )}

      {tab === 'Payments' && <Empty text="Bank-to-credit-card payments and transfers appear here as bank statements are imported. Match them in Transactions → Transfers." />}
      {tab === 'Activity' && (
        <div className="rounded-2xl overflow-hidden" style={card}>
          {store.activity.length === 0 ? <Empty text="No banking activity yet this session." /> : store.activity.slice(0, 30).map((a, i, arr) => (
            <div key={a.id} className="flex items-center gap-3 px-4 py-2.5" style={{ borderBottom: i < arr.length - 1 ? '1px solid #f0f0f0' : 'none' }}><span className="w-1.5 h-1.5 rounded-full" style={{ background: '#6a4ec0' }} /><span className="text-sm" style={{ color: '#222' }}>{a.action}</span>{a.detail && <span className="text-xs" style={{ color: '#929292' }}>· {a.detail}</span>}</div>
          ))}
        </div>
      )}
      {tab === 'Settings' && (
        <div className="grid md:grid-cols-2 gap-4">
          {[['Allow CSV bank statement uploads', true], ['Bank feed connections', false], ['Auto-map known columns', true], ['Duplicate detection', true], ['Require preview before import', true]].map(([l, on]) => (
            <div key={l as string} className="p-4 flex items-center justify-between" style={card}><span className="text-sm" style={{ color: '#222' }}>{l as string}</span>{(l as string).includes('feed') ? <Badge label="Coming Soon" fg="#929292" bg="#f0f0f0" /> : <Badge label={on ? 'On' : 'Off'} fg={on ? '#15803d' : '#929292'} bg={on ? '#dcfce7' : '#f0f0f0'} />}</div>
          ))}
        </div>
      )}
    </div>
  );
}

function KC({ label, value, accent = '#222' }: { label: string; value: string; accent?: string }) {
  return <div className="p-3.5" style={card}><p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: '#929292' }}>{label}</p><p className="text-xl font-bold mt-1" style={{ color: accent }}>{value}</p></div>;
}
function Empty({ text }: { text: string }) { return <div className="rounded-2xl p-10 text-center text-sm" style={{ border: '1px dashed #dddddd', background: '#fff', color: '#929292' }}>{text}</div>; }
