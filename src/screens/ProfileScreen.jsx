import { useState } from 'react';
import {
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
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
  const { width } = useWindowDimensions();
  const isLandscape = width > 600;
  const user = useAuthStore((s) => s.user);
  const updateProfile = useAuthStore((s) => s.updateProfile);
  const logout = useAuthStore((s) => s.logout);
  const completedLessonIds = useProgressStore((s) => s.completedLessonIds);

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name ?? '');

  if (!user) return null;
  const league = getLeagueForPoints(user.points);

  const pickAvatar = () => {
    Alert.alert(
      'Foto de Perfil',
      'Como você deseja definir seu avatar?',
      [
        { text: '📷 Tirar Foto (Câmera)', onPress: takePhotoWithCamera },
        { text: '🖼️ Escolher da Galeria', onPress: pickFromGallery },
        { text: 'Cancelar', style: 'cancel' },
      ]
    );
  };

  // Nível Júnior: Tratamento avançado de permissões negadas na Câmera
  const takePhotoWithCamera = async () => {
    try {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) {
        if (perm.canAskAgain === false) {
          Alert.alert(
            'Permissão da Câmera Bloqueada',
            'O acesso à câmera foi marcado como "Não perguntar novamente". Para tirar uma foto, abra as configurações do sistema operacional e ative a permissão manualmente.',
            [
              { text: 'Cancelar', style: 'cancel' },
              {
                text: 'Abrir Configurações',
                onPress: () => Linking.openSettings(),
              },
            ]
          );
        } else {
          Alert.alert(
            'Permissão necessária',
            'O acesso à câmera é necessário para tirar a foto do seu avatar.'
          );
        }
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]?.uri) {
        await updateProfile({ avatarUri: result.assets[0].uri });
      }
    } catch (error) {
      // RNF01: Degradação graciosa
      Alert.alert(
        'Câmera Indisponível',
        'Não foi possível inicializar a câmera neste aparelho. Verifique se o recurso de hardware está disponível.'
      );
    }
  };

  const pickFromGallery = async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        if (perm.canAskAgain === false) {
          Alert.alert(
            'Permissão da Galeria Bloqueada',
            'O acesso às fotos foi bloqueado. Abra as configurações do sistema operacional para permitir o acesso.',
            [
              { text: 'Cancelar', style: 'cancel' },
              { text: 'Abrir Configurações', onPress: () => Linking.openSettings() },
            ]
          );
        } else {
          Alert.alert(
            'Permissão necessária',
            'Precisamos acessar sua galeria para escolher a foto de perfil.'
          );
        }
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (!result.canceled && result.assets && result.assets[0]?.uri) {
        await updateProfile({ avatarUri: result.assets[0].uri });
      }
    } catch (error) {
      Alert.alert('Erro ao acessar galeria', error.message || 'Falha ao selecionar imagem.');
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

          <Text style={styles.sectionTitle}>Recursos Nativos & Desafios</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Audit')}>
            <Card style={styles.optionRow}>
              <Text style={styles.optionIcon}>📡</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.optionText}>Auditoria Técnica de Campo</Text>
                <Text style={styles.optionSubtext}>GPS c/ precisão + Acelerômetro + Histórico Offline</Text>
              </View>
              <Text style={styles.optionArrow}>›</Text>
            </Card>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Contact')}>
            <Card style={styles.optionRow}>
              <Text style={styles.optionIcon}>👥</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.optionText}>Agenda Corporativa (Contatos)</Text>
                <Text style={styles.optionSubtext}>Busca nativa em massa + paginação + FlatList</Text>
              </View>
              <Text style={styles.optionArrow}>›</Text>
            </Card>
          </TouchableOpacity>

          <Text style={styles.sectionTitle}>Conta</Text>
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
  optionText: { color: colors.text, fontSize: typography.body, fontWeight: '600' },
  optionSubtext: { color: colors.textMuted, fontSize: typography.caption, marginTop: 2 },
  optionArrow: { color: colors.textFaint, fontSize: 24 },
});
