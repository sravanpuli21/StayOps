import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { C } from '../theme';

interface Props {
  size?: 'sm' | 'md' | 'lg';
  name?: string;
}

// Legacy name kept for backward compat. Now acts as a generic property logo —
// pass `name` to override the displayed text (defaults to HOME2 since every
// mobile persona currently maps to Home2 Baton Rouge / BTRCI).
export function CambriaLogo({ size = 'md', name = 'HOME2' }: Props) {
  const fontSize = size === 'sm' ? 13 : size === 'lg' ? 22 : 17;
  const barH = size === 'sm' ? 2 : size === 'lg' ? 4 : 3;

  return (
    <View style={styles.wrap}>
      <Text style={[styles.text, { fontSize, letterSpacing: fontSize * 0.18 }]}>
        {name}
      </Text>
      <View style={[styles.bar, { height: barH }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'flex-start', gap: 2 },
  text: {
    fontWeight: '700',
    color: C.hotelSlate,
    letterSpacing: 3,
  },
  bar: {
    width: '100%',
    backgroundColor: C.gold,
    borderRadius: 2,
  },
});
