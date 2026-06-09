/**
 * Shared ticket detail — iOS-native, web palette. Used by both Amir (execute)
 * and Sydney (supervise) via `mode`. Preserves every action from the originals.
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTickets, type TicketStatus } from '../../store/ticketsContext';
import { NoteModal } from '../../components/NoteModal';
import { PhotoModal } from '../../components/PhotoModal';
import { askDidYouUseItem } from '../../lib/inventory-flow';
import { Screen, TopBar, Card, GroupHeader, Button, QuickAction, Timeline, ListGroup, ListRow, Pill } from '../kit';
import { tone, type, space, radius, secondaryLabel, toneColors, type ToneName } from '../tokens';

const STATUS_LABEL: Record<TicketStatus, string> = {
  open: 'Open', en_route: 'En route', in_progress: 'In progress',
  pending_part: 'Waiting on part', scheduled: 'Scheduled', resolved: 'Resolved', escalated: 'Escalated',
};
const STATUS_TONE: Record<TicketStatus, ToneName> = {
  open: 'urgent', en_route: 'watch', in_progress: 'warn',
  pending_part: 'watch', scheduled: 'watch', resolved: 'go', escalated: 'urgent',
};
const NEXT: Record<TicketStatus, { label: string; next: TicketStatus } | null> = {
  open:         { label: "I'm on my way", next: 'en_route' },
  en_route:     { label: "I'm in the room", next: 'in_progress' },
  in_progress:  { label: 'Mark as fixed', next: 'resolved' },
  pending_part: { label: 'Part arrived — resume', next: 'in_progress' },
  scheduled:    { label: 'Start now', next: 'in_progress' },
  resolved:     null,
  escalated:    null,
};
const tlTone = (kind?: string, actor?: string): ToneName =>
  actor === 'Sydney Rivera' ? 'accent' : kind === 'note' ? 'accent' : kind === 'photo' ? 'watch' : kind === 'status' ? 'warn' : 'neutral';

export function TicketDetail({ id, mode }: { id: string; mode: 'amir' | 'sydney' }) {
  const router = useRouter();
  const { getTicket, updateStatus, addNote, addPhoto, setAiFeedback, setPriority, reassign, toggleWatch } = useTickets();
  const ticket = getTicket(id);
  const [aiOpen, setAiOpen] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);
  const [photoOpen, setPhotoOpen] = useState(false);

  if (!ticket) {
    return (
      <View style={{ flex: 1, backgroundColor: tone.bg }}>
        <TopBar onBack={() => router.back()} />
        <Screen title="Not found"><Text style={{ paddingHorizontal: space.lg, color: secondaryLabel }}>Ticket {id} not found.</Text></Screen>
      </View>
    );
  }

  const ACTOR = mode === 'sydney' ? 'Sydney Rivera' : 'Amir Lopez';
  const step = NEXT[ticket.status];
  const isWatching = (ticket.watchers ?? []).includes('Sydney Rivera');

  const primary = () => {
    if (!step) return;
    if (step.next === 'resolved' && mode === 'amir') {
      askDidYouUseItem(
        `Room ${ticket.room} · ${ticket.title}`,
        (r) => {
          const src = r.sourceRoom ? `Room ${r.sourceRoom}` : r.source;
          addNote(ticket.id, `Used: ${r.itemLabel}${r.variant ? ` · ${r.variant}` : ''} from ${src}${r.followUpUrgent ? ' · follow-up urgent (arrival today)' : ''}`);
          updateStatus(ticket.id, 'resolved');
        },
        () => updateStatus(ticket.id, 'resolved'),
      );
      return;
    }
    updateStatus(ticket.id, step.next, ACTOR);
  };

  // Amir actions
  const needPart = () => { updateStatus(ticket.id, 'pending_part'); Alert.alert('Part requested', 'Logged as waiting for part. Inventory & supervisor notified.'); };
  const escalate = () => Alert.alert('Escalate to Sydney?', 'Supervisor will be paged; ticket stays open.', [{ text: 'Cancel', style: 'cancel' }, { text: 'Escalate', style: 'destructive', onPress: () => updateStatus(ticket.id, 'escalated') }]);
  const followUp = () => Alert.alert('Need follow-up', 'Log for next shift — ticket stays open.', [{ text: 'Cancel', style: 'cancel' }, { text: 'Log follow-up', onPress: () => addNote(ticket.id, 'Flagged for follow-up — handing to next shift.') }]);

  // Sydney actions
  const reassignTo = () => {
    const opts = ['Amir Lopez', 'Marcus Chen', 'Sydney Rivera'].filter((n) => n !== ticket.assignee);
    Alert.alert(`Reassign from ${ticket.assignee}`, 'Pick a tech:', [{ text: 'Cancel', style: 'cancel' }, ...opts.map((n) => ({ text: n, onPress: () => reassign(ticket.id, n, ACTOR) }))]);
  };
  const changePriority = () => Alert.alert('Change priority', `Currently: ${ticket.priority}`, [{ text: 'Cancel', style: 'cancel' }, { text: 'Urgent', onPress: () => setPriority(ticket.id, 'urgent', ACTOR) }, { text: 'High', onPress: () => setPriority(ticket.id, 'high', ACTOR) }, { text: 'Normal', onPress: () => setPriority(ticket.id, 'normal', ACTOR) }]);
  const escalateUp = () => Alert.alert('Escalate to ownership?', 'Pages Rishab + Kris.', [{ text: 'Cancel', style: 'cancel' }, { text: 'Escalate up', style: 'destructive', onPress: () => { addNote(ticket.id, 'Escalated up to Rishab + Kris.', ACTOR); updateStatus(ticket.id, 'escalated', ACTOR); } }]);
  const overrideResolve = () => Alert.alert('Force resolve?', 'Override and close this ticket.', [{ text: 'Cancel', style: 'cancel' }, { text: 'Force resolve', style: 'destructive', onPress: () => { addNote(ticket.id, 'Force-resolved by supervisor (override).', ACTOR); updateStatus(ticket.id, 'resolved', ACTOR); } }]);

  return (
    <View style={{ flex: 1, backgroundColor: tone.bg }}>
      <TopBar onBack={() => router.back()} propertyLabel={`${ticket.id} · ${mode === 'sydney' ? 'Supervisor' : 'Tech'}`} />
      <Screen title={ticket.title} subtitle={`Room ${ticket.room} · Floor ${ticket.floor} · ${ticket.area}`}>

        {/* Status + priority chips */}
        <View style={ds.chips}>
          <Pill label={STATUS_LABEL[ticket.status]} toneName={STATUS_TONE[ticket.status]} />
          <Pill label={ticket.priority} toneName={ticket.priority === 'urgent' ? 'urgent' : ticket.priority === 'high' ? 'warn' : 'neutral'} />
          {ticket.repeatInRoom ? <Pill label="Repeat" toneName="watch" icon="refresh-outline" /> : null}
          {ticket.revenueLost > 0 && ticket.status !== 'resolved' ? <Pill label={`$${ticket.revenueLost}/night`} toneName="money" icon="trending-down-outline" /> : null}
        </View>

        {/* Primary action */}
        {step ? (
          <Button label={step.label} onPress={primary} toneName={step.next === 'resolved' ? 'go' : 'accent'} />
        ) : (
          <View style={{ marginHorizontal: space.lg }}>
            <Pill label={STATUS_LABEL[ticket.status]} toneName={STATUS_TONE[ticket.status]} icon={ticket.status === 'resolved' ? 'checkmark-circle' : 'alert-circle'} />
          </View>
        )}

        {/* Assignee (Sydney sees reassign) */}
        {mode === 'sydney' && (
          <Card>
            <View style={ds.assignRow}>
              <View style={{ flex: 1 }}>
                <Text style={[type.caption, { color: secondaryLabel }]}>ASSIGNED TO</Text>
                <Text style={[type.headline, { color: tone.text }]}>{ticket.assignee}</Text>
              </View>
              <Pressable onPress={reassignTo}><Text style={[type.body, { color: tone.accent }]}>Reassign</Text></Pressable>
            </View>
          </Card>
        )}

        {/* Quick actions */}
        <Card>
          <View style={ds.qaRow}>
            {mode === 'amir' ? (
              <>
                <QuickAction icon="camera-outline" label="Photo" toneName="accent" onPress={() => setPhotoOpen(true)} />
                <QuickAction icon="create-outline" label="Note" toneName="accent" onPress={() => setNoteOpen(true)} />
                <QuickAction icon="time-outline" label="Follow-up" toneName="watch" onPress={followUp} />
                <QuickAction icon="cube-outline" label="Need part" toneName="watch" onPress={needPart} />
                <QuickAction icon="warning-outline" label="Escalate" toneName="urgent" onPress={escalate} />
              </>
            ) : (
              <>
                <QuickAction icon="camera-outline" label="Photo" toneName="accent" onPress={() => setPhotoOpen(true)} />
                <QuickAction icon="create-outline" label="Note" toneName="accent" onPress={() => setNoteOpen(true)} />
                <QuickAction icon="flag-outline" label="Priority" toneName="warn" onPress={changePriority} />
                <QuickAction icon={isWatching ? 'eye' : 'eye-outline'} label={isWatching ? 'Watching' : 'Watch'} toneName="accent" onPress={() => toggleWatch(ticket.id, 'Sydney Rivera')} />
                <QuickAction icon="arrow-up-circle-outline" label="Escalate" toneName="urgent" onPress={escalateUp} />
                {ticket.status !== 'resolved' ? <QuickAction icon="checkmark-done-outline" label="Force close" toneName="go" onPress={overrideResolve} /> : null}
              </>
            )}
          </View>
        </Card>

        {/* AI insight */}
        {ticket.ai && (
          <Card>
            <Pressable onPress={() => setAiOpen((v) => !v)} style={ds.aiHead}>
              <Ionicons name="sparkles" size={16} color={tone.accent} />
              <View style={{ flex: 1 }}>
                <Text style={[type.caption, { color: tone.accent, fontWeight: '700' }]}>AI ASSISTANT · {ticket.ai.confidence}% CONFIDENT</Text>
                <Text style={[type.body, { color: tone.text }]}>Likely: {ticket.ai.likelyCause}</Text>
              </View>
              <Ionicons name={aiOpen ? 'chevron-up' : 'chevron-down'} size={18} color={tone.textHint} />
            </Pressable>
            {aiOpen && (
              <View style={{ gap: space.md, marginTop: space.md, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: tone.separator, paddingTop: space.md }}>
                <Text style={[type.footnote, { color: secondaryLabel }]}>{ticket.ai.pattern}</Text>
                {ticket.ai.fixSteps.map((stp, i) => (
                  <View key={i} style={ds.stepRow}>
                    <View style={ds.stepNum}><Text style={[type.caption, { color: tone.accent, fontWeight: '700' }]}>{i + 1}</Text></View>
                    <Text style={[type.footnote, { color: tone.text, flex: 1 }]}>{stp}</Text>
                  </View>
                ))}
                <View style={ds.fbRow}>
                  <Text style={[type.caption, { color: secondaryLabel }]}>{ticket.aiFeedback === 'up' ? 'Thanks — logged' : ticket.aiFeedback === 'down' ? 'Got it — we’ll improve' : 'Was this helpful?'}</Text>
                  <View style={{ flexDirection: 'row', gap: space.sm }}>
                    <Pressable onPress={() => setAiFeedback(ticket.id, 'up')}><Ionicons name={ticket.aiFeedback === 'up' ? 'thumbs-up' : 'thumbs-up-outline'} size={18} color={tone.go} /></Pressable>
                    <Pressable onPress={() => setAiFeedback(ticket.id, 'down')}><Ionicons name={ticket.aiFeedback === 'down' ? 'thumbs-down' : 'thumbs-down-outline'} size={18} color={tone.urgent} /></Pressable>
                  </View>
                </View>
              </View>
            )}
          </Card>
        )}

        {/* Description */}
        <Card>
          <Text style={[type.caption, { color: secondaryLabel, marginBottom: 4 }]}>DESCRIPTION</Text>
          <Text style={[type.body, { color: tone.text }]}>{ticket.description}</Text>
        </Card>

        {/* Details */}
        <ListGroup header="Details">
          <ListRow title="Reported by" value={ticket.reportedBy} accessory="none" />
          <ListRow title="Created" value={ticket.createdAt} accessory="none" />
          <ListRow title="Type" value={ticket.type} accessory="none" />
          <ListRow title="Est. cost" value={`$${ticket.estimatedCost}`} accessory="none" />
        </ListGroup>

        {/* Activity */}
        <View style={{ gap: space.md }}>
          <GroupHeader>Activity</GroupHeader>
          <Card><Timeline items={ticket.activity.map((a) => ({ actor: a.actor, time: a.time, action: a.action, toneName: tlTone(a.kind, a.actor), attachment: a.photoLabel }))} /></Card>
        </View>
      </Screen>

      <NoteModal visible={noteOpen} onClose={() => setNoteOpen(false)} onSave={(text) => addNote(ticket.id, text, ACTOR)} />
      <PhotoModal visible={photoOpen} onClose={() => setPhotoOpen(false)} onPick={(label) => addPhoto(ticket.id, label, ACTOR)} />
    </View>
  );
}

const ds = StyleSheet.create({
  chips:     { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, paddingHorizontal: space.lg },
  assignRow: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  qaRow:     { flexDirection: 'row', gap: space.sm },
  aiHead:    { flexDirection: 'row', alignItems: 'center', gap: space.md },
  stepRow:   { flexDirection: 'row', gap: space.sm, alignItems: 'flex-start' },
  stepNum:   { width: 20, height: 20, borderRadius: 10, backgroundColor: tone.accentSoft, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  fbRow:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: space.sm },
});
