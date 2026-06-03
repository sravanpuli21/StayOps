/**
 * Amir "Tonight" — cognitive-free. ONE job, ONE action. The whole screen answers
 * "what do I do right now?" Everything else is a single quiet line at the bottom.
 */
import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTickets, type Ticket } from '../../store/ticketsContext';
import { Screen, TopBar } from '../kit';
import { BigAction } from './components';
import { tone, type, space, radius, secondaryLabel, type ToneName } from '../tokens';

const RANK = { urgent: 0, high: 1, normal: 2 } as const;

function action(t: Ticket): { label: string; icon: string; tone: ToneName; next: any } {
  switch (t.status) {
    case 'open':         return { label: "I'm on my way", icon: 'walk-outline', tone: 'accent', next: 'en_route' };
    case 'en_route':     return { label: "I'm in the room", icon: 'enter-outline', tone: 'warn', next: 'in_progress' };
    case 'in_progress':  return { label: 'Mark as fixed', icon: 'checkmark-circle-outline', tone: 'go', next: 'resolved' };
    case 'pending_part': return { label: 'Part arrived — resume', icon: 'cube-outline', tone: 'accent', next: 'in_progress' };
    case 'scheduled':    return { label: 'Start now', icon: 'play-outline', tone: 'accent', next: 'in_progress' };
    default:             return { label: 'Open', icon: 'arrow-forward', tone: 'accent', next: t.status };
  }
}

export function Tonight() {
  const router = useRouter();
  const { allTickets, updateStatus } = useTickets();
  const [skipped, setSkipped] = useState<string[]>([]);

  const open = allTickets.filter((t) => t.status !== 'resolved');
  const ordered = [...open].sort((a, b) => RANK[a.priority] - RANK[b.priority]);
  const focus = ordered.find((t) => !skipped.includes(t.id)) ?? ordered[0];
  const left = open.length;

  const openJob = (id: string) => router.push(`/amir/ticket/${id}` as never);
  const act = (t: Ticket) => {
    const a = action(t);
    if (a.next === 'resolved') { openJob(t.id); return; }
    updateStatus(t.id, a.next);
  };

  return (
    <View style={{ flex: 1, backgroundColor: tone.bg }}>
      <TopBar onBack={() => router.replace('/')} propertyLabel="Home2 Baton Rouge" />
      <Screen title="Tonight">
        {focus ? (
          <>
            {/* one quiet count */}
            <Text style={[type.subhead, { color: secondaryLabel, paddingHorizontal: space.lg, marginTop: -space.md }]}>
              {left} job{left === 1 ? '' : 's'} left
            </Text>

            {/* the one job */}
            <Pressable onPress={() => openJob(focus.id)} style={st.card}>
              <Text style={[type.footnote, { color: secondaryLabel }]}>ROOM {focus.room}</Text>
              <Text style={[type.title, { color: tone.text }]}>{focus.title}</Text>
              <Text style={[type.subhead, { color: secondaryLabel }]} numberOfLines={1}>{focus.area}</Text>
            </Pressable>

            {/* the one action */}
            <BigAction label={action(focus).label} icon={action(focus).icon} toneName={action(focus).tone} onPress={() => act(focus)} />

            {/* everything else: one quiet line */}
            {left > 1 ? (
              <Pressable onPress={() => setSkipped((s) => [...s, focus.id])} style={st.next}>
                <Text style={[type.footnote, { color: tone.textHint }]}>Skip to next</Text>
                <Ionicons name="arrow-forward" size={14} color={tone.textHint} />
              </Pressable>
            ) : null}
          </>
        ) : (
          <View style={st.done}>
            <Ionicons name="checkmark-circle" size={56} color={tone.go} />
            <Text style={[type.title2, { color: tone.text }]}>All done</Text>
            <Text style={[type.subhead, { color: secondaryLabel }]}>Nothing left tonight. Nice work.</Text>
          </View>
        )}
      </Screen>
    </View>
  );
}

const st = StyleSheet.create({
  card: { backgroundColor: tone.surface, borderRadius: radius.xl, marginHorizontal: space.lg, padding: space.xl, gap: 6, marginTop: space.sm },
  next: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingVertical: space.sm },
  done: { alignItems: 'center', gap: space.sm, paddingTop: space.xxxl, paddingHorizontal: space.lg },
});
