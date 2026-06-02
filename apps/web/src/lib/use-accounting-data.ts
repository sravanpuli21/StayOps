'use client';

import { useMemo } from 'react';
import {
  HOTELS, REGIONAL_ROSTER, resolveDateRange, type DateRangeKind,
  CHART_OF_ACCOUNTS, VENDORS, ALL_BANK_ACCOUNTS, BANK_IMPORT_ROWS, CC_IMPORT_ROWS,
  PAYROLL_IMPORT_ROWS, OTA_REMITTANCE_ROWS, LEDGER_TRANSACTIONS, BILLS, CATEGORY_RULES,
  SPLIT_PARENT_TRANSACTIONS, RECEIPTS, AUDIT_LOG, APPROVAL_REQUESTS, CLOSE_PERIODS,
  type Hotel,
} from '@hos/shared';
import { useHotelFilter } from './hotel-filter-context';
import { useDateFilter, DATE_RANGE_META } from './date-filter-context';
import { useAccountingDemo } from './accounting-demo-context';

function inWindow(iso: string, from: string, to: string): boolean {
  return iso >= from && iso <= to;
}

export function useAccountingData() {
  const { selection, viewerRegionalId } = useHotelFilter();
  const { range, customFrom, customTo } = useDateFilter();
  const { mode } = useAccountingDemo();
  const meta = DATE_RANGE_META[range];

  const selectedHotels: Hotel[] = useMemo(() => {
    if (selection.kind === 'my-territory' && viewerRegionalId) {
      const reg = REGIONAL_ROSTER.find((r) => r.id === viewerRegionalId);
      if (reg) return HOTELS.filter((h) => reg.hotelIds.includes(h.id));
    }
    if (selection.kind === 'regional') {
      const reg = REGIONAL_ROSTER.find((r) => r.id === selection.regionalId);
      if (reg) return HOTELS.filter((h) => reg.hotelIds.includes(h.id));
    }
    if (selection.kind === 'single') {
      const h = HOTELS.find((x) => x.id === selection.hotelId);
      if (h) return [h];
    }
    return HOTELS;
  }, [selection, viewerRegionalId]);

  const hotelIdSet = useMemo(() => new Set(selectedHotels.map((h) => h.id)), [selectedHotels]);

  const { from, to } = useMemo(() => {
    if (range === 'custom') {
      const f = customFrom || customTo;
      const t = customTo || customFrom;
      if (f && t) return { from: f, to: t };
    }
    const frozen = process.env.NEXT_PUBLIC_STAYOPS_FROZEN_TODAY;
    const today = frozen ? new Date(`${frozen}T00:00:00Z`) : new Date();
    const kind: DateRangeKind = range;
    return resolveDateRange(kind === 'custom' ? 'yesterday' : kind, today);
  }, [range, customFrom, customTo]);

  const isEmpty = mode === 'empty';

  const transactions = useMemo(() => {
    if (isEmpty) return [];
    const all = [...LEDGER_TRANSACTIONS, ...SPLIT_PARENT_TRANSACTIONS];
    return all.filter((t) => hotelIdSet.has(t.hotelId) && inWindow(t.dateIso, from, to))
      .sort((a, b) => (a.dateIso > b.dateIso ? -1 : 1));
  }, [hotelIdSet, from, to, isEmpty]);

  const bills = useMemo(() => {
    if (isEmpty) return [];
    return BILLS.filter((b) => hotelIdSet.has(b.hotelId));
  }, [hotelIdSet, isEmpty]);

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

  const bankAccounts = useMemo(() => {
    if (isEmpty) return [];
    return ALL_BANK_ACCOUNTS.filter(
      (b) => b.hotelId === 'CONSOLIDATED' || hotelIdSet.has(b.hotelId as string),
    );
  }, [hotelIdSet, isEmpty]);

  const scopeLabel = useMemo(() => {
    if (selection.kind === 'my-territory' && viewerRegionalId) {
      const reg = REGIONAL_ROSTER.find((r) => r.id === viewerRegionalId);
      if (reg) return `${reg.name.split(' ')[0]}'s Region`;
    }
    if (selection.kind === 'regional') {
      const reg = REGIONAL_ROSTER.find((r) => r.id === selection.regionalId);
      if (reg) return `${reg.name.split(' ')[0]}'s Region`;
    }
    if (selection.kind === 'single' && selectedHotels[0]) return selectedHotels[0].shortName;
    return 'Portfolio';
  }, [selection, viewerRegionalId, selectedHotels]);

  const scopeSub = useMemo(() => {
    const hotelText = selectedHotels.length === HOTELS.length
      ? `All ${HOTELS.length} Hotels`
      : `${selectedHotels.length} Hotel${selectedHotels.length === 1 ? '' : 's'}`;
    return `${meta.label} · ${hotelText}`;
  }, [selectedHotels, meta.label]);

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
    () => (isEmpty ? [] : AUDIT_LOG.filter((e) => !e.hotelId || hotelIdSet.has(e.hotelId))),
    [hotelIdSet, isEmpty],
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
    selection,
    period,
    range,
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
