import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useRef, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { AuthenticatedApp } from './src/components/AuthenticatedApp';
import { AppErrorBoundary } from './src/components/AppErrorBoundary';
import {
  type RecaptchaVerifierHandle,
  RecaptchaVerifierModal,
} from './src/components/RecaptchaVerifierModal';
import { useAccessibilityPrefsCache } from './src/hooks/useAccessibilityPrefsCache';
import { useAppFonts } from './src/hooks/useAppFonts';
import { useAuth } from './src/hooks/useAuth';
import { useEmergencyContacts } from './src/hooks/useEmergencyContacts';
import { useEvolutionEvents } from './src/hooks/useEvolutionEvents';
import { useItems } from './src/hooks/useItems';
import { usePatientActions } from './src/hooks/usePatientActions';
import { usePhoneLoginFlow } from './src/hooks/usePhoneLoginFlow';
import { usePushRegistration } from './src/hooks/usePushRegistration';
import { LoginScreen } from './src/screens/LoginScreen';
import { VerifyCodeScreen } from './src/screens/VerifyCodeScreen';
import { signOut, updatePatientName } from './src/services/auth';
import { getDeviceId } from './src/services/deviceId';
import { firebaseConfig } from './src/services/firebase';
import { removePushToken } from './src/services/pushTokens';
import { colors } from './src/theme/colors';
import { logError } from './src/utils/logError';

SplashScreen.preventAutoHideAsync().catch(() => {
  // Expo Go ou ambiente sem splash nativo.
});

export default function App() {
  const [fontsLoaded] = useAppFonts();
  const { user, initializing } = useAuth();
  const { loading: itemsLoading } = useItems(user?.uid ?? null);
  const { loading: contactsLoading } = useEmergencyContacts(user?.uid ?? null);
  useEvolutionEvents(user?.uid ?? null);
  const comunicarReady = !itemsLoading && !contactsLoading;

  useEffect(() => {
    if (!fontsLoaded || initializing) return;
    if (!user || comunicarReady) {
      SplashScreen.hideAsync().catch(() => undefined);
    }
  }, [fontsLoaded, initializing, user, comunicarReady]);

  usePushRegistration(user?.uid ?? null);
  useAccessibilityPrefsCache();

  const { handleAddItem, handleRemoveItem, handleAddContact, handleRemoveContact } =
    usePatientActions(user?.uid ?? null);

  const recaptchaVerifier = useRef<RecaptchaVerifierHandle>(null);
  const loginFlow = usePhoneLoginFlow(recaptchaVerifier);

  const [patientNameOverride, setPatientNameOverride] = useState<string | null>(null);
  const patientName = patientNameOverride ?? user?.displayName ?? 'Paciente';

  async function handleUpdatePatientName(name: string) {
    const trimmed = name.trim();
    if (!trimmed) return;
    try {
      await updatePatientName(trimmed);
      setPatientNameOverride(trimmed);
    } catch (error) {
      logError('Nome do paciente', error);
      Alert.alert('Não foi possível salvar', 'Confira sua conexão e tente novamente.');
    }
  }

  async function handleSignOut() {
    if (user) {
      const deviceId = await getDeviceId();
      await removePushToken(user.uid, deviceId).catch((error: unknown) => {
        logError('Remoção do token push', error);
      });
    }
    await signOut();
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
            <AuthenticatedApp
              user={user}
              patientName={patientName}
              comunicarReady={comunicarReady}
              onUpdatePatientName={handleUpdatePatientName}
              onAddItem={handleAddItem}
              onRemoveItem={handleRemoveItem}
              onAddContact={handleAddContact}
              onRemoveContact={handleRemoveContact}
              onSignOut={handleSignOut}
            />
          ) : loginFlow.confirmation ? (
            <VerifyCodeScreen
              phone={loginFlow.pendingPhone}
              onConfirm={loginFlow.handleConfirmCode}
              onBack={loginFlow.handleBackToLogin}
              isSubmitting={loginFlow.isSubmitting}
              errorMessage={loginFlow.errorMessage}
            />
          ) : (
            <LoginScreen
              onSubmit={loginFlow.handleLoginSubmit}
              isSubmitting={loginFlow.isSubmitting}
              errorMessage={loginFlow.errorMessage}
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
});
