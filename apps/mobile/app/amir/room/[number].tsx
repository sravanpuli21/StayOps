import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { C, F, R, S } from '../../../src/theme';
import { useTickets } from '../../../src/store/ticketsContext';
import { useAudits } from '../../../src/store/auditsContext';

// Mock historical data per room — 6 months of past tickets/audits/notes
const ROOM_HISTORY: Record<string, Array<{
  date: string;
  kind: 'ticket' | 'audit' | 'note' | 'guest';
  title: string;
  detail?: string;
  outcome?: 'resolved' | 'escalated' | 'passed' | 'failed';
  tech?: string;
}>> = {
  '315': [
    { date: 'Mar 22', kind: 'ticket', title: 'HVAC capacitor failure',     tech: 'Amir Lopez',  outcome: 'resolved', detail: 'Replaced 45µF capacitor. Fan now running normally.' },
    { date: 'Feb 11', kind: 'ticket', title: 'AC short-cycling',            tech: 'Marcus Webb', outcome: 'resolved', detail: 'Compressor contactor replaced.' },
    { date: 'Jan 28', kind: 'audit',  title: 'HVAC Climate quarterly',      tech: 'Amir Lopez',  outcome: 'passed',   detail: 'Score 93/100. Filter swapped.' },
    { date: 'Jan 14', kind: 'ticket', title: 'Capacitor failure',           tech: 'Amir Lopez',  outcome: 'resolved', detail: 'Second capacitor this year. Flagged for unit replacement consideration.' },
    { date: 'Jan 05', kind: 'guest',  title: 'Guest escalated complaint',   detail: '1-star review mentioning cold room. Manager offered 50% refund.' },
    { date: 'Dec 10', kind: 'ticket', title: 'Thermostat calibration',      tech: 'Marcus Webb', outcome: 'resolved' },
  ],
  '402': [
    { date: 'Apr 11', kind: 'ticket', title: 'TV remote replaced',          tech: 'Amir Lopez',  outcome: 'resolved', detail: 'Remote swapped from stock. Guest left without returning previous.' },
    { date: 'Mar 28', kind: 'ticket', title: 'TV remote batteries dead',    tech: 'Amir Lopez',  outcome: 'resolved', detail: 'New AA batteries. Last replacement noted as recent.' },
    { date: 'Mar 15', kind: 'ticket', title: 'TV remote reported missing',  tech: 'Amir Lopez',  outcome: 'resolved', detail: 'Checked vacant 406 for loose remote, found and returned.' },
    { date: 'Feb 20', kind: 'audit',  title: 'Electronics Q1 audit',        tech: 'Sydney Rivera', outcome: 'passed', detail: 'All devices functional at time of audit.' },
    { date: 'Jan 18', kind: 'note',   title: 'Guest request for Apple TV',  detail: 'Guest asked about HDMI port access. Noted for future enhancement list.' },
  ],
  '508': [
    { date: 'Apr 24', kind: 'ticket', title: 'Shower drain chemical treatment',  tech: 'Amir Lopez',  outcome: 'resolved', detail: 'Partial improvement. Mechanical snake scheduled.' },
    { date: 'Feb 03', kind: 'ticket', title: 'Shower drain slow',                tech: 'Amir Lopez',  outcome: 'resolved', detail: 'Enzyme treatment applied. Typical 5th floor issue.' },
    { date: 'Nov 18', kind: 'ticket', title: 'Bathroom grout recaulk',           tech: 'Marcus Webb', outcome: 'resolved' },
    { date: 'Nov 05', kind: 'audit',  title: 'Bathroom annual audit',            tech: 'Sydney Rivera', outcome: 'passed', detail: 'Score 88/100. Grout flagged.' },
  ],
  '109': [
    { date: 'Apr 26', kind: 'ticket', title: 'AC vibration noise',           tech: 'Amir Lopez',  outcome: 'resolved', detail: 'Fan blade loose — ordered part, temp fix to silence for tonight.' },
    { date: 'Jan 22', kind: 'ticket', title: 'AC unit running loud',         tech: 'Marcus Webb', outcome: 'resolved' },
    { date: 'Oct 12', kind: 'ticket', title: 'Fan motor replaced',           tech: 'Marcus Webb', outcome: 'resolved' },
  ],
  '204': [
    { date: 'Feb 08', kind: 'audit',  title: 'Bathroom quarterly',           tech: 'Amir Lopez', outcome: 'passed' },
  ],
};

const KIND_CFG: Record<string, { icon: string; color: string; bg: string }> = {
  ticket: { icon: 'construct-outline',   color: C.amber,  bg: C.amberBg },
  audit:  { icon: 'checkmark-circle-outline', color: C.purple, bg: C.purpleBg },
  note:   { icon: 'create-outline',      color: C.blue,   bg: C.blueBg },
  guest:  { icon: 'person-outline',      color: C.red,    bg: C.redBg },
};

const OUTCOME_CFG: Record<string, { color: string; bg: string; label: string }> = {
  resolved:  { color: C.green, bg: C.greenBg, label: 'Resolved' },
  escalated: { color: C.red,   bg: C.redBg,   label: 'Escalated' },
  passed:    { color: C.green, bg: C.greenBg, label: 'Passed' },
  failed:    { color: C.red,   bg: C.redBg,   label: 'Failed' },
};

export default function RoomHistory() {
  const { number } = useLocalSearchParams<{ number: string }>();
  const router = useRouter();
  const { allTickets } = useTickets();
  const { allAudits } = useAudits();

  const roomNum = number ?? '';
  const history = ROOM_HISTORY[roomNum] ?? [];

  // Live tickets still open on this room
  const liveTickets = allTickets.filter((t) => t.room === roomNum && t.status !== 'resolved');
  const liveAudits  = allAudits.filter((a) => a.room === roomNum && a.state !== 'completed');

  const ticketCount12mo = history.filter((h) => h.kind === 'ticket').length + liveTickets.length;
  const repeatPattern   = ticketCount12mo >= 3;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={C.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Room {roomNum}</Text>
        {repeatPattern && (
          <View style={styles.repeatBadge}>
            <Text style={styles.repeatText}>REPEAT</Text>
          </View>
        )}
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Summary card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryCell}>
              <Text style={styles.summaryValue}>{ticketCount12mo}</Text>
              <Text style={styles.summaryLabel}>tickets</Text>
              <Text style={styles.summarySub}>last 12 mo</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryCell}>
              <Text style={styles.summaryValue}>{history.filter((h) => h.kind === 'audit').length}</Text>
              <Text style={styles.summaryLabel}>audits</Text>
              <Text style={styles.summarySub}>last 12 mo</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryCell}>
              <Text style={[styles.summaryValue, { color: liveTickets.length > 0 ? C.red : C.green }]}>
                {liveTickets.length}
              </Text>
              <Text style={styles.summaryLabel}>open now</Text>
              <Text style={styles.summarySub}>live</Text>
            </View>
          </View>

          {repeatPattern && (
            <View style={styles.patternAlert}>
              <Ionicons name="flag" size={14} color={C.purple} />
              <Text style={styles.patternText}>
                This room has had {ticketCount12mo} tickets in 12 months. Consider preventive action.
              </Text>
            </View>
          )}
        </View>

        {/* Live tickets */}
        {liveTickets.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Open now</Text>
            {liveTickets.map((t) => (
              <TouchableOpacity
                key={t.id}
                style={styles.historyItem}
                onPress={() => router.push(`/amir/ticket/${t.id}` as any)}
                activeOpacity={0.88}
              >
                <View style={[styles.itemIcon, { backgroundColor: C.redBg }]}>
                  <Ionicons name="alert-circle" size={16} color={C.red} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemTitle}>{t.title}</Text>
                  <Text style={styles.itemSub}>{t.id} · {t.updatedAt}</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={C.hint} />
              </TouchableOpacity>
            ))}
          </>
        )}

        {/* Live audits */}
        {liveAudits.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Pending audit</Text>
            {liveAudits.map((a) => (
              <TouchableOpacity
                key={a.id}
                style={styles.historyItem}
                onPress={() => router.push('/amir/audit')}
                activeOpacity={0.88}
              >
                <View style={[styles.itemIcon, { backgroundColor: C.purpleBg }]}>
                  <Ionicons name="checkmark-circle-outline" size={16} color={C.purple} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemTitle}>{a.area}</Text>
                  <Text style={styles.itemSub}>{a.items.length} items · {a.state === 'paused' ? 'paused' : 'pending'}</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={C.hint} />
              </TouchableOpacity>
            ))}
          </>
        )}

        {/* Historical timeline */}
        <Text style={styles.sectionTitle}>History (last 12 months)</Text>
        {history.length === 0 && (
          <View style={styles.empty}>
            <Ionicons name="file-tray-outline" size={32} color={C.hint} />
            <Text style={styles.emptyText}>No recorded history for this room</Text>
          </View>
        )}
        {history.map((h, i) => {
          const cfg = KIND_CFG[h.kind];
          const outcome = h.outcome ? OUTCOME_CFG[h.outcome] : null;
          return (
            <View key={i} style={styles.timelineItem}>
              <View style={styles.timelineLeft}>
                <View style={[styles.itemIcon, { backgroundColor: cfg.bg }]}>
                  <Ionicons name={cfg.icon as any} size={14} color={cfg.color} />
                </View>
                {i < history.length - 1 && <View style={styles.timelineLine} />}
              </View>
              <View style={styles.timelineContent}>
                <View style={styles.timelineHeader}>
                  <Text style={styles.timelineTitle}>{h.title}</Text>
                  <Text style={styles.timelineDate}>{h.date}</Text>
                </View>
                {h.detail && <Text style={styles.timelineDetail}>{h.detail}</Text>}
                <View style={styles.timelineFooter}>
                  {h.tech && (
                    <View style={styles.techChip}>
                      <Ionicons name="person-outline" size={10} color={C.hint} />
                      <Text style={styles.techText}>{h.tech}</Text>
                    </View>
                  )}
                  {outcome && (
                    <View style={[styles.outcomeChip, { backgroundColor: outcome.bg }]}>
                      <Text style={[styles.outcomeText, { color: outcome.color }]}>{outcome.label}</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          );
        })}

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
    gap: S.md,
    paddingHorizontal: S.lg,
    paddingVertical: S.md,
    backgroundColor: C.card,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: F.lg, fontWeight: '800', color: C.text, flex: 1 },
  repeatBadge: { backgroundColor: C.purpleBg, paddingHorizontal: 8, paddingVertical: 4, borderRadius: R.full },
  repeatText: { fontSize: 10, fontWeight: '800', color: C.purple },

  scroll: { flex: 1 },
  content: { padding: S.xl, gap: S.md },

  summaryCard: { backgroundColor: C.card, borderRadius: R.xl, padding: S.lg, gap: S.md },
  summaryGrid: { flexDirection: 'row' },
  summaryCell: { flex: 1, alignItems: 'center' },
  summaryDivider: { width: 1, height: 40, backgroundColor: C.border, alignSelf: 'center' },
  summaryValue: { fontSize: F.xxl, fontWeight: '800', color: C.text },
  summaryLabel: { fontSize: F.xs, color: C.sub, fontWeight: '700' },
  summarySub: { fontSize: 10, color: C.hint },
  patternAlert: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: S.sm,
    backgroundColor: C.purpleBg,
    borderRadius: R.lg,
    padding: S.sm,
  },
  patternText: { flex: 1, fontSize: F.xs, color: C.purple, fontWeight: '600', lineHeight: 18 },

  sectionTitle: { fontSize: F.xs, fontWeight: '700', color: C.hint, textTransform: 'uppercase', letterSpacing: 0.8, marginTop: S.sm },

  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.md,
    backgroundColor: C.card,
    borderRadius: R.lg,
    padding: S.md,
  },
  itemIcon: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  itemTitle: { fontSize: F.sm, fontWeight: '700', color: C.text },
  itemSub: { fontSize: F.xs, color: C.hint, marginTop: 1 },

  empty: { alignItems: 'center', gap: S.sm, paddingVertical: S.xl, backgroundColor: C.card, borderRadius: R.lg },
  emptyText: { fontSize: F.sm, color: C.hint },

  // Timeline
  timelineItem: { flexDirection: 'row', gap: S.sm },
  timelineLeft: { alignItems: 'center', width: 32 },
  timelineLine: { width: 2, flex: 1, backgroundColor: C.border, marginVertical: 4 },
  timelineContent: { flex: 1, backgroundColor: C.card, borderRadius: R.lg, padding: S.md, marginBottom: S.sm },
  timelineHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: S.sm },
  timelineTitle: { flex: 1, fontSize: F.sm, fontWeight: '700', color: C.text },
  timelineDate: { fontSize: F.xs, color: C.hint },
  timelineDetail: { fontSize: F.xs, color: C.sub, marginTop: 4, lineHeight: 18 },
  timelineFooter: { flexDirection: 'row', gap: S.sm, marginTop: S.sm, flexWrap: 'wrap' },
  techChip: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: C.input,
    paddingHorizontal: 6, paddingVertical: 2,
    borderRadius: R.full,
  },
  techText: { fontSize: 10, fontWeight: '600', color: C.sub },
  outcomeChip: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: R.full },
  outcomeText: { fontSize: 10, fontWeight: '700' },
});
