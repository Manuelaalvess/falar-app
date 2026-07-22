import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { VoiceRecorderModal } from '../../components/VoiceRecorderModal';
import { EMOJI_CHOICES } from '../../constants/communication';
import { deleteRecording, getRecordingUri, saveRecording } from '../../services/audioRecordings';
import { colors } from '../../theme/colors';
import type { CommunicationCategory, CommunicationItem } from '../../types/communication';
import { type ItemFormValues, itemFormSchema } from '../../validation/adminForms';
import { styles } from './adminStyles';

interface CategoryBlockProps {
  category: CommunicationCategory;
  items: CommunicationItem[];
  onAddItem: (category: string, name: string, emoji: string) => void;
  onRemoveItem: (itemId: string) => void;
}

export function CategoryBlock({ category, items, onAddItem, onRemoveItem }: CategoryBlockProps) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ItemFormValues>({
    resolver: zodResolver(itemFormSchema),
    defaultValues: { name: '', emoji: EMOJI_CHOICES[0] },
  });
  const [activeRecordingItem, setActiveRecordingItem] = useState<CommunicationItem | null>(null);
  const [, bumpRecordingsVersion] = useState(0);

  function handleSaveRecording(temporaryUri: string) {
    if (!activeRecordingItem) return;
    saveRecording(activeRecordingItem.id, temporaryUri);
    bumpRecordingsVersion((version) => version + 1);
  }

  function handleDeleteRecording() {
    if (!activeRecordingItem) return;
    deleteRecording(activeRecordingItem.id);
    bumpRecordingsVersion((version) => version + 1);
  }

  function onSubmit(values: ItemFormValues) {
    onAddItem(category.key, values.name.trim(), values.emoji);
    reset({ name: '', emoji: values.emoji });
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
            <Pressable style={styles.photoButton} onPress={() => setActiveRecordingItem(item)}>
              <Text style={styles.photoButtonLabel}>{getRecordingUri(item.id) ? '🔊' : '🎤'}</Text>
            </Pressable>
            <Pressable onPress={() => onRemoveItem(item.id)}>
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

      <VoiceRecorderModal
        visible={activeRecordingItem !== null}
        itemName={activeRecordingItem?.name ?? ''}
        hasExistingRecording={
          activeRecordingItem ? getRecordingUri(activeRecordingItem.id) !== null : false
        }
        onClose={() => setActiveRecordingItem(null)}
        onSave={handleSaveRecording}
        onDeleteRecording={handleDeleteRecording}
      />
    </View>
  );
}
