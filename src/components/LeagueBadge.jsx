import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radii, shadow, spacing, typography } from '../theme';

export function LeagueBadge({ tier, compact }) {
  return (
    <View style={styles.wrapper}>
      <LinearGradient
        colors={tier.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.badge, compact ? styles.badgeCompact : styles.badgeFull, shadow.glowPurple]}>
        <Text style={[styles.icon, compact && styles.iconCompact]}>{tier.icon}</Text>
        {!compact && <Text style={styles.name}>Liga {tier.name}</Text>}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'flex-start',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radii.pill,
  },
  badgeFull: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  badgeCompact: {
    padding: spacing.sm,
  },
  icon: {
    fontSize: 20,
  },
  iconCompact: {
    fontSize: 16,
  },
  name: {
    color: colors.black,
    fontWeight: '700',
    fontSize: typography.caption,
  },
});
