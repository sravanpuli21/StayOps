import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { C, F, R, S } from '../../src/theme';
import { CambriaLogo } from '../../src/components/CambriaLogo';

const TICKETS = [
  { id: 'T003', room: '315', type: 'reactive', priority: 'urgent', title: 'OOO – HVAC unit not cooling', age: '2h ago', status: 'open' },
  { id: 'T001', room: '109', type: 'reactive', priority: 'high',   title: 'AC unit making loud noise', age: '18h ago', status: 'in_progress' },
  { id: 'T007', room: '412', type: 'preventive', priority: 'normal', title: 'Quarterly HVAC filter replacement', age: '3d ago', status: 'scheduled' },
  { id: 'T012', room: '204', type: 'reactive', priority: 'normal', title: 'Bathroom exhaust fan not working', age: '1d ago', status: 'open' },
];

const AUDITS_DUE = [
  { room: '215', area: 'HVAC / Climate', overdueDays: 12, floor: 2 },
  { room: '109', area: 'Plumbing', overdueDays: 6, floor: 1 },
  { room: '312', area: 'Safety Equipment', overdueDays: 3, floor: 3 },
];

const PRIORITY_CFG: Record<string, { color: string; bg: string; label: string }> = {
  urgent: { color: C.red,   bg: C.redBg,   label: 'Urgent' },
  high:   { color: C.amber, bg: C.amberBg, label: 'High' },
  normal: { color: C.blue,  bg: C.blueBg,  label: 'Normal' },
  low:    { color: C.hint,  bg: '#f0f0f0', label: 'Low' },
};

const TYPE_CFG: Record<string, { color: string; label: string }> = {
  reactive:   { color: C.red,    label: 'Reactive' },
  preventive: { color: C.blue,   label: 'Preventive' },
  audit:      { color: C.purple, label: 'Audit' },
  scheduled:  { color: C.sub,    label: 'Scheduled' },
};

export default function AmirHome() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good morning, Amir 👋</Text>
          <Text style={styles.date}>Mon, April 27 · Day Shift</Text>
        </View>
        <CambriaLogo size="sm" />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* KPI strip */}
        <View style={styles.kpiRow}>
          {[
            { label: 'Assigned', value: '4', color: C.amber },
            { label: 'Urgent',   value: '1', color: C.red },
            { label: 'In Progress', value: '1', color: C.blue },
            { label: 'Audits Due', value: '3', color: C.purple },
          ].map((k) => (
            <View key={k.label} style={styles.kpi}>
              <Text style={[styles.kpiValue, { color: k.color }]}>{k.value}</Text>
              <Text style={styles.kpiLabel}>{k.label}</Text>
            </View>
          ))}
        </View>

        {/* Urgent alert */}
        <View style={styles.alert}>
          <Ionicons name="warning" size={16} color={C.red} />
          <View style={{ flex: 1 }}>
            <Text style={styles.alertTitle}>Urgent: Room 315 – HVAC out</Text>
            <Text style={styles.alertSub}>Room is OOO · Guest complaint reported 2h ago</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/amir/ticket/T003')}>
            <Text style={styles.alertAction}>View →</Text>
          </TouchableOpacity>
        </View>

        {/* Today's tickets */}
        <Text style={styles.sectionTitle}>Today's Tickets</Text>
        {TICKETS.map((t) => {
          const p = PRIORITY_CFG[t.priority];
          const ty = TYPE_CFG[t.type];
          return (
            <TouchableOpacity
              key={t.id}
              style={styles.ticketCard}
              onPress={() => router.push(`/amir/ticket/${t.id}` as any)}
              activeOpacity={0.88}
            >
              {/* Priority bar */}
              <View style={[styles.ticketBar, { backgroundColor: p.color }]} />
              <View style={styles.ticketBody}>
                <View style={styles.ticketTop}>
                  <Text style={styles.ticketId}>{t.id}</Text>
                  <View style={[styles.badge, { backgroundColor: p.bg }]}>
                    <Text style={[styles.badgeText, { color: p.color }]}>{p.label}</Text>
                  </View>
                  <View style={[styles.badge, { backgroundColor: '#f0f0f0' }]}>
                    <Text style={[styles.badgeText, { color: ty.color }]}>{ty.label}</Text>
                  </View>
                  <Text style={styles.ticketAge}>{t.age}</Text>
                </View>
                <Text style={styles.ticketTitle}>{t.title}</Text>
                <View style={styles.ticketMeta}>
                  <Ionicons name="location-outline" size={12} color={C.hint} />
                  <Text style={styles.ticketRoom}>Room {t.room}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={16} color={C.hint} />
            </TouchableOpacity>
          );
        })}

        {/* Audits due */}
        <Text style={styles.sectionTitle}>Audits Due</Text>
        {AUDITS_DUE.map((a) => (
          <View key={`${a.room}-${a.area}`} style={styles.auditCard}>
            <View style={[styles.auditDot, { backgroundColor: a.overdueDays > 7 ? C.red : C.amber }]} />
            <View style={{ flex: 1 }}>
              <Text style={styles.auditArea}>{a.area}</Text>
              <Text style={styles.auditRoom}>Room {a.room} · Floor {a.floor}</Text>
            </View>
            <Text style={[styles.auditDays, { color: a.overdueDays > 7 ? C.red : C.amber }]}>
              {a.overdueDays}d overdue
            </Text>
          </View>
        ))}

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

  kpiRow: {
    flexDirection: 'row',
    backgroundColor: C.card,
    borderRadius: R.xl,
    padding: S.lg,
    gap: 0,
  },
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

  sectionTitle: {
    fontSize: F.xs,
    fontWeight: '700',
    color: C.hint,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: S.sm,
  },

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
  ticketBar: { width: 4, alignSelf: 'stretch' },
  ticketBody: { flex: 1, padding: S.md },
  ticketTop: { flexDirection: 'row', alignItems: 'center', gap: S.xs, marginBottom: S.xs, flexWrap: 'wrap' },
  ticketId: { fontSize: F.xs, fontWeight: '700', color: C.hint },
  badge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: R.full },
  badgeText: { fontSize: 10, fontWeight: '700' },
  ticketAge: { fontSize: F.xs, color: C.hint, marginLeft: 'auto' },
  ticketTitle: { fontSize: F.sm, fontWeight: '600', color: C.text, marginBottom: S.xs },
  ticketMeta: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  ticketRoom: { fontSize: F.xs, color: C.hint },

  auditCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.md,
    backgroundColor: C.card,
    borderRadius: R.lg,
    padding: S.md,
  },
  auditDot: { width: 10, height: 10, borderRadius: 5 },
  auditArea: { fontSize: F.sm, fontWeight: '600', color: C.text },
  auditRoom: { fontSize: F.xs, color: C.sub, marginTop: 2 },
  auditDays: { fontSize: F.xs, fontWeight: '700' },
});
