import { StatusBar } from 'expo-status-bar';
import type { ConfirmationResult } from 'firebase/auth';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { AdminGateModal } from './src/components/AdminGateModal';
import { AppErrorBoundary } from './src/components/AppErrorBoundary';
import { AppHeader } from './src/components/AppHeader';
import {
  type RecaptchaVerifierHandle,
  RecaptchaVerifierModal,
} from './src/components/RecaptchaVerifierModal';
import { useAppDataReady } from './src/hooks/useAppDataReady';
import { useAppFonts } from './src/hooks/useAppFonts';
import { useAuth } from './src/hooks/useAuth';
import { useEmergencyContacts } from './src/hooks/useEmergencyContacts';
import { useEvolutionEvents } from './src/hooks/useEvolutionEvents';
import { useItems } from './src/hooks/useItems';
import { usePatientActions } from './src/hooks/usePatientActions';
import { useVoiceSync } from './src/hooks/useVoiceSync';
import { AdminScreen } from './src/screens/admin/AdminScreen';
import { ComunicarScreen } from './src/screens/ComunicarScreen';
import { type LoginFormData, LoginScreen } from './src/screens/LoginScreen';
import { VerifyCodeScreen } from './src/screens/VerifyCodeScreen';
import {
  confirmVerificationCode,
  sendVerificationCode,
  signOut,
  updatePatientName,
} from './src/services/auth';
import { firebaseConfig } from './src/services/firebase';
import { readCache } from './src/services/localCache';
import {
  FONT_SCALE_CACHE_KEY,
  type FontScale,
  SWITCH_SCANNING_CACHE_KEY,
  useAppStore,
} from './src/store/useAppStore';
import { colors } from './src/theme/colors';

export default function App() {
  const [fontsLoaded] = useAppFonts();
  const { user, initializing } = useAuth();
  const { loading: itemsLoading } = useItems(user?.uid ?? null);
  const { loading: contactsLoading } = useEmergencyContacts(user?.uid ?? null);
  const { loading: eventsLoading } = useEvolutionEvents(user?.uid ?? null);
  const appDataReady = useAppDataReady(itemsLoading, contactsLoading, eventsLoading);
  useVoiceSync(user?.uid ?? null);
  const { handleAddItem, handleRemoveItem, handleAddContact, handleRemoveContact } =
    usePatientActions(user?.uid ?? null);
  const showAdmin = useAppStore((state) => state.showAdmin);
  const setShowAdmin = useAppStore((state) => state.setShowAdmin);
  const setFontScale = useAppStore((state) => state.setFontScale);
  const setSwitchScanningEnabled = useAppStore((state) => state.setSwitchScanningEnabled);
  const recaptchaVerifier = useRef<RecaptchaVerifierHandle>(null);

  useEffect(() => {
    readCache<FontScale>(FONT_SCALE_CACHE_KEY).then((cached) => {
      if (cached) setFontScale(cached);
    });
    readCache<boolean>(SWITCH_SCANNING_CACHE_KEY).then((cached) => {
      if (cached) setSwitchScanningEnabled(cached);
    });
  }, [setFontScale, setSwitchScanningEnabled]);

  const [patientNameOverride, setPatientNameOverride] = useState<string | null>(null);
  const patientName = patientNameOverride ?? user?.displayName ?? 'Paciente';

  async function handleUpdatePatientName(name: string) {
    const trimmed = name.trim();
    if (!trimmed) return;
    try {
      await updatePatientName(trimmed);
      setPatientNameOverride(trimmed);
    } catch (error) {
      console.error('Falha ao atualizar nome do paciente:', error);
      Alert.alert('Não foi possível salvar', 'Confira sua conexão e tente novamente.');
    }
  }

  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null);
  const [pendingName, setPendingName] = useState('');
  const [pendingPhone, setPendingPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showAdminGate, setShowAdminGate] = useState(false);

  async function handleLoginSubmit({ name, phone }: LoginFormData) {
    if (!recaptchaVerifier.current) return;
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const result = await sendVerificationCode(phone, recaptchaVerifier.current);
      setConfirmation(result);
      setPendingName(name);
      setPendingPhone(phone);
    } catch (error) {
      console.error('Falha ao enviar codigo de verificacao:', error);
      setErrorMessage('Não foi possível enviar o código. Confira o número e tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleConfirmCode(code: string) {
    if (!confirmation) return;
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      await confirmVerificationCode(confirmation, code, pendingName);
    } catch (error) {
      console.error('Falha ao confirmar codigo:', error);
      setErrorMessage('Código incorreto. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleBackToLogin() {
    setConfirmation(null);
    setErrorMessage(null);
  }

  if (!fontsLoaded || initializing) {
    return (
      <SafeAreaProvider>
        <View style={styles.container} />
      </SafeAreaProvider>
    );
  }

  return (
    <AppErrorBoundary>
      <SafeAreaProvider>
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
          <RecaptchaVerifierModal
            ref={recaptchaVerifier}
            firebaseConfig={firebaseConfig}
            title="Verificação de segurança"
            cancelLabel="Cancelar"
          />
          {user ? (
            !appDataReady ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color={colors.primary} size="large" />
              </View>
            ) : showAdmin ? (
              <AdminScreen
                uid={user.uid}
                patientName={patientName}
                onUpdatePatientName={handleUpdatePatientName}
                onAddItem={handleAddItem}
                onRemoveItem={handleRemoveItem}
                onAddContact={handleAddContact}
                onRemoveContact={handleRemoveContact}
                onClose={() => setShowAdmin(false)}
                onSignOut={signOut}
              />
            ) : (
              <>
                <AppHeader rightLabel="⚙️ Família" onRightPress={() => setShowAdminGate(true)} />
                <ComunicarScreen uid={user.uid} />
                <AdminGateModal
                  visible={showAdminGate}
                  uid={user.uid}
                  onSuccess={() => {
                    setShowAdminGate(false);
                    setShowAdmin(true);
                  }}
                  onCancel={() => setShowAdminGate(false)}
                />
              </>
            )
          ) : confirmation ? (
            <VerifyCodeScreen
              phone={pendingPhone}
              onConfirm={handleConfirmCode}
              onBack={handleBackToLogin}
              isSubmitting={isSubmitting}
              errorMessage={errorMessage}
            />
          ) : (
            <LoginScreen
              onSubmit={handleLoginSubmit}
              isSubmitting={isSubmitting}
              errorMessage={errorMessage}
            />
          )}
          <StatusBar style="dark" />
        </SafeAreaView>
      </SafeAreaProvider>
    </AppErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
