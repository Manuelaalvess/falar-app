import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage';

import { storage } from './firebase';

function recordingRef(uid: string, itemId: string) {
  return ref(storage, `users/${uid}/recordings/${itemId}.m4a`);
}

export async function uploadRecording(
  uid: string,
  itemId: string,
  localUri: string,
): Promise<void> {
  const response = await fetch(localUri);
  const blob = await response.blob();
  await uploadBytes(recordingRef(uid, itemId), blob);
}

export async function downloadRecordingUrl(uid: string, itemId: string): Promise<string | null> {
  try {
    return await getDownloadURL(recordingRef(uid, itemId));
  } catch {
    return null;
  }
}

export async function deleteRecordingFromCloud(uid: string, itemId: string): Promise<void> {
  try {
    await deleteObject(recordingRef(uid, itemId));
  } catch {
    // Sem gravacao na nuvem para este item; nada a remover.
  }
}
