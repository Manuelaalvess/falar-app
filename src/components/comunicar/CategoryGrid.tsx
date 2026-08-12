import { memo } from 'react';
import { Pressable, Text, View } from 'react-native';

import { CATEGORY_TILE_COMPACT_MIN_HEIGHT, CATEGORY_TILE_MIN_HEIGHT } from '../../constants/accessibility';
import { getCategoryColors } from '../../constants/communication';
import type { CommunicationCategory } from '../../types/communication';
import type { FontScale } from '../../store/useAppStore';
import { fontSizes, scaledSize } from '../../theme/typography';
import { comunicarStyles as styles } from './comunicarStyles';

interface CategoryGridProps {
  categories: CommunicationCategory[];
  fontScale: FontScale;
  lowLiteracyMode: boolean;
  onOpenCategory: (key: string) => void;
  compact?: boolean;
}

function CategoryTile({
  category,
  fontScale,
  lowLiteracyMode,
  compact,
  onOpenCategory,
}: {
  category: CommunicationCategory;
  fontScale: FontScale;
  lowLiteracyMode: boolean;
  compact: boolean;
  onOpenCategory: (key: string) => void;
}) {
  const categoryColors = getCategoryColors(category.key);
  const tileMinHeight = compact
    ? CATEGORY_TILE_COMPACT_MIN_HEIGHT * fontScale
    : CATEGORY_TILE_MIN_HEIGHT * fontScale;
  const emojiSize = compact ? 30 * fontScale : 38 * fontScale;
  const labelSize = compact ? 16 * fontScale : 19 * fontScale;

  return (
    <Pressable
      style={({ pressed }) => [
        compact ? styles.categoryTileCompact : styles.categoryTile,
        {
          backgroundColor: categoryColors.background,
          minHeight: tileMinHeight,
        },
        pressed && styles.tilePressed,
      ]}
      onPress={() => onOpenCategory(category.key)}
      accessibilityRole="button"
      accessibilityLabel={category.label}
      accessibilityHint="Toque para ver os itens desta categoria"
    >
      <Text style={[styles.tileEmoji, { fontSize: emojiSize }]}>{category.emoji}</Text>
      {!lowLiteracyMode ? (
        <Text
          style={[
            styles.tileLabel,
            { color: categoryColors.foreground, fontSize: labelSize },
          ]}
          numberOfLines={2}
          adjustsFontSizeToFit
          minimumFontScale={0.85}
        >
          {category.label}
        </Text>
      ) : null}
    </Pressable>
  );
}

export const CategoryGrid = memo(function CategoryGrid({
  categories,
  fontScale,
  lowLiteracyMode,
  onOpenCategory,
  compact = false,
}: CategoryGridProps) {
  const sectionLabel = !lowLiteracyMode ? (
    <Text
      style={[
        styles.sectionLabel,
        compact && styles.sectionLabelCompact,
        { fontSize: scaledSize(fontSizes.label, fontScale) },
      ]}
    >
      O que você quer dizer?
    </Text>
  ) : null;

  if (compact) {
    const rows: CommunicationCategory[][] = [];
    for (let index = 0; index < categories.length; index += 2) {
      rows.push(categories.slice(index, index + 2));
    }

    return (
      <>
        {sectionLabel}
        <View style={styles.gridFill}>
          {rows.map((row, index) => (
            <View key={index} style={styles.gridRow}>
              {row.map((category) => (
                <CategoryTile
                  key={category.key}
                  category={category}
                  fontScale={fontScale}
                  lowLiteracyMode={lowLiteracyMode}
                  compact
                  onOpenCategory={onOpenCategory}
                />
              ))}
              {row.length === 1 ? <View style={styles.gridRowSpacer} /> : null}
            </View>
          ))}
        </View>
      </>
    );
  }

  return (
    <>
      {sectionLabel}
      <View style={styles.grid}>
        {categories.map((category) => (
          <CategoryTile
            key={category.key}
            category={category}
            fontScale={fontScale}
            lowLiteracyMode={lowLiteracyMode}
            compact={false}
            onOpenCategory={onOpenCategory}
          />
        ))}
      </View>
    </>
  );
});
