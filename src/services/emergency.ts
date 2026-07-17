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

import type { EmergencyContact } from '../types/emergency';
import { firestore } from './firebase';

const DEFAULT_CONTACTS: Omit<EmergencyContact, 'id'>[] = [
  { name: 'Esposa', relation: 'Cônjuge', phone: '', emoji: '👩' },
  { name: 'Filho(a)', relation: 'Filho(a)', phone: '', emoji: '🧑' },
];

function contactsCollection(uid: string) {
  return collection(firestore, 'users', uid, 'emergencyContacts');
}

export function subscribeToContacts(
  uid: string,
  callback: (contacts: EmergencyContact[]) => void,
): Unsubscribe {
  return onSnapshot(contactsCollection(uid), (snapshot) => {
    const contacts: EmergencyContact[] = snapshot.docs.map((docSnap) => {
      const data = docSnap.data() as {
        name: string;
        relation: string;
        phone: string;
        emoji: string;
      };
      return { id: docSnap.id, ...data };
    });
    callback(contacts);
  });
}

export async function addContact(
  uid: string,
  name: string,
  relation: string,
  phone: string,
  emoji: string,
): Promise<void> {
  await addDoc(contactsCollection(uid), {
    name,
    relation,
    phone,
    emoji,
    createdAt: serverTimestamp(),
  });
}

export async function removeContact(uid: string, contactId: string): Promise<void> {
  await deleteDoc(doc(contactsCollection(uid), contactId));
}

export async function seedDefaultContactsIfEmpty(uid: string): Promise<void> {
  const snapshot = await getDocs(contactsCollection(uid));
  if (!snapshot.empty) return;

  const batch = writeBatch(firestore);
  DEFAULT_CONTACTS.forEach((contact) => {
    const ref = doc(contactsCollection(uid));
    batch.set(ref, { ...contact, createdAt: serverTimestamp() });
  });
  await batch.commit();
}
