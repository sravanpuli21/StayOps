import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { C, F, R, S } from '../src/theme';
import { CambriaLogo } from '../src/components/CambriaLogo';

const PERSONAS = [
  {
    route: '/amir' as const,
    initials: 'AL',
    name: 'Amir Lopez',
    role: 'Maintenance Tech',
    shift: 'Day · 7:00 AM – 3:30 PM',
    icon: 'construct-outline' as const,
    stats: [
      { label: 'Tickets', value: '4' },
      { label: 'Urgent', value: '1' },
      { label: 'Audits Due', value: '3' },
    ],
    accentColor: C.amber,
    accentBg: C.amberBg,
  },
  {
    route: '/sydney' as const,
    initials: 'SR',
    name: 'Sydney Rivera',
    role: 'Supervisor',
    shift: 'Day · 6:00 AM – 2:30 PM',
    icon: 'clipboard-outline' as const,
    stats: [
      { label: 'Occupancy', value: '88%' },
      { label: 'Open Tickets', value: '6' },
      { label: 'Compliance', value: '74%' },
    ],
    accentColor: C.blue,
    accentBg: C.blueBg,
  },
];

export default function PersonaSelector() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.hosLogo}>
            <View style={styles.hosDot} />
            <Text style={styles.hosText}>HOS Management</Text>
          </View>
          <CambriaLogo size="sm" />
        </View>

        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>Who's working today?</Text>
          <Text style={styles.heroSub}>GA989 · Cambria Hotel · Savannah, GA</Text>
        </View>

        {/* Persona cards */}
        <View style={styles.cards}>
          {PERSONAS.map((p) => (
            <TouchableOpacity
              key={p.route}
              style={styles.card}
              onPress={() => router.replace(p.route)}
              activeOpacity={0.92}
            >
              {/* Left accent bar */}
              <View style={[styles.cardAccent, { backgroundColor: p.accentColor }]} />

              <View style={styles.cardBody}>
                {/* Top row */}
                <View style={styles.cardTop}>
                  <View style={[styles.avatar, { backgroundColor: p.accentBg }]}>
                    <Text style={[styles.avatarText, { color: p.accentColor }]}>{p.initials}</Text>
                  </View>
                  <View style={styles.cardMeta}>
                    <Text style={styles.cardName}>{p.name}</Text>
                    <Text style={styles.cardRole}>{p.role}</Text>
                  </View>
                  <View style={[styles.iconWrap, { backgroundColor: p.accentBg }]}>
                    <Ionicons name={p.icon} size={20} color={p.accentColor} />
                  </View>
                </View>

                {/* Shift */}
                <View style={styles.shiftRow}>
                  <Ionicons name="time-outline" size={12} color={C.hint} />
                  <Text style={styles.shiftText}>{p.shift}</Text>
                </View>

                {/* Stats */}
                <View style={styles.statsRow}>
                  {p.stats.map((s) => (
                    <View key={s.label} style={styles.stat}>
                      <Text style={[styles.statValue, { color: p.accentColor }]}>{s.value}</Text>
                      <Text style={styles.statLabel}>{s.label}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <Ionicons name="chevron-forward" size={18} color={C.hint} style={styles.chevron} />
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.footer}>Apr 27, 2026 · Morning Shift</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  container: { flex: 1, paddingHorizontal: S.xl, paddingTop: S.xl },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: S.xxxl,
  },
  hosLogo: { flexDirection: 'row', alignItems: 'center', gap: S.xs + 2 },
  hosDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: C.brand },
  hosText: { fontSize: F.sm, fontWeight: '700', color: C.text, letterSpacing: 0.3 },

  hero: { marginBottom: S.xxl },
  heroTitle: { fontSize: F.h, fontWeight: '800', color: C.text, marginBottom: 4 },
  heroSub: { fontSize: F.sm, color: C.sub },

  cards: { gap: S.md },

  card: {
    backgroundColor: C.card,
    borderRadius: R.xl,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardAccent: { width: 4, alignSelf: 'stretch' },
  cardBody: { flex: 1, padding: S.lg },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: S.md, marginBottom: S.sm },
  avatar: {
    width: 44, height: 44,
    borderRadius: R.md,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: F.md, fontWeight: '800' },
  cardMeta: { flex: 1 },
  cardName: { fontSize: F.md, fontWeight: '700', color: C.text },
  cardRole: { fontSize: F.sm, color: C.sub, marginTop: 1 },
  iconWrap: {
    width: 36, height: 36,
    borderRadius: R.md,
    alignItems: 'center', justifyContent: 'center',
  },

  shiftRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: S.md },
  shiftText: { fontSize: F.xs, color: C.hint },

  statsRow: { flexDirection: 'row', gap: S.lg },
  stat: { alignItems: 'center' },
  statValue: { fontSize: F.lg, fontWeight: '800' },
  statLabel: { fontSize: F.xs, color: C.hint, marginTop: 1 },

  chevron: { marginRight: S.md },

  footer: {
    textAlign: 'center',
    fontSize: F.xs,
    color: C.hint,
    marginTop: 'auto',
    paddingBottom: S.xl,
  },
});
