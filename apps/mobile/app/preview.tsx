/**
 * v2 DESIGN PREVIEW — standalone, does not touch the live amir/sydney apps.
 * Toggle between the redesigned Amir and Sydney home screens.
 * Reach it at /preview (or from the persona picker's "Preview new design" button).
 */
import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AmirHome } from '../src/ui/preview/AmirHome';
import { SydneyHome } from '../src/ui/preview/SydneyHome';
import { tone, type, space, radius } from '../src/ui/tokens';

export default function Preview() {
  const router = useRouter();
  const [who, setWho] = useState<'amir' | 'sydney'>('amir');
  const openTicket = (id: string) => Alert.alert('Ticket ' + id, 'Detail screen comes next in the redesign.');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: tone.bg }}>
      {/* Preview chrome */}
      <View style={st.bar}>
        <Pressable onPress={() => router.replace('/')} hitSlop={12} style={st.back}>
          <Ionicons name="close" size={22} color={tone.textSub} />
        </Pressable>
        <View style={st.toggle}>
          <Seg label="Amir" active={who === 'amir'} onPress={() => setWho('amir')} />
          <Seg label="Sydney" active={who === 'sydney'} onPress={() => setWho('sydney')} />
        </View>
        <View style={{ width: 22 }} />
      </View>

      {who === 'amir' ? <AmirHome onOpenTicket={openTicket} /> : <SydneyHome onOpenTicket={openTicket} />}
    </SafeAreaView>
  );
}

function Seg({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[st.seg, active && st.segActive]}>
      <Text style={[type.subhead, { fontWeight: '600', color: active ? tone.text : tone.textSub2 }]}>{label}</Text>
    </Pressable>
  );
}

const st = StyleSheet.create({
  bar:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: space.lg, paddingVertical: space.sm },
  back:      { width: 22 },
  toggle:    { flexDirection: 'row', backgroundColor: tone.line, borderRadius: radius.sm, padding: 2 },
  seg:       { paddingHorizontal: space.xl, paddingVertical: 7, borderRadius: radius.sm - 2 },
  segActive: { backgroundColor: tone.surface, shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 3, shadowOffset: { width: 0, height: 1 }, elevation: 2 },
});
