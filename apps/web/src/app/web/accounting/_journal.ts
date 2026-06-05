import type { AcctTransaction } from '@hos/shared/accounting-os';
import type { JournalLine, SplitLine } from './_store';

/**
 * Build a balanced journal entry for a transaction. Total debits must equal
 * total credits. Bank/cash account names follow the COA.
 *
 *  Expense (bank, money out):  Dr <category>      Cr Operating Checking
 *  Expense (credit card):      Dr <category>      Cr Credit Cards Payable
 *  Revenue deposit (money in): Dr Operating Checking   Cr <category/Room Revenue>
 */
export function buildJournal(tx: AcctTransaction, opts: { splits?: SplitLine[]; cashAccount?: string } = {}): JournalLine[] {
  const amt = Math.abs(tx.amount);
  const cash = opts.cashAccount ?? (tx.source === 'credit-card' ? 'Credit Cards Payable' : 'Operating Checking');
  const moneyIn = tx.amount > 0;

  // Split case (expenses only): each split debits its category; cash credited for total.
  if (opts.splits && opts.splits.length > 0 && !moneyIn) {
    const lines: JournalLine[] = opts.splits.map((s) => ({ account: s.category, debit: round(s.amount), credit: 0, memo: s.memo }));
    lines.push({ account: cash, debit: 0, credit: round(amt) });
    return lines;
  }

  const category = tx.category ?? (moneyIn ? 'Room Revenue' : 'Office Supplies');
  if (moneyIn) {
    return [
      { account: cash, debit: round(amt), credit: 0 },
      { account: category, debit: 0, credit: round(amt) },
    ];
  }
  return [
    { account: category, debit: round(amt), credit: 0 },
    { account: cash, debit: 0, credit: round(amt) },
  ];
}

export function journalBalanced(lines: JournalLine[]): boolean {
  const d = lines.reduce((s, l) => s + l.debit, 0);
  const c = lines.reduce((s, l) => s + l.credit, 0);
  return Math.abs(d - c) < 0.005;
}

function round(n: number) { return Math.round(n * 100) / 100; }
