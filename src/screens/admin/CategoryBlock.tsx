import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { EMOJI_CHOICES, withoutCoreResponseItems } from '../../constants/communication';
import { colors } from '../../theme/colors';
import type { CommunicationCategory, CommunicationItem } from '../../types/communication';
import { confirmDestructive } from '../../utils/confirmDestructive';
import { type ItemFormValues, itemFormSchema } from '../../validation/adminForms';
import { styles } from './adminStyles';

interface CategoryBlockProps {
  category: CommunicationCategory;
  items: CommunicationItem[];
  onAddItem: (category: string, name: string, emoji: string) => void;
  onRemoveItem: (itemId: string) => void;
  collapsible?: boolean;
  removable?: boolean;
  onRemoveCategory?: () => void;
}

export function CategoryBlock({
  category,
  items,
  onAddItem,
  onRemoveItem,
  collapsible = false,
  removable = false,
  onRemoveCategory,
}: CategoryBlockProps) {
  const [expanded, setExpanded] = useState(!collapsible);
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ItemFormValues>({
    resolver: zodResolver(itemFormSchema),
    defaultValues: { name: '', emoji: EMOJI_CHOICES[0] },
  });

  function onSubmit(values: ItemFormValues) {
    onAddItem(category.key, values.name.trim(), values.emoji);
    reset({ name: '', emoji: values.emoji });
  }

  const visibleItems = withoutCoreResponseItems(items);

  return (
    <View style={styles.block}>
      <View style={styles.categoryHeader}>
        <Pressable
          style={styles.categoryHeaderMain}
          onPress={() => collapsible && setExpanded((value) => !value)}
          disabled={!collapsible}
          accessibilityRole={collapsible ? 'button' : undefined}
          accessibilityLabel={`${category.label}, ${visibleItems.length} itens`}
          accessibilityState={{ expanded }}
        >
          <Text style={styles.blockTitle}>
            {category.emoji} {category.label}
          </Text>
          {collapsible ? (
            <Text style={styles.categoryMeta}>
              {visibleItems.length} · {expanded ? '▲' : '▼'}
            </Text>
          ) : null}
        </Pressable>
        {removable && onRemoveCategory ? (
          <Pressable
            onPress={onRemoveCategory}
            accessibilityLabel={`Remover categoria ${category.label}`}
          >
            <Text style={styles.deleteLabel}>✕</Text>
          </Pressable>
        ) : null}
      </View>
      {expanded ? (
        <>
          {visibleItems.length > 0 ? (
            visibleItems.map((item) => (
              <View key={item.id} style={styles.itemRow}>
                <Text style={styles.itemEmoji}>{item.emoji}</Text>
                <Text style={styles.itemName}>{item.name}</Text>
                <Pressable
                  onPress={() =>
                    confirmDestructive('Remover item', `Remover "${item.name}"?`, () =>
                      onRemoveItem(item.id),
                    )
                  }
                  accessibilityLabel={`Remover ${item.name}`}
                >
                  <Text style={styles.deleteLabel}>✕</Text>
                </Pressable>
              </View>
            ))
          ) : (
            <Text style={styles.emptyLabel}>Nenhum item ainda.</Text>
          )}

          <Controller
            control={control}
            name="emoji"
            render={({ field: { value, onChange } }) => (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.emojiRow}>
                {EMOJI_CHOICES.map((choice) => (
                  <Pressable
                    key={choice}
                    style={[styles.emojiChoice, choice === value && styles.emojiChoiceSelected]}
                    onPress={() => onChange(choice)}
                  >
                    <Text style={styles.emojiChoiceLabel}>{choice}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            )}
          />

          <View style={styles.addRow}>
            <Controller
              control={control}
              name="name"
              render={({ field: { value, onChange, onBlur } }) => (
                <TextInput
                  style={styles.input}
                  placeholder="Nome (ex: Maria, Praia...)"
                  placeholderTextColor={colors.muted}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                />
              )}
            />
            <Pressable style={styles.addButton} onPress={handleSubmit(onSubmit)}>
              <Text style={styles.addButtonLabel}>Adicionar</Text>
            </Pressable>
          </View>
          {errors.name ? <Text style={styles.errorText}>{errors.name.message}</Text> : null}
        </>
      ) : null}
    </View>
  );
}
