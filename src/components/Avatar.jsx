import { StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { colors } from '../theme';

export function Avatar({ uri, name, size = 64, borderColor = colors.primary }) {
  const initial = name.trim().charAt(0).toUpperCase() || '?';

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={[styles.image, { width: size, height: size, borderRadius: size / 2, borderColor }]}
        contentFit="cover"
        transition={200}
      />
    );
  }

  return (
    <View
      style={[styles.fallback, { width: size, height: size, borderRadius: size / 2, borderColor }]}>
      <Text style={[styles.initial, { fontSize: size * 0.42 }]}>{initial}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    borderWidth: 2,
    backgroundColor: colors.surfaceAlt,
  },
  fallback: {
    borderWidth: 2,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initial: {
    color: colors.primaryLight,
    fontWeight: '700',
  },
});
