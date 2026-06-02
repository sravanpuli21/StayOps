import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { C, F, R, S } from '../../src/theme';
import { SectionLabel } from '../../src/components/web-ui/SectionLabel';
import { needsAttention, TYPE_CFG, PRIORITY_CFG } from '../../src/data/queue';

/* Pulse rows — what tells Rishab if the hotel is OK right now */
type Tone = 'good' | 'warn' | 'urgent';
const PULSE: Array<{ label: string; value: string; tone: Tone; sub?: string }> = [
  { label: 'Occupancy',          value: '87%',   tone: 'good' },
  { label: 'Arrivals',           value: '42',    tone: 'good' },
  { label: 'Departures',         value: '38',    tone: 'good' },
  { label: 'Clean rooms ready',  value: '18',    tone: 'urgent', sub: 'for 42 arr.' },
  { label: 'OOO rooms',          value: '4',     tone: 'urgent', sub: '$568/night' },
  { label: 'Open guest issues',  value: '3',     tone: 'warn' },
  { label: 'Urgent actions',     value: '6',     tone: 'urgent' },
  { label: 'Payroll %',          value: '28.4%', tone: 'warn',   sub: 'over 28%' },
];

const TONE_COLOR: Record<Tone, string> = {
  good:   C.text,
  warn:   '#b45309',
  urgent: '#b91c1c',
};
const TONE_DOT: Record<Tone, string> = {
  good:   '#16a34a',
  warn:   '#f59e0b',
  urgent: '#ef4444',
};

export default function RishabToday() {
  const router = useRouter();
  const attention = needsAttention();

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* ── Greeting ── */}
        <View style={{ paddingHorizontal: 4 }}>
          <Text style={styles.greeting}>Good morning, Rishab</Text>
          <Text style={styles.sub}>
            Home2 Suites Baton Rouge ·{' '}
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </Text>
        </View>

        {/* ── Hotel Pulse ── */}
        <SectionLabel>Hotel Pulse</SectionLabel>
        <View style={styles.pulseCard}>
          {PULSE.map((p, i) => {
            const cols = 2;
            const totalRows = Math.ceil(PULSE.length / cols);
            const row = Math.floor(i / cols);
            const col = i % cols;
            return (
              <View
                key={p.label}
                style={[
                  styles.pulseCell,
                  {
                    borderBottomWidth: row < totalRows - 1 ? 1 : 0,
                    borderRightWidth:  col < cols - 1      ? 1 : 0,
                  },
                ]}
              >
                <View style={styles.pulseRow}>
                  <View style={[styles.pulseDot, { backgroundColor: TONE_DOT[p.tone] }]} />
                  <Text style={styles.pulseLabel}>{p.label}</Text>
                </View>
                <View style={styles.pulseValueRow}>
                  <Text style={[styles.pulseValue, { color: TONE_COLOR[p.tone] }]}>{p.value}</Text>
                  {p.sub && <Text style={styles.pulseSub}>{p.sub}</Text>}
                </View>
              </View>
            );
          })}
        </View>

        {/* ── Needs Attention ── */}
        <SectionLabel>Needs attention</SectionLabel>
        <View style={styles.feed}>
          {attention.map((item, i) => {
            const t = TYPE_CFG[item.type];
            const p = PRIORITY_CFG[item.priority];
            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.feedRow, i < attention.length - 1 && styles.feedBorder]}
                onPress={() => router.push(`/rishab/queue/${item.id}` as any)}
                activeOpacity={0.85}
              >
                <View style={[styles.feedIcon, { backgroundColor: t.bg }]}>
                  <Ionicons name={t.icon as any} size={18} color={t.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.feedTopRow}>
                    <View style={[styles.priChip, { backgroundColor: p.bg }]}>
                      <Text style={[styles.priChipText, { color: p.color }]}>{p.label.toUpperCase()}</Text>
                    </View>
                    <Text style={styles.feedType}>{t.label}</Text>
                  </View>
                  <Text style={styles.feedTitle} numberOfLines={2}>{item.title}</Text>
                  <Text style={styles.feedSub} numberOfLines={1}>{item.whyItMatters}</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={C.faint} />
              </TouchableOpacity>
            );
          })}
          <TouchableOpacity
            style={styles.viewAllRow}
            onPress={() => router.push('/rishab/queue' as any)}
            activeOpacity={0.85}
          >
            <Text style={styles.viewAllText}>View full Action Queue</Text>
            <Ionicons name="arrow-forward" size={14} color={C.brand} />
          </TouchableOpacity>
        </View>

        <View style={{ height: S.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  scroll: { flex: 1 },
  content: { padding: S.lg, gap: S.md },

  /* ── Greeting ── */
  greeting: { fontSize: F.xl, fontWeight: '800', color: C.text, letterSpacing: -0.3 },
  sub: { fontSize: F.xs, color: C.hint, marginTop: 4 },

  /* ── Pulse grid ── */
  pulseCard: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: R.xl,
    overflow: 'hidden',
  },
  pulseCell: {
    width: '50%',
    padding: S.md,
    borderColor: C.borderSoft,
  },
  pulseRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  pulseDot: { width: 7, height: 7, borderRadius: 4 },
  pulseLabel: {
    fontSize: F.xs,
    fontWeight: '700',
    color: C.sub,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  pulseValueRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6, marginTop: 4 },
  pulseValue: { fontSize: F.xxl, fontWeight: '800', letterSpacing: -0.5 },
  pulseSub: { fontSize: F.xs, color: C.hint, fontWeight: '600' },

  /* ── Needs attention feed ── */
  feed: {
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: R.xl,
    overflow: 'hidden',
  },
  feedRow: { flexDirection: 'row', alignItems: 'center', gap: S.md, padding: S.md },
  feedBorder: { borderBottomWidth: 1, borderBottomColor: C.borderSoft },
  feedIcon: {
    width: 38, height: 38, borderRadius: R.md,
    alignItems: 'center', justifyContent: 'center',
  },
  feedTopRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 3 },
  priChip: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: R.full },
  priChipText: { fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  feedType: { fontSize: F.xs, color: C.hint, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.4 },
  feedTitle: { fontSize: F.sm, fontWeight: '700', color: C.text, lineHeight: 18 },
  feedSub: { fontSize: F.xs, color: C.sub, marginTop: 2, lineHeight: 16 },

  viewAllRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: S.md,
    backgroundColor: C.brandBg,
    borderTopWidth: 1,
    borderTopColor: C.borderSoft,
  },
  viewAllText: { fontSize: F.sm, fontWeight: '700', color: C.brand },
});
