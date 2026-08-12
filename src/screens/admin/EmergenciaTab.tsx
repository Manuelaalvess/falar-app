import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { EMOJI_CHOICES } from '../../constants/communication';
import { useAppStore } from '../../store/useAppStore';
import { colors } from '../../theme/colors';
import type { EmergencyContact } from '../../types/emergency';
import { confirmDestructive } from '../../utils/confirmDestructive';
import { type ContactFormValues, contactFormSchema } from '../../validation/adminForms';
import { styles } from './adminStyles';

interface EmergenciaTabProps {
  contacts: EmergencyContact[];
  onAddContact: (name: string, relation: string, phone: string, emoji: string) => void;
  onRemoveContact: (contactId: string) => void;
}

export function EmergenciaTab({ contacts, onAddContact, onRemoveContact }: EmergenciaTabProps) {
  const lastSosAlert = useAppStore((state) => state.lastSosAlert);
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: { name: '', relation: '', phone: '', emoji: EMOJI_CHOICES[0] },
  });

  function onSubmit(values: ContactFormValues) {
    onAddContact(
      values.name.trim(),
      values.relation.trim() || 'Família',
      values.phone.trim(),
      values.emoji,
    );
    reset({ name: '', relation: '', phone: '', emoji: values.emoji });
  }

  return (
    <View>
      <Text style={styles.sectionIntro}>
        2 toques no 🆘 ligam para o primeiro contato. 1 toque abre a lista para escolher.
      </Text>

      {lastSosAlert ? (
        <View style={[styles.block, styles.sosAlertBlock]}>
          <Text style={styles.blockTitle}>Último SOS</Text>
          <Text style={styles.sosAlertMeta}>
            {new Date(lastSosAlert.timestamp).toLocaleString('pt-BR')} · {lastSosAlert.contactName}
          </Text>
          {lastSosAlert.mapsUrl ? (
            <Text style={styles.sosAlertLink} selectable>
              {lastSosAlert.mapsUrl}
            </Text>
          ) : (
            <Text style={styles.emptyLabel}>Sem localização neste acionamento.</Text>
          )}
        </View>
      ) : null}

      <Text style={styles.sectionLabel}>Contatos</Text>
      <View style={styles.block}>
        {contacts.length > 0 ? (
          contacts.map((contact, index) => (
            <View key={contact.id} style={styles.itemRow}>
              <Text style={styles.itemEmoji}>{contact.emoji}</Text>
              <View style={styles.contactInfo}>
                <Text style={styles.itemName}>
                  {index === 0 ? '★ ' : ''}
                  {contact.name}
                  {contact.relation ? (
                    <Text style={styles.contactRelation}> · {contact.relation}</Text>
                  ) : null}
                </Text>
                <Text style={styles.contactPhone}>
                  {contact.phone || 'Cadastre um telefone'}
                </Text>
              </View>
              <Pressable
                onPress={() =>
                  confirmDestructive('Remover contato', `Remover ${contact.name}?`, () =>
                    onRemoveContact(contact.id),
                  )
                }
                accessibilityLabel={`Remover ${contact.name}`}
              >
                <Text style={styles.deleteLabel}>✕</Text>
              </Pressable>
            </View>
          ))
        ) : (
          <Text style={styles.emptyLabel}>Adicione pelo menos um contato com telefone.</Text>
        )}
      </View>

      <Text style={styles.sectionLabel}>Novo contato</Text>
      <View style={styles.block}>
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

        <Controller
          control={control}
          name="name"
          render={({ field: { value, onChange, onBlur } }) => (
            <TextInput
              style={[styles.input, styles.fieldSpacingTop]}
              placeholder="Nome"
              placeholderTextColor={colors.muted}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
            />
          )}
        />
        {errors.name ? <Text style={styles.errorText}>{errors.name.message}</Text> : null}

        <Controller
          control={control}
          name="phone"
          render={({ field: { value, onChange, onBlur } }) => (
            <TextInput
              style={[styles.input, styles.fieldSpacingTop]}
              placeholder="Telefone com DDD"
              placeholderTextColor={colors.muted}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              keyboardType="phone-pad"
            />
          )}
        />
        {errors.phone ? <Text style={styles.errorText}>{errors.phone.message}</Text> : null}

        <Controller
          control={control}
          name="relation"
          render={({ field: { value, onChange, onBlur } }) => (
            <TextInput
              style={[styles.input, styles.fieldSpacingTop]}
              placeholder="Relação (opcional)"
              placeholderTextColor={colors.muted}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
            />
          )}
        />

        <Pressable style={styles.addContactButton} onPress={handleSubmit(onSubmit)}>
          <Text style={styles.addButtonLabel}>Adicionar</Text>
        </Pressable>
      </View>
    </View>
  );
}
