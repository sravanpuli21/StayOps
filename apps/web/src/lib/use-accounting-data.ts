'use client';

import { useMemo } from 'react';
import {
  HOTELS,
  CHART_OF_ACCOUNTS, VENDORS, ALL_BANK_ACCOUNTS, BANK_IMPORT_ROWS, CC_IMPORT_ROWS,
  PAYROLL_IMPORT_ROWS, OTA_REMITTANCE_ROWS, LEDGER_TRANSACTIONS, BILLS, CATEGORY_RULES,
  SPLIT_PARENT_TRANSACTIONS, RECEIPTS, AUDIT_LOG, APPROVAL_REQUESTS, CLOSE_PERIODS,
  periodsForHotel,
  type Hotel, type Bill, type LedgerTransaction,
} from '@hos/shared';
import { useAccountingScope } from './accounting-scope-context';
import { useAccountingDemo } from './accounting-demo-context';
import { useAccountingState } from './accounting-store';

function inWindow(iso: string, from: string, to: string): boolean {
  return iso >= from && iso <= to;
}

export function useAccountingData() {
  const { hotelId, periodEndIso } = useAccountingScope();
  const { mode } = useAccountingDemo();
  const overrides = useAccountingState();

  // Single hotel = single entity. No collective/portfolio view here.
  const selectedHotels: Hotel[] = useMemo(() => {
    const h = HOTELS.find((x) => x.id === hotelId);
    return h ? [h] : [HOTELS[0]];
  }, [hotelId]);

  const hotelIdSet = useMemo(() => new Set(selectedHotels.map((h) => h.id)), [selectedHotels]);

  // Period window = the statement month, keyed off its closing date.
  const periodMeta = useMemo(() => {
    const ps = periodsForHotel(hotelId);
    return ps.find((p) => p.periodEndIso === periodEndIso) ?? ps[0];
  }, [hotelId, periodEndIso]);
  const from = periodMeta.periodStartIso;
  const to = periodMeta.periodEndIso;
  const meta = { label: periodMeta.label };

  const isEmpty = mode === 'empty';

  const transactions = useMemo(() => {
    if (isEmpty) return [];
    const all = [...LEDGER_TRANSACTIONS, ...SPLIT_PARENT_TRANSACTIONS];
    return all
      .filter((t) => hotelIdSet.has(t.hotelId) && inWindow(t.dateIso, from, to))
      // Apply the accountant's categorization overrides.
      .map((t): LedgerTransaction => {
        const o = overrides.txOverrides[t.id];
        return o ? { ...t, accountId: o.accountId, aiSuggested: false, ruleId: null } : t;
      })
      .sort((a, b) => (a.dateIso > b.dateIso ? -1 : 1));
  }, [hotelIdSet, from, to, isEmpty, overrides.txOverrides]);

  const bills = useMemo(() => {
    if (isEmpty) return [];
    return BILLS.filter((b) => hotelIdSet.has(b.hotelId)).map((b): Bill => {
      const o = overrides.billOverrides[b.id];
      return o ? { ...b, status: o.status, paidIso: o.paidIso } : b;
    });
  }, [hotelIdSet, isEmpty, overrides.billOverrides]);

  const bankRows = useMemo(() => {
    if (isEmpty) return [];
    return BANK_IMPORT_ROWS.filter((r) => hotelIdSet.has(r.hotelId) && inWindow(r.dateIso, from, to));
  }, [hotelIdSet, from, to, isEmpty]);

  const ccRows = useMemo(() => {
    if (isEmpty) return [];
    return CC_IMPORT_ROWS.filter((r) => hotelIdSet.has(r.hotelId) && inWindow(r.dateIso, from, to));
  }, [hotelIdSet, from, to, isEmpty]);

  const payrollRows = useMemo(() => {
    if (isEmpty) return [];
    return PAYROLL_IMPORT_ROWS.filter((r) => hotelIdSet.has(r.hotelId) && inWindow(r.periodEndIso, from, to));
  }, [hotelIdSet, from, to, isEmpty]);

  const otaRows = useMemo(() => {
    if (isEmpty) return [];
    return OTA_REMITTANCE_ROWS.filter((r) => hotelIdSet.has(r.hotelId) && inWindow(r.dateIso, from, to));
  }, [hotelIdSet, from, to, isEmpty]);

  // Single entity only — never the CONSOLIDATED pseudo-account.
  const bankAccounts = useMemo(() => {
    if (isEmpty) return [];
    return ALL_BANK_ACCOUNTS.filter((b) => hotelIdSet.has(b.hotelId as string));
  }, [hotelIdSet, isEmpty]);

  const scopeLabel = useMemo(() => selectedHotels[0]?.shortName ?? 'Hotel', [selectedHotels]);

  const scopeSub = useMemo(() => `${meta.label} · close ${periodMeta.periodEndIso}`, [meta.label, periodMeta.periodEndIso]);

  // Aggregates
  const cashByAccount = useMemo(() => bankAccounts.map((b) => ({ id: b.id, name: b.name, balance: b.bookBalance, kind: b.kind })), [bankAccounts]);
  const totalCash = useMemo(() => bankAccounts.filter((b) => b.kind === 'operating' && b.hotelId !== 'CONSOLIDATED').reduce((s, b) => s + b.bookBalance, 0), [bankAccounts]);
  const apOpen = useMemo(() => bills.filter((b) => b.status === 'open').reduce((s, b) => s + b.amount, 0), [bills]);
  const apOverdue = useMemo(() => bills.filter((b) => b.status === 'overdue').reduce((s, b) => s + b.amount, 0), [bills]);
  const unreconciledCount = useMemo(
    () => bankRows.filter((r) => !r.matchedTxId).length + ccRows.filter((r) => !r.matchedTxId).length + otaRows.filter((r) => !r.matchedTxId).length,
    [bankRows, ccRows, otaRows],
  );
  const uncategorizedCount = unreconciledCount;

  const period = { ...meta, from, to };

  const receipts = useMemo(
    () => (isEmpty ? [] : RECEIPTS.filter((r) => hotelIdSet.has(r.hotelId))),
    [hotelIdSet, isEmpty],
  );
  const auditLog = useMemo(
    () => {
      if (isEmpty) return overrides.audit.filter((e) => e.hotelId && hotelIdSet.has(e.hotelId));
      const seeded = AUDIT_LOG.filter((e) => !e.hotelId || hotelIdSet.has(e.hotelId));
      const session = overrides.audit.filter((e) => e.hotelId && hotelIdSet.has(e.hotelId));
      return [...session, ...seeded];
    },
    [hotelIdSet, isEmpty, overrides.audit],
  );
  const approvals = useMemo(
    () => (isEmpty ? [] : APPROVAL_REQUESTS.filter((a) => hotelIdSet.has(a.hotelId))),
    [hotelIdSet, isEmpty],
  );
  const closePeriods = useMemo(
    () => (isEmpty ? [] : CLOSE_PERIODS.filter((c) => hotelIdSet.has(c.hotelId))),
    [hotelIdSet, isEmpty],
  );

  return {
    mode,
    hotelId,
    periodEndIso,
    period,
    hotels: selectedHotels,
    hotelIdSet,
    scopeLabel,
    scopeSub,
    coa: CHART_OF_ACCOUNTS,
    vendors: VENDORS,
    rules: CATEGORY_RULES,
    bankAccounts,
    bankRows,
    ccRows,
    payrollRows,
    otaRows,
    transactions,
    bills,
    receipts,
    auditLog,
    approvals,
    closePeriods,
    cashByAccount,
    totalCash,
    apOpen,
    apOverdue,
    unreconciledCount,
    uncategorizedCount,
  };
}
