import { collection, deleteDoc, doc, getDocs, serverTimestamp, setDoc } from 'firebase/firestore';

import { firestore } from './firebase';

function devicesCollection(uid: string) {
  return collection(firestore, 'users', uid, 'devices');
}

export async function registerPushToken(
  uid: string,
  deviceId: string,
  token: string,
): Promise<void> {
  await setDoc(doc(devicesCollection(uid), deviceId), {
    token,
    updatedAt: serverTimestamp(),
  });
}

export async function removePushToken(uid: string, deviceId: string): Promise<void> {
  await deleteDoc(doc(devicesCollection(uid), deviceId));
}

/** Tokens de todos os outros aparelhos logados na conta (exclui o aparelho que esta chamando). */
export async function getOtherDeviceTokens(
  uid: string,
  currentDeviceId: string,
): Promise<string[]> {
  const snapshot = await getDocs(devicesCollection(uid));
  return snapshot.docs
    .filter((docSnap) => docSnap.id !== currentDeviceId)
    .map((docSnap) => (docSnap.data() as { token: string }).token)
    .filter((token) => typeof token === 'string' && token.length > 0);
}
