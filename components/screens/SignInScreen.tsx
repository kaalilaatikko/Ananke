import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { COLORS } from '../theme/theme';

type Props = {
  error: string | null;
  onSignIn: (email: string, password: string) => Promise<boolean>;
};

export default function SignInScreen({ error, onSignIn }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function submit() {
    if (!email.trim() || !password) {
      setFormError('Anna sähköpostiosoite ja salasana.');
      return;
    }

    setSubmitting(true);
    setFormError(null);
    try {
      await onSignIn(email, password);
    } finally {
      setSubmitting(false);
    }
  }

  const message = formError ?? error;

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <View style={styles.brandMark}>
        <Text style={styles.brandMarkText}>A</Text>
      </View>
      <Text style={styles.brand}>ANANKE</Text>
      <Text style={styles.caption}>YOUR DAILY QUEST</Text>
      <View style={styles.form}>
        <Text style={styles.heading}>Kirjaudu sisään</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="Sähköposti"
          placeholderTextColor={COLORS.muted}
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          textContentType="emailAddress"
          accessibilityLabel="Sähköpostiosoite"
          editable={!submitting}
          returnKeyType="next"
        />
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="Salasana"
          placeholderTextColor={COLORS.muted}
          autoCapitalize="none"
          autoComplete="current-password"
          textContentType="password"
          secureTextEntry
          accessibilityLabel="Salasana"
          editable={!submitting}
          returnKeyType="go"
          onSubmitEditing={() => void submit()}
        />
        {message && <Text style={styles.error}>{message}</Text>}
        <Pressable
          style={[styles.button, submitting && styles.buttonDisabled]}
          onPress={() => void submit()}
          disabled={submitting}
          accessibilityRole="button"
        >
          <Text style={styles.buttonText}>
            {submitting ? 'Kirjaudutaan...' : 'Kirjaudu'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: COLORS.background,
  },
  brandMark: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.accent,
  },
  brandMarkText: {
    color: COLORS.background,
    fontSize: 32,
    fontWeight: '900',
  },
  brand: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 3,
    marginTop: 13,
  },
  caption: {
    color: COLORS.muted,
    fontSize: 9,
    letterSpacing: 2,
    marginTop: 5,
  },
  form: {
    width: '100%',
    maxWidth: 420,
    marginTop: 34,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  heading: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 18,
  },
  input: {
    minHeight: 48,
    marginTop: 10,
    paddingHorizontal: 13,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    color: COLORS.text,
    backgroundColor: COLORS.background,
    fontSize: 15,
  },
  error: {
    color: '#FFC2BA',
    fontSize: 13,
    lineHeight: 19,
    marginTop: 12,
  },
  button: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
    borderRadius: 10,
    backgroundColor: COLORS.accent,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: COLORS.background,
    fontSize: 15,
    fontWeight: '700',
  },
});
