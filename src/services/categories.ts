import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  where,
  writeBatch,
  type Unsubscribe,
} from 'firebase/firestore';

import { isDefaultCategoryKey } from '../constants/communication';
import type { CommunicationCategory } from '../types/communication';
import { deleteRecording } from './audioRecordings';
import { firestore } from './firebase';

function categoriesCollection(uid: string) {
  return collection(firestore, 'users', uid, 'categories');
}

function itemsCollection(uid: string) {
  return collection(firestore, 'users', uid, 'items');
}

export function subscribeToCategories(
  uid: string,
  callback: (categories: CommunicationCategory[]) => void,
): Unsubscribe {
  return onSnapshot(categoriesCollection(uid), (snapshot) => {
    const categories = snapshot.docs
      .map((docSnap) => {
        const data = docSnap.data() as { key: string; label: string; emoji: string };
        return {
          key: data.key || docSnap.id,
          label: data.label,
          emoji: data.emoji,
          custom: true,
        } satisfies CommunicationCategory;
      })
      .sort((a, b) => a.label.localeCompare(b.label, 'pt-BR'));
    callback(categories);
  });
}

export async function addCategory(uid: string, label: string, emoji: string): Promise<void> {
  const ref = doc(categoriesCollection(uid));
  await setDoc(ref, {
    key: ref.id,
    label: label.trim(),
    emoji,
    createdAt: serverTimestamp(),
  });
}

export async function removeCategory(uid: string, categoryKey: string): Promise<void> {
  if (isDefaultCategoryKey(categoryKey)) {
    throw new Error('Categorias padrão não podem ser removidas.');
  }

  const itemsSnapshot = await getDocs(
    query(itemsCollection(uid), where('category', '==', categoryKey)),
  );

  const batch = writeBatch(firestore);
  itemsSnapshot.forEach((itemDoc) => {
    batch.delete(itemDoc.ref);
    deleteRecording(itemDoc.id);
  });
  batch.delete(doc(categoriesCollection(uid), categoryKey));
  await batch.commit();
}
