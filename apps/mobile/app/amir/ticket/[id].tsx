import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { C, F, R, S } from '../../../src/theme';
import { useTickets, type TicketStatus } from '../../../src/store/ticketsContext';
import { NoteModal } from '../../../src/components/NoteModal';
import { PhotoModal } from '../../../src/components/PhotoModal';

const PRIORITY_CFG: Record<string, { color: string; bg: string; label: string }> = {
  urgent: { color: C.red,   bg: C.redBg,   label: 'URGENT' },
  high:   { color: C.amber, bg: C.amberBg, label: 'HIGH' },
  normal: { color: C.blue,  bg: C.blueBg,  label: 'NORMAL' },
};

const NEXT_STEP: Record<TicketStatus, { label: string; icon: string; newStatus: TicketStatus; color: string } | null> = {
  open:         { label: "I'm on my way",         icon: 'walk-outline',       newStatus: 'en_route',     color: C.blue },
  en_route:     { label: "I'm in the room",       icon: 'enter-outline',      newStatus: 'in_progress',  color: C.amber },
  in_progress:  { label: 'Mark as fixed',         icon: 'checkmark-outline',  newStatus: 'resolved',     color: C.green },
  pending_part: { label: 'Part arrived — resume', icon: 'construct-outline',  newStatus: 'in_progress',  color: C.blue },
  scheduled:    { label: 'Start now',             icon: 'play-outline',       newStatus: 'in_progress',  color: C.blue },
  resolved:     null,
  escalated:    null,
};

const STATUS_LABEL: Record<TicketStatus, string> = {
  open:          'Open',
  en_route:      'En route',
  in_progress:   'In progress',
  pending_part:  'Waiting on part',
  scheduled:     'Scheduled',
  resolved:      'Resolved',
  escalated:     'Escalated',
};

const STATUS_COLOR: Record<TicketStatus, string> = {
  open:         C.red,
  en_route:     C.blue,
  in_progress:  C.amber,
  pending_part: C.purple,
  scheduled:    C.blue,
  resolved:     C.green,
  escalated:    C.red,
};

export default function TicketDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { getTicket, updateStatus, addNote, addPhoto, setAiFeedback } = useTickets();

  const ticket = getTicket(id ?? '');
  const [aiExpanded, setAiExpanded] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);
  const [photoOpen, setPhotoOpen] = useState(false);

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

  const p = PRIORITY_CFG[ticket.priority] ?? PRIORITY_CFG.normal;
  const nextStep = NEXT_STEP[ticket.status];

  const handlePrimaryAction = () => {
    if (!nextStep) return;
    // When marking as fixed, prompt for item source for traceability
    if (nextStep.newStatus === 'resolved') {
      Alert.alert(
        'Log item source',
        'Where did the parts/replacement come from? (helps inventory tracking)',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'From stock',
            onPress: () => {
              addNote(ticket.id, 'Part source: pulled from main stock cabinet.');
              updateStatus(ticket.id, 'resolved');
            },
          },
          {
            text: 'From vacant room',
            onPress: () => {
              addNote(ticket.id, 'Part source: swapped from vacant room. Noted for replacement re-order.');
              updateStatus(ticket.id, 'resolved');
            },
          },
          {
            text: 'Temporary fix',
            onPress: () => {
              addNote(ticket.id, 'Temporary fix only. Permanent repair still needed — flagged for follow-up.');
              updateStatus(ticket.id, 'resolved');
            },
          },
        ]
      );
      return;
    }
    updateStatus(ticket.id, nextStep.newStatus);
  };

  const handleNeedPart = () => {
    updateStatus(ticket.id, 'pending_part');
    Alert.alert('Part requested', 'Logged as waiting for part. Inventory & supervisor notified.');
  };

  const handleEscalate = () => {
    Alert.alert('Escalate to Sydney?', 'Supervisor will be paged and ticket will stay open.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Escalate', style: 'destructive', onPress: () => updateStatus(ticket.id, 'escalated') },
    ]);
  };

  const handleNeedFollowUp = () => {
    Alert.alert('Need follow-up', 'Log for next shift to investigate further — ticket stays open.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log follow-up',
        onPress: () => addNote(ticket.id, 'Flagged for follow-up — not a quick fix. Notes attached, handing to next shift.'),
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={C.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{ticket.id}</Text>
        <View style={[styles.priorityBadge, { backgroundColor: p.bg }]}>
          <Text style={[styles.priorityText, { color: p.color }]}>{p.label}</Text>
        </View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Title card */}
        <View style={styles.titleCard}>
          <Text style={styles.ticketTitle}>{ticket.title}</Text>
          <View style={styles.metaRow}>
            <TouchableOpacity
              style={[styles.metaChip, styles.metaLinkChip]}
              onPress={() => router.push(`/amir/room/${ticket.room}` as any)}
              activeOpacity={0.8}
            >
              <Ionicons name="bed-outline" size={12} color={C.blue} />
              <Text style={[styles.metaText, { color: C.blue, fontWeight: '700' }]}>
                Room {ticket.room} · Fl {ticket.floor}
              </Text>
              <Ionicons name="chevron-forward" size={10} color={C.blue} />
            </TouchableOpacity>
            <View style={styles.metaChip}>
              <Ionicons name="grid-outline" size={12} color={C.hint} />
              <Text style={styles.metaText}>{ticket.area}</Text>
            </View>
            <View style={[styles.metaChip, { backgroundColor: STATUS_COLOR[ticket.status] + '20' }]}>
              <View style={[styles.statusDot, { backgroundColor: STATUS_COLOR[ticket.status] }]} />
              <Text style={[styles.metaText, { color: STATUS_COLOR[ticket.status], fontWeight: '700' }]}>
                {STATUS_LABEL[ticket.status]}
              </Text>
            </View>
            {ticket.repeatInRoom && (
              <View style={[styles.metaChip, { backgroundColor: C.purpleBg }]}>
                <Ionicons name="refresh-outline" size={12} color={C.purple} />
                <Text style={[styles.metaText, { color: C.purple, fontWeight: '700' }]}>Repeat</Text>
              </View>
            )}
          </View>
        </View>

        {/* Quick actions */}
        <View style={styles.actionsCard}>
          {nextStep ? (
            <TouchableOpacity
              style={[styles.primaryBtn, { backgroundColor: nextStep.color }]}
              onPress={handlePrimaryAction}
              activeOpacity={0.88}
            >
              <Ionicons name={nextStep.icon as any} size={22} color="#fff" />
              <Text style={styles.primaryText}>{nextStep.label}</Text>
              <Ionicons name="arrow-forward" size={18} color="#fff" />
            </TouchableOpacity>
          ) : (
            <View style={[styles.primaryBtn, { backgroundColor: STATUS_COLOR[ticket.status], opacity: 0.6 }]}>
              <Ionicons name={ticket.status === 'resolved' ? 'checkmark-circle' : 'alert-circle'} size={22} color="#fff" />
              <Text style={styles.primaryText}>
                {STATUS_LABEL[ticket.status]}
              </Text>
            </View>
          )}

          <View style={styles.secondaryRow}>
            <TouchableOpacity style={styles.secondaryBtn} onPress={() => setPhotoOpen(true)} activeOpacity={0.8}>
              <Ionicons name="camera-outline" size={18} color={C.text} />
              <Text style={styles.secondaryText}>Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryBtn} onPress={() => setNoteOpen(true)} activeOpacity={0.8}>
              <Ionicons name="create-outline" size={18} color={C.text} />
              <Text style={styles.secondaryText}>Note</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryBtn} onPress={handleNeedFollowUp} activeOpacity={0.8}>
              <Ionicons name="time-outline" size={18} color="#0891b2" />
              <Text style={[styles.secondaryText, { color: '#0891b2' }]}>Follow-up</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryBtn} onPress={handleNeedPart} activeOpacity={0.8}>
              <Ionicons name="cube-outline" size={18} color={C.purple} />
              <Text style={[styles.secondaryText, { color: C.purple }]}>Need part</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryBtn} onPress={handleEscalate} activeOpacity={0.8}>
              <Ionicons name="warning-outline" size={18} color={C.red} />
              <Text style={[styles.secondaryText, { color: C.red }]}>Escalate</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* AI Insight */}
        {ticket.ai && (
          <View style={styles.aiCard}>
            <TouchableOpacity
              style={styles.aiHeader}
              onPress={() => setAiExpanded((v) => !v)}
              activeOpacity={0.9}
            >
              <View style={styles.aiIconWrap}>
                <Ionicons name="sparkles" size={14} color={C.brand} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.aiTitleRow}>
                  <Text style={styles.aiLabel}>AI ASSISTANT</Text>
                  <View style={styles.confidenceBadge}>
                    <Text style={styles.confidenceText}>{ticket.ai.confidence}% confident</Text>
                  </View>
                </View>
                <Text style={styles.aiCause}>Likely: {ticket.ai.likelyCause}</Text>
              </View>
              <Ionicons name={aiExpanded ? 'chevron-up' : 'chevron-down'} size={18} color={C.hint} />
            </TouchableOpacity>

            {aiExpanded && (
              <View style={styles.aiBody}>
                <View style={styles.aiSection}>
                  <View style={styles.aiSectionHeader}>
                    <Ionicons name="analytics-outline" size={14} color={C.sub} />
                    <Text style={styles.aiSectionTitle}>Pattern</Text>
                  </View>
                  <Text style={styles.aiSectionBody}>{ticket.ai.pattern}</Text>
                </View>

                <View style={styles.aiSection}>
                  <View style={styles.aiSectionHeader}>
                    <Ionicons name="construct-outline" size={14} color={C.sub} />
                    <Text style={styles.aiSectionTitle}>Suggested fix</Text>
                  </View>
                  <View style={styles.stepList}>
                    {ticket.ai.fixSteps.map((step, i) => (
                      <View key={i} style={styles.stepRow}>
                        <View style={styles.stepNum}>
                          <Text style={styles.stepNumText}>{i + 1}</Text>
                        </View>
                        <Text style={styles.stepText}>{step}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                <View style={styles.aiSection}>
                  <View style={styles.aiSectionHeader}>
                    <Ionicons name="cube-outline" size={14} color={C.sub} />
                    <Text style={styles.aiSectionTitle}>Parts likely needed</Text>
                  </View>
                  {ticket.ai.partsNeeded.map((part, i) => (
                    <View key={i} style={styles.partRow}>
                      <Ionicons
                        name={part.inCart ? 'checkmark-circle' : 'ellipse-outline'}
                        size={14}
                        color={part.inCart ? C.green : C.amber}
                      />
                      <Text style={styles.partName}>{part.name}</Text>
                      <Text style={[styles.partStatus, { color: part.inCart ? C.green : C.amber }]}>
                        {part.inCart ? 'in cart' : part.vendor ?? 'order'}
                      </Text>
                    </View>
                  ))}
                </View>

                {/* Feedback */}
                <View style={styles.aiFeedback}>
                  <Text style={styles.aiFeedbackLabel}>
                    {ticket.aiFeedback === 'up' ? 'Thanks — feedback logged' :
                     ticket.aiFeedback === 'down' ? 'Got it — we\'ll improve this' :
                     'Was this helpful?'}
                  </Text>
                  <View style={styles.aiFeedbackBtns}>
                    <TouchableOpacity
                      style={[styles.feedbackBtn, ticket.aiFeedback === 'up' && { backgroundColor: C.greenBg }]}
                      onPress={() => setAiFeedback(ticket.id, 'up')}
                    >
                      <Ionicons
                        name={ticket.aiFeedback === 'up' ? 'thumbs-up' : 'thumbs-up-outline'}
                        size={14}
                        color={C.green}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.feedbackBtn, ticket.aiFeedback === 'down' && { backgroundColor: C.redBg }]}
                      onPress={() => setAiFeedback(ticket.id, 'down')}
                    >
                      <Ionicons
                        name={ticket.aiFeedback === 'down' ? 'thumbs-down' : 'thumbs-down-outline'}
                        size={14}
                        color={C.red}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
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
            ].map((d) => (
              <View key={d.label} style={styles.detailItem}>
                <Text style={styles.detailLabel}>{d.label}</Text>
                <Text style={styles.detailValue}>{d.value}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Revenue at risk */}
        {ticket.revenueLost > 0 && ticket.status !== 'resolved' && (
          <View style={styles.revenueAlert}>
            <Ionicons name="alert-circle" size={16} color={C.red} />
            <View style={{ flex: 1 }}>
              <Text style={styles.revenueTitle}>Revenue at risk</Text>
              <Text style={styles.revenueSub}>${ticket.revenueLost}/night · room is OOO</Text>
            </View>
          </View>
        )}

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
                    <Text style={styles.timelineActor}>{a.actor}</Text>
                    <Text style={styles.timelineTime}>{a.time}</Text>
                  </View>
                  <Text style={styles.timelineAction}>{a.action}</Text>
                  {a.kind === 'photo' && a.photoLabel && (
                    <View style={styles.photoAttachment}>
                      <Ionicons name="image-outline" size={14} color={C.purple} />
                      <Text style={styles.photoAttachmentText}>{a.photoLabel}</Text>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={{ height: S.xl }} />
      </ScrollView>

      <NoteModal
        visible={noteOpen}
        onClose={() => setNoteOpen(false)}
        onSave={(text) => addNote(ticket.id, text)}
      />
      <PhotoModal
        visible={photoOpen}
        onClose={() => setPhotoOpen(false)}
        onPick={(label) => addPhoto(ticket.id, label)}
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
  priorityBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: R.full },
  priorityText: { fontSize: F.xs, fontWeight: '800' },

  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: S.sm },
  notFoundText: { fontSize: F.md, color: C.sub },

  scroll: { flex: 1 },
  content: { padding: S.xl, gap: S.md },

  titleCard: { backgroundColor: C.card, borderRadius: R.xl, padding: S.lg },
  ticketTitle: { fontSize: F.xl, fontWeight: '800', color: C.text, marginBottom: S.sm },
  metaRow: { flexDirection: 'row', gap: S.sm, flexWrap: 'wrap' },
  metaChip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: C.input, paddingHorizontal: 8, paddingVertical: 4, borderRadius: R.full },
  metaLinkChip: { backgroundColor: C.blueBg },
  metaText: { fontSize: F.xs, color: C.sub, fontWeight: '600' },
  statusDot: { width: 6, height: 6, borderRadius: 3 },

  actionsCard: {
    backgroundColor: C.card,
    borderRadius: R.xl,
    padding: S.md,
    gap: S.sm,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: S.sm,
    paddingVertical: S.lg,
    borderRadius: R.lg,
  },
  primaryText: { fontSize: F.lg, fontWeight: '800', color: '#fff', flex: 1, textAlign: 'center' },

  secondaryRow: { flexDirection: 'row', gap: S.xs },
  secondaryBtn: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    paddingVertical: S.md,
    backgroundColor: C.input,
    borderRadius: R.lg,
  },
  secondaryText: { fontSize: F.xs, fontWeight: '700', color: C.text },

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
  aiTitleRow: { flexDirection: 'row', alignItems: 'center', gap: S.sm, marginBottom: 2 },
  aiLabel: { fontSize: 10, fontWeight: '800', color: C.brand, letterSpacing: 0.8 },
  confidenceBadge: { backgroundColor: C.input, paddingHorizontal: 6, paddingVertical: 2, borderRadius: R.full },
  confidenceText: { fontSize: 10, fontWeight: '700', color: C.sub },
  aiCause: { fontSize: F.md, fontWeight: '700', color: C.text },

  aiBody: { paddingHorizontal: S.lg, paddingBottom: S.lg, gap: S.lg, borderTopWidth: 1, borderTopColor: C.border, paddingTop: S.md },
  aiSection: { gap: S.xs },
  aiSectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  aiSectionTitle: { fontSize: F.xs, fontWeight: '700', color: C.sub, textTransform: 'uppercase', letterSpacing: 0.6 },
  aiSectionBody: { fontSize: F.sm, color: C.text, lineHeight: 20 },

  stepList: { gap: S.xs + 2 },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', gap: S.sm },
  stepNum: {
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: C.brandBg,
    alignItems: 'center', justifyContent: 'center',
    marginTop: 1,
  },
  stepNumText: { fontSize: 11, fontWeight: '800', color: C.brand },
  stepText: { flex: 1, fontSize: F.sm, color: C.text, lineHeight: 20 },

  partRow: { flexDirection: 'row', alignItems: 'center', gap: S.sm, paddingVertical: 4 },
  partName: { flex: 1, fontSize: F.sm, color: C.text },
  partStatus: { fontSize: F.xs, fontWeight: '700', textTransform: 'lowercase' },

  aiFeedback: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: S.sm, borderTopWidth: 1, borderTopColor: C.border },
  aiFeedbackLabel: { fontSize: F.xs, color: C.sub },
  aiFeedbackBtns: { flexDirection: 'row', gap: S.sm },
  feedbackBtn: {
    width: 32, height: 32, borderRadius: R.md,
    backgroundColor: C.input,
    alignItems: 'center', justifyContent: 'center',
  },

  card: { backgroundColor: C.card, borderRadius: R.xl, padding: S.lg },
  cardLabel: { fontSize: F.xs, fontWeight: '700', color: C.hint, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: S.sm },
  desc: { fontSize: F.md, color: C.text, lineHeight: 22 },

  detailGrid: { gap: S.sm },
  detailItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  detailLabel: { fontSize: F.sm, color: C.sub },
  detailValue: { fontSize: F.sm, fontWeight: '600', color: C.text },

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
  revenueSub: { fontSize: F.xs, color: C.sub },

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
  photoAttachment: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
    backgroundColor: C.purpleBg,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: R.full,
  },
  photoAttachmentText: { fontSize: F.xs, color: C.purple, fontWeight: '600' },
});
