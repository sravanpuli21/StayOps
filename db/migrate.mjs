#!/usr/bin/env node
/**
 * StayOps DB migration runner.
 *
 * - Reads `db/migrations/*.sql` in lexical order
 * - Tracks applied filenames in a `_migrations` table
 * - Applies any not-yet-applied files inside a transaction each
 * - Uses DATABASE_URL_UNPOOLED (direct connection) — pooled connection
 *   doesn't support the multi-statement transactions migrations need
 *
 * Usage:
 *   node db/migrate.mjs              # apply pending migrations
 *   node db/migrate.mjs --status     # show applied/pending without running
 */
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import postgres from 'postgres';

const __dirname = dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = join(__dirname, 'migrations');

// Load .env.local if present (dev only) — production uses Vercel env injection.
async function loadDotenv() {
  try {
    const envPath = join(__dirname, '..', 'apps', 'web', '.env.local');
    const text = readFileSync(envPath, 'utf8');
    for (const line of text.split('\n')) {
      const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
    }
  } catch {
    /* missing .env.local is fine in CI/prod */
  }
}

await loadDotenv();

const DATABASE_URL = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('Missing DATABASE_URL_UNPOOLED (preferred) or DATABASE_URL');
  process.exit(1);
}

const sql = postgres(DATABASE_URL, { ssl: 'require', max: 1, prepare: false, idle_timeout: 5 });

await sql`
  create table if not exists _migrations (
    name        text primary key,
    applied_at  timestamptz not null default now()
  )
`;

const applied = new Set(
  (await sql`select name from _migrations order by name`).map((r) => r.name),
);

const files = readdirSync(MIGRATIONS_DIR)
  .filter((f) => f.endsWith('.sql'))
  .sort();

if (process.argv.includes('--status')) {
  console.log('Applied:');
  for (const a of applied) console.log(`  ✓ ${a}`);
  console.log('Pending:');
  for (const f of files) if (!applied.has(f)) console.log(`  · ${f}`);
  await sql.end();
  process.exit(0);
}

let runCount = 0;
for (const file of files) {
  if (applied.has(file)) continue;
  const body = readFileSync(join(MIGRATIONS_DIR, file), 'utf8');
  console.log(`→ applying ${file}`);
  try {
    await sql.begin(async (tx) => {
      await tx.unsafe(body);
      await tx`insert into _migrations (name) values (${file})`;
    });
    runCount++;
    console.log(`  ✓ ${file}`);
  } catch (err) {
    console.error(`  ✗ ${file}: ${err instanceof Error ? err.message : err}`);
    await sql.end();
    process.exit(1);
  }
}

if (runCount === 0) console.log('No pending migrations.');
else console.log(`Applied ${runCount} migration${runCount === 1 ? '' : 's'}.`);
await sql.end();
