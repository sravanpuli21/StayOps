import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { C, F, R, S } from '../../../src/theme';

const TICKET_DATA: Record<string, any> = {
  T003: {
    id: 'T003', room: '315', floor: 3, area: 'HVAC / Climate',
    type: 'reactive', priority: 'urgent', status: 'open',
    title: 'OOO – HVAC unit not cooling',
    description: 'Room placed OOO after guest complaint. HVAC compressor appears to be running but not producing cold air. Thermostat reads 82°F despite being set to 68°F.',
    reportedBy: 'Emma Johnson (Supervisor)',
    createdAt: '2h ago', updatedAt: '45m ago',
    estimatedCost: 280, revenueLost: 174,
    activity: [
      { time: '11:32 AM', actor: 'Emma Johnson', action: 'Ticket created', icon: 'add-circle-outline' },
      { time: '11:45 AM', actor: 'Sydney Rivera', action: 'Assigned to Amir Lopez', icon: 'person-outline' },
      { time: '12:18 PM', actor: 'Amir Lopez', action: 'Viewed – heading to room now', icon: 'eye-outline' },
    ],
  },
  T001: {
    id: 'T001', room: '109', floor: 1, area: 'HVAC / Climate',
    type: 'reactive', priority: 'high', status: 'in_progress',
    title: 'AC making loud vibration noise',
    description: 'Guests in rooms 108 and 110 both complaining about noise from 109. AC unit running but fan assembly vibrating excessively. May be a loose mount or worn fan blade.',
    reportedBy: 'Front Desk',
    createdAt: '18h ago', updatedAt: '6h ago',
    estimatedCost: 150, revenueLost: 0,
    activity: [
      { time: 'Yesterday 6:00 PM', actor: 'Front Desk', action: 'Ticket created', icon: 'add-circle-outline' },
      { time: 'Yesterday 6:30 PM', actor: 'Sydney Rivera', action: 'Assigned to Amir Lopez', icon: 'person-outline' },
      { time: 'Today 8:15 AM', actor: 'Amir Lopez', action: 'In progress – fan blade loose, ordered part', icon: 'construct-outline' },
    ],
  },
  T012: {
    id: 'T012', room: '204', floor: 2, area: 'Bathroom',
    type: 'reactive', priority: 'normal', status: 'open',
    title: 'Bathroom exhaust fan not working',
    description: 'Exhaust fan motor not responding when switch toggled. Breaker shows no trip. Possible motor failure or wiring fault at the switch.',
    reportedBy: 'Rosa Navarro (Housekeeping)',
    createdAt: '1d ago', updatedAt: '1d ago',
    estimatedCost: 90, revenueLost: 0,
    activity: [
      { time: 'Yesterday 9:00 AM', actor: 'Rosa Navarro', action: 'Ticket created during inspection', icon: 'add-circle-outline' },
      { time: 'Yesterday 9:30 AM', actor: 'Sydney Rivera', action: 'Assigned to Amir Lopez', icon: 'person-outline' },
    ],
  },
  T007: {
    id: 'T007', room: '412', floor: 4, area: 'HVAC / Climate',
    type: 'preventive', priority: 'normal', status: 'scheduled',
    title: 'Quarterly HVAC filter replacement',
    description: 'Scheduled quarterly maintenance. Replace PTAC filter, check refrigerant level, clean coils, verify thermostat calibration.',
    reportedBy: 'Maintenance Schedule',
    createdAt: '3d ago', updatedAt: '3d ago',
    estimatedCost: 45, revenueLost: 0,
    activity: [
      { time: 'Apr 24', actor: 'System', action: 'Preventive maintenance scheduled', icon: 'calendar-outline' },
    ],
  },
  T019: {
    id: 'T019', room: '508', floor: 5, area: 'Plumbing',
    type: 'reactive', priority: 'high', status: 'in_progress',
    title: 'Shower drain slow / backing up',
    description: 'Shower drain almost completely blocked. Chemical drain treatment attempted yesterday with partial success. Will need mechanical snake to clear fully.',
    reportedBy: 'Guest Complaint',
    createdAt: '4d ago', updatedAt: '1d ago',
    estimatedCost: 120, revenueLost: 0,
    activity: [
      { time: 'Apr 23', actor: 'Front Desk', action: 'Guest complaint logged', icon: 'add-circle-outline' },
      { time: 'Apr 23', actor: 'Amir Lopez', action: 'Chemical treatment applied – partial improvement', icon: 'water-outline' },
      { time: 'Apr 24', actor: 'Amir Lopez', action: 'Mechanical snake scheduled', icon: 'time-outline' },
    ],
  },
};

const PRIORITY_CFG: Record<string, { color: string; bg: string; label: string }> = {
  urgent: { color: C.red,   bg: C.redBg,   label: 'URGENT' },
  high:   { color: C.amber, bg: C.amberBg, label: 'HIGH' },
  normal: { color: C.blue,  bg: C.blueBg,  label: 'NORMAL' },
};

const STATUS_NEXT: Record<string, { label: string; newStatus: string; color: string }[]> = {
  open:        [{ label: 'Start Working', newStatus: 'in_progress', color: C.amber }, { label: 'Escalate', newStatus: 'escalated', color: C.red }],
  in_progress: [{ label: 'Mark Resolved', newStatus: 'resolved', color: C.green }, { label: 'Need Part', newStatus: 'pending_part', color: C.purple }],
  scheduled:   [{ label: 'Start Working', newStatus: 'in_progress', color: C.amber }],
};

export default function TicketDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const ticket = TICKET_DATA[id ?? ''];

  if (!ticket) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: C.sub }}>Ticket not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const p = PRIORITY_CFG[ticket.priority] ?? PRIORITY_CFG.normal;
  const actions = STATUS_NEXT[ticket.status] ?? [];

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={C.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{ticket.id}</Text>
        <View style={[styles.priorityBadge, { backgroundColor: p.bg }]}>
          <Text style={[styles.priorityText, { color: p.color }]}>{p.label}</Text>
        </View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Title & meta */}
        <View style={styles.titleCard}>
          <Text style={styles.ticketTitle}>{ticket.title}</Text>
          <View style={styles.metaRow}>
            <View style={styles.metaChip}>
              <Ionicons name="bed-outline" size={12} color={C.hint} />
              <Text style={styles.metaText}>Room {ticket.room} · Floor {ticket.floor}</Text>
            </View>
            <View style={styles.metaChip}>
              <Ionicons name="grid-outline" size={12} color={C.hint} />
              <Text style={styles.metaText}>{ticket.area}</Text>
            </View>
          </View>
        </View>

        {/* Description */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Description</Text>
          <Text style={styles.desc}>{ticket.description}</Text>
        </View>

        {/* Details grid */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Details</Text>
          <View style={styles.detailGrid}>
            {[
              { label: 'Reported by', value: ticket.reportedBy },
              { label: 'Created', value: ticket.createdAt },
              { label: 'Type', value: ticket.type },
              { label: 'Est. Cost', value: `$${ticket.estimatedCost}` },
            ].map((d) => (
              <View key={d.label} style={styles.detailItem}>
                <Text style={styles.detailLabel}>{d.label}</Text>
                <Text style={styles.detailValue}>{d.value}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Revenue at risk */}
        {ticket.revenueLost > 0 && (
          <View style={styles.revenueAlert}>
            <Ionicons name="alert-circle" size={16} color={C.red} />
            <View style={{ flex: 1 }}>
              <Text style={styles.revenueTitle}>Revenue at risk</Text>
              <Text style={styles.revenueSub}>${ticket.revenueLost}/night · room is OOO</Text>
            </View>
          </View>
        )}

        {/* Actions */}
        {actions.length > 0 && (
          <View style={styles.actionsSection}>
            <Text style={styles.sectionLabel}>Update Status</Text>
            <View style={styles.actionsRow}>
              {actions.map((a) => (
                <TouchableOpacity
                  key={a.label}
                  style={[styles.actionBtn, { backgroundColor: a.color }]}
                  activeOpacity={0.85}
                >
                  <Text style={styles.actionText}>{a.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Add note */}
        <View style={styles.noteSection}>
          <Text style={styles.sectionLabel}>Add Note</Text>
          <TouchableOpacity style={styles.noteInput} activeOpacity={0.8}>
            <Text style={styles.notePlaceholder}>Tap to add a note or update...</Text>
          </TouchableOpacity>
        </View>

        {/* Activity timeline */}
        <View style={styles.activitySection}>
          <Text style={styles.sectionLabel}>Activity</Text>
          <View style={styles.timeline}>
            {ticket.activity.map((a: any, i: number) => (
              <View key={i} style={styles.timelineItem}>
                <View style={styles.timelineDotWrap}>
                  <View style={styles.timelineDot} />
                  {i < ticket.activity.length - 1 && <View style={styles.timelineLine} />}
                </View>
                <View style={styles.timelineContent}>
                  <View style={styles.timelineHeader}>
                    <Text style={styles.timelineActor}>{a.actor}</Text>
                    <Text style={styles.timelineTime}>{a.time}</Text>
                  </View>
                  <Text style={styles.timelineAction}>{a.action}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

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
  priorityBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: R.full },
  priorityText: { fontSize: F.xs, fontWeight: '800' },

  scroll: { flex: 1 },
  content: { padding: S.xl, gap: S.md },

  titleCard: {
    backgroundColor: C.card,
    borderRadius: R.xl,
    padding: S.lg,
  },
  ticketTitle: { fontSize: F.xl, fontWeight: '800', color: C.text, marginBottom: S.sm },
  metaRow: { flexDirection: 'row', gap: S.sm, flexWrap: 'wrap' },
  metaChip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: C.input, paddingHorizontal: 8, paddingVertical: 4, borderRadius: R.full },
  metaText: { fontSize: F.xs, color: C.sub, fontWeight: '600' },

  card: { backgroundColor: C.card, borderRadius: R.xl, padding: S.lg },
  cardLabel: { fontSize: F.xs, fontWeight: '700', color: C.hint, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: S.sm },
  desc: { fontSize: F.md, color: C.text, lineHeight: 22 },

  detailGrid: { gap: S.sm },
  detailItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  detailLabel: { fontSize: F.sm, color: C.sub },
  detailValue: { fontSize: F.sm, fontWeight: '600', color: C.text },

  revenueAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.sm,
    backgroundColor: C.redBg,
    borderWidth: 1,
    borderColor: '#fca5a5',
    borderRadius: R.lg,
    padding: S.md,
  },
  revenueTitle: { fontSize: F.sm, fontWeight: '700', color: C.red },
  revenueSub: { fontSize: F.xs, color: C.sub },

  actionsSection: { gap: S.sm },
  sectionLabel: { fontSize: F.xs, fontWeight: '700', color: C.hint, textTransform: 'uppercase', letterSpacing: 0.6 },
  actionsRow: { flexDirection: 'row', gap: S.sm },
  actionBtn: { flex: 1, paddingVertical: S.md, borderRadius: R.lg, alignItems: 'center' },
  actionText: { fontSize: F.md, fontWeight: '700', color: '#fff' },

  noteSection: { gap: S.sm },
  noteInput: { backgroundColor: C.card, borderRadius: R.lg, padding: S.lg, borderWidth: 1, borderColor: C.border, minHeight: 80 },
  notePlaceholder: { fontSize: F.md, color: C.hint },

  activitySection: { gap: S.sm },
  timeline: { gap: 0 },
  timelineItem: { flexDirection: 'row', gap: S.md },
  timelineDotWrap: { alignItems: 'center', width: 16 },
  timelineDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: C.amber, marginTop: 4 },
  timelineLine: { width: 2, flex: 1, backgroundColor: C.border, marginVertical: 2 },
  timelineContent: { flex: 1, paddingBottom: S.lg },
  timelineHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
  timelineActor: { fontSize: F.sm, fontWeight: '700', color: C.text },
  timelineTime: { fontSize: F.xs, color: C.hint },
  timelineAction: { fontSize: F.sm, color: C.sub },
});
