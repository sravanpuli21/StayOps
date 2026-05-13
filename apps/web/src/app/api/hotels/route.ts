import { NextResponse } from 'next/server';
import { GetHotelsResponseSchema } from '@hos/shared';
import { db, getHosTenantId } from '@/lib/db/client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const tenantId = await getHosTenantId();
  const rows = await db<Array<{
    code: string; name: string; short_name: string;
    total_rooms: number; brand: string; city: string; state: string;
  }>>`
    select code, name, short_name, total_rooms, brand, city, state
    from hotels
    where tenant_id = ${tenantId}
    order by code
  `;
  const hotels = rows.map((r) => ({
    id:        r.code,
    code:      r.code,
    name:      r.name,
    shortName: r.short_name,
    rooms:     r.total_rooms,
    brand:     r.brand as 'Hilton' | 'Marriott' | 'Choice' | 'IHG' | 'Wyndham',
    city:      r.city,
    state:     r.state,
  }));
  const body = GetHotelsResponseSchema.parse({ hotels });
  return NextResponse.json(body);
}
