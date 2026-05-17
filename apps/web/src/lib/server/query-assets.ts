import 'server-only';
import { db, getHosTenantId } from '@/lib/db/client';

function parseJsonb<T>(raw: T | string): T {
  return typeof raw === 'string' ? (JSON.parse(raw) as T) : raw;
}

/**
 * `hotelCode`/`hotelCodes` semantics (tri-state across all helpers):
 *   null            → all hotels
 *   string / []     → that scope (or empty → return [])
 *   string[]>0      → restrict
 */
export async function queryAssets(
  hotelCode: string | null,
  category: string | null = null,
): Promise<Array<Record<string, unknown>>> {
  const tenantId = await getHosTenantId();
  if (!tenantId) return [];
  const rows = await db<{ data: unknown }[]>`
    select a.data from assets a
    join hotels h on h.id = a.hotel_id
    where h.tenant_id = ${tenantId}
      ${hotelCode ? db`and h.code = ${hotelCode}` : db``}
    order by a.legacy_id
  `;
  const all = rows.map((r) => parseJsonb<Record<string, unknown>>(r.data as never));
  return category ? all.filter((a) => (a as { category?: string }).category === category) : all;
}

export async function queryAssetSummaries(
  hotelCodes: string[] | null,
): Promise<Array<Record<string, unknown>>> {
  if (hotelCodes !== null && hotelCodes.length === 0) return [];
  const tenantId = await getHosTenantId();
  if (!tenantId) return [];
  const codeFilter = hotelCodes && hotelCodes.length > 0 ? hotelCodes : null;
  const rows = await db<{ data: unknown }[]>`
    select s.data from asset_hotel_summaries s
    join hotels h on h.id = s.hotel_id
    where h.tenant_id = ${tenantId}
      ${codeFilter ? db`and h.code = any(${codeFilter})` : db``}
    order by h.code
  `;
  return rows.map((r) => parseJsonb<Record<string, unknown>>(r.data as never));
}

export async function queryVendorSpends(): Promise<Array<Record<string, unknown>>> {
  const rows = await db<{ data: unknown }[]>`
    select data from vendor_spends order by legacy_id
  `;
  return rows.map((r) => parseJsonb<Record<string, unknown>>(r.data as never));
}
