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

export const DEFAULT_ITEMS: Record<string, Omit<CommunicationItem, 'id'>[]> = {
  preciso: [
    { name: 'Água', emoji: '💧' },
    { name: 'Banheiro', emoji: '🚻' },
    { name: 'Dor', emoji: '😣' },
    { name: 'Comer', emoji: '🍚' },
    { name: 'Descansar', emoji: '🛌' },
    { name: 'Sim', emoji: '✅' },
    { name: 'Não', emoji: '❌' },
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
