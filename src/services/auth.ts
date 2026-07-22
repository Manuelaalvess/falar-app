import {
  type ApplicationVerifier,
  type ConfirmationResult,
  type User,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  signInWithPhoneNumber,
  signOut as firebaseSignOut,
  updateProfile,
} from 'firebase/auth';

import { auth } from './firebase';

export function toE164BR(rawPhone: string): string {
  const digits = rawPhone.replace(/\D/g, '');
  if (rawPhone.trim().startsWith('+')) return `+${digits}`;
  return `+55${digits}`;
}

export function sendVerificationCode(
  phone: string,
  recaptchaVerifier: ApplicationVerifier,
): Promise<ConfirmationResult> {
  return signInWithPhoneNumber(auth, toE164BR(phone), recaptchaVerifier);
}

export async function confirmVerificationCode(
  confirmation: ConfirmationResult,
  code: string,
  displayName: string,
): Promise<User> {
  const credential = await confirmation.confirm(code);
  if (displayName) {
    await updateProfile(credential.user, { displayName });
  }
  return credential.user;
}

export async function updatePatientName(displayName: string): Promise<void> {
  if (!auth.currentUser) return;
  await updateProfile(auth.currentUser, { displayName });
}

export function onAuthStateChanged(callback: (user: User | null) => void): () => void {
  return firebaseOnAuthStateChanged(auth, callback);
}

export function signOut(): Promise<void> {
  return firebaseSignOut(auth);
}
