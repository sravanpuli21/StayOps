import { NextRequest } from 'next/server';
import { requireAdminSecret } from '@/lib/admin-guard';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Lightweight auth-check for the admin gate. Just verifies the shared
 * secret matches — doesn't touch the database so it works even before
 * Supabase is seeded.
 */
export async function GET(req: NextRequest) {
  const guard = requireAdminSecret(req);
  if (guard) return guard;
  return Response.json({ ok: true });
}
