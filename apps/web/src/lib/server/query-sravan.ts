import 'server-only';
import { db } from '@/lib/db/client';
import {
  SRAVAN_EMPLOYEE, SRAVAN_SCHEDULE, SRAVAN_CLOCK_LOG, SRAVAN_AVAILABILITY,
  SRAVAN_PAYSTUBS, SRAVAN_BONUSES, SRAVAN_COLLEAGUES, SRAVAN_OPEN_SHIFTS,
  SRAVAN_SWAP_REQUESTS, SRAVAN_SOPS,
} from '@hos/shared';

/**
 * Single-employee record fetcher. Reads `employee_records.data` (JSONB) by
 * (email, record_type). When the row is missing — e.g. the front-desk import
 * hasn't landed or the table was wiped — falls back to the canonical static
 * demo data in @hos/shared so every Sravan page renders instead of hanging on
 * its loading guard.
 */
const SRAVAN_EMAIL = 'sravan@hos.com';

export type SravanRecordType =
  | 'profile' | 'schedule' | 'clock_log' | 'availability'
  | 'paystubs' | 'bonuses' | 'colleagues' | 'open_shifts'
  | 'swap_requests' | 'sops';

/** Static demo defaults per record type — used when the DB row is absent. */
const DEFAULTS: Record<SravanRecordType, unknown> = {
  profile:       SRAVAN_EMPLOYEE,
  schedule:      SRAVAN_SCHEDULE,
  clock_log:     SRAVAN_CLOCK_LOG,
  availability:  SRAVAN_AVAILABILITY,
  paystubs:      SRAVAN_PAYSTUBS,
  bonuses:       SRAVAN_BONUSES,
  colleagues:    SRAVAN_COLLEAGUES,
  open_shifts:   SRAVAN_OPEN_SHIFTS,
  swap_requests: SRAVAN_SWAP_REQUESTS,
  sops:          SRAVAN_SOPS,
};

export async function querySravanRecord<T>(recordType: SravanRecordType, fallback: T): Promise<T> {
  const rows = await db<{ data: T | string }[]>`
    select data from employee_records
    where employee_email = ${SRAVAN_EMAIL} and record_type = ${recordType}
    limit 1
  `;
  const raw = rows[0]?.data;
  if (raw == null) {
    // No DB row → prefer the canonical static demo data; only fall back to the
    // caller-supplied value if no default exists for this record type.
    return (DEFAULTS[recordType] as T) ?? fallback;
  }
  // postgres-js with `prepare: false` returns jsonb as a JSON-encoded string;
  // re-parse defensively. Already-parsed values pass through untouched.
  return typeof raw === 'string' ? JSON.parse(raw) as T : raw;
}
