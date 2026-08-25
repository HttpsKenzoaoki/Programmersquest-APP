import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GradientBackground } from '../components/GradientBackground';
import { MagicButton } from '../components/MagicButton';
import { AppTextInput } from '../components/AppTextInput';
import { Sparkles } from '../components/Sparkles';
import { useAuthStore } from '../store/useAuthStore';
import { colors, spacing, typography } from '../theme';

export function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const login = useAuthStore((s) => s.login);
  const loading = useAuthStore((s) => s.loading);

  const handleLogin = async () => {
    setError('');
    if (!email.trim() || !password.trim()) {
      setError('Preencha e-mail e senha.');
      return;
    }
    try {
      await login(email.trim(), password);
    } catch {
      setError('Não foi possível entrar. Tente novamente.');
    }
  };

  return (
    <GradientBackground variant="auth">
      <Sparkles />
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.flex}>
          <View style={styles.header}>
            <Text style={styles.logo}>🔮</Text>
            <Text style={styles.title}>Programmers Quest</Text>
            <Text style={styles.subtitle}>Aprenda a programar como um mago</Text>
          </View>

          <View style={styles.form}>
            <AppTextInput
              label="E-mail"
              placeholder="voce@exemplo.com"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
            />
            <AppTextInput
              label="Senha"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            {!!error && <Text style={styles.error}>{error}</Text>}
            <MagicButton title="Entrar" onPress={handleLogin} loading={loading} />
            <MagicButton
              title="Criar minha conta"
              onPress={() => navigation.navigate('Register')}
              variant="ghost"
            />
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1, justifyContent: 'center', paddingHorizontal: spacing.xl },
  header: { alignItems: 'center', marginBottom: spacing.xxl },
  logo: { fontSize: 72, marginBottom: spacing.md },
  title: {
    color: colors.text,
    fontSize: typography.title,
    fontWeight: '700',
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: typography.body,
    marginTop: spacing.xs,
  },
  form: {},
  error: {
    color: colors.danger,
    fontSize: typography.caption,
    marginBottom: spacing.md,
  },
});
