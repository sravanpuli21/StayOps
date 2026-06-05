'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Upload, CreditCard, Receipt, AlertTriangle } from 'lucide-react';
import { ACCT_CREDIT_CARDS, creditCardsForHotel, getEntity, HOTEL_ENTITIES } from '@hos/shared/accounting-os';
import { useAcctOs } from '../_context';
import { useAcctState, allTransactions } from '../_store';
import { cardsFor } from '../_entities';
import { card, money, moneyShort, Badge, RECON_STATUS, fmtMonth } from '../_ui';
import { ModuleNav, ScopeHeader } from '../_ModuleNav';

const TABS = ['Overview', 'Cards', 'To Review', 'Missing Receipts', 'Payments', 'Imported Files', 'Duplicates', 'Activity', 'Settings'] as const;
type Tab = typeof TABS[number];

export default function CreditCardsPage() {
  const { selection, selectHotel } = useAcctOs();
  const store = useAcctState();
  const [tab, setTab] = useState<Tab>('Overview');
  const single = selection.kind === 'hotel';
  const hotelId = single ? selection.hotelId : null;
  const h = hotelId ? getEntity(hotelId) : null;

  const txs = allTransactions(store).filter((t) => t.source === 'credit-card');
  const scopedTx = hotelId ? txs.filter((t) => t.hotelId === hotelId) : txs;
  const toReview = (id: string) => txs.filter((t) => t.accountId === id && (t.status === 'needs-review' || t.status === 'uncategorized')).length;
  const cardBatches = store.batches.filter((b) => b.source === 'credit-card' && (!hotelId || b.hotelId === hotelId));

  const allCards = single && hotelId ? cardsFor(store, hotelId) : ACCT_CREDIT_CARDS;
  const missing = scopedTx.filter((t) => t.receipt === 'missing').length;

  return (
    <div className="max-w-[1300px] mx-auto flex flex-col gap-5">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <ScopeHeader single={single} title={single ? `Credit Cards · ${h?.hotelName}` : 'Credit Cards'} sub={single ? `${h?.legalEntity} · ${h?.propertyCode} · card statements, receipts, and reconciliation` : 'Manage credit card statement uploads and card reconciliation across all hotel entities.'} />
        <Link href={`/web/accounting/credit-cards/upload${hotelId ? `?hotel=${hotelId}` : ''}`} className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl text-xs font-semibold" style={{ background: '#6a4ec0', color: '#fff' }}><Upload className="w-3.5 h-3.5" /> Upload Credit Card Statement</Link>
      </div>

      <ModuleNav tabs={TABS} active={tab} onChange={setTab} counts={{ 'To Review': scopedTx.filter((t) => t.status === 'needs-review' || t.status === 'uncategorized').length, 'Missing Receipts': missing }} />

      {tab === 'Overview' && (single ? (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <KC label="Total Card Balance" value={moneyShort(allCards.reduce((s, a) => s + a.currentBalance, 0))} accent="#b45309" />
            <KC label="Credit Cards" value={String(allCards.length)} />
            <KC label="To Review" value={String(scopedTx.filter((t) => t.status === 'needs-review' || t.status === 'uncategorized').length)} accent="#b45309" />
            <KC label="Missing Receipts" value={String(missing)} accent="#b91c1c" />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {allCards.map((c: any) => {
              const rs = RECON_STATUS[c.reconStatus as keyof typeof RECON_STATUS];
              return (
                <div key={c.id} className="p-5 flex flex-col gap-3" style={card}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5"><div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#fef3c7' }}><CreditCard className="w-5 h-5" style={{ color: '#b45309' }} /></div><div><p className="font-bold text-sm" style={{ color: '#222' }}>{c.name}</p><p className="text-[11px]" style={{ color: '#929292' }}>{c.issuer} · {c.cardHolder} · ••{c.last4}</p></div></div>
                    <Badge label={rs.label} fg={rs.fg} bg={rs.bg} />
                  </div>
                  <div className="flex items-end justify-between">
                    <div><p className="text-[11px] uppercase tracking-wide" style={{ color: '#929292' }}>Balance</p><p className="text-xl font-bold" style={{ color: '#b45309' }}>{money(c.currentBalance)}</p></div>
                    <div className="text-right text-xs" style={{ color: '#929292' }}><p>Limit {money(c.creditLimit)}</p><p style={{ color: toReview(c.id) ? '#b45309' : '#15803d' }}>{toReview(c.id)} to review</p></div>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/web/accounting/credit-cards/upload?hotel=${hotelId}&account=${c.id}`} className="flex-1 h-9 rounded-xl text-xs font-semibold inline-flex items-center justify-center" style={{ background: '#6a4ec0', color: '#fff' }}>Upload</Link>
                    <Link href="/web/accounting/transactions" className="flex-1 h-9 rounded-xl text-xs font-semibold inline-flex items-center justify-center" style={{ background: '#f7f7f7', border: '1px solid #dddddd', color: '#6a6a6a' }}>Register</Link>
                    <Link href={`/web/accounting/reconciliation?account=${c.id}`} className="flex-1 h-9 rounded-xl text-xs font-semibold inline-flex items-center justify-center" style={{ background: '#f7f7f7', border: '1px solid #dddddd', color: '#6a6a6a' }}>Reconcile</Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <KC label="Total Credit Cards" value={String(ACCT_CREDIT_CARDS.length)} />
            <KC label="Total Card Balance" value={moneyShort(ACCT_CREDIT_CARDS.reduce((s, c) => s + c.currentBalance, 0))} accent="#b45309" />
            <KC label="To Review" value={String(txs.filter((t) => t.status === 'needs-review' || t.status === 'uncategorized').length)} accent="#b45309" />
            <KC label="Missing Receipts" value={String(txs.filter((t) => t.receipt === 'missing').length)} accent="#b91c1c" />
          </div>
          <div className="overflow-x-auto rounded-2xl" style={card}>
            <table className="w-full text-sm border-collapse">
              <thead><tr style={{ background: '#f7f7f7', borderBottom: '1px solid #dddddd' }}>{['Hotel', 'Cards', 'Balance', 'To Review', 'Missing Receipts', 'Reconciliation', ''].map((x, i) => <th key={x} className="text-[11px] font-semibold uppercase tracking-wide py-2.5 px-3" style={{ color: '#6a6a6a', textAlign: i >= 1 && i <= 4 ? 'center' : 'left' }}>{x}</th>)}</tr></thead>
              <tbody>
                {HOTEL_ENTITIES.map((he, i) => {
                  const cds = creditCardsForHotel(he.id);
                  const review = txs.filter((t) => t.hotelId === he.id && (t.status === 'needs-review' || t.status === 'uncategorized')).length;
                  const miss = txs.filter((t) => t.hotelId === he.id && t.receipt === 'missing').length;
                  const reconciled = cds.every((c) => c.reconStatus === 'reconciled');
                  return (
                    <tr key={he.id} className="hover:bg-[#fafafa]" style={{ borderBottom: i < HOTEL_ENTITIES.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                      <td className="py-2.5 px-3"><p className="font-medium" style={{ color: '#222' }}>{he.hotelName}</p><p className="text-[11px]" style={{ color: '#929292' }}>{he.propertyCode}</p></td>
                      <td className="py-2.5 px-3 text-center text-xs" style={{ color: '#3f3f3f' }}>{cds.length}</td>
                      <td className="py-2.5 px-3 text-center text-xs font-semibold" style={{ color: '#b45309' }}>{moneyShort(cds.reduce((s, c) => s + c.currentBalance, 0))}</td>
                      <td className="py-2.5 px-3 text-center text-xs" style={{ color: review ? '#b45309' : '#15803d', fontWeight: 600 }}>{review}</td>
                      <td className="py-2.5 px-3 text-center text-xs" style={{ color: miss ? '#b91c1c' : '#15803d', fontWeight: 600 }}>{miss}</td>
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

      {tab === 'Cards' && (
        <div className="overflow-x-auto rounded-2xl" style={card}>
          <table className="w-full text-sm border-collapse">
            <thead><tr style={{ background: '#f7f7f7', borderBottom: '1px solid #dddddd' }}>{[...(single ? [] : ['Hotel']), 'Card', 'Issuer', 'Last 4', 'Holder', 'Balance', 'Limit', 'To Review', 'Reconciliation', ''].map((x) => <th key={x} className="text-[11px] font-semibold uppercase tracking-wide py-2.5 px-3 whitespace-nowrap" style={{ color: '#6a6a6a' }}>{x}</th>)}</tr></thead>
            <tbody>
              {(single && hotelId ? cardsFor(store, hotelId) : ACCT_CREDIT_CARDS).map((c: any, i, arr) => {
                const rs = RECON_STATUS[c.reconStatus as keyof typeof RECON_STATUS];
                return (
                  <tr key={c.id} className="hover:bg-[#fafafa]" style={{ borderBottom: i < arr.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                    {!single && <td className="py-2.5 px-3 text-xs"><button onClick={() => selectHotel(c.hotelId)}><span style={{ color: '#222', fontWeight: 500 }}>{getEntity(c.hotelId)?.hotelName}</span></button></td>}
                    <td className="py-2.5 px-3 text-xs font-medium" style={{ color: '#222' }}>{c.name}</td>
                    <td className="py-2.5 px-3 text-xs" style={{ color: '#6a6a6a' }}>{c.issuer}</td>
                    <td className="py-2.5 px-3 text-xs font-mono" style={{ color: '#6a6a6a' }}>••{c.last4}</td>
                    <td className="py-2.5 px-3 text-xs" style={{ color: '#6a6a6a' }}>{c.cardHolder}</td>
                    <td className="py-2.5 px-3 text-sm font-semibold" style={{ color: '#b45309' }}>{money(c.currentBalance)}</td>
                    <td className="py-2.5 px-3 text-xs" style={{ color: '#6a6a6a' }}>{money(c.creditLimit)}</td>
                    <td className="py-2.5 px-3 text-center text-xs" style={{ color: toReview(c.id) ? '#b45309' : '#15803d', fontWeight: 600 }}>{toReview(c.id)}</td>
                    <td className="py-2.5 px-3"><Badge label={rs.label} fg={rs.fg} bg={rs.bg} /></td>
                    <td className="py-2.5 px-3"><Link href={`/web/accounting/credit-cards/upload?hotel=${c.hotelId}&account=${c.id}`} className="text-xs font-semibold" style={{ color: '#6a4ec0' }}>Upload</Link></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'To Review' && (
        <div className="rounded-2xl overflow-hidden" style={card}>
          {scopedTx.filter((t) => t.status === 'needs-review' || t.status === 'uncategorized').length === 0
            ? <Empty text="No credit card transactions need review." />
            : scopedTx.filter((t) => t.status === 'needs-review' || t.status === 'uncategorized').slice(0, 30).map((t, i, arr) => (
              <Link key={t.id} href="/web/accounting/transactions" className="flex items-center justify-between px-4 py-2.5 hover:bg-[#fafafa]" style={{ borderBottom: i < arr.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                <div><p className="text-sm" style={{ color: '#222' }}>{t.description}</p><p className="text-[11px]" style={{ color: '#929292' }}>{getEntity(t.hotelId)?.propertyCode} · {t.dateIso}</p></div>
                <span className="text-sm font-semibold" style={{ color: '#b45309' }}>{money(Math.abs(t.amount))}</span>
              </Link>
            ))}
        </div>
      )}

      {tab === 'Missing Receipts' && (
        <div className="rounded-2xl overflow-hidden" style={card}>
          {scopedTx.filter((t) => t.receipt === 'missing').length === 0
            ? <Empty text="No missing card receipts. All required receipts are attached or marked not required." />
            : scopedTx.filter((t) => t.receipt === 'missing').slice(0, 30).map((t, i, arr) => (
              <div key={t.id} className="flex items-center justify-between px-4 py-2.5" style={{ borderBottom: i < arr.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                <div className="flex items-center gap-2.5"><Receipt className="w-4 h-4" style={{ color: '#b91c1c' }} /><div><p className="text-sm" style={{ color: '#222' }}>{t.description}</p><p className="text-[11px]" style={{ color: '#929292' }}>{getEntity(t.hotelId)?.propertyCode} · {money(Math.abs(t.amount))}</p></div></div>
                <Link href="/web/accounting/transactions" className="text-xs font-semibold" style={{ color: '#6a4ec0' }}>Attach / Request</Link>
              </div>
            ))}
        </div>
      )}

      {tab === 'Payments' && (
        <div className="flex flex-col gap-3">
          <div className="p-3 rounded-xl text-xs" style={{ background: '#f0eefb', color: '#6a4ec0' }}>Suggested matches appear when a bank statement shows a card payment (e.g. AMEX PAYMENT, AUTOPAY) matching a card balance. Confirm to post Debit Credit Cards Payable / Credit Operating Checking.</div>
          <Empty text="No credit card payments to match yet. Upload a bank statement with a card payment to see suggested matches here." />
        </div>
      )}

      {tab === 'Imported Files' && (
        cardBatches.length === 0
          ? <Empty text="No credit card statements uploaded yet. Upload a CSV card statement to import charges." />
          : <div className="overflow-x-auto rounded-2xl" style={card}><table className="w-full text-sm border-collapse"><thead><tr style={{ background: '#f7f7f7', borderBottom: '1px solid #dddddd' }}>{['Hotel', 'Card', 'Month', 'Imported', 'Duplicates', 'Status'].map((x) => <th key={x} className="text-left text-[11px] font-semibold uppercase tracking-wide py-2.5 px-3" style={{ color: '#6a6a6a' }}>{x}</th>)}</tr></thead><tbody>{cardBatches.map((b, i) => (<tr key={b.id} style={{ borderBottom: i < cardBatches.length - 1 ? '1px solid #f0f0f0' : 'none' }}><td className="py-2.5 px-3 text-xs" style={{ color: '#222' }}>{getEntity(b.hotelId)?.propertyCode}</td><td className="py-2.5 px-3 text-xs" style={{ color: '#6a6a6a' }}>{b.accountId}</td><td className="py-2.5 px-3 text-xs" style={{ color: '#6a6a6a' }}>{fmtMonth(b.month)}</td><td className="py-2.5 px-3 text-xs font-semibold" style={{ color: '#15803d' }}>{b.count}</td><td className="py-2.5 px-3 text-xs" style={{ color: '#b45309' }}>{b.duplicates}</td><td className="py-2.5 px-3"><Badge label="Imported" fg="#15803d" bg="#dcfce7" /></td></tr>))}</tbody></table></div>
      )}

      {tab === 'Duplicates' && <Empty text="No duplicate credit card transactions found. Possible duplicates appear here when new card statement files are uploaded." />}
      {tab === 'Activity' && (
        <div className="rounded-2xl overflow-hidden" style={card}>{store.activity.length === 0 ? <Empty text="No credit card activity yet this session." /> : store.activity.slice(0, 30).map((a, i, arr) => (<div key={a.id} className="flex items-center gap-3 px-4 py-2.5" style={{ borderBottom: i < arr.length - 1 ? '1px solid #f0f0f0' : 'none' }}><span className="w-1.5 h-1.5 rounded-full" style={{ background: '#6a4ec0' }} /><span className="text-sm" style={{ color: '#222' }}>{a.action}</span>{a.detail && <span className="text-xs" style={{ color: '#929292' }}>· {a.detail}</span>}</div>))}</div>
      )}
      {tab === 'Settings' && (
        <div className="grid md:grid-cols-2 gap-4">
          {[['Allow CSV card statement uploads', true], ['PDF uploads', false], ['Require statement balance', true], ['Duplicate detection', true], ['Require receipts above $250', true], ['Require receipt before approval', true]].map(([l, on]) => (
            <div key={l as string} className="p-4 flex items-center justify-between" style={card}><span className="text-sm" style={{ color: '#222' }}>{l as string}</span>{(l as string) === 'PDF uploads' ? <Badge label="Coming Soon" fg="#929292" bg="#f0f0f0" /> : <Badge label={on ? 'On' : 'Off'} fg={on ? '#15803d' : '#929292'} bg={on ? '#dcfce7' : '#f0f0f0'} />}</div>
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
