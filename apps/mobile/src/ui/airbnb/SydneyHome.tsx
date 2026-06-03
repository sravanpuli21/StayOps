/**
 * Airbnb-style — Sydney (day supervisor) home / "Today". Same browse-listings
 * feel: pill header, category rail, listing cards. Supervisor framing — the
 * money number is prominent, and the assignee shows like a "host."
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTickets, type Ticket } from '../../store/ticketsContext';
import { Screen, SearchHeader, CategoryRail, ListingCard, SectionTitle, MiniRow, type Category } from './kit';
import { A, AT, AS, apriorityTone } from './tokens';

const CATS: Category[] = [
  { key: 'all',     label: 'All',      icon: 'apps-outline' },
  { key: 'money',   label: 'Revenue',  icon: 'cash-outline' },
  { key: 'urgent',  label: 'Urgent',   icon: 'flame-outline' },
  { key: 'arrival', label: 'Arrivals', icon: 'time-outline' },
  { key: 'audit',   label: 'Audits',   icon: 'clipboard-outline' },
  { key: 'preventive', label: 'Preventive', icon: 'calendar-outline' },
];

const coverIcon = (t: Ticket) =>
  /hvac|climate/i.test(t.area) ? 'thermometer-outline'
  : /plumb/i.test(t.area) ? 'water-outline'
  : /electr|light/i.test(t.area) ? 'flash-outline'
  : t.type === 'audit' ? 'clipboard-outline'
  : 'bed-outline';

function matchesCat(t: Ticket, cat: string): boolean {
  switch (cat) {
    case 'all':       return true;
    case 'money':     return t.revenueLost > 0;
    case 'urgent':    return t.priority === 'urgent';
    case 'arrival':   return t.guestContext === 'arrival';
    case 'audit':     return t.type === 'audit';
    case 'preventive':return t.type === 'preventive';
    default:          return true;
  }
}

export function SydneyHome({ onOpenTicket }: { onOpenTicket?: (id: string) => void }) {
  const { allTickets } = useTickets();
  const [cat, setCat] = useState('all');

  const open = allTickets.filter((t) => t.status !== 'resolved');
  const inCat = open.filter((t) => matchesCat(t, cat))
    .sort((a, b) => (b.revenueLost - a.revenueLost) || (a.priority === 'urgent' ? -1 : 1));
  const atRisk = open.filter((t) => t.revenueLost > 0).reduce((s, t) => s + t.revenueLost, 0);
  const urgent = open.filter((t) => t.priority === 'urgent').length;

  // The most prominent few become listing cards; the rest collapse to mini rows.
  const featured = inCat.slice(0, 3);
  const more = inCat.slice(3);

  return (
    <Screen>
      <SearchHeader title="Today at Home2 Baton Rouge" subtitle={`${urgent} urgent · ${open.length} open · $${atRisk}/night at risk`} />
      <CategoryRail items={CATS} active={cat} onChange={setCat} />

      <SectionTitle count={inCat.length}>{cat === 'all' ? 'Needs attention' : CATS.find((c) => c.key === cat)?.label}</SectionTitle>

      {inCat.length === 0 ? (
        <View style={st.empty}>
          <Text style={[AT.section, { textAlign: 'center' }]}>All clear ✨</Text>
          <Text style={[AT.sub, { color: A.textSub, textAlign: 'center' }]}>Nothing in this category right now.</Text>
        </View>
      ) : (
        <View style={{ gap: AS.xxl }}>
          {featured.map((t) => (
            <ListingCard
              key={t.id}
              coverTone={t.revenueLost > 0 ? 'money' : apriorityTone(t.priority)}
              coverIcon={coverIcon(t)}
              badge={t.priority === 'urgent' ? 'Urgent' : t.revenueLost > 0 ? 'Revenue at risk' : undefined}
              title={t.title}
              where={`Room ${t.room} · ${t.area}`}
              meta={`Assigned to ${t.assignee.split(' ')[0]} · ${t.updatedAt}`}
              price={t.revenueLost > 0 ? `$${t.revenueLost}` : undefined}
              priceUnit={t.revenueLost > 0 ? 'lost / night' : undefined}
              onPress={() => onOpenTicket?.(t.id)}
            />
          ))}
        </View>
      )}

      {more.length > 0 && (
        <View style={{ gap: AS.sm }}>
          <SectionTitle>More</SectionTitle>
          <View style={st.miniGroup}>
            {more.map((t, i) => (
              <MiniRow
                key={t.id}
                last={i === more.length - 1}
                icon={coverIcon(t)}
                iconTone={apriorityTone(t.priority)}
                title={`Room ${t.room} · ${t.title}`}
                sub={`→ ${t.assignee.split(' ')[0]} · ${t.area}`}
                onPress={() => onOpenTicket?.(t.id)}
              />
            ))}
          </View>
        </View>
      )}
    </Screen>
  );
}

const st = StyleSheet.create({
  empty:     { marginHorizontal: AS.lg, paddingVertical: AS.xxxl, gap: AS.sm },
  miniGroup: { marginHorizontal: AS.lg, borderRadius: 16, borderWidth: 1, borderColor: A.lineSoft, paddingHorizontal: 0 },
});
