import 'server-only';
import postgres from 'postgres';

/**
 * Neon Postgres singleton. Uses the pooled (`-pooler` host, port 6543)
 * connection at runtime — Neon's pgBouncer requires `prepare: false`.
 *
 * Direct (unpooled) connection is reserved for migrations (db/migrate.mjs);
 * route handlers always use the pooled URL.
 *
 * `'server-only'` at top guarantees this never gets bundled into the client.
 */

declare global {
  // Reuse a single client across HMR reloads in dev, single instance across
  // function invocations on Vercel.
  // eslint-disable-next-line no-var
  var __stayopsDb: ReturnType<typeof postgres> | undefined;
}

function makeClient() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL env var is missing');
  return postgres(url, {
    ssl: 'require',
    prepare: false,
    max: 5,
    idle_timeout: 20,
    connect_timeout: 10,
  });
}

export const db: ReturnType<typeof postgres> =
  globalThis.__stayopsDb ?? (globalThis.__stayopsDb = makeClient());

let cachedTenantId: string | null = null;

/** Single-tenant helper: HOS Management is the only tenant in Phase 1. */
export async function getHosTenantId(): Promise<string> {
  if (cachedTenantId) return cachedTenantId;
  const rows = await db`select id from tenants where slug = 'hos' limit 1`;
  if (rows.length === 0) throw new Error("Tenant 'hos' not found — run db/seed.mjs");
  cachedTenantId = rows[0].id as string;
  return cachedTenantId;
}
