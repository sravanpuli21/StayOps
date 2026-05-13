'use client';

import useSWR from 'swr';
import type { z } from 'zod';
import { apiFetch } from './api-client';

/**
 * Thin wrapper around SWR that calls apiFetch with the provided schema.
 * Pass a `[url, schema]` tuple from `apiKeys.*()` — null skips the request.
 */
export function useApi<S extends z.ZodTypeAny>(
  key: readonly [string, S] | null,
) {
  return useSWR(
    key ? key[0] : null,
    (url: string) => apiFetch(url, key![1]),
    { revalidateOnFocus: false },
  );
}
