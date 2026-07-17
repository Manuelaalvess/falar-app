import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { colors } from '../theme/colors';
import { fonts, fontSizes } from '../theme/typography';

export interface LoginFormData {
  name: string;
  phone: string;
}

interface LoginScreenProps {
  onSubmit: (data: LoginFormData) => void;
  isSubmitting?: boolean;
  errorMessage?: string | null;
}

export function LoginScreen({ onSubmit, isSubmitting, errorMessage }: LoginScreenProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const canSubmit = phone.trim().length > 0 && !isSubmitting;

  function handleSubmit() {
    if (!canSubmit) return;
    onSubmit({ name: name.trim(), phone: phone.trim() });
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={styles.icon}>👋</Text>
      <Text style={styles.title}>Vamos configurar o Falar</Text>
      <Text style={styles.subtitle}>
        Digite o número de telefone do familiar responsável. É só uma vez — depois, ao trocar de
        aparelho, use o mesmo número para recuperar tudo.
      </Text>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Nome do paciente (ex: Sr. João)"
          placeholderTextColor={colors.muted}
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
        />
        <TextInput
          style={styles.input}
          placeholder="Telefone (ex: 21 99999-0000)"
          placeholderTextColor={colors.muted}
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          textContentType="telephoneNumber"
        />
        {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
        <Pressable
          style={[styles.button, !canSubmit && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={!canSubmit}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonLabel}>Continuar</Text>
          )}
        </Pressable>
      </View>

      <Text style={styles.note}>
        Vamos enviar um código por SMS para confirmar esse número antes de continuar.
      </Text>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  icon: {
    fontSize: 60,
    marginBottom: 16,
  },
  title: {
    fontFamily: fonts.heading,
    fontSize: fontSizes.heading,
    color: colors.primaryDark,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: fontSizes.bodySmall,
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 320,
    marginBottom: 22,
  },
  form: {
    width: '100%',
    maxWidth: 320,
    gap: 12,
  },
  input: {
    fontFamily: fonts.body,
    fontSize: fontSizes.body,
    padding: 16,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.card,
    color: colors.ink,
  },
  error: {
    fontFamily: fonts.body,
    fontSize: fontSizes.bodySmall,
    color: colors.danger,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonLabel: {
    fontFamily: fonts.heading,
    fontSize: 17,
    color: '#fff',
  },
  note: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.muted,
    marginTop: 16,
    maxWidth: 300,
    textAlign: 'center',
  },
});
