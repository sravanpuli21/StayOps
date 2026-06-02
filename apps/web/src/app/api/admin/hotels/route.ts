import { NextRequest } from 'next/server';
import { requireAdminSecret } from '@/lib/admin-guard';
import { db, getHosTenantId } from '@/lib/db/client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/hotels — admin-gated hotel inventory with region + GM joins
 * and the latest ingested data date per property.
 */
export async function GET(req: NextRequest) {
  const guard = requireAdminSecret(req);
  if (guard) return guard;

  const tenantId = await getHosTenantId();
  if (!tenantId) return Response.json({ hotels: [] });

  const rows = await db<Array<{
    code: string;
    name: string;
    short_name: string;
    brand: string;
    city: string | null;
    state: string | null;
    total_rooms: number;
    pms: string | null;
    region_name: string | null;
    gm_name: string | null;
    market_adr: string | null;
    last_data_date: string | null;
  }>>`
    select
      h.code,
      h.name,
      h.short_name,
      h.brand,
      h.city,
      h.state,
      h.total_rooms,
      h.pms,
      r.name                       as region_name,
      u.name                       as gm_name,
      h.market_adr,
      (
        select max(dr.date)
        from daily_revenue dr
        where dr.hotel_id = h.id
      )                            as last_data_date
    from hotels h
    left join regions r on r.id = h.region_id
    left join users u   on u.id = h.gm_user_id
    where h.tenant_id = ${tenantId}
    order by h.code
  `;

  const hotels = rows.map((r) => ({
    code: r.code,
    name: r.name,
    shortName: r.short_name,
    brand: r.brand,
    city: r.city,
    state: r.state,
    rooms: r.total_rooms,
    pms: r.pms,
    region: r.region_name,
    gm: r.gm_name,
    marketAdr: r.market_adr ? Number(r.market_adr) : null,
    lastDataDate: r.last_data_date,
  }));

  return Response.json({ hotels });
}
