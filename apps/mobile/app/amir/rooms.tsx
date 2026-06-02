import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, TextInput } from 'react-native';
import { useState, useMemo } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { C, F, R, S } from '../../src/theme';
import { SectionLabel } from '../../src/components/web-ui/SectionLabel';
import { useTickets } from '../../src/store/ticketsContext';
import { WATCHLIST_ROOMS } from '../../src/data/amir-inventory';

const RECENT_ROOMS = ['315', '402', '510', '420', '512', '218'];

export default function AmirRooms() {
  const router = useRouter();
  const { allTickets } = useTickets();
  const [query, setQuery] = useState('');

  const ticketsByRoom = useMemo(() => {
    const m = new Map<string, number>();
    allTickets.forEach((t) => {
      if (t.status === 'resolved') return;
      m.set(t.room, (m.get(t.room) ?? 0) + 1);
    });
    return m;
  }, [allTickets]);

  const repeatRooms = useMemo(() => {
    const m = new Map<string, number>();
    allTickets.forEach((t) => {
      m.set(t.room, (m.get(t.room) ?? 0) + 1);
    });
    return Array.from(m.entries())
      .filter(([, n]) => n >= 2)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [allTickets]);

  const filtered = query.trim().length > 0
    ? RECENT_ROOMS.filter((r) => r.includes(query.trim()))
    : RECENT_ROOMS;

  function go(room: string) {
    router.push(`/amir/room/${room}` as any);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Search box */}
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={18} color={C.hint} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search room number"
            placeholderTextColor={C.hint}
            style={styles.searchInput}
            keyboardType="number-pad"
            returnKeyType="search"
            onSubmitEditing={() => query.trim() && go(query.trim())}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close-circle" size={18} color={C.hint} />
            </TouchableOpacity>
          )}
        </View>

        {/* Recent rooms */}
        <SectionLabel>{query.length > 0 ? 'Matches' : 'Recent rooms'}</SectionLabel>
        <View style={styles.grid}>
          {filtered.map((r) => {
            const open = ticketsByRoom.get(r) ?? 0;
            return (
              <TouchableOpacity key={r} style={styles.roomCard} onPress={() => go(r)} activeOpacity={0.85}>
                <Text style={styles.roomNum}>{r}</Text>
                {open > 0 ? (
                  <View style={styles.openBadge}>
                    <Text style={styles.openBadgeText}>{open} open</Text>
                  </View>
                ) : (
                  <Text style={styles.roomMeta}>—</Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Watchlist */}
        <SectionLabel>Watchlist rooms</SectionLabel>
        <View style={styles.card}>
          {WATCHLIST_ROOMS.map((w: { number: string; reason: string }, i: number) => (
            <TouchableOpacity
              key={w.number}
              style={[styles.row, i < WATCHLIST_ROOMS.length - 1 && styles.rowBorder]}
              onPress={() => go(w.number)}
              activeOpacity={0.85}
            >
              <View style={styles.watchPill}>
                <Text style={styles.watchPillText}>{w.number}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowTitle}>Room {w.number}</Text>
                <Text style={styles.rowSub} numberOfLines={2}>{w.reason}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={C.faint} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Repeat issues */}
        {repeatRooms.length > 0 && (
          <>
            <SectionLabel>Repeat issues</SectionLabel>
            <View style={styles.card}>
              {repeatRooms.map(([room, n], i) => (
                <TouchableOpacity
                  key={room}
                  style={[styles.row, i < repeatRooms.length - 1 && styles.rowBorder]}
                  onPress={() => go(room)}
                  activeOpacity={0.85}
                >
                  <View style={[styles.repeatPill, { backgroundColor: '#fef3c7' }]}>
                    <Ionicons name="refresh-outline" size={14} color="#b45309" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rowTitle}>Room {room}</Text>
                    <Text style={styles.rowSub}>{n} tickets in last 30 days</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={C.faint} />
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        <View style={{ height: S.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  scroll: { flex: 1 },
  content: { padding: S.lg, gap: S.sm },

  searchBox: {
    flexDirection: 'row', alignItems: 'center', gap: S.sm,
    backgroundColor: C.card,
    borderWidth: 1, borderColor: C.border,
    borderRadius: R.full,
    paddingHorizontal: S.md, paddingVertical: 10,
  },
  searchInput: { flex: 1, fontSize: F.md, color: C.text, padding: 0 },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: S.sm },
  roomCard: {
    width: '31%',
    backgroundColor: C.card,
    borderWidth: 1, borderColor: C.border,
    borderRadius: R.lg,
    padding: S.md,
    alignItems: 'flex-start',
    gap: 6,
  },
  roomNum: { fontSize: F.xl, fontWeight: '800', color: C.text, letterSpacing: -0.5 },
  roomMeta: { fontSize: F.xs, color: C.hint, fontWeight: '600' },

  openBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: R.full, backgroundColor: '#fee2e2' },
  openBadgeText: { fontSize: 10, fontWeight: '800', color: '#b91c1c' },

  card: {
    backgroundColor: C.card,
    borderWidth: 1, borderColor: C.border,
    borderRadius: R.lg,
    overflow: 'hidden',
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: S.md, padding: S.md },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: C.borderSoft },
  rowTitle: { fontSize: F.sm, fontWeight: '700', color: C.text },
  rowSub: { fontSize: F.xs, color: C.sub, marginTop: 2 },

  watchPill: {
    minWidth: 44, paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: R.md,
    backgroundColor: '#fee2e2',
    alignItems: 'center',
  },
  watchPillText: { fontSize: F.sm, fontWeight: '800', color: '#b91c1c' },

  repeatPill: {
    width: 32, height: 32, borderRadius: R.md,
    alignItems: 'center', justifyContent: 'center',
  },
});
