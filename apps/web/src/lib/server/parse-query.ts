import 'server-only';
import type { NextRequest } from 'next/server';

/**
 * Reads `hotelIds` from the query string. Three states are distinguished:
 *
 *   absent param      (`?from=...&to=...`)             → null   → "all hotels"
 *   explicit empty    (`?hotelIds=&from=...&to=...`)   → []     → no hotels (rows: [])
 *   explicit values   (`?hotelIds=BTRCI,SAVMD&...`)    → string[] → that scope
 *
 * This contract matches the spec: `?hotelIds=` (empty value) returns rows: [],
 * NOT all hotels.
 */
export function readHotelIds(req: NextRequest): string[] | null {
  const sp = req.nextUrl.searchParams;
  const all = sp.getAll('hotelIds');
  if (all.length > 1) return all.flatMap((s) => s.split(',')).filter(Boolean);
  if (!sp.has('hotelIds')) return null;
  const single = sp.get('hotelIds') ?? '';
  if (single === '') return [];
  return single.split(',').map((s) => s.trim()).filter(Boolean);
}

export function readString(req: NextRequest, key: string): string | null {
  return req.nextUrl.searchParams.get(key);
}
