import { Text, View } from 'react-native';

import { useCommunicationCategories } from '../../hooks/useCommunicationCategories';
import type { CommunicationItem } from '../../types/communication';
import { confirmDestructive } from '../../utils/confirmDestructive';
import { AddCategoryBlock } from './AddCategoryBlock';
import { styles } from './adminStyles';
import { CategoryBlock } from './CategoryBlock';

interface PalavrasTabProps {
  itemsByCategory: Record<string, CommunicationItem[]>;
  onAddCategory: (label: string, emoji: string) => void;
  onRemoveCategory: (categoryKey: string) => void;
  onAddItem: (category: string, name: string, emoji: string) => void;
  onRemoveItem: (itemId: string) => void;
}

export function PalavrasTab({
  itemsByCategory,
  onAddCategory,
  onRemoveCategory,
  onAddItem,
  onRemoveItem,
}: PalavrasTabProps) {
  const categories = useCommunicationCategories();

  return (
    <View>
      <Text style={styles.sectionIntro}>
        Crie categorias personalizadas ou toque numa categoria para adicionar palavras na tela
        Comunicar.
      </Text>

      <AddCategoryBlock onAddCategory={onAddCategory} />

      <Text style={styles.sectionLabel}>Categorias</Text>
      {categories.map((category) => (
        <CategoryBlock
          key={category.key}
          category={category}
          items={itemsByCategory[category.key] ?? []}
          onAddItem={onAddItem}
          onRemoveItem={onRemoveItem}
          collapsible
          removable={category.custom === true}
          onRemoveCategory={
            category.custom
              ? () =>
                  confirmDestructive(
                    'Remover categoria',
                    `Remover "${category.label}" e todas as palavras dentro dela?`,
                    () => onRemoveCategory(category.key),
                  )
              : undefined
          }
        />
      ))}
    </View>
  );
}
