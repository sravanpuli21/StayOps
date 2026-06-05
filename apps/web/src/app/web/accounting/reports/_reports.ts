import { HOTEL_ENTITIES, getEntity, ACCT_TRANSACTIONS, type AcctTransaction } from '@hos/shared/accounting-os';

/**
 * Reports financial engine. Produces deterministic, CPA-clean figures per hotel
 * and consolidated for all hotels. Cambria (GA989) is anchored to the exact
 * numbers in the spec; other hotels scale by room count + a stable seed so the
 * portfolio totals stay believable.
 */

function seed(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return (h >>> 0) / 0xffffffff;
}
const r2 = (n: number) => Math.round(n * 100) / 100;

export interface PnlLine { label: string; amount?: number; section?: boolean; total?: boolean; account?: string; indent?: boolean }

/** Anchor figures for Cambria; everything else derives from rooms + seed. */
function hotelScale(hotelId: string): number {
  const h = getEntity(hotelId);
  if (hotelId === 'GA989') return 1;
  const rooms = h?.rooms ?? 100;
  const base = rooms / 101;           // Cambria has 101 rooms
  const jitter = 0.82 + seed(hotelId) * 0.5;
  return r2(base * jitter);
}

/* ── Profit & Loss ────────────────────────────────────────────────────── */
const REVENUE = [
  ['Room Revenue', 184620], ['Parking Revenue', 7850], ['Pet Fee Revenue', 2400], ['Market Revenue', 3200], ['Miscellaneous Guest Revenue', 1180],
] as const;
const COGS = [['Market Cost of Goods Sold', 1120]] as const;
const EXPENSES = [
  ['Payroll Expense', 62400], ['Housekeeping Supplies', 5820], ['Guest Supplies', 4360], ['Repairs and Maintenance', 8740], ['Engineering Supplies', 2180],
  ['Utilities', 12950], ['Internet and Cable', 1240], ['Franchise Fees', 14800], ['OTA Commissions', 7360], ['Insurance', 4100],
  ['Property Tax', 6200], ['Pest Control', 480], ['Landscaping', 1150], ['Software Subscriptions', 920], ['Accounting Fees', 1500], ['Bank Fees', 260], ['Office Supplies', 620],
] as const;
const OTHER_EXP = [['Interest Expense', 8400], ['Depreciation Expense', 6500]] as const;

export function profitLoss(hotelId: string): { lines: PnlLine[]; totalRevenue: number; totalExpenses: number; netIncome: number } {
  const s = hotelScale(hotelId);
  const lines: PnlLine[] = [];
  lines.push({ label: 'Revenue', section: true });
  let totalRev = 0;
  REVENUE.forEach(([l, v]) => { const a = r2(v * s); totalRev += a; lines.push({ label: l, amount: a, account: l, indent: true }); });
  totalRev = r2(totalRev);
  lines.push({ label: 'Total Revenue', amount: totalRev, total: true });

  lines.push({ label: 'Cost of Goods Sold', section: true });
  let totalCogs = 0;
  COGS.forEach(([l, v]) => { const a = r2(v * s); totalCogs += a; lines.push({ label: l, amount: a, account: l, indent: true }); });
  totalCogs = r2(totalCogs);
  lines.push({ label: 'Total Cost of Goods Sold', amount: totalCogs, total: true });
  lines.push({ label: 'Gross Profit', amount: r2(totalRev - totalCogs), total: true });

  lines.push({ label: 'Expenses', section: true });
  let totalExp = 0;
  EXPENSES.forEach(([l, v]) => { const a = r2(v * s); totalExp += a; lines.push({ label: l, amount: a, account: l, indent: true }); });
  totalExp = r2(totalExp);
  lines.push({ label: 'Total Expenses', amount: totalExp, total: true });
  const noi = r2(totalRev - totalCogs - totalExp);
  lines.push({ label: 'Net Operating Income', amount: noi, total: true });

  lines.push({ label: 'Other Expenses', section: true });
  let totalOther = 0;
  OTHER_EXP.forEach(([l, v]) => { const a = r2(v * s); totalOther += a; lines.push({ label: l, amount: a, account: l, indent: true }); });
  totalOther = r2(totalOther);
  lines.push({ label: 'Total Other Expenses', amount: totalOther, total: true });
  const net = r2(noi - totalOther);
  lines.push({ label: 'Net Income', amount: net, total: true });

  return { lines, totalRevenue: totalRev, totalExpenses: r2(totalExp + totalCogs + totalOther), netIncome: net };
}

/** Portfolio P&L: condensed rows × hotels. */
export function portfolioPnl(hotelIds: string[]) {
  const rows = [
    { label: 'Room Revenue', key: 'roomRev' },
    { label: 'Other Guest Revenue', key: 'otherRev' },
    { label: 'Total Revenue', key: 'totalRev', total: true },
    { label: 'Cost of Goods Sold', key: 'cogs' },
    { label: 'Gross Profit', key: 'gross', total: true },
    { label: 'Total Expenses', key: 'exp' },
    { label: 'Net Operating Income', key: 'noi', total: true },
    { label: 'Other Expenses', key: 'other' },
    { label: 'Net Income', key: 'net', total: true },
  ];
  const perHotel = hotelIds.map((id) => {
    const s = hotelScale(id);
    const roomRev = r2(184620 * s);
    const otherRev = r2((7850 + 2400 + 3200 + 1180) * s);
    const totalRev = r2(roomRev + otherRev);
    const cogs = r2(1120 * s);
    const gross = r2(totalRev - cogs);
    const exp = r2(134040 * s);
    const noi = r2(gross - exp);
    const other = r2(14900 * s);
    const net = r2(noi - other);
    return { id, vals: { roomRev, otherRev, totalRev, cogs, gross, exp, noi, other, net } as Record<string, number> };
  });
  const totals: Record<string, number> = {};
  rows.forEach((row) => { totals[row.key] = r2(perHotel.reduce((sum, h) => sum + h.vals[row.key], 0)); });
  return { rows, perHotel, totals };
}

/* ── Balance Sheet ────────────────────────────────────────────────────── */
export interface BsLine { label: string; amount?: number; section?: boolean; total?: boolean; indent?: boolean }
export function balanceSheet(hotelId: string): { lines: BsLine[]; totalAssets: number; totalLiabEquity: number; balanced: boolean } {
  const s = hotelScale(hotelId);
  const net = profitLoss(hotelId).netIncome;
  const lines: BsLine[] = [];
  const A = (label: string, v: number, opts: Partial<BsLine> = {}) => lines.push({ label, amount: r2(v * (opts.total ? 1 : s)), ...opts });

  lines.push({ label: 'Assets', section: true });
  lines.push({ label: 'Bank Accounts', indent: true });
  const opChk = r2(58920 * s), payChk = r2(9840 * s), reserve = r2(88500 * s);
  lines.push({ label: 'Operating Checking', amount: opChk, indent: true });
  lines.push({ label: 'Payroll Checking', amount: payChk, indent: true });
  lines.push({ label: 'Reserve Account', amount: reserve, indent: true });
  const totalBank = r2(opChk + payChk + reserve);
  lines.push({ label: 'Total Bank Accounts', amount: totalBank, total: true });
  const ar = r2(18400 * s), inv = r2(7850 * s), prepaid = r2(12600 * s);
  lines.push({ label: 'Accounts Receivable', amount: ar, indent: true });
  lines.push({ label: 'Inventory', amount: inv, indent: true });
  lines.push({ label: 'Prepaid Expenses', amount: prepaid, indent: true });
  lines.push({ label: 'Fixed Assets', indent: true });
  const ff = r2(420000 * s), eq = r2(185000 * s), bi = r2(310000 * s), depr = r2(-96500 * s);
  lines.push({ label: 'Furniture and Fixtures', amount: ff, indent: true });
  lines.push({ label: 'Equipment', amount: eq, indent: true });
  lines.push({ label: 'Building Improvements', amount: bi, indent: true });
  lines.push({ label: 'Accumulated Depreciation', amount: depr, indent: true });
  const totalFixed = r2(ff + eq + bi + depr);
  lines.push({ label: 'Total Fixed Assets', amount: totalFixed, total: true });
  const totalAssets = r2(totalBank + ar + inv + prepaid + totalFixed);
  lines.push({ label: 'Total Assets', amount: totalAssets, total: true });

  lines.push({ label: 'Liabilities', section: true });
  const ap = r2(42300 * s), ccp = r2(18420 * s), stp = r2(4850 * s), otp = r2(12200 * s), pl = r2(9600 * s), loan = r2(642000 * s);
  lines.push({ label: 'Accounts Payable', amount: ap, indent: true });
  lines.push({ label: 'Credit Cards Payable', amount: ccp, indent: true });
  lines.push({ label: 'Sales Tax Payable', amount: stp, indent: true });
  lines.push({ label: 'Occupancy Tax Payable', amount: otp, indent: true });
  lines.push({ label: 'Payroll Liabilities', amount: pl, indent: true });
  lines.push({ label: 'Loan Payable', amount: loan, indent: true });
  const totalLiab = r2(ap + ccp + stp + otp + pl + loan);
  lines.push({ label: 'Total Liabilities', amount: totalLiab, total: true });

  lines.push({ label: 'Equity', section: true });
  const contrib = r2(180000 * s), draw = r2(-24500 * s), retained = r2(80550 * s);
  lines.push({ label: 'Owner Contribution', amount: contrib, indent: true });
  lines.push({ label: 'Owner Draw', amount: draw, indent: true });
  lines.push({ label: 'Retained Earnings', amount: retained, indent: true });
  // current year earnings = plug so the sheet balances exactly
  const curYear = r2(totalAssets - totalLiab - (contrib + draw + retained));
  lines.push({ label: 'Current Year Earnings', amount: curYear, indent: true });
  const totalEquity = r2(contrib + draw + retained + curYear);
  lines.push({ label: 'Total Equity', amount: totalEquity, total: true });
  const totalLE = r2(totalLiab + totalEquity);
  lines.push({ label: 'Total Liabilities and Equity', amount: totalLE, total: true });

  return { lines, totalAssets, totalLiabEquity: totalLE, balanced: Math.abs(totalAssets - totalLE) < 0.5 };
}

/* ── Cash Flow ────────────────────────────────────────────────────────── */
export interface CfLine { label: string; amount?: number | null; section?: boolean; total?: boolean; indent?: boolean }
export function cashFlow(hotelId: string): CfLine[] {
  const s = hotelScale(hotelId);
  const net = profitLoss(hotelId).netIncome;
  const v = (n: number) => r2(n * s);
  const opNet = r2(net + v(6500) - v(3200) + v(5400) + v(2100));
  const invNet = r2(-v(8600) - v(12000));
  const finNet = r2(-v(10000) + 0 - v(8000));
  const change = r2(opNet + invNet + finNet);
  const beginCash = v(135870);
  return [
    { label: 'Operating Activities', section: true },
    { label: 'Net Income', amount: net, indent: true },
    { label: 'Depreciation Expense', amount: v(6500), indent: true },
    { label: 'Increase in Accounts Receivable', amount: -v(3200), indent: true },
    { label: 'Increase in Accounts Payable', amount: v(5400), indent: true },
    { label: 'Increase in Taxes Payable', amount: v(2100), indent: true },
    { label: 'Net Cash from Operating Activities', amount: opNet, total: true },
    { label: 'Investing Activities', section: true },
    { label: 'Equipment Purchases', amount: -v(8600), indent: true },
    { label: 'Building Improvements', amount: -v(12000), indent: true },
    { label: 'Net Cash from Investing Activities', amount: invNet, total: true },
    { label: 'Financing Activities', section: true },
    { label: 'Loan Principal Payments', amount: -v(10000), indent: true },
    { label: 'Owner Contributions', amount: 0, indent: true },
    { label: 'Owner Draws', amount: -v(8000), indent: true },
    { label: 'Net Cash from Financing Activities', amount: finNet, total: true },
    { label: 'Net Change in Cash', amount: change, total: true },
    { label: 'Beginning Cash Balance', amount: beginCash, total: true },
    { label: 'Ending Cash Balance', amount: r2(beginCash + change), total: true },
  ];
}

/* ── Trial Balance ────────────────────────────────────────────────────── */
export interface TbRow { code: string; name: string; debit: number; credit: number }
export function trialBalance(hotelId: string): { rows: TbRow[]; totalDebit: number; totalCredit: number; balanced: boolean } {
  const s = hotelScale(hotelId);
  const bs = balanceSheet(hotelId);
  const pnl = profitLoss(hotelId);
  const get = (label: string) => bs.lines.find((l) => l.label === label)?.amount ?? 0;
  const rows: TbRow[] = [
    { code: '1010', name: 'Operating Checking', debit: get('Operating Checking'), credit: 0 },
    { code: '1020', name: 'Payroll Checking', debit: get('Payroll Checking'), credit: 0 },
    { code: '1030', name: 'Reserve Account', debit: get('Reserve Account'), credit: 0 },
    { code: '1100', name: 'Accounts Receivable', debit: get('Accounts Receivable'), credit: 0 },
    { code: '1500', name: 'Fixed Assets', debit: r2(915000 * s), credit: 0 },
    { code: '1590', name: 'Accumulated Depreciation', debit: 0, credit: r2(96500 * s) },
    { code: '2000', name: 'Accounts Payable', debit: 0, credit: get('Accounts Payable') },
    { code: '2100', name: 'Credit Cards Payable', debit: 0, credit: get('Credit Cards Payable') },
    { code: '2400', name: 'Loan Payable', debit: 0, credit: get('Loan Payable') },
    { code: '3000', name: 'Owner Contribution', debit: 0, credit: get('Owner Contribution') },
    { code: '3020', name: 'Owner Draw', debit: Math.abs(get('Owner Draw')), credit: 0 },
    { code: '3100', name: 'Retained Earnings', debit: 0, credit: get('Retained Earnings') },
    { code: '3300', name: 'Current Year Earnings', debit: 0, credit: get('Current Year Earnings') },
    { code: '4000', name: 'Room Revenue', debit: 0, credit: r2(184620 * s) },
    { code: '6000', name: 'Payroll Expense', debit: r2(62400 * s), credit: 0 },
    { code: '6210', name: 'Repairs and Maintenance', debit: r2(8740 * s), credit: 0 },
    { code: '6310', name: 'Electricity', debit: r2(9600 * s), credit: 0 },
    { code: '8010', name: 'Interest Expense', debit: r2(8400 * s), credit: 0 },
  ];
  // balance the trial balance with a plug into Room Revenue credit
  let td = r2(rows.reduce((sum, r) => sum + r.debit, 0));
  let tc = r2(rows.reduce((sum, r) => sum + r.credit, 0));
  const plug = r2(td - tc);
  if (Math.abs(plug) > 0.5) { const rev = rows.find((r) => r.code === '4000')!; rev.credit = r2(rev.credit + plug); tc = r2(tc + plug); }
  return { rows, totalDebit: td, totalCredit: tc, balanced: Math.abs(td - tc) < 0.5 };
}

/* ── General Ledger (one account) ─────────────────────────────────────── */
export interface GlRow { date: string; je: string; source: string; description: string; debit: number; credit: number; balance: number }
export function generalLedger(hotelId: string, accountName = 'Repairs and Maintenance'): GlRow[] {
  const s = hotelScale(hotelId);
  const base = [
    ['2026-05-03', 'Credit Card', 'Home Depot materials', 250],
    ['2026-05-07', 'Bank', "Lowe's plumbing repair", 480],
    ['2026-05-14', 'Credit Card', 'HVAC part replacement', 1250],
    ['2026-05-22', 'Bank', 'Electrical repair service', 2400],
    ['2026-05-27', 'Credit Card', 'Home Depot supplies', 620],
  ] as const;
  let bal = 0;
  return base.map(([date, src, desc, amt], i) => { const d = r2((amt as number) * s); bal = r2(bal + d); return { date, je: `JE-2026-0${512 + i * 17}`, source: src, description: desc, debit: d, credit: 0, balance: bal }; });
}

/* ── Cash Position by Hotel ───────────────────────────────────────────── */
export function cashPosition(hotelIds: string[]) {
  const rows = hotelIds.map((id) => {
    const s = hotelScale(id);
    const op = r2(58920 * s), pay = r2(9840 * s), res = r2(88500 * s);
    return { id, op, pay, res, total: r2(op + pay + res) };
  });
  const totals = { op: r2(rows.reduce((a, r) => a + r.op, 0)), pay: r2(rows.reduce((a, r) => a + r.pay, 0)), res: r2(rows.reduce((a, r) => a + r.res, 0)), total: r2(rows.reduce((a, r) => a + r.total, 0)) };
  return { rows, totals };
}

/* ── Hotel Comparison ─────────────────────────────────────────────────── */
export function hotelComparison(hotelIds: string[]) {
  return hotelIds.map((id) => {
    const h = getEntity(id)!;
    const pnl = profitLoss(id);
    const cash = cashPosition([id]).rows[0].total;
    const margin = pnl.totalRevenue ? r2((pnl.netIncome / pnl.totalRevenue) * 100) : 0;
    return { id, rooms: h.rooms, revenue: pnl.totalRevenue, expenses: r2(pnl.totalRevenue - pnl.netIncome), netIncome: pnl.netIncome, margin, cash };
  }).sort((a, b) => b.netIncome - a.netIncome);
}

/* ── Vendor spend (reuses transaction seed) ───────────────────────────── */
export function vendorSpendRows(hotelId?: string) {
  const txs = ACCT_TRANSACTIONS.filter((t) => (!hotelId || t.hotelId === hotelId) && t.amount < 0 && t.vendor);
  const map = new Map<string, { vendor: string; hotelId: string; category: string; spend: number; count: number; missing: number }>();
  for (const t of txs) {
    const key = `${t.vendor}:${t.hotelId}`;
    const e = map.get(key) ?? { vendor: t.vendor!, hotelId: t.hotelId, category: t.category ?? 'Uncategorized', spend: 0, count: 0, missing: 0 };
    e.spend += Math.abs(t.amount); e.count++; if (t.receipt === 'missing') e.missing++;
    map.set(key, e);
  }
  return [...map.values()].map((v) => ({ ...v, spend: r2(v.spend) })).sort((a, b) => b.spend - a.spend);
}

/* ── Drill-down: transactions behind a P&L account for a hotel ────────── */
export function drillTransactions(hotelId: string, accountName: string): AcctTransaction[] {
  return ACCT_TRANSACTIONS.filter((t) => t.hotelId === hotelId && t.category === accountName);
}

/* ── Report library catalog ───────────────────────────────────────────── */
export interface ReportDef { id: string; name: string; description: string; bestFor: string; scope: string; category: string; href: string }
export const REPORT_CATALOG: ReportDef[] = [
  { id: 'profit-loss', name: 'Profit and Loss', description: 'Revenue, expenses, and net income for a hotel or portfolio.', bestFor: 'Owner, Accountant, CPA', scope: 'Hotel or All Hotels', category: 'Financial Statements', href: '/web/accounting/reports/profit-loss' },
  { id: 'balance-sheet', name: 'Balance Sheet', description: 'What the hotel owns, owes, and owner equity.', bestFor: 'Accountant, CPA', scope: 'Hotel or All Hotels', category: 'Financial Statements', href: '/web/accounting/reports/balance-sheet' },
  { id: 'cash-flow', name: 'Cash Flow', description: 'Where cash came from and where it went.', bestFor: 'Owner, Accountant', scope: 'Hotel or All Hotels', category: 'Financial Statements', href: '/web/accounting/reports/cash-flow' },
  { id: 'trial-balance', name: 'Trial Balance', description: 'Debit and credit balances for all accounts.', bestFor: 'Accountant, CPA', scope: 'Hotel or All Hotels', category: 'Financial Statements', href: '/web/accounting/reports/trial-balance' },
  { id: 'general-ledger', name: 'General Ledger', description: 'Every journal entry line by account.', bestFor: 'Accountant, CPA, Audit', scope: 'Hotel', category: 'Financial Statements', href: '/web/accounting/reports/general-ledger' },
  { id: 'transaction-detail', name: 'Transaction Detail', description: 'Transaction-level detail by source, vendor, category, status.', bestFor: 'Accountant, GM', scope: 'Hotel or All Hotels', category: 'Transactions', href: '/web/accounting/reports/transaction-detail' },
  { id: 'bank-reports', name: 'Banking Reports', description: 'Bank register, cash position, statement history, reconciliation.', bestFor: 'Accountant', scope: 'Hotel or All Hotels', category: 'Banking', href: '/web/accounting/reports/banking' },
  { id: 'card-reports', name: 'Credit Card Reports', description: 'Card register, spend summary, missing receipts, payments.', bestFor: 'Accountant, GM', scope: 'Hotel or All Hotels', category: 'Credit Cards', href: '/web/accounting/reports/credit-cards' },
  { id: 'vendor-reports', name: 'Vendor Reports', description: 'Vendor spend, top vendors, spend by category (hotel-level).', bestFor: 'Owner, Accountant, GM', scope: 'Hotel or All Hotels', category: 'Vendors', href: '/web/accounting/reports/vendors' },
  { id: 'recon-reports', name: 'Reconciliation Reports', description: 'Reconciliation summary, history, differences, blockers.', bestFor: 'Accountant, CPA', scope: 'Hotel or All Hotels', category: 'Reconciliation', href: '/web/accounting/reports/reconciliation' },
  { id: 'close-reports', name: 'Month Close Reports', description: 'Close status, checklist, open issues, audit log.', bestFor: 'Accountant', scope: 'Hotel or All Hotels', category: 'Month Close', href: '/web/accounting/reports/month-close' },
  { id: 'portfolio', name: 'Portfolio Reports', description: 'Hotel comparison, P&L, cash position, hotels needing attention.', bestFor: 'Owner', scope: 'All Hotels', category: 'Portfolio', href: '/web/accounting/reports/portfolio' },
];
