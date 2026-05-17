import type { ParserDef, ParseInput, ParseResult } from './types';
import { hosDailyRevenueParser } from './hos-daily-revenue';
import { hosLabourParser } from './hos-labour';
import { stayopsAmPmCsvParser } from './stayops-am-pm-csv';
import { onqFinalAuditParser } from './onq-final-audit';
import { onqRoomDetailsParser } from './onq-room-details';
import { onqArrivalsParser } from './onq-arrivals';
import { onqHighBalanceParser } from './onq-high-balance';

/** Registered parsers. Add new ones here as brands come online. */
export const PARSERS: ParserDef[] = [
  // Hilton OnQ (Phase 2 — real PMS exports)
  onqFinalAuditParser,
  onqRoomDetailsParser,
  onqArrivalsParser,
  onqHighBalanceParser,
  // Legacy simplified CSVs (still useful for hand-crafted test files)
  hosDailyRevenueParser,
  hosLabourParser,
  stayopsAmPmCsvParser,
];

export interface ClassifyHints {
  subject?: string;
  filename?: string;
  senderEmail?: string;
}

/** Pick the best parser for an incoming file. Null = no match. */
export function classifyForParser(hints: ClassifyHints): ParserDef | null {
  const subject = hints.subject ?? '';
  const filename = hints.filename ?? '';
  const senderDomain = hints.senderEmail?.split('@')[1]?.toLowerCase() ?? '';

  let best: { score: number; parser: ParserDef | null } = { score: 0, parser: null };
  for (const p of PARSERS) {
    let score = 0;
    if (p.matchSubject && p.matchSubject.test(subject)) score += 2;
    if (p.matchFilename && p.matchFilename.test(filename)) score += 3;
    if (p.senderDomains && senderDomain && p.senderDomains.some((d) => senderDomain.endsWith(d))) score += 2;
    if (score > best.score) best = { score, parser: p };
  }
  return best.score > 0 ? best.parser : null;
}

export async function runParser(parser: ParserDef, input: ParseInput): Promise<ParseResult> {
  try {
    return await parser.parse(input);
  } catch (e) {
    return {
      warnings: [],
      errors: [`Parser ${parser.id} threw: ${e instanceof Error ? e.message : String(e)}`],
    };
  }
}
