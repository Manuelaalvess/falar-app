import {
  addDoc,
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  type Unsubscribe,
} from 'firebase/firestore';

import type { CommunicationEvent } from '../types/evolution';
import { firestore } from './firebase';

const MAX_EVENTS = 1000;

function eventsCollection(uid: string) {
  return collection(firestore, 'users', uid, 'events');
}

export async function logEvent(
  uid: string,
  category: string,
  categoryLabel: string,
  itemName: string,
): Promise<void> {
  await addDoc(eventsCollection(uid), {
    category,
    categoryLabel,
    itemName,
    timestamp: serverTimestamp(),
  });
}

export function subscribeToEvents(
  uid: string,
  callback: (events: CommunicationEvent[]) => void,
): Unsubscribe {
  const eventsQuery = query(eventsCollection(uid), orderBy('timestamp', 'desc'), limit(MAX_EVENTS));
  return onSnapshot(eventsQuery, (snapshot) => {
    const events: CommunicationEvent[] = snapshot.docs.map((docSnap) => {
      const data = docSnap.data() as {
        category: string;
        categoryLabel: string;
        itemName: string;
        timestamp: Timestamp | null;
      };
      return {
        id: docSnap.id,
        category: data.category,
        categoryLabel: data.categoryLabel,
        itemName: data.itemName,
        timestamp: data.timestamp?.toMillis() ?? Date.now(),
      };
    });
    callback(events);
  });
}
