import { NextRequest } from 'next/server';
import { requireAdminSecret } from '@/lib/admin-guard';
import { db, getHosTenantId } from '@/lib/db/client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/users — admin-gated user roster with role + scope.
 *
 * Scope is derived: regional directors get their region name, GMs get the
 * hotel(s) they manage, others are portfolio-wide.
 */
export async function GET(req: NextRequest) {
  const guard = requireAdminSecret(req);
  if (guard) return guard;

  const tenantId = await getHosTenantId();
  if (!tenantId) return Response.json({ users: [] });

  const rows = await db<Array<{
    email: string;
    name: string | null;
    role: string;
    created_at: string;
    region_name: string | null;
    gm_hotels: string | null;
  }>>`
    select
      u.email,
      u.name,
      u.role,
      u.created_at,
      (
        select r.name from regions r
        where r.director_user_id = u.id
        limit 1
      )                                          as region_name,
      (
        select string_agg(h.short_name, ', ' order by h.short_name)
        from hotels h
        where h.gm_user_id = u.id
      )                                          as gm_hotels
    from users u
    where u.tenant_id = ${tenantId}
    order by
      case u.role
        when 'md' then 0
        when 'regional' then 1
        when 'gm' then 2
        else 3
      end,
      u.name
  `;

  const users = rows.map((r) => {
    let scope = 'Portfolio';
    if (r.role === 'regional' && r.region_name) scope = r.region_name;
    else if (r.role === 'gm' && r.gm_hotels) scope = r.gm_hotels;
    else if (r.role === 'staff') scope = 'Property';
    return {
      email: r.email,
      name: r.name ?? r.email,
      role: r.role,
      scope,
      createdAt: r.created_at,
    };
  });

  return Response.json({ users });
}
