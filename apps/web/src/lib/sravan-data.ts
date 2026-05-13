'use client';

import useSWR from 'swr';
import { useApi } from './use-api';
import { apiKeys } from './swr-keys';

const passthroughFetcher = (url: string) => fetch(url).then((r) => r.json());

export function useSravanAvailability(): any[] {
  const { data } = useSWR('/api/sravan/availability', passthroughFetcher, { revalidateOnFocus: false });
  return (data?.availability ?? []) as any[];
}

export function useSravanClock(): any[] {
  const { data } = useSWR('/api/sravan/clock', passthroughFetcher, { revalidateOnFocus: false });
  return (data?.sessions ?? []) as any[];
}

export function useSravanProfile() {
  const { data } = useApi(apiKeys.sravanProfile());
  return data?.profile ?? null;
}

export function useSravanSchedule() {
  const { data } = useApi(apiKeys.sravanSchedule());
  return (data?.shifts ?? []) as any[];
}

export function useSravanPaystubs() {
  const { data } = useApi(apiKeys.sravanPaystubs());
  return (data?.paystubs ?? []) as any[];
}

export function useSravanBonuses() {
  const { data } = useApi(apiKeys.sravanBonuses());
  return (data?.bonuses ?? []) as any[];
}

export function useSravanColleagues() {
  const { data } = useApi(apiKeys.sravanColleagues());
  return (data?.colleagues ?? []) as any[];
}

export function useSravanSwaps() {
  const { data } = useApi(apiKeys.sravanSwaps());
  return (data?.swaps ?? []) as any[];
}

export function useSravanOpenShifts() {
  const { data } = useApi(apiKeys.sravanOpenShifts());
  return (data?.openShifts ?? []) as any[];
}

export function useSravanSops() {
  const { data } = useApi(apiKeys.sravanSops());
  return (data?.sops ?? []) as any[];
}
