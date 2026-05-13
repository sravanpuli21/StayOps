/**
 * Contract conformance test (Phase A verification step #1).
 *
 * Each contract is exercised against an example payload that matches the
 * shape the route handler must return. If any schema diverges from what the
 * server (mock today, Postgres next) actually produces, this catches it.
 *
 * Run via: pnpm tsx packages/shared/src/api/__tests__/contract.test.ts
 *
 * Same suite re-runs after the Postgres swap; if real handlers' output
 * parses against these schemas, the swap is provably mechanical.
 */
import {
  GetHotelsResponseSchema,
  GetRevenueScopedResponseSchema, GetRevenuePropertyResponseSchema,
  GetLabourScopedResponseSchema,  GetLabourPropertyResponseSchema,
  GetDailyScopedResponseSchema,   GetDailyPropertyResponseSchema,
  GetAnomaliesResponseSchema, GetRedFlagsResponseSchema, GetIntelligenceResponseSchema,
  GetGmScoresResponseSchema, GetRegionalScoresResponseSchema,
  GetRoomsResponseSchema, GetTicketsResponseSchema, GetOpsSummaryResponseSchema,
  GetStaleDirtyResponseSchema, GetEmployeesResponseSchema,
  GetAuditSummaryResponseSchema, GetAuditTasksResponseSchema,
  GetAssetsResponseSchema, GetAssetSummaryResponseSchema, GetVendorSpendResponseSchema,
  GetAmPmReportResponseSchema, GetOtaChannelRowsResponseSchema,
  GetAnnualTargetsResponseSchema, GetHotelTargetsResponseSchema,
  GetStrategicInitiativesResponseSchema, GetCapexPipelineResponseSchema,
  GetSravanProfileResponseSchema, GetSravanScheduleResponseSchema,
  GetSravanPaystubsResponseSchema, GetSravanBonusesResponseSchema,
  GetSravanColleaguesResponseSchema, GetSravanSwapsResponseSchema,
  GetSravanOpenShiftsResponseSchema, GetSravanSopsResponseSchema,
  ScopedQuerySchema, PropertyQuerySchema, ResolvedRangeSchema, DateRangeKindSchema,
  AmPmReportQuerySchema,
} from '../index';
import type { z } from 'zod';

interface Case {
  name: string;
  schema: z.ZodTypeAny;
  payload: unknown;
}

const range = { from: '2026-05-01', to: '2026-05-12', days: 12, label: 'Custom' };
const baseRevRow = {
  hotelId: 'BTRCI', occupancyPct: 83, adr: 131, revPar: 109,
  totalRevenue: 17900, roomRevenue: 13962, nonRoomRevenue: 3938,
  revenueMix: { room: 13962, fb: 895, retail: 1790, events: 716, other: 537 },
  marketAdr: 134, health: 'amber' as const,
};
const baseLabRow = {
  hotelId: 'BTRCI', scheduledHours: 840, clockedHours: 868, variance: 28,
  overtimeHours: 14, payrollCost: 44280,
  departments: [{
    department: 'Housekeeping' as const,
    scheduledHours: 302, clockedHours: 313, variance: 11,
    overtimeHours: 9, payrollCost: 15940,
  }],
  health: 'amber' as const,
};
const baseDailyRow = {
  hotelId: 'BTRCI', date: '2026-05-12',
  roomsSold: 96, roomsOoo: 0, occupancyPct: 83, avgCustomerRating: 4.2,
};

const cases: Case[] = [
  // ─── Date-range primitives ────────────────────────────────────────────────
  { name: 'DateRangeKindSchema',    schema: DateRangeKindSchema,    payload: 'week' },
  { name: 'ResolvedRangeSchema',    schema: ResolvedRangeSchema,    payload: range },
  { name: 'ScopedQuery — null',     schema: ScopedQuerySchema,      payload: { hotelIds: null,            from: '2026-05-01', to: '2026-05-12' } },
  { name: 'ScopedQuery — empty',    schema: ScopedQuerySchema,      payload: { hotelIds: [],              from: '2026-05-01', to: '2026-05-12' } },
  { name: 'ScopedQuery — values',   schema: ScopedQuerySchema,      payload: { hotelIds: ['BTRCI'],       from: '2026-05-01', to: '2026-05-12' } },
  { name: 'PropertyQuery',          schema: PropertyQuerySchema,    payload: { hotelId: 'BTRCI',           from: '2026-05-01', to: '2026-05-12' } },
  { name: 'AmPmReportQuery',        schema: AmPmReportQuerySchema,  payload: { slot: 'AM' } },

  // ─── Hotels ──────────────────────────────────────────────────────────────
  { name: 'GetHotelsResponse',      schema: GetHotelsResponseSchema, payload: {
      hotels: [{ id: 'BTRCI', code: 'BTRCI', name: 'Home2 Suites - Baton Rouge',
                 shortName: 'Home2 Baton Rouge', rooms: 116, brand: 'Hilton',
                 city: 'Baton Rouge', state: 'LA' }],
    } },

  // ─── Revenue ─────────────────────────────────────────────────────────────
  { name: 'GetRevenueScopedResponse',   schema: GetRevenueScopedResponseSchema,
    payload: { rows: [baseRevRow], range } },
  { name: 'GetRevenuePropertyResponse', schema: GetRevenuePropertyResponseSchema,
    payload: { summary: baseRevRow, range } },
  { name: 'GetRevenuePropertyResponse — null summary', schema: GetRevenuePropertyResponseSchema,
    payload: { summary: null, range } },

  // ─── Labour ──────────────────────────────────────────────────────────────
  { name: 'GetLabourScopedResponse',    schema: GetLabourScopedResponseSchema,
    payload: { rows: [baseLabRow], range } },
  { name: 'GetLabourPropertyResponse',  schema: GetLabourPropertyResponseSchema,
    payload: { summary: baseLabRow, range } },

  // ─── Daily metrics ───────────────────────────────────────────────────────
  { name: 'GetDailyScopedResponse',    schema: GetDailyScopedResponseSchema,
    payload: { rows: [baseDailyRow], range } },
  { name: 'GetDailyPropertyResponse',  schema: GetDailyPropertyResponseSchema,
    payload: { summary: baseDailyRow, range } },

  // ─── Anomalies / alerts / intelligence ───────────────────────────────────
  { name: 'GetAnomaliesResponse',      schema: GetAnomaliesResponseSchema,
    payload: { anomalies: [{ id: 'af-001', hotelId: 'BTRCI', module: 'labour',
      severity: 'critical', kind: 'trending', headline: 'Test', detail: 'Test',
      metricChain: ['payroll'], detectedAt: '2026-05-12T00:00:00Z' }] } },
  { name: 'GetRedFlagsResponse',       schema: GetRedFlagsResponseSchema,
    payload: { flags: [{ id: 'rf-001', hotelId: 'BTRCI', module: 'labour',
      severity: 'critical', message: 'Test', timestamp: '2026-05-12T00:00:00Z' }] } },
  { name: 'GetIntelligenceResponse',   schema: GetIntelligenceResponseSchema,
    payload: { decisions: [], patterns: [], forecasts: [], recommendations: [],
               rootCauses: [], capexPredictions: [], briefs: [] } },

  // ─── Leaders ─────────────────────────────────────────────────────────────
  { name: 'GetGmScoresResponse',       schema: GetGmScoresResponseSchema,
    payload: { scores: [{ hotelId: 'BTRCI',
      score: { composite: 84, trendDirection: 'flat', trendDelta: 0 } }] } },
  { name: 'GetRegionalScoresResponse', schema: GetRegionalScoresResponseSchema,
    payload: { scores: [{ regionalId: 'harshal',
      score: { composite: 81, trendDirection: 'up', trendDelta: 2 } }] } },

  // ─── Operations ──────────────────────────────────────────────────────────
  { name: 'GetRoomsResponse',          schema: GetRoomsResponseSchema,    payload: { rooms: [] } },
  { name: 'GetTicketsResponse',        schema: GetTicketsResponseSchema,  payload: { tickets: [] } },
  { name: 'GetOpsSummaryResponse',     schema: GetOpsSummaryResponseSchema,
    payload: { summary: { hotelId: 'BTRCI', readyRooms: 17, dirtyRooms: 22,
      inspectingRooms: 8, oooRooms: 12, blockedRooms: 8, occupiedRooms: 49,
      staleDirtyRooms: 4, openTickets: 1, urgentTickets: 0,
      auditPassRate: 100, lastAuditDate: '2026-04-15' } } },
  { name: 'GetStaleDirtyResponse',     schema: GetStaleDirtyResponseSchema,
    payload: { rooms: [{ hotelId: 'BTRCI', number: '103', floor: 1, type: 'King' }] } },
  { name: 'GetEmployeesResponse',      schema: GetEmployeesResponseSchema, payload: { employees: [] } },

  // ─── Audits ──────────────────────────────────────────────────────────────
  { name: 'GetAuditSummaryResponse',   schema: GetAuditSummaryResponseSchema,
    payload: { summary: { hotelId: 'BTRCI', compliancePct: 100, overdueRooms: 0 } } },
  { name: 'GetAuditTasksResponse',     schema: GetAuditTasksResponseSchema, payload: { tasks: [] } },

  // ─── Assets ──────────────────────────────────────────────────────────────
  { name: 'GetAssetsResponse',         schema: GetAssetsResponseSchema,         payload: { assets: [] } },
  { name: 'GetAssetSummaryResponse',   schema: GetAssetSummaryResponseSchema,
    payload: { summaries: [{ hotelId: 'BTRCI' }] } },
  { name: 'GetVendorSpendResponse',    schema: GetVendorSpendResponseSchema,
    payload: { vendors: [{ hotelIds: ['BTRCI'], totalSpend: 100, vendor: 'Test' }] } },

  // ─── AM/PM ───────────────────────────────────────────────────────────────
  { name: 'GetAmPmReportResponse',     schema: GetAmPmReportResponseSchema,
    payload: { slot: 'AM', generatedAt: '2026-05-12T13:00:00Z',
      label: '9:00 AM Snapshot', rows: [] } },

  // ─── OTA leakage ─────────────────────────────────────────────────────────
  { name: 'GetOtaChannelRowsResponse', schema: GetOtaChannelRowsResponseSchema,
    payload: { rows: [{ hotelId: 'BTRCI', channel: 'direct', bookings: 100,
      grossAdr: 130, commissionPct: 0, otherFeesPerBooking: 0,
      cancellationPct: 0.05, noShowPct: 0.02, refundLossPerBooking: 0 }] } },

  // ─── Strategy ────────────────────────────────────────────────────────────
  { name: 'GetAnnualTargetsResponse',         schema: GetAnnualTargetsResponseSchema,         payload: { targets: [] } },
  { name: 'GetHotelTargetsResponse',          schema: GetHotelTargetsResponseSchema,          payload: { targets: [] } },
  { name: 'GetStrategicInitiativesResponse',  schema: GetStrategicInitiativesResponseSchema,  payload: { initiatives: [] } },
  { name: 'GetCapexPipelineResponse',         schema: GetCapexPipelineResponseSchema,         payload: { pipeline: [] } },

  // ─── Sravan ──────────────────────────────────────────────────────────────
  { name: 'GetSravanProfileResponse',     schema: GetSravanProfileResponseSchema,    payload: { profile: { name: 'Sravan' } } },
  { name: 'GetSravanScheduleResponse',    schema: GetSravanScheduleResponseSchema,   payload: { shifts: [] } },
  { name: 'GetSravanPaystubsResponse',    schema: GetSravanPaystubsResponseSchema,   payload: { paystubs: [] } },
  { name: 'GetSravanBonusesResponse',     schema: GetSravanBonusesResponseSchema,    payload: { bonuses: [] } },
  { name: 'GetSravanColleaguesResponse',  schema: GetSravanColleaguesResponseSchema, payload: { colleagues: [] } },
  { name: 'GetSravanSwapsResponse',       schema: GetSravanSwapsResponseSchema,      payload: { swaps: [] } },
  { name: 'GetSravanOpenShiftsResponse',  schema: GetSravanOpenShiftsResponseSchema, payload: { openShifts: [] } },
  { name: 'GetSravanSopsResponse',        schema: GetSravanSopsResponseSchema,       payload: { sops: [] } },
];

let failures = 0;
for (const c of cases) {
  const result = c.schema.safeParse(c.payload);
  if (result.success) {
    console.log(`✓ ${c.name}`);
  } else {
    console.error(`✗ ${c.name}`);
    for (const issue of result.error.issues.slice(0, 3)) {
      console.error(`    ${issue.path.join('.')}: ${issue.message}`);
    }
    failures++;
  }
}

if (failures > 0) {
  console.error(`\n${failures} contract failure${failures === 1 ? '' : 's'}.`);
  process.exit(1);
}
console.log(`\nAll ${cases.length} contracts pass.`);
