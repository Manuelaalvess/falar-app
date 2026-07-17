import { useEffect, useState } from 'react';

import { seedDefaultItemsIfEmpty, subscribeToItems } from '../services/items';
import type { CommunicationItem } from '../types/communication';

interface ItemsState {
  itemsByCategory: Record<string, CommunicationItem[]>;
  loading: boolean;
}

export function useItems(uid: string | null): ItemsState {
  const [itemsByCategory, setItemsByCategory] = useState<Record<string, CommunicationItem[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) {
      setItemsByCategory({});
      setLoading(true);
      return;
    }

    setLoading(true);
    seedDefaultItemsIfEmpty(uid).catch((error: unknown) => {
      console.error('Falha ao popular itens padrao:', error);
    });

    const unsubscribe = subscribeToItems(uid, (grouped) => {
      setItemsByCategory(grouped);
      setLoading(false);
    });

    return unsubscribe;
  }, [uid]);

  return { itemsByCategory, loading };
}
