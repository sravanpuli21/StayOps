import { NextRequest } from 'next/server';
import { requireAdminSecret } from '@/lib/admin-guard';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/check — does the caller hold the admin secret?
 *
 * The admin landing page (/web/admin) hits this on submit. 401 means wrong
 * secret; 200 means the secret cookie/header matches.
 */
export async function GET(req: NextRequest) {
  const guard = requireAdminSecret(req);
  if (guard) return guard;
  return Response.json({ ok: true });
}
