import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { CATEGORIES, EMOJI_CHOICES } from '../constants/communication';
import { colors } from '../theme/colors';
import { fonts, fontSizes } from '../theme/typography';
import type { CommunicationCategory, CommunicationItem } from '../types/communication';

interface AdminScreenProps {
  itemsByCategory: Record<string, CommunicationItem[]>;
  onAddItem: (category: string, name: string, emoji: string) => void;
  onRemoveItem: (itemId: string) => void;
  onClose: () => void;
  onSignOut: () => void;
}

export function AdminScreen({
  itemsByCategory,
  onAddItem,
  onRemoveItem,
  onClose,
  onSignOut,
}: AdminScreenProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={onClose}>
          <Text style={styles.backButtonLabel}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Área da família</Text>
      </View>
      <ScrollView contentContainerStyle={styles.body}>
        <Text style={styles.sectionLabel}>Personalize as categorias que o paciente usa</Text>
        {CATEGORIES.map((category) => (
          <CategoryBlock
            key={category.key}
            category={category}
            items={itemsByCategory[category.key] ?? []}
            onAddItem={onAddItem}
            onRemoveItem={onRemoveItem}
          />
        ))}
        <Pressable style={styles.signOutButton} onPress={onSignOut}>
          <Text style={styles.signOutLabel}>Sair da conta</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

interface CategoryBlockProps {
  category: CommunicationCategory;
  items: CommunicationItem[];
  onAddItem: (category: string, name: string, emoji: string) => void;
  onRemoveItem: (itemId: string) => void;
}

function CategoryBlock({ category, items, onAddItem, onRemoveItem }: CategoryBlockProps) {
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState(EMOJI_CHOICES[0]);

  function handleAdd() {
    const trimmed = name.trim();
    if (!trimmed) return;
    onAddItem(category.key, trimmed, emoji);
    setName('');
  }

  return (
    <View style={styles.block}>
      <Text style={styles.blockTitle}>
        {category.emoji} {category.label}
      </Text>
      {items.length > 0 ? (
        items.map((item) => (
          <View key={item.id} style={styles.itemRow}>
            <Text style={styles.itemEmoji}>{item.emoji}</Text>
            <Text style={styles.itemName}>{item.name}</Text>
            <Pressable onPress={() => onRemoveItem(item.id)}>
              <Text style={styles.deleteLabel}>✕</Text>
            </Pressable>
          </View>
        ))
      ) : (
        <Text style={styles.emptyLabel}>Nenhum item ainda.</Text>
      )}

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.emojiRow}>
        {EMOJI_CHOICES.map((choice) => (
          <Pressable
            key={choice}
            style={[styles.emojiChoice, choice === emoji && styles.emojiChoiceSelected]}
            onPress={() => setEmoji(choice)}
          >
            <Text style={styles.emojiChoiceLabel}>{choice}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <View style={styles.addRow}>
        <TextInput
          style={styles.input}
          placeholder="Nome (ex: Maria, Praia...)"
          placeholderTextColor={colors.muted}
          value={name}
          onChangeText={setName}
        />
        <Pressable style={styles.addButton} onPress={handleAdd}>
          <Text style={styles.addButtonLabel}>Adicionar</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 18,
    paddingVertical: 16,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonLabel: {
    fontSize: 20,
    color: colors.ink,
  },
  headerTitle: {
    fontFamily: fonts.headingMedium,
    fontSize: fontSizes.title,
    color: colors.ink,
  },
  body: {
    padding: 18,
    paddingBottom: 40,
  },
  sectionLabel: {
    fontFamily: fonts.headingBold,
    fontSize: fontSizes.label,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    color: colors.muted,
    marginBottom: 14,
  },
  block: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
  },
  blockTitle: {
    fontFamily: fonts.headingMedium,
    fontSize: 17,
    color: colors.ink,
    marginBottom: 12,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  itemEmoji: {
    fontSize: 22,
  },
  itemName: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: fontSizes.body,
    color: colors.ink,
  },
  deleteLabel: {
    fontSize: 18,
    color: colors.muted,
    paddingHorizontal: 6,
  },
  emptyLabel: {
    fontFamily: fonts.body,
    fontSize: fontSizes.bodySmall,
    color: colors.muted,
    paddingVertical: 6,
  },
  emojiRow: {
    marginTop: 12,
  },
  emojiChoice: {
    width: 40,
    height: 40,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  emojiChoiceSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.categories.need.background,
  },
  emojiChoiceLabel: {
    fontSize: 18,
  },
  addRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  input: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: fontSizes.bodySmall,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: colors.ink,
  },
  addButton: {
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  addButtonLabel: {
    fontFamily: fonts.headingMedium,
    fontSize: fontSizes.bodySmall,
    color: '#fff',
  },
  signOutButton: {
    alignItems: 'center',
    paddingVertical: 14,
    marginTop: 8,
  },
  signOutLabel: {
    fontFamily: fonts.body,
    fontSize: fontSizes.body,
    color: colors.danger,
    textDecorationLine: 'underline',
  },
});
