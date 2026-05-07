import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { C, F, R, S } from '../../src/theme';
import { CambriaLogo } from '../../src/components/CambriaLogo';
import { useTickets, type TicketStatus } from '../../src/store/ticketsContext';
import { useAudits } from '../../src/store/auditsContext';
import { useInventory } from '../../src/store/inventoryContext';

const PRIORITY_CFG: Record<string, { color: string; bg: string }> = {
  urgent: { color: C.red,   bg: C.redBg },
  high:   { color: C.amber, bg: C.amberBg },
  normal: { color: C.blue,  bg: C.blueBg },
};

const STATUS_CFG: Record<TicketStatus, { color: string; label: string }> = {
  open:         { color: C.red,    label: 'Open' },
  en_route:     { color: C.blue,   label: 'En route' },
  in_progress:  { color: C.amber,  label: 'In Progress' },
  pending_part: { color: C.purple, label: 'Wait part' },
  scheduled:    { color: C.blue,   label: 'Scheduled' },
  resolved:     { color: C.green,  label: 'Resolved' },
  escalated:    { color: C.red,    label: 'Escalated' },
};

const STAFF_TODAY = [
  { name: 'Amir Lopez',   role: 'Maintenance', shift: '7AM–3:30PM' },
  { name: 'Rosa Navarro', role: 'Housekeeping', shift: '8AM–4PM' },
  { name: 'Carlos Reyes', role: 'Housekeeping', shift: '8AM–4PM' },
  { name: 'Priya Nair',   role: 'Front Desk',  shift: '7AM–3PM' },
];

export default function SydneyDashboard() {
  const router = useRouter();
  const { allTickets } = useTickets();
  const { allAudits } = useAudits();
  const { lowItems, criticalItems } = useInventory();

  const openTickets = allTickets
    .filter((t) => t.status !== 'resolved' && t.type !== 'audit')
    .sort((a, b) => {
      const order = { urgent: 0, high: 1, normal: 2 } as const;
      return (order[a.priority] ?? 99) - (order[b.priority] ?? 99);
    });

  const urgent = openTickets.find((t) => t.priority === 'urgent');

  // Audit compliance
  const totalAudits   = allAudits.length;
  const overdue       = allAudits.filter((a) => a.overdueDays > 0 && a.state !== 'completed').length;
  const dueSoon       = allAudits.filter((a) => a.overdueDays === 0 && a.state !== 'completed').length;
  const current       = allAudits.filter((a) => a.state === 'completed').length + (totalAudits - overdue - dueSoon - allAudits.filter((a) => a.state === 'completed').length);
  const compliancePct = Math.round(((totalAudits - overdue) / Math.max(totalAudits, 1)) * 100);

  // Room KPIs — stable mock (Sydney dashboards don't have a rooms store yet)
  const ROOM_KPIS = [
    { label: 'Occupancy', value: '88%', color: C.blue },
    { label: 'OOO',       value: String(allTickets.filter((t) => t.revenueLost > 0 && t.status !== 'resolved').length), color: C.red },
    { label: 'Dirty',     value: '7',  color: C.amber },
    { label: 'Clean',     value: '25', color: C.green },
  ];

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
          <Text style={styles.kpiHotel}>BTRCI · Home2 Suites Baton Rouge</Text>
          <View style={styles.kpiRow}>
            {ROOM_KPIS.map((k) => (
              <View key={k.label} style={styles.kpi}>
                <Text style={[styles.kpiValue, { color: k.color }]}>{k.value}</Text>
                <Text style={styles.kpiLabel}>{k.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Urgent alert */}
        {urgent && (
          <TouchableOpacity
            style={styles.alert}
            onPress={() => router.push(`/sydney/ticket/${urgent.id}` as any)}
            activeOpacity={0.88}
          >
            <Ionicons name="warning" size={16} color={C.red} />
            <View style={{ flex: 1 }}>
              <Text style={styles.alertTitle}>
                Room {urgent.room} · {urgent.revenueLost > 0 ? `$${urgent.revenueLost}/night revenue loss` : urgent.title}
              </Text>
              <Text style={styles.alertSub}>
                {urgent.title.split('–')[1]?.trim() ?? urgent.area} · Amir assigned · {urgent.createdAt}
              </Text>
            </View>
            <Text style={styles.alertAction}>View →</Text>
          </TouchableOpacity>
        )}

        {/* Inventory banner */}
        {lowItems.length > 0 && (
          <TouchableOpacity
            style={styles.invBanner}
            onPress={() => router.push('/sydney/inventory' as any)}
            activeOpacity={0.88}
          >
            <Ionicons name="cube-outline" size={16} color={C.amber} />
            <View style={{ flex: 1 }}>
              <Text style={styles.invBannerTitle}>
                {lowItems.length} inventory item{lowItems.length !== 1 ? 's' : ''} low
              </Text>
              <Text style={styles.invBannerSub}>
                {criticalItems.length} critical · tap to view & request restock
              </Text>
            </View>
            <Text style={styles.invBannerAction}>View →</Text>
          </TouchableOpacity>
        )}

        {/* Audit compliance */}
        <TouchableOpacity
          style={styles.auditCard}
          activeOpacity={0.92}
          onPress={() => router.push('/amir/audit' as any)}
        >
          <View style={styles.auditHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.auditTitle}>Audit Compliance</Text>
              <Text style={styles.auditSub}>
                {overdue > 0 ? `${overdue} area${overdue > 1 ? 's' : ''} overdue this week` : 'All on schedule'}
              </Text>
            </View>
            <Text style={[styles.auditPct, { color: compliancePct >= 85 ? C.green : compliancePct >= 70 ? C.amber : C.red }]}>
              {compliancePct}%
            </Text>
          </View>
          <View style={styles.progressBg}>
            <View style={[styles.progressFill, { width: `${compliancePct}%`, backgroundColor: compliancePct >= 85 ? C.green : compliancePct >= 70 ? C.amber : C.red }]} />
          </View>
          <View style={styles.auditStats}>
            <View style={styles.auditStat}>
              <View style={[styles.statDot, { backgroundColor: C.green }]} />
              <Text style={styles.auditStatText}>{current} current</Text>
            </View>
            <View style={styles.auditStat}>
              <View style={[styles.statDot, { backgroundColor: C.amber }]} />
              <Text style={styles.auditStatText}>{dueSoon} due soon</Text>
            </View>
            <View style={styles.auditStat}>
              <View style={[styles.statDot, { backgroundColor: C.red }]} />
              <Text style={styles.auditStatText}>{overdue} overdue</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Open tickets */}
        <Text style={styles.sectionTitle}>Open Tickets ({openTickets.length})</Text>
        {openTickets.slice(0, 5).map((t) => {
          const p = PRIORITY_CFG[t.priority];
          const st = STATUS_CFG[t.status];
          return (
            <TouchableOpacity
              key={t.id}
              style={styles.ticketCard}
              activeOpacity={0.88}
              onPress={() => router.push(`/sydney/ticket/${t.id}` as any)}
            >
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
                  <Text style={styles.ticketAge}>{t.updatedAt}</Text>
                </View>
                <Text style={styles.ticketTitle}>{t.title}</Text>
                <View style={styles.ticketBottom}>
                  <View style={styles.roomChip}>
                    <Ionicons name="bed-outline" size={11} color={C.hint} />
                    <Text style={styles.roomText}>Room {t.room}</Text>
                  </View>
                  <Text style={styles.assigneeText}>→ Amir</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={16} color={C.hint} />
            </TouchableOpacity>
          );
        })}

        {/* Staff today */}
        <Text style={styles.sectionTitle}>Staff On Shift</Text>
        <TouchableOpacity
          style={styles.staffCard}
          activeOpacity={0.92}
          onPress={() => router.push('/sydney/staff')}
        >
          {STAFF_TODAY.map((s, i) => {
            // Derive "active task" from the live store for Amir; stub others
            let activeTask = 'On shift';
            if (s.name === 'Amir Lopez') {
              const amirActive = allTickets.find((t) => t.status === 'in_progress' || t.status === 'en_route');
              activeTask = amirActive
                ? `${amirActive.id} – Room ${amirActive.room}`
                : `${allTickets.filter((t) => t.status !== 'resolved').length} tickets queued`;
            } else if (s.role === 'Housekeeping') {
              activeTask = s.name === 'Rosa Navarro' ? '12 rooms assigned' : '10 rooms assigned';
            } else if (s.role === 'Front Desk') {
              activeTask = 'Check-ins';
            }
            return (
              <View key={s.name} style={[styles.staffRow, i < STAFF_TODAY.length - 1 && styles.staffBorder]}>
                <View style={styles.staffAvatar}>
                  <Text style={styles.staffInitials}>{s.name.split(' ').map(n => n[0]).join('')}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.staffName}>{s.name}</Text>
                  <Text style={styles.staffTask}>{activeTask}</Text>
                </View>
                <View>
                  <Text style={styles.staffRole}>{s.role}</Text>
                  <Text style={styles.staffShift}>{s.shift}</Text>
                </View>
              </View>
            );
          })}
        </TouchableOpacity>

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

  invBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.sm,
    backgroundColor: C.amberBg,
    borderWidth: 1,
    borderColor: '#fcd34d',
    borderRadius: R.lg,
    padding: S.md,
  },
  invBannerTitle: { fontSize: F.sm, fontWeight: '700', color: C.amber },
  invBannerSub: { fontSize: F.xs, color: C.sub, marginTop: 1 },
  invBannerAction: { fontSize: F.sm, fontWeight: '700', color: C.amber },

  auditCard: { backgroundColor: C.card, borderRadius: R.xl, padding: S.lg, gap: S.sm },
  auditHeader: { flexDirection: 'row', alignItems: 'flex-start' },
  auditTitle: { fontSize: F.md, fontWeight: '700', color: C.text },
  auditSub: { fontSize: F.xs, color: C.sub, marginTop: 1 },
  auditPct: { fontSize: F.xxl, fontWeight: '800' },
  progressBg: { height: 6, backgroundColor: C.border, borderRadius: R.full, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: R.full },
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
