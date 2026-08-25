import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { GradientBackground } from '../components/GradientBackground';
import { ProgressBar } from '../components/ProgressBar';
import { useAuthStore } from '../store/useAuthStore';
import { useProgressStore } from '../store/useProgressStore';
import { TRAILS } from '../data/trails';
import { getLessonStatus, getTrailProgress } from '../utils/progress';
import { colors, shadow, spacing, typography } from '../theme';

export function TrailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { trailId } = route.params;
  const completedLessonIds = useProgressStore((s) => s.completedLessonIds);
  const user = useAuthStore((s) => s.user);

  const trail = TRAILS.find((t) => t.id === trailId);
  if (!trail || !user) return null;

  const progress = getTrailProgress(trail, completedLessonIds);

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backText}>‹ Voltar</Text>
          </TouchableOpacity>
          <View style={styles.titleBlock}>
            <Text style={styles.title}>
              {trail.icon} {trail.title}
            </Text>
            <Text style={styles.subtitle}>{trail.description}</Text>
          </View>
          <View style={styles.progressRow}>
            <ProgressBar progress={progress.percent} height={10} />
            <Text style={styles.progressText}>
              {progress.completed}/{progress.total} concluídas
            </Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.path}>
          {trail.lessons.map((lesson, index) => {
            const status = getLessonStatus(trail, lesson, completedLessonIds);
            const isLast = index === trail.lessons.length - 1;
            return (
              <LessonNode
                key={lesson.id}
                title={lesson.title}
                description={lesson.description}
                points={lesson.points}
                status={status}
                isLast={isLast}
                onPress={() => {
                  if (status !== 'locked') {
                    navigation.navigate('Lesson', { trailId: trail.id, lessonId: lesson.id });
                  }
                }}
              />
            );
          })}
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}

function LessonNode({ title, description, points, status, isLast, onPress }) {
  const completed = status === 'completed';
  const locked = status === 'locked';

  const nodeStyle = completed
    ? { backgroundColor: colors.success }
    : locked
      ? { backgroundColor: colors.surfaceAlt }
      : { backgroundColor: colors.primary };

  const icon = completed ? '✓' : locked ? '🔒' : '▶';

  return (
    <View style={styles.nodeRow}>
      <View style={styles.nodeColumn}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onPress}
          disabled={locked}
          style={[styles.node, nodeStyle, !locked && shadow.glowPurple, locked && styles.nodeLocked]}>
          <Text style={[styles.nodeIcon, locked && styles.nodeIconLocked]}>{icon}</Text>
        </TouchableOpacity>
        {!isLast && <View style={styles.connector} />}
      </View>
      <View style={[styles.nodeInfo, locked && styles.nodeInfoLocked]}>
        <Text style={[styles.nodeTitle, locked && styles.nodeTextLocked]}>{title}</Text>
        <Text style={[styles.nodeDesc, locked && styles.nodeTextLocked]}>{description}</Text>
        <Text style={styles.nodePoints}>⚡ +{points} pontos</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm },
  backBtn: { marginBottom: spacing.md },
  backText: { color: colors.primaryLight, fontSize: typography.subheading, fontWeight: '600' },
  titleBlock: { marginBottom: spacing.md },
  title: { color: colors.text, fontSize: typography.title, fontWeight: '700' },
  subtitle: { color: colors.textMuted, fontSize: typography.caption, marginTop: spacing.xs },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  progressText: { color: colors.textFaint, fontSize: typography.small },
  path: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl },
  nodeRow: { flexDirection: 'row', alignItems: 'stretch' },
  nodeColumn: { alignItems: 'center', width: 72 },
  node: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.border,
  },
  nodeLocked: { borderColor: colors.surfaceAlt },
  nodeIcon: { color: colors.white, fontSize: 22, fontWeight: '700' },
  nodeIconLocked: { color: colors.textFaint },
  connector: {
    width: 3,
    flex: 1,
    minHeight: 28,
    backgroundColor: colors.border,
    marginVertical: spacing.xs,
  },
  nodeInfo: {
    flex: 1,
    paddingLeft: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
  },
  nodeInfoLocked: { opacity: 0.5 },
  nodeTitle: { color: colors.text, fontSize: typography.subheading, fontWeight: '700' },
  nodeTextLocked: { color: colors.textMuted },
  nodeDesc: { color: colors.textMuted, fontSize: typography.caption, marginTop: 2 },
  nodePoints: {
    color: colors.gold,
    fontSize: typography.small,
    fontWeight: '700',
    marginTop: spacing.sm,
  },
});
