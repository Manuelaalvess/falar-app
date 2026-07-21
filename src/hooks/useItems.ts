import { useEffect, useState } from 'react';

import { seedDefaultItemsIfEmpty, subscribeToItems } from '../services/items';
import { useAppStore } from '../store/useAppStore';

interface ItemsState {
  loading: boolean;
}

export function useItems(uid: string | null): ItemsState {
  const setItemsByCategory = useAppStore((state) => state.setItemsByCategory);
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
  }, [uid, setItemsByCategory]);

  return { loading };
}
