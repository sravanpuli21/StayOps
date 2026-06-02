import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { C, F, R, S } from '../../../src/theme';
import { useTickets } from '../../../src/store/ticketsContext';
import { KpiCard } from '../../../src/components/web-ui/KpiCard';
import { SectionLabel } from '../../../src/components/web-ui/SectionLabel';

const ROOM_TYPES: Record<string, { type: string; floor: number; status: string; statusBg: string; statusColor: string }> = {
  '508': { type: 'King',   floor: 5, status: 'OOO',     statusBg: '#fee2e2', statusColor: '#b91c1c' },
  '306': { type: 'Double', floor: 3, status: 'OOO',     statusBg: '#fee2e2', statusColor: '#b91c1c' },
  '406': { type: 'Suite',  floor: 4, status: 'Blocked', statusBg: '#fce7f3', statusColor: '#86198f' },
};

const HISTORY = [
  { date: 'Today',       event: 'Status changed: Occupied → Dirty', actor: 'Rosa N.' },
  { date: 'Yesterday',   event: 'Cleaned',                            actor: 'Rosa N.' },
  { date: 'Yesterday',   event: 'Guest checkout',                     actor: 'Front Desk' },
  { date: '3 days ago',  event: 'Cleaned',                            actor: 'Carlos R.' },
  { date: '4 days ago',  event: 'Maintenance — toilet flush handle',  actor: 'Amir L.' },
  { date: '4 days ago',  event: 'Reported: weak flush',                actor: 'Sydney R.' },
];

export default function RishabRoomDetail() {
  const { number } = useLocalSearchParams<{ number: string }>();
  const router = useRouter();
  const { allTickets } = useTickets();

  const room = ROOM_TYPES[number ?? ''] ?? { type: 'King', floor: Math.floor(Number(number ?? 400) / 100), status: 'Ready', statusBg: '#dcfce7', statusColor: '#15803d' };
  const roomTickets = allTickets.filter((t) => t.room === number);
  const openTicketCount = roomTickets.filter((t) => t.status !== 'resolved').length;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.headerCard}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backRow} activeOpacity={0.7}>
            <Ionicons name="chevron-back" size={20} color={C.sub} />
            <Text style={styles.backText}>Back to rooms</Text>
          </TouchableOpacity>
          <View style={styles.roomTop}>
            <View style={{ flex: 1 }}>
              <Text style={styles.roomNumber}>Room {number}</Text>
              <Text style={styles.roomMeta}>Floor {room.floor} · {room.type}</Text>
            </View>
            <View style={[styles.statusPill, { backgroundColor: room.statusBg }]}>
              <Text style={[styles.statusText, { color: room.statusColor }]}>{room.status}</Text>
            </View>
          </View>
        </View>

        <SectionLabel>Overview</SectionLabel>
        <View style={styles.kpiGrid}>
          <KpiCard label="Last cleaned" value="Yesterday"      subtext="Rosa N." />
          <KpiCard label="Next arrival" value="3:00 PM"        subtext="today" />
          <KpiCard label="Open tickets" value={String(openTicketCount)} subtext={openTicketCount > 0 ? 'see below' : 'none'} alert={openTicketCount > 0} />
          <KpiCard label="YTD repairs"  value="3 · $480"        subtext="repair vs replace" />
        </View>

        {/* Open tickets for this room */}
        {roomTickets.length > 0 && (
          <>
            <SectionLabel>Tickets on this room</SectionLabel>
            {roomTickets.slice(0, 4).map((t) => (
              <TouchableOpacity
                key={t.id}
                style={styles.ticketRow}
                onPress={() => router.push(`/rishab/ticket/${t.id}` as any)}
                activeOpacity={0.85}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.ticketId}>{t.id} · {t.priority.toUpperCase()}</Text>
                  <Text style={styles.ticketTitle}>{t.title}</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={C.faint} />
              </TouchableOpacity>
            ))}
          </>
        )}

        {/* History */}
        <SectionLabel>Recent history</SectionLabel>
        <View style={styles.historyCard}>
          {HISTORY.map((h, i) => (
            <View key={i} style={[styles.historyRow, i < HISTORY.length - 1 && styles.historyBorder]}>
              <View style={styles.historyDot} />
              <View style={{ flex: 1 }}>
                <Text style={styles.historyEvent}>{h.event}</Text>
                <Text style={styles.historyMeta}>{h.date} · {h.actor}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Actions */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: C.ink }]}
            onPress={() => Alert.alert('Quick ticket', `Create ticket for Room ${number}?`, [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Create', onPress: () => Alert.alert('Created', 'TKT-NEW · assigned to Amir') },
            ])}
            activeOpacity={0.85}
          >
            <Ionicons name="add" size={16} color="#fff" />
            <Text style={[styles.actionText, { color: '#fff' }]}>Quick ticket</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: C.card, borderWidth: 1, borderColor: C.border }]}
            onPress={() => Alert.alert('Block room?', `Block Room ${number} from sale?`, [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Block', style: 'destructive', onPress: () => Alert.alert('Blocked', `Room ${number}`) },
            ])}
            activeOpacity={0.85}
          >
            <Ionicons name="lock-closed-outline" size={16} color={C.text} />
            <Text style={[styles.actionText, { color: C.text }]}>Block</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: S.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  scroll: { flex: 1 },
  content: { padding: S.lg, gap: S.sm },

  headerCard: { backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: R.lg, padding: S.lg },
  backRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: S.md, marginLeft: -4 },
  backText: { fontSize: F.sm, fontWeight: '600', color: C.sub },
  roomTop: { flexDirection: 'row', alignItems: 'center' },
  roomNumber: { fontSize: F.h, fontWeight: '800', color: C.text },
  roomMeta: { fontSize: F.sm, color: C.sub, marginTop: 2 },
  statusPill: { paddingHorizontal: S.md, paddingVertical: 6, borderRadius: R.full },
  statusText: { fontSize: F.xs, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.4 },

  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: S.sm },

  ticketRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.card, borderWidth: 1, borderColor: C.border,
    borderRadius: R.lg, padding: S.md,
  },
  ticketId: { fontSize: 10, fontWeight: '800', color: C.hint, letterSpacing: 0.4 },
  ticketTitle: { fontSize: F.sm, fontWeight: '600', color: C.text, marginTop: 2 },

  historyCard: { backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: R.lg, overflow: 'hidden' },
  historyRow: { flexDirection: 'row', alignItems: 'flex-start', gap: S.md, padding: S.md },
  historyBorder: { borderBottomWidth: 1, borderBottomColor: C.border },
  historyDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: C.brand, marginTop: 5 },
  historyEvent: { fontSize: F.sm, fontWeight: '600', color: C.text },
  historyMeta: { fontSize: F.xs, color: C.hint, marginTop: 2 },

  actionRow: { flexDirection: 'row', gap: S.md, marginTop: S.sm },
  actionBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: S.md, borderRadius: R.full,
  },
  actionText: { fontSize: F.sm, fontWeight: '700' },
});
