/**
 * Amir "The Shift" — reimagined component set for the night technician.
 * A doer's co-pilot: shift momentum, one job in focus, a guided fix flow.
 * Built on the web-palette tokens, but a distinct interaction language from the
 * supervisor's grouped lists.
 */
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { tone, type, space, radius, secondaryLabel, toneColors, type ToneName } from '../tokens';

/* ── Shift progress — the night's momentum ────────────────────────────── */
export function ShiftProgress({ done, total }: { done: number; total: number }) {
  const pct = total > 0 ? done / total : 0;
  const left = total - done;
  return (
    <View style={c.shift}>
      <View style={{ flex: 1 }}>
        <Text style={[type.footnote, { color: secondaryLabel }]}>EVENING SHIFT</Text>
        <Text style={[type.title2, { color: tone.text }]}>
          {left === 0 ? 'All done 🎉' : `${left} job${left === 1 ? '' : 's'} left`}
        </Text>
        <View style={c.track}><View style={[c.fill, { width: `${Math.max(6, pct * 100)}%` }]} /></View>
        <Text style={[type.caption, { color: tone.textHint, marginTop: 5 }]}>{done} of {total} done tonight</Text>
      </View>
    </View>
  );
}

/* ── Big action — the one huge button that advances a job ─────────────── */
export function BigAction({ label, icon, toneName = 'accent', onPress }: {
  label: string; icon?: string; toneName?: ToneName; onPress?: () => void;
}) {
  const bg = toneColors(toneName).fg;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [c.big, { backgroundColor: bg }, pressed && { opacity: 0.88, transform: [{ scale: 0.99 }] }]}>
      {icon ? <Ionicons name={icon as any} size={24} color="#fff" /> : null}
      <Text style={[type.headline, { color: '#fff', fontSize: 18 }]}>{label}</Text>
    </Pressable>
  );
}

/* ── Job card — the focus hero on Tonight ─────────────────────────────── */
export function JobFocusCard({
  room, floor, title, area, priority, guest, ai, revenue, actionLabel, actionIcon, actionTone, onAction, onOpen, onSkip,
}: {
  room: string; floor: number; title: string; area: string;
  priority: ToneName; guest?: string | null; ai?: string | null; revenue?: number;
  actionLabel: string; actionIcon: string; actionTone: ToneName;
  onAction?: () => void; onOpen?: () => void; onSkip?: () => void;
}) {
  return (
    <View style={c.focus}>
      <View style={[c.spine, { backgroundColor: toneColors(priority).fg }]} />
      <Pressable onPress={onOpen} style={{ gap: 8 }}>
        <View style={c.focusTop}>
          <Text style={[type.caption, { color: secondaryLabel }]}>NEXT UP · ROOM {room} · FL {floor}</Text>
          {revenue && revenue > 0 ? (
            <View style={[c.money, { backgroundColor: tone.moneySoft }]}>
              <Ionicons name="trending-down" size={12} color={tone.money} />
              <Text style={[type.caption, { color: tone.money, fontWeight: '700' }]}>${revenue}/night</Text>
            </View>
          ) : null}
        </View>
        <Text style={[type.title, { color: tone.text }]}>{title}</Text>
        <Text style={[type.subhead, { color: secondaryLabel }]} numberOfLines={1}>{area}</Text>
        {guest ? (
          <View style={c.flag}><Ionicons name="person" size={13} color={tone.urgent} /><Text style={[type.footnote, { color: tone.urgent, fontWeight: '600' }]}>{guest}</Text></View>
        ) : null}
        {ai ? (
          <View style={c.ai}><Ionicons name="sparkles" size={13} color={tone.accent} /><Text style={[type.footnote, { color: tone.text, flex: 1 }]} numberOfLines={1}>Likely {ai}</Text></View>
        ) : null}
      </Pressable>
      <BigAction label={actionLabel} icon={actionIcon} toneName={actionTone} onPress={onAction} />
      <View style={c.focusFoot}>
        <Pressable onPress={onOpen}><Text style={[type.footnote, { color: tone.accent }]}>Open job</Text></Pressable>
        {onSkip ? <Pressable onPress={onSkip}><Text style={[type.footnote, { color: tone.textHint }]}>Not now</Text></Pressable> : null}
      </View>
    </View>
  );
}

/* ── Mini job card — the rest of the night, stacked ───────────────────── */
export function MiniJob({ room, title, verb, priority, revenue, last, onPress }: {
  room: string; title: string; verb: string; priority: ToneName; revenue?: number; last?: boolean; onPress?: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [c.mini, pressed && { opacity: 0.6 }]}>
      <View style={[c.miniSpine, { backgroundColor: toneColors(priority).fg }]} />
      <View style={{ flex: 1, gap: 1 }}>
        <Text style={[type.body, { color: tone.text, fontWeight: '600' }]} numberOfLines={1}>Room {room} · {title}</Text>
        <Text style={[type.footnote, { color: secondaryLabel }]}>{verb}</Text>
      </View>
      {revenue && revenue > 0 ? <Text style={[type.footnote, { color: tone.money, fontWeight: '700' }]}>${revenue}</Text> : null}
      <Ionicons name="chevron-forward" size={18} color={tone.textHint} />
    </Pressable>
  );
}

/* ── Lifecycle stepper — where the job is in its flow ─────────────────── */
export function Stepper({ steps, currentIndex }: { steps: string[]; currentIndex: number }) {
  return (
    <View style={c.stepper}>
      {steps.map((s, i) => {
        const done = i < currentIndex, active = i === currentIndex;
        const col = done ? tone.go : active ? tone.accent : tone.separator;
        return (
          <React.Fragment key={s}>
            <View style={{ alignItems: 'center', gap: 4, width: 64 }}>
              <View style={[c.stepDot, { backgroundColor: done || active ? col : tone.surface, borderColor: col }]}>
                {done ? <Ionicons name="checkmark" size={13} color="#fff" /> : <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: active ? '#fff' : tone.separator }} />}
              </View>
              <Text style={[type.caption, { color: active ? tone.text : tone.textHint, textAlign: 'center', fontWeight: active ? '600' : '400' }]} numberOfLines={1}>{s}</Text>
            </View>
            {i < steps.length - 1 ? <View style={[c.stepLine, { backgroundColor: i < currentIndex ? tone.go : tone.separator }]} /> : null}
          </React.Fragment>
        );
      })}
    </View>
  );
}

/* ── Fix-step checklist — AI guidance you tick off ────────────────────── */
export function StepCheck({ label, checked, onToggle }: { label: string; checked: boolean; onToggle: () => void }) {
  return (
    <Pressable onPress={onToggle} style={({ pressed }) => [c.check, pressed && { opacity: 0.6 }]}>
      <Ionicons name={checked ? 'checkmark-circle' : 'ellipse-outline'} size={22} color={checked ? tone.go : tone.textHint} />
      <Text style={[type.body, { color: checked ? tone.textHint : tone.text, flex: 1, textDecorationLine: checked ? 'line-through' : 'none' }]}>{label}</Text>
    </Pressable>
  );
}

/* ── Quick dock — round actions on the job screen ─────────────────────── */
export function QuickDock({ actions }: { actions: Array<{ icon: string; label: string; toneName?: ToneName; onPress?: () => void }> }) {
  return (
    <View style={c.dock}>
      {actions.map((a) => {
        const col = toneColors(a.toneName ?? 'neutral');
        return (
          <Pressable key={a.label} onPress={a.onPress} style={({ pressed }) => [c.dockBtn, pressed && { opacity: 0.6 }]}>
            <View style={[c.dockIcon, { backgroundColor: col.bg }]}><Ionicons name={a.icon as any} size={22} color={col.fg} /></View>
            <Text style={[type.caption, { color: tone.textSub2 }]}>{a.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const c = StyleSheet.create({
  shift:    { flexDirection: 'row', alignItems: 'center', marginHorizontal: space.lg, backgroundColor: tone.surface, borderRadius: radius.xl, padding: space.xl },
  track:    { height: 8, borderRadius: 4, backgroundColor: tone.line, marginTop: space.md, overflow: 'hidden' },
  fill:     { height: 8, borderRadius: 4, backgroundColor: tone.go },

  big:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space.sm, height: 60, borderRadius: radius.lg },

  focus:    { marginHorizontal: space.lg, backgroundColor: tone.surface, borderRadius: radius.xl, padding: space.xl, paddingLeft: space.xl + 6, gap: space.md, overflow: 'hidden' },
  spine:    { position: 'absolute', left: 0, top: 0, bottom: 0, width: 6 },
  focusTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  money:    { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 9, paddingVertical: 4, borderRadius: radius.pill },
  flag:     { flexDirection: 'row', alignItems: 'center', gap: 5 },
  ai:       { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: tone.accentSoft, borderRadius: radius.md, paddingHorizontal: space.md, paddingVertical: space.sm },
  focusFoot:{ flexDirection: 'row', justifyContent: 'space-between', paddingTop: 2 },

  mini:     { flexDirection: 'row', alignItems: 'center', gap: space.md, backgroundColor: tone.surface, borderRadius: radius.lg, padding: space.lg, paddingLeft: space.lg + 6, marginHorizontal: space.lg, overflow: 'hidden' },
  miniSpine:{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 5 },

  stepper:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginHorizontal: space.lg },
  stepDot:  { width: 26, height: 26, borderRadius: 13, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  stepLine: { flex: 1, height: 2, marginTop: -18 },

  check:    { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: space.sm },

  dock:     { flexDirection: 'row', justifyContent: 'space-around', marginHorizontal: space.lg },
  dockBtn:  { alignItems: 'center', gap: 5 },
  dockIcon: { width: 54, height: 54, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center' },
});
