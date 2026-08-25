import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { GradientBackground } from '../components/GradientBackground';
import { MagicButton } from '../components/MagicButton';
import { AppTextInput } from '../components/AppTextInput';
import { useAuthStore } from '../store/useAuthStore';
import { mockApi } from '../services/mockApi';
import { colors, spacing, typography } from '../theme';

const SUBJECTS = ['🐛 Reportar bug', '💡 Sugestão', '❓ Dúvida', '👏 Elogio', '⚙️ Outro'];

export function ContactScreen() {
  const navigation = useNavigation();
  const user = useAuthStore((s) => s.user);

  const [subject, setSubject] = useState(null);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!subject || !message.trim()) {
      Alert.alert('Atenção', 'Escolha um assunto e escreva sua mensagem.');
      return;
    }
    setSending(true);
    try {
      await mockApi.sendContact({
        userId: user?.id ?? 'anon',
        subject,
        message: message.trim(),
      });
      setSending(false);
      Alert.alert('Mensagem enviada! ✨', 'Obrigado pelo contato. Responderemos em breve.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch {
      setSending(false);
      Alert.alert('Erro', 'Não foi possível enviar. Tente novamente.');
    }
  };

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backText}>‹ Voltar</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Fale conosco</Text>
          <Text style={styles.subtitle}>Tem algo para nos contar? Adoraríamos ouvir!</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Text style={styles.label}>Assunto</Text>
          <View style={styles.chips}>
            {SUBJECTS.map((s) => (
              <TouchableOpacity
                key={s}
                onPress={() => setSubject(s)}
                style={[styles.chip, subject === s && styles.chipSelected]}>
                <Text style={[styles.chipText, subject === s && styles.chipTextSelected]}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <AppTextInput
            label="Mensagem"
            placeholder="Descreva o que aconteceu ou a sua ideia..."
            value={message}
            onChangeText={setMessage}
            multiline
          />

          <MagicButton title="Enviar mensagem" onPress={handleSend} loading={sending} />
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm },
  backBtn: { marginBottom: spacing.sm },
  backText: { color: colors.primaryLight, fontSize: typography.subheading, fontWeight: '600' },
  title: { color: colors.text, fontSize: typography.title, fontWeight: '700' },
  subtitle: { color: colors.textMuted, fontSize: typography.caption, marginTop: spacing.xs },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
  label: {
    color: colors.textMuted,
    fontSize: typography.caption,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.xl },
  chip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipSelected: { borderColor: colors.primary, backgroundColor: colors.primary },
  chipText: { color: colors.textMuted, fontSize: typography.caption },
  chipTextSelected: { color: colors.white, fontWeight: '700' },
});
