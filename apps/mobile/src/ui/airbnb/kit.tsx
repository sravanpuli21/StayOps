/**
 * Airbnb-flavored primitives kit. Category pill rail, big rounded "listing"
 * cards with a colored cover zone + content + bold price, save heart, and
 * friendly bold section titles.
 */
import React from 'react';
import {
  View, Text, Pressable, StyleSheet, ScrollView,
  type ViewStyle, type TextStyle, type StyleProp,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { A, AT, AS, AR, ashadow, atoneColors, type ATone } from './tokens';

/* ── Screen ───────────────────────────────────────────────────────────── */
export function Screen({ children }: { children: React.ReactNode }) {
  return (
    <ScrollView style={s.screen} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
      {children}
    </ScrollView>
  );
}

type TV = keyof typeof AT;
export function Txt({ children, variant = 'body', color = A.text, style, numberOfLines }: {
  children: React.ReactNode; variant?: TV; color?: string; style?: StyleProp<TextStyle>; numberOfLines?: number;
}) {
  return <Text numberOfLines={numberOfLines} style={[AT[variant], { color }, style]}>{children}</Text>;
}

/* ── Search-style header bar (the Airbnb pill search) ─────────────────── */
export function SearchHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <View style={s.search}>
      <Ionicons name="search" size={18} color={A.text} />
      <View style={{ flex: 1 }}>
        <Text style={[AT.bodyMed, { color: A.text }]} numberOfLines={1}>{title}</Text>
        <Text style={[AT.sub, { color: A.textSub }]} numberOfLines={1}>{subtitle}</Text>
      </View>
    </View>
  );
}

/* ── Category pill rail (horizontal scroll, icon + label, active underline) ─ */
export interface Category { key: string; label: string; icon: string }
export function CategoryRail({ items, active, onChange }: {
  items: Category[]; active: string; onChange: (k: string) => void;
}) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.rail}>
      {items.map((c) => {
        const on = c.key === active;
        return (
          <Pressable key={c.key} onPress={() => onChange(c.key)} style={s.cat}>
            <Ionicons name={c.icon as any} size={22} color={on ? A.text : A.textHint} />
            <Text style={[AT.micro, { color: on ? A.text : A.textHint, textTransform: 'none' }]}>{c.label}</Text>
            <View style={[s.catBar, { backgroundColor: on ? A.text : 'transparent' }]} />
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

/* ── Section title ────────────────────────────────────────────────────── */
export function SectionTitle({ children, count }: { children: React.ReactNode; count?: number }) {
  return (
    <View style={s.sectionRow}>
      <Text style={[AT.section]}>{children}</Text>
      {count != null ? <Text style={[AT.section, { color: A.textHint }]}> {count}</Text> : null}
    </View>
  );
}

/* ── Listing card — the Airbnb hero element ───────────────────────────── */
export function ListingCard({
  coverTone = 'neutral', coverIcon, badge, badgeTone, title, where, meta, price, priceUnit, onPress, saved, onSave,
}: {
  coverTone?: ATone; coverIcon: string;
  badge?: string; badgeTone?: ATone;
  title: string; where: string; meta?: string;
  price?: string; priceUnit?: string;
  onPress?: () => void; saved?: boolean; onSave?: () => void;
}) {
  const cover = atoneColors(coverTone);
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [pressed && { opacity: 0.92 }]}>
      <View style={[s.cover, { backgroundColor: cover.bg }]}>
        <Ionicons name={coverIcon as any} size={46} color={cover.fg} />
        {badge ? (
          <View style={s.badge}>
            <Text style={[AT.micro, { color: A.text }]}>{badge}</Text>
          </View>
        ) : null}
        {onSave ? (
          <Pressable onPress={onSave} hitSlop={10} style={s.heart}>
            <Ionicons name={saved ? 'heart' : 'heart-outline'} size={24} color={saved ? A.brand : '#fff'} style={s.heartIcon} />
          </Pressable>
        ) : null}
      </View>
      <View style={s.listingBody}>
        <View style={s.listingTop}>
          <Text style={[AT.cardTitle, { flex: 1 }]} numberOfLines={1}>{title}</Text>
          {price ? <Text style={[AT.price]}>{price}</Text> : null}
        </View>
        <Text style={[AT.sub, { color: A.textSub }]} numberOfLines={1}>{where}</Text>
        {meta ? <Text style={[AT.sub, { color: A.textSub }]} numberOfLines={1}>{meta}</Text> : null}
        {priceUnit ? <Text style={[AT.sub, { color: A.textSub }]}>{priceUnit}</Text> : null}
      </View>
    </Pressable>
  );
}

/* ── Compact list row (for secondary lists) ───────────────────────────── */
export function MiniRow({ icon, iconTone = 'neutral', title, sub, right, onPress, last }: {
  icon: string; iconTone?: ATone; title: string; sub?: string; right?: React.ReactNode; onPress?: () => void; last?: boolean;
}) {
  const c = atoneColors(iconTone);
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [s.mini, !last && s.miniBorder, pressed && { opacity: 0.6 }]}>
      <View style={[s.miniIcon, { backgroundColor: c.bg }]}><Ionicons name={icon as any} size={18} color={c.fg} /></View>
      <View style={{ flex: 1, gap: 1 }}>
        <Text style={[AT.bodyMed, { color: A.text }]} numberOfLines={1}>{title}</Text>
        {sub ? <Text style={[AT.sub, { color: A.textSub }]} numberOfLines={1}>{sub}</Text> : null}
      </View>
      {right ?? (onPress ? <Ionicons name="chevron-forward" size={18} color={A.textHint} /> : null)}
    </Pressable>
  );
}

/* ── Pill / Button ────────────────────────────────────────────────────── */
export function Tag({ label, toneName = 'neutral' }: { label: string; toneName?: ATone }) {
  const c = atoneColors(toneName);
  return <View style={[s.tag, { backgroundColor: c.bg }]}><Text style={[AT.micro, { color: c.fg, textTransform: 'uppercase' }]}>{label}</Text></View>;
}

export function Button({ label, onPress, kind = 'brand', icon }: {
  label: string; onPress?: () => void; kind?: 'brand' | 'dark' | 'outline'; icon?: string;
}) {
  const bg = kind === 'brand' ? A.brand : kind === 'dark' ? A.text : 'transparent';
  const fg = kind === 'outline' ? A.text : '#fff';
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [s.btn, { backgroundColor: bg, borderWidth: kind === 'outline' ? 1.5 : 0, borderColor: A.text }, pressed && { opacity: 0.85 }]}>
      {icon ? <Ionicons name={icon as any} size={19} color={fg} /> : null}
      <Text style={[AT.bodyMed, { color: fg, fontSize: 16 }]}>{label}</Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  screen:  { flex: 1, backgroundColor: A.bg },
  content: { paddingBottom: AS.xxxl, gap: AS.xl },

  search:  { flexDirection: 'row', alignItems: 'center', gap: AS.md, marginHorizontal: AS.lg, marginTop: AS.sm, paddingHorizontal: AS.lg, paddingVertical: AS.md, borderRadius: AR.pill, borderWidth: 1, borderColor: A.line, backgroundColor: A.surface, ...ashadow.float },

  rail:    { paddingHorizontal: AS.lg, gap: AS.xl },
  cat:     { alignItems: 'center', gap: 5, paddingBottom: AS.sm },
  catBar:  { height: 2, width: 28, borderRadius: 2, marginTop: 2 },

  sectionRow: { flexDirection: 'row', alignItems: 'baseline', paddingHorizontal: AS.lg },

  cover:   { height: 150, borderRadius: AR.xl, marginHorizontal: AS.lg, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  badge:   { position: 'absolute', top: AS.md, left: AS.md, backgroundColor: 'rgba(255,255,255,0.95)', paddingHorizontal: AS.md, paddingVertical: 5, borderRadius: AR.pill },
  heart:   { position: 'absolute', top: AS.md, right: AS.md },
  heartIcon: { textShadowColor: 'rgba(0,0,0,0.25)', textShadowRadius: 4, textShadowOffset: { width: 0, height: 1 } },
  listingBody: { paddingHorizontal: AS.lg, paddingTop: AS.md, gap: 2 },
  listingTop:  { flexDirection: 'row', alignItems: 'center', gap: AS.sm },

  mini:       { flexDirection: 'row', alignItems: 'center', gap: AS.md, paddingVertical: AS.md, marginHorizontal: AS.lg },
  miniBorder: { borderBottomWidth: 1, borderBottomColor: A.lineSoft },
  miniIcon:   { width: 38, height: 38, borderRadius: AR.md, alignItems: 'center', justifyContent: 'center' },

  tag:     { paddingHorizontal: 9, paddingVertical: 4, borderRadius: AR.pill, alignSelf: 'flex-start' },
  btn:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: AS.sm, height: 50, borderRadius: AR.md, marginHorizontal: AS.lg },
});
