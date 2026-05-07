'use client';

import { DATE_RANGE_OPTIONS } from '@/lib/constants';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useDateFilter, type DateRange } from '@/lib/date-filter-context';

export function DateFilter() {
  const { range, setRange } = useDateFilter();
  return (
    <Select value={range} onValueChange={(v) => { if (v) setRange(v as DateRange); }}>
      <SelectTrigger className="w-36 h-9 text-xs" style={{ borderColor: '#dddddd' }}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {DATE_RANGE_OPTIONS.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
