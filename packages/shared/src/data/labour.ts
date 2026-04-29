import type { LabourMetrics, DepartmentLabour } from '../types/metrics';
import { deriveLabourHealth } from '../utils/health';

function makeDepts(
  scheduledHours: number,
  clockedHours: number,
  overtimeHours: number,
  payrollCost: number,
  seed: number,
): DepartmentLabour[] {
  // Proportional splits with slight per-hotel variation
  const ratios: [string, number][] = [
    ['Housekeeping', 0.35 + (seed % 3) * 0.01],
    ['Front Desk', 0.20 + (seed % 2) * 0.01],
    ['Kitchen', 0.18 - (seed % 3) * 0.01],
    ['Maintenance', 0.12],
    ['Market', 0.10 - (seed % 2) * 0.01],
    ['Event Space', 0.05],
  ] as [string, number][];

  // Normalize so ratios sum to 1
  const total = ratios.reduce((s, [, r]) => s + r, 0);

  return ratios.map(([dept, ratio], i) => {
    const normalRatio = ratio / total;
    const sched = Math.round(scheduledHours * normalRatio);
    const clocked = Math.round(clockedHours * normalRatio);
    const variance = clocked - sched;
    const ot = i < 2 ? Math.round(overtimeHours * (i === 0 ? 0.6 : 0.3)) : (i === 2 ? Math.round(overtimeHours * 0.1) : 0);
    const deptPayroll = Math.round(payrollCost * normalRatio);
    return {
      department: dept as DepartmentLabour['department'],
      scheduledHours: sched,
      clockedHours: clocked,
      variance,
      overtimeHours: ot,
      payrollCost: deptPayroll,
    };
  });
}

const raw: Array<{
  hotelId: string;
  sched: number;
  clocked: number;
  ot: number;
  payroll: number;
}> = [
  { hotelId: 'SAVGW',   sched: 694,  clocked: 712,  ot: 9,  payroll: 36480 },
  { hotelId: 'SAVVY',   sched: 432,  clocked: 426,  ot: 3,  payroll: 23140 },
  { hotelId: 'GA989',   sched: 628,  clocked: 654,  ot: 12, payroll: 33760 },
  { hotelId: 'SAVMT',   sched: 811,  clocked: 868,  ot: 21, payroll: 45920 },
  { hotelId: 'SAVMD',   sched: 744,  clocked: 768,  ot: 10, payroll: 39100 },
  { hotelId: 'RISAV',   sched: 503,  clocked: 494,  ot: 4,  payroll: 25220 },
  { hotelId: 'SAVFP',   sched: 902,  clocked: 961,  ot: 24, payroll: 52800 },
  { hotelId: 'BQKCY',   sched: 579,  clocked: 593,  ot: 7,  payroll: 30200 },
  { hotelId: 'BSWVE',   sched: 610,  clocked: 627,  ot: 8,  payroll: 31600 },
  { hotelId: 'GAA84',   sched: 644,  clocked: 632,  ot: 2,  payroll: 28920 },
  { hotelId: 'BQKFP',   sched: 691,  clocked: 718,  ot: 11, payroll: 36440 },
  { hotelId: 'SGJES',   sched: 458,  clocked: 449,  ot: 2,  payroll: 22410 },
  { hotelId: 'JAXTX',   sched: 389,  clocked: 402,  ot: 5,  payroll: 20340 },
  { hotelId: 'DFWFW',   sched: 447,  clocked: 491,  ot: 16, payroll: 26880 },
  { hotelId: 'BTRCI',   sched: 602,  clocked: 624,  ot: 9,  payroll: 32460 },
  { hotelId: '58090LA', sched: 463,  clocked: 452,  ot: 2,  payroll: 22770 },
];

export const LABOUR_DATA: LabourMetrics[] = raw.map((r, i) => {
  const variance = r.clocked - r.sched;
  return {
    hotelId: r.hotelId,
    scheduledHours: r.sched,
    clockedHours: r.clocked,
    variance,
    overtimeHours: r.ot,
    payrollCost: r.payroll,
    departments: makeDepts(r.sched, r.clocked, r.ot, r.payroll, i),
    health: deriveLabourHealth(variance, r.ot),
  };
});

export const getLabourById = (hotelId: string): LabourMetrics | undefined =>
  LABOUR_DATA.find((l) => l.hotelId === hotelId);
