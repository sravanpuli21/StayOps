'use client';

import { usePathname } from 'next/navigation';
import { HOTELS, REGIONAL_ROSTER } from '@hos/shared';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useHotelFilter, type HotelSelection } from '@/lib/hotel-filter-context';

function regionalIdFromPath(pathname: string): string | null {
  const match = pathname.match(/^\/web\/([^/]+)/);
  if (!match) return null;
  const persona = match[1];
  return REGIONAL_ROSTER.some((r) => r.id === persona) ? persona : null;
}

function selectionToValue(s: HotelSelection): string {
  if (s.kind === 'all') return 'all';
  if (s.kind === 'my-territory') return 'my-territory';
  if (s.kind === 'regional') return `regional:${s.regionalId}`;
  return s.hotelId;
}

function valueToSelection(v: string): HotelSelection {
  if (v === 'all') return { kind: 'all' };
  if (v === 'my-territory') return { kind: 'my-territory' };
  if (v.startsWith('regional:')) return { kind: 'regional', regionalId: v.slice('regional:'.length) };
  return { kind: 'single', hotelId: v };
}

export function HotelSelector() {
  const pathname = usePathname();
  const regionalId = regionalIdFromPath(pathname ?? '');
  const regional = regionalId ? REGIONAL_ROSTER.find((r) => r.id === regionalId) : null;

  const { selection, setSelection } = useHotelFilter();
  const value = selectionToValue(selection);

  return (
    <Select value={value} onValueChange={(v) => { if (v) setSelection(valueToSelection(v)); }}>
      <SelectTrigger className="w-48 h-9 text-xs" style={{ borderColor: '#dddddd' }}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All 16 Hotels</SelectItem>
        {regional ? (
          <SelectItem value="my-territory">
            My {regional.hotelIds.length} Hotels
          </SelectItem>
        ) : (
          REGIONAL_ROSTER.map((r) => {
            const firstName = r.name.split(' ')[0];
            return (
              <SelectItem key={r.id} value={`regional:${r.id}`}>
                {firstName}&apos;s Hotels ({r.hotelIds.length})
              </SelectItem>
            );
          })
        )}
        {HOTELS.map((h) => (
          <SelectItem key={h.id} value={h.id}>
            {h.shortName}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
