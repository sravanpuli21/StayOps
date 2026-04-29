'use client';

import { useState } from 'react';
import { DATE_RANGE_OPTIONS } from '@/lib/constants';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function DateFilter() {
  const [value, setValue] = useState('yesterday');
  return (
    <Select value={value} onValueChange={(v) => { if (v) setValue(v); }}>
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
