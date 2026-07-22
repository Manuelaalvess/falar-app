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

import { DEFAULT_ITEMS } from '../constants/communication';
import type { CommunicationItem } from '../types/communication';
import { deleteRecording } from './audioRecordings';
import { firestore } from './firebase';
import { deleteRecordingFromCloud } from './voiceStorage';

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
  void deleteRecordingFromCloud(uid, itemId);
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
