/**
 * Sydney queue — iOS-native, web palette. Segmented filter (All / Urgent / Mine)
 * over a grouped list of open tickets. Money + guest signals shown quietly.
 */
import React, { useState, useMemo } from 'react';
import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useTickets, type Ticket } from '../../store/ticketsContext';
import { Screen, TopBar, ListGroup, ListRow, StatusDot, SegFilter } from '../kit';
import { tone, space, priorityTone, secondaryLabel, type } from '../tokens';

type Filter = 'all' | 'urgent' | 'mine';
const ME = 'Sydney Rivera';
const RANK = { urgent: 0, high: 1, normal: 2 } as const;

export function SydneyQueue() {
  const router = useRouter();
  const { allTickets } = useTickets();
  const [filter, setFilter] = useState<Filter>('all');

  const items = useMemo(() => {
    let xs = allTickets.filter((t) => t.status !== 'resolved');
    if (filter === 'urgent') xs = xs.filter((t) => t.priority === 'urgent');
    if (filter === 'mine')   xs = xs.filter((t) => t.assignee === ME);
    return xs.sort((a, b) => RANK[a.priority] - RANK[b.priority]);
  }, [allTickets, filter]);

  const open = allTickets.filter((t) => t.status !== 'resolved');
  const urgent = open.filter((t) => t.priority === 'urgent').length;

  const sub = (t: Ticket) => {
    const bits = [`→ ${t.assignee.split(' ')[0]}`, t.area];
    if (t.guestContext === 'occupied_urgent') bits.push('guest inside');
    else if (t.guestContext === 'arrival') bits.push('arrival pending');
    return bits.join(' · ');
  };

  return (
    <View style={{ flex: 1, backgroundColor: tone.bg }}>
      <TopBar onBack={() => router.replace('/')} propertyLabel="Home2 Baton Rouge" />
      <Screen title="Queue" subtitle={`${open.length} open · ${urgent} urgent`}>
        <SegFilter
          options={[{ key: 'all', label: 'All' }, { key: 'urgent', label: 'Urgent' }, { key: 'mine', label: 'Mine' }]}
          value={filter}
          onChange={setFilter}
        />

        {items.length === 0 ? (
          <Text style={[type.body, { color: secondaryLabel, textAlign: 'center', marginTop: space.xl }]}>Nothing here.</Text>
        ) : (
          <ListGroup>
            {items.map((t) => (
              <ListRow
                key={t.id}
                leading={<StatusDot toneName={priorityTone(t.priority)} />}
                title={`Room ${t.room} · ${t.title}`}
                subtitle={sub(t)}
                value={t.revenueLost > 0 ? `$${t.revenueLost}` : undefined}
                valueTone="money"
                onPress={() => router.push(`/sydney/ticket/${t.id}` as never)}
              />
            ))}
          </ListGroup>
        )}
      </Screen>
    </View>
  );
}
