import * as ImageManipulator from 'expo-image-manipulator';
import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage';

import { storage } from './firebase';

const MAX_DIMENSION = 400;
const JPEG_QUALITY = 0.7;

function itemPhotoRef(uid: string, itemId: string) {
  return ref(storage, `users/${uid}/items/${itemId}.jpg`);
}

export async function uploadItemPhoto(
  uid: string,
  itemId: string,
  localUri: string,
): Promise<string> {
  const manipulated = await ImageManipulator.manipulateAsync(
    localUri,
    [{ resize: { width: MAX_DIMENSION } }],
    { compress: JPEG_QUALITY, format: ImageManipulator.SaveFormat.JPEG },
  );

  const response = await fetch(manipulated.uri);
  const blob = await response.blob();

  const photoRef = itemPhotoRef(uid, itemId);
  await uploadBytes(photoRef, blob);
  return getDownloadURL(photoRef);
}

export async function deleteItemPhoto(uid: string, itemId: string): Promise<void> {
  try {
    await deleteObject(itemPhotoRef(uid, itemId));
  } catch {
    // Sem foto cadastrada para este item; nada a remover.
  }
}

export function generateLocalId(): string {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
}
