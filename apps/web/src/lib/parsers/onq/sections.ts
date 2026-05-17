/**
 * Hilton OnQ final-audit CSVs are multi-section: each section has its own
 * header row, sections are separated by blank lines, and each section
 * usually ends with a "totals" row whose first cell is empty.
 *
 * This helper splits a parsed CSV (array of string-cell rows) into typed
 * sections so individual parsers can dispatch by header.
 */

export interface OnqSection {
  /** First cell of the header row — 'Charge Type' | 'Tax Type' | 'Type' | 'Payment Method' | 'Ledger Name' | 'Name' */
  header: string;
  /** All columns of the header row, in order */
  headers: string[];
  /** Rows between this section's header and the next blank/header (excludes totals row by default — see hasTotals) */
  rows: string[][];
  /** The trailing totals row (first cell empty), if present */
  totals: string[] | null;
  /** Index in the original rows array where this section started */
  startIdx: number;
}

const KNOWN_HEADERS = new Set([
  'Charge Type',
  'Tax Type',
  'Type',
  'Payment Method',
  'Ledger Name',
  'Name',
]);

function isHeader(cell: string): boolean {
  return KNOWN_HEADERS.has(cell.trim());
}

function isBlankRow(row: string[]): boolean {
  return row.every((c) => c.trim() === '');
}

function isTotalsRow(row: string[]): boolean {
  // OnQ totals row: first cell empty, at least one numeric-looking cell elsewhere
  if (row[0] !== '' && row[0]?.trim() !== '') return false;
  return row.slice(1).some((c) => c.trim() !== '');
}

export function splitSections(rows: string[][]): OnqSection[] {
  const sections: OnqSection[] = [];
  let i = 0;

  while (i < rows.length) {
    const row = rows[i];

    // Skip blank rows
    if (isBlankRow(row)) {
      i++;
      continue;
    }

    // Section header detected?
    if (row.length > 0 && isHeader(row[0])) {
      const startIdx = i;
      const headers = row.slice();
      i++;

      const dataRows: string[][] = [];
      let totals: string[] | null = null;

      while (i < rows.length) {
        const next = rows[i];
        if (isBlankRow(next)) break;
        if (next.length > 0 && isHeader(next[0])) break; // next section starts without blank line
        if (isTotalsRow(next)) {
          totals = next;
          i++;
          break;
        }
        dataRows.push(next);
        i++;
      }

      sections.push({
        header: headers[0].trim(),
        headers,
        rows: dataRows,
        totals,
        startIdx,
      });
      continue;
    }

    // Stray non-header row outside any section — skip
    i++;
  }

  return sections;
}

/**
 * Find sections whose header matches the given label. Multiple sections can
 * share a header (e.g. final-audit has 3+ "Charge Type" sections and several
 * "Type" sections). Returned in document order.
 */
export function findSectionsByHeader(sections: OnqSection[], header: string): OnqSection[] {
  return sections.filter((s) => s.header === header);
}

/**
 * Find the first section whose data rows contain a specific label in column 0.
 * Used to dispatch the rollup "Type" section that contains 'Room Revenue' vs
 * the operational "Type" section that contains 'Stayover Rooms'.
 */
export function findSectionContaining(
  sections: OnqSection[],
  header: string,
  rowLabel: string,
): OnqSection | null {
  for (const s of sections) {
    if (s.header !== header) continue;
    if (s.rows.some((r) => r[0]?.trim().toUpperCase() === rowLabel.toUpperCase())) {
      return s;
    }
  }
  return null;
}
