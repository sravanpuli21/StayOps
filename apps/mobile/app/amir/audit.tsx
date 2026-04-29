import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { C, F, R, S } from '../../src/theme';

const AUDIT_QUEUE = [
  { room: '215', floor: 2, area: 'HVAC / Climate',        overdueDays: 12, items: ['Filter condition', 'Thermostat calibration', 'Coil cleanliness', 'Refrigerant level', 'Airflow test'] },
  { room: '109', floor: 1, area: 'Plumbing',              overdueDays: 6,  items: ['Shower pressure', 'Hot water temp (target 118°F)', 'Toilet mechanism', 'Under-sink pipes', 'Shut-off valve'] },
  { room: '312', floor: 3, area: 'Safety Equipment',      overdueDays: 3,  items: ['Smoke detector test', 'CO detector battery', 'Sprinkler clearance', 'Fire escape card updated', 'Door deadbolt'] },
  { room: '508', floor: 5, area: 'Bathroom',              overdueDays: 1,  items: ['Grout condition', 'Caulk seal', 'Exhaust fan CFM', 'Fixtures clean', 'Water temperature'] },
  { room: '404', floor: 4, area: 'Electrical & Lighting', overdueDays: 0,  items: ['All outlets functional', 'Lamp bulbs', 'Switch plates', 'Smoke detector battery', 'Nightstand USB ports'] },
];

interface ChecklistItem {
  label: string;
  checked: boolean;
  hasNote: boolean;
  hasPhoto: boolean;
}

function AuditSheet({ room, area, items, onClose }: { room: string; area: string; items: string[]; onClose: () => void }) {
  const [checklist, setChecklist] = useState<ChecklistItem[]>(
    items.map((label) => ({ label, checked: false, hasNote: false, hasPhoto: false }))
  );
  const [score, setScore] = useState<number | null>(null);

  const toggle = (i: number) => {
    setChecklist((prev) => prev.map((item, idx) => idx === i ? { ...item, checked: !item.checked } : item));
  };

  const completed = checklist.filter((c) => c.checked).length;
  const allDone = completed === checklist.length;

  const handleSubmit = () => {
    const autoScore = Math.round(80 + (completed / checklist.length) * 18);
    setScore(autoScore);
    Alert.alert(
      'Audit Submitted',
      `Room ${room} – ${area}\nScore: ${autoScore}/100\n\n${autoScore >= 88 ? '✅ Passed' : autoScore >= 80 ? '⚠️ Needs Attention' : '❌ Failed'}`,
      [{ text: 'OK', onPress: onClose }]
    );
  };

  return (
    <View style={sheet.wrap}>
      {/* Sheet header */}
      <View style={sheet.header}>
        <View>
          <Text style={sheet.room}>Room {room}</Text>
          <Text style={sheet.area}>{area}</Text>
        </View>
        <TouchableOpacity onPress={onClose} style={sheet.closeBtn}>
          <Ionicons name="close" size={22} color={C.text} />
        </TouchableOpacity>
      </View>

      {/* Progress */}
      <View style={sheet.progress}>
        <View style={sheet.progressBar}>
          <View style={[sheet.progressFill, { width: `${(completed / checklist.length) * 100}%` }]} />
        </View>
        <Text style={sheet.progressText}>{completed}/{checklist.length} items</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: S.xl, gap: S.sm }} showsVerticalScrollIndicator={false}>
        {checklist.map((item, i) => (
          <TouchableOpacity key={i} style={[sheet.checkItem, item.checked && sheet.checkItemDone]} onPress={() => toggle(i)} activeOpacity={0.85}>
            <View style={[sheet.checkbox, item.checked && sheet.checkboxDone]}>
              {item.checked && <Ionicons name="checkmark" size={14} color="#fff" />}
            </View>
            <Text style={[sheet.checkLabel, item.checked && sheet.checkLabelDone]}>{item.label}</Text>
            {!item.checked && (
              <View style={sheet.checkActions}>
                <TouchableOpacity onPress={() => Alert.alert('Photo', 'Camera would open here in production')} style={sheet.checkIcon}>
                  <Ionicons name="camera-outline" size={16} color={C.hint} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => Alert.alert('Note', 'Note input would open here in production')} style={sheet.checkIcon}>
                  <Ionicons name="create-outline" size={16} color={C.hint} />
                </TouchableOpacity>
              </View>
            )}
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          style={[sheet.submitBtn, !allDone && sheet.submitDisabled]}
          onPress={handleSubmit}
          disabled={!allDone}
          activeOpacity={0.85}
        >
          <Ionicons name={allDone ? 'checkmark-circle' : 'lock-closed-outline'} size={18} color="#fff" />
          <Text style={sheet.submitText}>{allDone ? 'Submit Audit' : `Complete all ${checklist.length - completed} remaining items`}</Text>
        </TouchableOpacity>

        <View style={{ height: S.xxl }} />
      </ScrollView>
    </View>
  );
}

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
  closeBtn: { padding: 6 },
  progress: { flexDirection: 'row', alignItems: 'center', gap: S.md, padding: S.lg, backgroundColor: C.card, borderBottomWidth: 1, borderBottomColor: C.border },
  progressBar: { flex: 1, height: 6, backgroundColor: C.border, borderRadius: R.full, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: C.green, borderRadius: R.full },
  progressText: { fontSize: F.xs, fontWeight: '700', color: C.sub, minWidth: 60 },
  checkItem: { flexDirection: 'row', alignItems: 'center', gap: S.md, backgroundColor: C.card, borderRadius: R.lg, padding: S.md },
  checkItemDone: { opacity: 0.7 },
  checkbox: { width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: C.border, alignItems: 'center', justifyContent: 'center' },
  checkboxDone: { backgroundColor: C.green, borderColor: C.green },
  checkLabel: { flex: 1, fontSize: F.md, color: C.text, fontWeight: '500' },
  checkLabelDone: { textDecorationLine: 'line-through', color: C.hint },
  checkActions: { flexDirection: 'row', gap: S.xs },
  checkIcon: { padding: 6 },
  submitBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: S.sm, backgroundColor: C.green, borderRadius: R.lg, padding: S.lg, marginTop: S.md },
  submitDisabled: { backgroundColor: C.hint },
  submitText: { fontSize: F.md, fontWeight: '700', color: '#fff' },
});

// ── Main screen ────────────────────────────────────────────────────────────────

export default function AmirAudit() {
  const [activeAudit, setActiveAudit] = useState<typeof AUDIT_QUEUE[0] | null>(null);

  if (activeAudit) {
    return <SafeAreaView style={styles.safe}><AuditSheet room={activeAudit.room} area={activeAudit.area} items={activeAudit.items} onClose={() => setActiveAudit(null)} /></SafeAreaView>;
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Audit Queue</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{AUDIT_QUEUE.length}</Text>
        </View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.hint}>Tap a room to start the audit checklist</Text>

        {AUDIT_QUEUE.map((a) => (
          <TouchableOpacity key={`${a.room}-${a.area}`} style={styles.card} onPress={() => setActiveAudit(a)} activeOpacity={0.88}>
            <View style={[styles.urgencyBar, { backgroundColor: a.overdueDays > 7 ? C.red : a.overdueDays > 0 ? C.amber : C.blue }]} />
            <View style={styles.cardBody}>
              <View style={styles.cardTop}>
                <Text style={styles.roomNum}>Room {a.room}</Text>
                <Text style={styles.floorText}>Floor {a.floor}</Text>
                <View style={[styles.badge, { backgroundColor: a.overdueDays > 7 ? C.redBg : a.overdueDays > 0 ? C.amberBg : C.blueBg }]}>
                  <Text style={[styles.badgeText, { color: a.overdueDays > 7 ? C.red : a.overdueDays > 0 ? C.amber : C.blue }]}>
                    {a.overdueDays > 0 ? `${a.overdueDays}d overdue` : 'Due today'}
                  </Text>
                </View>
              </View>
              <Text style={styles.area}>{a.area}</Text>
              <Text style={styles.itemCount}>{a.items.length} checklist items</Text>
            </View>
            <View style={styles.startBtn}>
              <Ionicons name="play-circle" size={32} color={C.amber} />
            </View>
          </TouchableOpacity>
        ))}

        <View style={{ height: S.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

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
  hint: { fontSize: F.sm, color: C.hint, marginBottom: S.xs },
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
