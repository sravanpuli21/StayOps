/**
 * Amir "Job Focus" — cognitive-free. The screen shows: what the job is, where it
 * is in its flow, and ONE big button to move it forward. Help (AI fix) and details
 * stay collapsed until tapped. Extra actions hide behind a single "More".
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTickets, type TicketStatus } from '../../store/ticketsContext';
import { NoteModal } from '../../components/NoteModal';
import { PhotoModal } from '../../components/PhotoModal';
import { askDidYouUseItem } from '../../lib/inventory-flow';
import { Screen, TopBar, Card } from '../kit';
import { Stepper, BigAction, StepCheck } from './components';
import { tone, type, space, radius, secondaryLabel, type ToneName } from '../tokens';

const STEP_LABELS = ['On my way', 'In room', 'Fixed'];
function stepIndex(s: TicketStatus): number {
  if (s === 'en_route') return 0;
  if (s === 'in_progress' || s === 'pending_part') return 1;
  if (s === 'resolved') return 2;
  return 0;
}
function nextAction(s: TicketStatus): { label: string; icon: string; tone: ToneName; next: TicketStatus } | null {
  switch (s) {
    case 'open':         return { label: "I'm on my way", icon: 'walk-outline', tone: 'accent', next: 'en_route' };
    case 'scheduled':    return { label: 'Start now', icon: 'play-outline', tone: 'accent', next: 'in_progress' };
    case 'en_route':     return { label: "I've arrived", icon: 'enter-outline', tone: 'warn', next: 'in_progress' };
    case 'in_progress':  return { label: 'Mark as fixed', icon: 'checkmark-circle-outline', tone: 'go', next: 'resolved' };
    case 'pending_part': return { label: 'Part arrived — resume', icon: 'cube-outline', tone: 'accent', next: 'in_progress' };
    default:             return null;
  }
}

export function JobFocus({ id }: { id: string }) {
  const router = useRouter();
  const { getTicket, updateStatus, addNote, addPhoto } = useTickets();
  const ticket = getTicket(id);
  const [helpOpen, setHelpOpen] = useState(false);
  const [checked, setChecked] = useState<Set<number>>(new Set());
  const [noteOpen, setNoteOpen] = useState(false);
  const [photoOpen, setPhotoOpen] = useState(false);

  if (!ticket) {
    return (
      <View style={{ flex: 1, backgroundColor: tone.bg }}>
        <TopBar onBack={() => router.back()} />
        <Screen title="Not found"><Text style={{ paddingHorizontal: space.lg, color: secondaryLabel }}>Job {id} not found.</Text></Screen>
      </View>
    );
  }

  const act = nextAction(ticket.status);
  const toggleStep = (i: number) => setChecked((p) => { const n = new Set(p); n.has(i) ? n.delete(i) : n.add(i); return n; });

  const advance = () => {
    if (!act) return;
    if (act.next === 'resolved') {
      askDidYouUseItem(
        `Room ${ticket.room} · ${ticket.title}`,
        (r) => {
          const src = r.sourceRoom ? `Room ${r.sourceRoom}` : r.source;
          addNote(ticket.id, `Used: ${r.itemLabel}${r.variant ? ` · ${r.variant}` : ''} from ${src}${r.followUpUrgent ? ' · follow-up urgent (arrival today)' : ''}`);
          updateStatus(ticket.id, 'resolved'); router.back();
        },
        () => { updateStatus(ticket.id, 'resolved'); router.back(); },
      );
      return;
    }
    updateStatus(ticket.id, act.next);
  };

  const more = () => Alert.alert('More', undefined, [
    { text: 'Add photo', onPress: () => setPhotoOpen(true) },
    { text: 'Add note', onPress: () => setNoteOpen(true) },
    { text: 'Need a part', onPress: () => { updateStatus(ticket.id, 'pending_part'); Alert.alert('Part requested', 'Inventory & supervisor notified.'); } },
    { text: 'Flag for next shift', onPress: () => addNote(ticket.id, 'Flagged for follow-up — handing to next shift.') },
    { text: 'Escalate to Sydney', style: 'destructive', onPress: () => updateStatus(ticket.id, 'escalated') },
    { text: 'Cancel', style: 'cancel' },
  ]);

  return (
    <View style={{ flex: 1, backgroundColor: tone.bg }}>
      <TopBar onBack={() => router.back()} propertyLabel={`Room ${ticket.room}`} />
      <Screen title={ticket.title} subtitle={`Room ${ticket.room} · ${ticket.area}`}>

        {/* where am I — quiet progress, no reading required */}
        <Card><Stepper steps={STEP_LABELS} currentIndex={stepIndex(ticket.status)} /></Card>

        {/* the one action */}
        {act ? (
          <BigAction label={act.label} icon={act.icon} toneName={act.tone} onPress={advance} />
        ) : (
          <View style={st.endState}>
            <Ionicons name={ticket.status === 'resolved' ? 'checkmark-circle' : 'alert-circle'} size={44} color={ticket.status === 'resolved' ? tone.go : tone.urgent} />
            <Text style={[type.headline, { color: tone.text }]}>{ticket.status === 'resolved' ? 'Fixed' : 'Escalated'}</Text>
          </View>
        )}

        {/* two quiet links — help + more. nothing else competes. */}
        <View style={st.links}>
          {ticket.ai ? (
            <Pressable onPress={() => setHelpOpen((v) => !v)} style={st.link}>
              <Ionicons name="sparkles" size={16} color={tone.accent} />
              <Text style={[type.body, { color: tone.accent }]}>{helpOpen ? 'Hide help' : 'How do I fix this?'}</Text>
            </Pressable>
          ) : <View />}
          <Pressable onPress={more} style={st.link}>
            <Text style={[type.body, { color: tone.accent }]}>More</Text>
            <Ionicons name="ellipsis-horizontal" size={16} color={tone.accent} />
          </Pressable>
        </View>

        {/* help: revealed only on demand */}
        {helpOpen && ticket.ai && (
          <Card>
            <Text style={[type.footnote, { color: secondaryLabel, marginBottom: space.sm }]}>Likely: {ticket.ai.likelyCause}</Text>
            {ticket.ai.fixSteps.map((stp, i) => (
              <StepCheck key={i} label={stp} checked={checked.has(i)} onToggle={() => toggleStep(i)} />
            ))}
          </Card>
        )}
      </Screen>

      <NoteModal visible={noteOpen} onClose={() => setNoteOpen(false)} onSave={(text) => addNote(ticket.id, text)} />
      <PhotoModal visible={photoOpen} onClose={() => setPhotoOpen(false)} onPick={(label) => addPhoto(ticket.id, label)} />
    </View>
  );
}

const st = StyleSheet.create({
  endState: { alignItems: 'center', gap: 6, marginHorizontal: space.lg },
  links:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: space.lg },
  link:     { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: space.sm },
});
