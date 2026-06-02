import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Alert, TextInput } from 'react-native';
import { useState, useMemo, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { C, F, R, S } from '../../theme';
import { SectionLabel } from '../web-ui/SectionLabel';
import {
  getAudit, totalItems, inspectedItems, failedItems, roomProgress,
  CONDITION_CFG, TYPE_CFG,
  type Audit, type AuditRoom, type AuditArea, type AuditItem, type Condition,
} from '../../data/audits';
import { savePausedAudit, loadPausedAudit, clearPausedAudit, isPaused } from '../../data/audit-progress';
import { askWhatItem, type UsageResult } from '../../lib/inventory-flow';

type Mode = 'sydney' | 'amir';

export function AuditDetail({ id, mode, backHref }: { id: string; mode: Mode; backHref: string }) {
  const router = useRouter();
  const original = getAudit(id);

  /* On mount: prefer paused state if it exists, else use audit's fresh rooms */
  const initialRooms = (() => {
    if (!original) return [];
    const paused = loadPausedAudit(id);
    if (paused) return paused.rooms;
    return original.rooms.map((r) => ({ ...r, areas: r.areas.map((a) => ({ ...a, items: a.items.map((i) => ({ ...i })) })) }));
  })();

  const [rooms, setRooms] = useState<AuditRoom[]>(initialRooms);
  const wasPaused = useMemo(() => isPaused(id), [id]);
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);

  /* For 1-room audits, auto-enter that room */
  useEffect(() => {
    if (rooms.length === 1) setActiveRoomId(rooms[0].id);
  }, [rooms.length]);

  if (!original) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={styles.empty}>Audit {id} not found</Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const audit: Audit = { ...original, rooms };
  const ty = TYPE_CFG[audit.type];
  const total      = totalItems(audit);
  const inspected  = inspectedItems(audit);
  const failedAll  = failedItems(audit);

  const activeRoom = rooms.find((r) => r.id === activeRoomId) ?? null;

  function updateItem(itemId: string, patch: Partial<AuditItem>) {
    setRooms((prev) => prev.map((r) => ({
      ...r,
      areas: r.areas.map((area) => ({
        ...area,
        items: area.items.map((it) => it.id === itemId ? { ...it, ...patch } : it),
      })),
    })));
  }

  function pass(item: AuditItem) {
    updateItem(item.id, { present: true, working: true, condition: 'good' });
  }

  function fail(item: AuditItem) {
    updateItem(item.id, { condition: 'damaged' });
    promptFailedAction(item);
  }

  function promptFailedAction(item: AuditItem) {
    Alert.alert(
      'Failed item — what next?',
      `${item.label}\nPhoto / note required.`,
      [
        { text: 'Fix now',                onPress: () => updateItem(item.id, { action: 'repair' }) },
        { text: 'Create ticket',          onPress: () => createTicket(item) },
        { text: 'Use inventory item',     onPress: () => askInventoryItem(item) },
        { text: 'Mark for replacement',   onPress: () => updateItem(item.id, { action: 'replace' }) },
        { text: 'Mark OOO risk',          onPress: () => updateItem(item.id, { oooRisk: true }) },
        { text: 'Escalate to Sydney',     style: 'destructive', onPress: () => escalate(item) },
        { text: 'Cancel',                 style: 'cancel' },
      ]
    );
  }

  function askInventoryItem(item: AuditItem) {
    askWhatItem(item.label, (result: UsageResult) => {
      const sourceLabel = result.sourceRoom ? `Room ${result.sourceRoom}` : result.source;
      updateItem(item.id, {
        action: 'replace',
        inventoryUsed: {
          item: `${result.itemLabel}${result.variant ? ` · ${result.variant}` : ''}`,
          qty: 1,
          source: sourceLabel,
        },
      });
    });
  }

  function createTicket(item: AuditItem) {
    const ticketId = `TK-AUD-${Math.floor(Math.random() * 900 + 100)}`;
    updateItem(item.id, { action: 'replace', ticketCreatedId: ticketId });
    Alert.alert('Ticket created', `${ticketId}\nLinked to: ${audit.id}`);
  }

  function escalate(item: AuditItem) {
    Alert.alert('Escalated', `${item.label} sent to Sydney with note + photo required.`);
  }

  function setCondition(item: AuditItem, condition: Condition) {
    updateItem(item.id, { condition });
    if (condition === 'poor' || condition === 'damaged') promptFailedAction(item);
  }

  function addPhoto(item: AuditItem) {
    Alert.alert('Photo', `${item.label}`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Camera',  onPress: () => updateItem(item.id, { photoLabel: 'Camera · captured' }) },
      { text: 'Gallery', onPress: () => updateItem(item.id, { photoLabel: 'Gallery · selected' }) },
    ]);
  }

  function reassign() {
    Alert.alert('Reassign audit?', `Currently: ${audit.assignedTo}\nBackup: ${audit.backupOwner}`, [
      { text: 'Cancel', style: 'cancel' },
      { text: `Move to ${audit.backupOwner}`, onPress: () => Alert.alert('Reassigned', `${audit.id} → ${audit.backupOwner}`) },
    ]);
  }

  function pauseAudit() {
    Alert.alert(
      'Pause audit?',
      'Progress is saved. Resume later from the audits list.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Save & pause', onPress: () => {
          savePausedAudit(audit.id, rooms);
          Alert.alert('Paused', `${audit.id} saved. ${inspected}/${total} items inspected.`);
          router.back();
        } },
      ]
    );
  }

  function submitAudit() {
    const failed = failedItems(audit);
    const missingProof = failed.filter((i) => !i.note && !i.photoLabel);
    if (missingProof.length > 0) {
      Alert.alert('Proof required', `${missingProof.length} failed item${missingProof.length > 1 ? 's' : ''} still need photo or note.`);
      return;
    }
    Alert.alert(
      'Submit audit?',
      `Inspected ${inspected} of ${total} items\n${failed.length} failed`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Submit', onPress: () => {
          clearPausedAudit(audit.id);
          Alert.alert('Submitted', `${audit.id} delivered to Sydney's dashboard.`);
          router.back();
        } },
      ]
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.headerCard}>
          <View style={styles.backRow}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backLeft} activeOpacity={0.7}>
              <Ionicons name="chevron-back" size={20} color={C.sub} />
              <Text style={styles.backText}>{backHref}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={pauseAudit} style={styles.pauseBtn} activeOpacity={0.85}>
              <Ionicons name="pause-circle-outline" size={16} color={C.text} />
              <Text style={styles.pauseBtnText}>Pause</Text>
            </TouchableOpacity>
          </View>

          {wasPaused && (
            <View style={styles.resumedBanner}>
              <Ionicons name="play-circle-outline" size={14} color="#15803d" />
              <Text style={styles.resumedText}>Resumed from pause · {inspected}/{total} done</Text>
            </View>
          )}

          <View style={styles.idRow}>
            <View style={[styles.typeChip, { backgroundColor: ty.bg }]}>
              <Ionicons name={ty.icon as any} size={11} color={ty.color} />
              <Text style={[styles.typeChipText, { color: ty.color }]}>{ty.label.toUpperCase()}</Text>
            </View>
            <Text style={styles.age}>{audit.dueDate}</Text>
          </View>

          <Text style={styles.title}>{audit.name}</Text>
          <Text style={styles.scope}>{audit.scopeLabel}</Text>

          <View style={styles.ownerCard}>
            <View style={styles.ownerRow}>
              <Ionicons name="person-circle-outline" size={16} color={C.sub} />
              <Text style={styles.ownerLabel}>Owner</Text>
              <Text style={styles.ownerValue}>{audit.assignedTo}</Text>
              <View style={[styles.famBadge, audit.familiarityScore === 'high' ? styles.famHigh : audit.familiarityScore === 'medium' ? styles.famMed : styles.famLow]}>
                <Text style={[styles.famText, audit.familiarityScore === 'high' ? styles.famTextHigh : audit.familiarityScore === 'medium' ? styles.famTextMed : styles.famTextLow]}>
                  {audit.familiarityScore.toUpperCase()}
                </Text>
              </View>
            </View>
            {audit.reassignmentReason && (
              <Text style={styles.reassignReason}>↳ {audit.reassignmentReason}</Text>
            )}
            {mode === 'sydney' && (
              <TouchableOpacity onPress={reassign} style={styles.reassignBtn} activeOpacity={0.85}>
                <Ionicons name="swap-horizontal-outline" size={14} color={C.sub} />
                <Text style={styles.reassignBtnText}>Reassign</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Progress */}
        <View style={styles.progressCard}>
          <Text style={styles.progressText}>
            {inspected} of {total} inspected
            {failedAll.length > 0 && <Text style={{ color: '#b91c1c', fontWeight: '700' }}> · {failedAll.length} failed</Text>}
          </Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${total > 0 ? (inspected / total) * 100 : 0}%` }]} />
          </View>
        </View>

        {/* Previous notes */}
        {audit.prevNotes.length > 0 && (
          <>
            <SectionLabel>Previous notes</SectionLabel>
            <View style={styles.card}>
              {audit.prevNotes.map((n, i) => (
                <View key={i} style={[styles.noteRow, i < audit.prevNotes.length - 1 && styles.rowBorder]}>
                  <View style={[styles.noteAvatar, n.who === 'Sydney Rivera' ? { backgroundColor: '#dbeafe' } : { backgroundColor: '#fef3c7' }]}>
                    <Text style={[styles.noteAvatarText, n.who === 'Sydney Rivera' ? { color: '#1d4ed8' } : { color: '#b45309' }]}>
                      {n.who.split(' ').map((p) => p[0]).join('')}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.noteText}>{n.text}</Text>
                    <Text style={styles.noteMeta}>{n.who} · {n.at}</Text>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Rooms picker — only when more than one room and not viewing one */}
        {rooms.length > 1 && !activeRoom && (
          <>
            <SectionLabel>Rooms · {rooms.length}</SectionLabel>
            <View style={styles.roomsCard}>
              {rooms.map((room, i) => {
                const prog = roomProgress(room);
                const allDone = prog.done === prog.total && prog.total > 0;
                return (
                  <TouchableOpacity
                    key={room.id}
                    style={[styles.roomRow, i < rooms.length - 1 && styles.rowBorder]}
                    onPress={() => setActiveRoomId(room.id)}
                    activeOpacity={0.85}
                  >
                    <View style={[styles.roomPill, allDone ? styles.roomPillDone : null]}>
                      <Text style={[styles.roomPillText, allDone && { color: '#15803d' }]}>{room.number}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.roomName}>
                        {/^\d/.test(room.number) ? `Room ${room.number}` : room.number}
                      </Text>
                      <Text style={styles.roomSub}>
                        {prog.done}/{prog.total} done
                        {prog.failed > 0 && <Text style={{ color: '#b91c1c', fontWeight: '700' }}> · {prog.failed} failed</Text>}
                      </Text>
                    </View>
                    {allDone && <Ionicons name="checkmark-circle" size={20} color="#15803d" />}
                    <Ionicons name="chevron-forward" size={16} color={C.faint} />
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        )}

        {/* Active room areas (or single-room audit) */}
        {activeRoom && (
          <>
            {rooms.length > 1 && (
              <TouchableOpacity onPress={() => setActiveRoomId(null)} style={styles.roomBackBtn} activeOpacity={0.7}>
                <Ionicons name="chevron-back" size={16} color={C.sub} />
                <Text style={styles.roomBackText}>All rooms</Text>
              </TouchableOpacity>
            )}
            <SectionLabel>
              {(/^\d/.test(activeRoom.number) ? `Room ${activeRoom.number}` : activeRoom.number)} · {activeRoom.areas.length} area{activeRoom.areas.length > 1 ? 's' : ''}
            </SectionLabel>
            {activeRoom.areas.map((area) => (
              <AreaBlock
                key={area.id}
                area={area}
                onPass={pass}
                onFail={fail}
                onCondition={setCondition}
                onPhoto={addPhoto}
                onCreateTicket={createTicket}
                onEscalate={escalate}
                onUseInventory={askInventoryItem}
                onNoteText={(itemId, t) => updateItem(itemId, { note: t })}
              />
            ))}
          </>
        )}

        {/* Submit */}
        <TouchableOpacity style={styles.submitBtn} onPress={submitAudit} activeOpacity={0.88}>
          <Ionicons name="checkmark-circle" size={18} color="#fff" />
          <Text style={styles.submitBtnText}>Submit audit</Text>
        </TouchableOpacity>

        <View style={{ height: S.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

/* ─── Area block ─────────────────────────────────────── */

function AreaBlock({
  area,
  onPass, onFail, onCondition, onPhoto,
  onCreateTicket, onEscalate, onUseInventory, onNoteText,
}: {
  area: AuditArea;
  onPass: (item: AuditItem) => void;
  onFail: (item: AuditItem) => void;
  onCondition: (item: AuditItem, c: Condition) => void;
  onPhoto: (item: AuditItem) => void;
  onCreateTicket: (item: AuditItem) => void;
  onEscalate: (item: AuditItem) => void;
  onUseInventory: (item: AuditItem) => void;
  onNoteText: (itemId: string, t: string) => void;
}) {
  const allDone = useMemo(
    () => area.items.length > 0 && area.items.every((i) => i.condition !== undefined || i.present !== undefined),
    [area.items]
  );
  const [open, setOpen] = useState(!allDone);

  const failedCount = area.items.filter((i) =>
    i.condition === 'poor' || i.condition === 'damaged' || i.present === false || i.working === false
  ).length;
  const inspectedCount = area.items.filter((i) => i.condition !== undefined || i.present !== undefined).length;

  return (
    <View style={styles.areaCard}>
      <TouchableOpacity onPress={() => setOpen((v) => !v)} style={styles.areaHead} activeOpacity={0.85}>
        <View style={[styles.areaIcon, allDone ? styles.areaIconDone : null]}>
          <Ionicons name={area.icon} size={16} color={allDone ? '#15803d' : C.sub} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.areaName}>{area.name}</Text>
          <Text style={styles.areaSub}>
            {inspectedCount}/{area.items.length}{failedCount > 0 ? ` · ${failedCount} failed` : ''}
          </Text>
        </View>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={16} color={C.faint} />
      </TouchableOpacity>

      {open && (
        <View style={styles.itemsList}>
          {area.items.map((item, i) => (
            <ItemRow
              key={item.id}
              item={item}
              isLast={i === area.items.length - 1}
              onPass={() => onPass(item)}
              onFail={() => onFail(item)}
              onCondition={(c) => onCondition(item, c)}
              onPhoto={() => onPhoto(item)}
              onCreateTicket={() => onCreateTicket(item)}
              onEscalate={() => onEscalate(item)}
              onUseInventory={() => onUseInventory(item)}
              onNoteText={(t) => onNoteText(item.id, t)}
            />
          ))}
        </View>
      )}
    </View>
  );
}

/* ─── Item row — Pass / Fail primary + expand ───── */

function ItemRow({
  item, isLast,
  onPass, onFail, onCondition, onPhoto, onCreateTicket, onEscalate, onUseInventory, onNoteText,
}: {
  item: AuditItem;
  isLast: boolean;
  onPass: () => void;
  onFail: () => void;
  onCondition: (c: Condition) => void;
  onPhoto: () => void;
  onCreateTicket: () => void;
  onEscalate: () => void;
  onUseInventory: () => void;
  onNoteText: (t: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const failed = item.condition === 'poor' || item.condition === 'damaged' || item.present === false || item.working === false;
  const inspected = item.condition !== undefined || item.present !== undefined;
  const passed = inspected && !failed;
  const showExpanded = expanded || failed;

  return (
    <View style={[styles.itemRow, !isLast && styles.itemRowBorder]}>
      <View style={styles.itemTop}>
        <View style={styles.itemLabelWrap}>
          {passed && <Ionicons name="checkmark-circle" size={18} color="#15803d" />}
          {failed && <Ionicons name="alert-circle" size={18} color="#b91c1c" />}
          {!inspected && <View style={styles.itemDot} />}
          <Text style={[styles.itemLabel, passed && { color: C.sub }]} numberOfLines={2}>
            {item.label}
          </Text>
        </View>

        {!inspected && (
          <View style={styles.passFailBtns}>
            <TouchableOpacity style={[styles.pfBtn, styles.passBtn]} onPress={onPass} activeOpacity={0.85}>
              <Ionicons name="checkmark" size={16} color="#15803d" />
              <Text style={styles.pfBtnTextPass}>Pass</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.pfBtn, styles.failBtn]} onPress={onFail} activeOpacity={0.85}>
              <Ionicons name="close" size={16} color="#b91c1c" />
              <Text style={styles.pfBtnTextFail}>Fail</Text>
            </TouchableOpacity>
          </View>
        )}

        {inspected && (
          <TouchableOpacity onPress={() => setExpanded((v) => !v)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={16} color={C.faint} />
          </TouchableOpacity>
        )}
      </View>

      {showExpanded && inspected && (
        <View style={styles.expandedBlock}>
          <View style={styles.condRow}>
            <Text style={styles.condLabel}>Condition</Text>
            <View style={styles.condChips}>
              {(['good', 'fair', 'poor', 'damaged'] as const).map((c) => {
                const cfg = CONDITION_CFG[c];
                const active = item.condition === c;
                return (
                  <TouchableOpacity
                    key={c}
                    style={[styles.condChip, { backgroundColor: active ? cfg.bg : C.bg, borderColor: active ? cfg.color : C.border }]}
                    onPress={() => onCondition(c)}
                    activeOpacity={0.85}
                  >
                    <Text style={[styles.condChipText, { color: active ? cfg.color : C.sub }]}>{cfg.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <TextInput
            value={item.note ?? ''}
            onChangeText={onNoteText}
            placeholder={failed ? 'Note (required for failed)…' : 'Optional note…'}
            placeholderTextColor={C.hint}
            multiline
            style={styles.noteInput}
          />

          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.miniBtn} onPress={onPhoto} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
              <Ionicons name={item.photoLabel ? 'image' : 'camera-outline'} size={14} color={item.photoLabel ? '#15803d' : C.sub} />
              <Text style={[styles.miniBtnText, item.photoLabel && { color: '#15803d', fontWeight: '700' }]}>Photo</Text>
            </TouchableOpacity>
            {failed && (
              <TouchableOpacity style={styles.miniBtn} onPress={onUseInventory} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
                <Ionicons name="cube-outline" size={14} color={C.sub} />
                <Text style={styles.miniBtnText}>Replace from inv.</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.miniBtn} onPress={onCreateTicket} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
              <Ionicons name="add-circle-outline" size={14} color={C.sub} />
              <Text style={styles.miniBtnText}>Ticket</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.miniBtn} onPress={onEscalate} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
              <Ionicons name="arrow-up-circle-outline" size={14} color="#b91c1c" />
              <Text style={[styles.miniBtnText, { color: '#b91c1c' }]}>Escalate</Text>
            </TouchableOpacity>
          </View>

          {item.ticketCreatedId && (
            <View style={styles.banner}>
              <Ionicons name="git-branch-outline" size={12} color="#1d4ed8" />
              <Text style={styles.bannerText}>Ticket {item.ticketCreatedId} created</Text>
            </View>
          )}
          {item.inventoryUsed && (
            <View style={styles.banner}>
              <Ionicons name="cube-outline" size={12} color="#15803d" />
              <Text style={styles.bannerText}>
                {item.inventoryUsed.qty} × {item.inventoryUsed.item} from {item.inventoryUsed.source}
              </Text>
            </View>
          )}
          {item.oooRisk && (
            <View style={[styles.banner, { backgroundColor: '#fee2e2' }]}>
              <Ionicons name="alert-circle-outline" size={12} color="#b91c1c" />
              <Text style={[styles.bannerText, { color: '#b91c1c' }]}>OOO risk flagged</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  scroll: { flex: 1 },
  content: { padding: S.lg, gap: S.sm },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: S.md },
  empty: { fontSize: F.md, color: C.sub },

  /* Header */
  headerCard: { backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: R.xl, padding: S.lg, gap: S.sm },
  backRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backLeft: { flexDirection: 'row', alignItems: 'center', gap: 4, marginLeft: -4 },
  backText: { fontSize: F.sm, fontWeight: '600', color: C.sub },
  pauseBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: S.md, paddingVertical: 6,
    borderRadius: R.full,
    backgroundColor: C.bg,
    borderWidth: 1, borderColor: C.border,
  },
  pauseBtnText: { fontSize: F.xs, fontWeight: '700', color: C.text },

  resumedBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: S.md, paddingVertical: 6,
    borderRadius: R.md,
    backgroundColor: '#dcfce7',
  },
  resumedText: { fontSize: F.xs, color: '#15803d', fontWeight: '700' },

  idRow: { flexDirection: 'row', alignItems: 'center', gap: 4, flexWrap: 'wrap' },
  typeChip: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 6, paddingVertical: 2, borderRadius: R.full },
  typeChipText: { fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  age: { fontSize: F.xs, color: C.hint, marginLeft: 'auto' },

  title: { fontSize: F.lg, fontWeight: '700', color: C.text, lineHeight: 24 },
  scope: { fontSize: F.sm, color: C.sub },

  ownerCard: {
    marginTop: S.xs, padding: S.md, borderRadius: R.md,
    backgroundColor: C.bg, borderWidth: 1, borderColor: C.borderSoft, gap: 6,
  },
  ownerRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  ownerLabel: { fontSize: 10, color: C.hint, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.4 },
  ownerValue: { fontSize: F.sm, fontWeight: '700', color: C.text, marginRight: 'auto' },
  famBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: R.full },
  famHigh: { backgroundColor: '#dcfce7' },
  famMed:  { backgroundColor: '#fef9c3' },
  famLow:  { backgroundColor: '#fee2e2' },
  famText: { fontSize: 9, fontWeight: '800', letterSpacing: 0.4 },
  famTextHigh: { color: '#15803d' },
  famTextMed:  { color: '#a16207' },
  famTextLow:  { color: '#b91c1c' },
  reassignReason: { fontSize: F.xs, color: C.sub, fontStyle: 'italic' },
  reassignBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: R.full, backgroundColor: '#f0f0f0' },
  reassignBtnText: { fontSize: F.xs, fontWeight: '700', color: C.sub },

  progressCard: { backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: R.lg, padding: S.md, gap: 6 },
  progressText: { fontSize: F.sm, fontWeight: '700', color: C.text },
  progressBar: { height: 6, backgroundColor: C.borderSoft, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: C.ink, borderRadius: 3 },

  card: { backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: R.lg, overflow: 'hidden' },
  noteRow: { flexDirection: 'row', alignItems: 'flex-start', gap: S.md, padding: S.md },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: C.borderSoft },
  noteAvatar: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  noteAvatarText: { fontSize: F.xs, fontWeight: '800' },
  noteText: { fontSize: F.sm, color: C.text, lineHeight: 18 },
  noteMeta: { fontSize: F.xs, color: C.hint, marginTop: 2 },

  /* Rooms picker */
  roomsCard: { backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: R.lg, overflow: 'hidden' },
  roomRow: { flexDirection: 'row', alignItems: 'center', gap: S.md, padding: S.md },
  roomPill: {
    minWidth: 56, paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: R.md,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  roomPillDone: { backgroundColor: '#dcfce7' },
  roomPillText: { fontSize: F.sm, fontWeight: '800', color: C.text },
  roomName: { fontSize: F.sm, fontWeight: '700', color: C.text },
  roomSub: { fontSize: F.xs, color: C.sub, marginTop: 2 },

  roomBackBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, marginLeft: -4 },
  roomBackText: { fontSize: F.xs, fontWeight: '700', color: C.sub },

  /* Area card */
  areaCard: { backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: R.lg, overflow: 'hidden' },
  areaHead: { flexDirection: 'row', alignItems: 'center', gap: S.md, padding: S.md },
  areaIcon: { width: 32, height: 32, borderRadius: R.md, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' },
  areaIconDone: { backgroundColor: '#dcfce7' },
  areaName: { fontSize: F.sm, fontWeight: '800', color: C.text },
  areaSub: { fontSize: F.xs, color: C.sub, marginTop: 2 },

  itemsList: { borderTopWidth: 1, borderTopColor: C.borderSoft },

  itemRow: { padding: S.md },
  itemRowBorder: { borderBottomWidth: 1, borderBottomColor: C.borderSoft },
  itemTop: { flexDirection: 'row', alignItems: 'center', gap: S.sm },
  itemLabelWrap: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  itemDot: { width: 14, height: 14, borderRadius: 7, borderWidth: 2, borderColor: C.faint },
  itemLabel: { fontSize: F.sm, fontWeight: '600', color: C.text, flex: 1, lineHeight: 18 },

  passFailBtns: { flexDirection: 'row', gap: 6 },
  pfBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: S.md, paddingVertical: 6,
    borderRadius: R.full, borderWidth: 1,
  },
  passBtn: { backgroundColor: '#dcfce7', borderColor: '#86efac' },
  failBtn: { backgroundColor: '#fee2e2', borderColor: '#fca5a5' },
  pfBtnTextPass: { fontSize: F.xs, fontWeight: '800', color: '#15803d' },
  pfBtnTextFail: { fontSize: F.xs, fontWeight: '800', color: '#b91c1c' },

  expandedBlock: { gap: S.sm, marginTop: S.sm, paddingTop: S.sm, borderTopWidth: 1, borderTopColor: C.borderSoft },

  condRow: { gap: 6 },
  condLabel: { fontSize: F.xs, color: C.hint, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.4 },
  condChips: { flexDirection: 'row', gap: S.xs, flexWrap: 'wrap' },
  condChip: { paddingHorizontal: S.md, paddingVertical: 4, borderRadius: R.full, borderWidth: 1 },
  condChipText: { fontSize: F.xs, fontWeight: '700' },

  noteInput: {
    backgroundColor: C.bg,
    borderWidth: 1, borderColor: C.border,
    borderRadius: R.md,
    padding: S.sm,
    fontSize: F.sm,
    color: C.text,
    minHeight: 44,
    textAlignVertical: 'top',
  },

  actionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: S.xs },
  miniBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: R.full, backgroundColor: C.bg, borderWidth: 1, borderColor: C.border },
  miniBtnText: { fontSize: F.xs, fontWeight: '700', color: C.sub },

  banner: { flexDirection: 'row', alignItems: 'center', gap: 4, padding: S.sm, borderRadius: R.md, backgroundColor: '#f0f9ff' },
  bannerText: { fontSize: F.xs, fontWeight: '700', color: C.text },

  submitBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: C.ink,
    paddingVertical: S.md + 2,
    borderRadius: R.full,
    marginTop: S.sm,
  },
  submitBtnText: { color: '#fff', fontSize: F.md, fontWeight: '800', letterSpacing: -0.2 },

  backBtn: { paddingHorizontal: S.lg, paddingVertical: S.sm, backgroundColor: C.ink, borderRadius: R.full },
  backBtnText: { color: '#fff', fontWeight: '700', fontSize: F.sm },
});
