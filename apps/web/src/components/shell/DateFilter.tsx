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
  const { range, setRange, customFrom, customTo, setCustomRange } = useDateFilter();

  return (
    <div className="flex items-center gap-2">
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

      {/* Custom range — two native date inputs (browser-supplied calendar) */}
      {range === 'custom' && (
        <div className="flex items-center gap-1.5 text-xs" style={{ color: '#3f3f3f' }}>
          <input
            type="date"
            value={customFrom}
            max={customTo || undefined}
            onChange={(e) => setCustomRange(e.target.value || customFrom, customTo)}
            className="h-9 px-2 rounded-md outline-none focus:ring-2 focus:ring-[#ff385c]"
            style={{ border: '1px solid #dddddd', background: '#ffffff' }}
            aria-label="Custom range — from"
          />
          <span style={{ color: '#929292' }}>→</span>
          <input
            type="date"
            value={customTo}
            min={customFrom || undefined}
            onChange={(e) => setCustomRange(customFrom, e.target.value || customTo)}
            className="h-9 px-2 rounded-md outline-none focus:ring-2 focus:ring-[#ff385c]"
            style={{ border: '1px solid #dddddd', background: '#ffffff' }}
            aria-label="Custom range — to"
          />
        </div>
      )}
    </div>
  );
}
