import { memo } from 'react';
import { Pressable, Text, View } from 'react-native';

import { CATEGORY_COLORS } from '../../constants/communication';
import { CATEGORY_TILE_MIN_HEIGHT } from '../../constants/accessibility';
import type { CommunicationCategory } from '../../types/communication';
import type { FontScale } from '../../store/useAppStore';
import { fontSizes, scaledSize } from '../../theme/typography';
import { comunicarStyles as styles } from './comunicarStyles';

interface CategoryGridProps {
  categories: CommunicationCategory[];
  fontScale: FontScale;
  lowLiteracyMode: boolean;
  onOpenCategory: (key: string) => void;
}

export const CategoryGrid = memo(function CategoryGrid({
  categories,
  fontScale,
  lowLiteracyMode,
  onOpenCategory,
}: CategoryGridProps) {
  return (
    <>
      {!lowLiteracyMode ? (
        <Text style={[styles.sectionLabel, { fontSize: scaledSize(fontSizes.label, fontScale) }]}>
          O que você quer dizer?
        </Text>
      ) : null}
      <View style={styles.grid}>
        {categories.map((category) => {
          const categoryColors = CATEGORY_COLORS[category.key];
          return (
            <Pressable
              key={category.key}
              style={({ pressed }) => [
                styles.categoryTile,
                {
                  backgroundColor: categoryColors.background,
                  minHeight: CATEGORY_TILE_MIN_HEIGHT * fontScale,
                },
                pressed && styles.tilePressed,
              ]}
              onPress={() => onOpenCategory(category.key)}
              accessibilityRole="button"
              accessibilityLabel={category.label}
              accessibilityHint="Toque para ver os itens desta categoria"
            >
              <Text style={[styles.tileEmoji, { fontSize: 38 * fontScale }]}>{category.emoji}</Text>
              {!lowLiteracyMode ? (
                <Text
                  style={[
                    styles.tileLabel,
                    { color: categoryColors.foreground, fontSize: 19 * fontScale },
                  ]}
                >
                  {category.label}
                </Text>
              ) : null}
            </Pressable>
          );
        })}
      </View>
    </>
  );
});
