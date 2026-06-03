/**
 * Airbnb-style — Amir (night tech) home. Reads like browsing listings: a pill
 * search header, a category rail, then each job as a big rounded "listing" card
 * with a cover zone, a badge, a bold price (revenue at risk), and a save heart.
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTickets, type Ticket } from '../../store/ticketsContext';
import { Screen, SearchHeader, CategoryRail, ListingCard, SectionTitle, Button, type Category } from './kit';
import { A, AT, AS, apriorityTone } from './tokens';

const CATS: Category[] = [
  { key: 'all',      label: 'All',       icon: 'apps-outline' },
  { key: 'urgent',   label: 'Urgent',    icon: 'flame-outline' },
  { key: 'arrival',  label: 'Arrivals',  icon: 'time-outline' },
  { key: 'hvac',     label: 'HVAC',      icon: 'thermometer-outline' },
  { key: 'plumbing', label: 'Plumbing',  icon: 'water-outline' },
  { key: 'electric', label: 'Electric',  icon: 'flash-outline' },
  { key: 'preventive', label: 'Preventive', icon: 'calendar-outline' },
];

const RANK = { urgent: 0, high: 1, normal: 2 } as const;
const coverIcon = (t: Ticket) =>
  /hvac|climate/i.test(t.area) ? 'thermometer-outline'
  : /plumb/i.test(t.area) ? 'water-outline'
  : /electr|light/i.test(t.area) ? 'flash-outline'
  : /electronic/i.test(t.area) ? 'tv-outline'
  : 'construct-outline';

function matchesCat(t: Ticket, cat: string): boolean {
  switch (cat) {
    case 'all':       return true;
    case 'urgent':    return t.priority === 'urgent';
    case 'arrival':   return t.guestContext === 'arrival';
    case 'hvac':      return /hvac|climate/i.test(t.area);
    case 'plumbing':  return /plumb/i.test(t.area);
    case 'electric':  return /electr|light/i.test(t.area);
    case 'preventive':return t.type === 'preventive';
    default:          return true;
  }
}

export function AmirHome({ onOpenTicket }: { onOpenTicket?: (id: string) => void }) {
  const { allTickets } = useTickets();
  const [cat, setCat] = useState('all');
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const toggleSave = (id: string) => setSaved((p) => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const open = allTickets
    .filter((t) => t.status !== 'resolved' && matchesCat(t, cat))
    .sort((a, b) => RANK[a.priority] - RANK[b.priority]);

  const guestLabel = (t: Ticket) =>
    t.guestContext === 'occupied_urgent' ? 'Guest in room'
    : t.guestContext === 'arrival' ? 'Arriving soon' : null;

  return (
    <Screen>
      <SearchHeader title="Tonight’s work" subtitle={`Amir · ${open.length} jobs · evening shift`} />
      <CategoryRail items={CATS} active={cat} onChange={setCat} />

      <SectionTitle>{cat === 'all' ? 'Up next' : CATS.find((c) => c.key === cat)?.label}</SectionTitle>

      {open.length === 0 ? (
        <View style={st.empty}>
          <Text style={[AT.section, { textAlign: 'center' }]}>Nothing here 🎉</Text>
          <Text style={[AT.sub, { color: A.textSub, textAlign: 'center' }]}>No open jobs in this category.</Text>
        </View>
      ) : (
        <View style={{ gap: AS.xxl }}>
          {open.map((t) => {
            const g = guestLabel(t);
            return (
              <ListingCard
                key={t.id}
                coverTone={apriorityTone(t.priority)}
                coverIcon={coverIcon(t)}
                badge={t.priority === 'urgent' ? 'Urgent' : g ?? (t.repeatInRoom ? 'Repeat issue' : undefined)}
                title={t.title}
                where={`Room ${t.room} · Floor ${t.floor} · ${t.area}`}
                meta={t.ai ? `Likely ${t.ai.likelyCause.toLowerCase()}` : t.updatedAt}
                price={t.revenueLost > 0 ? `$${t.revenueLost}` : undefined}
                priceUnit={t.revenueLost > 0 ? 'at risk / night' : undefined}
                saved={saved.has(t.id)}
                onSave={() => toggleSave(t.id)}
                onPress={() => onOpenTicket?.(t.id)}
              />
            );
          })}
        </View>
      )}
    </Screen>
  );
}

const st = StyleSheet.create({
  empty: { marginHorizontal: AS.lg, paddingVertical: AS.xxxl, gap: AS.sm },
});
