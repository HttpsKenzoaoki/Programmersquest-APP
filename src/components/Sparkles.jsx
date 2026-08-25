import { StyleSheet, Text, View } from 'react-native';

const SPARKLES = [
  { top: '6%', left: '12%', size: 16, char: '✦', color: '#C084FC', opacity: 0.9 },
  { top: '12%', right: '18%', size: 12, char: '✧', color: '#60A5FA', opacity: 0.7 },
  { top: '30%', left: '8%', size: 10, char: '✧', color: '#38BDF8', opacity: 0.6 },
  { top: '55%', right: '10%', size: 18, char: '✦', color: '#A78BFA', opacity: 0.8 },
  { top: '72%', left: '16%', size: 12, char: '✧', color: '#C084FC', opacity: 0.6 },
  { top: '84%', right: '22%', size: 14, char: '✦', color: '#60A5FA', opacity: 0.75 },
];

export function Sparkles() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {SPARKLES.map((s, i) => (
        <Text
          key={i}
          style={{
            position: 'absolute',
            top: s.top,
            right: s.right,
            left: s.left,
            fontSize: s.size,
            color: s.color,
            opacity: s.opacity,
            textShadowColor: s.color,
            textShadowRadius: 8,
          }}>
          {s.char}
        </Text>
      ))}
    </View>
  );
}
