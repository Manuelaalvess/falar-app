import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { CATEGORIES, CATEGORY_COLORS } from '../constants/communication';
import { speak } from '../services/speech';
import { colors } from '../theme/colors';
import { fonts, fontSizes } from '../theme/typography';
import type { CommunicationItem } from '../types/communication';

interface ComunicarScreenProps {
  itemsByCategory: Record<string, CommunicationItem[]>;
}

export function ComunicarScreen({ itemsByCategory }: ComunicarScreenProps) {
  const [openCategoryKey, setOpenCategoryKey] = useState<string | null>(null);
  const [confirmedItem, setConfirmedItem] = useState<CommunicationItem | null>(null);

  useEffect(() => {
    if (!confirmedItem) return;
    const timeout = setTimeout(() => setConfirmedItem(null), 1600);
    return () => clearTimeout(timeout);
  }, [confirmedItem]);

  function handleChooseItem(item: CommunicationItem) {
    speak(item.name);
    setConfirmedItem(item);
  }

  const openCategory = CATEGORIES.find((category) => category.key === openCategoryKey);
  const items = openCategoryKey ? (itemsByCategory[openCategoryKey] ?? []) : [];

  return (
    <View style={styles.container}>
      {!openCategory ? (
        <>
          <Text style={styles.sectionLabel}>O que você quer dizer?</Text>
          <View style={styles.grid}>
            {CATEGORIES.map((category) => {
              const categoryColors = CATEGORY_COLORS[category.key];
              return (
                <Pressable
                  key={category.key}
                  style={[styles.categoryTile, { backgroundColor: categoryColors.background }]}
                  onPress={() => setOpenCategoryKey(category.key)}
                >
                  <Text style={styles.tileEmoji}>{category.emoji}</Text>
                  <Text style={[styles.tileLabel, { color: categoryColors.foreground }]}>
                    {category.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </>
      ) : (
        <>
          <View style={styles.backRow}>
            <Pressable style={styles.backButton} onPress={() => setOpenCategoryKey(null)}>
              <Text style={styles.backButtonLabel}>←</Text>
            </Pressable>
            <Text style={styles.sectionLabelInline}>
              {openCategory.emoji} {openCategory.label}
            </Text>
          </View>
          {items.length > 0 ? (
            <View style={styles.grid}>
              {items.map((item) => (
                <Pressable
                  key={item.id}
                  style={styles.itemTile}
                  onPress={() => handleChooseItem(item)}
                >
                  <Text style={styles.tileEmoji}>{item.emoji}</Text>
                  <Text style={styles.itemLabel}>{item.name}</Text>
                </Pressable>
              ))}
            </View>
          ) : (
            <Text style={styles.emptyText}>
              Nenhum item ainda aqui.{'\n'}Peça para a família adicionar na Área da família.
            </Text>
          )}
        </>
      )}

      {confirmedItem ? (
        <View style={styles.confirmOverlay}>
          <View style={styles.confirmCard}>
            <Text style={styles.confirmEmoji}>{confirmedItem.emoji}</Text>
            <Text style={styles.confirmLabel}>{confirmedItem.name}</Text>
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 18,
  },
  sectionLabel: {
    fontFamily: fonts.headingBold,
    fontSize: fontSizes.label,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    color: colors.muted,
    marginBottom: 12,
  },
  sectionLabelInline: {
    fontFamily: fonts.headingBold,
    fontSize: fontSizes.label,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    color: colors.muted,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  categoryTile: {
    width: '47%',
    minHeight: 120,
    borderRadius: 22,
    padding: 22,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  itemTile: {
    width: '47%',
    minHeight: 110,
    borderRadius: 20,
    padding: 14,
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  tileEmoji: {
    fontSize: 34,
  },
  tileLabel: {
    fontFamily: fonts.heading,
    fontSize: 17,
    textAlign: 'center',
  },
  itemLabel: {
    fontFamily: fonts.heading,
    fontSize: 16,
    color: colors.ink,
    textAlign: 'center',
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonLabel: {
    fontSize: 22,
    color: colors.ink,
  },
  emptyText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.bodyLarge,
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 24,
    paddingVertical: 40,
  },
  confirmOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(38, 42, 46, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmCard: {
    backgroundColor: '#fff',
    borderRadius: 26,
    paddingVertical: 40,
    paddingHorizontal: 30,
    alignItems: 'center',
    gap: 14,
    maxWidth: 320,
  },
  confirmEmoji: {
    fontSize: 64,
  },
  confirmLabel: {
    fontFamily: fonts.headingBold,
    fontSize: 24,
    color: colors.primaryDark,
  },
});
