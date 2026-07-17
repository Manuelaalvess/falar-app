import AsyncStorage from '@react-native-async-storage/async-storage';
import { type FirebaseApp, getApps, initializeApp } from 'firebase/app';
import { type Auth, getAuth, getReactNativePersistence, initializeAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

export const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

function assertFirebaseConfig() {
  const missing = Object.entries(firebaseConfig)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    throw new Error(
      `Configuracao do Firebase incompleta. Faltam as variaveis: ${missing.join(', ')}. ` +
        'Verifique o arquivo .env na raiz do projeto (veja .env.example).',
    );
  }
}

assertFirebaseConfig();

export const firebaseApp: FirebaseApp = getApps()[0] ?? initializeApp(firebaseConfig);

export const auth: Auth = getAuthWithPersistence(firebaseApp);

function getAuthWithPersistence(app: FirebaseApp): Auth {
  try {
    return initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch {
    return getAuth(app);
  }
}

export const firestore = getFirestore(firebaseApp);
export const storage = getStorage(firebaseApp);
