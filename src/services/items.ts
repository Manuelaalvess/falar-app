import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  serverTimestamp,
  writeBatch,
  type Unsubscribe,
} from 'firebase/firestore';

import { DEFAULT_ITEMS, isCoreResponseItem } from '../constants/communication';
import type { CommunicationItem } from '../types/communication';
import { deleteRecording } from './audioRecordings';
import { firestore } from './firebase';

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
      };
      const item: CommunicationItem = {
        id: docSnap.id,
        name: data.name,
        emoji: data.emoji,
      };
      if (isCoreResponseItem(item)) return;
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
): Promise<void> {
  await addDoc(itemsCollection(uid), {
    category,
    name,
    emoji,
    createdAt: serverTimestamp(),
  });
}

export async function removeItem(uid: string, itemId: string): Promise<void> {
  await deleteDoc(doc(itemsCollection(uid), itemId));
  deleteRecording(itemId);
}

export async function removeLegacyCoreResponseItems(uid: string): Promise<void> {
  const snapshot = await getDocs(itemsCollection(uid));
  const deletions = snapshot.docs.filter((docSnap) => {
    const data = docSnap.data() as { name: string };
    return isCoreResponseItem({ name: data.name });
  });

  if (deletions.length === 0) return;

  const batch = writeBatch(firestore);
  deletions.forEach((docSnap) => {
    batch.delete(docSnap.ref);
    deleteRecording(docSnap.id);
  });
  await batch.commit();
}

export async function syncDefaultItems(uid: string): Promise<void> {
  await seedDefaultItemsIfEmpty(uid);
  await removeLegacyCoreResponseItems(uid);
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
