'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Building2, BedDouble, Landmark, CreditCard, ClipboardList, Receipt, CheckCheck, CalendarCheck,
  ArrowRight, Upload, AlertTriangle,
} from 'lucide-react';
import {
  HOTEL_ENTITIES, TOTAL_ROOMS, TOTAL_BANK_ACCOUNTS, TOTAL_CREDIT_CARDS, PORTFOLIO_STATS,
  HOTEL_CLOSE_STATUS, getEntity, bankAccountsForHotel, creditCardsForHotel, txForHotel, closeForHotel,
} from '@hos/shared/accounting-os';
import { useAcctOs } from '../_context';
import { card, money, moneyShort, Badge, CLOSE_STATUS, RECON_STATUS, fmtMonth } from '../_ui';

export default function DashboardPage() {
  const { selection, selectHotel } = useAcctOs();
  if (selection.kind === 'all') return <PortfolioDashboard onOpenHotel={selectHotel} />;
  return <HotelDashboard hotelId={selection.hotelId} />;
}

/* ─────────────── ALL HOTELS ─────────────── */
function PortfolioDashboard({ onOpenHotel }: { onOpenHotel: (id: string) => void }) {
  const router = useRouter();
  const openHotel = (id: string) => { onOpenHotel(id); router.push('/web/accounting/dashboard'); };

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <Badge label="All Hotels" fg="#6a4ec0" bg="#ece4fb" />
        <div>
          <h1 className="text-xl font-bold" style={{ color: '#222' }}>Portfolio Accounting Dashboard</h1>
          <p className="text-sm" style={{ color: '#929292' }}>Financial overview across all HOS Management hotel entities.</p>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Kpi icon={<Building2 className="w-4 h-4" />} label="Total Hotels" value="16" />
        <Kpi icon={<BedDouble className="w-4 h-4" />} label="Total Rooms" value={TOTAL_ROOMS.toLocaleString()} />
        <Kpi icon={<Landmark className="w-4 h-4" />} label="Bank Accounts" value={String(TOTAL_BANK_ACCOUNTS)} />
        <Kpi icon={<CreditCard className="w-4 h-4" />} label="Credit Cards" value={String(TOTAL_CREDIT_CARDS)} />
        <Kpi icon={<ClipboardList className="w-4 h-4" />} label="Transactions to Review" value={String(PORTFOLIO_STATS.totalToReview)} accent="#b45309" />
        <Kpi icon={<Receipt className="w-4 h-4" />} label="Missing Receipts" value={String(PORTFOLIO_STATS.missingReceipts)} accent="#b91c1c" />
        <Kpi icon={<CheckCheck className="w-4 h-4" />} label="Reconciliations Pending" value={String(PORTFOLIO_STATS.reconPending)} accent="#b45309" />
        <Kpi icon={<CalendarCheck className="w-4 h-4" />} label="Hotels Ready to Close" value={String(PORTFOLIO_STATS.readyToClose)} accent="#15803d" />
      </div>

      {/* Hotel Close Status */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>Hotel Close Status · {fmtMonth('2026-05')}</h2>
          <Link href="/web/accounting/month-close" className="text-xs font-semibold inline-flex items-center gap-1" style={{ color: '#6a4ec0' }}>Month Close <ArrowRight className="w-3 h-3" /></Link>
        </div>
        <div className="overflow-x-auto rounded-2xl" style={card}>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr style={{ background: '#f7f7f7', borderBottom: '1px solid #dddddd' }}>
                {['Hotel', 'Code', 'Bank', 'Card', 'Reviewed', 'Receipts', 'Reconciliation', 'Close', ''].map((h, i) => (
                  <th key={h} className="text-left text-[11px] font-semibold uppercase tracking-wide py-2.5 px-3" style={{ color: '#6a6a6a', textAlign: i >= 2 && i <= 5 ? 'center' : 'left' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {HOTEL_CLOSE_STATUS.map((c, i) => {
                const h = getEntity(c.hotelId)!;
                const cs = CLOSE_STATUS[c.status];
                return (
                  <tr key={c.hotelId} style={{ borderBottom: i < HOTEL_CLOSE_STATUS.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                    <td className="py-2.5 px-3"><p className="font-medium" style={{ color: '#222' }}>{h.hotelName}</p><p className="text-[11px]" style={{ color: '#929292' }}>{h.legalEntity}</p></td>
                    <td className="py-2.5 px-3 text-xs font-mono" style={{ color: '#6a6a6a' }}>{h.propertyCode}</td>
                    <Tick ok={c.bankUploaded} /><Tick ok={c.ccUploaded} /><Tick ok={c.txReviewed} /><Tick ok={c.receiptsComplete} />
                    <td className="py-2.5 px-3"><span className="text-xs" style={{ color: c.reconciled ? '#15803d' : '#b45309' }}>{c.reconciled ? 'Reconciled' : 'Pending'}</span></td>
                    <td className="py-2.5 px-3"><Badge label={cs.label} fg={cs.fg} bg={cs.bg} /></td>
                    <td className="py-2.5 px-3">
                      <button onClick={() => openHotel(c.hotelId)} className="text-xs font-semibold" style={{ color: '#6a4ec0' }}>
                        {c.status === 'closed' ? 'View' : c.status === 'blocked' ? 'View Issues' : 'Continue'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Cash position + report shortcuts */}
      <div className="grid md:grid-cols-2 gap-6">
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-bold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>Cash Position by Hotel</h2>
          <div className="rounded-2xl overflow-hidden" style={card}>
            {HOTEL_ENTITIES.slice(0, 8).map((h, i, arr) => {
              const cash = bankAccountsForHotel(h.id).reduce((s, a) => s + a.currentBalance, 0);
              return (
                <button key={h.id} onClick={() => openHotel(h.id)} className="w-full flex items-center justify-between px-4 py-2.5 text-left hover:bg-[#f7f7f7]" style={{ borderBottom: i < arr.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                  <span className="text-sm truncate" style={{ color: '#222' }}>{h.hotelName}</span>
                  <span className="text-sm font-semibold" style={{ color: '#15803d' }}>{moneyShort(cash)}</span>
                </button>
              );
            })}
          </div>
        </section>
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-bold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>Report Shortcuts</h2>
          <div className="grid grid-cols-2 gap-3">
            {['Portfolio P&L', 'Hotel Comparison', 'Cash Position', 'Expense Comparison'].map((r) => (
              <Link key={r} href="/web/accounting/reports" className="p-4 rounded-2xl text-sm font-medium hover:shadow-md transition-shadow" style={{ ...card, color: '#222' }}>
                {r}<ArrowRight className="w-3.5 h-3.5 mt-2" style={{ color: '#6a4ec0' }} />
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

/* ─────────────── SINGLE HOTEL ─────────────── */
function HotelDashboard({ hotelId }: { hotelId: string }) {
  const h = getEntity(hotelId);
  if (!h) return <p className="text-sm" style={{ color: '#929292' }}>Hotel not found.</p>;
  const banks = bankAccountsForHotel(hotelId);
  const cards = creditCardsForHotel(hotelId);
  const txs = txForHotel(hotelId);
  const close = closeForHotel(hotelId)!;
  const bankBalance = banks.reduce((s, a) => s + a.currentBalance, 0);
  const ccBalance = cards.reduce((s, a) => s + a.currentBalance, 0);
  const toReview = close.toReview;
  const missing = close.missingReceipts;
  const cs = CLOSE_STATUS[close.status];

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <Badge label="One Hotel" fg="#1d4ed8" bg="#dbeafe" />
        <div>
          <h1 className="text-xl font-bold" style={{ color: '#222' }}>{h.hotelName} · Accounting Dashboard</h1>
          <p className="text-sm" style={{ color: '#929292' }}>{h.legalEntity} · {h.propertyCode} · {h.rooms} rooms</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <Kpi icon={<Landmark className="w-4 h-4" />} label="Bank Balance" value={moneyShort(bankBalance)} accent="#15803d" />
        <Kpi icon={<CreditCard className="w-4 h-4" />} label="Card Balance" value={moneyShort(ccBalance)} accent="#b45309" />
        <Kpi icon={<ClipboardList className="w-4 h-4" />} label="To Review" value={String(toReview)} accent={toReview ? '#b45309' : '#15803d'} />
        <Kpi icon={<Receipt className="w-4 h-4" />} label="Missing Receipts" value={String(missing)} accent={missing ? '#b91c1c' : '#15803d'} />
        <Kpi icon={<CheckCheck className="w-4 h-4" />} label="Reconciliation" value={close.reconciled ? 'Done' : 'Pending'} accent={close.reconciled ? '#15803d' : '#b45309'} />
        <Kpi icon={<CalendarCheck className="w-4 h-4" />} label="Month Close" value={cs.label} accent={cs.fg} />
      </div>

      {/* Bank + card accounts */}
      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-bold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>Bank &amp; Credit Card Accounts</h2>
        <div className="overflow-x-auto rounded-2xl" style={card}>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr style={{ background: '#f7f7f7', borderBottom: '1px solid #dddddd' }}>
                {['Account', 'Type', 'Last 4', 'Last Statement', 'Balance', 'Reconciliation', 'Action'].map((x, i) => (
                  <th key={x} className="text-[11px] font-semibold uppercase tracking-wide py-2.5 px-3" style={{ color: '#6a6a6a', textAlign: i === 4 ? 'right' : 'left' }}>{x}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...banks.map((b) => ({ ...b, kind: 'bank' as const })), ...cards.map((c) => ({ ...c, kind: 'card' as const }))].map((a, i, arr) => {
                const rs = RECON_STATUS[a.reconStatus];
                return (
                  <tr key={a.id} style={{ borderBottom: i < arr.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                    <td className="py-2.5 px-3"><p className="font-medium" style={{ color: '#222' }}>{a.name}</p><p className="text-[11px]" style={{ color: '#929292' }}>{a.kind === 'bank' ? a.bank : a.issuer}</p></td>
                    <td className="py-2.5 px-3 text-xs" style={{ color: '#6a6a6a' }}>{a.kind === 'bank' ? a.type : 'Credit Card'}</td>
                    <td className="py-2.5 px-3 text-xs font-mono" style={{ color: '#6a6a6a' }}>••{a.last4}</td>
                    <td className="py-2.5 px-3 text-xs" style={{ color: '#6a6a6a' }}>{a.lastStatementMonth ? fmtMonth(a.lastStatementMonth) : '—'}</td>
                    <td className="py-2.5 px-3 text-sm font-semibold text-right" style={{ color: '#222' }}>{money(a.currentBalance)}</td>
                    <td className="py-2.5 px-3"><Badge label={rs.label} fg={rs.fg} bg={rs.bg} /></td>
                    <td className="py-2.5 px-3">
                      <div className="flex gap-2">
                        <Link href={a.kind === 'bank' ? '/web/accounting/banking/upload' : '/web/accounting/credit-cards/upload'} className="text-xs font-semibold" style={{ color: '#6a4ec0' }}>Upload</Link>
                        <Link href="/web/accounting/reconciliation" className="text-xs font-semibold" style={{ color: '#6a6a6a' }}>Reconcile</Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <div className="grid md:grid-cols-2 gap-6">
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>Transaction Review Queue</h2>
            <Link href="/web/accounting/transactions" className="text-xs font-semibold inline-flex items-center gap-1" style={{ color: '#6a4ec0' }}>Open <ArrowRight className="w-3 h-3" /></Link>
          </div>
          <div className="rounded-2xl overflow-hidden" style={card}>
            {txs.filter((t) => t.status === 'needs-review' || t.status === 'uncategorized').slice(0, 6).map((t, i, arr) => (
              <Link key={t.id} href="/web/accounting/transactions" className="flex items-center justify-between px-4 py-2.5 hover:bg-[#f7f7f7]" style={{ borderBottom: i < arr.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                <div className="min-w-0"><p className="text-sm truncate" style={{ color: '#222' }}>{t.description}</p><p className="text-[11px]" style={{ color: '#929292' }}>{t.dateIso} · {t.source === 'bank' ? 'Bank' : 'Card'}</p></div>
                <span className="text-sm font-semibold flex-shrink-0" style={{ color: t.amount < 0 ? '#b91c1c' : '#15803d' }}>{money(t.amount, { sign: true })}</span>
              </Link>
            ))}
            {toReview === 0 && <p className="px-4 py-6 text-center text-sm" style={{ color: '#15803d' }}>All transactions reviewed ✓</p>}
          </div>
        </section>
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-bold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>Report Shortcuts</h2>
          <div className="grid grid-cols-2 gap-3">
            {['Profit & Loss', 'Balance Sheet', 'Cash Flow', 'General Ledger'].map((r) => (
              <Link key={r} href="/web/accounting/reports" className="p-4 rounded-2xl text-sm font-medium hover:shadow-md transition-shadow" style={{ ...card, color: '#222' }}>
                {r}<ArrowRight className="w-3.5 h-3.5 mt-2" style={{ color: '#6a4ec0' }} />
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function Kpi({ icon, label, value, accent = '#222' }: { icon: React.ReactNode; label: string; value: string; accent?: string }) {
  return (
    <div className="p-3.5 flex flex-col gap-1.5" style={card}>
      <div className="flex items-center gap-1.5" style={{ color: accent }}>{icon}<span className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: '#929292' }}>{label}</span></div>
      <p className="text-xl font-bold" style={{ color: accent }}>{value}</p>
    </div>
  );
}
function Tick({ ok }: { ok: boolean }) {
  return <td className="py-2.5 px-3 text-center"><span style={{ color: ok ? '#15803d' : '#c1c1c1' }}>{ok ? '✓' : '—'}</span></td>;
}
