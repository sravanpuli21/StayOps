import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { C, F, R, S } from '../../src/theme';
import { SectionLabel } from '../../src/components/web-ui/SectionLabel';

interface RowDef {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBg: string;
  title: string;
  sub?: string;
  href?: string;
  onPress?: () => void;
}

export default function RishabMore() {
  const router = useRouter();

  const reports: RowDef[] = [
    { icon: 'document-text-outline', iconColor: '#1d4ed8', iconBg: '#dbeafe', title: 'Daily Hotel Summary',  sub: 'One-page GM report' },
    { icon: 'send-outline',          iconColor: C.brand,   iconBg: C.brandBg, title: 'Send Leadership Update', sub: 'One-tap update to Regional Manager' },
    { icon: 'trending-up-outline',   iconColor: '#15803d', iconBg: '#dcfce7', title: 'Revenue Snapshot',     sub: 'Occupancy · ADR · RevPAR' },
    { icon: 'time-outline',          iconColor: '#a16207', iconBg: '#fef9c3', title: 'Payroll & Overtime',   sub: 'Labour cost control' },
    { icon: 'archive-outline',       iconColor: '#5b21b6', iconBg: '#e0e7ff', title: 'Escalation History',   sub: 'What was sent up · resolved' },
  ];

  const operations: RowDef[] = [
    { icon: 'cafe-outline',       iconColor: '#a16207', iconBg: '#fef9c3', title: 'Breakfast & kitchen',  sub: 'Stock · checklist · waste' },
    { icon: 'wine-outline',       iconColor: '#7c3aed', iconBg: '#ede9fe', title: 'Bar',                  sub: 'Stock · opening / closing' },
    { icon: 'cart-outline',       iconColor: '#15803d', iconBg: '#dcfce7', title: 'Suite Shop / Market',  sub: 'Order Tue / Thu · low stock' },
    { icon: 'briefcase-outline',  iconColor: '#1d4ed8', iconBg: '#dbeafe', title: 'Vendors',              sub: 'Approvals · invoice queue' },
    { icon: 'cube-outline',       iconColor: '#b45309', iconBg: '#fef3c7', title: 'Inventory',            sub: 'Stock · reorders · expired' },
  ];

  const account: RowDef[] = [
    { icon: 'person-circle-outline',  iconColor: C.brand, iconBg: C.brandBg, title: 'Profile',              sub: 'Rishab Patel · GM',                onPress: () => router.push('/rishab/profile' as any) },
    { icon: 'notifications-outline',  iconColor: C.sub,   iconBg: '#f0f0f0', title: 'Notifications',         sub: 'Urgent · approvals · escalations' },
    { icon: 'help-circle-outline',    iconColor: C.sub,   iconBg: '#f0f0f0', title: 'Help & feedback' },
    { icon: 'swap-horizontal-outline',iconColor: C.sub,   iconBg: '#f0f0f0', title: 'Switch user',           sub: 'Back to persona picker',           onPress: () => router.replace('/') },
    { icon: 'log-out-outline',        iconColor: '#b91c1c',iconBg: '#fee2e2', title: 'Sign out',
      onPress: () => Alert.alert('Sign out?', 'You will need to log in again.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign out', style: 'destructive', onPress: () => router.replace('/') },
      ]),
    },
  ];

  function renderRow(row: RowDef, last: boolean) {
    const onPress = row.onPress ?? (() => Alert.alert(row.title, 'Coming soon.'));
    return (
      <TouchableOpacity key={row.title} style={[styles.row, !last && styles.rowBorder]} onPress={onPress} activeOpacity={0.85}>
        <View style={[styles.iconWrap, { backgroundColor: row.iconBg }]}>
          <Ionicons name={row.icon} size={18} color={row.iconColor} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.rowTitle}>{row.title}</Text>
          {row.sub && <Text style={styles.rowSub}>{row.sub}</Text>}
        </View>
        <Ionicons name="chevron-forward" size={16} color={C.faint} />
      </TouchableOpacity>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        <SectionLabel>Reports</SectionLabel>
        <View style={styles.card}>
          {reports.map((r, i) => renderRow(r, i === reports.length - 1))}
        </View>

        <SectionLabel>Operations</SectionLabel>
        <View style={styles.card}>
          {operations.map((r, i) => renderRow(r, i === operations.length - 1))}
        </View>

        <SectionLabel>Account</SectionLabel>
        <View style={styles.card}>
          {account.map((r, i) => renderRow(r, i === account.length - 1))}
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

  card: {
    backgroundColor: C.card,
    borderWidth: 1, borderColor: C.border,
    borderRadius: R.lg, overflow: 'hidden',
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: S.md, padding: S.md },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: C.borderSoft },
  iconWrap: {
    width: 36, height: 36, borderRadius: R.md,
    alignItems: 'center', justifyContent: 'center',
  },
  rowTitle: { fontSize: F.sm, fontWeight: '700', color: C.text },
  rowSub: { fontSize: F.xs, color: C.sub, marginTop: 2 },

  version: { fontSize: F.xs, color: C.hint, textAlign: 'center', marginTop: S.lg },
});
