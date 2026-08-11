import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';

import { colors } from '../theme/colors';
import { authScreenStyles as styles } from './authScreenStyles';

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
        Digite o número de telefone do familiar responsável. É só uma vez. Depois, ao trocar de
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
