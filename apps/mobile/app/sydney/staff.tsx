import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C, F, R, S } from '../../src/theme';

type StaffStatus = 'on_task' | 'available' | 'break' | 'off';

interface StaffMember {
  name: string;
  role: string;
  shift: string;
  status: StaffStatus;
  activeTask: string;
  tasksCompleted: number;
  tasksTotal: number;
  phone: string;
  initials: string;
  avatarColor: string;
}

const STAFF: StaffMember[] = [
  {
    name: 'Amir Lopez',
    role: 'Maintenance Tech',
    shift: '7:00 AM – 3:30 PM',
    status: 'on_task',
    activeTask: 'T001 – AC vibration, Room 109',
    tasksCompleted: 2,
    tasksTotal: 6,
    phone: '(912) 555-0142',
    initials: 'AL',
    avatarColor: C.amberBg,
  },
  {
    name: 'Rosa Navarro',
    role: 'Housekeeping',
    shift: '8:00 AM – 4:00 PM',
    status: 'on_task',
    activeTask: 'Cleaning Room 304',
    tasksCompleted: 5,
    tasksTotal: 12,
    phone: '(912) 555-0188',
    initials: 'RN',
    avatarColor: C.purpleBg,
  },
  {
    name: 'Carlos Reyes',
    role: 'Housekeeping',
    shift: '8:00 AM – 4:00 PM',
    status: 'on_task',
    activeTask: 'Cleaning Room 215',
    tasksCompleted: 4,
    tasksTotal: 10,
    phone: '(912) 555-0201',
    initials: 'CR',
    avatarColor: C.greenBg,
  },
  {
    name: 'Priya Nair',
    role: 'Front Desk',
    shift: '7:00 AM – 3:00 PM',
    status: 'on_task',
    activeTask: '3 check-ins pending',
    tasksCompleted: 8,
    tasksTotal: 14,
    phone: '(912) 555-0167',
    initials: 'PN',
    avatarColor: C.blueBg,
  },
  {
    name: 'Marcus Webb',
    role: 'Maintenance Tech',
    shift: '3:30 PM – 11:00 PM',
    status: 'off',
    activeTask: 'Evening shift',
    tasksCompleted: 0,
    tasksTotal: 0,
    phone: '(912) 555-0214',
    initials: 'MW',
    avatarColor: C.input,
  },
  {
    name: 'Lena Torres',
    role: 'Housekeeping',
    shift: '8:00 AM – 4:00 PM',
    status: 'break',
    activeTask: 'Break until 12:30 PM',
    tasksCompleted: 6,
    tasksTotal: 11,
    phone: '(912) 555-0233',
    initials: 'LT',
    avatarColor: C.amberBg,
  },
];

const STATUS_CFG: Record<StaffStatus, { color: string; label: string; dot: string }> = {
  on_task:   { color: C.green,  label: 'On Task',   dot: C.green },
  available: { color: C.blue,   label: 'Available', dot: C.blue },
  break:     { color: C.amber,  label: 'On Break',  dot: C.amber },
  off:       { color: C.hint,   label: 'Off Shift', dot: C.hint },
};

const ROLE_ORDER = ['Maintenance Tech', 'Housekeeping', 'Front Desk'];

export default function SydneyStaff() {
  const grouped = ROLE_ORDER.map((role) => ({
    role,
    members: STAFF.filter(s => s.role === role),
  })).filter(g => g.members.length > 0);

  const onShift = STAFF.filter(s => s.status !== 'off').length;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Staff</Text>
          <Text style={styles.subtitle}>{onShift} of {STAFF.length} on shift today</Text>
        </View>
        <View style={styles.shiftBadge}>
          <Text style={styles.shiftNum}>{onShift}</Text>
          <Text style={styles.shiftLabel}>Active</Text>
        </View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {grouped.map(({ role, members }) => (
          <View key={role}>
            <Text style={styles.sectionLabel}>{role}</Text>
            <View style={styles.group}>
              {members.map((s, i) => {
                const st = STATUS_CFG[s.status];
                const pct = s.tasksTotal > 0 ? (s.tasksCompleted / s.tasksTotal) * 100 : 0;
                return (
                  <View key={s.name} style={[styles.card, i < members.length - 1 && styles.cardBorder]}>
                    {/* Top row */}
                    <View style={styles.cardTop}>
                      <View style={[styles.avatar, { backgroundColor: s.avatarColor }]}>
                        <Text style={[styles.initials, { color: s.status === 'off' ? C.hint : C.text }]}>{s.initials}</Text>
                        <View style={[styles.statusDot, { backgroundColor: st.dot }]} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <View style={styles.nameRow}>
                          <Text style={[styles.name, s.status === 'off' && styles.dimmed]}>{s.name}</Text>
                          <View style={[styles.statusBadge, { backgroundColor: s.status === 'on_task' ? C.greenBg : s.status === 'break' ? C.amberBg : C.input }]}>
                            <Text style={[styles.statusText, { color: st.color }]}>{st.label}</Text>
                          </View>
                        </View>
                        <Text style={styles.shift}>
                          <Ionicons name="time-outline" size={11} color={C.hint} /> {s.shift}
                        </Text>
                      </View>
                    </View>

                    {/* Task row */}
                    <View style={styles.taskRow}>
                      <Ionicons
                        name={s.status === 'break' ? 'cafe-outline' : s.status === 'off' ? 'moon-outline' : 'construct-outline'}
                        size={13}
                        color={C.hint}
                      />
                      <Text style={styles.taskText} numberOfLines={1}>{s.activeTask}</Text>
                    </View>

                    {/* Progress */}
                    {s.tasksTotal > 0 && (
                      <View style={styles.progressRow}>
                        <View style={styles.progressBg}>
                          <View style={[styles.progressFill, { width: `${pct}%`, backgroundColor: pct >= 80 ? C.green : pct >= 40 ? C.blue : C.amber }]} />
                        </View>
                        <Text style={styles.progressText}>{s.tasksCompleted}/{s.tasksTotal} tasks</Text>
                      </View>
                    )}

                    {/* Call button */}
                    <TouchableOpacity style={styles.callBtn} activeOpacity={0.8}>
                      <Ionicons name="call-outline" size={14} color={C.blue} />
                      <Text style={styles.callText}>{s.phone}</Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
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
  shiftBadge: { alignItems: 'center', backgroundColor: C.greenBg, paddingHorizontal: S.md, paddingVertical: S.xs, borderRadius: R.lg },
  shiftNum: { fontSize: F.xl, fontWeight: '800', color: C.green },
  shiftLabel: { fontSize: 10, fontWeight: '700', color: C.green },

  scroll: { flex: 1 },
  content: { padding: S.xl, gap: S.md },
  sectionLabel: { fontSize: F.xs, fontWeight: '700', color: C.hint, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: S.xs },
  group: { backgroundColor: C.card, borderRadius: R.xl, overflow: 'hidden', marginBottom: S.xs },

  card: { padding: S.md, gap: S.xs },
  cardBorder: { borderBottomWidth: 1, borderBottomColor: C.border },

  cardTop: { flexDirection: 'row', gap: S.md, alignItems: 'flex-start' },
  avatar: {
    width: 44, height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  initials: { fontSize: F.sm, fontWeight: '800' },
  statusDot: { position: 'absolute', bottom: 1, right: 1, width: 11, height: 11, borderRadius: 6, borderWidth: 2, borderColor: C.card },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: S.xs, flexWrap: 'wrap' },
  name: { fontSize: F.md, fontWeight: '700', color: C.text },
  dimmed: { color: C.hint },
  statusBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: R.full },
  statusText: { fontSize: 10, fontWeight: '700' },
  shift: { fontSize: F.xs, color: C.hint, marginTop: 2 },

  taskRow: { flexDirection: 'row', alignItems: 'center', gap: S.xs, paddingLeft: 56 },
  taskText: { fontSize: F.sm, color: C.sub, flex: 1 },

  progressRow: { flexDirection: 'row', alignItems: 'center', gap: S.sm, paddingLeft: 56 },
  progressBg: { flex: 1, height: 4, backgroundColor: C.border, borderRadius: R.full, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: R.full },
  progressText: { fontSize: F.xs, color: C.hint, minWidth: 60 },

  callBtn: { flexDirection: 'row', alignItems: 'center', gap: S.xs, paddingLeft: 56 },
  callText: { fontSize: F.xs, color: C.blue, fontWeight: '600' },
});
