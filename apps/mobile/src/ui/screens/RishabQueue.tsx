/**
 * Rishab (GM) action queue — iOS-native, web palette. Segmented filter over the
 * cross-department action queue. Money + escalation signals shown quietly.
 */
import React, { useState, useMemo } from 'react';
import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { QUEUE, sortByPriority, type QueueItem } from '../../data/queue';
import { Screen, TopBar, ListGroup, ListRow, StatusDot, SegFilter } from '../kit';
import { tone, space, secondaryLabel, type, type ToneName as TN } from '../tokens';

type ToneName = TN;

type Filter = 'all' | 'urgent' | 'mine';
const ME = 'Rishab Patel';
const prioTone = (p: string): ToneName => (p === 'urgent' ? 'urgent' : p === 'high' ? 'warn' : 'neutral');

export function RishabQueue() {
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>('all');

  const items = useMemo(() => {
    let xs = QUEUE.filter((q) => q.state !== 'resolved' && q.state !== 'completed');
    if (filter === 'urgent') xs = xs.filter((q) => q.priority === 'urgent');
    if (filter === 'mine')   xs = xs.filter((q) => q.assignedTo === ME || q.escalatedBy);
    return sortByPriority(xs);
  }, [filter]);

  const open = QUEUE.filter((q) => q.state !== 'resolved' && q.state !== 'completed');
  const urgent = open.filter((q) => q.priority === 'urgent').length;

  const sub = (q: QueueItem) => {
    const bits = [q.whyItMatters];
    return bits.join(' · ');
  };
  const value = (q: QueueItem) => q.revenueImpact ? `$${q.revenueImpact}` : q.amount ?? undefined;

  return (
    <View style={{ flex: 1, backgroundColor: tone.bg }}>
      <TopBar onBack={() => router.replace('/')} propertyLabel="Home2 Baton Rouge" />
      <Screen title="Action queue" subtitle={`${open.length} open · ${urgent} urgent`}>
        <SegFilter
          options={[{ key: 'all', label: 'All' }, { key: 'urgent', label: 'Urgent' }, { key: 'mine', label: 'Mine' }]}
          value={filter}
          onChange={setFilter}
        />
        {items.length === 0 ? (
          <Text style={[type.body, { color: secondaryLabel, textAlign: 'center', marginTop: space.xl }]}>Nothing here.</Text>
        ) : (
          <ListGroup>
            {items.map((q) => (
              <ListRow
                key={q.id}
                leading={<StatusDot toneName={prioTone(q.priority)} />}
                title={q.title}
                subtitle={sub(q)}
                value={value(q)}
                valueTone="money"
                onPress={() => router.push(`/rishab/queue/${q.id}` as never)}
              />
            ))}
          </ListGroup>
        )}
      </Screen>
    </View>
  );
}
