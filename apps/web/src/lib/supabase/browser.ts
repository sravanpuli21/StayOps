'use client';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Browser Supabase client. Uses the public anon key. Subject to RLS.
 * Most reads in Phase 0 go through our Next.js API routes (server-side,
 * service_role) — this is here for future realtime subscriptions.
 */
let _client: SupabaseClient | null = null;

export function supabaseBrowser(): SupabaseClient {
  if (_client) return _client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  _client = createClient(url, anon);
  return _client;
}
