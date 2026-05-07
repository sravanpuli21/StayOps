import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { C, F, R, S } from '../../../src/theme';
import { useTickets, type TicketStatus, type Priority } from '../../../src/store/ticketsContext';
import { NoteModal } from '../../../src/components/NoteModal';

const SUPERVISOR = 'Sydney Rivera';

const PRIORITY_CFG: Record<Priority, { color: string; bg: string; label: string }> = {
  urgent: { color: C.red,   bg: C.redBg,   label: 'URGENT' },
  high:   { color: C.amber, bg: C.amberBg, label: 'HIGH' },
  normal: { color: C.blue,  bg: C.blueBg,  label: 'NORMAL' },
};

const STATUS_LABEL: Record<TicketStatus, string> = {
  open: 'Open', en_route: 'En route', in_progress: 'In progress',
  pending_part: 'Waiting on part', scheduled: 'Scheduled',
  resolved: 'Resolved', escalated: 'Escalated',
};

const STATUS_COLOR: Record<TicketStatus, string> = {
  open: C.red, en_route: C.blue, in_progress: C.amber,
  pending_part: C.purple, scheduled: C.blue, resolved: C.green, escalated: C.red,
};

const ASSIGNEE_STATUS_MSG: Record<TicketStatus, string> = {
  open:         'Not started',
  en_route:     'On the way to the room',
  in_progress:  'Working on it in the room',
  pending_part: 'Waiting on a part',
  scheduled:    'Scheduled for later',
  resolved:     'Marked fixed',
  escalated:    'Escalated up to supervisor',
};

const TECHS = ['Amir Lopez', 'Marcus Webb', 'Sydney Rivera'];

export default function SydneyTicketDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { getTicket, addNote, updateStatus, setPriority, reassign, toggleWatch } = useTickets();

  const ticket = getTicket(id ?? '');
  const [aiExpanded, setAiExpanded] = useState(false);
  const [messageOpen, setMessageOpen] = useState(false);

  if (!ticket) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={C.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Not found</Text>
        </View>
        <View style={styles.notFound}>
          <Ionicons name="alert-circle-outline" size={40} color={C.hint} />
          <Text style={styles.notFoundText}>Ticket {id} not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const p = PRIORITY_CFG[ticket.priority];
  const isWatching = (ticket.watchers ?? []).includes(SUPERVISOR);

  const handleReassign = () => {
    const options = TECHS.filter((t) => t !== ticket.assignee);
    Alert.alert(`Reassign from ${ticket.assignee}`, 'Pick a different tech:', [
      { text: 'Cancel', style: 'cancel' },
      ...options.map((name) => ({ text: name, onPress: () => reassign(ticket.id, name, SUPERVISOR) })),
    ]);
  };

  const handleChangePriority = () => {
    Alert.alert('Change priority', `Currently: ${ticket.priority}`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Urgent', onPress: () => setPriority(ticket.id, 'urgent', SUPERVISOR) },
      { text: 'High',   onPress: () => setPriority(ticket.id, 'high',   SUPERVISOR) },
      { text: 'Normal', onPress: () => setPriority(ticket.id, 'normal', SUPERVISOR) },
    ]);
  };

  const handleEscalateUp = () => {
    Alert.alert(
      'Escalate to ownership?',
      'This will page Rishab (GM) and Kris (MD). Use for genuine emergencies or repeat-root-cause patterns.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Escalate up',
          style: 'destructive',
          onPress: () => {
            addNote(ticket.id, 'Escalated up to Rishab + Kris for ownership attention.', SUPERVISOR);
            updateStatus(ticket.id, 'escalated', SUPERVISOR);
          },
        },
      ]
    );
  };

  const handleOverrideResolve = () => {
    Alert.alert(
      'Override — mark resolved?',
      'Close this ticket without waiting for assignee. Use only when the issue is confirmed resolved through other means.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Force resolve',
          style: 'destructive',
          onPress: () => {
            addNote(ticket.id, 'Force-resolved by supervisor (override).', SUPERVISOR);
            updateStatus(ticket.id, 'resolved', SUPERVISOR);
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={C.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{ticket.id}</Text>
        <View style={styles.superBadge}>
          <Ionicons name="shield-checkmark" size={11} color="#fff" />
          <Text style={styles.superBadgeText}>SUPERVISOR</Text>
        </View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Title */}
        <View style={styles.titleCard}>
          <View style={styles.titleRow}>
            <Text style={styles.ticketTitle}>{ticket.title}</Text>
            <TouchableOpacity onPress={() => toggleWatch(ticket.id, SUPERVISOR)} style={styles.watchBtn}>
              <Ionicons
                name={isWatching ? 'star' : 'star-outline'}
                size={20}
                color={isWatching ? C.amber : C.hint}
              />
            </TouchableOpacity>
          </View>
          <View style={styles.metaRow}>
            <View style={[styles.metaChip, { backgroundColor: p.bg }]}>
              <Text style={[styles.metaText, { color: p.color, fontWeight: '700' }]}>{p.label}</Text>
            </View>
            <View style={[styles.metaChip, { backgroundColor: STATUS_COLOR[ticket.status] + '20' }]}>
              <View style={[styles.statusDot, { backgroundColor: STATUS_COLOR[ticket.status] }]} />
              <Text style={[styles.metaText, { color: STATUS_COLOR[ticket.status], fontWeight: '700' }]}>
                {STATUS_LABEL[ticket.status]}
              </Text>
            </View>
            <View style={styles.metaChip}>
              <Ionicons name="bed-outline" size={12} color={C.hint} />
              <Text style={styles.metaText}>Room {ticket.room} · Fl {ticket.floor}</Text>
            </View>
            {ticket.repeatInRoom && (
              <View style={[styles.metaChip, { backgroundColor: C.purpleBg }]}>
                <Ionicons name="refresh-outline" size={12} color={C.purple} />
                <Text style={[styles.metaText, { color: C.purple, fontWeight: '700' }]}>Repeat</Text>
              </View>
            )}
          </View>
        </View>

        {/* Assignee card */}
        <View style={styles.assigneeCard}>
          <View style={styles.assigneeAvatar}>
            <Text style={styles.assigneeInitials}>
              {ticket.assignee.split(' ').map((p) => p[0]).join('')}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <View style={styles.assigneeNameRow}>
              <Text style={styles.assigneeLabel}>ASSIGNED TO</Text>
              <TouchableOpacity onPress={handleReassign}>
                <Text style={styles.reassignLink}>Reassign</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.assigneeName}>{ticket.assignee}</Text>
            <View style={styles.assigneeStatus}>
              <View style={[styles.assigneeStatusDot, { backgroundColor: STATUS_COLOR[ticket.status] }]} />
              <Text style={styles.assigneeStatusText}>{ASSIGNEE_STATUS_MSG[ticket.status]}</Text>
            </View>
          </View>
        </View>

        {/* Revenue at risk */}
        {ticket.revenueLost > 0 && ticket.status !== 'resolved' && (
          <View style={styles.revenueAlert}>
            <Ionicons name="alert-circle" size={16} color={C.red} />
            <View style={{ flex: 1 }}>
              <Text style={styles.revenueTitle}>Revenue at risk</Text>
              <Text style={styles.revenueSub}>
                ${ticket.revenueLost}/night · {ticket.createdAt} elapsed · room OOO
              </Text>
            </View>
          </View>
        )}

        {/* Supervisor actions */}
        <View style={styles.actionsCard}>
          <Text style={styles.actionsLabel}>Supervisor actions</Text>

          <View style={styles.actionGrid}>
            <TouchableOpacity style={styles.actionBtn} onPress={handleChangePriority} activeOpacity={0.85}>
              <Ionicons name="flag-outline" size={18} color={C.amber} />
              <Text style={styles.actionText}>Priority</Text>
              <Text style={styles.actionSub}>{ticket.priority}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={handleReassign} activeOpacity={0.85}>
              <Ionicons name="swap-horizontal-outline" size={18} color={C.blue} />
              <Text style={styles.actionText}>Reassign</Text>
              <Text style={styles.actionSub}>{ticket.assignee.split(' ')[0]}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={() => setMessageOpen(true)} activeOpacity={0.85}>
              <Ionicons name="chatbubble-outline" size={18} color={C.purple} />
              <Text style={styles.actionText}>Message</Text>
              <Text style={styles.actionSub}>to {ticket.assignee.split(' ')[0]}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.actionGrid}>
            <TouchableOpacity style={styles.actionBtn} onPress={() => toggleWatch(ticket.id, SUPERVISOR)} activeOpacity={0.85}>
              <Ionicons name={isWatching ? 'star' : 'star-outline'} size={18} color={isWatching ? C.amber : C.hint} />
              <Text style={styles.actionText}>{isWatching ? 'Watching' : 'Watch'}</Text>
              <Text style={styles.actionSub}>{(ticket.watchers ?? []).length} watching</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={handleEscalateUp} activeOpacity={0.85}>
              <Ionicons name="trending-up-outline" size={18} color={C.red} />
              <Text style={styles.actionText}>Escalate up</Text>
              <Text style={styles.actionSub}>Rishab + Kris</Text>
            </TouchableOpacity>
            {ticket.status !== 'resolved' && (
              <TouchableOpacity style={styles.actionBtn} onPress={handleOverrideResolve} activeOpacity={0.85}>
                <Ionicons name="checkmark-done-outline" size={18} color={C.green} />
                <Text style={styles.actionText}>Force close</Text>
                <Text style={styles.actionSub}>override</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* AI Insight */}
        {ticket.ai && (
          <View style={styles.aiCard}>
            <TouchableOpacity style={styles.aiHeader} onPress={() => setAiExpanded((v) => !v)} activeOpacity={0.9}>
              <View style={styles.aiIconWrap}>
                <Ionicons name="sparkles" size={14} color={C.brand} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.aiLabel}>AI DIAGNOSIS · {ticket.ai.confidence}% confident</Text>
                <Text style={styles.aiCause}>{ticket.ai.likelyCause}</Text>
              </View>
              <Ionicons name={aiExpanded ? 'chevron-up' : 'chevron-down'} size={18} color={C.hint} />
            </TouchableOpacity>
            {aiExpanded && (
              <View style={styles.aiBody}>
                <Text style={styles.aiPattern}>{ticket.ai.pattern}</Text>
              </View>
            )}
          </View>
        )}

        {/* Description */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Description</Text>
          <Text style={styles.desc}>{ticket.description}</Text>
        </View>

        {/* Details */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Details</Text>
          <View style={styles.detailGrid}>
            {[
              { label: 'Reported by', value: ticket.reportedBy },
              { label: 'Created',     value: ticket.createdAt },
              { label: 'Type',        value: ticket.type },
              { label: 'Est. Cost',   value: `$${ticket.estimatedCost}` },
              ticket.guestContext ? { label: 'Context', value: ticket.guestContext.replace('_', ' ') } : null,
            ].filter(Boolean).map((d: any) => (
              <View key={d.label} style={styles.detailItem}>
                <Text style={styles.detailLabel}>{d.label}</Text>
                <Text style={styles.detailValue}>{d.value}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Timeline */}
        <View style={styles.activitySection}>
          <Text style={styles.sectionLabel}>Activity</Text>
          <View style={styles.timeline}>
            {ticket.activity.map((a, i) => (
              <View key={i} style={styles.timelineItem}>
                <View style={styles.timelineDotWrap}>
                  <View style={[
                    styles.timelineDot,
                    {
                      backgroundColor:
                        a.actor === SUPERVISOR ? C.blue :
                        a.kind === 'note' ? C.blue :
                        a.kind === 'photo' ? C.purple :
                        a.kind === 'status' ? C.amber :
                        C.hint,
                    },
                  ]} />
                  {i < ticket.activity.length - 1 && <View style={styles.timelineLine} />}
                </View>
                <View style={styles.timelineContent}>
                  <View style={styles.timelineHeader}>
                    <Text style={[styles.timelineActor, a.actor === SUPERVISOR && { color: C.blue }]}>
                      {a.actor}
                    </Text>
                    <Text style={styles.timelineTime}>{a.time}</Text>
                  </View>
                  <Text style={styles.timelineAction}>{a.action}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={{ height: S.xl }} />
      </ScrollView>

      <NoteModal
        visible={messageOpen}
        title={`Message to ${ticket.assignee}`}
        onClose={() => setMessageOpen(false)}
        onSave={(text) => addNote(ticket.id, `Message to ${ticket.assignee}: "${text}"`, SUPERVISOR)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.md,
    paddingHorizontal: S.lg,
    paddingVertical: S.md,
    backgroundColor: C.card,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: F.lg, fontWeight: '800', color: C.text, flex: 1 },
  superBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: C.blue,
    paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: R.full,
  },
  superBadgeText: { fontSize: 10, fontWeight: '800', color: '#fff', letterSpacing: 0.5 },

  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: S.sm },
  notFoundText: { fontSize: F.md, color: C.sub },

  scroll: { flex: 1 },
  content: { padding: S.xl, gap: S.md },

  titleCard: { backgroundColor: C.card, borderRadius: R.xl, padding: S.lg },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: S.sm },
  ticketTitle: { flex: 1, fontSize: F.xl, fontWeight: '800', color: C.text, marginBottom: S.sm },
  watchBtn: { padding: 4 },
  metaRow: { flexDirection: 'row', gap: S.sm, flexWrap: 'wrap' },
  metaChip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: C.input, paddingHorizontal: 8, paddingVertical: 4, borderRadius: R.full },
  metaText: { fontSize: F.xs, color: C.sub, fontWeight: '600' },
  statusDot: { width: 6, height: 6, borderRadius: 3 },

  assigneeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.md,
    backgroundColor: C.card,
    borderLeftWidth: 4,
    borderLeftColor: C.blue,
    borderRadius: R.xl,
    padding: S.lg,
  },
  assigneeAvatar: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: C.amberBg,
    alignItems: 'center', justifyContent: 'center',
  },
  assigneeInitials: { fontSize: F.md, fontWeight: '800', color: C.amber },
  assigneeNameRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  assigneeLabel: { fontSize: 10, fontWeight: '800', color: C.hint, letterSpacing: 0.6 },
  reassignLink: { fontSize: F.xs, fontWeight: '700', color: C.blue },
  assigneeName: { fontSize: F.md, fontWeight: '800', color: C.text, marginTop: 2 },
  assigneeStatus: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  assigneeStatusDot: { width: 8, height: 8, borderRadius: 4 },
  assigneeStatusText: { fontSize: F.xs, color: C.sub, fontWeight: '600' },

  revenueAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.sm,
    backgroundColor: C.redBg,
    borderWidth: 1,
    borderColor: '#fca5a5',
    borderRadius: R.lg,
    padding: S.md,
  },
  revenueTitle: { fontSize: F.sm, fontWeight: '700', color: C.red },
  revenueSub: { fontSize: F.xs, color: C.sub, marginTop: 1 },

  actionsCard: { backgroundColor: C.card, borderRadius: R.xl, padding: S.md, gap: S.sm },
  actionsLabel: { fontSize: F.xs, fontWeight: '800', color: C.hint, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 4 },
  actionGrid: { flexDirection: 'row', gap: S.xs },
  actionBtn: {
    flex: 1, alignItems: 'center', gap: 3,
    paddingVertical: S.md,
    backgroundColor: C.input,
    borderRadius: R.lg,
  },
  actionText: { fontSize: F.xs, fontWeight: '700', color: C.text, marginTop: 2 },
  actionSub: { fontSize: 10, color: C.hint, textTransform: 'lowercase' },

  aiCard: {
    backgroundColor: C.card,
    borderRadius: R.xl,
    borderWidth: 1,
    borderColor: C.brandBg,
    overflow: 'hidden',
  },
  aiHeader: { flexDirection: 'row', alignItems: 'center', gap: S.md, padding: S.lg },
  aiIconWrap: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: C.brandBg,
    alignItems: 'center', justifyContent: 'center',
  },
  aiLabel: { fontSize: 10, fontWeight: '800', color: C.brand, letterSpacing: 0.6 },
  aiCause: { fontSize: F.md, fontWeight: '700', color: C.text, marginTop: 2 },
  aiBody: { paddingHorizontal: S.lg, paddingBottom: S.lg, borderTopWidth: 1, borderTopColor: C.border, paddingTop: S.md },
  aiPattern: { fontSize: F.sm, color: C.sub, lineHeight: 20 },

  card: { backgroundColor: C.card, borderRadius: R.xl, padding: S.lg },
  cardLabel: { fontSize: F.xs, fontWeight: '700', color: C.hint, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: S.sm },
  desc: { fontSize: F.md, color: C.text, lineHeight: 22 },

  detailGrid: { gap: S.sm },
  detailItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  detailLabel: { fontSize: F.sm, color: C.sub },
  detailValue: { fontSize: F.sm, fontWeight: '600', color: C.text, textTransform: 'capitalize' },

  sectionLabel: { fontSize: F.xs, fontWeight: '700', color: C.hint, textTransform: 'uppercase', letterSpacing: 0.6 },
  activitySection: { gap: S.sm },
  timeline: { gap: 0 },
  timelineItem: { flexDirection: 'row', gap: S.md },
  timelineDotWrap: { alignItems: 'center', width: 16 },
  timelineDot: { width: 12, height: 12, borderRadius: 6, marginTop: 4 },
  timelineLine: { width: 2, flex: 1, backgroundColor: C.border, marginVertical: 2 },
  timelineContent: { flex: 1, paddingBottom: S.lg },
  timelineHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
  timelineActor: { fontSize: F.sm, fontWeight: '700', color: C.text },
  timelineTime: { fontSize: F.xs, color: C.hint },
  timelineAction: { fontSize: F.sm, color: C.sub },
});
