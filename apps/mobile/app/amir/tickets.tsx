import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { C, F, R, S } from '../../src/theme';

const ALL_TICKETS = [
  { id: 'T003', room: '315', floor: 3, type: 'reactive',   priority: 'urgent', title: 'OOO – HVAC not cooling',           age: '2h',  status: 'open',        description: 'Guest reports room is hot. HVAC runs but no cold air.' },
  { id: 'T001', room: '109', floor: 1, type: 'reactive',   priority: 'high',   title: 'AC making loud vibration noise',   age: '18h', status: 'in_progress', description: 'Guests in adjacent rooms are complaining. Unit fan may be loose.' },
  { id: 'T012', room: '204', floor: 2, type: 'reactive',   priority: 'normal', title: 'Bathroom exhaust fan not working', age: '1d',  status: 'open',        description: 'Fan motor not responding. Possible blown fuse.' },
  { id: 'T007', room: '412', floor: 4, type: 'preventive', priority: 'normal', title: 'Quarterly HVAC filter replacement', age: '3d', status: 'scheduled',   description: 'Scheduled quarterly maintenance. Replace filter, check coolant.' },
  { id: 'T019', room: '508', floor: 5, type: 'reactive',   priority: 'high',   title: 'Shower drain slow / backing up',   age: '4d', status: 'in_progress', description: 'Shower drain almost completely blocked. Chemical treatment attempted.' },
  { id: 'T022', room: '301', floor: 3, type: 'audit',      priority: 'normal', title: 'Quarterly room audit – passed',    age: '5d', status: 'resolved',    description: 'Full room inspection completed. Score 91/100.' },
];

const FILTERS = ['All', 'Open', 'In Progress', 'Done'];

const PRIORITY_CFG: Record<string, { color: string; bg: string }> = {
  urgent: { color: C.red,   bg: C.redBg },
  high:   { color: C.amber, bg: C.amberBg },
  normal: { color: C.blue,  bg: C.blueBg },
};

const STATUS_CFG: Record<string, { color: string; label: string }> = {
  open:        { color: C.red,   label: 'Open' },
  in_progress: { color: C.amber, label: 'In Progress' },
  scheduled:   { color: C.blue,  label: 'Scheduled' },
  resolved:    { color: C.green, label: 'Resolved' },
};

export default function AmirTickets() {
  const [filter, setFilter] = useState('All');
  const router = useRouter();

  const filtered = ALL_TICKETS.filter((t) => {
    if (filter === 'All') return true;
    if (filter === 'Open') return t.status === 'open';
    if (filter === 'In Progress') return t.status === 'in_progress' || t.status === 'scheduled';
    if (filter === 'Done') return t.status === 'resolved';
    return true;
  });

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>My Tickets</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{ALL_TICKETS.filter(t => t.status !== 'resolved').length}</Text>
        </View>
      </View>

      {/* Filter tabs */}
      <View style={styles.filters}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterBtn, filter === f && styles.filterActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {filtered.map((t) => {
          const p = PRIORITY_CFG[t.priority] ?? PRIORITY_CFG.normal;
          const st = STATUS_CFG[t.status] ?? STATUS_CFG.open;
          return (
            <TouchableOpacity
              key={t.id}
              style={styles.card}
              onPress={() => router.push(`/amir/ticket/${t.id}` as any)}
              activeOpacity={0.88}
            >
              <View style={[styles.priorityBar, { backgroundColor: p.color }]} />
              <View style={styles.cardBody}>
                <View style={styles.cardTop}>
                  <Text style={styles.ticketId}>{t.id}</Text>
                  <View style={[styles.badge, { backgroundColor: p.bg }]}>
                    <Text style={[styles.badgeText, { color: p.color }]}>{t.priority.toUpperCase()}</Text>
                  </View>
                  <View style={[styles.badge, { backgroundColor: '#f0f0f0' }]}>
                    <Text style={[styles.badgeText, { color: st.color }]}>{st.label}</Text>
                  </View>
                  <Text style={styles.age}>{t.age} ago</Text>
                </View>
                <Text style={styles.ticketTitle}>{t.title}</Text>
                <Text style={styles.ticketDesc} numberOfLines={1}>{t.description}</Text>
                <View style={styles.cardBottom}>
                  <View style={styles.roomChip}>
                    <Ionicons name="bed-outline" size={11} color={C.hint} />
                    <Text style={styles.roomText}>Room {t.room} · Fl {t.floor}</Text>
                  </View>
                  <Text style={styles.typeText}>{t.type}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={16} color={C.hint} style={styles.chevron} />
            </TouchableOpacity>
          );
        })}

        {filtered.length === 0 && (
          <View style={styles.empty}>
            <Ionicons name="checkmark-circle-outline" size={40} color={C.hint} />
            <Text style={styles.emptyText}>No tickets in this category</Text>
          </View>
        )}

        <View style={{ height: S.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.sm,
    paddingHorizontal: S.xl,
    paddingVertical: S.lg,
    backgroundColor: C.card,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  title: { fontSize: F.xl, fontWeight: '800', color: C.text },
  countBadge: {
    backgroundColor: C.redBg,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: R.full,
  },
  countText: { fontSize: F.xs, fontWeight: '800', color: C.red },

  filters: {
    flexDirection: 'row',
    paddingHorizontal: S.xl,
    paddingVertical: S.md,
    gap: S.sm,
    backgroundColor: C.card,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  filterBtn: {
    paddingHorizontal: S.md,
    paddingVertical: S.xs + 2,
    borderRadius: R.full,
    backgroundColor: C.input,
  },
  filterActive: { backgroundColor: C.amberBg },
  filterText: { fontSize: F.sm, fontWeight: '600', color: C.sub },
  filterTextActive: { color: C.amber },

  scroll: { flex: 1 },
  content: { padding: S.xl, gap: S.sm },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.card,
    borderRadius: R.xl,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  priorityBar: { width: 4, alignSelf: 'stretch' },
  cardBody: { flex: 1, padding: S.md },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: S.xs, marginBottom: S.xs, flexWrap: 'wrap' },
  ticketId: { fontSize: F.xs, fontWeight: '700', color: C.hint },
  badge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: R.full },
  badgeText: { fontSize: 10, fontWeight: '700' },
  age: { fontSize: F.xs, color: C.hint, marginLeft: 'auto' },
  ticketTitle: { fontSize: F.md, fontWeight: '700', color: C.text, marginBottom: S.xs },
  ticketDesc: { fontSize: F.sm, color: C.sub, marginBottom: S.sm },
  cardBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  roomChip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: C.input, paddingHorizontal: 8, paddingVertical: 3, borderRadius: R.full },
  roomText: { fontSize: F.xs, color: C.sub, fontWeight: '600' },
  typeText: { fontSize: F.xs, color: C.hint, textTransform: 'capitalize' },
  chevron: { marginRight: S.md },

  empty: { alignItems: 'center', gap: S.md, paddingTop: 60 },
  emptyText: { fontSize: F.md, color: C.hint },
});
