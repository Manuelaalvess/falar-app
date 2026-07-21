import * as Crypto from 'expo-crypto';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';

function pinKey(uid: string): string {
  return `falar_admin_pin_${uid}`;
}

function biometricPreferenceKey(uid: string): string {
  return `falar_admin_biometric_${uid}`;
}

async function hashPin(pin: string): Promise<string> {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, pin);
}

export async function hasPinConfigured(uid: string): Promise<boolean> {
  const stored = await SecureStore.getItemAsync(pinKey(uid));
  return stored !== null;
}

export async function setPin(uid: string, pin: string): Promise<void> {
  const hash = await hashPin(pin);
  await SecureStore.setItemAsync(pinKey(uid), hash);
}

export async function verifyPin(uid: string, pin: string): Promise<boolean> {
  const stored = await SecureStore.getItemAsync(pinKey(uid));
  if (!stored) return false;
  const hash = await hashPin(pin);
  return hash === stored;
}

export async function isBiometricAvailable(): Promise<boolean> {
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  const isEnrolled = await LocalAuthentication.isEnrolledAsync();
  return hasHardware && isEnrolled;
}

export async function authenticateWithBiometrics(): Promise<boolean> {
  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: 'Confirme sua identidade',
    cancelLabel: 'Cancelar',
    disableDeviceFallback: true,
  });
  return result.success;
}

export async function getBiometricPreference(uid: string): Promise<boolean> {
  const stored = await SecureStore.getItemAsync(biometricPreferenceKey(uid));
  return stored === 'true';
}

export async function setBiometricPreference(uid: string, enabled: boolean): Promise<void> {
  await SecureStore.setItemAsync(biometricPreferenceKey(uid), enabled ? 'true' : 'false');
}
