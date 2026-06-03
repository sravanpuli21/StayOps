/**
 * StayOps Mobile v2 — iOS-native primitives kit ("Field").
 * Built around the grouped inset list (Settings / Reminders / Health), large
 * titles, hairline separators, and restrained color. Minimal cognitive load.
 */
import React from 'react';
import {
  View, Text, Pressable, StyleSheet, ScrollView,
  type ViewStyle, type TextStyle, type StyleProp,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { tone, type, space, radius, toneColors, secondaryLabel, type ToneName } from './tokens';

/* ── Screen with iOS large-title header ───────────────────────────────── */
export function Screen({
  title, subtitle, children, right,
}: { title?: string; subtitle?: string; children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <ScrollView style={s.screen} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
      {title ? (
        <View style={s.titleRow}>
          <View style={{ flex: 1 }}>
            <Text style={[type.largeTitle, { color: tone.text }]}>{title}</Text>
            {subtitle ? <Text style={[type.subhead, { color: secondaryLabel, marginTop: 2 }]}>{subtitle}</Text> : null}
          </View>
          {right}
        </View>
      ) : null}
      {children}
    </ScrollView>
  );
}

/* ── Top bar — shared chrome that replaces the native header ──────────── */
export function TopBar({ onBack, propertyLabel }: { onBack?: () => void; propertyLabel?: string }) {
  return (
    <View style={s.topbar}>
      {onBack ? (
        <Pressable onPress={onBack} hitSlop={12} style={s.topbarBack}>
          <Ionicons name="chevron-back" size={22} color={tone.accent} />
          <Text style={[type.body, { color: tone.accent }]}>Switch</Text>
        </Pressable>
      ) : <View style={{ width: 60 }} />}
      {propertyLabel ? <Text style={[type.footnote, { color: tone.textSub2 }]} numberOfLines={1}>{propertyLabel}</Text> : null}
      <View style={{ width: 60, alignItems: 'flex-end' }} />
    </View>
  );
}

/* ── Hero focus card (big single-task block) ──────────────────────────── */
export function Hero({ children }: { children: React.ReactNode }) {
  return <View style={s.hero}>{children}</View>;
}

/* ── Segmented filter (iOS segmented control) ─────────────────────────── */
export function SegFilter<T extends string>({ options, value, onChange }: {
  options: Array<{ key: T; label: string }>; value: T; onChange: (k: T) => void;
}) {
  return (
    <View style={s.seg}>
      {options.map((o) => {
        const on = o.key === value;
        return (
          <Pressable key={o.key} onPress={() => onChange(o.key)} style={[s.segItem, on && s.segOn]}>
            <Text style={[type.footnote, { color: on ? tone.text : secondaryLabel, fontWeight: on ? '600' : '400' }]}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/* ── Text helper ──────────────────────────────────────────────────────── */
type TxtVariant = keyof typeof type;
export function Txt({
  children, variant = 'body', color = tone.text, style, numberOfLines,
}: {
  children: React.ReactNode; variant?: TxtVariant; color?: string;
  style?: StyleProp<TextStyle>; numberOfLines?: number;
}) {
  return <Text numberOfLines={numberOfLines} style={[type[variant], { color }, style]}>{children}</Text>;
}

/* ── Group header (small caps label above a list, iOS style) ──────────── */
export function GroupHeader({ children }: { children: React.ReactNode }) {
  return <Text style={s.groupHeader}>{String(children).toUpperCase()}</Text>;
}

/* ── Grouped inset list container ─────────────────────────────────────── */
export function ListGroup({ header, children }: { header?: string; children: React.ReactNode }) {
  const rows = React.Children.toArray(children).filter(Boolean);
  return (
    <View style={{ gap: 7 }}>
      {header ? <GroupHeader>{header}</GroupHeader> : null}
      <View style={s.group}>
        {rows.map((child, i) => (
          <View key={i}>
            {child}
            {i < rows.length - 1 ? <View style={s.sep} /> : null}
          </View>
        ))}
      </View>
    </View>
  );
}

/* ── List row — the workhorse cell ────────────────────────────────────── */
export function ListRow({
  title, subtitle, leading, accessory, value, valueTone, onPress,
}: {
  title: string;
  subtitle?: string;
  leading?: React.ReactNode;
  accessory?: 'chevron' | 'none';
  value?: string;          // trailing text (e.g. "$142")
  valueTone?: ToneName;    // color for the trailing value
  onPress?: () => void;
}) {
  const showChevron = (accessory ?? (onPress ? 'chevron' : 'none')) === 'chevron';
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [s.row, pressed && onPress && s.rowPressed]}>
      {leading ? <View style={s.leading}>{leading}</View> : null}
      <View style={{ flex: 1, gap: 1 }}>
        <Text style={[type.body, { color: tone.text }]} numberOfLines={1}>{title}</Text>
        {subtitle ? <Text style={[type.footnote, { color: secondaryLabel }]} numberOfLines={1}>{subtitle}</Text> : null}
      </View>
      {value ? <Text style={[type.body, { color: valueTone ? toneColors(valueTone).fg : secondaryLabel }]}>{value}</Text> : null}
      {showChevron ? <Ionicons name="chevron-forward" size={18} color="#c7c7cc" style={{ marginLeft: 2 }} /> : null}
    </Pressable>
  );
}

/* ── Leading status dot (the ONE bit of color in most rows) ───────────── */
export function StatusDot({ toneName = 'neutral' }: { toneName?: ToneName }) {
  return <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: toneColors(toneName).fg }} />;
}

/* ── Pill (small tinted status/tone chip) ─────────────────────────────── */
export function Pill({ label, toneName = 'neutral', icon }: { label: string; toneName?: ToneName; icon?: string }) {
  const c = toneColors(toneName);
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 9, paddingVertical: 4, borderRadius: radius.pill, backgroundColor: c.bg, alignSelf: 'flex-start' }}>
      {icon ? <Ionicons name={icon as any} size={12} color={c.fg} /> : null}
      <Text style={[type.caption, { color: c.fg, fontWeight: '700', textTransform: 'uppercase' }]}>{label}</Text>
    </View>
  );
}

/* ── Small leading glyph in an iOS rounded-square (used sparingly) ────── */
export function Glyph({ icon, toneName = 'accent' }: { icon: string; toneName?: ToneName }) {
  const c = toneColors(toneName);
  return (
    <View style={[s.glyph, { backgroundColor: c.fg }]}>
      <Ionicons name={icon as any} size={17} color="#fff" />
    </View>
  );
}

/* ── Filled action button (iOS prominent) ─────────────────────────────── */
export function Button({
  label, onPress, toneName = 'accent', icon, kind = 'filled',
}: {
  label: string; onPress?: () => void; toneName?: ToneName; icon?: string;
  kind?: 'filled' | 'tinted' | 'plain';
}) {
  const c = toneColors(toneName);
  const bg = kind === 'filled' ? c.fg : kind === 'tinted' ? c.bg : 'transparent';
  const fg = kind === 'filled' ? '#fff' : c.fg;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [s.btn, { backgroundColor: bg }, pressed && { opacity: 0.8 }]}>
      {icon ? <Ionicons name={icon as any} size={19} color={fg} /> : null}
      <Text style={[type.headline, { color: fg }]}>{label}</Text>
    </Pressable>
  );
}

/* ── Card (free-form rounded container, matches list group radius) ────── */
export function Card({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[s.card, style]}>{children}</View>;
}

/* ── Quick-action grid button (icon over label, tinted) ───────────────── */
export function QuickAction({ icon, label, toneName = 'neutral', onPress }: {
  icon: string; label: string; toneName?: ToneName; onPress?: () => void;
}) {
  const c = toneColors(toneName);
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [s.qa, pressed && { opacity: 0.6 }]}>
      <View style={[s.qaIcon, { backgroundColor: c.bg }]}><Ionicons name={icon as any} size={20} color={c.fg} /></View>
      <Text style={[type.caption, { color: tone.text, textAlign: 'center' }]} numberOfLines={1}>{label}</Text>
    </Pressable>
  );
}

/* ── Timeline (activity feed) ─────────────────────────────────────────── */
export function Timeline({ items }: { items: Array<{ actor: string; time: string; action: string; toneName?: ToneName; attachment?: string }> }) {
  return (
    <View>
      {items.map((it, i) => (
        <View key={i} style={s.tlRow}>
          <View style={s.tlGutter}>
            <View style={[s.tlDot, { backgroundColor: toneColors(it.toneName ?? 'accent').fg }]} />
            {i < items.length - 1 ? <View style={s.tlLine} /> : null}
          </View>
          <View style={{ flex: 1, paddingBottom: space.lg }}>
            <View style={s.tlHead}>
              <Text style={[type.footnote, { color: tone.text, fontWeight: '600' }]}>{it.actor}</Text>
              <Text style={[type.caption, { color: tone.textHint }]}>{it.time}</Text>
            </View>
            <Text style={[type.footnote, { color: secondaryLabel }]}>{it.action}</Text>
            {it.attachment ? (
              <View style={s.tlAttach}><Ionicons name="image-outline" size={13} color={tone.watch} /><Text style={[type.caption, { color: tone.watch }]}>{it.attachment}</Text></View>
            ) : null}
          </View>
        </View>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  screen:     { flex: 1, backgroundColor: tone.bg },
  content:    { paddingBottom: space.xxxl, gap: space.xl },
  titleRow:   { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: space.lg, paddingTop: space.sm, gap: space.md },

  topbar:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: space.md, height: 44, backgroundColor: tone.bg },
  topbarBack: { flexDirection: 'row', alignItems: 'center', gap: 1, width: 80 },

  hero:       { backgroundColor: tone.surface, borderRadius: radius.xl, marginHorizontal: space.lg, padding: space.xl, gap: 6 },

  seg:        { flexDirection: 'row', backgroundColor: tone.line, borderRadius: radius.md, padding: 2, marginHorizontal: space.lg },
  segItem:    { flex: 1, alignItems: 'center', paddingVertical: 7, borderRadius: radius.md - 3 },
  segOn:      { backgroundColor: tone.surface, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 3, shadowOffset: { width: 0, height: 1 }, elevation: 2 },

  groupHeader:{ ...type.footnote, color: secondaryLabel, letterSpacing: 0.3, paddingHorizontal: space.lg + space.md, marginBottom: -2 },

  group:      { backgroundColor: tone.surface, borderRadius: radius.lg, marginHorizontal: space.lg, overflow: 'hidden' },
  row:        { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingHorizontal: space.lg, paddingVertical: 13, minHeight: 48, backgroundColor: tone.surface },
  rowPressed: { backgroundColor: '#e9e9ee' },
  sep:        { height: StyleSheet.hairlineWidth, backgroundColor: tone.separator, marginLeft: space.lg },
  leading:    { minWidth: 12, alignItems: 'center', justifyContent: 'center' },

  glyph:      { width: 29, height: 29, borderRadius: 7, alignItems: 'center', justifyContent: 'center' },
  btn:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space.sm, height: 50, borderRadius: radius.lg, marginHorizontal: space.lg },

  card:       { backgroundColor: tone.surface, borderRadius: radius.lg, marginHorizontal: space.lg, padding: space.lg },

  qa:         { flex: 1, alignItems: 'center', gap: 6 },
  qaIcon:     { width: 50, height: 50, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },

  tlRow:      { flexDirection: 'row', gap: space.md },
  tlGutter:   { alignItems: 'center', width: 14 },
  tlDot:      { width: 11, height: 11, borderRadius: 6, marginTop: 4 },
  tlLine:     { width: 2, flex: 1, backgroundColor: tone.separator, marginVertical: 2 },
  tlHead:     { flexDirection: 'row', justifyContent: 'space-between' },
  tlAttach:   { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
});
