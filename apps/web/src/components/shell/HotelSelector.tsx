'use client';

import { useState } from 'react';
import { HOTELS } from '@hos/shared';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function HotelSelector() {
  const [value, setValue] = useState('all');
  return (
    <Select value={value} onValueChange={(v) => { if (v) setValue(v); }}>
      <SelectTrigger className="w-48 h-9 text-xs" style={{ borderColor: '#dddddd' }}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All 16 Hotels</SelectItem>
        {HOTELS.map((h) => (
          <SelectItem key={h.id} value={h.id}>
            {h.shortName}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
