import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Alert, TextInput } from 'react-native';
import { useState, useMemo } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { C, F, R, S } from '../../src/theme';
import { SectionLabel } from '../../src/components/web-ui/SectionLabel';
import { useTickets } from '../../src/store/ticketsContext';
import { INVENTORY, USAGE_TODAY, WATCHLIST_ROOMS, FOLLOWUP_TICKETS } from '../../src/data/amir-inventory';
import { useT } from '../../src/i18n/amir-phrases';

export default function AmirHandover() {
  const router = useRouter();
  const t = useT();
  const { allTickets } = useTickets();
  const [extraNote, setExtraNote] = useState('');

  const fixedToday = useMemo(
    () => allTickets.filter((tk) => tk.status === 'resolved').slice(0, 8),
    [allTickets]
  );
  const unresolved = useMemo(
    () => allTickets.filter((tk) => tk.status !== 'resolved' && tk.status !== 'scheduled').slice(0, 8),
    [allTickets]
  );

  const partsLow = INVENTORY.filter((p) => p.level === 'low' || p.level === 'out');
  const borrowed = USAGE_TODAY.filter((u) => u.source === 'another_room');

  function send() {
    Alert.alert(
      t('send_handover'),
      `Sydney will receive your handover note in the morning.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send',
          onPress: () => {
            Alert.alert('Sent', 'Handover delivered to Sydney.');
            router.replace('/amir' as any);
          },
        },
      ]
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Heading */}
        <View style={styles.heading}>
          <Text style={styles.title}>End-of-shift handover</Text>
          <Text style={styles.sub}>For Sydney · {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</Text>
        </View>

        {/* Fixed today */}
        <SectionLabel>{t('fixed_today')} ({fixedToday.length})</SectionLabel>
        <View style={styles.card}>
          {fixedToday.length === 0 && (
            <Text style={styles.empty}>Nothing closed yet today.</Text>
          )}
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

        {/* Unresolved */}
        <SectionLabel>{t('unresolved')} ({unresolved.length})</SectionLabel>
        <View style={styles.card}>
          {unresolved.length === 0 && (
            <Text style={styles.empty}>All clear — no open work for Sydney to follow up.</Text>
          )}
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

        {/* Parts needed */}
        <SectionLabel>{t('parts_needed')} ({partsLow.length})</SectionLabel>
        <View style={styles.card}>
          {partsLow.length === 0 && (
            <Text style={styles.empty}>Stock looks fine.</Text>
          )}
          {partsLow.map((p, i) => (
            <View key={p.id} style={[styles.row, i < partsLow.length - 1 && styles.rowBorder]}>
              <Ionicons name="cube-outline" size={18} color={p.level === 'out' ? '#b91c1c' : '#b45309'} />
              <View style={{ flex: 1 }}>
                <Text style={styles.rowTitle}>{p.name}</Text>
                <Text style={styles.rowSub}>{p.variant} · {p.count} {p.unit} · PAR {p.par}</Text>
              </View>
              <View style={[styles.lvlChip, p.level === 'out' ? styles.lvlChipOut : styles.lvlChipLow]}>
                <Text style={[styles.lvlChipText, p.level === 'out' ? styles.lvlChipTextOut : styles.lvlChipTextLow]}>
                  {p.level.toUpperCase()}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Items used today */}
        {USAGE_TODAY.length > 0 && (
          <>
            <SectionLabel>Items used today ({USAGE_TODAY.length})</SectionLabel>
            <View style={styles.card}>
              {USAGE_TODAY.map((u, i) => (
                <View key={u.id} style={[styles.row, i < USAGE_TODAY.length - 1 && styles.rowBorder]}>
                  <Ionicons name="cube-outline" size={18} color="#1d4ed8" />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rowTitle}>
                      {u.itemName}{u.variant ? ` · ${u.variant}` : ''}
                      {u.destinationRoom ? ` → Room ${u.destinationRoom}` : ''}
                    </Text>
                    <Text style={styles.rowSub}>
                      from {u.sourceRoom ? `Room ${u.sourceRoom}` : 'inventory'} · {u.loggedAt}
                    </Text>
                    {u.note && <Text style={styles.note}>{u.note}</Text>}
                  </View>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Borrowed items — highlighted, separate from usage list */}
        {borrowed.length > 0 && (
          <>
            <SectionLabel>Borrowed from rooms ({borrowed.length})</SectionLabel>
            <View style={styles.card}>
              {borrowed.map((b, i) => (
                <View key={b.id} style={[styles.row, i < borrowed.length - 1 && styles.rowBorder]}>
                  <Ionicons name="swap-horizontal-outline" size={18} color="#b45309" />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rowTitle}>
                      {b.itemName} from Room {b.sourceRoom} → Room {b.destinationRoom}
                    </Text>
                    <Text style={styles.rowSub}>{b.variant} · {b.loggedAt}</Text>
                    {b.note && <Text style={styles.note}>{b.note}</Text>}
                  </View>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Auto-created follow-up tickets */}
        {FOLLOWUP_TICKETS.length > 0 && (
          <>
            <SectionLabel>Follow-up tickets ({FOLLOWUP_TICKETS.length})</SectionLabel>
            <View style={styles.card}>
              {FOLLOWUP_TICKETS.map((f, i) => (
                <View key={f.id} style={[styles.row, i < FOLLOWUP_TICKETS.length - 1 && styles.rowBorder]}>
                  <Ionicons name="git-branch-outline" size={18} color="#b91c1c" />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rowTitle}>Room {f.room} · {f.title}</Text>
                    <Text style={styles.rowSub}>
                      {f.arrivalSoon ? 'URGENT — arrival today · ' : ''}linked to {f.linkedTicketId}
                    </Text>
                    {f.note && <Text style={styles.note}>{f.note}</Text>}
                  </View>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Watchlist */}
        <SectionLabel>{t('watchlist_rooms')} ({WATCHLIST_ROOMS.length})</SectionLabel>
        <View style={styles.card}>
          {WATCHLIST_ROOMS.map((w, i) => (
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

        {/* Free-form note */}
        <SectionLabel>{t('notes_for_sydney')}</SectionLabel>
        <View style={styles.noteCard}>
          <TextInput
            value={extraNote}
            onChangeText={setExtraNote}
            placeholder="Anything else Sydney should know in the morning?"
            placeholderTextColor={C.hint}
            multiline
            style={styles.noteInput}
          />
        </View>

        {/* Send button */}
        <TouchableOpacity style={styles.sendBtn} onPress={send} activeOpacity={0.88}>
          <Ionicons name="paper-plane" size={18} color="#fff" />
          <Text style={styles.sendBtnText}>{t('send_handover')}</Text>
        </TouchableOpacity>

        <View style={{ height: S.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  scroll: { flex: 1 },
  content: { padding: S.lg, gap: S.sm },

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
  note: { fontSize: F.xs, color: C.text, marginTop: 4, fontStyle: 'italic' },
  empty: { fontSize: F.sm, color: C.hint, padding: S.md, textAlign: 'center' },

  lvlChip: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: R.full },
  lvlChipLow: { backgroundColor: '#fef3c7' },
  lvlChipOut: { backgroundColor: '#fee2e2' },
  lvlChipText: { fontSize: 9, fontWeight: '800', letterSpacing: 0.4 },
  lvlChipTextLow: { color: '#b45309' },
  lvlChipTextOut: { color: '#b91c1c' },

  watchPill: {
    minWidth: 44, paddingHorizontal: 8, paddingVertical: 5,
    borderRadius: R.md,
    backgroundColor: '#fee2e2',
    alignItems: 'center',
  },
  watchPillText: { fontSize: F.sm, fontWeight: '800', color: '#b91c1c' },

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
