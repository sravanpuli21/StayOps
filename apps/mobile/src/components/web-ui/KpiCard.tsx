import { View, Text, StyleSheet } from 'react-native';
import { C, F, R, S } from '../../theme';

interface KpiCardProps {
  label: string;
  value: string;
  subtext?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  size?: 'large' | 'medium';
  alert?: boolean;
}

/**
 * Mobile mirror of apps/web/src/components/common/KpiCard.tsx — same
 * Airbnb visual language (white card, #ddd border, soft shadow,
 * uppercase 12px label, big bold value, 12px sub).
 */
export function KpiCard({
  label,
  value,
  subtext,
  trend,
  trendValue,
  size = 'medium',
  alert = false,
}: KpiCardProps) {
  const trendColor =
    trend === 'up' ? C.green : trend === 'down' ? C.red : C.sub;
  const trendPrefix = trend === 'up' ? '▲' : trend === 'down' ? '▼' : '';

  return (
    <View
      style={[
        styles.card,
        alert ? styles.alertCard : styles.normalCard,
      ]}
    >
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, size === 'large' ? styles.valueLarge : styles.valueMedium]}>
        {value}
      </Text>
      {(subtext || trendValue) && (
        <Text style={styles.sub}>
          {trendValue && (
            <Text style={[styles.trend, { color: trendColor }]}>
              {trendPrefix} {trendValue}{' '}
            </Text>
          )}
          {subtext}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: C.card,
    borderRadius: R.lg,
    padding: S.md + 2,
    minHeight: 96,
  },
  normalCard: {
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  alertCard: {
    borderWidth: 1,
    borderColor: '#d97706',
    backgroundColor: '#fffbeb',
  },
  label: {
    fontSize: F.xs,
    fontWeight: '700',
    color: C.hint,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    fontWeight: '800',
    color: C.text,
    marginTop: 4,
  },
  valueLarge: { fontSize: 26, lineHeight: 30 },
  valueMedium: { fontSize: 22, lineHeight: 26 },
  sub: {
    fontSize: F.xs,
    color: C.sub,
    marginTop: 4,
    lineHeight: 16,
  },
  trend: {
    fontWeight: '700',
  },
});
