'use client';

import { useMemo, useState } from 'react';
import type { ChartOfAccount, CategoryRule } from '@hos/shared';
import { formatCurrency } from '@hos/shared';
import { applyRules, aiSuggest, explainRule } from '@/lib/categorization';

export interface ReviewRow {
  id: string;
  dateIso: string;
  description: string;
  amount: number;
  hotelLabel: string;
}

interface Props {
  row: ReviewRow;
  coa: ChartOfAccount[];
  rules: CategoryRule[];
  onAdd: (rowId: string, accountId: string) => void;
  onSkip: (rowId: string) => void;
}

export function TransactionRowQbo({ row, coa, rules, onAdd, onSkip }: Props) {
  const accountById = useMemo(() => new Map(coa.map((a) => [a.id, a])), [coa]);

  const initialSuggestion = useMemo(() => {
    const rule = applyRules(row.description, rules);
    if (rule) {
      const acct = accountById.get(rule.accountId);
      return {
        accountId: rule.accountId,
        explain: rule ? explainRule(rules.find((r) => r.id === rule.ruleId)!, acct?.name ?? 'Unknown') : '',
        kind: 'rule' as const,
      };
    }
    const ai = aiSuggest(row.description);
    return { accountId: ai.accountId, explain: `AI suggests: ${ai.reason} (${Math.round(ai.confidence * 100)}% confident)`, kind: 'ai' as const };
  }, [row.description, rules, accountById]);

  const [accountId, setAccountId] = useState(initialSuggestion.accountId);
  const acct = accountById.get(accountId);

  return (
    <div className="rounded-2xl p-5 flex flex-col md:flex-row md:items-center gap-4" style={{ border: '1px solid #dddddd', background: '#ffffff' }}>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-3">
          <p className="text-xs font-medium" style={{ color: '#929292' }}>{row.dateIso}</p>
          <p className="text-xs" style={{ color: '#6a6a6a' }}>· {row.hotelLabel}</p>
        </div>
        <p className="text-sm font-medium mt-0.5" style={{ color: '#222222' }}>{row.description}</p>
        <p
          className="text-xl font-bold mt-1"
          style={{ color: row.amount >= 0 ? '#15803d' : '#b91c1c' }}
        >
          {row.amount >= 0 ? '+' : ''}{formatCurrency(row.amount)}
        </p>
      </div>

      <div className="flex flex-col gap-2 md:min-w-[260px]">
        <label className="text-[10px] font-bold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>Category</label>
        <select
          value={accountId}
          onChange={(e) => setAccountId(e.target.value)}
          className="text-sm px-3 py-2 rounded-lg"
          style={{ border: '1px solid #dddddd', background: '#ffffff', color: '#222222' }}
        >
          {coa.map((a) => (
            <option key={a.id} value={a.id}>{a.number} · {a.name}</option>
          ))}
        </select>
        <span
          className="inline-flex self-start text-[10px] font-bold tracking-wide px-1.5 py-0.5 rounded"
          style={{
            background: initialSuggestion.kind === 'rule' ? '#dbeafe' : '#fef3c7',
            color: initialSuggestion.kind === 'rule' ? '#1d4ed8' : '#92400e',
          }}
          title={initialSuggestion.explain}
        >
          {initialSuggestion.kind === 'rule' ? 'RULE MATCH' : 'AI SUGGESTED'}
        </span>
        <p className="text-[10px]" style={{ color: '#929292' }}>{initialSuggestion.explain}</p>
      </div>

      <div className="flex flex-col gap-2 md:min-w-[140px]">
        <button
          type="button"
          onClick={() => onAdd(row.id, accountId)}
          className="text-xs font-semibold px-4 py-2 rounded-full transition-colors"
          style={{ background: '#15803d', color: '#ffffff' }}
        >
          Add to {acct?.name ?? 'Books'}
        </button>
        <button
          type="button"
          onClick={() => onSkip(row.id)}
          className="text-xs font-semibold px-4 py-2 rounded-full"
          style={{ background: '#ffffff', color: '#6a6a6a', border: '1px solid #dddddd' }}
        >
          Skip
        </button>
      </div>
    </div>
  );
}
