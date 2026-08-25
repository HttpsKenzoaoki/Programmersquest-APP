import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GradientBackground } from '../components/GradientBackground';
import { MagicButton } from '../components/MagicButton';
import { AppTextInput } from '../components/AppTextInput';
import { useAuthStore } from '../store/useAuthStore';
import { colors, spacing, typography } from '../theme';

export function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const register = useAuthStore((s) => s.register);
  const loading = useAuthStore((s) => s.loading);

  const handleRegister = async () => {
    setError('');
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Preencha todos os campos.');
      return;
    }
    if (password.length < 6) {
      setError('A senha precisa ter pelo menos 6 caracteres.');
      return;
    }
    try {
      await register({ name: name.trim(), email: email.trim(), password });
    } catch {
      setError('Não foi possível criar a conta. Tente novamente.');
    }
  };

  return (
    <GradientBackground variant="auth">
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.flex}>
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled">
            <Text style={styles.title}>Crie seu mago</Text>
            <Text style={styles.subtitle}>Comece sua jornada no mundo da programação</Text>

            <View style={styles.form}>
              <AppTextInput
                label="Nome de bruxo(a)"
                placeholder="Ex.: Merlin"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
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
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
              {!!error && <Text style={styles.error}>{error}</Text>}
              <MagicButton title="Começar a aventura" onPress={handleRegister} loading={loading} />
              <MagicButton
                title="Já tenho conta"
                onPress={() => navigation.navigate('Login')}
                variant="ghost"
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
  },
  title: { color: colors.text, fontSize: typography.title, fontWeight: '700', textAlign: 'center' },
  subtitle: {
    color: colors.textMuted,
    fontSize: typography.body,
    textAlign: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.xxl,
  },
  form: {},
  error: { color: colors.danger, fontSize: typography.caption, marginBottom: spacing.md },
});
