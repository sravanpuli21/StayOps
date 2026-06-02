import type { CategoryRule } from '../../types/accounting';
import { VENDORS } from './vendors';
import { BANK_IMPORT_ROWS, CC_IMPORT_ROWS } from './imports';

// One "contains <vendor name>" rule per vendor — that's the learned-rules story.
export const CATEGORY_RULES: CategoryRule[] = VENDORS.map((v) => {
  const pattern = v.name;
  const lo = pattern.toLowerCase();
  const hits =
    BANK_IMPORT_ROWS.filter((r) => r.description.toLowerCase().includes(lo)).length +
    CC_IMPORT_ROWS.filter((r) => r.description.toLowerCase().includes(lo)).length;
  return {
    id: `rule-${v.id}`,
    pattern,
    matchKind: 'contains' as const,
    accountId: v.defaultAccountId,
    vendorId: v.id,
    createdIso: '2026-01-15',
    hits,
  };
});
