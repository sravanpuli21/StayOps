import { Text, StyleSheet, type StyleProp, type TextStyle } from 'react-native';
import { C, F } from '../../theme';

/**
 * Web-matched section heading: "REVENUE", "COSTS", "OPERATIONS — TODAY".
 * Mirrors `<h2 className="text-sm font-bold uppercase tracking-wide" style={{ color: '#6a6a6a' }}>`.
 */
export function SectionLabel({ children, style }: { children: React.ReactNode; style?: StyleProp<TextStyle> }) {
  return <Text style={[styles.label, style]}>{children}</Text>;
}

const styles = StyleSheet.create({
  label: {
    fontSize: F.xs + 1,         // 12px — slightly larger than mobile xs
    fontWeight: '800',
    color: C.sub,               // #6a6a6a
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
});
