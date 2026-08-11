import { memo } from 'react';
import { Pressable, Text, View } from 'react-native';

import { ITEM_TILE_MIN_HEIGHT, MIN_TOUCH_TARGET } from '../../constants/accessibility';
import type { CommunicationCategory, CommunicationItem } from '../../types/communication';
import type { FontScale } from '../../store/useAppStore';
import { fontSizes, scaledSize } from '../../theme/typography';
import { comunicarStyles as styles } from './comunicarStyles';

interface ItemGridProps {
  category: CommunicationCategory;
  items: CommunicationItem[];
  fontScale: FontScale;
  lowLiteracyMode: boolean;
  onBack: () => void;
  onChooseItem: (item: CommunicationItem) => void;
}

export const ItemGrid = memo(function ItemGrid({
  category,
  items,
  fontScale,
  lowLiteracyMode,
  onBack,
  onChooseItem,
}: ItemGridProps) {
  return (
    <>
      <View style={styles.backRow}>
        <Pressable
          style={[
            styles.backButton,
            { width: MIN_TOUCH_TARGET * fontScale, height: MIN_TOUCH_TARGET * fontScale },
          ]}
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="Voltar"
          accessibilityHint="Volta para a lista de categorias"
        >
          <Text style={[styles.backButtonLabel, { fontSize: 22 * fontScale }]}>←</Text>
        </Pressable>
        {!lowLiteracyMode ? (
          <Text
            style={[
              styles.sectionLabelInline,
              { fontSize: scaledSize(fontSizes.label, fontScale) },
            ]}
          >
            {category.emoji} {category.label}
          </Text>
        ) : null}
      </View>
      {items.length > 0 ? (
        <View style={styles.grid}>
          {items.map((item) => (
            <Pressable
              key={item.id}
              style={({ pressed }) => [
                styles.itemTile,
                { minHeight: ITEM_TILE_MIN_HEIGHT * fontScale },
                pressed && styles.tilePressed,
              ]}
              onPress={() => onChooseItem(item)}
              accessibilityRole="button"
              accessibilityLabel={item.name}
              accessibilityHint="Toque para falar este item em voz alta"
            >
              <Text style={[styles.tileEmoji, { fontSize: 38 * fontScale }]}>{item.emoji}</Text>
              {!lowLiteracyMode ? (
                <Text style={[styles.itemLabel, { fontSize: 18 * fontScale }]}>{item.name}</Text>
              ) : null}
            </Pressable>
          ))}
        </View>
      ) : (
        <Text style={[styles.emptyText, { fontSize: scaledSize(fontSizes.bodyLarge, fontScale) }]}>
          Nenhum item ainda aqui.{'\n'}Peça para a família adicionar na Área da família.
        </Text>
      )}
    </>
  );
});
