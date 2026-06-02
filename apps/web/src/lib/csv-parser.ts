'use client';

import Papa from 'papaparse';
import type { Hotel, BankAccount } from '@hos/shared';

export interface ParsedCsvRow {
  /** Lower-cased keys → original cell text. */
  raw: Record<string, string>;
  date: string | null;        // ISO yyyy-mm-dd if recognized
  description: string;
  amount: number | null;
  balance: number | null;
  reference: string | null;
}

export interface ParsedCsv {
  headers: string[];
  rows: ParsedCsvRow[];
  detectedColumns: {
    date?: string;
    postDate?: string;
    description?: string;
    amount?: string;
    debit?: string;
    credit?: string;
    balance?: string;
    reference?: string;
  };
  rawRows: Array<Record<string, string>>;
}

const DATE_KEYS = ['date', 'transaction date', 'posting date', 'post date', 'transactiondate'];
const POST_DATE_KEYS = ['post date', 'posting date', 'posted'];
const DESC_KEYS = ['description', 'memo', 'name', 'narration', 'details', 'transaction'];
const AMOUNT_KEYS = ['amount', 'transaction amount'];
const DEBIT_KEYS = ['debit', 'withdrawal', 'paid out', 'amount debit'];
const CREDIT_KEYS = ['credit', 'deposit', 'paid in', 'amount credit'];
const BALANCE_KEYS = ['balance', 'running balance', 'ending balance'];
const REF_KEYS = ['reference', 'check number', 'check #', 'ref'];

function findColumn(headers: string[], candidates: string[]): string | undefined {
  const low = headers.map((h) => h.toLowerCase().trim());
  for (const c of candidates) {
    const idx = low.indexOf(c);
    if (idx >= 0) return headers[idx];
  }
  // Fuzzy: header that contains a candidate substring
  for (const c of candidates) {
    const idx = low.findIndex((h) => h.includes(c));
    if (idx >= 0) return headers[idx];
  }
  return undefined;
}

function normalizeDate(input: string | undefined): string | null {
  if (!input) return null;
  const s = input.trim();
  // ISO yyyy-mm-dd
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  // mm/dd/yyyy or m/d/yyyy
  const us = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})/);
  if (us) {
    const [, m, d, y] = us;
    const yy = y.length === 2 ? `20${y}` : y;
    return `${yy}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }
  // dd/mm/yyyy fallback (rare in US bank CSVs but supported)
  return null;
}

function parseAmount(input: string | undefined): number | null {
  if (!input) return null;
  let s = input.trim().replace(/,/g, '').replace(/\$/g, '');
  let neg = false;
  if (s.startsWith('(') && s.endsWith(')')) {
    s = s.slice(1, -1);
    neg = true;
  }
  const n = parseFloat(s);
  if (isNaN(n)) return null;
  return neg ? -Math.abs(n) : n;
}

export async function parseCsvFile(file: File): Promise<ParsedCsv> {
  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        try {
          const headers = result.meta.fields ?? [];
          const detected = {
            date:        findColumn(headers, DATE_KEYS),
            postDate:    findColumn(headers, POST_DATE_KEYS),
            description: findColumn(headers, DESC_KEYS),
            amount:      findColumn(headers, AMOUNT_KEYS),
            debit:       findColumn(headers, DEBIT_KEYS),
            credit:      findColumn(headers, CREDIT_KEYS),
            balance:     findColumn(headers, BALANCE_KEYS),
            reference:   findColumn(headers, REF_KEYS),
          };

          const rows: ParsedCsvRow[] = (result.data as Record<string, string>[]).map((rawRow) => {
            const raw: Record<string, string> = {};
            for (const k of Object.keys(rawRow)) raw[k.toLowerCase().trim()] = rawRow[k] ?? '';

            const date = normalizeDate(detected.date ? rawRow[detected.date] : undefined);
            const description = (detected.description ? rawRow[detected.description] : '') ?? '';
            let amount: number | null = null;
            if (detected.amount) {
              amount = parseAmount(rawRow[detected.amount]);
            } else if (detected.debit || detected.credit) {
              const d = parseAmount(detected.debit ? rawRow[detected.debit] : undefined);
              const c = parseAmount(detected.credit ? rawRow[detected.credit] : undefined);
              amount = (c ?? 0) - (d ?? 0);
              if (!d && !c) amount = null;
            }
            const balance = parseAmount(detected.balance ? rawRow[detected.balance] : undefined);
            const reference = detected.reference ? rawRow[detected.reference] ?? null : null;

            return { raw, date, description: description.trim(), amount, balance, reference };
          });

          resolve({
            headers,
            rows: rows.filter((r) => r.description || r.amount !== null),
            detectedColumns: detected,
            rawRows: result.data as Record<string, string>[],
          });
        } catch (e) {
          reject(e);
        }
      },
      error: reject,
    });
  });
}

// ---- Filename detection ---------------------------------------------------

export type DetectionConfidence = 'high' | 'medium' | 'low';

export interface FilenameDetection {
  hotel: { id: string; label: string } | null;
  bankName: string | null;
  accountType: 'operating' | 'reserve' | 'cc' | null;
  bankAccountId: string | null;
  month: string | null;          // 'YYYY-MM'
  fileType: 'bank' | 'cc' | 'unknown';
  confidence: DetectionConfidence;
  notes: string[];
}

const MONTH_MAP: Record<string, string> = {
  jan: '01', january: '01', feb: '02', february: '02', mar: '03', march: '03',
  apr: '04', april: '04', may: '05', jun: '06', june: '06',
  jul: '07', july: '07', aug: '08', august: '08', sep: '09', sept: '09', september: '09',
  oct: '10', october: '10', nov: '11', november: '11', dec: '12', december: '12',
};

export function detectFromFilename(
  filename: string,
  hotels: Hotel[],
  bankAccounts: BankAccount[],
): FilenameDetection {
  const stem = filename.toLowerCase().replace(/\.[^.]+$/, '');
  const tokens = stem.split(/[_\-\s\.]+/).filter(Boolean);
  const notes: string[] = [];

  let hotel: { id: string; label: string } | null = null;
  for (const h of hotels) {
    const aliases = [h.shortName, h.name, h.code, h.city].map((s) => s.toLowerCase());
    if (aliases.some((a) => a && stem.includes(a.replace(/\s+/g, '')))) {
      hotel = { id: h.id, label: h.shortName }; break;
    }
    if (aliases.some((a) => tokens.some((t) => a && a.includes(t) && t.length >= 4))) {
      hotel = { id: h.id, label: h.shortName }; break;
    }
  }

  const knownBanks = ['chase', 'wells fargo', 'wellsfargo', 'wells', 'amex', 'american express', 'bofa', 'bank of america', 'citi', 'citibank', 'truist'];
  const bankName = knownBanks.find((b) => stem.includes(b)) ?? null;

  let accountType: FilenameDetection['accountType'] = null;
  if (/(operating|checking|ops)/.test(stem)) accountType = 'operating';
  else if (/(reserve|ffe|ff&e|sweep)/.test(stem)) accountType = 'reserve';
  else if (/(amex|cc|credit\s*card|visa|mc\b|mastercard)/.test(stem)) accountType = 'cc';

  // Year + month
  const year = tokens.find((t) => /^20\d{2}$/.test(t)) ?? null;
  const monthToken = tokens.find((t) => MONTH_MAP[t]);
  const month = monthToken && year ? `${year}-${MONTH_MAP[monthToken]}` : null;

  // Bank account id — match within hotel's accounts by kind
  let bankAccountId: string | null = null;
  if (hotel && accountType) {
    const candidate = bankAccounts.find((b) => b.hotelId === hotel!.id && b.kind === accountType);
    if (candidate) bankAccountId = candidate.id;
  }

  // Confidence rollup
  let score = 0;
  if (hotel) score += 2;
  if (accountType) score += 1;
  if (bankName) score += 1;
  if (month) score += 1;
  let confidence: DetectionConfidence = 'low';
  if (score >= 4) confidence = 'high';
  else if (score >= 2) confidence = 'medium';

  if (!hotel) notes.push('Hotel could not be detected from filename — please pick one.');
  if (!month) notes.push('Statement month/year not found — pick a period.');
  if (!accountType) notes.push('Account type not detected (operating / reserve / cc).');

  return {
    hotel,
    bankName,
    accountType,
    bankAccountId,
    month,
    fileType: accountType === 'cc' ? 'cc' : accountType ? 'bank' : 'unknown',
    confidence,
    notes,
  };
}

// ---- Duplicate detection --------------------------------------------------

export interface DuplicateMatch {
  rowIndex: number;
  status: 'new' | 'possible-duplicate' | 'likely-duplicate';
  reasons: string[];
  matchedRowId?: string;
}

interface ExistingRow {
  id: string;
  hotelId: string;
  bankAccountId: string;
  dateIso: string;
  amount: number;
  description: string;
}

export function detectDuplicates(
  parsed: ParsedCsv,
  bankAccountId: string,
  hotelId: string,
  existing: ExistingRow[],
): DuplicateMatch[] {
  return parsed.rows.map((row, rowIndex) => {
    if (row.date == null || row.amount == null) {
      return { rowIndex, status: 'new', reasons: ['unparseable row'] };
    }
    const matches = existing.filter(
      (e) =>
        e.bankAccountId === bankAccountId &&
        e.hotelId === hotelId &&
        e.dateIso === row.date &&
        Math.abs(e.amount - row.amount!) < 0.01,
    );
    if (matches.length === 0) return { rowIndex, status: 'new', reasons: [] };
    const exact = matches.find((m) => m.description.toLowerCase().trim() === row.description.toLowerCase().trim());
    if (exact) {
      return { rowIndex, status: 'likely-duplicate', reasons: ['Same hotel, account, date, amount, and description.'], matchedRowId: exact.id };
    }
    return {
      rowIndex,
      status: 'possible-duplicate',
      reasons: [`Same hotel, account, date, amount — different description ("${matches[0].description}")`],
      matchedRowId: matches[0].id,
    };
  });
}
