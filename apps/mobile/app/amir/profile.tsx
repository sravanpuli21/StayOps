import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { C, F, R, S } from '../../src/theme';
import { CambriaLogo } from '../../src/components/CambriaLogo';

const STATS = [
  { label: 'Tickets Closed', value: '128', period: 'this month' },
  { label: 'Avg Response', value: '42m', period: 'this month' },
  { label: 'Audits Done', value: '34', period: 'this quarter' },
  { label: 'On-Time Rate', value: '94%', period: 'this month' },
];

export default function AmirProfile() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Profile card */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>AL</Text>
          </View>
          <Text style={styles.name}>Amir Lopez</Text>
          <Text style={styles.role}>Maintenance Tech</Text>

          <View style={styles.hotelBadge}>
            <CambriaLogo size="sm" />
          </View>

          <View style={styles.shiftRow}>
            <Ionicons name="time-outline" size={13} color={C.hint} />
            <Text style={styles.shiftText}>Day Shift · 7:00 AM – 3:30 PM</Text>
          </View>
        </View>

        {/* Stats */}
        <Text style={styles.sectionTitle}>Performance</Text>
        <View style={styles.statsGrid}>
          {STATS.map((s) => (
            <View key={s.label} style={styles.statCard}>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
              <Text style={styles.statPeriod}>{s.period}</Text>
            </View>
          ))}
        </View>

        {/* Today summary */}
        <Text style={styles.sectionTitle}>Today's Summary</Text>
        <View style={styles.summaryCard}>
          {[
            { icon: 'checkmark-circle', color: C.green, label: '1 ticket resolved', sub: 'T022 – Room 301 audit passed' },
            { icon: 'construct-outline', color: C.amber, label: '1 ticket in progress', sub: 'T001 – AC noise, Room 109' },
            { icon: 'alert-circle', color: C.red, label: '1 urgent open', sub: 'T003 – HVAC OOO, Room 315' },
            { icon: 'calendar-outline', color: C.blue, label: '3 audits remaining', sub: 'Rooms 215, 312, 508' },
          ].map((item, i) => (
            <View key={i} style={[styles.summaryItem, i < 3 && styles.summaryBorder]}>
              <Ionicons name={item.icon as any} size={18} color={item.color} />
              <View style={{ flex: 1 }}>
                <Text style={styles.summaryLabel}>{item.label}</Text>
                <Text style={styles.summarySub}>{item.sub}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Sign out */}
        <TouchableOpacity style={styles.signOut} onPress={() => router.replace('/')} activeOpacity={0.85}>
          <Ionicons name="log-out-outline" size={18} color={C.red} />
          <Text style={styles.signOutText}>Switch User</Text>
        </TouchableOpacity>

        <View style={{ height: S.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  content: { padding: S.xl, gap: S.md },

  profileCard: {
    backgroundColor: C.card,
    borderRadius: R.xl,
    padding: S.xl,
    alignItems: 'center',
    gap: S.sm,
  },
  avatar: {
    width: 72, height: 72,
    borderRadius: 36,
    backgroundColor: C.amberBg,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: S.xs,
  },
  avatarText: { fontSize: 24, fontWeight: '800', color: C.amber },
  name: { fontSize: F.xl, fontWeight: '800', color: C.text },
  role: { fontSize: F.md, color: C.sub },
  hotelBadge: { marginTop: S.xs },
  shiftRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  shiftText: { fontSize: F.sm, color: C.hint },

  sectionTitle: { fontSize: F.xs, fontWeight: '700', color: C.hint, textTransform: 'uppercase', letterSpacing: 0.8 },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: S.sm },
  statCard: {
    flex: 1, minWidth: '44%',
    backgroundColor: C.card,
    borderRadius: R.lg,
    padding: S.lg,
    alignItems: 'center',
  },
  statValue: { fontSize: F.xxl, fontWeight: '800', color: C.amber },
  statLabel: { fontSize: F.sm, color: C.text, fontWeight: '600', marginTop: 2 },
  statPeriod: { fontSize: F.xs, color: C.hint },

  summaryCard: { backgroundColor: C.card, borderRadius: R.xl, overflow: 'hidden' },
  summaryItem: { flexDirection: 'row', alignItems: 'center', gap: S.md, padding: S.md },
  summaryBorder: { borderBottomWidth: 1, borderBottomColor: C.border },
  summaryLabel: { fontSize: F.sm, fontWeight: '700', color: C.text },
  summarySub: { fontSize: F.xs, color: C.sub, marginTop: 1 },

  signOut: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: S.sm,
    backgroundColor: C.card,
    borderRadius: R.lg,
    padding: S.lg,
    borderWidth: 1,
    borderColor: '#fca5a5',
  },
  signOutText: { fontSize: F.md, fontWeight: '700', color: C.red },
});
