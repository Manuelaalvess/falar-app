import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { EMOJI_CHOICES } from '../../constants/communication';
import { useAppStore } from '../../store/useAppStore';
import { colors } from '../../theme/colors';
import type { EmergencyContact } from '../../types/emergency';
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
      <Text style={styles.sectionLabel}>Contatos que aparecem no botão 🆘</Text>
      <Text style={styles.hintText}>
        Ensine o paciente: 2 toques rápidos no botão vermelho ligam para o primeiro contato com
        telefone (lista abaixo). A localização fica registrada em &ldquo;Último SOS&rdquo; — com
        internet, aparece também no celular de outro familiar logado na mesma conta. 1 toque abre a
        lista para escolher contato ou enviar SMS manualmente.
      </Text>
      {lastSosAlert ? (
        <View style={[styles.block, styles.sosAlertBlock]}>
          <Text style={styles.blockTitle}>Último SOS (2 toques)</Text>
          <Text style={styles.sosAlertMeta}>
            {new Date(lastSosAlert.timestamp).toLocaleString('pt-BR')} — {lastSosAlert.contactName}
          </Text>
          {lastSosAlert.mapsUrl ? (
            <Text style={styles.sosAlertLink} selectable>
              {lastSosAlert.mapsUrl}
            </Text>
          ) : (
            <Text style={styles.emptyLabel}>Sem localização GPS neste acionamento.</Text>
          )}
        </View>
      ) : null}
      <View style={styles.block}>
        {contacts.length > 0 ? (
          contacts.map((contact) => (
            <View key={contact.id} style={styles.itemRow}>
              <Text style={styles.itemEmoji}>{contact.emoji}</Text>
              <View style={styles.contactInfo}>
                <Text style={styles.itemName}>
                  {contact.name} <Text style={styles.contactRelation}>— {contact.relation}</Text>
                </Text>
                <Text style={styles.contactPhone}>
                  {contact.phone || 'sem telefone cadastrado'}
                </Text>
              </View>
              <Pressable onPress={() => onRemoveContact(contact.id)}>
                <Text style={styles.deleteLabel}>✕</Text>
              </Pressable>
            </View>
          ))
        ) : (
          <Text style={styles.emptyLabel}>Nenhum contato ainda.</Text>
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

        <View style={styles.contactFormRow}>
          <Controller
            control={control}
            name="name"
            render={({ field: { value, onChange, onBlur } }) => (
              <TextInput
                style={styles.input}
                placeholder="Nome (ex: Ana)"
                placeholderTextColor={colors.muted}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
              />
            )}
          />
          <Controller
            control={control}
            name="relation"
            render={({ field: { value, onChange, onBlur } }) => (
              <TextInput
                style={styles.input}
                placeholder="Relação (ex: Filha)"
                placeholderTextColor={colors.muted}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
              />
            )}
          />
        </View>
        {errors.name ? <Text style={styles.errorText}>{errors.name.message}</Text> : null}
        <Controller
          control={control}
          name="phone"
          render={({ field: { value, onChange, onBlur } }) => (
            <TextInput
              style={[styles.input, styles.contactPhoneInput]}
              placeholder="Telefone"
              placeholderTextColor={colors.muted}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              keyboardType="phone-pad"
            />
          )}
        />
        {errors.phone ? <Text style={styles.errorText}>{errors.phone.message}</Text> : null}
        <Pressable style={styles.addContactButton} onPress={handleSubmit(onSubmit)}>
          <Text style={styles.addButtonLabel}>Adicionar contato</Text>
        </Pressable>
      </View>
    </View>
  );
}
