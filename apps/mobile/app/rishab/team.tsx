import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C, F, R, S } from '../../src/theme';
import { SectionLabel } from '../../src/components/web-ui/SectionLabel';

const STAFF_TODAY = [
  { name: 'Sydney Rivera',  role: 'Supervisor',     dept: 'Operations',  shift: '6 AM – 2:30 PM', status: 'on_shift' as const, note: 'Walking floors 4–5 with Rishab' },
  { name: 'Amir Lopez',     role: 'Maintenance',    dept: 'Maintenance', shift: '4 PM – 10 PM',  status: 'arriving' as const, note: 'Next: Room 303 AC' },
  { name: 'Rosa Navarro',   role: 'Housekeeping',   dept: 'Housekeeping',shift: '8 AM – 4 PM',    status: 'on_shift' as const, note: '12 rooms assigned · 4 done' },
  { name: 'Carlos Reyes',   role: 'Housekeeping',   dept: 'Housekeeping',shift: '8 AM – 4 PM',    status: 'on_shift' as const, note: '10 rooms assigned · 3 done' },
  { name: 'Priya Nair',     role: 'Front Desk',     dept: 'Front Desk',  shift: '7 AM – 3 PM',    status: 'on_shift' as const, note: 'Handling Room 411 complaint' },
  { name: 'Marco Lin',      role: 'Front Desk',     dept: 'Front Desk',  shift: '3 PM – 11 PM',   status: 'arriving' as const, note: 'OT requested + 4 hrs' },
  { name: 'Ana Vega',       role: 'Breakfast Lead', dept: 'F&B',         shift: '5 AM – 11 AM',   status: 'off_shift' as const, note: 'Shift complete' },
  { name: 'James Doyle',    role: 'Bar Lead',       dept: 'F&B',         shift: '4 PM – 12 AM',  status: 'arriving' as const, note: 'Liquor stock low' },
];

const STATUS_CFG = {
  on_shift:  { label: 'On shift', color: '#15803d', bg: '#dcfce7' },
  arriving:  { label: 'Arriving', color: '#1d4ed8', bg: '#dbeafe' },
  off_shift: { label: 'Off',      color: C.hint,    bg: '#f0f0f0' },
};

const CALLOUTS = [
  { name: 'Beth Tran', role: 'Housekeeping', shift: '8 AM – 4 PM', reason: 'Sick · 2nd this month', covered: 'Carlos picking up' },
];

const DEPARTMENTS = [
  { name: 'Housekeeping', icon: 'sparkles-outline'   as const, color: '#1d4ed8', bg: '#dbeafe', stats: [{ k: 'On shift', v: '2' }, { k: 'Rooms cleaned', v: '7 / 22' }, { k: 'Blockers', v: '0' }] },
  { name: 'Maintenance',  icon: 'construct-outline'  as const, color: '#b45309', bg: '#fef3c7', stats: [{ k: 'On shift', v: '1' }, { k: 'Open work orders', v: '6' }, { k: 'Urgent', v: '2' }] },
  { name: 'Front Desk',   icon: 'people-outline'     as const, color: '#5b21b6', bg: '#e0e7ff', stats: [{ k: 'On shift', v: '1' }, { k: 'Arrivals', v: '42' }, { k: 'Open complaints', v: '1' }] },
  { name: 'F&B',          icon: 'restaurant-outline' as const, color: '#15803d', bg: '#dcfce7', stats: [{ k: 'Breakfast', v: 'Done' }, { k: 'Bar', v: 'Opens 4 PM' }, { k: 'Stock issues', v: '2' }] },
];

export default function RishabTeam() {
  const onShiftCount = STAFF_TODAY.filter((s) => s.status === 'on_shift').length;
  const arrivingCount = STAFF_TODAY.filter((s) => s.status === 'arriving').length;

  return (
    <SafeAreaView style={styles.safe}>
      {/* Compact summary strip */}
      <View style={styles.summaryBar}>
        <Text style={styles.summaryHero}>{onShiftCount} on shift</Text>
        <View style={styles.summaryDot} />
        <Text style={[styles.summaryHero, { color: '#1d4ed8' }]}>{arrivingCount} arriving</Text>
        {CALLOUTS.length > 0 && <>
          <View style={styles.summaryDot} />
          <Text style={[styles.summaryHero, { color: '#b91c1c' }]}>{CALLOUTS.length} callout</Text>
        </>}
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Callouts (urgent first) */}
        {CALLOUTS.length > 0 && (
          <>
            <SectionLabel>Callouts today</SectionLabel>
            {CALLOUTS.map((c) => (
              <View key={c.name} style={styles.calloutCard}>
                <View style={styles.calloutTop}>
                  <Ionicons name="alert-circle" size={18} color="#b91c1c" />
                  <Text style={styles.calloutName}>{c.name}</Text>
                  <Text style={styles.calloutRole}>{c.role}</Text>
                </View>
                <Text style={styles.calloutReason}>{c.reason}</Text>
                <View style={styles.calloutCover}>
                  <Ionicons name="checkmark-circle-outline" size={14} color="#15803d" />
                  <Text style={styles.calloutCoverText}>{c.covered}</Text>
                </View>
              </View>
            ))}
          </>
        )}

        {/* Department status */}
        <SectionLabel>Departments</SectionLabel>
        <View style={styles.deptGrid}>
          {DEPARTMENTS.map((d) => (
            <TouchableOpacity
              key={d.name}
              style={styles.deptCard}
              activeOpacity={0.85}
              onPress={() => Alert.alert(d.name, 'Department detail — coming soon.')}
            >
              <View style={[styles.deptIcon, { backgroundColor: d.bg }]}>
                <Ionicons name={d.icon} size={20} color={d.color} />
              </View>
              <Text style={styles.deptName}>{d.name}</Text>
              {d.stats.map((s) => (
                <View key={s.k} style={styles.deptStat}>
                  <Text style={styles.deptStatLabel}>{s.k}</Text>
                  <Text style={styles.deptStatValue}>{s.v}</Text>
                </View>
              ))}
            </TouchableOpacity>
          ))}
        </View>

        {/* Today's staff */}
        <SectionLabel>Staff on shift</SectionLabel>
        <View style={styles.staffCard}>
          {STAFF_TODAY.map((s, i) => {
            const st = STATUS_CFG[s.status];
            return (
              <View key={s.name} style={[styles.staffRow, i < STAFF_TODAY.length - 1 && styles.staffBorder]}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{s.name.split(' ').map((n) => n[0]).join('')}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.staffNameRow}>
                    <Text style={styles.staffName}>{s.name}</Text>
                    <View style={[styles.statusPill, { backgroundColor: st.bg }]}>
                      <Text style={[styles.statusText, { color: st.color }]}>{st.label}</Text>
                    </View>
                  </View>
                  <Text style={styles.staffRole}>{s.role} · {s.shift}</Text>
                  <Text style={styles.staffNote} numberOfLines={1}>{s.note}</Text>
                </View>
              </View>
            );
          })}
        </View>

        <View style={{ height: S.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },

  summaryBar: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: S.lg, paddingTop: S.md, paddingBottom: S.sm,
    gap: S.sm,
    backgroundColor: C.bg,
    flexWrap: 'wrap',
  },
  summaryHero: { fontSize: F.md, fontWeight: '800', color: C.text, letterSpacing: -0.3 },
  summaryDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: C.faint },

  scroll: { flex: 1 },
  content: { padding: S.lg, gap: S.sm, paddingTop: 0 },

  /* Callouts */
  calloutCard: {
    backgroundColor: '#fef2f2',
    borderWidth: 1, borderColor: '#fca5a5',
    borderRadius: R.lg, padding: S.md, gap: 4,
  },
  calloutTop: { flexDirection: 'row', alignItems: 'center', gap: S.sm },
  calloutName: { fontSize: F.sm, fontWeight: '800', color: '#b91c1c' },
  calloutRole: { fontSize: F.xs, color: C.sub, marginLeft: 'auto', fontWeight: '600' },
  calloutReason: { fontSize: F.xs, color: C.sub, marginTop: 2, fontWeight: '500' },
  calloutCover: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  calloutCoverText: { fontSize: F.xs, color: '#15803d', fontWeight: '700' },

  /* Departments */
  deptGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: S.sm },
  deptCard: {
    width: '48.5%',
    backgroundColor: C.card,
    borderWidth: 1, borderColor: C.border,
    borderRadius: R.lg, padding: S.md, gap: S.xs,
  },
  deptIcon: {
    width: 36, height: 36, borderRadius: R.md,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 4,
  },
  deptName: { fontSize: F.sm, fontWeight: '800', color: C.text, marginBottom: 4 },
  deptStat: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  deptStatLabel: { fontSize: F.xs, color: C.sub, fontWeight: '500' },
  deptStatValue: { fontSize: F.xs, color: C.text, fontWeight: '700' },

  /* Staff */
  staffCard: {
    backgroundColor: C.card,
    borderWidth: 1, borderColor: C.border,
    borderRadius: R.lg, overflow: 'hidden',
  },
  staffRow: { flexDirection: 'row', alignItems: 'center', gap: S.md, padding: S.md },
  staffBorder: { borderBottomWidth: 1, borderBottomColor: C.borderSoft },
  avatar: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: C.brandBg,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: F.xs, fontWeight: '800', color: C.brand },
  staffNameRow: { flexDirection: 'row', alignItems: 'center', gap: S.sm },
  staffName: { fontSize: F.sm, fontWeight: '700', color: C.text, flex: 1 },
  statusPill: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: R.full },
  statusText: { fontSize: 9, fontWeight: '800', letterSpacing: 0.4 },
  staffRole: { fontSize: F.xs, color: C.sub, marginTop: 2, fontWeight: '600' },
  staffNote: { fontSize: F.xs, color: C.hint, marginTop: 2 },
});
