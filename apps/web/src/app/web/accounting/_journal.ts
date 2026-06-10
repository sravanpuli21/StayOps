/**
 * StayOps Accounting OS (v2) — journal entry builder.
 *
 * Every posted statement line becomes a BALANCED journal entry: total debits ==
 * total credits. The builder takes a coding decision (resolution type + fields)
 * and the statement line, and returns the journal lines + a one-line plain-English
 * explanation. The workbench refuses to post anything that isn't balanced.
 */
import { CODE, type ResolutionType, type Dept } from './_domain';

export interface JLine { account: string; code?: string; debit: number; credit: number; memo?: string }

export interface CodingInput {
  resolution: ResolutionType;
  amount: number;            // absolute value of the statement line
  direction: 'in' | 'out';
  statementType: 'bank' | 'credit-card';
  sourceAccountName: string;       // e.g. "Operating Checking" / "Corporate Card"
  sourceAccountCode: string;
  // create-transaction
  categoryName?: string;
  categoryCode?: string;
  // transfer
  fromAccountName?: string; fromCode?: string;
  toAccountName?: string; toCode?: string;
  // cc-payment
  cardPayableName?: string; cardPayableCode?: string;
  // split
  splits?: { categoryName: string; categoryCode?: string; department?: Dept; amount: number; memo?: string }[];
  // owner
  ownerEquityName?: string; ownerEquityCode?: string;
  // loan
  principal?: number; interest?: number; fees?: number; escrow?: number;
  loanAccountName?: string; loanCode?: string;
  // tax
  taxLiabilityName?: string; taxLiabilityCode?: string;
  // asset
  assetAccountName?: string; assetCode?: string;
  // refund
  originalCategoryName?: string; originalCategoryCode?: string;
  memo?: string;
}

const r2 = (n: number) => Math.round(n * 100) / 100;

/** The cash/card account that the statement itself represents. */
function sourceLine(input: CodingInput, side: 'debit' | 'credit', amount: number): JLine {
  return { account: input.sourceAccountName, code: input.sourceAccountCode, debit: side === 'debit' ? r2(amount) : 0, credit: side === 'credit' ? r2(amount) : 0 };
}

export interface BuiltJournal { lines: JLine[]; explanation: string; nonPosting?: boolean }

export function buildJournal(input: CodingInput): BuiltJournal {
  const amt = Math.abs(input.amount);
  const src = input.sourceAccountName;

  switch (input.resolution) {
    case 'create-transaction': {
      const cat = input.categoryName ?? (input.direction === 'in' ? 'Room Revenue' : 'Office Supplies');
      const catCode = input.categoryCode;
      if (input.direction === 'in') {
        // Revenue deposit / credit-card credit
        if (input.statementType === 'credit-card') {
          return { lines: [src2(input, 'debit', amt, input.cardPayableName ?? src, input.cardPayableCode ?? input.sourceAccountCode), { account: cat, code: catCode, debit: 0, credit: r2(amt) }], explanation: `Debit ${input.cardPayableName ?? src}, credit ${cat}.` };
        }
        return { lines: [sourceLine(input, 'debit', amt), { account: cat, code: catCode, debit: 0, credit: r2(amt) }], explanation: `Debit ${src}, credit ${cat}.` };
      }
      // money out: expense / fee / payroll / card charge
      return { lines: [{ account: cat, code: catCode, debit: r2(amt), credit: 0 }, sourceLine(input, 'credit', amt)], explanation: `Debit ${cat}, credit ${src}.` };
    }

    case 'match-existing':
      return { lines: [], nonPosting: true, explanation: 'Line will be matched to an existing transaction — no new journal entry is created.' };

    case 'transfer': {
      const to = input.toAccountName ?? 'Reserve Account';
      const from = input.fromAccountName ?? src;
      return {
        lines: [{ account: to, code: input.toCode, debit: r2(amt), credit: 0 }, { account: from, code: input.fromCode ?? input.sourceAccountCode, debit: 0, credit: r2(amt) }],
        explanation: `Debit ${to} (receiving), credit ${from} (sending). No P&L impact.`,
      };
    }

    case 'cc-payment': {
      const cc = input.cardPayableName ?? 'Credit Cards Payable';
      return {
        lines: [{ account: cc, code: input.cardPayableCode ?? CODE.ccPayable, debit: r2(amt), credit: 0 }, sourceLine(input, 'credit', amt)],
        explanation: `Debit ${cc}, credit ${src}. A credit-card payment is NOT an expense.`,
      };
    }

    case 'split': {
      const splits = input.splits ?? [];
      const total = r2(splits.reduce((s, x) => s + x.amount, 0));
      const lines: JLine[] = splits.map((x) => ({ account: x.categoryName, code: x.categoryCode, debit: r2(x.amount), credit: 0, memo: x.memo }));
      lines.push(input.statementType === 'credit-card'
        ? { account: input.cardPayableName ?? 'Credit Cards Payable', code: input.cardPayableCode ?? CODE.ccPayable, debit: 0, credit: total }
        : sourceLine(input, 'credit', total));
      return { lines, explanation: `${splits.length} categories debited; ${input.statementType === 'credit-card' ? 'Credit Cards Payable' : src} credited for the total.` };
    }

    case 'owner-contribution':
      return { lines: [sourceLine(input, 'debit', amt), { account: input.ownerEquityName ?? 'Owner Contribution', code: input.ownerEquityCode ?? CODE.ownerContribution, debit: 0, credit: r2(amt) }], explanation: `Debit ${src}, credit Owner Contribution (equity).` };

    case 'owner-draw':
      return { lines: [{ account: input.ownerEquityName ?? 'Owner Draw', code: input.ownerEquityCode ?? CODE.ownerDraw, debit: r2(amt), credit: 0 }, sourceLine(input, 'credit', amt)], explanation: `Debit Owner Draw (equity), credit ${src}.` };

    case 'loan-payment': {
      const principal = r2(input.principal ?? 0);
      const interest = r2(input.interest ?? 0);
      const fees = r2(input.fees ?? 0);
      const escrow = r2(input.escrow ?? 0);
      const lines: JLine[] = [];
      if (principal > 0) lines.push({ account: input.loanAccountName ?? 'Loan Payable', code: input.loanCode ?? CODE.loanPayable, debit: principal, credit: 0 });
      if (interest > 0) lines.push({ account: 'Interest Expense', code: CODE.interest, debit: interest, credit: 0 });
      if (fees > 0) lines.push({ account: 'Bank Fees', code: CODE.bankFees, debit: fees, credit: 0 });
      if (escrow > 0) lines.push({ account: 'Prepaid Insurance', code: '1310', debit: escrow, credit: 0 });
      lines.push(sourceLine(input, 'credit', amt));
      return { lines, explanation: `Principal reduces the loan; interest/fees hit expense; ${src} credited for the full payment.` };
    }

    case 'tax-payment':
      return { lines: [{ account: input.taxLiabilityName ?? 'Occupancy Tax Payable', code: input.taxLiabilityCode ?? CODE.occTax, debit: r2(amt), credit: 0 }, sourceLine(input, 'credit', amt)], explanation: `Debit ${input.taxLiabilityName ?? 'tax payable'}, credit ${src}. Clears a liability — not an expense.` };

    case 'asset-purchase':
      return input.statementType === 'credit-card'
        ? { lines: [{ account: input.assetAccountName ?? 'Equipment', code: input.assetCode ?? CODE.equipment, debit: r2(amt), credit: 0 }, { account: input.cardPayableName ?? 'Credit Cards Payable', code: input.cardPayableCode ?? CODE.ccPayable, debit: 0, credit: r2(amt) }], explanation: `Capitalize to ${input.assetAccountName ?? 'a fixed asset'}, credit Credit Cards Payable.` }
        : { lines: [{ account: input.assetAccountName ?? 'Equipment', code: input.assetCode ?? CODE.equipment, debit: r2(amt), credit: 0 }, sourceLine(input, 'credit', amt)], explanation: `Capitalize to ${input.assetAccountName ?? 'a fixed asset'}, credit ${src}.` };

    case 'refund': {
      const cat = input.originalCategoryName ?? 'Vendor Refunds';
      const catCode = input.originalCategoryCode ?? CODE.vendorRefund;
      return input.statementType === 'credit-card'
        ? { lines: [{ account: input.cardPayableName ?? 'Credit Cards Payable', code: input.cardPayableCode ?? CODE.ccPayable, debit: r2(amt), credit: 0 }, { account: cat, code: catCode, debit: 0, credit: r2(amt) }], explanation: `Debit Credit Cards Payable, credit ${cat}.` }
        : { lines: [sourceLine(input, 'debit', amt), { account: cat, code: catCode, debit: 0, credit: r2(amt) }], explanation: `Debit ${src}, credit ${cat} (reverses the original expense).` };
    }

    case 'duplicate':
      return { lines: [], nonPosting: true, explanation: 'Excluded — no journal entry is created. The line stays in the audit trail.' };

    case 'timing-difference':
      return { lines: [], nonPosting: true, explanation: 'Carried as a reconciling item — no journal entry. Do not duplicate the transaction.' };

    case 'needs-investigation':
      return { lines: [], nonPosting: true, explanation: 'Parked for investigation — cannot post until resolved.' };
  }
}

function src2(input: CodingInput, side: 'debit' | 'credit', amount: number, name: string, code: string): JLine {
  return { account: name, code, debit: side === 'debit' ? r2(amount) : 0, credit: side === 'credit' ? r2(amount) : 0 };
}

export function journalTotals(lines: JLine[]) {
  const debit = r2(lines.reduce((s, l) => s + l.debit, 0));
  const credit = r2(lines.reduce((s, l) => s + l.credit, 0));
  return { debit, credit, difference: r2(debit - credit), balanced: Math.abs(debit - credit) < 0.005 && lines.length > 0 };
}
