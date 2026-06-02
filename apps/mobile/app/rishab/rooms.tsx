import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { useState, useMemo } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { C, F, R, S } from '../../src/theme';
import { SectionLabel } from '../../src/components/web-ui/SectionLabel';

type RoomStatus = 'ready' | 'occupied' | 'dirty' | 'inspect' | 'ooo' | 'blocked';

interface Room {
  number: string;
  floor: number;
  status: RoomStatus;
  type: string;
  note?: string;
}

const ROOMS: Room[] = [
  // Floor 5
  { number: '501', floor: 5, status: 'occupied', type: 'King' },
  { number: '502', floor: 5, status: 'ready',    type: 'King' },
  { number: '503', floor: 5, status: 'occupied', type: 'Double' },
  { number: '504', floor: 5, status: 'dirty',    type: 'King' },
  { number: '505', floor: 5, status: 'ready',    type: 'Suite' },
  { number: '506', floor: 5, status: 'occupied', type: 'King' },
  { number: '507', floor: 5, status: 'inspect',  type: 'Double' },
  { number: '508', floor: 5, status: 'ooo',      type: 'King', note: 'Drain backup' },
  // Floor 4
  { number: '401', floor: 4, status: 'ready',    type: 'King' },
  { number: '402', floor: 4, status: 'occupied', type: 'King' },
  { number: '403', floor: 4, status: 'occupied', type: 'Double' },
  { number: '404', floor: 4, status: 'dirty',    type: 'King' },
  { number: '405', floor: 4, status: 'ready',    type: 'Double' },
  { number: '406', floor: 4, status: 'blocked',  type: 'Suite', note: 'VIP hold' },
  { number: '407', floor: 4, status: 'occupied', type: 'King' },
  { number: '408', floor: 4, status: 'dirty',    type: 'King' },
  { number: '409', floor: 4, status: 'ready',    type: 'Double' },
  { number: '410', floor: 4, status: 'occupied', type: 'King' },
  { number: '411', floor: 4, status: 'inspect',  type: 'King' },
  { number: '412', floor: 4, status: 'ready',    type: 'Double' },
  // Floor 3
  { number: '301', floor: 3, status: 'occupied', type: 'King' },
  { number: '302', floor: 3, status: 'ready',    type: 'King' },
  { number: '303', floor: 3, status: 'dirty',    type: 'Double' },
  { number: '304', floor: 3, status: 'occupied', type: 'Suite' },
  { number: '305', floor: 3, status: 'occupied', type: 'King' },
  { number: '306', floor: 3, status: 'ooo',      type: 'Double', note: 'HVAC failure' },
  { number: '307', floor: 3, status: 'ready',    type: 'King' },
  { number: '308', floor: 3, status: 'occupied', type: 'Double' },
];

const STATUS_CFG: Record<RoomStatus, { color: string; bg: string; label: string; ring: string }> = {
  ready:    { color: '#15803d', bg: '#dcfce7', ring: '#86efac', label: 'Ready' },
  occupied: { color: '#1d4ed8', bg: '#dbeafe', ring: '#93c5fd', label: 'Occupied' },
  dirty:    { color: '#a16207', bg: '#fef9c3', ring: '#fde047', label: 'Dirty' },
  inspect:  { color: '#5b21b6', bg: '#e0e7ff', ring: '#c4b5fd', label: 'Inspect' },
  ooo:      { color: '#b91c1c', bg: '#fee2e2', ring: '#fca5a5', label: 'OOO' },
  blocked:  { color: '#86198f', bg: '#fce7f3', ring: '#f9a8d4', label: 'Blocked' },
};

const FILTERS: { key: RoomStatus | 'all'; label: string }[] = [
  { key: 'all',      label: 'All' },
  { key: 'ready',    label: 'Ready' },
  { key: 'dirty',    label: 'Dirty' },
  { key: 'occupied', label: 'Occupied' },
  { key: 'ooo',      label: 'OOO' },
  { key: 'blocked',  label: 'Blocked' },
];

export default function RishabRooms() {
  const router = useRouter();
  const [filter, setFilter] = useState<RoomStatus | 'all'>('all');

  const counts = useMemo(() => {
    const c: Record<RoomStatus, number> = {
      ready: 0, occupied: 0, dirty: 0, inspect: 0, ooo: 0, blocked: 0,
    };
    ROOMS.forEach((r) => { c[r.status] += 1; });
    return c;
  }, []);

  const total = ROOMS.length;
  const occPct = Math.round((counts.occupied / total) * 100);

  const filtered = useMemo(
    () => filter === 'all' ? ROOMS : ROOMS.filter((r) => r.status === filter),
    [filter]
  );

  const byFloor = useMemo(() => {
    const m = new Map<number, Room[]>();
    filtered.forEach((r) => {
      const arr = m.get(r.floor) ?? [];
      arr.push(r);
      m.set(r.floor, arr);
    });
    return Array.from(m.entries()).sort((a, b) => b[0] - a[0]);
  }, [filtered]);

  return (
    <SafeAreaView style={styles.safe}>
      {/* Compact summary strip */}
      <View style={styles.summaryBar}>
        <Text style={styles.summaryHero}>{occPct}%</Text>
        <Text style={styles.summarySub}>occ</Text>
        <View style={styles.summaryDot} />
        <Text style={[styles.summaryHero, { color: '#15803d' }]}>{counts.ready}</Text>
        <Text style={styles.summarySub}>ready</Text>
        <View style={styles.summaryDot} />
        <Text style={[styles.summaryHero, { color: '#a16207' }]}>{counts.dirty}</Text>
        <Text style={styles.summarySub}>dirty</Text>
        {counts.ooo > 0 && <>
          <View style={styles.summaryDot} />
          <Text style={[styles.summaryHero, { color: '#b91c1c' }]}>{counts.ooo}</Text>
          <Text style={styles.summarySub}>OOO</Text>
        </>}
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Today's movement card */}
        <View style={styles.movementCard}>
          <View style={styles.moveCell}>
            <Text style={styles.moveValue}>42</Text>
            <Text style={styles.moveLabel}>Arrivals</Text>
          </View>
          <View style={styles.moveDivider} />
          <View style={styles.moveCell}>
            <Text style={styles.moveValue}>38</Text>
            <Text style={styles.moveLabel}>Departures</Text>
          </View>
          <View style={styles.moveDivider} />
          <View style={styles.moveCell}>
            <Text style={[styles.moveValue, { color: counts.ready < 42 ? '#b91c1c' : C.text }]}>
              {counts.ready} / 42
            </Text>
            <Text style={styles.moveLabel}>Ready vs arr.</Text>
          </View>
        </View>

        {/* Filter chips */}
        <View style={styles.filterRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
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
          </ScrollView>
        </View>

        {/* Floor sections */}
        {byFloor.map(([floor, rooms]) => (
          <View key={floor} style={styles.floorBlock}>
            <SectionLabel>Floor {floor} · {rooms.length}</SectionLabel>
            <View style={styles.grid}>
              {rooms.map((r) => {
                const cfg = STATUS_CFG[r.status];
                return (
                  <TouchableOpacity
                    key={r.number}
                    style={[styles.roomCard, { borderColor: cfg.ring, backgroundColor: cfg.bg }]}
                    onPress={() => router.push(`/rishab/room/${r.number}` as any)}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.roomNumber}>{r.number}</Text>
                    <Text style={[styles.roomStatus, { color: cfg.color }]}>{cfg.label}</Text>
                    <Text style={styles.roomType}>{r.type}</Text>
                    {r.note && <Text style={styles.roomNote} numberOfLines={1}>· {r.note}</Text>}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}

        <View style={{ height: 80 }} />
      </ScrollView>

      {/* FAB — quick ticket */}
      <View style={styles.fab}>
        <TouchableOpacity
          style={styles.fabBtn}
          onPress={() => router.push('/rishab/tickets' as any)}
          activeOpacity={0.88}
        >
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.fabText}>Quick ticket</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  scroll: { flex: 1 },
  content: { padding: S.lg, gap: S.sm },

  summaryBar: {
    flexDirection: 'row',
    alignItems: 'baseline',
    paddingHorizontal: S.lg,
    paddingTop: S.md,
    paddingBottom: S.sm,
    gap: 6,
    backgroundColor: C.bg,
    flexWrap: 'wrap',
  },
  summaryHero: { fontSize: F.md, fontWeight: '800', color: C.text, letterSpacing: -0.3 },
  summarySub: { fontSize: F.xs, fontWeight: '600', color: C.sub, marginRight: 2 },
  summaryDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: C.faint, alignSelf: 'center' },

  movementCard: {
    flexDirection: 'row',
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: R.lg,
    paddingVertical: S.md,
  },
  moveCell: { flex: 1, alignItems: 'center' },
  moveDivider: { width: 1, backgroundColor: C.borderSoft },
  moveValue: { fontSize: F.lg, fontWeight: '800', color: C.text, letterSpacing: -0.3 },
  moveLabel: { fontSize: 10, color: C.hint, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.4, marginTop: 2 },

  filterRow: { marginTop: S.sm, marginHorizontal: -S.lg },
  filterScroll: { paddingHorizontal: S.lg, gap: S.xs },
  chip: {
    paddingHorizontal: S.md, paddingVertical: 6,
    borderRadius: R.full, borderWidth: 1, borderColor: C.border,
    backgroundColor: C.card,
  },
  chipActive: { backgroundColor: C.ink, borderColor: C.ink },
  chipText: { fontSize: F.xs, fontWeight: '700', color: C.sub },
  chipTextActive: { color: '#fff' },

  floorBlock: { gap: S.sm, marginTop: S.md },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: S.xs + 2 },
  roomCard: {
    width: '23.5%',
    aspectRatio: 0.92,
    borderRadius: R.md,
    borderWidth: 1,
    padding: 6,
    justifyContent: 'space-between',
  },
  roomNumber: { fontSize: F.md, fontWeight: '800', color: C.text },
  roomStatus: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.4 },
  roomType: { fontSize: 10, color: C.sub, fontWeight: '600' },
  roomNote: { fontSize: 9, color: C.sub, marginTop: 1 },

  fab: { position: 'absolute', right: S.lg, bottom: S.lg },
  fabBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: C.brand,
    paddingHorizontal: S.lg, paddingVertical: S.md,
    borderRadius: R.full,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18, shadowRadius: 8, elevation: 6,
  },
  fabText: { color: '#fff', fontSize: F.sm, fontWeight: '700' },
});
