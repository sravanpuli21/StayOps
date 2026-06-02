import type { CategoryRule } from '@hos/shared';

export interface RuleMatch {
  accountId: string;
  ruleId: string;
  vendorId?: string;
}

export function applyRules(description: string, rules: readonly CategoryRule[]): RuleMatch | null {
  const d = description.toLowerCase();
  for (const r of rules) {
    const p = r.pattern.toLowerCase();
    if (r.matchKind === 'equals' ? d === p : d.includes(p)) {
      return { accountId: r.accountId, ruleId: r.id, vendorId: r.vendorId };
    }
  }
  return null;
}

export function explainRule(rule: CategoryRule, accountName: string): string {
  return `Any transaction whose description ${rule.matchKind === 'equals' ? 'equals' : 'contains'} "${rule.pattern}" → ${accountName}`;
}

// Heuristic AI fallback when no rule matches. Same shape as a real AI suggestion.
const AI_KEYWORDS: Array<{ keywords: string[]; accountId: string; reason: string }> = [
  { keywords: ['power', 'electric', 'energy', 'pg&e'],            accountId: 'acc-6400', reason: 'Description mentions electricity provider keywords' },
  { keywords: ['gas light', 'natural gas'],                       accountId: 'acc-6410', reason: 'Description mentions gas utility keywords' },
  { keywords: ['water', 'sewer'],                                 accountId: 'acc-6420', reason: 'Description mentions water/sewer keywords' },
  { keywords: ['waste', 'sanitation'],                            accountId: 'acc-6430', reason: 'Description mentions waste/sanitation keywords' },
  { keywords: ['expedia', 'booking.com', 'agoda'],                accountId: 'acc-5210', reason: 'Description matches an OTA' },
  { keywords: ['sysco', 'us foods', 'restaurant depot'],          accountId: 'acc-5310', reason: 'Description matches a food distributor' },
  { keywords: ['otis', 'orkin', 'ge zoneline', 'pentair'],        accountId: 'acc-6500', reason: 'Description matches a maintenance vendor' },
  { keywords: ['adp', 'paychex', 'payroll'],                      accountId: 'acc-2100', reason: 'Description mentions payroll provider' },
  { keywords: ['hilton franchise', 'marriott royalty', 'choice'], accountId: 'acc-7300', reason: 'Description matches a franchise/management fee' },
  { keywords: ['at&t', 'comcast', 'opera'],                       accountId: 'acc-6200', reason: 'Description mentions IT/telecom provider' },
  { keywords: ['deposit', 'settlement'],                          accountId: 'acc-4100', reason: 'Looks like a daily revenue settlement' },
];

export interface AiSuggestion {
  accountId: string;
  confidence: number;
  reason: string;
}

export function aiSuggest(description: string): AiSuggestion {
  const d = description.toLowerCase();
  for (const k of AI_KEYWORDS) {
    if (k.keywords.some((kw) => d.includes(kw))) {
      return { accountId: k.accountId, confidence: 0.78, reason: k.reason };
    }
  }
  return { accountId: 'acc-6500', confidence: 0.32, reason: 'No strong signal — defaulting to Repairs & Maintenance' };
}
