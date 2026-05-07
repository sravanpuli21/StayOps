import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { C, F, R, S } from '../../src/theme';
import { useTickets } from '../../src/store/ticketsContext';

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
  { number: '302', floor: 3, status: 'ready',    type: 'Double' },
  { number: '303', floor: 3, status: 'occupied', type: 'King' },
  { number: '304', floor: 3, status: 'dirty',    type: 'Double' },
  { number: '305', floor: 3, status: 'occupied', type: 'King' },
  { number: '306', floor: 3, status: 'ready',    type: 'Suite' },
  { number: '307', floor: 3, status: 'occupied', type: 'King' },
  { number: '308', floor: 3, status: 'occupied', type: 'Double' },
  { number: '309', floor: 3, status: 'ready',    type: 'King' },
  { number: '310', floor: 3, status: 'dirty',    type: 'King' },
  { number: '311', floor: 3, status: 'inspect',  type: 'Double' },
  { number: '312', floor: 3, status: 'occupied', type: 'King' },
  { number: '313', floor: 3, status: 'ready',    type: 'King' },
  { number: '314', floor: 3, status: 'occupied', type: 'Double' },
  { number: '315', floor: 3, status: 'ooo',      type: 'King', note: 'HVAC failure' },
  // Floor 2
  { number: '201', floor: 2, status: 'occupied', type: 'King' },
  { number: '202', floor: 2, status: 'ready',    type: 'Double' },
  { number: '203', floor: 2, status: 'occupied', type: 'King' },
  { number: '204', floor: 2, status: 'dirty',    type: 'King' },
  { number: '205', floor: 2, status: 'occupied', type: 'Double' },
  { number: '206', floor: 2, status: 'occupied', type: 'King' },
  { number: '207', floor: 2, status: 'ready',    type: 'Suite' },
  { number: '208', floor: 2, status: 'occupied', type: 'King' },
  { number: '209', floor: 2, status: 'dirty',    type: 'Double' },
  { number: '210', floor: 2, status: 'occupied', type: 'King' },
  { number: '211', floor: 2, status: 'inspect',  type: 'King' },
  { number: '212', floor: 2, status: 'ready',    type: 'Double' },
  { number: '213', floor: 2, status: 'occupied', type: 'King' },
  { number: '214', floor: 2, status: 'occupied', type: 'Double' },
  { number: '215', floor: 2, status: 'dirty',    type: 'King' },
  // Floor 1
  { number: '101', floor: 1, status: 'occupied', type: 'King' },
  { number: '102', floor: 1, status: 'ready',    type: 'Double' },
  { number: '103', floor: 1, status: 'occupied', type: 'King' },
  { number: '104', floor: 1, status: 'ready',    type: 'King' },
  { number: '105', floor: 1, status: 'occupied', type: 'Double' },
  { number: '106', floor: 1, status: 'dirty',    type: 'King' },
  { number: '107', floor: 1, status: 'occupied', type: 'Suite' },
  { number: '108', floor: 1, status: 'ready',    type: 'King' },
  { number: '109', floor: 1, status: 'ooo',      type: 'King', note: 'AC noise' },
  { number: '110', floor: 1, status: 'occupied', type: 'Double' },
];

const STATUS_CFG: Record<RoomStatus, { color: string; textColor: string; label: string }> = {
  ready:    { color: C.roomReady,    textColor: '#15803d', label: 'Ready' },
  occupied: { color: C.roomOccupied, textColor: '#1d4ed8', label: 'Occupied' },
  dirty:    { color: C.roomDirty,    textColor: '#a16207', label: 'Dirty' },
  inspect:  { color: C.roomInspect,  textColor: '#4338ca', label: 'Inspect' },
  ooo:      { color: C.roomOoo,      textColor: '#b91c1c', label: 'OOO' },
  blocked:  { color: C.roomBlocked,  textColor: '#9d174d', label: 'Blocked' },
};

const LEGEND: RoomStatus[] = ['ready', 'occupied', 'dirty', 'inspect', 'ooo', 'blocked'];

const FLOORS = [5, 4, 3, 2, 1];

export default function SydneyRooms() {
  const [filter, setFilter] = useState<RoomStatus | 'all'>('all');
  const [selected, setSelected] = useState<Room | null>(null);
  const router = useRouter();
  const { allTickets } = useTickets();

  const counts = LEGEND.reduce<Record<RoomStatus, number>>((acc, s) => {
    acc[s] = ROOMS.filter(r => r.status === s).length;
    return acc;
  }, {} as Record<RoomStatus, number>);

  const handleRoomAction = (room: Room) => {
    const roomTicket = allTickets.find((t) => t.room === room.number && t.status !== 'resolved');
    const buttons: Array<{ text: string; onPress?: () => void; style?: 'cancel' | 'destructive' | 'default' }> = [];
    if (roomTicket) {
      buttons.push({
        text: `View ticket ${roomTicket.id}`,
        onPress: () => router.push(`/sydney/ticket/${roomTicket.id}` as any),
      });
    }
    buttons.push({ text: 'Create ticket', onPress: () => Alert.alert('Create ticket', 'Ticket form would open here.') });
    buttons.push({ text: 'View history', onPress: () => Alert.alert(`Room ${room.number} history`, 'Past tickets, audits, and inspections would show here.') });
    if (room.status !== 'ooo') {
      buttons.push({ text: 'Mark OOO', style: 'destructive', onPress: () => Alert.alert('Room marked OOO', `Room ${room.number} placed out of order.`) });
    }
    buttons.push({ text: 'Cancel', style: 'cancel' });
    Alert.alert(`Room ${room.number}`, `${room.type} · ${STATUS_CFG[room.status].label}${room.note ? ` · ${room.note}` : ''}`, buttons);
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Room Status</Text>
          <Text style={styles.subtitle}>BTRCI · Home2 Suites Baton Rouge</Text>
        </View>
        <View style={styles.occBadge}>
          <Text style={styles.occPct}>88%</Text>
          <Text style={styles.occLabel}>OCC</Text>
        </View>
      </View>

      {/* Legend / filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.legendScroll} contentContainerStyle={styles.legendContent}>
        <TouchableOpacity
          style={[styles.legendChip, filter === 'all' && styles.legendChipActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.legendText, filter === 'all' && styles.legendTextActive]}>All</Text>
        </TouchableOpacity>
        {LEGEND.map((s) => {
          const cfg = STATUS_CFG[s];
          return (
            <TouchableOpacity
              key={s}
              style={[styles.legendChip, filter === s && styles.legendChipActive, filter === s && { backgroundColor: cfg.color }]}
              onPress={() => setFilter(filter === s ? 'all' : s)}
            >
              <View style={[styles.legendDot, { backgroundColor: cfg.textColor }]} />
              <Text style={[styles.legendText, filter === s && { color: cfg.textColor, fontWeight: '700' }]}>
                {cfg.label} {counts[s]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {FLOORS.map((floor) => {
          const floorRooms = ROOMS.filter(r => r.floor === floor && (filter === 'all' || r.status === filter));
          if (floorRooms.length === 0) return null;
          return (
            <View key={floor}>
              <Text style={styles.floorLabel}>Floor {floor}</Text>
              <View style={styles.roomGrid}>
                {floorRooms.map((room) => {
                  const cfg = STATUS_CFG[room.status];
                  return (
                    <TouchableOpacity
                      key={room.number}
                      style={[styles.roomTile, { backgroundColor: cfg.color }]}
                      onPress={() => setSelected(selected?.number === room.number ? null : room)}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.roomNum, { color: cfg.textColor }]}>{room.number}</Text>
                      <Text style={[styles.roomStatus, { color: cfg.textColor }]}>{cfg.label}</Text>
                      {room.note && <View style={styles.noteDot} />}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          );
        })}

        <View style={{ height: S.xl }} />
      </ScrollView>

      {/* Room detail tooltip */}
      {selected && (
        <View style={styles.detailPanel}>
          <View style={styles.detailRow}>
            <View style={[styles.detailDot, { backgroundColor: STATUS_CFG[selected.status].textColor }]} />
            <Text style={styles.detailRoom}>Room {selected.number}</Text>
            <Text style={styles.detailType}>{selected.type}</Text>
            <View style={[styles.detailBadge, { backgroundColor: STATUS_CFG[selected.status].color }]}>
              <Text style={[styles.detailBadgeText, { color: STATUS_CFG[selected.status].textColor }]}>
                {STATUS_CFG[selected.status].label}
              </Text>
            </View>
            <TouchableOpacity onPress={() => setSelected(null)} style={styles.closeDetail}>
              <Ionicons name="close" size={18} color={C.hint} />
            </TouchableOpacity>
          </View>
          {selected.note && (
            <Text style={styles.detailNote}>
              <Ionicons name="information-circle-outline" size={13} color={C.sub} /> {selected.note}
            </Text>
          )}
          <TouchableOpacity style={styles.actionsBtn} onPress={() => handleRoomAction(selected)} activeOpacity={0.85}>
            <Ionicons name="ellipsis-horizontal-circle-outline" size={16} color={C.blue} />
            <Text style={styles.actionsBtnText}>Actions</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: S.xl,
    paddingVertical: S.lg,
    backgroundColor: C.card,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  title: { fontSize: F.xl, fontWeight: '800', color: C.text },
  subtitle: { fontSize: F.sm, color: C.sub, marginTop: 2 },
  occBadge: { alignItems: 'center', backgroundColor: C.blueBg, paddingHorizontal: S.md, paddingVertical: S.xs, borderRadius: R.lg },
  occPct: { fontSize: F.xl, fontWeight: '800', color: C.blue },
  occLabel: { fontSize: 10, fontWeight: '700', color: C.blue },

  legendScroll: { backgroundColor: C.card, borderBottomWidth: 1, borderBottomColor: C.border },
  legendContent: { flexDirection: 'row', gap: S.xs, paddingHorizontal: S.xl, paddingVertical: S.sm },
  legendChip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: S.sm, paddingVertical: S.xs, borderRadius: R.full, backgroundColor: C.input },
  legendChipActive: { },
  legendDot: { width: 7, height: 7, borderRadius: 4 },
  legendText: { fontSize: F.xs, fontWeight: '600', color: C.sub },
  legendTextActive: { fontWeight: '700' },

  scroll: { flex: 1 },
  content: { padding: S.xl, gap: S.md },
  floorLabel: { fontSize: F.xs, fontWeight: '700', color: C.hint, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: S.xs },
  roomGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: S.xs },
  roomTile: {
    width: 60, height: 52,
    borderRadius: R.md,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  roomNum: { fontSize: F.sm, fontWeight: '800' },
  roomStatus: { fontSize: 10, fontWeight: '600', marginTop: 1 },
  noteDot: { position: 'absolute', top: 4, right: 4, width: 6, height: 6, borderRadius: 3, backgroundColor: C.red },

  detailPanel: {
    backgroundColor: C.card,
    borderTopWidth: 1,
    borderTopColor: C.border,
    padding: S.md,
    paddingBottom: S.xl,
  },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: S.sm },
  detailDot: { width: 10, height: 10, borderRadius: 5 },
  detailRoom: { fontSize: F.md, fontWeight: '800', color: C.text, flex: 1 },
  detailType: { fontSize: F.sm, color: C.sub },
  detailBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: R.full },
  detailBadgeText: { fontSize: F.xs, fontWeight: '700' },
  closeDetail: { padding: 4 },
  detailNote: { fontSize: F.sm, color: C.sub, marginTop: S.xs, paddingLeft: S.md },
  actionsBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 4,
    marginTop: S.sm,
    paddingVertical: S.sm,
    borderRadius: R.md,
    backgroundColor: C.blueBg,
  },
  actionsBtnText: { fontSize: F.sm, fontWeight: '700', color: C.blue },
});
