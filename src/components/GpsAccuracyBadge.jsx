import { StyleSheet, Text, View } from 'react-native';
import { radii, spacing, typography } from '../theme';

/**
 * RF02 - Feedback Visual de Precisão de GPS
 * Verde: alta precisão < 10m
 * Amarelo: média precisão entre 10m e 30m
 * Vermelho: baixa precisão > 30m
 */
export function GpsAccuracyBadge({ accuracy }) {
  if (accuracy === null || accuracy === undefined) {
    return (
      <View style={[styles.badge, styles.neutral]}>
        <View style={[styles.dot, styles.dotNeutral]} />
        <Text style={styles.labelNeutral}>GPS: Aguardando sinal...</Text>
      </View>
    );
  }

  const num = typeof accuracy === 'number' ? accuracy : parseFloat(accuracy);

  let label = `Alta precisão (${num.toFixed(1)}m)`;
  let badgeStyle = styles.green;
  let dotStyle = styles.dotGreen;
  let textStyle = styles.labelGreen;

  if (num < 10) {
    label = `Alta precisão (${num.toFixed(1)}m)`;
    badgeStyle = styles.green;
    dotStyle = styles.dotGreen;
    textStyle = styles.labelGreen;
  } else if (num <= 30) {
    label = `Média precisão (${num.toFixed(1)}m)`;
    badgeStyle = styles.yellow;
    dotStyle = styles.dotYellow;
    textStyle = styles.labelYellow;
  } else {
    label = `Baixa precisão (${num.toFixed(1)}m)`;
    badgeStyle = styles.red;
    dotStyle = styles.dotRed;
    textStyle = styles.labelRed;
  }

  return (
    <View style={[styles.badge, badgeStyle]}>
      <View style={[styles.dot, dotStyle]} />
      <Text style={[styles.label, textStyle]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radii.pill,
    borderWidth: 1,
    gap: spacing.xs,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: radii.pill,
  },
  label: {
    fontSize: typography.small,
    fontWeight: '700',
  },
  green: {
    backgroundColor: '#0F2E24',
    borderColor: '#10B981',
  },
  dotGreen: {
    backgroundColor: '#10B981',
  },
  labelGreen: {
    color: '#34D399',
  },
  yellow: {
    backgroundColor: '#332408',
    borderColor: '#F59E0B',
  },
  dotYellow: {
    backgroundColor: '#F59E0B',
  },
  labelYellow: {
    color: '#FBBF24',
  },
  red: {
    backgroundColor: '#2E1420',
    borderColor: '#EF4444',
  },
  dotRed: {
    backgroundColor: '#EF4444',
  },
  labelRed: {
    color: '#F87171',
  },
  neutral: {
    backgroundColor: '#1C1635',
    borderColor: '#3D3160',
  },
  dotNeutral: {
    backgroundColor: '#94A3B8',
  },
  labelNeutral: {
    color: '#94A3B8',
    fontSize: typography.small,
    fontWeight: '600',
  },
});
