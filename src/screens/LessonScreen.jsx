import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Accelerometer } from 'expo-sensors';
import * as Haptics from 'expo-haptics';
import { GradientBackground } from '../components/GradientBackground';
import { MagicButton } from '../components/MagicButton';
import { ProgressBar } from '../components/ProgressBar';
import { useAuthStore } from '../store/useAuthStore';
import { useProgressStore } from '../store/useProgressStore';
import { TRAILS } from '../data/trails';
import { runCode } from '../services/codeRunner';
import { colors, radii, shadow, spacing, typography } from '../theme';

export function LessonScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { trailId, lessonId } = route.params;

  const trail = TRAILS.find((t) => t.id === trailId);
  const lesson = trail?.lessons.find((l) => l.id === lessonId);
  const markComplete = useProgressStore((s) => s.markLessonComplete);
  const addPoints = useAuthStore((s) => s.addPoints);

  const [index, setIndex] = useState(0);
  const [finished, setFinished] = useState(false);
  const [rewarded, setRewarded] = useState(false);

  const currentGRef = useRef(1.0);

  // Monitoramento de aceleração para trava por instabilidade física (Nível Pleno)
  useEffect(() => {
    let subscription;
    (async () => {
      try {
        const available = await Accelerometer.isAvailableAsync();
        if (available) {
          Accelerometer.setUpdateInterval(100);
          subscription = Accelerometer.addListener((data) => {
            currentGRef.current = Math.sqrt(
              data.x * data.x + data.y * data.y + data.z * data.z
            );
          });
        }
      } catch {}
    })();

    return () => {
      if (subscription) subscription.remove();
    };
  }, []);

  if (!trail || !lesson) return null;
  const exercises = lesson.exercises;
  const current = exercises[index];
  const isLast = index === exercises.length - 1;

  const handleAdvance = () => {
    // Nível Pleno: Trava de segurança por movimentação brusca (> 2.0g)
    if (currentGRef.current > 2.0) {
      Alert.alert(
        'Instabilidade Física Detectada',
        `A aceleração vetorial agregada ultrapassou 2.0g (${currentGRef.current.toFixed(2)}g). A submissão da lição foi bloqueada temporariamente para estabilização do dispositivo.`
      );
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } catch {}
      return;
    }

    if (isLast) {
      setFinished(true);
      if (!rewarded && lesson) {
        setRewarded(true);
        markComplete(lesson.id);
        addPoints(lesson.points);
        try {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch {}
      }
    } else {
      setIndex((i) => i + 1);
    }
  };

  if (finished) {
    return (
      <CompletionView
        lessonTitle={lesson.title}
        points={lesson.points}
        onDone={() => navigation.navigate('Trail', { trailId })}
      />
    );
  }

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backText}>‹ Sair</Text>
          </TouchableOpacity>
          <View style={styles.progressHeader}>
            <ProgressBar progress={(index + 1) / exercises.length} height={8} />
            <Text style={styles.progressLabel}>
              {index + 1} de {exercises.length}
            </Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
          {current.type === 'mcq' ? (
            <MCQView exercise={current} onAdvance={handleAdvance} />
          ) : (
            <CodeView exercise={current} onAdvance={handleAdvance} />
          )}
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}

function MCQView({ exercise, onAdvance }) {
  const [selected, setSelected] = useState(null);
  const answered = selected !== null;
  const correct = selected === exercise.correctIndex;

  return (
    <View>
      <Text style={styles.prompt}>{exercise.prompt}</Text>
      <View style={styles.options}>
        {exercise.options.map((option, i) => {
          let optionStyle = styles.option;
          if (answered) {
            if (i === exercise.correctIndex) optionStyle = { ...optionStyle, ...styles.optionCorrect };
            else if (i === selected) optionStyle = { ...optionStyle, ...styles.optionWrong };
          }
          return (
            <TouchableOpacity
              key={i}
              disabled={answered}
              onPress={() => setSelected(i)}
              style={[styles.option, optionStyle]}>
              <Text style={styles.optionText}>{option}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {answered && (
        <View style={styles.feedback}>
          <Text style={correct ? styles.feedbackOk : styles.feedbackBad}>
            {correct ? '✨ Correto! +magia' : '💥 Quase! Tente na próxima.'}
          </Text>
          {exercise.explanation && (
            <Text style={styles.explanation}>{exercise.explanation}</Text>
          )}
          <MagicButton title="Continuar" onPress={onAdvance} />
        </View>
      )}
    </View>
  );
}

function CodeView({ exercise, onAdvance }) {
  const [code, setCode] = useState(exercise.starterCode);
  const [output, setOutput] = useState(null);
  const [error, setError] = useState(null);
  const [running, setRunning] = useState(false);
  const [passed, setPassed] = useState(false);

  const handleRun = async () => {
    setRunning(true);
    setOutput(null);
    setError(null);
    const result = await runCode(
      { language: exercise.language, code },
      { output: exercise.expectedOutput, keywords: exercise.requiredKeywords },
    );
    setRunning(false);
    setPassed(result.passed);
    if (result.stdout) setOutput(result.stdout);
    if (result.stderr) setError(result.stderr);
  };

  return (
    <View>
      <Text style={styles.prompt}>{exercise.prompt}</Text>
      <Text style={styles.instructions}>{exercise.instructions}</Text>

      <View style={styles.editorWrap}>
        <TextInput
          value={code}
          onChangeText={setCode}
          multiline
          autoCapitalize="none"
          autoCorrect={false}
          style={styles.editor}
        />
      </View>

      <MagicButton
        title={running ? 'Executando...' : '▶ Executar código'}
        onPress={handleRun}
        loading={running}
      />

      {(output || error) && (
        <View style={[styles.console, error ? styles.consoleError : styles.consoleOk]}>
          {error ? (
            <Text style={styles.consoleErrText}>{error}</Text>
          ) : (
            <Text style={styles.consoleText}>{output}</Text>
          )}
        </View>
      )}

      {passed && <MagicButton title="Continuar" onPress={onAdvance} />}
    </View>
  );
}

function CompletionView({ lessonTitle, points, onDone }) {
  return (
    <GradientBackground variant="auth">
      <SafeAreaView style={styles.completion}>
        <Text style={styles.completionEmoji}>🎉</Text>
        <Text style={styles.completionTitle}>Lição concluída!</Text>
        <Text style={styles.completionLesson}>{lessonTitle}</Text>
        <LinearGradient
          colors={['#FACC15', '#F59E0B']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.reward, shadow.glowPurple]}>
          <Text style={styles.rewardText}>⚡ +{points} pontos</Text>
        </LinearGradient>
        <MagicButton title="Voltar à trilha" onPress={onDone} />
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm },
  backBtn: { marginBottom: spacing.sm },
  backText: { color: colors.primaryLight, fontSize: typography.subheading, fontWeight: '600' },
  progressHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  progressLabel: { color: colors.textMuted, fontSize: typography.caption, fontWeight: '600' },
  body: { padding: spacing.lg, paddingBottom: spacing.xxl },
  prompt: {
    color: colors.text,
    fontSize: typography.heading,
    fontWeight: '700',
    marginBottom: spacing.xl,
    lineHeight: 28,
  },
  options: { gap: spacing.md },
  option: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: spacing.lg,
  },
  optionCorrect: { borderColor: colors.success, backgroundColor: '#0F2E24' },
  optionWrong: { borderColor: colors.danger, backgroundColor: '#2E1420' },
  optionText: { color: colors.text, fontSize: typography.body },
  feedback: { marginTop: spacing.xl, gap: spacing.md },
  feedbackOk: { color: colors.success, fontSize: typography.subheading, fontWeight: '700' },
  feedbackBad: { color: colors.danger, fontSize: typography.subheading, fontWeight: '700' },
  explanation: { color: colors.textMuted, fontSize: typography.caption },
  instructions: {
    color: colors.textMuted,
    fontSize: typography.caption,
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  editorWrap: {
    backgroundColor: '#0D0820',
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
    overflow: 'hidden',
  },
  editor: {
    color: colors.text,
    fontFamily: 'monospace',
    fontSize: typography.caption,
    padding: spacing.lg,
    minHeight: 160,
    textAlignVertical: 'top',
  },
  console: {
    marginTop: spacing.lg,
    borderRadius: radii.md,
    padding: spacing.lg,
    borderWidth: 1,
  },
  consoleOk: { borderColor: colors.success, backgroundColor: '#0F2E24' },
  consoleError: { borderColor: colors.danger, backgroundColor: '#2E1420' },
  consoleText: { color: colors.success, fontFamily: 'monospace', fontSize: typography.caption },
  consoleErrText: { color: colors.danger, fontFamily: 'monospace', fontSize: typography.caption },
  completion: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.md,
  },
  completionEmoji: { fontSize: 80 },
  completionTitle: { color: colors.text, fontSize: typography.title, fontWeight: '700' },
  completionLesson: { color: colors.textMuted, fontSize: typography.body, marginBottom: spacing.lg },
  reward: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radii.pill,
    marginBottom: spacing.xl,
  },
  rewardText: { color: colors.black, fontWeight: '700', fontSize: typography.subheading },
});
