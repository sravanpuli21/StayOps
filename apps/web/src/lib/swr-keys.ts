/**
 * Centralized SWR key builders so cache identity stays stable.
 * Each builder returns a tuple `[url, schema]` — the URL becomes the SWR key
 * and the schema gets passed into apiFetch.
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
} from '@hos/shared';
import { buildUrl } from './api-client';

export const apiKeys = {
  hotels:                () => ['/api/hotels',                          GetHotelsResponseSchema] as const,

  revenueScoped:  (hotelIds: string[], from: string, to: string) =>
    [buildUrl('/api/revenue/scoped', { hotelIds, from, to }),            GetRevenueScopedResponseSchema] as const,
  revenueProperty: (hotelId: string, from: string, to: string) =>
    [buildUrl('/api/revenue/property', { hotelId, from, to }),           GetRevenuePropertyResponseSchema] as const,

  labourScoped:   (hotelIds: string[], from: string, to: string) =>
    [buildUrl('/api/labour/scoped', { hotelIds, from, to }),             GetLabourScopedResponseSchema] as const,
  labourProperty: (hotelId: string, from: string, to: string) =>
    [buildUrl('/api/labour/property', { hotelId, from, to }),            GetLabourPropertyResponseSchema] as const,

  dailyScoped:    (hotelIds: string[], from: string, to: string) =>
    [buildUrl('/api/daily-metrics/scoped', { hotelIds, from, to }),      GetDailyScopedResponseSchema] as const,
  dailyProperty:  (hotelId: string, from: string, to: string) =>
    [buildUrl('/api/daily-metrics/property', { hotelId, from, to }),     GetDailyPropertyResponseSchema] as const,

  anomalies:      (hotelIds?: string[]) =>
    [buildUrl('/api/anomalies', { hotelIds }),                           GetAnomaliesResponseSchema] as const,
  alerts:         (hotelIds?: string[], modules?: string[]) =>
    [buildUrl('/api/alerts', { hotelIds, modules }),                     GetRedFlagsResponseSchema] as const,
  intelligence:   (hotelIds?: string[]) =>
    [buildUrl('/api/intelligence', { hotelIds }),                        GetIntelligenceResponseSchema] as const,

  gmScores:       (hotelIds?: string[]) =>
    [buildUrl('/api/leaders/gm-scores', { hotelIds }),                   GetGmScoresResponseSchema] as const,
  regionalScores: () => ['/api/leaders/regional-scores',                 GetRegionalScoresResponseSchema] as const,

  opsRooms:       (hotelId?: string, status?: string) =>
    [buildUrl('/api/ops/rooms', { hotelId, status }),                    GetRoomsResponseSchema] as const,
  opsTickets:     (hotelId?: string, status?: string) =>
    [buildUrl('/api/ops/tickets', { hotelId, status }),                  GetTicketsResponseSchema] as const,
  opsSummary:     (hotelId: string) =>
    [buildUrl('/api/ops/summary', { hotelId }),                          GetOpsSummaryResponseSchema] as const,
  staleDirty:     (hotelId?: string) =>
    [buildUrl('/api/ops/stale-dirty', { hotelId }),                      GetStaleDirtyResponseSchema] as const,
  employees:      (hotelId: string, team?: string) =>
    [buildUrl('/api/employees', { hotelId, team }),                      GetEmployeesResponseSchema] as const,

  auditSummary:   (hotelId: string) =>
    [buildUrl('/api/audits/summary', { hotelId }),                       GetAuditSummaryResponseSchema] as const,
  auditTasks:     (hotelId?: string) =>
    [buildUrl('/api/audits/tasks', { hotelId }),                         GetAuditTasksResponseSchema] as const,

  assets:         (hotelId?: string, category?: string) =>
    [buildUrl('/api/assets', { hotelId, category }),                     GetAssetsResponseSchema] as const,
  assetsSummary:  (hotelIds?: string[]) =>
    [buildUrl('/api/assets/summary', { hotelIds }),                      GetAssetSummaryResponseSchema] as const,
  vendorSpend:    () => ['/api/vendor-spend',                            GetVendorSpendResponseSchema] as const,

  amPm:           (slot: 'AM' | 'PM', hotelId?: string) =>
    [buildUrl('/api/am-pm-report', { slot, hotelId }),                   GetAmPmReportResponseSchema] as const,

  otaChannelRows: (hotelIds?: string[]) =>
    [buildUrl('/api/ota/channel-rows', { hotelIds }),                    GetOtaChannelRowsResponseSchema] as const,

  annualTargets:  () => ['/api/strategy/annual-targets',                 GetAnnualTargetsResponseSchema] as const,
  hotelTargets:   (hotelIds?: string[]) =>
    [buildUrl('/api/strategy/hotel-targets', { hotelIds }),              GetHotelTargetsResponseSchema] as const,
  initiatives:    () => ['/api/strategy/initiatives',                    GetStrategicInitiativesResponseSchema] as const,
  capex:          () => ['/api/strategy/capex-pipeline',                 GetCapexPipelineResponseSchema] as const,

  sravanProfile:    () => ['/api/sravan/profile',     GetSravanProfileResponseSchema] as const,
  sravanSchedule:   () => ['/api/sravan/schedule',    GetSravanScheduleResponseSchema] as const,
  sravanPaystubs:   () => ['/api/sravan/paystubs',    GetSravanPaystubsResponseSchema] as const,
  sravanBonuses:    () => ['/api/sravan/bonuses',     GetSravanBonusesResponseSchema] as const,
  sravanColleagues: () => ['/api/sravan/colleagues',  GetSravanColleaguesResponseSchema] as const,
  sravanSwaps:      () => ['/api/sravan/swaps',       GetSravanSwapsResponseSchema] as const,
  sravanOpenShifts: () => ['/api/sravan/open-shifts', GetSravanOpenShiftsResponseSchema] as const,
  sravanSops:       () => ['/api/sravan/sops',        GetSravanSopsResponseSchema] as const,
};
