import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { useMemo } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { C, F, R, S } from '../../src/theme';
import { SectionLabel } from '../../src/components/web-ui/SectionLabel';
import { useTickets, type Ticket } from '../../src/store/ticketsContext';
import { WATCHLIST_ROOMS } from '../../src/data/amir-inventory';

export default function SydneyRooms() {
  const router = useRouter();
  const { allTickets } = useTickets();

  const open = useMemo(() => allTickets.filter((t) => t.status !== 'resolved'), [allTickets]);

  const oooRooms      = open.filter((t) => t.revenueLost > 0);
  const arrivalRisk   = open.filter((t) => t.guestContext === 'arrival');
  const occupiedIssue = open.filter((t) => t.guestContext === 'occupied_urgent');
  const repeatRooms   = open.filter((t) => t.repeatInRoom);

  const totalAtRisk = oooRooms.length + arrivalRisk.length + occupiedIssue.length;
  const revenueAtRisk = oooRooms.reduce((sum, t) => sum + t.revenueLost, 0) +
                        arrivalRisk.reduce((sum, t) => sum + t.revenueLost, 0);

  return (
    <SafeAreaView style={styles.safe}>
      {/* Compact summary strip */}
      <View style={styles.summaryBar}>
        <Text style={styles.summaryHero}>{totalAtRisk}</Text>
        <Text style={styles.summarySub}>at risk</Text>
        <View style={styles.summaryDot} />
        <Text style={[styles.summaryHero, { color: '#b91c1c' }]}>{oooRooms.length}</Text>
        <Text style={styles.summarySub}>OOO</Text>
        <View style={styles.summaryDot} />
        <Text style={[styles.summaryHero, { color: '#b45309' }]}>{arrivalRisk.length}</Text>
        <Text style={styles.summarySub}>arrival risk</Text>
        {revenueAtRisk > 0 && <>
          <View style={styles.summaryDot} />
          <Text style={[styles.summaryHero, { color: '#b91c1c' }]}>${revenueAtRisk}</Text>
          <Text style={styles.summarySub}>/night</Text>
        </>}
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        <RoomSection
          label="OOO rooms"
          tone="urgent"
          tickets={oooRooms}
          onPress={(id) => router.push(`/sydney/ticket/${id}` as any)}
          subBuilder={(t) => `Down ${t.updatedAt} · $${t.revenueLost}/night`}
        />

        <RoomSection
          label="Arrival risk"
          tone="warn"
          tickets={arrivalRisk}
          onPress={(id) => router.push(`/sydney/ticket/${id}` as any)}
          subBuilder={(t) => `Arrival pending · ${t.title.split('·')[0].trim()}`}
        />

        <RoomSection
          label="Occupied issues"
          tone="warn"
          tickets={occupiedIssue}
          onPress={(id) => router.push(`/sydney/ticket/${id}` as any)}
          subBuilder={(t) => `Guest inside · ${t.title.split('·')[0].trim()}`}
        />

        <RoomSection
          label="Repeat issue rooms"
          tone="muted"
          tickets={repeatRooms}
          onPress={(id) => router.push(`/sydney/ticket/${id}` as any)}
          subBuilder={(t) => `${t.title} · history shows pattern`}
        />

        {/* Watchlist (from Amir handover + history) */}
        <View style={styles.sectionHead}>
          <View style={[styles.sectionDot, { backgroundColor: '#5b21b6' }]} />
          <SectionLabel>Watchlist rooms</SectionLabel>
          <View style={[styles.countChip, { backgroundColor: '#e0e7ff' }]}>
            <Text style={[styles.countText, { color: '#5b21b6' }]}>{WATCHLIST_ROOMS.length}</Text>
          </View>
        </View>
        <View style={styles.feed}>
          {WATCHLIST_ROOMS.map((w: { number: string; reason: string }, i: number) => (
            <View
              key={w.number}
              style={[styles.feedRow, i < WATCHLIST_ROOMS.length - 1 && styles.feedBorder]}
            >
              <View style={styles.watchPill}>
                <Text style={styles.watchPillText}>{w.number}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.feedTitle}>Room {w.number}</Text>
                <Text style={styles.feedSub} numberOfLines={2}>{w.reason}</Text>
              </View>
            </View>
          ))}
        </View>

        {totalAtRisk + repeatRooms.length === 0 && (
          <View style={styles.empty}>
            <Ionicons name="checkmark-done-circle-outline" size={48} color={C.green} />
            <Text style={styles.emptyTitle}>All rooms clear</Text>
            <Text style={styles.emptySub}>No rooms at risk right now.</Text>
          </View>
        )}

        <View style={{ height: S.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

/* ─── Room section block ───────────────────────────────── */

type Tone = 'urgent' | 'warn' | 'muted';
const TONE_COLOR: Record<Tone, string> = { urgent: '#b91c1c', warn: '#b45309', muted: C.sub };
const TONE_BG:    Record<Tone, string> = { urgent: '#fee2e2', warn: '#fef3c7', muted: '#f0f0f0' };

function RoomSection({
  label, tone, tickets, onPress, subBuilder,
}: {
  label: string;
  tone: Tone;
  tickets: Ticket[];
  onPress: (id: string) => void;
  subBuilder: (t: Ticket) => string;
}) {
  if (tickets.length === 0) return null;
  return (
    <>
      <View style={styles.sectionHead}>
        <View style={[styles.sectionDot, { backgroundColor: TONE_COLOR[tone] }]} />
        <SectionLabel>{label}</SectionLabel>
        <View style={[styles.countChip, { backgroundColor: TONE_BG[tone] }]}>
          <Text style={[styles.countText, { color: TONE_COLOR[tone] }]}>{tickets.length}</Text>
        </View>
      </View>
      <View style={styles.feed}>
        {tickets.map((t, i) => (
          <TouchableOpacity
            key={t.id}
            style={[styles.feedRow, i < tickets.length - 1 && styles.feedBorder]}
            onPress={() => onPress(t.id)}
            activeOpacity={0.85}
          >
            <View style={[styles.roomPill, { backgroundColor: TONE_BG[tone] }]}>
              <Text style={[styles.roomPillText, { color: TONE_COLOR[tone] }]}>{t.room}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.feedTitle}>Room {t.room}</Text>
              <Text style={styles.feedSub} numberOfLines={2}>{subBuilder(t)}</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={C.faint} />
          </TouchableOpacity>
        ))}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },

  summaryBar: {
    flexDirection: 'row', alignItems: 'baseline',
    paddingHorizontal: S.lg, paddingTop: S.md, paddingBottom: S.sm,
    gap: 6, backgroundColor: C.bg, flexWrap: 'wrap',
  },
  summaryHero: { fontSize: F.md, fontWeight: '800', color: C.text, letterSpacing: -0.3 },
  summarySub: { fontSize: F.xs, fontWeight: '600', color: C.sub, marginRight: 2 },
  summaryDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: C.faint, alignSelf: 'center' },

  scroll: { flex: 1 },
  content: { padding: S.lg, paddingTop: 0, gap: S.md },

  sectionHead: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  sectionDot: { width: 8, height: 8, borderRadius: 4 },
  countChip: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: R.full },
  countText: { fontSize: F.xs, fontWeight: '800' },

  feed: {
    backgroundColor: C.card,
    borderWidth: 1, borderColor: C.border,
    borderRadius: R.lg,
    overflow: 'hidden',
  },
  feedRow: { flexDirection: 'row', alignItems: 'center', gap: S.md, padding: S.md },
  feedBorder: { borderBottomWidth: 1, borderBottomColor: C.borderSoft },
  feedTitle: { fontSize: F.sm, fontWeight: '700', color: C.text },
  feedSub: { fontSize: F.xs, color: C.sub, marginTop: 2, lineHeight: 16 },

  roomPill: {
    minWidth: 44, paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: R.md,
    alignItems: 'center',
  },
  roomPillText: { fontSize: F.sm, fontWeight: '800' },

  watchPill: {
    minWidth: 44, paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: R.md,
    backgroundColor: '#e0e7ff',
    alignItems: 'center',
  },
  watchPillText: { fontSize: F.sm, fontWeight: '800', color: '#5b21b6' },

  empty: { alignItems: 'center', padding: S.xxxl, gap: 4 },
  emptyTitle: { fontSize: F.lg, fontWeight: '800', color: C.text, marginTop: S.sm },
  emptySub: { fontSize: F.xs, color: C.sub, textAlign: 'center' },
});
