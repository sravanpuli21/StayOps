import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { C, F, R, S } from '../../src/theme';
import { CambriaLogo } from '../../src/components/CambriaLogo';

const STATS = [
  { label: 'Tickets Managed', value: '312',  period: 'this month' },
  { label: 'Avg Resolution',  value: '3.2h', period: 'this month' },
  { label: 'Audit Score',     value: '91%',  period: 'this quarter' },
  { label: 'Staff Managed',   value: '8',    period: 'current' },
];

const QUICK_ACTIONS = [
  { icon: 'add-circle-outline',   label: 'Create Ticket',    color: C.blue },
  { icon: 'megaphone-outline',    label: 'Broadcast Note',   color: C.amber },
  { icon: 'calendar-outline',     label: 'Schedule Audit',   color: C.purple },
  { icon: 'document-text-outline', label: 'Daily Report',    color: C.green },
];

export default function SydneyProfile() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Profile card */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>SR</Text>
          </View>
          <Text style={styles.name}>Sydney Rivera</Text>
          <Text style={styles.role}>Supervisor</Text>

          <View style={styles.hotelBadge}>
            <CambriaLogo size="sm" />
          </View>

          <View style={styles.shiftRow}>
            <Ionicons name="time-outline" size={13} color={C.hint} />
            <Text style={styles.shiftText}>Day Shift · 7:00 AM – 3:00 PM</Text>
          </View>

          <View style={styles.propertyRow}>
            <Ionicons name="location-outline" size={13} color={C.hint} />
            <Text style={styles.propertyText}>GA989 · Savannah, GA</Text>
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

        {/* Quick actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          {QUICK_ACTIONS.map((a) => (
            <TouchableOpacity key={a.label} style={styles.actionCard} activeOpacity={0.85}>
              <View style={[styles.actionIcon, { backgroundColor: `${a.color}18` }]}>
                <Ionicons name={a.icon as any} size={22} color={a.color} />
              </View>
              <Text style={styles.actionLabel}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Today summary */}
        <Text style={styles.sectionTitle}>Today's Summary</Text>
        <View style={styles.summaryCard}>
          {[
            { icon: 'warning',          color: C.red,    label: '1 urgent ticket open',    sub: 'T003 – Room 315 HVAC OOO' },
            { icon: 'construct-outline', color: C.amber,  label: '2 tickets in progress',   sub: 'T001, T019 – Amir assigned' },
            { icon: 'checkmark-circle', color: C.green,  label: '3 tickets resolved today', sub: 'T022, T018, T015' },
            { icon: 'people-outline',   color: C.blue,   label: '5 staff on day shift',     sub: 'Amir, Rosa, Carlos, Priya + 1' },
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
    backgroundColor: C.blueBg,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: S.xs,
  },
  avatarText: { fontSize: 24, fontWeight: '800', color: C.blue },
  name: { fontSize: F.xl, fontWeight: '800', color: C.text },
  role: { fontSize: F.md, color: C.sub },
  hotelBadge: { marginTop: S.xs },
  shiftRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  shiftText: { fontSize: F.sm, color: C.hint },
  propertyRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  propertyText: { fontSize: F.sm, color: C.hint },

  sectionTitle: { fontSize: F.xs, fontWeight: '700', color: C.hint, textTransform: 'uppercase', letterSpacing: 0.8 },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: S.sm },
  statCard: {
    flex: 1, minWidth: '44%',
    backgroundColor: C.card,
    borderRadius: R.lg,
    padding: S.lg,
    alignItems: 'center',
  },
  statValue: { fontSize: F.xxl, fontWeight: '800', color: C.blue },
  statLabel: { fontSize: F.sm, color: C.text, fontWeight: '600', marginTop: 2 },
  statPeriod: { fontSize: F.xs, color: C.hint },

  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: S.sm },
  actionCard: {
    flex: 1, minWidth: '44%',
    backgroundColor: C.card,
    borderRadius: R.lg,
    padding: S.lg,
    alignItems: 'center',
    gap: S.sm,
  },
  actionIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  actionLabel: { fontSize: F.xs, fontWeight: '700', color: C.text, textAlign: 'center' },

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
