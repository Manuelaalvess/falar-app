import { Alert } from 'react-native';

import { addContact, removeContact } from '../services/emergency';
import { addCategory, removeCategory } from '../services/categories';
import { addItem, removeItem } from '../services/items';
import { logError } from '../utils/logError';

interface PatientActions {
  handleAddItem: (category: string, name: string, emoji: string) => Promise<void>;
  handleRemoveItem: (itemId: string) => Promise<void>;
  handleAddCategory: (label: string, emoji: string) => Promise<void>;
  handleRemoveCategory: (categoryKey: string) => Promise<void>;
  handleAddContact: (name: string, relation: string, phone: string, emoji: string) => Promise<void>;
  handleRemoveContact: (contactId: string) => Promise<void>;
}

async function runPatientAction(
  uid: string,
  context: string,
  failureTitle: string,
  action: () => Promise<void>,
): Promise<void> {
  try {
    await action();
  } catch (error) {
    logError(context, error);
    Alert.alert(failureTitle, 'Confira sua conexão e tente novamente.');
  }
}

export function usePatientActions(uid: string | null): PatientActions {
  return {
    handleAddItem: (category, name, emoji) => {
      if (!uid) return Promise.resolve();
      return runPatientAction(uid, 'Adicionar item', 'Não foi possível adicionar', () =>
        addItem(uid, category, name, emoji),
      );
    },
    handleRemoveItem: (itemId) => {
      if (!uid) return Promise.resolve();
      return runPatientAction(uid, 'Remover item', 'Não foi possível remover', () =>
        removeItem(uid, itemId),
      );
    },
    handleAddCategory: (label, emoji) => {
      if (!uid) return Promise.resolve();
      return runPatientAction(uid, 'Adicionar categoria', 'Não foi possível adicionar', () =>
        addCategory(uid, label, emoji),
      );
    },
    handleRemoveCategory: (categoryKey) => {
      if (!uid) return Promise.resolve();
      return runPatientAction(uid, 'Remover categoria', 'Não foi possível remover', () =>
        removeCategory(uid, categoryKey),
      );
    },
    handleAddContact: (name, relation, phone, emoji) => {
      if (!uid) return Promise.resolve();
      return runPatientAction(uid, 'Adicionar contato', 'Não foi possível adicionar', () =>
        addContact(uid, name, relation, phone, emoji),
      );
    },
    handleRemoveContact: (contactId) => {
      if (!uid) return Promise.resolve();
      return runPatientAction(uid, 'Remover contato', 'Não foi possível remover', () =>
        removeContact(uid, contactId),
      );
    },
  };
}
