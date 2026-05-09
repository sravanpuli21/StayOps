import 'server-only';
import { NextRequest } from 'next/server';

/**
 * Phase 0 admin route guard. Compares the x-admin-secret header against
 * ADMIN_SHARED_SECRET env var. Returns null if OK, a Response if blocked.
 *
 * Replaced by Clerk role gating in Phase 1.
 */
export function requireAdminSecret(req: NextRequest): Response | null {
  const expected = process.env.ADMIN_SHARED_SECRET;
  if (!expected) return Response.json({ error: 'admin gating not configured' }, { status: 500 });
  const provided =
    req.headers.get('x-admin-secret') ??
    req.nextUrl.searchParams.get('admin_secret') ??
    req.cookies.get('stayops_admin')?.value ??
    null;
  if (provided !== expected) {
    return Response.json({ error: 'unauthorized' }, { status: 401 });
  }
  return null;
}
