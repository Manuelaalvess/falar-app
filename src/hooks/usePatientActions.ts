import { Alert } from 'react-native';

import { addContact, removeContact } from '../services/emergency';
import { addItem, removeItem } from '../services/items';

interface PatientActions {
  handleAddItem: (category: string, name: string, emoji: string) => Promise<void>;
  handleRemoveItem: (itemId: string) => Promise<void>;
  handleAddContact: (name: string, relation: string, phone: string, emoji: string) => Promise<void>;
  handleRemoveContact: (contactId: string) => Promise<void>;
}

export function usePatientActions(uid: string | null): PatientActions {
  async function handleAddItem(category: string, name: string, emoji: string) {
    if (!uid) return;
    try {
      await addItem(uid, category, name, emoji);
    } catch (error) {
      console.error('Falha ao adicionar item:', error);
      Alert.alert('Não foi possível adicionar', 'Confira sua conexão e tente novamente.');
    }
  }

  async function handleRemoveItem(itemId: string) {
    if (!uid) return;
    try {
      await removeItem(uid, itemId);
    } catch (error) {
      console.error('Falha ao remover item:', error);
      Alert.alert('Não foi possível remover', 'Confira sua conexão e tente novamente.');
    }
  }

  async function handleAddContact(name: string, relation: string, phone: string, emoji: string) {
    if (!uid) return;
    try {
      await addContact(uid, name, relation, phone, emoji);
    } catch (error) {
      console.error('Falha ao adicionar contato:', error);
      Alert.alert('Não foi possível adicionar', 'Confira sua conexão e tente novamente.');
    }
  }

  async function handleRemoveContact(contactId: string) {
    if (!uid) return;
    try {
      await removeContact(uid, contactId);
    } catch (error) {
      console.error('Falha ao remover contato:', error);
      Alert.alert('Não foi possível remover', 'Confira sua conexão e tente novamente.');
    }
  }

  return { handleAddItem, handleRemoveItem, handleAddContact, handleRemoveContact };
}
