import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { C, F, R, S } from '../../src/theme';
import { useAudits, type Audit } from '../../src/store/auditsContext';
import { NoteModal } from '../../src/components/NoteModal';
import { PhotoModal } from '../../src/components/PhotoModal';

// ── Active audit sheet ─────────────────────────────────────────────────

function AuditSheet({ auditId, onExit }: { auditId: string; onExit: () => void }) {
  const {
    getAudit,
    toggleItem,
    setItemNote,
    setItemPhoto,
    pauseAudit,
    completeAudit,
  } = useAudits();

  const [noteTargetIdx, setNoteTargetIdx] = useState<number | null>(null);
  const [photoTargetIdx, setPhotoTargetIdx] = useState<number | null>(null);

  const audit = getAudit(auditId);
  if (!audit) return null;

  const completed = audit.items.filter((c) => c.checked).length;
  const allDone = completed === audit.items.length;

  const handleSubmit = () => {
    const autoScore = Math.round(80 + (completed / audit.items.length) * 18);
    completeAudit(audit.id, autoScore);
    Alert.alert(
      'Audit Submitted',
      `Room ${audit.room} – ${audit.area}\nScore: ${autoScore}/100\n\n${autoScore >= 88 ? '✅ Passed' : autoScore >= 80 ? '⚠️ Needs Attention' : '❌ Failed'}`,
      [{ text: 'OK', onPress: onExit }]
    );
  };

  const handlePause = () => {
    if (completed === 0) {
      // Nothing done yet — just exit
      onExit();
      return;
    }
    Alert.alert(
      'Pause audit?',
      `Your progress (${completed}/${audit.items.length} items) will be saved. You can resume from your audit queue.`,
      [
        { text: 'Keep going', style: 'cancel' },
        {
          text: 'Save & pause',
          onPress: () => {
            pauseAudit(audit.id);
            onExit();
          },
        },
      ]
    );
  };

  return (
    <View style={sheet.wrap}>
      {/* Sheet header */}
      <View style={sheet.header}>
        <View style={{ flex: 1 }}>
          <Text style={sheet.room}>Room {audit.room}</Text>
          <Text style={sheet.area}>{audit.area}</Text>
          {audit.state === 'paused' && (
            <View style={sheet.resumedBadge}>
              <Ionicons name="refresh" size={11} color={C.purple} />
              <Text style={sheet.resumedBadgeText}>Resumed audit</Text>
            </View>
          )}
        </View>
        <TouchableOpacity onPress={handlePause} style={sheet.closeBtn}>
          <Ionicons name="close" size={22} color={C.text} />
        </TouchableOpacity>
      </View>

      {/* Progress */}
      <View style={sheet.progress}>
        <View style={sheet.progressBar}>
          <View style={[sheet.progressFill, { width: `${(completed / audit.items.length) * 100}%` }]} />
        </View>
        <Text style={sheet.progressText}>{completed}/{audit.items.length} items</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: S.xl, gap: S.sm, paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        {audit.items.map((item, i) => (
          <View key={i} style={[sheet.checkItem, item.checked && sheet.checkItemDone]}>
            <TouchableOpacity
              style={{ flexDirection: 'row', alignItems: 'center', gap: S.md, flex: 1 }}
              onPress={() => toggleItem(audit.id, i)}
              activeOpacity={0.85}
            >
              <View style={[sheet.checkbox, item.checked && sheet.checkboxDone]}>
                {item.checked && <Ionicons name="checkmark" size={14} color="#fff" />}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[sheet.checkLabel, item.checked && sheet.checkLabelDone]}>{item.label}</Text>
                {/* Inline indicators for attached evidence */}
                {(item.noteText || item.photoLabel) && (
                  <View style={sheet.evidenceRow}>
                    {item.noteText && (
                      <View style={sheet.evidenceChip}>
                        <Ionicons name="create" size={10} color={C.blue} />
                        <Text style={sheet.evidenceText} numberOfLines={1}>{item.noteText}</Text>
                      </View>
                    )}
                    {item.photoLabel && (
                      <View style={[sheet.evidenceChip, { backgroundColor: C.purpleBg }]}>
                        <Ionicons name="image" size={10} color={C.purple} />
                        <Text style={[sheet.evidenceText, { color: C.purple }]} numberOfLines={1}>{item.photoLabel}</Text>
                      </View>
                    )}
                  </View>
                )}
              </View>
            </TouchableOpacity>
            <View style={sheet.checkActions}>
              <TouchableOpacity onPress={() => setPhotoTargetIdx(i)} style={sheet.checkIcon}>
                <Ionicons
                  name={item.photoLabel ? 'camera' : 'camera-outline'}
                  size={16}
                  color={item.photoLabel ? C.purple : C.hint}
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setNoteTargetIdx(i)} style={sheet.checkIcon}>
                <Ionicons
                  name={item.noteText ? 'create' : 'create-outline'}
                  size={16}
                  color={item.noteText ? C.blue : C.hint}
                />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Sticky footer with Save & Pause + Submit */}
      <View style={sheet.footer}>
        <TouchableOpacity style={sheet.pauseBtn} onPress={handlePause} activeOpacity={0.85}>
          <Ionicons name="pause" size={18} color={C.purple} />
          <Text style={sheet.pauseText}>Save & pause</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[sheet.submitBtn, !allDone && sheet.submitDisabled]}
          onPress={handleSubmit}
          disabled={!allDone}
          activeOpacity={0.85}
        >
          <Ionicons name={allDone ? 'checkmark-circle' : 'lock-closed-outline'} size={18} color="#fff" />
          <Text style={sheet.submitText}>{allDone ? 'Submit audit' : `${audit.items.length - completed} left`}</Text>
        </TouchableOpacity>
      </View>

      <NoteModal
        visible={noteTargetIdx !== null}
        title={noteTargetIdx !== null ? `Note on "${audit.items[noteTargetIdx].label}"` : 'Add note'}
        initialValue={noteTargetIdx !== null ? audit.items[noteTargetIdx].noteText ?? '' : ''}
        onClose={() => setNoteTargetIdx(null)}
        onSave={(text) => {
          if (noteTargetIdx !== null) setItemNote(audit.id, noteTargetIdx, text);
        }}
      />
      <PhotoModal
        visible={photoTargetIdx !== null}
        onClose={() => setPhotoTargetIdx(null)}
        onPick={(label) => {
          if (photoTargetIdx !== null) setItemPhoto(audit.id, photoTargetIdx, label);
        }}
      />
    </View>
  );
}

// ── Main screen ────────────────────────────────────────────────────────

export default function AmirAudit() {
  const { allAudits } = useAudits();
  const [activeAuditId, setActiveAuditId] = useState<string | null>(null);

  if (activeAuditId) {
    return (
      <SafeAreaView style={styles.safe}>
        <AuditSheet auditId={activeAuditId} onExit={() => setActiveAuditId(null)} />
      </SafeAreaView>
    );
  }

  const paused = allAudits.filter((a) => a.state === 'paused');
  const pending = allAudits.filter((a) => a.state === 'pending' || a.state === 'in_progress');
  const completed = allAudits.filter((a) => a.state === 'completed');

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Audit Queue</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{paused.length + pending.length}</Text>
        </View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Paused section */}
        {paused.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Ionicons name="pause-circle" size={14} color={C.purple} />
              <Text style={[styles.sectionLabel, { color: C.purple }]}>Paused · resume where you left off</Text>
            </View>
            {paused.map((a) => <AuditCard key={a.id} audit={a} onOpen={() => setActiveAuditId(a.id)} />)}
          </>
        )}

        {/* Pending */}
        {pending.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Ionicons name="list-outline" size={14} color={C.hint} />
              <Text style={styles.sectionLabel}>Pending audits</Text>
            </View>
            {pending.map((a) => <AuditCard key={a.id} audit={a} onOpen={() => setActiveAuditId(a.id)} />)}
          </>
        )}

        {/* Completed */}
        {completed.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Ionicons name="checkmark-circle" size={14} color={C.green} />
              <Text style={[styles.sectionLabel, { color: C.green }]}>Completed today</Text>
            </View>
            {completed.map((a) => (
              <View key={a.id} style={[styles.card, { opacity: 0.7 }]}>
                <View style={[styles.urgencyBar, { backgroundColor: C.green }]} />
                <View style={styles.cardBody}>
                  <View style={styles.cardTop}>
                    <Text style={styles.roomNum}>Room {a.room}</Text>
                    <Text style={styles.floorText}>Floor {a.floor}</Text>
                    <View style={[styles.badge, { backgroundColor: C.greenBg }]}>
                      <Text style={[styles.badgeText, { color: C.green }]}>✓ {a.score}/100</Text>
                    </View>
                  </View>
                  <Text style={styles.area}>{a.area}</Text>
                  <Text style={styles.itemCount}>Submitted · {a.completedAt}</Text>
                </View>
              </View>
            ))}
          </>
        )}

        <View style={{ height: S.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function AuditCard({ audit, onOpen }: { audit: Audit; onOpen: () => void }) {
  const isPaused = audit.state === 'paused';
  const done = audit.items.filter((i) => i.checked).length;

  const urgencyColor =
    isPaused ? C.purple :
    audit.overdueDays > 7 ? C.red :
    audit.overdueDays > 0 ? C.amber :
    C.blue;

  return (
    <TouchableOpacity style={styles.card} onPress={onOpen} activeOpacity={0.88}>
      <View style={[styles.urgencyBar, { backgroundColor: urgencyColor }]} />
      <View style={styles.cardBody}>
        <View style={styles.cardTop}>
          <Text style={styles.roomNum}>Room {audit.room}</Text>
          <Text style={styles.floorText}>Floor {audit.floor}</Text>
          {isPaused ? (
            <View style={[styles.badge, { backgroundColor: C.purpleBg }]}>
              <Text style={[styles.badgeText, { color: C.purple }]}>PAUSED · {done}/{audit.items.length}</Text>
            </View>
          ) : (
            <View style={[styles.badge, { backgroundColor: audit.overdueDays > 7 ? C.redBg : audit.overdueDays > 0 ? C.amberBg : C.blueBg }]}>
              <Text style={[styles.badgeText, { color: urgencyColor }]}>
                {audit.overdueDays > 0 ? `${audit.overdueDays}d overdue` : 'Due today'}
              </Text>
            </View>
          )}
        </View>
        <Text style={styles.area}>{audit.area}</Text>
        <Text style={styles.itemCount}>
          {isPaused ? `Paused · ${done} of ${audit.items.length} done` : `${audit.items.length} checklist items`}
        </Text>
      </View>
      <View style={styles.startBtn}>
        <Ionicons name={isPaused ? 'play-circle' : 'play-circle-outline'} size={32} color={urgencyColor} />
      </View>
    </TouchableOpacity>
  );
}

// ── Sheet styles ───────────────────────────────────────────────────────

const sheet = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: S.xl,
    backgroundColor: C.card,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  room: { fontSize: F.xl, fontWeight: '800', color: C.text },
  area: { fontSize: F.sm, color: C.sub, marginTop: 2 },
  resumedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    marginTop: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: C.purpleBg,
    borderRadius: R.full,
  },
  resumedBadgeText: { fontSize: 10, fontWeight: '700', color: C.purple, letterSpacing: 0.4 },
  closeBtn: { padding: 6 },
  progress: { flexDirection: 'row', alignItems: 'center', gap: S.md, padding: S.lg, backgroundColor: C.card, borderBottomWidth: 1, borderBottomColor: C.border },
  progressBar: { flex: 1, height: 6, backgroundColor: C.border, borderRadius: R.full, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: C.green, borderRadius: R.full },
  progressText: { fontSize: F.xs, fontWeight: '700', color: C.sub, minWidth: 60 },
  checkItem: { flexDirection: 'row', alignItems: 'center', gap: S.md, backgroundColor: C.card, borderRadius: R.lg, padding: S.md },
  checkItemDone: { opacity: 0.7 },
  checkbox: { width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: C.border, alignItems: 'center', justifyContent: 'center' },
  checkboxDone: { backgroundColor: C.green, borderColor: C.green },
  checkLabel: { fontSize: F.md, color: C.text, fontWeight: '500' },
  checkLabelDone: { textDecorationLine: 'line-through', color: C.hint },
  evidenceRow: { flexDirection: 'row', gap: 4, marginTop: 4, flexWrap: 'wrap' },
  evidenceChip: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: C.blueBg, paddingHorizontal: 6, paddingVertical: 2, borderRadius: R.full, maxWidth: 150 },
  evidenceText: { fontSize: 10, fontWeight: '600', color: C.blue },
  checkActions: { flexDirection: 'row', gap: 2 },
  checkIcon: { padding: 8 },
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row',
    gap: S.sm,
    padding: S.lg,
    paddingBottom: S.xxl,
    backgroundColor: C.card,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  pauseBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center',
    gap: S.xs,
    paddingVertical: S.md,
    borderRadius: R.lg,
    backgroundColor: C.purpleBg,
  },
  pauseText: { fontSize: F.md, fontWeight: '700', color: C.purple },
  submitBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center',
    gap: S.sm,
    paddingVertical: S.md,
    borderRadius: R.lg,
    backgroundColor: C.green,
  },
  submitDisabled: { backgroundColor: C.hint },
  submitText: { fontSize: F.md, fontWeight: '700', color: '#fff' },
});

// ── List styles ────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.sm,
    paddingHorizontal: S.xl,
    paddingVertical: S.lg,
    backgroundColor: C.card,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  title: { fontSize: F.xl, fontWeight: '800', color: C.text },
  countBadge: { backgroundColor: C.amberBg, paddingHorizontal: 8, paddingVertical: 3, borderRadius: R.full },
  countText: { fontSize: F.xs, fontWeight: '800', color: C.amber },
  scroll: { flex: 1 },
  content: { padding: S.xl, gap: S.sm },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: S.sm, marginBottom: 2 },
  sectionLabel: { fontSize: F.xs, fontWeight: '700', color: C.hint, textTransform: 'uppercase', letterSpacing: 0.8 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.card,
    borderRadius: R.xl,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  urgencyBar: { width: 4, alignSelf: 'stretch' },
  cardBody: { flex: 1, padding: S.md },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: S.sm, marginBottom: S.xs },
  roomNum: { fontSize: F.lg, fontWeight: '800', color: C.text },
  floorText: { fontSize: F.sm, color: C.hint },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: R.full },
  badgeText: { fontSize: F.xs, fontWeight: '700' },
  area: { fontSize: F.md, fontWeight: '600', color: C.text, marginBottom: 2 },
  itemCount: { fontSize: F.sm, color: C.sub },
  startBtn: { paddingRight: S.md },
});
