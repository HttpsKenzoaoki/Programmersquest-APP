import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radii, shadow, spacing, typography } from '../theme';

export function MagicButton({
  title,
  onPress,
  variant = 'primary',
  disabled,
  loading,
  style,
  icon,
}) {
  const isPrimary = variant === 'primary';
  const isGold = variant === 'gold';

  const inner = loading ? (
    <ActivityIndicator color={colors.white} />
  ) : (
    <>
      {icon}
      <Text style={[styles.text, !isPrimary && !isGold && styles.textGhost]}>{title}</Text>
    </>
  );

  if (variant === 'ghost') {
    return (
      <Pressable
        onPress={onPress}
        disabled={disabled || loading}
        style={({ pressed }) => [styles.base, styles.ghost, pressed && styles.pressed, style]}>
        {inner}
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [pressed && styles.pressed, style]}>
      <LinearGradient
        colors={isGold ? ['#FACC15', '#F59E0B'] : ['#7C3AED', '#3B82F6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.base, shadow.glowPurple, (disabled || loading) && styles.disabled]}>
        {inner}
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 54,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border,
  },
  text: {
    color: colors.white,
    fontSize: typography.subheading,
    fontWeight: '700',
  },
  textGhost: {
    color: colors.primaryLight,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    opacity: 0.5,
  },
});
