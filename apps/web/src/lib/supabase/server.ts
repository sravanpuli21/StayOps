import 'server-only';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Server-only Supabase client. Uses the service_role key so it bypasses
 * Row Level Security. NEVER import this in a Client Component.
 *
 * For Phase 0 we pin every query to tenant_id='hos' manually; proper
 * tenant scoping via Clerk JWT + RLS comes in Phase 1.
 */
let _client: SupabaseClient | null = null;

export function supabaseServer(): SupabaseClient {
  if (_client) return _client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL');
  if (!serviceKey) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY');

  _client = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return _client;
}

/** Fetches the HOS tenant ID (the only tenant for Phase 0). Cached per request. */
let _tenantId: string | null = null;
export async function getHosTenantId(): Promise<string> {
  if (_tenantId) return _tenantId;
  const sb = supabaseServer();
  const { data, error } = await sb.from('tenants').select('id').eq('slug', 'hos').single();
  if (error) throw new Error(`tenants lookup failed: ${error.message}`);
  _tenantId = data.id;
  return data.id;
}
