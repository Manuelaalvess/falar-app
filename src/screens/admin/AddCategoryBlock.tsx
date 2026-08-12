import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { EMOJI_CHOICES } from '../../constants/communication';
import { colors } from '../../theme/colors';
import { type CategoryFormValues, categoryFormSchema } from '../../validation/adminForms';
import { styles } from './adminStyles';

interface AddCategoryBlockProps {
  onAddCategory: (label: string, emoji: string) => void;
}

export function AddCategoryBlock({ onAddCategory }: AddCategoryBlockProps) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: { label: '', emoji: EMOJI_CHOICES[0] },
  });

  function onSubmit(values: CategoryFormValues) {
    onAddCategory(values.label.trim(), values.emoji);
    reset({ label: '', emoji: values.emoji });
  }

  return (
    <View style={styles.block}>
      <Text style={styles.blockHintTitleFirst}>Nova categoria</Text>
      <Text style={styles.blockHintText}>
        Aparece na tela Comunicar junto com as categorias padrão.
      </Text>

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
          name="label"
          render={({ field: { value, onChange, onBlur } }) => (
            <TextInput
              style={styles.input}
              placeholder="Nome (ex: Médico, TV...)"
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
      {errors.label ? <Text style={styles.errorText}>{errors.label.message}</Text> : null}
    </View>
  );
}
