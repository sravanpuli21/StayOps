import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { C, F, R, S } from '../../src/theme';
import { CambriaLogo } from '../../src/components/CambriaLogo';

const OPEN_TICKETS = [
  { id: 'T003', room: '315', priority: 'urgent', title: 'OOO – HVAC not cooling',       assignee: 'Amir',  status: 'open',        age: '2h' },
  { id: 'T001', room: '109', priority: 'high',   title: 'AC making loud vibration noise', assignee: 'Amir',  status: 'in_progress', age: '18h' },
  { id: 'T019', room: '508', priority: 'high',   title: 'Shower drain backing up',        assignee: 'Amir',  status: 'in_progress', age: '4d' },
  { id: 'T012', room: '204', priority: 'normal', title: 'Bathroom exhaust fan broken',    assignee: 'Amir',  status: 'open',        age: '1d' },
];

const PRIORITY_CFG: Record<string, { color: string; bg: string }> = {
  urgent: { color: C.red,   bg: C.redBg },
  high:   { color: C.amber, bg: C.amberBg },
  normal: { color: C.blue,  bg: C.blueBg },
};

const STATUS_CFG: Record<string, { color: string; label: string }> = {
  open:        { color: C.red,   label: 'Open' },
  in_progress: { color: C.amber, label: 'In Progress' },
};

const STAFF_TODAY = [
  { name: 'Amir Lopez',   role: 'Maintenance', shift: '7AM–3:30PM', activeTask: 'T001 – Room 109',  status: 'on_task' },
  { name: 'Rosa Navarro', role: 'Housekeeping', shift: '8AM–4PM',   activeTask: '12 rooms assigned', status: 'on_task' },
  { name: 'Carlos Reyes', role: 'Housekeeping', shift: '8AM–4PM',   activeTask: '10 rooms assigned', status: 'on_task' },
  { name: 'Priya Nair',   role: 'Front Desk',  shift: '7AM–3PM',   activeTask: 'Check-ins',         status: 'on_task' },
];

export default function SydneyDashboard() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good morning, Sydney 👋</Text>
          <Text style={styles.date}>Mon, April 27 · Day Shift</Text>
        </View>
        <CambriaLogo size="sm" />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Hotel KPIs */}
        <View style={styles.kpiCard}>
          <Text style={styles.kpiHotel}>GA989 · Cambria Hotel Savannah</Text>
          <View style={styles.kpiRow}>
            {[
              { label: 'Occupancy', value: '88%',  color: C.blue },
              { label: 'OOO Rooms', value: '2',    color: C.red },
              { label: 'Dirty',     value: '7',    color: C.amber },
              { label: 'Clean',     value: '25',   color: C.green },
            ].map((k) => (
              <View key={k.label} style={styles.kpi}>
                <Text style={[styles.kpiValue, { color: k.color }]}>{k.value}</Text>
                <Text style={styles.kpiLabel}>{k.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Urgent alert */}
        <View style={styles.alert}>
          <Ionicons name="warning" size={16} color={C.red} />
          <View style={{ flex: 1 }}>
            <Text style={styles.alertTitle}>Room 315 OOO · $174/night revenue loss</Text>
            <Text style={styles.alertSub}>HVAC failure · Amir assigned · 2h elapsed</Text>
          </View>
          <TouchableOpacity>
            <Text style={styles.alertAction}>View →</Text>
          </TouchableOpacity>
        </View>

        {/* Audit compliance */}
        <View style={styles.auditCard}>
          <View style={styles.auditHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.auditTitle}>Audit Compliance</Text>
              <Text style={styles.auditSub}>5 areas overdue this week</Text>
            </View>
            <Text style={styles.auditPct}>76%</Text>
          </View>
          <View style={styles.progressBg}>
            <View style={[styles.progressFill, { width: '76%' }]} />
          </View>
          <View style={styles.auditStats}>
            <View style={styles.auditStat}>
              <View style={[styles.statDot, { backgroundColor: C.green }]} />
              <Text style={styles.auditStatText}>38 current</Text>
            </View>
            <View style={styles.auditStat}>
              <View style={[styles.statDot, { backgroundColor: C.amber }]} />
              <Text style={styles.auditStatText}>7 due soon</Text>
            </View>
            <View style={styles.auditStat}>
              <View style={[styles.statDot, { backgroundColor: C.red }]} />
              <Text style={styles.auditStatText}>5 overdue</Text>
            </View>
          </View>
        </View>

        {/* Open tickets */}
        <Text style={styles.sectionTitle}>Open Tickets ({OPEN_TICKETS.length})</Text>
        {OPEN_TICKETS.map((t) => {
          const p = PRIORITY_CFG[t.priority];
          const st = STATUS_CFG[t.status];
          return (
            <TouchableOpacity key={t.id} style={styles.ticketCard} activeOpacity={0.88}>
              <View style={[styles.priorityBar, { backgroundColor: p.color }]} />
              <View style={styles.ticketBody}>
                <View style={styles.ticketTop}>
                  <Text style={styles.ticketId}>{t.id}</Text>
                  <View style={[styles.badge, { backgroundColor: p.bg }]}>
                    <Text style={[styles.badgeText, { color: p.color }]}>{t.priority.toUpperCase()}</Text>
                  </View>
                  <View style={[styles.badge, { backgroundColor: '#f0f0f0' }]}>
                    <Text style={[styles.badgeText, { color: st.color }]}>{st.label}</Text>
                  </View>
                  <Text style={styles.ticketAge}>{t.age} ago</Text>
                </View>
                <Text style={styles.ticketTitle}>{t.title}</Text>
                <View style={styles.ticketBottom}>
                  <View style={styles.roomChip}>
                    <Ionicons name="bed-outline" size={11} color={C.hint} />
                    <Text style={styles.roomText}>Room {t.room}</Text>
                  </View>
                  <Text style={styles.assigneeText}>→ {t.assignee}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={16} color={C.hint} />
            </TouchableOpacity>
          );
        })}

        {/* Staff today */}
        <Text style={styles.sectionTitle}>Staff On Shift</Text>
        <View style={styles.staffCard}>
          {STAFF_TODAY.map((s, i) => (
            <View key={s.name} style={[styles.staffRow, i < STAFF_TODAY.length - 1 && styles.staffBorder]}>
              <View style={styles.staffAvatar}>
                <Text style={styles.staffInitials}>{s.name.split(' ').map(n => n[0]).join('')}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.staffName}>{s.name}</Text>
                <Text style={styles.staffTask}>{s.activeTask}</Text>
              </View>
              <View>
                <Text style={styles.staffRole}>{s.role}</Text>
                <Text style={styles.staffShift}>{s.shift}</Text>
              </View>
            </View>
          ))}
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
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: S.xl,
    paddingTop: S.lg,
    paddingBottom: S.lg,
    backgroundColor: C.card,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  greeting: { fontSize: F.lg, fontWeight: '800', color: C.text },
  date: { fontSize: F.sm, color: C.sub, marginTop: 2 },

  scroll: { flex: 1 },
  content: { padding: S.xl, gap: S.md },

  kpiCard: { backgroundColor: C.card, borderRadius: R.xl, padding: S.lg },
  kpiHotel: { fontSize: F.xs, fontWeight: '700', color: C.hint, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: S.md },
  kpiRow: { flexDirection: 'row', gap: 0 },
  kpi: { flex: 1, alignItems: 'center' },
  kpiValue: { fontSize: F.xl, fontWeight: '800' },
  kpiLabel: { fontSize: F.xs, color: C.hint, marginTop: 2 },

  alert: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.sm,
    backgroundColor: C.redBg,
    borderWidth: 1,
    borderColor: '#fca5a5',
    borderRadius: R.lg,
    padding: S.md,
  },
  alertTitle: { fontSize: F.sm, fontWeight: '700', color: C.red },
  alertSub: { fontSize: F.xs, color: C.sub, marginTop: 1 },
  alertAction: { fontSize: F.sm, fontWeight: '700', color: C.red },

  auditCard: { backgroundColor: C.card, borderRadius: R.xl, padding: S.lg, gap: S.sm },
  auditHeader: { flexDirection: 'row', alignItems: 'flex-start' },
  auditTitle: { fontSize: F.md, fontWeight: '700', color: C.text },
  auditSub: { fontSize: F.xs, color: C.sub, marginTop: 1 },
  auditPct: { fontSize: F.xxl, fontWeight: '800', color: C.blue },
  progressBg: { height: 6, backgroundColor: C.border, borderRadius: R.full, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: C.blue, borderRadius: R.full },
  auditStats: { flexDirection: 'row', gap: S.md },
  auditStat: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statDot: { width: 7, height: 7, borderRadius: 4 },
  auditStatText: { fontSize: F.xs, color: C.sub, fontWeight: '600' },

  sectionTitle: { fontSize: F.xs, fontWeight: '700', color: C.hint, textTransform: 'uppercase', letterSpacing: 0.8, marginTop: S.xs },

  ticketCard: {
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
  ticketBody: { flex: 1, padding: S.md },
  ticketTop: { flexDirection: 'row', alignItems: 'center', gap: S.xs, marginBottom: S.xs, flexWrap: 'wrap' },
  ticketId: { fontSize: F.xs, fontWeight: '700', color: C.hint },
  badge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: R.full },
  badgeText: { fontSize: 10, fontWeight: '700' },
  ticketAge: { fontSize: F.xs, color: C.hint, marginLeft: 'auto' },
  ticketTitle: { fontSize: F.sm, fontWeight: '600', color: C.text, marginBottom: S.xs },
  ticketBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  roomChip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: C.input, paddingHorizontal: 8, paddingVertical: 3, borderRadius: R.full },
  roomText: { fontSize: F.xs, color: C.sub, fontWeight: '600' },
  assigneeText: { fontSize: F.xs, color: C.blue, fontWeight: '700' },

  staffCard: { backgroundColor: C.card, borderRadius: R.xl, overflow: 'hidden' },
  staffRow: { flexDirection: 'row', alignItems: 'center', gap: S.md, padding: S.md },
  staffBorder: { borderBottomWidth: 1, borderBottomColor: C.border },
  staffAvatar: {
    width: 38, height: 38,
    borderRadius: 19,
    backgroundColor: C.blueBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  staffInitials: { fontSize: F.xs, fontWeight: '800', color: C.blue },
  staffName: { fontSize: F.sm, fontWeight: '700', color: C.text },
  staffTask: { fontSize: F.xs, color: C.sub, marginTop: 1 },
  staffRole: { fontSize: F.xs, fontWeight: '700', color: C.hint, textAlign: 'right' },
  staffShift: { fontSize: 10, color: C.hint, textAlign: 'right', marginTop: 1 },
});
