import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Alert, TextInput } from 'react-native';
import { useState, useMemo } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { C, F, R, S } from '../../src/theme';
import { SectionLabel } from '../../src/components/web-ui/SectionLabel';
import { useTickets } from '../../src/store/ticketsContext';
import {
  INVENTORY, USAGE_TODAY, WATCHLIST_ROOMS, FOLLOWUP_TICKETS, SYDNEY_NOTES,
} from '../../src/data/amir-inventory';

type Mode = 'morning' | 'evening';

export default function SydneyHandover() {
  const router = useRouter();
  const { allTickets } = useTickets();

  /* Default to morning until 2 PM, evening after */
  const defaultMode: Mode = new Date().getHours() < 14 ? 'morning' : 'evening';
  const [mode, setMode] = useState<Mode>(defaultMode);
  const [extraNote, setExtraNote] = useState('');

  const open = useMemo(() => allTickets.filter((tk) => tk.status !== 'resolved'), [allTickets]);
  const fixedToday = useMemo(() => allTickets.filter((tk) => tk.status === 'resolved').slice(0, 8), [allTickets]);
  const unresolved = useMemo(() => open.filter((tk) => tk.priority === 'urgent' || tk.priority === 'high').slice(0, 8), [open]);
  const partsLow = INVENTORY.filter((p) => p.level === 'low' || p.level === 'out');
  const borrowed = USAGE_TODAY.filter((u) => u.source === 'another_room');

  function send() {
    Alert.alert(
      'Send handover to Amir',
      'Amir will receive your evening handover. He can act on items immediately.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Send',  onPress: () => { Alert.alert('Sent', 'Handover delivered to Amir.'); router.replace('/sydney' as any); } },
      ]
    );
  }

  function convertToTicket(ix: number) {
    Alert.alert('Convert to ticket', `Open new repair ticket from this note?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Create ticket', onPress: () => Alert.alert('Created', `Ticket created from note ${ix + 1}.`) },
    ]);
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Mode toggle */}
      <View style={styles.modeBar}>
        <TouchableOpacity
          style={[styles.modeBtn, mode === 'morning' && styles.modeBtnActive]}
          onPress={() => setMode('morning')}
          activeOpacity={0.85}
        >
          <Ionicons name="sunny-outline" size={14} color={mode === 'morning' ? '#fff' : C.sub} />
          <Text style={[styles.modeText, mode === 'morning' && styles.modeTextActive]}>Morning · from Amir</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modeBtn, mode === 'evening' && styles.modeBtnActive]}
          onPress={() => setMode('evening')}
          activeOpacity={0.85}
        >
          <Ionicons name="moon-outline" size={14} color={mode === 'evening' ? '#fff' : C.sub} />
          <Text style={[styles.modeText, mode === 'evening' && styles.modeTextActive]}>Evening · to Amir</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* MORNING — review what Amir left */}
        {mode === 'morning' && (
          <>
            <View style={styles.heading}>
              <Text style={styles.title}>From Amir last night</Text>
              <Text style={styles.sub}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })} · 8:30 AM review</Text>
            </View>

            <SectionLabel>Notes from Amir</SectionLabel>
            <View style={styles.card}>
              {SYDNEY_NOTES.map((n, i) => (
                <View key={i} style={[styles.row, i < SYDNEY_NOTES.length - 1 && styles.rowBorder]}>
                  <View style={styles.amirAvatar}>
                    <Text style={styles.amirAvatarText}>AL</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rowTitle}>{n.body}</Text>
                    <Text style={styles.rowSub}>{n.from} · {n.at}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => convertToTicket(i)}
                    style={styles.miniBtn}
                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                  >
                    <Ionicons name="add-circle-outline" size={16} color={C.brand} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            {/* Borrowed items + auto follow-ups */}
            {borrowed.length > 0 && (
              <>
                <SectionLabel>Borrowed items</SectionLabel>
                <View style={styles.card}>
                  {borrowed.map((b, i) => (
                    <View key={b.id} style={[styles.row, i < borrowed.length - 1 && styles.rowBorder]}>
                      <Ionicons name="swap-horizontal-outline" size={18} color="#b45309" />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.rowTitle}>{b.itemName} · {b.sourceRoom} → {b.destinationRoom}</Text>
                        <Text style={styles.rowSub}>{b.variant} · {b.loggedAt}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </>
            )}

            {FOLLOWUP_TICKETS.length > 0 && (
              <>
                <SectionLabel>Follow-up tickets</SectionLabel>
                <View style={styles.card}>
                  {FOLLOWUP_TICKETS.map((f, i) => (
                    <View key={f.id} style={[styles.row, i < FOLLOWUP_TICKETS.length - 1 && styles.rowBorder]}>
                      <Ionicons name="git-branch-outline" size={18} color={f.arrivalSoon ? '#b91c1c' : C.sub} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.rowTitle}>Room {f.room} · {f.title}</Text>
                        <Text style={styles.rowSub}>
                          {f.arrivalSoon ? 'URGENT — arrival today · ' : ''}linked to {f.linkedTicketId}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              </>
            )}

            {/* Unresolved from last night */}
            {unresolved.length > 0 && (
              <>
                <SectionLabel>Unresolved · {unresolved.length}</SectionLabel>
                <View style={styles.card}>
                  {unresolved.map((tk, i) => (
                    <TouchableOpacity
                      key={tk.id}
                      style={[styles.row, i < unresolved.length - 1 && styles.rowBorder]}
                      onPress={() => router.push(`/sydney/ticket/${tk.id}` as any)}
                      activeOpacity={0.85}
                    >
                      <Ionicons name="alert-circle" size={18} color="#b91c1c" />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.rowTitle}>Room {tk.room} · {tk.title}</Text>
                        <Text style={styles.rowSub}>{tk.priority.toUpperCase()} · {tk.status.replace('_', ' ')}</Text>
                      </View>
                      <Ionicons name="chevron-forward" size={16} color={C.faint} />
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}

            {/* Parts needed */}
            {partsLow.length > 0 && (
              <>
                <SectionLabel>Parts low / out · {partsLow.length}</SectionLabel>
                <View style={styles.card}>
                  {partsLow.map((p, i) => (
                    <View key={p.id} style={[styles.row, i < partsLow.length - 1 && styles.rowBorder]}>
                      <Ionicons name="cube-outline" size={18} color={p.level === 'out' ? '#b91c1c' : '#b45309'} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.rowTitle}>{p.name}</Text>
                        <Text style={styles.rowSub}>{p.variant} · {p.count} {p.unit} · PAR {p.par}</Text>
                      </View>
                      <View style={[styles.lvlChip, p.level === 'out' ? styles.lvlChipOut : styles.lvlChipLow]}>
                        <Text style={[styles.lvlChipText, p.level === 'out' ? styles.lvlChipTextOut : styles.lvlChipTextLow]}>{p.level.toUpperCase()}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </>
            )}

            <SectionLabel>Watchlist · {WATCHLIST_ROOMS.length}</SectionLabel>
            <View style={styles.card}>
              {WATCHLIST_ROOMS.map((w: { number: string; reason: string }, i: number) => (
                <View key={w.number} style={[styles.row, i < WATCHLIST_ROOMS.length - 1 && styles.rowBorder]}>
                  <View style={styles.watchPill}>
                    <Text style={styles.watchPillText}>{w.number}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rowTitle}>Room {w.number}</Text>
                    <Text style={styles.rowSub}>{w.reason}</Text>
                  </View>
                </View>
              ))}
            </View>

            <TouchableOpacity
              style={styles.reviewedBtn}
              onPress={() => Alert.alert('Reviewed', 'Morning handover marked reviewed.')}
              activeOpacity={0.88}
            >
              <Ionicons name="checkmark-circle-outline" size={16} color="#15803d" />
              <Text style={styles.reviewedText}>Mark all reviewed</Text>
            </TouchableOpacity>
          </>
        )}

        {/* EVENING — compose for Amir */}
        {mode === 'evening' && (
          <>
            <View style={styles.heading}>
              <Text style={styles.title}>Evening handover to Amir</Text>
              <Text style={styles.sub}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })} · 4 PM compose</Text>
            </View>

            <SectionLabel>Urgent unresolved · {unresolved.length}</SectionLabel>
            <View style={styles.card}>
              {unresolved.length === 0 && <Text style={styles.empty}>Day was clean — nothing urgent to leave.</Text>}
              {unresolved.map((tk, i) => (
                <View key={tk.id} style={[styles.row, i < unresolved.length - 1 && styles.rowBorder]}>
                  <Ionicons name="alert-circle" size={18} color="#b91c1c" />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rowTitle}>Room {tk.room} · {tk.title}</Text>
                    <Text style={styles.rowSub}>{tk.priority.toUpperCase()} · {tk.status.replace('_', ' ')}</Text>
                  </View>
                </View>
              ))}
            </View>

            <SectionLabel>Fixed today · {fixedToday.length}</SectionLabel>
            <View style={styles.card}>
              {fixedToday.length === 0 && <Text style={styles.empty}>No completed tickets yet.</Text>}
              {fixedToday.map((tk, i) => (
                <View key={tk.id} style={[styles.row, i < fixedToday.length - 1 && styles.rowBorder]}>
                  <Ionicons name="checkmark-circle" size={18} color="#15803d" />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rowTitle}>Room {tk.room} · {tk.title}</Text>
                    <Text style={styles.rowSub}>Closed {tk.updatedAt}</Text>
                  </View>
                </View>
              ))}
            </View>

            <SectionLabel>Parts low · {partsLow.length}</SectionLabel>
            <View style={styles.card}>
              {partsLow.map((p, i) => (
                <View key={p.id} style={[styles.row, i < partsLow.length - 1 && styles.rowBorder]}>
                  <Ionicons name="cube-outline" size={18} color={p.level === 'out' ? '#b91c1c' : '#b45309'} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rowTitle}>{p.name}</Text>
                    <Text style={styles.rowSub}>{p.variant} · {p.count} {p.unit}</Text>
                  </View>
                </View>
              ))}
            </View>

            <SectionLabel>Watchlist · {WATCHLIST_ROOMS.length}</SectionLabel>
            <View style={styles.card}>
              {WATCHLIST_ROOMS.map((w: { number: string; reason: string }, i: number) => (
                <View key={w.number} style={[styles.row, i < WATCHLIST_ROOMS.length - 1 && styles.rowBorder]}>
                  <View style={styles.watchPill}>
                    <Text style={styles.watchPillText}>{w.number}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rowTitle}>Room {w.number}</Text>
                    <Text style={styles.rowSub}>{w.reason}</Text>
                  </View>
                </View>
              ))}
            </View>

            <SectionLabel>Notes for Amir</SectionLabel>
            <View style={styles.noteCard}>
              <TextInput
                value={extraNote}
                onChangeText={setExtraNote}
                placeholder="Anything Amir should know tonight? (e.g., 'Call me if 315 complains again')"
                placeholderTextColor={C.hint}
                multiline
                style={styles.noteInput}
              />
            </View>

            <TouchableOpacity style={styles.sendBtn} onPress={send} activeOpacity={0.88}>
              <Ionicons name="paper-plane" size={18} color="#fff" />
              <Text style={styles.sendBtnText}>Send handover to Amir</Text>
            </TouchableOpacity>
          </>
        )}

        <View style={{ height: S.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },

  modeBar: {
    flexDirection: 'row', gap: S.xs,
    paddingHorizontal: S.lg, paddingTop: S.md, paddingBottom: S.sm,
    backgroundColor: C.bg,
  },
  modeBtn: {
    flex: 1,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: S.sm + 2,
    borderRadius: R.full,
    borderWidth: 1, borderColor: C.border,
    backgroundColor: C.card,
  },
  modeBtnActive: { backgroundColor: C.ink, borderColor: C.ink },
  modeText: { fontSize: F.xs, fontWeight: '700', color: C.sub },
  modeTextActive: { color: '#fff' },

  scroll: { flex: 1 },
  content: { padding: S.lg, paddingTop: 0, gap: S.sm },

  heading: { paddingHorizontal: 4 },
  title: { fontSize: F.xl, fontWeight: '800', color: C.text, letterSpacing: -0.3 },
  sub: { fontSize: F.xs, color: C.hint, marginTop: 4 },

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
  empty: { fontSize: F.sm, color: C.hint, padding: S.md, textAlign: 'center' },

  amirAvatar: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#fef3c7',
    alignItems: 'center', justifyContent: 'center',
  },
  amirAvatarText: { fontSize: F.xs, fontWeight: '800', color: '#b45309' },

  miniBtn: {
    width: 32, height: 32, borderRadius: R.md,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: C.brandBg,
  },

  lvlChip: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: R.full },
  lvlChipLow: { backgroundColor: '#fef3c7' },
  lvlChipOut: { backgroundColor: '#fee2e2' },
  lvlChipText: { fontSize: 9, fontWeight: '800', letterSpacing: 0.4 },
  lvlChipTextLow: { color: '#b45309' },
  lvlChipTextOut: { color: '#b91c1c' },

  watchPill: {
    minWidth: 44, paddingHorizontal: 8, paddingVertical: 5,
    borderRadius: R.md,
    backgroundColor: '#e0e7ff',
    alignItems: 'center',
  },
  watchPillText: { fontSize: F.sm, fontWeight: '800', color: '#5b21b6' },

  reviewedBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: S.md,
    backgroundColor: '#dcfce7',
    borderRadius: R.full,
    marginTop: S.sm,
  },
  reviewedText: { fontSize: F.sm, fontWeight: '700', color: '#15803d' },

  noteCard: {
    backgroundColor: C.card,
    borderWidth: 1, borderColor: C.border,
    borderRadius: R.lg,
    padding: S.md,
    minHeight: 100,
  },
  noteInput: { fontSize: F.sm, color: C.text, padding: 0, textAlignVertical: 'top', minHeight: 76 },

  sendBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: C.ink,
    paddingVertical: S.md + 2,
    borderRadius: R.full,
    marginTop: S.sm,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15, shadowRadius: 8, elevation: 4,
  },
  sendBtnText: { color: '#fff', fontSize: F.md, fontWeight: '800', letterSpacing: -0.2 },
});
