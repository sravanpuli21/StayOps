/**
 * Tiny typed fetcher for SWR. Each consumer passes a Zod schema so the wire
 * payload is validated client-side too — same contract on both ends.
 */
import type { z } from 'zod';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export function buildUrl(path: string, params?: Record<string, string | string[] | undefined>): string {
  if (!params) return path;
  const usp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined) continue;
    if (Array.isArray(v)) {
      if (v.length > 0) usp.set(k, v.join(','));
    } else {
      usp.set(k, v);
    }
  }
  const qs = usp.toString();
  return qs ? `${path}?${qs}` : path;
}

export async function apiFetch<S extends z.ZodTypeAny>(url: string, schema: S): Promise<z.infer<S>> {
  const res = await fetch(url, { headers: { accept: 'application/json' } });
  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    try { const j = await res.json(); if (j?.error) detail = String(j.error); } catch {}
    throw new ApiError(res.status, detail);
  }
  const json = await res.json();
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    throw new ApiError(500, `Contract violation at ${url}: ${parsed.error.message}`);
  }
  return parsed.data;
}
