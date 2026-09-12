import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { GradientBackground } from '../components/GradientBackground';
import { Card } from '../components/Card';
import { Avatar } from '../components/Avatar';
import { ProgressBar } from '../components/ProgressBar';
import { LeagueBadge } from '../components/LeagueBadge';
import { Sparkles } from '../components/Sparkles';
import { useAuthStore } from '../store/useAuthStore';
import { useProgressStore } from '../store/useProgressStore';
import { TRAILS } from '../data/trails';
import { getLeagueForPoints } from '../data/leagues';
import { getTrailProgress } from '../utils/progress';
import { colors, radii, spacing, typography } from '../theme';

export function HomeScreen() {
  const navigation = useNavigation();
  const user = useAuthStore((s) => s.user);
  const completedLessonIds = useProgressStore((s) => s.completedLessonIds);

  if (!user) return null;
  const league = getLeagueForPoints(user.points);

  return (
    <GradientBackground>
      <Sparkles />
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.header}>
            <View style={styles.greeting}>
              <Text style={styles.hello}>Olá,</Text>
              <Text style={styles.name}>{user.name}</Text>
            </View>
            <Avatar uri={user.avatarUri} name={user.name} size={52} />
          </View>

          <View style={styles.statsRow}>
            <Card style={styles.leagueCard}>
              <LeagueBadge tier={league} compact />
              <Text style={styles.leagueText}>Liga {league.name}</Text>
            </Card>
            <Card style={styles.pointsCard}>
              <Text style={styles.pointsIcon}>⚡</Text>
              <Text style={styles.pointsValue}>{user.points}</Text>
              <Text style={styles.pointsLabel}>pontos</Text>
            </Card>
            <Card style={styles.streakCard}>
              <Text style={styles.pointsIcon}>🔥</Text>
              <Text style={styles.pointsValue}>{user.streak}</Text>
              <Text style={styles.pointsLabel}>dias</Text>
            </Card>
          </View>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => navigation.navigate('Audit')}
            style={{ marginBottom: spacing.xl }}>
            <Card glow style={styles.auditBanner}>
              <View style={styles.auditBannerIcon}>
                <Text style={{ fontSize: 26 }}>📡</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.auditBannerTitle}>Auditoria Técnica & Telemetria</Text>
                <Text style={styles.auditBannerSub}>
                  Recursos Nativos: GPS c/ Precisão, Acelerômetro e Histórico Offline
                </Text>
              </View>
              <Text style={{ color: colors.primaryLight, fontSize: 22, fontWeight: '700' }}>›</Text>
            </Card>
          </TouchableOpacity>

          <Text style={styles.sectionTitle}>Trilhas de aprendizado</Text>
          <Text style={styles.sectionSub}>Escolha um caminho e evolua sua magia</Text>

          <View style={styles.trails}>
            {TRAILS.map((trail) => {
              const progress = getTrailProgress(trail, completedLessonIds);
              return (
                <TouchableOpacity
                  key={trail.id}
                  activeOpacity={0.85}
                  onPress={() => navigation.navigate('Trail', { trailId: trail.id })}>
                  <Card glow style={styles.trailCard}>
                    <View style={[styles.trailIcon, { backgroundColor: trail.accentColor + '33' }]}>
                      <Text style={styles.trailEmoji}>{trail.icon}</Text>
                    </View>
                    <View style={styles.trailInfo}>
                      <Text style={styles.trailTitle}>{trail.title}</Text>
                      <Text style={styles.trailSubtitle}>{trail.subtitle}</Text>
                      <View style={styles.trailProgress}>
                        <ProgressBar progress={progress.percent} height={8} />
                        <Text style={styles.trailProgressText}>
                          {progress.completed}/{progress.total}
                        </Text>
                      </View>
                    </View>
                  </Card>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  greeting: { flex: 1 },
  hello: { color: colors.textMuted, fontSize: typography.subheading },
  name: { color: colors.text, fontSize: typography.title, fontWeight: '700' },
  statsRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.xl },
  leagueCard: { flex: 1.3, alignItems: 'center', justifyContent: 'center', gap: spacing.xs },
  pointsCard: { flex: 1, alignItems: 'center' },
  streakCard: { flex: 1, alignItems: 'center' },
  leagueText: { color: colors.text, fontSize: typography.small, fontWeight: '600' },
  pointsIcon: { fontSize: 20 },
  pointsValue: { color: colors.text, fontSize: typography.heading, fontWeight: '700' },
  pointsLabel: { color: colors.textMuted, fontSize: typography.small },
  sectionTitle: { color: colors.text, fontSize: typography.heading, fontWeight: '700' },
  sectionSub: { color: colors.textMuted, fontSize: typography.caption, marginBottom: spacing.lg },
  trails: { gap: spacing.lg },
  trailCard: { flexDirection: 'row', gap: spacing.lg, alignItems: 'center' },
  trailIcon: {
    width: 60,
    height: 60,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trailEmoji: { fontSize: 30 },
  trailInfo: { flex: 1 },
  trailTitle: { color: colors.text, fontSize: typography.subheading, fontWeight: '700' },
  trailSubtitle: { color: colors.textMuted, fontSize: typography.caption, marginTop: 2 },
  trailProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  trailProgressText: { color: colors.textFaint, fontSize: typography.small },
  auditBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: '#160D2E',
    borderColor: colors.primary,
  },
  auditBannerIcon: {
    width: 48,
    height: 48,
    borderRadius: radii.md,
    backgroundColor: colors.primary + '33',
    alignItems: 'center',
    justifyContent: 'center',
  },
  auditBannerTitle: { color: colors.text, fontSize: typography.body, fontWeight: '700' },
  auditBannerSub: { color: colors.textMuted, fontSize: typography.caption, marginTop: 2 },
});
