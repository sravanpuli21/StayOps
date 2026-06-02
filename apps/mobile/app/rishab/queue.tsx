import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { useState, useMemo } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { C, F, R, S } from '../../src/theme';
import {
  QUEUE, sortByPriority, TYPE_CFG, PRIORITY_CFG, type QueueItem,
} from '../../src/data/queue';

type Filter = 'all' | 'urgent' | 'mine';
const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all',    label: 'All' },
  { key: 'urgent', label: 'Urgent' },
  { key: 'mine',   label: 'Mine' },
];

const ME = 'Rishab Patel';

/* Pick the single most important meta tag for the card */
function topMeta(item: QueueItem) {
  if (item.escalatedBy)
    return { label: `From ${item.escalatedBy.split(' ')[0]}`, color: '#b91c1c', bg: '#fee2e2', icon: 'arrow-down-circle' as const };
  if (item.revenueImpact && item.revenueImpact > 0)
    return { label: `$${item.revenueImpact}/night`, color: '#b91c1c', bg: '#fee2e2', icon: 'trending-down' as const };
  if (item.amount)
    return { label: item.amount, color: C.text, bg: '#f0f0f0', icon: 'cash-outline' as const };
  if (item.room)
    return { label: `Room ${item.room}`, color: C.sub, bg: '#f0f0f0', icon: 'bed-outline' as const };
  return null;
}

export default function RishabQueue() {
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>('all');
  const [showMore, setShowMore] = useState(false);
  const [advType, setAdvType] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let items = QUEUE.filter((q) => q.state !== 'resolved' && q.state !== 'completed');
    if (filter === 'urgent') items = items.filter((q) => q.priority === 'urgent');
    if (filter === 'mine')   items = items.filter((q) => q.assignedTo === ME || q.escalatedBy);
    if (advType)             items = items.filter((q) => q.type === advType);
    return sortByPriority(items);
  }, [filter, advType]);

  const open    = QUEUE.filter((q) => q.state !== 'resolved' && q.state !== 'completed');
  const urgent  = open.filter((q) => q.priority === 'urgent').length;

  function openAdvanced() {
    Alert.alert(
      'More filters',
      'Filter by type',
      [
        { text: 'Tasks',       onPress: () => setAdvType('task') },
        { text: 'Tickets',     onPress: () => setAdvType('ticket') },
        { text: 'Approvals',   onPress: () => setAdvType('approval') },
        { text: 'Escalations', onPress: () => setAdvType('escalation') },
        { text: 'Reminders',   onPress: () => setAdvType('reminder') },
        ...(advType ? [{ text: 'Clear filter', style: 'destructive' as const, onPress: () => setAdvType(null) }] : []),
        { text: 'Cancel', style: 'cancel' as const },
      ]
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Light summary */}
      <View style={styles.summaryBar}>
        <Text style={styles.summary}>
          {open.length} open
          {urgent > 0 && <Text style={{ color: '#b91c1c' }}>  ·  {urgent} urgent</Text>}
        </Text>
      </View>

      {/* 3 filter chips + more */}
      <View style={styles.filterRow}>
        {FILTERS.map((f) => {
          const active = filter === f.key;
          return (
            <TouchableOpacity
              key={f.key}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => setFilter(f.key)}
              activeOpacity={0.85}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{f.label}</Text>
            </TouchableOpacity>
          );
        })}
        <TouchableOpacity
          style={[styles.chip, advType && styles.chipActive]}
          onPress={openAdvanced}
          activeOpacity={0.85}
        >
          <Ionicons name="options-outline" size={14} color={advType ? '#fff' : C.sub} />
          {advType && <Text style={[styles.chipText, styles.chipTextActive, { marginLeft: 4 }]}>{advType}</Text>}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {filtered.length === 0 && (
          <View style={styles.empty}>
            <Ionicons name="checkmark-circle-outline" size={32} color={C.hint} />
            <Text style={styles.emptyText}>Nothing here</Text>
          </View>
        )}
        {filtered.map((item) => {
          const t = TYPE_CFG[item.type];
          const p = PRIORITY_CFG[item.priority];
          const meta = topMeta(item);
          return (
            <TouchableOpacity
              key={item.id}
              style={styles.card}
              onPress={() => router.push(`/rishab/queue/${item.id}` as any)}
              activeOpacity={0.85}
            >
              <View style={[styles.priorityBar, { backgroundColor: p.color }]} />
              <View style={styles.cardBody}>
                <View style={styles.cardTop}>
                  <Ionicons name={t.icon as any} size={13} color={t.color} />
                  <Text style={[styles.typeLabel, { color: t.color }]}>{t.label}</Text>
                  <Text style={styles.age}>{item.openedAgo ?? item.dueLabel ?? ''}</Text>
                </View>
                <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
                <Text style={styles.why} numberOfLines={1}>{item.whyItMatters}</Text>
                {meta && (
                  <View style={[styles.meta, { backgroundColor: meta.bg }]}>
                    <Ionicons name={meta.icon} size={11} color={meta.color} />
                    <Text style={[styles.metaText, { color: meta.color }]}>{meta.label}</Text>
                  </View>
                )}
              </View>
              <Ionicons name="chevron-forward" size={16} color={C.faint} style={{ alignSelf: 'center', marginRight: S.sm }} />
            </TouchableOpacity>
          );
        })}
        <View style={{ height: S.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },

  summaryBar: {
    paddingHorizontal: S.lg,
    paddingTop: S.md,
    paddingBottom: 6,
    backgroundColor: C.bg,
  },
  summary: { fontSize: F.md, fontWeight: '700', color: C.text, letterSpacing: -0.2 },

  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: S.lg,
    paddingBottom: S.sm,
    gap: S.xs,
    backgroundColor: C.bg,
  },
  chip: {
    paddingHorizontal: S.md, paddingVertical: 6,
    borderRadius: R.full, borderWidth: 1, borderColor: C.border,
    backgroundColor: C.card,
    flexDirection: 'row', alignItems: 'center',
  },
  chipActive: { backgroundColor: C.ink, borderColor: C.ink },
  chipText: { fontSize: F.xs, fontWeight: '700', color: C.sub },
  chipTextActive: { color: '#fff' },

  scroll: { flex: 1 },
  content: { paddingHorizontal: S.lg, paddingTop: 0, gap: S.sm },

  empty: { alignItems: 'center', padding: S.xxxl, gap: S.sm },
  emptyText: { fontSize: F.sm, color: C.hint, fontWeight: '600' },

  card: {
    flexDirection: 'row',
    backgroundColor: C.card,
    borderWidth: 1, borderColor: C.border,
    borderRadius: R.lg,
    overflow: 'hidden',
  },
  priorityBar: { width: 4, alignSelf: 'stretch' },
  cardBody: { flex: 1, padding: S.md, gap: 4 },

  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  typeLabel: { fontSize: F.xs, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.4 },
  age: { fontSize: F.xs, color: C.hint, marginLeft: 'auto' },

  title: { fontSize: F.md, fontWeight: '700', color: C.text, lineHeight: 20, letterSpacing: -0.2 },
  why: { fontSize: F.xs, color: C.sub, lineHeight: 16 },

  meta: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: R.full, alignSelf: 'flex-start',
    marginTop: 2,
  },
  metaText: { fontSize: F.xs, fontWeight: '700' },
});
