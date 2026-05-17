import 'server-only';
import { db, getHosTenantId } from '@/lib/db/client';
import type { ApiLabourMetrics } from '@hos/shared';

function deriveHealth(variance: number, ot: number): 'green' | 'amber' | 'red' {
  if (variance > 30 || ot > 18) return 'red';
  if (variance > 15 || ot > 8) return 'amber';
  return 'green';
}

/**
 * Sum labour periods that overlap [from, to], weighted by overlap_days/14
 * so a one-day window draws ~1/14 of a pay period. Department breakdowns
 * use the same weighting per (period_end, department).
 */
export async function queryLabourAggregates(
  hotelCodes: string[] | null,
  from: string,
  to: string,
  includeDepartments = true,
): Promise<ApiLabourMetrics[]> {
  if (hotelCodes !== null && hotelCodes.length === 0) return [];
  const tenantId = await getHosTenantId();
  if (!tenantId) return [];
  const codeFilter = hotelCodes && hotelCodes.length > 0 ? hotelCodes : null;

  type Row = {
    code: string;
    scheduled: string | null;
    clocked: string | null;
    overtime: string | null;
    payroll: string | null;
  };
  const periodRows = await db<Row[]>`
    select
      h.code,
      coalesce(sum(
        ((least(p.period_end, ${to}::date) - greatest(p.period_start, ${from}::date) + 1)::numeric / 14.0)
        * p.scheduled_hours
      ), 0) as scheduled,
      coalesce(sum(
        ((least(p.period_end, ${to}::date) - greatest(p.period_start, ${from}::date) + 1)::numeric / 14.0)
        * p.clocked_hours
      ), 0) as clocked,
      coalesce(sum(
        ((least(p.period_end, ${to}::date) - greatest(p.period_start, ${from}::date) + 1)::numeric / 14.0)
        * p.overtime_hours
      ), 0) as overtime,
      coalesce(sum(
        ((least(p.period_end, ${to}::date) - greatest(p.period_start, ${from}::date) + 1)::numeric / 14.0)
        * p.payroll_cost
      ), 0) as payroll
    from hotels h
    left join labour_periods p on p.hotel_id = h.id
      and p.period_end >= ${from}::date
      and p.period_start <= ${to}::date
    where h.tenant_id = ${tenantId}
      ${codeFilter ? db`and h.code = any(${codeFilter})` : db``}
    group by h.id, h.code
    order by h.code
  `;

  type DRow = {
    code: string;
    department: string;
    scheduled: string;
    clocked: string;
    overtime: string;
    payroll: string;
  };
  const deptRows: DRow[] = !includeDepartments ? [] : await db<DRow[]>`
    select
      h.code,
      d.department,
      coalesce(sum(
        ((least(d.period_end, ${to}::date) - greatest(p.period_start, ${from}::date) + 1)::numeric / 14.0)
        * d.scheduled_hours
      ), 0) as scheduled,
      coalesce(sum(
        ((least(d.period_end, ${to}::date) - greatest(p.period_start, ${from}::date) + 1)::numeric / 14.0)
        * d.clocked_hours
      ), 0) as clocked,
      coalesce(sum(
        ((least(d.period_end, ${to}::date) - greatest(p.period_start, ${from}::date) + 1)::numeric / 14.0)
        * d.overtime_hours
      ), 0) as overtime,
      coalesce(sum(
        ((least(d.period_end, ${to}::date) - greatest(p.period_start, ${from}::date) + 1)::numeric / 14.0)
        * d.payroll_cost
      ), 0) as payroll
    from hotels h
    join labour_departments d on d.hotel_id = h.id
    join labour_periods p     on p.hotel_id = d.hotel_id and p.period_end = d.period_end
    where h.tenant_id = ${tenantId}
      and p.period_end >= ${from}::date
      and p.period_start <= ${to}::date
      ${codeFilter ? db`and h.code = any(${codeFilter})` : db``}
    group by h.code, d.department
    order by h.code, d.department
  `;

  // Group department rows by hotel code.
  const deptByCode = new Map<string, ApiLabourMetrics['departments']>();
  for (const dr of deptRows) {
    const dept = {
      department: dr.department as ApiLabourMetrics['departments'][number]['department'],
      scheduledHours: Math.round(Number(dr.scheduled)),
      clockedHours:   Math.round(Number(dr.clocked)),
      variance:       Math.round(Number(dr.clocked)) - Math.round(Number(dr.scheduled)),
      overtimeHours:  Math.round(Number(dr.overtime)),
      payrollCost:    Math.round(Number(dr.payroll)),
    };
    const arr = deptByCode.get(dr.code) ?? [];
    arr.push(dept);
    deptByCode.set(dr.code, arr);
  }

  return periodRows.map((r) => {
    const sched = Math.round(Number(r.scheduled ?? 0));
    const clocked = Math.round(Number(r.clocked ?? 0));
    const variance = clocked - sched;
    const overtime = Math.round(Number(r.overtime ?? 0));
    return {
      hotelId:        r.code,
      scheduledHours: sched,
      clockedHours:   clocked,
      variance,
      overtimeHours:  overtime,
      payrollCost:    Math.round(Number(r.payroll ?? 0)),
      departments:    deptByCode.get(r.code) ?? [],
      health:         deriveHealth(variance, overtime),
    };
  });
}
