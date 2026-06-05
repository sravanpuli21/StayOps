import {
  SEED_RICH_RULES, type RichRule, ruleMatches, txMatchesRule,
  ACCT_TRANSACTIONS, HOTEL_ENTITIES, VENDOR_SUGGESTIONS,
} from '@hos/shared/accounting-os';
import type { RichRuleRecord } from './_store';

interface StoreLike {
  richRules: RichRuleRecord[];
  ruleEdits: Record<string, Partial<RichRuleRecord>>;
  ignoredSuggestions: string[];
  resolvedConflicts: string[];
}

/** All rules = seed + created, edits applied. */
export function allRules(store: StoreLike): RichRule[] {
  return [...store.richRules, ...SEED_RICH_RULES].map((r) => {
    const e = store.ruleEdits[r.id];
    return e ? { ...r, ...e } as RichRule : r;
  });
}

export function oneRule(store: StoreLike, id: string): RichRule | undefined {
  return allRules(store).find((r) => r.id === id);
}

export function globalRules(store: StoreLike) { return allRules(store).filter((r) => r.scope === 'global'); }
export function hotelRules(store: StoreLike, hotelId?: string) {
  return allRules(store).filter((r) => r.scope === 'hotel_level' && (!hotelId || r.hotelId === hotelId));
}
/** Rules affecting one hotel: its hotel-level rules + all global rules. */
export function rulesAffectingHotel(store: StoreLike, hotelId: string) {
  return allRules(store).filter((r) => r.scope === 'global' || r.hotelId === hotelId);
}

/* ── Match counts & performance ───────────────────────────────────────── */
const matchCache = new Map<string, number>();
export function matchCount(rule: RichRule): number {
  // deterministic seed-based count, scaled to feel realistic
  const base = ruleMatches({ ...rule, hotelId: undefined, scope: 'global' }).length;
  return rule.scope === 'hotel_level' ? Math.max(1, Math.round(base / 8)) : base;
}
export function monthMatchCount(rule: RichRule): number {
  if (matchCache.has(rule.id)) return matchCache.get(rule.id)!;
  const n = matchCount(rule);
  const v = Math.max(rule.status === 'active' ? 1 : 0, Math.round(n * 0.6));
  matchCache.set(rule.id, v);
  return v;
}
export function lastMatched(rule: RichRule): string {
  const ms = ruleMatches({ ...rule, hotelId: undefined, scope: 'global' });
  if (!ms.length) return '—';
  return ms.map((t) => t.dateIso).sort().slice(-1)[0];
}
/** Hotels a global rule actually touches (have matching tx). */
export function hotelsAffected(rule: RichRule): number {
  if (rule.scope === 'hotel_level') return 1;
  const ms = ruleMatches({ ...rule, scope: 'global', hotelId: undefined });
  return new Set(ms.map((t) => t.hotelId)).size;
}

/** Transactions a rule matched (optionally scoped to a hotel). */
export function matchedTransactions(rule: RichRule, hotelId?: string) {
  return ACCT_TRANSACTIONS.filter((t) => {
    if (hotelId && t.hotelId !== hotelId) return false;
    if (rule.scope === 'hotel_level') return rule.hotelId === t.hotelId && txMatchesRule({ ...rule, scope: 'global', hotelId: undefined }, t);
    return txMatchesRule(rule, t);
  });
}

/* ── Conflicts: a global rule + a hotel rule that match the same desc ─── */
export interface RuleConflict {
  id: string;
  type: string;
  hotelId: string;
  ruleA: RichRule;   // higher priority (winner) — hotel-level
  ruleB: RichRule;   // global (overridden)
  example: string;
  resolution: string;
}
export function conflicts(store: StoreLike): RuleConflict[] {
  const out: RuleConflict[] = [];
  const globals = globalRules(store).filter((r) => r.status === 'active');
  const hotels = hotelRules(store).filter((r) => r.status === 'active');
  for (const hr of hotels) {
    const term = hr.conditions[0]?.value?.toUpperCase() ?? '';
    const g = globals.find((gr) => (gr.conditions[0]?.value?.toUpperCase() ?? '') === term);
    if (g && hr.hotelId) {
      out.push({
        id: `cf-${hr.id}-${g.id}`,
        type: 'Hotel-level rule overrides global rule',
        hotelId: hr.hotelId,
        ruleA: hr, ruleB: g,
        example: `Description contains ${term}`,
        resolution: 'Use hotel-level rule',
      });
    }
  }
  return out.filter((c) => !store.resolvedConflicts.includes(c.id));
}
export function conflictsForHotel(store: StoreLike, hotelId: string) {
  return conflicts(store).filter((c) => c.hotelId === hotelId);
}

/* ── Suggested rules: repeated vendor patterns not yet ruled ──────────── */
export interface RuleSuggestion {
  id: string;
  name: string;
  scope: 'global' | 'hotel_level';
  hotelId?: string;
  pattern: string;
  action: string;
  matches: number;
  confidence: 'High' | 'Medium' | 'Low';
  reason: string;
}
export function suggestions(store: StoreLike): RuleSuggestion[] {
  const existing = new Set(allRules(store).map((r) => (r.conditions[0]?.value ?? '').toUpperCase()));
  const out: RuleSuggestion[] = [];

  // Group seed transactions by detected vendor keyword.
  const byVendor = new Map<string, { hotels: Set<string>; count: number; cat: string; dept: string }>();
  for (const t of ACCT_TRANSACTIONS) {
    const v = t.vendor ?? Object.keys(VENDOR_SUGGESTIONS).find((k) => t.description.toUpperCase().includes(k));
    if (!v) continue;
    const key = v.toUpperCase();
    const sug = VENDOR_SUGGESTIONS[v] ?? VENDOR_SUGGESTIONS[Object.keys(VENDOR_SUGGESTIONS).find((k) => key.includes(k)) ?? ''];
    const e = byVendor.get(key) ?? { hotels: new Set<string>(), count: 0, cat: sug?.category ?? 'Office Supplies', dept: sug?.department ?? 'Admin' };
    e.hotels.add(t.hotelId); e.count++; byVendor.set(key, e);
  }

  for (const [vendor, e] of byVendor) {
    if (existing.has(vendor) || e.count < 3) continue;
    const multiHotel = e.hotels.size >= 3;
    const hotelId = multiHotel ? undefined : [...e.hotels][0];
    out.push({
      id: `sg-${vendor.replace(/[^A-Z]/g, '')}`,
      name: `${vendor} to ${e.cat}`,
      scope: multiHotel ? 'global' : 'hotel_level',
      hotelId,
      pattern: `Description contains ${vendor}`,
      action: `Set category ${e.cat} · ${e.dept}`,
      matches: e.count,
      confidence: e.count > 10 ? 'High' : e.count > 5 ? 'Medium' : 'Low',
      reason: multiHotel
        ? `${vendor} appears in ${e.hotels.size} hotels and is usually categorized as ${e.cat}.`
        : `${vendor} only appears for ${HOTEL_ENTITIES.find((h) => h.id === hotelId)?.hotelName ?? 'one hotel'}.`,
    });
  }
  return out.filter((s) => !store.ignoredSuggestions.includes(s.id)).sort((a, b) => b.matches - a.matches).slice(0, 24);
}

/* ── Portfolio rule coverage by hotel ─────────────────────────────────── */
export function coverageByHotel(store: StoreLike) {
  const globals = globalRules(store).filter((r) => r.status === 'active').length;
  return HOTEL_ENTITIES.map((h) => {
    const hr = hotelRules(store, h.id).filter((r) => r.status === 'active').length;
    const txs = ACCT_TRANSACTIONS.filter((t) => t.hotelId === h.id);
    const matched = txs.filter((t) => rulesAffectingHotel(store, h.id).some((r) => r.status === 'active' && (r.scope === 'global' ? txMatchesRule(r, t) : txMatchesRule({ ...r, scope: 'global', hotelId: undefined }, t)))).length;
    return {
      hotelId: h.id,
      hotelRules: hr,
      globalApplied: globals,
      matched,
      unmatched: Math.max(0, txs.length - matched),
      conflicts: conflictsForHotel(store, h.id).length,
    };
  });
}

/* ── Plain-language rule summary ──────────────────────────────────────── */
export function ruleSummaryText(r: RichRule): string {
  const term = r.conditions[0]?.value ?? '';
  const sets: string[] = [];
  if (r.actions.setVendorName) sets.push(`vendor to ${r.actions.setVendorName}`);
  if (r.actions.setCategoryName) sets.push(`category to ${r.actions.setCategoryName}`);
  if (r.actions.setDepartment) sets.push(`department to ${r.actions.setDepartment}`);
  return `When a transaction description contains ${term}, StayOps sets the ${sets.join(', ')}.`;
}

export function actionSummary(r: RichRule): string {
  return [r.actions.setVendorName, r.actions.setCategoryName, r.actions.setDepartment].filter(Boolean).join(' · ') || '—';
}
export function conditionSummary(r: RichRule): string {
  return r.conditions.map((c) => `${c.field} ${c.operator.toLowerCase()} ${c.value}`).join(r.conditionLogic === 'any' ? ' OR ' : ' AND ');
}
