import { View, Text, StyleSheet } from 'react-native';
import { C, F, R } from '../../theme';

type Health = 'good' | 'warn' | 'critical';

const CFG: Record<Health, { color: string; bg: string; label: string }> = {
  good:     { color: '#15803d', bg: '#dcfce7', label: 'Good' },
  warn:     { color: '#b45309', bg: '#fef3c7', label: 'Watch' },
  critical: { color: '#b91c1c', bg: '#fee2e2', label: 'Critical' },
};

export function HealthBadge({ health, label }: { health: Health; label?: string }) {
  const cfg = CFG[health];
  return (
    <View style={[styles.badge, { backgroundColor: cfg.bg }]}>
      <View style={[styles.dot, { backgroundColor: cfg.color }]} />
      <Text style={[styles.text, { color: cfg.color }]}>{label ?? cfg.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: R.full,
    alignSelf: 'flex-start',
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  text: { fontSize: F.xs, fontWeight: '700' },
});

void C;
