import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  writeBatch,
  type Unsubscribe,
} from 'firebase/firestore';

import type { EmergencyContact, EmergencySosAlert } from '../types/emergency';
import { firestore } from './firebase';
import { writeCache } from './localCache';

export function sosAlertCacheKey(uid: string): string {
  return `falar:lastSosAlert:${uid}`;
}

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

function sosAlertsCollection(uid: string) {
  return collection(firestore, 'users', uid, 'emergencyAlerts');
}

export async function persistEmergencySosAlert(
  uid: string,
  contact: EmergencyContact,
  mapsUrl: string | null,
): Promise<EmergencySosAlert> {
  const alert: EmergencySosAlert = {
    id: `local-${Date.now()}`,
    contactId: contact.id,
    contactName: contact.name,
    mapsUrl,
    timestamp: Date.now(),
  };

  await writeCache(sosAlertCacheKey(uid), alert);

  try {
    const ref = await addDoc(sosAlertsCollection(uid), {
      contactId: contact.id,
      contactName: contact.name,
      mapsUrl,
      createdAt: serverTimestamp(),
    });
    alert.id = ref.id;
  } catch (error) {
    console.error('Falha ao sincronizar SOS no Firestore (sem internet?):', error);
  }

  return alert;
}

export function subscribeToLatestSosAlert(
  uid: string,
  callback: (alert: EmergencySosAlert | null) => void,
): Unsubscribe {
  const alertsQuery = query(sosAlertsCollection(uid), orderBy('createdAt', 'desc'), limit(1));
  return onSnapshot(
    alertsQuery,
    (snapshot) => {
      const docSnap = snapshot.docs[0];
      if (!docSnap) {
        callback(null);
        return;
      }
      const data = docSnap.data() as {
        contactId: string;
        contactName: string;
        mapsUrl: string | null;
        createdAt: Timestamp | null;
      };
      callback({
        id: docSnap.id,
        contactId: data.contactId,
        contactName: data.contactName,
        mapsUrl: data.mapsUrl,
        timestamp: data.createdAt?.toMillis() ?? Date.now(),
      });
    },
    (error) => {
      console.error('Falha ao escutar alertas SOS:', error);
      callback(null);
    },
  );
}
