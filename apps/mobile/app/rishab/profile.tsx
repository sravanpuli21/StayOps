import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { C, F, R, S } from '../../src/theme';
import { SectionLabel } from '../../src/components/web-ui/SectionLabel';

const STATS = [
  { label: 'Hotels', value: '1' },
  { label: 'Reports', value: '24' },
  { label: 'Tenure', value: '3y 4mo' },
];

export default function RishabProfile() {
  const router = useRouter();

  function row(icon: keyof typeof Ionicons.glyphMap, title: string, sub?: string, onPress?: () => void, danger?: boolean) {
    return (
      <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.85}>
        <Ionicons name={icon} size={18} color={danger ? '#b91c1c' : C.sub} />
        <View style={{ flex: 1 }}>
          <Text style={[styles.rowTitle, danger && { color: '#b91c1c' }]}>{title}</Text>
          {sub && <Text style={styles.rowSub}>{sub}</Text>}
        </View>
        {onPress && !danger && <Ionicons name="chevron-forward" size={16} color={C.faint} />}
      </TouchableOpacity>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Identity */}
        <View style={styles.idCard}>
          <View style={styles.idTop}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>RP</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>Rishab Patel</Text>
              <Text style={styles.role}>General Manager</Text>
              <Text style={styles.property}>BTRCI · Home2 Suites Baton Rouge</Text>
            </View>
          </View>
          <View style={styles.statRow}>
            {STATS.map((s, i) => (
              <View key={s.label} style={[styles.stat, i < STATS.length - 1 && styles.statBorder]}>
                <Text style={styles.statValue}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <SectionLabel>Today</SectionLabel>
        <View style={styles.card}>
          {row('time-outline', 'Day shift', '7:00 AM – 6:00 PM')}
          <View style={styles.divider} />
          {row('walk-outline', 'Property walk', 'Started 10:00 AM')}
          <View style={styles.divider} />
          {row('people-outline', '24 staff on shift', '4 maintenance · 8 housekeeping · 4 front desk · 8 other')}
        </View>

        <SectionLabel>Settings</SectionLabel>
        <View style={styles.card}>
          {row('notifications-outline', 'Notifications', 'Urgent tickets, escalations, corp tasks', () => Alert.alert('Notifications'))}
          <View style={styles.divider} />
          {row('language-outline', 'Language', 'English (US)', () => Alert.alert('Language'))}
          <View style={styles.divider} />
          {row('moon-outline', 'Theme', 'System', () => Alert.alert('Theme'))}
          <View style={styles.divider} />
          {row('help-circle-outline', 'Help & feedback', undefined, () => Alert.alert('Help'))}
        </View>

        <View style={styles.card}>
          {row('swap-horizontal-outline', 'Switch user', 'Back to persona picker', () => router.replace('/'))}
          <View style={styles.divider} />
          {row(
            'log-out-outline',
            'Sign out',
            undefined,
            () => Alert.alert('Sign out?', 'You will need to log in again.', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Sign out', style: 'destructive', onPress: () => router.replace('/') },
            ]),
            true,
          )}
        </View>

        <Text style={styles.version}>StayOps · v0.1 · BTRCI</Text>
        <View style={{ height: S.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  scroll: { flex: 1 },
  content: { padding: S.lg, gap: S.sm },

  idCard: {
    backgroundColor: C.card,
    borderWidth: 1, borderColor: C.border,
    borderRadius: R.lg,
    overflow: 'hidden',
  },
  idTop: { flexDirection: 'row', alignItems: 'center', gap: S.md, padding: S.lg, borderBottomWidth: 1, borderBottomColor: C.border },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: C.brandBg, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: F.lg, fontWeight: '800', color: C.brand },
  name: { fontSize: F.lg, fontWeight: '800', color: C.text },
  role: { fontSize: F.sm, color: C.sub, marginTop: 1 },
  property: { fontSize: F.xs, color: C.hint, marginTop: 2 },

  statRow: { flexDirection: 'row' },
  stat: { flex: 1, alignItems: 'center', paddingVertical: S.md },
  statBorder: { borderRightWidth: 1, borderRightColor: C.border },
  statValue: { fontSize: F.md, fontWeight: '800', color: C.text },
  statLabel: { fontSize: 10, color: C.hint, marginTop: 2, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.4 },

  card: {
    backgroundColor: C.card,
    borderWidth: 1, borderColor: C.border,
    borderRadius: R.lg,
    overflow: 'hidden',
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: S.md, padding: S.md },
  rowTitle: { fontSize: F.sm, fontWeight: '600', color: C.text },
  rowSub: { fontSize: F.xs, color: C.sub, marginTop: 2 },
  divider: { height: 1, backgroundColor: C.border, marginLeft: S.md + 18 + S.md },

  version: { fontSize: F.xs, color: C.hint, textAlign: 'center', marginTop: S.lg },
});
