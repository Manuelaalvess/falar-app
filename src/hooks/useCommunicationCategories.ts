import { useMemo } from 'react';

import { CATEGORIES, mergeCategories } from '../constants/communication';
import { useAppStore } from '../store/useAppStore';

export function useCommunicationCategories() {
  const customCategories = useAppStore((state) => state.customCategories);

  return useMemo(() => mergeCategories(customCategories), [customCategories]);
}

export function usePrecisoCategory() {
  return CATEGORIES.find((category) => category.key === 'preciso');
}
