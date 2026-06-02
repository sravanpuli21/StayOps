import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C, F, R, S } from '../../theme';

interface AlertStripProps {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
  sub?: string;
  color?: string;
  onPress?: () => void;
}

/**
 * Mobile mirror of the web critical-alert strip:
 *   bg #fffbeb, border #fcd34d, icon left, 2-line copy, chevron right.
 */
export function AlertStrip({ icon, text, sub, color = '#b45309', onPress }: AlertStripProps) {
  const Wrap: any = onPress ? TouchableOpacity : View;
  return (
    <Wrap style={styles.strip} onPress={onPress} activeOpacity={0.85}>
      <Ionicons name={icon} size={18} color={color} />
      <View style={{ flex: 1 }}>
        <Text style={[styles.text, { color }]}>{text}</Text>
        {sub && <Text style={styles.sub}>{sub}</Text>}
      </View>
      {onPress && <Ionicons name="chevron-forward" size={16} color={color} />}
    </Wrap>
  );
}

const styles = StyleSheet.create({
  strip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.sm,
    backgroundColor: C.alertAmberBg,
    borderWidth: 1,
    borderColor: C.alertAmberBorder,
    borderRadius: R.lg,
    paddingHorizontal: S.md,
    paddingVertical: S.md,
  },
  text: { fontSize: F.sm, fontWeight: '700' },
  sub: { fontSize: F.xs, color: C.sub, marginTop: 2 },
});
