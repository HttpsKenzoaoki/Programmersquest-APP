import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, gradients } from '../theme';

export function GradientBackground({ children, variant = 'default' }) {
  return (
    <LinearGradient colors={gradients.bg} style={styles.container}>
      <View style={styles.orbPurple} />
      <View style={styles.orbBlue} />
      {variant === 'auth' && <View style={styles.orbCyan} />}
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  orbPurple: {
    position: 'absolute',
    top: -120,
    right: -100,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: colors.primary,
    opacity: 0.28,
  },
  orbBlue: {
    position: 'absolute',
    bottom: -140,
    left: -120,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: colors.blue,
    opacity: 0.22,
  },
  orbCyan: {
    position: 'absolute',
    top: '40%',
    left: -80,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: colors.cyan,
    opacity: 0.16,
  },
});
