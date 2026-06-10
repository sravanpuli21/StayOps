/**
 * StayOps Accounting OS (v2) — Rules data layer.
 *
 * Classifies seed rules by risk, derives coverage per hotel, and surfaces
 * high-risk review activity. Honors the product rules:
 *   - priority: hotel-level > global > system suggestion
 *   - high-risk categories require review; nothing auto-posts in V1
 *   - global rules carry a vendor NAME template (vendors stay hotel-specific)
 */
import { HOTEL_ENTITIES, getEntity, SEED_RICH_RULES, RULES_PORTFOLIO, ruleMatches, type RichRule } from '@hos/shared/accounting-os';

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
export const RISK_LABEL: Record<RiskLevel, { label: string; fg: string; bg: string }> = {
  low: { label: 'Low Risk', fg: '#15803d', bg: '#dcfce7' },
  medium: { label: 'Medium Risk', fg: '#1d4ed8', bg: '#dbeafe' },
  high: { label: 'High Risk', fg: '#b45309', bg: '#fef3c7' },
  critical: { label: 'Critical', fg: '#b91c1c', bg: '#fee2e2' },
};

/** Derive a risk level + review behavior from the rule's transaction type. */
export function riskFor(rule: RichRule): { risk: RiskLevel; behavior: string } {
  const t = rule.actions.setTransactionType;
  if (t === 'Credit Card Payment' || t === 'Loan Payment' || t === 'Payroll' || t === 'Owner Contribution' || t === 'Owner Draw') return { risk: 'high', behavior: 'Review Required' };
  if (t === 'Transfer' || t === 'Asset Purchase') return { risk: 'medium', behavior: 'Review Required' };
  if (rule.actions.approval === 'auto-categorize') return { risk: 'low', behavior: 'Auto-Code, do not post' };
  return { risk: 'low', behavior: 'Suggest Only' };
}

export interface RuleRow {
  rule: RichRule;
  risk: RiskLevel;
  behavior: string;
  matched: number;
  accuracy: number;
}
function deterministicAccuracy(id: string) {
  let h = 0; for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return 88 + (h % 12); // 88–99%
}

export function ruleRows(hotelId?: string): RuleRow[] {
  return SEED_RICH_RULES
    .filter((r) => !hotelId || r.scope === 'global' || r.hotelId === hotelId)
    .map((rule) => {
      const { risk, behavior } = riskFor(rule);
      const matches = ruleMatches(rule).filter((t) => !hotelId || t.hotelId === hotelId);
      return { rule, risk, behavior, matched: matches.length, accuracy: deterministicAccuracy(rule.id) };
    });
}

export function rulesSummary(hotelId?: string) {
  const rows = ruleRows(hotelId);
  const global = rows.filter((r) => r.rule.scope === 'global');
  const hotel = rows.filter((r) => r.rule.scope === 'hotel_level');
  return {
    total: hotelId ? rows.length : RULES_PORTFOLIO.total,
    global: hotelId ? global.length : RULES_PORTFOLIO.global,
    hotelLevel: hotelId ? hotel.length : RULES_PORTFOLIO.hotelLevel,
    active: rows.filter((r) => r.rule.status === 'active').length || RULES_PORTFOLIO.active,
    suggested: RULES_PORTFOLIO.suggested,
    conflicts: RULES_PORTFOLIO.conflicts,
    reviewRequired: rows.filter((r) => r.behavior === 'Review Required').length,
    matchedThisPeriod: hotelId ? rows.reduce((s, r) => s + r.matched, 0) : RULES_PORTFOLIO.matchedThisMonth,
    highRisk: rows.filter((r) => r.risk === 'high' || r.risk === 'critical').length,
  };
}

/* Coverage per hotel. */
export function ruleCoverage() {
  return HOTEL_ENTITIES.map((h) => {
    const rows = ruleRows(h.id);
    const matched = rows.reduce((s, r) => s + r.matched, 0);
    return {
      hotelId: h.id,
      global: rows.filter((r) => r.rule.scope === 'global').length,
      hotelLevel: rows.filter((r) => r.rule.scope === 'hotel_level').length,
      matched,
      corrected: Math.round(matched * 0.05),
      reviewRequired: rows.filter((r) => r.behavior === 'Review Required').length,
      conflicts: h.propertyCode === 'GA989' ? 1 : 0,
      accuracy: matched ? 95 : 100,
    };
  });
}

/* High-risk review items (representative). */
export interface HighRiskItem { rule: string; transaction: string; reason: string; action: string }
export const HIGH_RISK_ITEMS: HighRiskItem[] = [
  { rule: 'Payroll Provider Review', transaction: 'GUSTO PAYROLL $23.00', reason: 'Small payroll-provider charge may be subscription or processing fee, not wages.', action: 'Review Coding' },
  { rule: 'Credit Card Payment Detector', transaction: 'AMEX EPAYMENT $5,000.00', reason: 'Credit card payments should reduce Credit Cards Payable, not expense.', action: 'Review Payment' },
  { rule: 'Tax Payment Detector', transaction: 'GA OCC TAX PAYMENT $7,200.00', reason: 'Tax payments should usually reduce a tax payable liability.', action: 'Review Tax Payment' },
  { rule: 'Loan Payment Detector', transaction: 'LOAN PAYMENT $12,000.00', reason: 'Loan payments require a principal and interest split.', action: 'Review Split' },
];

/* Suggested rules (representative). */
export interface SuggestedRule { name: string; scope: 'global' | 'hotel_level'; hotelId?: string; pattern: string; action: string; matched: number; confidence: 'High' | 'Medium'; risk: RiskLevel }
export const SUGGESTED_RULES: SuggestedRule[] = [
  { name: 'HOME DEPOT → Repairs and Maintenance', scope: 'global', pattern: 'HOME DEPOT appeared in 11 hotels, usually coded to Repairs and Maintenance.', action: 'Repairs and Maintenance · Engineering', matched: 84, confidence: 'High', risk: 'medium' },
  { name: 'ENTERGY → Utilities for BTRCI', scope: 'hotel_level', hotelId: 'BTRCI', pattern: 'ENTERGY appears only for Home2 Baton Rouge.', action: 'Electricity · General', matched: 8, confidence: 'High', risk: 'low' },
  { name: 'CITY WATER → Water and Sewer', scope: 'global', pattern: 'Water utility payments coded to Water and Sewer across 6 hotels.', action: 'Water and Sewer · Engineering', matched: 22, confidence: 'Medium', risk: 'low' },
];

export { getEntity };
