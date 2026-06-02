import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { C, F, R, S } from '../../src/theme';
import { useTickets, type Ticket, type TicketStatus } from '../../src/store/ticketsContext';
import { SectionLabel } from '../../src/components/web-ui/SectionLabel';
import { useT } from '../../src/i18n/amir-phrases';
import { SYDNEY_NOTES, FOLLOWUP_TICKETS } from '../../src/data/amir-inventory';
import { auditsForPerson, TYPE_CFG as AUDIT_TYPE_CFG } from '../../src/data/audits';

const PRIORITY_CFG: Record<string, { color: string; bg: string }> = {
  urgent: { color: '#b91c1c', bg: '#fee2e2' },
  high:   { color: '#b45309', bg: '#fef3c7' },
  normal: { color: '#1d4ed8', bg: '#dbeafe' },
};

const STATUS_CFG: Record<TicketStatus, { color: string; label: string }> = {
  open:         { color: '#b91c1c', label: 'Open' },
  en_route:     { color: '#1d4ed8', label: 'En route' },
  in_progress:  { color: '#b45309', label: 'In progress' },
  pending_part: { color: '#7c3aed', label: 'Wait part' },
  scheduled:    { color: '#1d4ed8', label: 'Scheduled' },
  resolved:     { color: '#15803d', label: 'Resolved' },
  escalated:    { color: '#b91c1c', label: 'Escalated' },
};

export default function AmirQueue() {
  const router = useRouter();
  const { allTickets } = useTickets();
  const t = useT();
  const [showCompleted, setShowCompleted] = useState(false);

  const sections = useMemo(() => {
    const open      = allTickets.filter((tk) => tk.status !== 'resolved');
    const completed = allTickets.filter((tk) => tk.status === 'resolved');

    const urgent     = open.filter((tk) => tk.priority === 'urgent' && (tk.guestContext === 'occupied_urgent' || tk.guestContext === 'arrival'));
    const arrival    = open.filter((tk) => tk.guestContext === 'arrival' && !urgent.includes(tk));
    const assigned   = open.filter((tk) => tk.type === 'reactive' && !urgent.includes(tk) && !arrival.includes(tk));
    const preventive = open.filter((tk) => tk.type === 'preventive');
    const audit      = open.filter((tk) => tk.type === 'audit');
    const followups  = open.filter((tk) => tk.repeatInRoom && !urgent.includes(tk) && !arrival.includes(tk) && !assigned.includes(tk));

    return { urgent, arrival, assigned, preventive, audit, followups, completed };
  }, [allTickets]);

  const totalOpen = sections.urgent.length + sections.arrival.length + sections.assigned.length +
                    sections.preventive.length + sections.audit.length + sections.followups.length;

  return (
    <SafeAreaView style={styles.safe}>
      {/* Greeting */}
      <View style={styles.greetBar}>
        <View style={{ flex: 1 }}>
          <Text style={styles.greeting}>Buenas tardes, Amir 👋</Text>
          <Text style={styles.greetSub}>
            {sections.urgent.length} urgent · {totalOpen} open · {SYDNEY_NOTES.length} notes from Sydney
          </Text>
        </View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Sydney's morning notes */}
        {SYDNEY_NOTES.length > 0 && (
          <>
            <SectionLabel>From Sydney</SectionLabel>
            <View style={styles.card}>
              {SYDNEY_NOTES.map((n, i) => (
                <TouchableOpacity
                  key={i}
                  style={[styles.noteRow, i < SYDNEY_NOTES.length - 1 && styles.rowBorder]}
                  onPress={() => Alert.alert('Reply to Sydney', n.body, [
                    { text: 'Mark reviewed' },
                    { text: 'Reply',     onPress: () => Alert.alert('Reply sent', 'Sydney will see this in the morning.') },
                    { text: 'Cancel', style: 'cancel' },
                  ])}
                  activeOpacity={0.85}
                >
                  <View style={styles.sydneyAvatar}>
                    <Text style={styles.sydneyAvatarText}>SR</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.noteBody}>{n.body}</Text>
                    <Text style={styles.noteAt}>{n.at} · {n.from}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={14} color={C.faint} />
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {/* Auto-created follow-ups (preview) */}
        {FOLLOWUP_TICKETS.length > 0 && (
          <>
            <View style={styles.sectionHead}>
              <View style={[styles.sectionDot, { backgroundColor: '#b91c1c' }]} />
              <SectionLabel>Follow-ups</SectionLabel>
              <View style={[styles.countChip, { backgroundColor: '#fee2e2' }]}>
                <Text style={[styles.countText, { color: '#b91c1c' }]}>{FOLLOWUP_TICKETS.length}</Text>
              </View>
            </View>
            <View style={styles.card}>
              {FOLLOWUP_TICKETS.map((f, i) => (
                <TouchableOpacity
                  key={f.id}
                  style={[styles.followCard, i < FOLLOWUP_TICKETS.length - 1 && styles.rowBorder]}
                  activeOpacity={0.85}
                  onPress={() => router.push(`/amir/ticket/${f.linkedTicketId}` as any)}
                >
                  <View style={[styles.followIcon, { backgroundColor: '#fee2e2' }]}>
                    <Ionicons name="git-branch-outline" size={16} color="#b91c1c" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={styles.followTopRow}>
                      <View style={styles.priChip}>
                        <Text style={styles.priChipText}>FOLLOW-UP</Text>
                      </View>
                      {f.arrivalSoon && (
                        <View style={[styles.priChip, { backgroundColor: '#fee2e2' }]}>
                          <Text style={[styles.priChipText, { color: '#b91c1c' }]}>ARRIVAL TODAY</Text>
                        </View>
                      )}
                      <Text style={styles.age}>{f.createdAt}</Text>
                    </View>
                    <Text style={styles.followTitle}>Room {f.room} · {f.title}</Text>
                    <Text style={styles.followSub}>Linked to {f.linkedTicketId}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={C.faint} />
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        <SectionBlock label={t('urgent_now')}        tone="urgent" tickets={sections.urgent}     onPress={(id) => router.push(`/amir/ticket/${id}` as any)} />
        <SectionBlock label={t('arrival_blockers')}  tone="warn"   tickets={sections.arrival}    onPress={(id) => router.push(`/amir/ticket/${id}` as any)} />
        <SectionBlock label={t('assigned_tasks')}    tone="normal" tickets={sections.assigned}   onPress={(id) => router.push(`/amir/ticket/${id}` as any)} />
        <SectionBlock label="Preventive tasks"       tone="muted"  tickets={sections.preventive} onPress={(id) => router.push(`/amir/ticket/${id}` as any)} />
        <SectionBlock label="Audit tasks"            tone="muted"  tickets={sections.audit}      onPress={(id) => router.push(`/amir/ticket/${id}` as any)} />

        {/* Real audits assigned to Amir from the AUDITS dataset */}
        {(() => {
          const myAudits = auditsForPerson('Amir Lopez');
          if (myAudits.length === 0) return null;
          return (
            <View style={{ gap: S.sm }}>
              <View style={styles.sectionHead}>
                <View style={[styles.sectionDot, { backgroundColor: '#5b21b6' }]} />
                <SectionLabel>Audits to complete</SectionLabel>
                <View style={[styles.countChip, { backgroundColor: '#e0e7ff' }]}>
                  <Text style={[styles.countText, { color: '#5b21b6' }]}>{myAudits.length}</Text>
                </View>
              </View>
              {myAudits.map((a) => {
                const ty = AUDIT_TYPE_CFG[a.type];
                return (
                  <TouchableOpacity
                    key={a.id}
                    style={styles.card2}
                    onPress={() => router.push(`/amir/audit/${a.id}` as any)}
                    activeOpacity={0.88}
                  >
                    <View style={[styles.priorityBar, { backgroundColor: ty.color }]} />
                    <View style={styles.cardBody}>
                      <View style={styles.cardTop}>
                        <View style={[styles.chip, { backgroundColor: ty.bg }]}>
                          <Text style={[styles.chipText, { color: ty.color }]}>{ty.label.toUpperCase()}</Text>
                        </View>
                        <View style={[styles.chip, { backgroundColor: '#f0f0f0' }]}>
                          <Text style={[styles.chipText, { color: C.text }]}>{a.cadence.toUpperCase()}</Text>
                        </View>
                        <Text style={styles.age}>{a.dueDate}</Text>
                      </View>
                      <Text style={styles.title} numberOfLines={1}>{a.name}</Text>
                      <View style={styles.metaRow}>
                        <View style={styles.meta}>
                          <Ionicons name="location-outline" size={11} color={C.hint} />
                          <Text style={styles.metaText}>{a.scopeLabel}</Text>
                        </View>
                        {a.familiarityScore === 'high' && (
                          <View style={[styles.meta, { backgroundColor: '#dcfce7', paddingHorizontal: 6, paddingVertical: 2, borderRadius: R.full }]}>
                            <Ionicons name="ribbon-outline" size={11} color="#15803d" />
                            <Text style={[styles.metaText, { color: '#15803d', fontWeight: '700' }]}>You know this</Text>
                          </View>
                        )}
                        {a.reassignmentReason && (
                          <View style={[styles.meta, { backgroundColor: '#fef3c7', paddingHorizontal: 6, paddingVertical: 2, borderRadius: R.full }]}>
                            <Ionicons name="swap-horizontal" size={11} color="#b45309" />
                            <Text style={[styles.metaText, { color: '#b45309', fontWeight: '700' }]}>Reassigned</Text>
                          </View>
                        )}
                      </View>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={C.faint} style={{ alignSelf: 'center', marginRight: S.sm }} />
                  </TouchableOpacity>
                );
              })}
            </View>
          );
        })()}

        {/* Completed Today (collapsed) */}
        {sections.completed.length > 0 && (
          <View style={{ gap: S.sm }}>
            <TouchableOpacity style={styles.completedHead} onPress={() => setShowCompleted((v) => !v)} activeOpacity={0.85}>
              <View style={[styles.sectionDot, { backgroundColor: '#15803d' }]} />
              <SectionLabel>{t('completed_today')}</SectionLabel>
              <View style={[styles.countChip, { backgroundColor: '#dcfce7' }]}>
                <Text style={[styles.countText, { color: '#15803d' }]}>{sections.completed.length}</Text>
              </View>
              <Ionicons
                name={showCompleted ? 'chevron-up' : 'chevron-down'}
                size={16} color={C.sub} style={{ marginLeft: 'auto' }}
              />
            </TouchableOpacity>
            {showCompleted && sections.completed.slice(0, 8).map((tk) => (
              <TicketCard key={tk.id} ticket={tk} onPress={(id) => router.push(`/amir/ticket/${id}` as any)} dim />
            ))}
          </View>
        )}

        {totalOpen === 0 && (
          <View style={styles.empty}>
            <Ionicons name="checkmark-done-circle-outline" size={48} color={C.green} />
            <Text style={styles.emptyTitle}>All clear</Text>
            <Text style={styles.emptySub}>Nothing assigned right now. Check back in a few.</Text>
          </View>
        )}

        <View style={{ height: S.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

/* ─── Section block ─────────────────────────────────────── */

type Tone = 'urgent' | 'warn' | 'normal' | 'muted';
const TONE_COLOR: Record<Tone, string> = {
  urgent: '#b91c1c',
  warn:   '#b45309',
  normal: '#1d4ed8',
  muted:  C.sub,
};
const TONE_BG: Record<Tone, string> = {
  urgent: '#fee2e2',
  warn:   '#fef3c7',
  normal: '#dbeafe',
  muted:  '#f0f0f0',
};

function SectionBlock({
  label, tone, tickets, onPress,
}: {
  label: string;
  tone: Tone;
  tickets: Ticket[];
  onPress: (id: string) => void;
}) {
  if (tickets.length === 0) return null;
  return (
    <View style={{ gap: S.sm }}>
      <View style={styles.sectionHead}>
        <View style={[styles.sectionDot, { backgroundColor: TONE_COLOR[tone] }]} />
        <SectionLabel>{label}</SectionLabel>
        <View style={[styles.countChip, { backgroundColor: TONE_BG[tone] }]}>
          <Text style={[styles.countText, { color: TONE_COLOR[tone] }]}>{tickets.length}</Text>
        </View>
      </View>
      {tickets.map((tk) => <TicketCard key={tk.id} ticket={tk} onPress={onPress} />)}
    </View>
  );
}

function TicketCard({ ticket, onPress, dim }: { ticket: Ticket; onPress: (id: string) => void; dim?: boolean }) {
  const p = PRIORITY_CFG[ticket.priority] ?? PRIORITY_CFG.normal;

  /* Single most important meta tag */
  let meta: { label: string; color: string; bg: string; icon: 'person-outline' | 'time-outline' | 'refresh-outline' | 'trending-down' } | null = null;
  if (ticket.guestContext === 'occupied_urgent')
    meta = { label: 'Guest inside', color: '#b91c1c', bg: '#fee2e2', icon: 'person-outline' };
  else if (ticket.guestContext === 'arrival')
    meta = { label: 'Arrival pending', color: '#b45309', bg: '#fef3c7', icon: 'time-outline' };
  else if (ticket.revenueLost > 0)
    meta = { label: `$${ticket.revenueLost}/night`, color: '#b91c1c', bg: '#fee2e2', icon: 'trending-down' };
  else if (ticket.repeatInRoom)
    meta = { label: 'Repeat', color: '#b45309', bg: '#fef3c7', icon: 'refresh-outline' };

  return (
    <TouchableOpacity
      style={[styles.card2, dim && { opacity: 0.55 }]}
      onPress={() => onPress(ticket.id)}
      activeOpacity={0.85}
    >
      <View style={[styles.priorityBar, { backgroundColor: p.color }]} />
      <View style={styles.cardBody}>
        <View style={styles.cardTop}>
          <Text style={styles.tid}>Room {ticket.room}</Text>
          <Text style={styles.age}>{ticket.updatedAt}</Text>
        </View>
        <Text style={styles.title} numberOfLines={2}>{ticket.title}</Text>
        {meta && (
          <View style={[styles.meta, { backgroundColor: meta.bg }]}>
            <Ionicons name={meta.icon} size={11} color={meta.color} />
            <Text style={[styles.metaText, { color: meta.color }]}>{meta.label}</Text>
          </View>
        )}
        {!meta && (
          <Text style={styles.metaSub} numberOfLines={1}>{ticket.reportedBy}</Text>
        )}
      </View>
      <Ionicons name="chevron-forward" size={16} color={C.faint} style={{ alignSelf: 'center', marginRight: S.sm }} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },

  greetBar: {
    paddingHorizontal: S.lg, paddingTop: S.md, paddingBottom: S.sm,
    backgroundColor: C.bg,
  },
  greeting: { fontSize: F.xl, fontWeight: '800', color: C.text, letterSpacing: -0.3 },
  greetSub: { fontSize: F.xs, color: C.hint, marginTop: 4, fontWeight: '600' },

  scroll: { flex: 1 },
  content: { padding: S.lg, paddingTop: 0, gap: S.md },

  /* Sydney notes */
  card: {
    backgroundColor: C.card,
    borderWidth: 1, borderColor: C.border,
    borderRadius: R.lg,
    overflow: 'hidden',
  },
  noteRow: { flexDirection: 'row', alignItems: 'flex-start', gap: S.md, padding: S.md },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: C.borderSoft },
  sydneyAvatar: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#dbeafe',
    alignItems: 'center', justifyContent: 'center',
  },
  sydneyAvatarText: { fontSize: F.xs, fontWeight: '800', color: '#1d4ed8' },
  noteBody: { fontSize: F.sm, color: C.text, lineHeight: 20 },
  noteAt: { fontSize: F.xs, color: C.hint, marginTop: 4, fontWeight: '600' },

  /* Follow-ups */
  followCard: { flexDirection: 'row', alignItems: 'center', gap: S.md, padding: S.md },
  followIcon: { width: 36, height: 36, borderRadius: R.md, alignItems: 'center', justifyContent: 'center' },
  followTopRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4, flexWrap: 'wrap' },
  followTitle: { fontSize: F.sm, fontWeight: '700', color: C.text, lineHeight: 18 },
  followSub: { fontSize: F.xs, color: C.sub, marginTop: 2 },

  /* Section heads */
  sectionHead: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  sectionDot: { width: 8, height: 8, borderRadius: 4 },
  countChip: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: R.full },
  countText: { fontSize: F.xs, fontWeight: '800' },

  completedHead: { flexDirection: 'row', alignItems: 'center', gap: 6 },

  empty: { alignItems: 'center', padding: S.xxxl, gap: 4 },
  emptyTitle: { fontSize: F.lg, fontWeight: '800', color: C.text, marginTop: S.sm },
  emptySub: { fontSize: F.xs, color: C.sub, textAlign: 'center' },

  /* Card */
  card2: {
    flexDirection: 'row',
    backgroundColor: C.card,
    borderWidth: 1, borderColor: C.border,
    borderRadius: R.lg,
    overflow: 'hidden',
  },
  priorityBar: { width: 4, alignSelf: 'stretch' },
  cardBody: { flex: 1, padding: S.md },

  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 6, flexWrap: 'wrap' },
  tid: { fontSize: F.xs, fontWeight: '800', color: C.hint, letterSpacing: 0.4 },
  chip: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: R.full },
  chipText: { fontSize: 9, fontWeight: '800', letterSpacing: 0.4 },
  age: { fontSize: F.xs, color: C.hint, marginLeft: 'auto' },

  priChip: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: R.full, backgroundColor: '#fef3c7' },
  priChipText: { fontSize: 9, fontWeight: '800', letterSpacing: 0.4, color: '#b45309' },

  title: { fontSize: F.md, fontWeight: '700', color: C.text, lineHeight: 20, letterSpacing: -0.2 },

  metaRow: { flexDirection: 'row', alignItems: 'center', gap: S.sm, flexWrap: 'wrap', marginTop: 4 },
  meta: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: R.full, alignSelf: 'flex-start',
    marginTop: 4,
  },
  metaSub: { fontSize: F.xs, color: C.sub, marginTop: 2 },
  metaText: { fontSize: F.xs, fontWeight: '700' },
  metaTextRed: { fontSize: F.xs, color: '#b91c1c', fontWeight: '700' },
  metaTextAmber: { fontSize: F.xs, color: '#b45309', fontWeight: '700' },
});
