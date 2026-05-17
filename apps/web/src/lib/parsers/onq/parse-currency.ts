/**
 * Parse Hilton OnQ cell values into numbers.
 *
 * Handles:
 *   "$29,095.07"  → 29095.07
 *   "($83.15)"    → -83.15      (accounting-style negative)
 *   "$0.00"       → 0
 *   "100"         → 100         (bare integer)
 *   "84.81"       → 84.81       (bare decimal)
 *   "1,575"       → 1575        (thousands grouping)
 *   ""            → null
 *   "  "          → null
 *   undefined     → null
 *
 * Returns null for unparseable input so callers can decide whether to default
 * to 0 or emit a parse warning.
 */
export function parseOnqNumber(input: unknown): number | null {
  if (input == null) return null;
  const raw = String(input).trim();
  if (raw === '') return null;

  const isNeg = /^\(.*\)$/.test(raw);
  // Strip currency symbol, commas, parentheses, whitespace
  const cleaned = raw.replace(/[$,()\s%]/g, '');
  if (cleaned === '' || cleaned === '-') return null;

  const n = Number(cleaned);
  if (!Number.isFinite(n)) return null;
  return isNeg ? -n : n;
}

/** Like parseOnqNumber but returns 0 for null. Useful when 0 is semantically equivalent to "no data". */
export function parseOnqNumberOrZero(input: unknown): number {
  return parseOnqNumber(input) ?? 0;
}
