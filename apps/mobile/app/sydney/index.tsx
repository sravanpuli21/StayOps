import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { useMemo } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { C, F, R, S } from '../../src/theme';
import { SectionLabel } from '../../src/components/web-ui/SectionLabel';
import { useTickets } from '../../src/store/ticketsContext';
import { INVENTORY, FOLLOWUP_TICKETS } from '../../src/data/amir-inventory';
import { AUDITS, TYPE_CFG as AUDIT_TYPE_CFG } from '../../src/data/audits';

/* ─── Engineering Pulse rows ─── */
type Tone = 'good' | 'warn' | 'urgent';
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

export default function SydneyToday() {
  const router = useRouter();
  const { allTickets } = useTickets();

  const open = allTickets.filter((tk) => tk.status !== 'resolved');

  const urgentTickets    = open.filter((tk) => tk.priority === 'urgent').length;
  const oooRooms         = open.filter((tk) => tk.revenueLost > 0).length;
  const occupiedIssues   = open.filter((tk) => tk.guestContext === 'occupied_urgent').length;
  const arrivalRisk      = open.filter((tk) => tk.guestContext === 'arrival').length;
  const preventiveDue    = open.filter((tk) => tk.type === 'preventive').length;
  const auditDue         = open.filter((tk) => tk.type === 'audit').length;
  const lowStock         = INVENTORY.filter((p) => p.level === 'low' || p.level === 'out').length;
  const amirHandover     = 4; // mock count from last evening

  const pulse: Array<{ label: string; value: string; tone: Tone; sub?: string; href?: string }> = [
    { label: 'Urgent tickets',  value: String(urgentTickets),  tone: urgentTickets > 0 ? 'urgent' : 'good',  href: '/sydney/queue' },
    { label: 'OOO rooms',       value: String(oooRooms),       tone: oooRooms > 1 ? 'urgent' : 'good',       href: '/sydney/rooms', sub: oooRooms > 0 ? `$${oooRooms * 142}/night` : undefined },
    { label: 'Occupied issues', value: String(occupiedIssues), tone: occupiedIssues > 0 ? 'urgent' : 'good', href: '/sydney/queue' },
    { label: 'Arrival risk',    value: String(arrivalRisk),    tone: arrivalRisk > 0 ? 'warn' : 'good',      href: '/sydney/rooms' },
    { label: 'Preventive due',  value: String(preventiveDue),  tone: preventiveDue > 0 ? 'warn' : 'good',    href: '/sydney/queue' },
    { label: 'Audit due',       value: String(auditDue),       tone: auditDue > 0 ? 'warn' : 'good',         href: '/sydney/queue' },
    { label: 'Low stock',       value: String(lowStock),       tone: lowStock > 0 ? 'warn' : 'good',         href: '/sydney/inventory' },
    { label: 'Amir handover',   value: String(amirHandover),   tone: amirHandover > 0 ? 'warn' : 'good',     href: '/sydney/handover' },
  ];

  /* Revenue blockers — vacant or arrival rooms blocked by maintenance */
  const revenueBlockers = useMemo(
    () => open.filter((tk) =>
      (tk.guestContext === 'arrival' || (tk.guestContext === 'vacant' && tk.revenueLost > 0)) &&
      tk.priority !== 'normal'
    ).slice(0, 4),
    [open]
  );

  /* Top urgent tickets feed */
  const urgentFeed = useMemo(
    () => open.filter((tk) => tk.priority === 'urgent').slice(0, 4),
    [open]
  );

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Greeting */}
        <View style={{ paddingHorizontal: 4 }}>
          <Text style={styles.greeting}>Morning, Sydney 👋</Text>
          <Text style={styles.sub}>
            Maintenance ops · {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} · Day shift
          </Text>
        </View>

        {/* Engineering Pulse */}
        <SectionLabel>Engineering Pulse</SectionLabel>
        <View style={styles.pulseCard}>
          {pulse.map((p, i) => {
            const cols = 2;
            const totalRows = Math.ceil(pulse.length / cols);
            const row = Math.floor(i / cols);
            const col = i % cols;
            const Wrap: any = p.href ? TouchableOpacity : View;
            return (
              <Wrap
                key={p.label}
                style={[
                  styles.pulseCell,
                  {
                    borderBottomWidth: row < totalRows - 1 ? 1 : 0,
                    borderRightWidth:  col < cols - 1      ? 1 : 0,
                  },
                ]}
                onPress={p.href ? () => router.push(p.href as any) : undefined}
                activeOpacity={0.85}
              >
                <View style={styles.pulseRow}>
                  <View style={[styles.pulseDot, { backgroundColor: TONE_DOT[p.tone] }]} />
                  <Text style={styles.pulseLabel}>{p.label}</Text>
                </View>
                <View style={styles.pulseValueRow}>
                  <Text style={[styles.pulseValue, { color: TONE_COLOR[p.tone] }]}>{p.value}</Text>
                  {p.sub && <Text style={styles.pulseSub}>{p.sub}</Text>}
                </View>
              </Wrap>
            );
          })}
        </View>

        {/* Revenue Blockers */}
        {revenueBlockers.length > 0 && (
          <>
            <View style={styles.sectionHead}>
              <View style={[styles.sectionDot, { backgroundColor: '#b91c1c' }]} />
              <SectionLabel>Revenue blockers</SectionLabel>
              <View style={[styles.countChip, { backgroundColor: '#fee2e2' }]}>
                <Text style={[styles.countText, { color: '#b91c1c' }]}>{revenueBlockers.length}</Text>
              </View>
            </View>
            <View style={styles.feed}>
              {revenueBlockers.map((tk, i) => (
                <TouchableOpacity
                  key={tk.id}
                  style={[styles.feedRow, i < revenueBlockers.length - 1 && styles.feedBorder]}
                  onPress={() => router.push(`/sydney/ticket/${tk.id}` as any)}
                  activeOpacity={0.85}
                >
                  <View style={[styles.feedIcon, { backgroundColor: '#fee2e2' }]}>
                    <Ionicons name="bed-outline" size={18} color="#b91c1c" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={styles.feedTopRow}>
                      <View style={[styles.priChip, { backgroundColor: '#fee2e2' }]}>
                        <Text style={[styles.priChipText, { color: '#b91c1c' }]}>BLOCKER</Text>
                      </View>
                      <Text style={styles.feedTime}>${tk.revenueLost}/night</Text>
                    </View>
                    <Text style={styles.feedTitle} numberOfLines={2}>Room {tk.room} · {tk.title}</Text>
                    <Text style={styles.feedSub} numberOfLines={1}>
                      {tk.guestContext === 'arrival' ? 'Arrival pending · ' : 'Vacant blocked · '}
                      requested by {tk.reportedBy}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={C.faint} />
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {/* Urgent feed */}
        {urgentFeed.length > 0 && (
          <>
            <View style={styles.sectionHead}>
              <View style={[styles.sectionDot, { backgroundColor: '#b91c1c' }]} />
              <SectionLabel>Urgent now</SectionLabel>
              <View style={[styles.countChip, { backgroundColor: '#fee2e2' }]}>
                <Text style={[styles.countText, { color: '#b91c1c' }]}>{urgentFeed.length}</Text>
              </View>
            </View>
            <View style={styles.feed}>
              {urgentFeed.map((tk, i) => (
                <TouchableOpacity
                  key={tk.id}
                  style={[styles.feedRow, i < urgentFeed.length - 1 && styles.feedBorder]}
                  onPress={() => router.push(`/sydney/ticket/${tk.id}` as any)}
                  activeOpacity={0.85}
                >
                  <View style={[styles.feedIcon, { backgroundColor: '#dbeafe' }]}>
                    <Ionicons name="construct-outline" size={18} color="#1d4ed8" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={styles.feedTopRow}>
                      <View style={[styles.priChip, { backgroundColor: '#fee2e2' }]}>
                        <Text style={[styles.priChipText, { color: '#b91c1c' }]}>URGENT</Text>
                      </View>
                      <Text style={styles.feedType}>{tk.type.toUpperCase()}</Text>
                    </View>
                    <Text style={styles.feedTitle} numberOfLines={2}>Room {tk.room} · {tk.title}</Text>
                    <Text style={styles.feedSub} numberOfLines={1}>
                      {tk.assignee !== 'Sydney Rivera' ? `→ ${tk.assignee}` : 'unassigned'} · open {tk.updatedAt}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={C.faint} />
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {/* Amir handover preview */}
        <View style={styles.sectionHead}>
          <View style={[styles.sectionDot, { backgroundColor: '#1d4ed8' }]} />
          <SectionLabel>Amir handover</SectionLabel>
          <View style={[styles.countChip, { backgroundColor: '#dbeafe' }]}>
            <Text style={[styles.countText, { color: '#1d4ed8' }]}>{amirHandover}</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.handoverCard}
          onPress={() => router.push('/sydney/handover' as any)}
          activeOpacity={0.88}
        >
          <View style={styles.amirAvatar}>
            <Text style={styles.amirAvatarText}>AL</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.handoverTitle}>From Amir last night</Text>
            <Text style={styles.handoverSub}>
              {oooRooms} OOO room{oooRooms !== 1 ? 's' : ''} · {FOLLOWUP_TICKETS.length} follow-up · 3 parts low
            </Text>
          </View>
          <Text style={styles.handoverCta}>Review →</Text>
        </TouchableOpacity>

        {/* Audits */}
        <View style={styles.sectionHead}>
          <View style={[styles.sectionDot, { backgroundColor: '#5b21b6' }]} />
          <SectionLabel>Audits due</SectionLabel>
          <View style={[styles.countChip, { backgroundColor: '#e0e7ff' }]}>
            <Text style={[styles.countText, { color: '#5b21b6' }]}>{AUDITS.length}</Text>
          </View>
        </View>
        <View style={styles.feed}>
          {AUDITS.slice(0, 4).map((a, i) => {
            const ty = AUDIT_TYPE_CFG[a.type];
            return (
              <TouchableOpacity
                key={a.id}
                style={[styles.feedRow, i < Math.min(AUDITS.length, 4) - 1 && styles.feedBorder]}
                onPress={() => router.push(`/sydney/audit/${a.id}` as any)}
                activeOpacity={0.85}
              >
                <View style={[styles.feedIcon, { backgroundColor: ty.bg }]}>
                  <Ionicons name={ty.icon as any} size={18} color={ty.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.feedTopRow}>
                    <View style={[styles.priChip, { backgroundColor: ty.bg }]}>
                      <Text style={[styles.priChipText, { color: ty.color }]}>{ty.label.toUpperCase()}</Text>
                    </View>
                    <Text style={styles.feedType}>{a.cadence}</Text>
                    <Text style={styles.feedTime}>{a.dueDate}</Text>
                  </View>
                  <Text style={styles.feedTitle} numberOfLines={1}>{a.name}</Text>
                  <Text style={styles.feedSub} numberOfLines={1}>
                    {a.scopeLabel} · {a.assignedTo === 'Sydney Rivera' ? 'You' : a.assignedTo}
                    {a.familiarityScore === 'high' ? ' · familiar' : a.reassignmentReason ? ' · reassigned' : ''}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={C.faint} />
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Quick links */}
        <SectionLabel>Open</SectionLabel>
        <View style={styles.linkGrid}>
          {[
            { icon: 'people-outline'    as const, title: 'Staff',     sub: 'On shift today',          href: '/sydney/staff' },
            { icon: 'person-circle-outline' as const, title: 'Profile', sub: 'Account · settings',    href: '/sydney/profile' },
          ].map((l) => (
            <TouchableOpacity
              key={l.href}
              style={styles.linkCard}
              onPress={() => router.push(l.href as any)}
              activeOpacity={0.85}
            >
              <Ionicons name={l.icon} size={20} color={C.brand} />
              <View style={{ flex: 1 }}>
                <Text style={styles.linkTitle}>{l.title}</Text>
                <Text style={styles.linkSub}>{l.sub}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={C.faint} />
            </TouchableOpacity>
          ))}
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

  greeting: { fontSize: F.xl, fontWeight: '800', color: C.text, letterSpacing: -0.3 },
  sub: { fontSize: F.xs, color: C.hint, marginTop: 4 },

  /* Pulse */
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
    fontSize: F.xs, fontWeight: '700', color: C.sub,
    textTransform: 'uppercase', letterSpacing: 0.4,
  },
  pulseValueRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6, marginTop: 4 },
  pulseValue: { fontSize: F.xxl, fontWeight: '800', letterSpacing: -0.5 },
  pulseSub: { fontSize: F.xs, color: C.hint, fontWeight: '600' },

  /* Section heads */
  sectionHead: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  sectionDot: { width: 8, height: 8, borderRadius: 4 },
  countChip: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: R.full },
  countText: { fontSize: F.xs, fontWeight: '800' },

  /* Feed (revenue blockers + urgent) */
  feed: {
    backgroundColor: C.card,
    borderWidth: 1, borderColor: C.border,
    borderRadius: R.xl,
    overflow: 'hidden',
  },
  feedRow: { flexDirection: 'row', alignItems: 'center', gap: S.md, padding: S.md },
  feedBorder: { borderBottomWidth: 1, borderBottomColor: C.borderSoft },
  feedIcon: { width: 38, height: 38, borderRadius: R.md, alignItems: 'center', justifyContent: 'center' },
  feedTopRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 3 },
  priChip: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: R.full },
  priChipText: { fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  feedType: { fontSize: F.xs, color: C.hint, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.4 },
  feedTime: { fontSize: F.xs, color: '#b91c1c', fontWeight: '700', marginLeft: 'auto' },
  feedTitle: { fontSize: F.sm, fontWeight: '700', color: C.text, lineHeight: 18 },
  feedSub: { fontSize: F.xs, color: C.sub, marginTop: 2, lineHeight: 16 },

  /* Amir handover preview */
  handoverCard: {
    flexDirection: 'row', alignItems: 'center', gap: S.md,
    backgroundColor: C.card,
    borderWidth: 1, borderColor: C.border,
    borderRadius: R.xl,
    padding: S.md,
  },
  amirAvatar: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: '#fef3c7',
    alignItems: 'center', justifyContent: 'center',
  },
  amirAvatarText: { fontSize: F.xs, fontWeight: '800', color: '#b45309' },
  handoverTitle: { fontSize: F.sm, fontWeight: '700', color: C.text },
  handoverSub: { fontSize: F.xs, color: C.sub, marginTop: 2 },
  handoverCta: { fontSize: F.sm, fontWeight: '700', color: C.brand },

  /* Quick links */
  linkGrid: { gap: S.sm },
  linkCard: {
    flexDirection: 'row', alignItems: 'center', gap: S.md,
    backgroundColor: C.card,
    borderWidth: 1, borderColor: C.border,
    borderRadius: R.lg, padding: S.md,
  },
  linkTitle: { fontSize: F.sm, fontWeight: '700', color: C.text },
  linkSub: { fontSize: F.xs, color: C.sub, marginTop: 2 },
});
