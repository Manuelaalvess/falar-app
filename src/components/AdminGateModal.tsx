import { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import {
  authenticateWithBiometrics,
  getBiometricPreference,
  hasPinConfigured,
  isBiometricAvailable,
  setPin,
  verifyPin,
} from '../services/adminSecurity';
import { colors } from '../theme/colors';
import { fonts, fontSizes } from '../theme/typography';

interface AdminGateModalProps {
  visible: boolean;
  uid: string;
  /** 'unlock': fluxo normal (biometria/PIN, cria PIN no primeiro acesso). 'change': forca criar um PIN novo. */
  mode?: 'unlock' | 'change';
  onSuccess: () => void;
  onCancel: () => void;
}

type Step = 'loading' | 'pin' | 'setupPin' | 'setupPinConfirm';

export function AdminGateModal({
  visible,
  uid,
  mode = 'unlock',
  onSuccess,
  onCancel,
}: AdminGateModalProps) {
  const [step, setStep] = useState<Step>('loading');
  const [pinValue, setPinValue] = useState('');
  const [firstPinValue, setFirstPinValue] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) {
      setStep('loading');
      setPinValue('');
      setFirstPinValue('');
      setErrorMessage(null);
      return;
    }

    let cancelled = false;

    async function start() {
      if (mode === 'change') {
        setStep('setupPin');
        return;
      }

      const configured = await hasPinConfigured(uid);
      if (cancelled) return;
      if (!configured) {
        setStep('setupPin');
        return;
      }

      const biometricEnabled = await getBiometricPreference(uid);
      const biometricAvailable = biometricEnabled && (await isBiometricAvailable());
      if (cancelled) return;

      if (biometricAvailable) {
        const success = await authenticateWithBiometrics();
        if (cancelled) return;
        if (success) {
          onSuccess();
          return;
        }
      }
      setStep('pin');
    }

    start();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, uid, mode]);

  function handlePinChange(text: string) {
    setErrorMessage(null);
    setPinValue(text.replace(/\D/g, '').slice(0, 4));
  }

  function handleSubmitPin() {
    if (pinValue.length !== 4) return;
    verifyPin(uid, pinValue).then((valid) => {
      if (valid) {
        onSuccess();
      } else {
        setErrorMessage('PIN incorreto. Tente novamente.');
        setPinValue('');
      }
    });
  }

  function handleSetupFirstStep() {
    if (pinValue.length !== 4) return;
    setFirstPinValue(pinValue);
    setPinValue('');
    setStep('setupPinConfirm');
  }

  function handleSetupConfirmStep() {
    if (pinValue.length !== 4) return;
    if (pinValue !== firstPinValue) {
      setErrorMessage('Os PINs não coincidem. Vamos começar de novo.');
      setPinValue('');
      setFirstPinValue('');
      setStep('setupPin');
      return;
    }
    setPin(uid, pinValue).then(() => {
      onSuccess();
    });
  }

  const isSetup = step === 'setupPin' || step === 'setupPinConfirm';

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          {step === 'loading' ? (
            <Text style={styles.description}>Verificando…</Text>
          ) : (
            <>
              <Text style={styles.title}>
                {step === 'setupPin'
                  ? 'Crie um PIN de 4 dígitos'
                  : step === 'setupPinConfirm'
                    ? 'Confirme o PIN'
                    : 'Digite o PIN da família'}
              </Text>
              {isSetup ? (
                <Text style={styles.description}>
                  {step === 'setupPin'
                    ? 'Esse PIN protege a Área da família contra acessos acidentais.'
                    : 'Digite o mesmo PIN novamente.'}
                </Text>
              ) : null}
              <TextInput
                style={styles.pinInput}
                value={pinValue}
                onChangeText={handlePinChange}
                keyboardType="number-pad"
                secureTextEntry
                maxLength={4}
                autoFocus
              />
              {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
              <Pressable
                style={[styles.primaryButton, pinValue.length !== 4 && styles.buttonDisabled]}
                onPress={
                  step === 'setupPin'
                    ? handleSetupFirstStep
                    : step === 'setupPinConfirm'
                      ? handleSetupConfirmStep
                      : handleSubmitPin
                }
                disabled={pinValue.length !== 4}
              >
                <Text style={styles.primaryButtonLabel}>{isSetup ? 'Continuar' : 'Entrar'}</Text>
              </Pressable>
            </>
          )}
          <Pressable style={styles.cancelButton} onPress={onCancel}>
            <Text style={styles.cancelButtonLabel}>Cancelar</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(38, 42, 46, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontFamily: fonts.headingBold,
    fontSize: 20,
    color: colors.primaryDark,
    textAlign: 'center',
  },
  description: {
    fontFamily: fonts.body,
    fontSize: fontSizes.bodySmall,
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 20,
  },
  pinInput: {
    fontFamily: fonts.headingBold,
    fontSize: 28,
    letterSpacing: 10,
    textAlign: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 14,
    paddingVertical: 12,
    width: 160,
    color: colors.ink,
  },
  error: {
    fontFamily: fonts.body,
    fontSize: fontSizes.bodySmall,
    color: colors.danger,
    textAlign: 'center',
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 32,
    alignItems: 'center',
    width: '100%',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  primaryButtonLabel: {
    fontFamily: fonts.headingBold,
    fontSize: 17,
    color: '#fff',
  },
  cancelButton: {
    paddingVertical: 8,
  },
  cancelButtonLabel: {
    fontFamily: fonts.body,
    fontSize: fontSizes.bodySmall,
    color: colors.muted,
    textDecorationLine: 'underline',
  },
});
