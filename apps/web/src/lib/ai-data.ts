'use client';

import { useApi } from './use-api';
import { apiKeys } from './swr-keys';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Any = any;

export function useRedFlags(): Any[] {
  const { data } = useApi(apiKeys.alerts());
  return (data?.flags ?? []) as Any[];
}

export function useAnomalies(): Any[] {
  const { data } = useApi(apiKeys.anomalies());
  return (data?.anomalies ?? []) as Any[];
}

function useIntel() {
  return useApi(apiKeys.intelligence()).data;
}

export function useAiPatterns(): Any[]         { return (useIntel()?.patterns         ?? []) as Any[]; }
export function useAiForecasts(): Any[]        { return (useIntel()?.forecasts        ?? []) as Any[]; }
export function useAiDecisions(): Any[]        { return (useIntel()?.decisions        ?? []) as Any[]; }
export function useAiRecommendations(): Any[]  { return (useIntel()?.recommendations  ?? []) as Any[]; }
export function useAiRootCauses(): Any[]       { return (useIntel()?.rootCauses       ?? []) as Any[]; }
export function useAiCapexPredictions(): Any[] { return (useIntel()?.capexPredictions ?? []) as Any[]; }
export function useAiBriefs(): Any[]           { return (useIntel()?.briefs           ?? []) as Any[]; }

export function useBriefByModule(moduleName: string): Any | null {
  const briefs = useAiBriefs();
  return briefs.find((b) => b.module === moduleName) ?? null;
}
