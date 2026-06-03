import { NextRequest } from 'next/server';
import { requireAdminSecret } from '@/lib/admin-guard';
import { db, getHosTenantId } from '@/lib/db/client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/company — the management company (tenant) this admin console
 * belongs to, plus a portfolio rollup. Admin is single-tenant (HOS Management);
 * this surfaces the company identity the screens are already scoped to.
 */
export async function GET(req: NextRequest) {
  const guard = requireAdminSecret(req);
  if (guard) return guard;

  const tenantId = await getHosTenantId();
  if (!tenantId) return Response.json({ company: null });

  const [tenant] = await db<Array<{
    id: string; slug: string; name: string; plan: string; created_at: string;
  }>>`
    select id::text as id, slug, name, plan, created_at::text as created_at
      from tenants where id = ${tenantId} limit 1
  `;
  if (!tenant) return Response.json({ company: null });

  const [counts] = await db<Array<{ hotels: number; users: number; regions: number }>>`
    select
      (select count(*)::int from hotels  where tenant_id = ${tenantId}) as hotels,
      (select count(*)::int from users   where tenant_id = ${tenantId}) as users,
      (select count(*)::int from regions where tenant_id = ${tenantId}) as regions
  `;

  // States + brands footprint across the portfolio.
  const footprint = await db<Array<{ states: number; brands: number; rooms: number }>>`
    select
      count(distinct state)::int as states,
      count(distinct brand)::int as brands,
      coalesce(sum(total_rooms), 0)::int as rooms
      from hotels where tenant_id = ${tenantId}
  `;

  return Response.json({
    company: {
      id: tenant.id,
      slug: tenant.slug,
      name: tenant.name,
      plan: tenant.plan,
      createdAt: tenant.created_at,
      hotels: counts?.hotels ?? 0,
      users: counts?.users ?? 0,
      regions: counts?.regions ?? 0,
      states: footprint[0]?.states ?? 0,
      brands: footprint[0]?.brands ?? 0,
      rooms: footprint[0]?.rooms ?? 0,
    },
  });
}
