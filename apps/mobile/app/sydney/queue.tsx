import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { useState, useMemo } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { C, F, R, S } from '../../src/theme';
import { useTickets, type Ticket } from '../../src/store/ticketsContext';

const PRIORITY_COLOR: Record<string, string> = {
  urgent: '#b91c1c',
  high:   '#b45309',
  normal: '#1d4ed8',
};

type Filter = 'all' | 'urgent' | 'mine';
const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all',    label: 'All' },
  { key: 'urgent', label: 'Urgent' },
  { key: 'mine',   label: 'Mine' },
];

const ME = 'Sydney Rivera';

function topMeta(t: Ticket) {
  if (t.guestContext === 'occupied_urgent')
    return { label: 'Guest inside', color: '#b91c1c', bg: '#fee2e2', icon: 'person-outline' as const };
  if (t.guestContext === 'arrival')
    return { label: 'Arrival pending', color: '#b45309', bg: '#fef3c7', icon: 'time-outline' as const };
  if (t.revenueLost > 0)
    return { label: `$${t.revenueLost}/night`, color: '#b91c1c', bg: '#fee2e2', icon: 'trending-down' as const };
  if (t.repeatInRoom)
    return { label: 'Repeat issue', color: '#b45309', bg: '#fef3c7', icon: 'refresh-outline' as const };
  return null;
}

export default function SydneyQueue() {
  const router = useRouter();
  const { allTickets } = useTickets();
  const [filter, setFilter] = useState<Filter>('all');
  const [advType, setAdvType] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let items = allTickets.filter((t) => t.status !== 'resolved');
    if (filter === 'urgent') items = items.filter((t) => t.priority === 'urgent');
    if (filter === 'mine')   items = items.filter((t) => t.assignee === ME);
    if (advType)             items = items.filter((t) => t.type === advType);
    return items.sort((a, b) => {
      const order = { urgent: 0, high: 1, normal: 2 } as const;
      return (order[a.priority] ?? 99) - (order[b.priority] ?? 99);
    });
  }, [allTickets, filter, advType]);

  const open   = allTickets.filter((t) => t.status !== 'resolved');
  const urgent = open.filter((t) => t.priority === 'urgent').length;

  function openAdvanced() {
    Alert.alert(
      'More filters',
      'Filter by type',
      [
        { text: 'Reactive',   onPress: () => setAdvType('reactive') },
        { text: 'Preventive', onPress: () => setAdvType('preventive') },
        { text: 'Audit',      onPress: () => setAdvType('audit') },
        ...(advType ? [{ text: 'Clear', style: 'destructive' as const, onPress: () => setAdvType(null) }] : []),
        { text: 'Cancel', style: 'cancel' as const },
      ]
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.summaryBar}>
        <Text style={styles.summary}>
          {open.length} open
          {urgent > 0 && <Text style={{ color: '#b91c1c' }}>  ·  {urgent} urgent</Text>}
        </Text>
      </View>

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
          style={[styles.chip, advType !== null && styles.chipActive]}
          onPress={openAdvanced}
          activeOpacity={0.85}
        >
          <Ionicons name="options-outline" size={14} color={advType !== null ? '#fff' : C.sub} />
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
        {filtered.map((tk) => {
          const meta = topMeta(tk);
          return (
            <TouchableOpacity
              key={tk.id}
              style={styles.card}
              onPress={() => router.push(`/sydney/ticket/${tk.id}` as any)}
              activeOpacity={0.85}
            >
              <View style={[styles.priorityBar, { backgroundColor: PRIORITY_COLOR[tk.priority] }]} />
              <View style={styles.cardBody}>
                <View style={styles.cardTop}>
                  <Text style={styles.typeLabel}>Room {tk.room}</Text>
                  <Text style={styles.age}>{tk.updatedAt}</Text>
                </View>
                <Text style={styles.title} numberOfLines={2}>{tk.title}</Text>
                <Text style={styles.why} numberOfLines={1}>
                  → {tk.assignee.split(' ')[0]}
                </Text>
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

  summaryBar: { paddingHorizontal: S.lg, paddingTop: S.md, paddingBottom: 6 },
  summary: { fontSize: F.md, fontWeight: '700', color: C.text, letterSpacing: -0.2 },

  filterRow: { flexDirection: 'row', paddingHorizontal: S.lg, paddingBottom: S.sm, gap: S.xs },
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
  typeLabel: { fontSize: F.xs, fontWeight: '700', color: C.hint, letterSpacing: 0.3 },
  age: { fontSize: F.xs, color: C.hint, marginLeft: 'auto' },

  title: { fontSize: F.md, fontWeight: '700', color: C.text, lineHeight: 20, letterSpacing: -0.2 },
  why: { fontSize: F.xs, color: C.sub },

  meta: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: R.full, alignSelf: 'flex-start',
    marginTop: 2,
  },
  metaText: { fontSize: F.xs, fontWeight: '700' },
});
