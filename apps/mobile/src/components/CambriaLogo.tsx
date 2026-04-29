import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { C } from '../theme';

interface Props {
  size?: 'sm' | 'md' | 'lg';
}

export function CambriaLogo({ size = 'md' }: Props) {
  const fontSize = size === 'sm' ? 13 : size === 'lg' ? 22 : 17;
  const barH = size === 'sm' ? 2 : size === 'lg' ? 4 : 3;

  return (
    <View style={styles.wrap}>
      <Text style={[styles.text, { fontSize, letterSpacing: fontSize * 0.18 }]}>
        CAMBRIA
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
