import 'server-only';
import { db } from '@/lib/db/client';

/**
 * Generic JSONB row reader for the four strategy_* tables. Each table stores
 * one record per legacy_id with the original payload in `data` (JSONB).
 */
async function readJsonbList<T>(table: 'strategy_annual_targets' | 'strategy_hotel_targets' | 'strategy_initiatives' | 'strategy_capex'): Promise<T[]> {
  const rows = await db.unsafe<{ data: T | string }[]>(`select data from ${table} order by legacy_id`);
  return rows.map((r) => (typeof r.data === 'string' ? JSON.parse(r.data) as T : r.data));
}

export const queryAnnualTargets       = () => readJsonbList<Record<string, unknown>>('strategy_annual_targets');
export const queryHotelTargets        = () => readJsonbList<Record<string, unknown>>('strategy_hotel_targets');
export const queryStrategicInitiatives = () => readJsonbList<Record<string, unknown>>('strategy_initiatives');
export const queryCapexPipeline       = () => readJsonbList<Record<string, unknown>>('strategy_capex');
