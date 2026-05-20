import 'server-only';
import { db, getHosTenantId } from '@/lib/db/client';
import { pbkdf2Sync, randomBytes, timingSafeEqual } from 'node:crypto';

const PBKDF2_ITERATIONS = 100_000;
const PBKDF2_KEY_LEN    = 32;
const PBKDF2_DIGEST     = 'sha256';

function hashPin(pin: string, salt: string): string {
  return pbkdf2Sync(pin, salt, PBKDF2_ITERATIONS, PBKDF2_KEY_LEN, PBKDF2_DIGEST).toString('hex');
}

export function newPinHash(pin: string): { pin_hash: string; pin_salt: string } {
  const salt = randomBytes(16).toString('hex');
  return { pin_hash: hashPin(pin, salt), pin_salt: salt };
}

export interface PunchEmployee {
  id:          string;
  hotelCode:   string;
  employeeId:  string;
  fullName:    string;
  department:  string | null;
}

/** Verify (hotelCode, employee_id, pin). Returns the employee or null. */
export async function verifyEmployee(
  hotelCode: string,
  employeeId: string,
  pin: string,
): Promise<PunchEmployee | null> {
  const tenantId = await getHosTenantId();
  if (!tenantId) return null;

  const [row] = await db<Array<{
    id: string; full_name: string; department: string | null;
    pin_hash: string; pin_salt: string; active: boolean;
  }>>`
    select e.id::text as id, e.full_name, e.department, e.pin_hash, e.pin_salt, e.active
      from employees e
      join hotels h on h.id = e.hotel_id
     where h.tenant_id = ${tenantId} and h.code = ${hotelCode}
       and e.employee_id = ${employeeId}
     limit 1
  `;
  if (!row || !row.active) return null;

  const expected = Buffer.from(row.pin_hash, 'hex');
  const candidate = Buffer.from(hashPin(pin, row.pin_salt), 'hex');
  if (expected.length !== candidate.length) return null;
  if (!timingSafeEqual(expected, candidate)) return null;

  return {
    id:         row.id,
    hotelCode,
    employeeId,
    fullName:   row.full_name,
    department: row.department,
  };
}

export interface PunchRow {
  id:           string;
  employeeId:   string;     // text id like '1001'
  fullName:     string;
  department:   string | null;
  kind:         'in' | 'out';
  punchedAt:    string;
}

/** Record a punch. Caller is responsible for verifying the employee first. */
export async function recordPunch(
  employeeUuid: string,
  kind: 'in' | 'out',
): Promise<PunchRow | null> {
  const [row] = await db<Array<{
    id: string; punched_at: string;
    employee_id: string; full_name: string; department: string | null;
  }>>`
    with ins as (
      insert into employee_punches (hotel_id, employee_id, kind)
      select e.hotel_id, e.id, ${kind}
        from employees e
       where e.id = ${employeeUuid}::uuid
      returning id::text as id, punched_at::text as punched_at, employee_id
    )
    select ins.id, ins.punched_at, e.employee_id, e.full_name, e.department
      from ins
      join employees e on e.id = ins.employee_id
  `;
  if (!row) return null;
  return {
    id:         row.id,
    employeeId: row.employee_id,
    fullName:   row.full_name,
    department: row.department,
    kind,
    punchedAt:  row.punched_at,
  };
}

/** Most recent punches for a hotel (default 10), newest first. */
export async function recentPunches(hotelCode: string, limit = 10): Promise<PunchRow[]> {
  const tenantId = await getHosTenantId();
  if (!tenantId) return [];

  const rows = await db<Array<{
    id: string; kind: string; punched_at: string;
    employee_id: string; full_name: string; department: string | null;
  }>>`
    select p.id::text as id, p.kind, p.punched_at::text as punched_at,
           e.employee_id, e.full_name, e.department
      from employee_punches p
      join employees e on e.id = p.employee_id
      join hotels h on h.id = p.hotel_id
     where h.tenant_id = ${tenantId} and h.code = ${hotelCode}
     order by p.punched_at desc
     limit ${limit}
  `;
  return rows.map((r) => ({
    id:         r.id,
    employeeId: r.employee_id,
    fullName:   r.full_name,
    department: r.department,
    kind:       r.kind as 'in' | 'out',
    punchedAt:  r.punched_at,
  }));
}

/** Latest punch for one employee (used to flip the next button between In / Out). */
export async function latestPunchForEmployee(employeeUuid: string): Promise<'in' | 'out' | null> {
  const [row] = await db<Array<{ kind: string }>>`
    select kind from employee_punches
     where employee_id = ${employeeUuid}::uuid
     order by punched_at desc
     limit 1
  `;
  return (row?.kind as 'in' | 'out' | undefined) ?? null;
}
