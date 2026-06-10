/**
 * StayOps Accounting OS (v2) — Chart of Accounts helpers for the workbench.
 *
 * Every hotel is its own entity with its own COA. For V1 the structure is the
 * shared template applied per hotel; the picker filters/group accounts so the
 * accountant only sees accounts that make sense for the chosen resolution type.
 */
import { COA_TEMPLATE, type CoaTemplateAccount, type CoaFullType } from '@hos/shared/accounting-os';
import type { ResolutionType } from './_domain';

export interface CoaOption { code: string; name: string; type: CoaFullType; detailType: string; section: string }

/** All postable (non-header) accounts for a hotel. (Template is per-hotel in V1.) */
export function coaForHotel(_hotelId: string): CoaOption[] {
  return COA_TEMPLATE.filter((a) => !a.isHeader).map(toOption);
}
function toOption(a: CoaTemplateAccount): CoaOption {
  return { code: a.code, name: a.name, type: a.type, detailType: a.detailType, section: a.reportSection };
}

export const findAccount = (code?: string): CoaOption | undefined =>
  code ? COA_TEMPLATE.filter((a) => !a.isHeader).map(toOption).find((a) => a.code === code) : undefined;

/** Which account types are relevant for a resolution type / transaction type. */
export function relevantTypes(resolution: ResolutionType, txnType?: string): CoaFullType[] {
  switch (resolution) {
    case 'create-transaction':
      if (txnType === 'Revenue Deposit') return ['Revenue', 'Other Income', 'Asset'];
      if (txnType === 'Refund or Credit') return ['Expense', 'Other Income'];
      return ['Expense', 'COGS', 'Asset', 'Other Expense'];
    case 'tax-payment': return ['Liability'];
    case 'loan-payment': return ['Liability', 'Other Expense', 'Expense', 'Asset'];
    case 'owner-contribution':
    case 'owner-draw': return ['Equity'];
    case 'asset-purchase': return ['Asset'];
    case 'refund': return ['Expense', 'Other Income'];
    case 'transfer':
    case 'cc-payment': return ['Asset', 'Liability'];
    default: return ['Asset', 'Liability', 'Equity', 'Revenue', 'COGS', 'Expense', 'Other Income', 'Other Expense'];
  }
}

/** Grouped options for a <select> / picker, filtered to relevant types. */
export function groupedCoa(hotelId: string, resolution: ResolutionType, txnType?: string): { section: string; options: CoaOption[] }[] {
  const allow = relevantTypes(resolution, txnType);
  const opts = coaForHotel(hotelId).filter((o) => allow.includes(o.type));
  const sections = [...new Set(opts.map((o) => o.section))];
  return sections.map((section) => ({ section, options: opts.filter((o) => o.section === section) }));
}

/* Picker subsets keyed to specific resolution fields. */
export const liabilityAccounts = (h: string) => coaForHotel(h).filter((a) => a.type === 'Liability');
export const equityAccounts = (h: string) => coaForHotel(h).filter((a) => a.type === 'Equity');
export const assetAccounts = (h: string) => coaForHotel(h).filter((a) => a.type === 'Asset');
export const bankAccounts = (h: string) => coaForHotel(h).filter((a) => a.detailType === 'Bank');
export const taxAccounts = (h: string) => coaForHotel(h).filter((a) => /Tax Payable/i.test(a.detailType) || /Tax Payable/i.test(a.name));
export const loanAccounts = (h: string) => coaForHotel(h).filter((a) => a.detailType === 'Loan Payable');
export const ccPayableAccounts = (h: string) => coaForHotel(h).filter((a) => a.detailType === 'Credit Card');
