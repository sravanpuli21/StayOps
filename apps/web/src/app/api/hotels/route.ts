import { NextRequest } from 'next/server';
import { supabaseServer, getHosTenantId } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest) {
  const sb = supabaseServer();
  const tenantId = await getHosTenantId();

  const { data, error } = await sb
    .from('hotels')
    .select('id, code, name, short_name, brand, city, state, total_rooms, region_id')
    .eq('tenant_id', tenantId)
    .order('code');

  if (error) return Response.json({ error: error.message }, { status: 500 });

  // Reshape to the Hotel type the frontend already uses (shortName/rooms, not short_name/total_rooms)
  const hotels = (data ?? []).map((h) => ({
    id: h.code,                  // frontend uses code as id (matches existing mock shape)
    code: h.code,
    name: h.name,
    shortName: h.short_name,
    rooms: h.total_rooms,
    brand: h.brand,
    city: h.city,
    state: h.state,
    _dbId: h.id,                 // keep uuid accessible for future queries
    _regionId: h.region_id,
  }));

  return Response.json({ hotels });
}
