import 'server-only';
import { db } from '@/lib/db/client';

/**
 * Single-employee record fetcher. Reads `employee_records.data` (JSONB) by
 * (email, record_type). Falls back to a default if the row is missing —
 * keeps the dashboard non-empty even before the front-desk import lands.
 */
const SRAVAN_EMAIL = 'sravan@hos.com';

export type SravanRecordType =
  | 'profile' | 'schedule' | 'clock_log' | 'availability'
  | 'paystubs' | 'bonuses' | 'colleagues' | 'open_shifts'
  | 'swap_requests' | 'sops';

export async function querySravanRecord<T>(recordType: SravanRecordType, fallback: T): Promise<T> {
  const rows = await db<{ data: T | string }[]>`
    select data from employee_records
    where employee_email = ${SRAVAN_EMAIL} and record_type = ${recordType}
    limit 1
  `;
  const raw = rows[0]?.data;
  if (raw == null) return fallback;
  // postgres-js with `prepare: false` returns jsonb as a JSON-encoded string;
  // re-parse defensively. Already-parsed values pass through untouched.
  return typeof raw === 'string' ? JSON.parse(raw) as T : raw;
}
