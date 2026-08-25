import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { GradientBackground } from '../components/GradientBackground';
import { Card } from '../components/Card';
import { Avatar } from '../components/Avatar';
import { LeagueBadge } from '../components/LeagueBadge';
import { MagicButton } from '../components/MagicButton';
import { AppTextInput } from '../components/AppTextInput';
import { useAuthStore } from '../store/useAuthStore';
import { useProgressStore } from '../store/useProgressStore';
import { getLeagueForPoints } from '../data/leagues';
import { TOTAL_LESSONS } from '../data/trails';
import { colors, radii, spacing, typography } from '../theme';

export function ProfileScreen() {
  const navigation = useNavigation();
  const user = useAuthStore((s) => s.user);
  const updateProfile = useAuthStore((s) => s.updateProfile);
  const logout = useAuthStore((s) => s.logout);
  const completedLessonIds = useProgressStore((s) => s.completedLessonIds);

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name ?? '');

  if (!user) return null;
  const league = getLeagueForPoints(user.points);

  const pickAvatar = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(
        'Permissão necessária',
        'Precisamos acessar sua galeria para escolher a foto de perfil.',
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) {
      await updateProfile({ avatarUri: result.assets[0].uri });
    }
  };

  const saveName = async () => {
    const trimmed = name.trim();
    if (trimmed && trimmed !== user.name) {
      await updateProfile({ name: trimmed });
    }
    setEditing(false);
  };

  const handleLogout = () => {
    Alert.alert('Sair da conta', 'Tem certeza que deseja sair?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: () => logout() },
    ]);
  };

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.header}>
            <TouchableOpacity onPress={pickAvatar} style={styles.avatarWrap}>
              <Avatar uri={user.avatarUri} name={user.name} size={110} />
              <View style={styles.cameraBadge}>
                <Text style={styles.cameraText}>📷</Text>
              </View>
            </TouchableOpacity>

            {editing ? (
              <View style={styles.editRow}>
                <View style={styles.editInput}>
                  <AppTextInput
                    value={name}
                    onChangeText={setName}
                    autoFocus
                    containerStyle={{ marginBottom: 0 }}
                  />
                </View>
                <MagicButton title="Salvar" onPress={saveName} style={{ height: 44 }} />
              </View>
            ) : (
              <TouchableOpacity
                onPress={() => {
                  setName(user.name);
                  setEditing(true);
                }}>
                <Text style={styles.name}>{user.name} ✏️</Text>
              </TouchableOpacity>
            )}
            <Text style={styles.email}>{user.email}</Text>
            <LeagueBadge tier={league} />
          </View>

          <View style={styles.statsRow}>
            <Card style={styles.statCard}>
              <Text style={styles.statValue}>{user.points}</Text>
              <Text style={styles.statLabel}>Pontos</Text>
            </Card>
            <Card style={styles.statCard}>
              <Text style={styles.statValue}>
                {completedLessonIds.length}/{TOTAL_LESSONS}
              </Text>
              <Text style={styles.statLabel}>Lições</Text>
            </Card>
            <Card style={styles.statCard}>
              <Text style={styles.statValue}>🔥 {user.streak}</Text>
              <Text style={styles.statLabel}>Sequência</Text>
            </Card>
          </View>

          <Text style={styles.sectionTitle}>Configurações</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Contact')}>
            <Card style={styles.optionRow}>
              <Text style={styles.optionIcon}>💬</Text>
              <Text style={styles.optionText}>Fale conosco / reportar problema</Text>
              <Text style={styles.optionArrow}>›</Text>
            </Card>
          </TouchableOpacity>

          <MagicButton title="Sair da conta" onPress={handleLogout} variant="ghost" />
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
  header: { alignItems: 'center', marginBottom: spacing.xl },
  avatarWrap: { marginBottom: spacing.md },
  cameraBadge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: colors.primary,
    borderRadius: radii.pill,
    padding: spacing.sm,
  },
  cameraText: { fontSize: 14 },
  editRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, width: '100%' },
  editInput: { flex: 1 },
  name: {
    color: colors.text,
    fontSize: typography.title,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  email: { color: colors.textMuted, fontSize: typography.caption, marginBottom: spacing.md },
  statsRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.xl },
  statCard: { flex: 1, alignItems: 'center' },
  statValue: { color: colors.text, fontSize: typography.heading, fontWeight: '700' },
  statLabel: { color: colors.textMuted, fontSize: typography.small, marginTop: spacing.xs },
  sectionTitle: {
    color: colors.text,
    fontSize: typography.subheading,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  optionIcon: { fontSize: 22 },
  optionText: { flex: 1, color: colors.text, fontSize: typography.body },
  optionArrow: { color: colors.textFaint, fontSize: 24 },
});
