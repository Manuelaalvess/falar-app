import { colors } from '../theme/colors';
import type { CommunicationCategory, CommunicationItem } from '../types/communication';

export const CATEGORIES: CommunicationCategory[] = [
  { key: 'preciso', label: 'Preciso de', emoji: '🤲' },
];

export const CATEGORY_COLORS: Record<string, { background: string; foreground: string }> = {
  preciso: colors.categories.need,
};

export const DEFAULT_ITEMS: Record<string, CommunicationItem[]> = {
  preciso: [
    { id: 'agua', name: 'Água', emoji: '💧' },
    { id: 'banheiro', name: 'Banheiro', emoji: '🚻' },
  ],
};
