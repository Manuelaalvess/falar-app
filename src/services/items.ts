import {
  addDoc,
  collection,
  deleteDoc,
  deleteField,
  doc,
  getDocs,
  onSnapshot,
  serverTimestamp,
  updateDoc,
  writeBatch,
  type Unsubscribe,
} from 'firebase/firestore';

import { DEFAULT_ITEMS } from '../constants/communication';
import type { CommunicationItem } from '../types/communication';
import { firestore } from './firebase';
import { deleteItemPhoto } from './storage';

function itemsCollection(uid: string) {
  return collection(firestore, 'users', uid, 'items');
}

export function subscribeToItems(
  uid: string,
  callback: (itemsByCategory: Record<string, CommunicationItem[]>) => void,
): Unsubscribe {
  return onSnapshot(itemsCollection(uid), (snapshot) => {
    const grouped: Record<string, CommunicationItem[]> = {};
    snapshot.forEach((docSnap) => {
      const data = docSnap.data() as {
        category: string;
        name: string;
        emoji: string;
        photoUrl?: string;
      };
      const item: CommunicationItem = {
        id: docSnap.id,
        name: data.name,
        emoji: data.emoji,
        photoUrl: data.photoUrl,
      };
      grouped[data.category] = [...(grouped[data.category] ?? []), item];
    });
    callback(grouped);
  });
}

export async function addItem(
  uid: string,
  category: string,
  name: string,
  emoji: string,
  photoUrl?: string,
): Promise<void> {
  await addDoc(itemsCollection(uid), {
    category,
    name,
    emoji,
    ...(photoUrl ? { photoUrl } : {}),
    createdAt: serverTimestamp(),
  });
}

export async function removeItem(uid: string, itemId: string): Promise<void> {
  await deleteDoc(doc(itemsCollection(uid), itemId));
  await deleteItemPhoto(uid, itemId);
}

export async function setItemPhoto(uid: string, itemId: string, photoUrl: string): Promise<void> {
  await updateDoc(doc(itemsCollection(uid), itemId), { photoUrl });
}

export async function clearItemPhoto(uid: string, itemId: string): Promise<void> {
  await updateDoc(doc(itemsCollection(uid), itemId), { photoUrl: deleteField() });
  await deleteItemPhoto(uid, itemId);
}

export async function seedDefaultItemsIfEmpty(uid: string): Promise<void> {
  const snapshot = await getDocs(itemsCollection(uid));
  if (!snapshot.empty) return;

  const batch = writeBatch(firestore);
  Object.entries(DEFAULT_ITEMS).forEach(([category, items]) => {
    items.forEach((item) => {
      const ref = doc(itemsCollection(uid));
      batch.set(ref, {
        category,
        name: item.name,
        emoji: item.emoji,
        createdAt: serverTimestamp(),
      });
    });
  });
  await batch.commit();
}
