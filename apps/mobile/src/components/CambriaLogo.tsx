import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { C } from '../theme';

interface Props {
  size?: 'sm' | 'md' | 'lg';
  name?: string;
}

/**
 * stayops product wordmark. Lowercase wordmark + thin Rausch accent bar — the
 * app is "stayops"; the hotel is data. Filename kept (CambriaLogo) for
 * backward compat with older imports — will rename in a future pass.
 */
export function CambriaLogo({ size = 'md', name = 'stayops' }: Props) {
  const fontSize = size === 'sm' ? 13 : size === 'lg' ? 22 : 17;
  const barH = size === 'sm' ? 2 : size === 'lg' ? 3 : 2.5;

  return (
    <View style={styles.wrap}>
      <Text style={[styles.text, { fontSize }]}>
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
    color: C.text,
    letterSpacing: 0,
  },
  bar: {
    width: '70%',
    backgroundColor: C.brand, // #ff385c — Rausch, matches web
    borderRadius: 2,
  },
});
