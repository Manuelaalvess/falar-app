import { colors } from '../theme/colors';
import type { CommunicationCategory, CommunicationItem } from '../types/communication';

export const CATEGORIES: CommunicationCategory[] = [
  { key: 'preciso', label: 'Preciso de', emoji: '🤲' },
  { key: 'familia', label: 'Família', emoji: '👨‍👩‍👧' },
  { key: 'lugares', label: 'Lugares', emoji: '📍' },
  { key: 'comidas', label: 'Comidas', emoji: '🍽️' },
  { key: 'sentimentos', label: 'Como me sinto', emoji: '💬' },
  { key: 'trabalho', label: 'Trabalho e rotina', emoji: '🧰' },
];

export const CATEGORY_COLORS: Record<string, { background: string; foreground: string }> = {
  preciso: colors.categories.need,
  familia: colors.categories.family,
  lugares: colors.categories.place,
  comidas: colors.categories.food,
  sentimentos: colors.categories.feeling,
  trabalho: colors.categories.work,
};

const CUSTOM_CATEGORY_PALETTE = [
  { background: '#E8F0F8', foreground: '#2A5070' },
  { background: '#F3E5F5', foreground: '#6A3D75' },
  { background: '#FFF3E0', foreground: '#8A5A20' },
  { background: '#E0F2F1', foreground: '#1F5C54' },
  { background: '#FCE4EC', foreground: '#7A3344' },
  { background: '#ECEFF1', foreground: '#37474F' },
] as const;

export const DEFAULT_CATEGORY_KEYS = new Set(CATEGORIES.map((category) => category.key));

export function isDefaultCategoryKey(key: string): boolean {
  return DEFAULT_CATEGORY_KEYS.has(key);
}

export function getCategoryColors(key: string): { background: string; foreground: string } {
  const known = CATEGORY_COLORS[key];
  if (known) return known;

  let hash = 0;
  for (let i = 0; i < key.length; i += 1) {
    hash = (hash + key.charCodeAt(i)) % CUSTOM_CATEGORY_PALETTE.length;
  }
  return CUSTOM_CATEGORY_PALETTE[hash] ?? CUSTOM_CATEGORY_PALETTE[0];
}

export function mergeCategories(customCategories: CommunicationCategory[]): CommunicationCategory[] {
  return [...CATEGORIES, ...customCategories];
}

export const DEFAULT_ITEMS: Record<string, Omit<CommunicationItem, 'id'>[]> = {
  preciso: [
    { name: 'Água', emoji: '💧' },
    { name: 'Banheiro', emoji: '🚻' },
    { name: 'Dor', emoji: '😣' },
    { name: 'Comer', emoji: '🍚' },
    { name: 'Descansar', emoji: '🛌' },
  ],
  familia: [
    { name: 'Esposa', emoji: '👩' },
    { name: 'Filho', emoji: '👦' },
    { name: 'Filha', emoji: '👧' },
    { name: 'Neto(a)', emoji: '🧒' },
  ],
  lugares: [
    { name: 'Igreja', emoji: '⛪' },
    { name: 'Mercado', emoji: '🛒' },
    { name: 'Praça', emoji: '🌳' },
    { name: 'Casa da família', emoji: '🏠' },
  ],
  comidas: [
    { name: 'Feijoada', emoji: '🍲' },
    { name: 'Pão de queijo', emoji: '🧀' },
    { name: 'Café', emoji: '☕' },
    { name: 'Fruta', emoji: '🍌' },
  ],
  sentimentos: [
    { name: 'Feliz', emoji: '🙂' },
    { name: 'Triste', emoji: '😔' },
    { name: 'Cansado', emoji: '😪' },
    { name: 'Frustrado', emoji: '😤' },
    { name: 'Calmo', emoji: '😌' },
  ],
  trabalho: [
    { name: 'Oficina', emoji: '🔧' },
    { name: 'Fazenda', emoji: '🌾' },
    { name: 'Ler jornal', emoji: '📰' },
  ],
};

/** Sim/Não fixos no topo da Comunicar — não aparecem dentro de categorias. */
export const CORE_SIM_ITEM: CommunicationItem = {
  id: 'core-sim',
  name: 'Sim',
  emoji: '👍',
};

export const CORE_NAO_ITEM: CommunicationItem = {
  id: 'core-nao',
  name: 'Não',
  emoji: '👎',
};

export function isCoreResponseItem(item: Pick<CommunicationItem, 'name'>): boolean {
  const normalized = item.name.trim().toLowerCase();
  return normalized === 'sim' || normalized === 'não' || normalized === 'nao';
}

export function withoutCoreResponseItems(items: CommunicationItem[]): CommunicationItem[] {
  return items.filter((item) => !isCoreResponseItem(item));
}

export const EMOJI_CHOICES = [
  '🙂',
  '❤️',
  '⭐',
  '🏠',
  '🚗',
  '🎵',
  '⚽',
  '📖',
  '🌻',
  '🐶',
  '🎂',
  '🧦',
  '☀️',
  '🌙',
  '👍',
  '🙏',
];
