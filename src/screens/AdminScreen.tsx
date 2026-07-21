import { zodResolver } from '@hookform/resolvers/zod';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { CATEGORIES, EMOJI_CHOICES } from '../constants/communication';
import { type FontScale, useAppStore } from '../store/useAppStore';
import { colors } from '../theme/colors';
import { fonts, fontSizes } from '../theme/typography';
import type { CommunicationCategory, CommunicationItem } from '../types/communication';
import type { EmergencyContact } from '../types/emergency';
import type { CommunicationEvent } from '../types/evolution';
import {
  buildTherapistReport,
  getLast7DaysCounts,
  getRecentEvents,
  getTopCategory,
} from '../utils/evolutionStats';
import {
  type ContactFormValues,
  contactFormSchema,
  type ItemFormValues,
  itemFormSchema,
} from '../validation/adminForms';

type AdminTab = 'perfil' | 'emergencia' | 'evolucao';

interface AdminScreenProps {
  patientName: string;
  onAddItem: (category: string, name: string, emoji: string, photoUri?: string) => void;
  onRemoveItem: (itemId: string) => void;
  onSetItemPhoto: (itemId: string, photoUri: string) => void;
  onClearItemPhoto: (itemId: string) => void;
  onAddContact: (name: string, relation: string, phone: string, emoji: string) => void;
  onRemoveContact: (contactId: string) => void;
  onClose: () => void;
  onSignOut: () => void;
}

export function AdminScreen({
  patientName,
  onAddItem,
  onRemoveItem,
  onSetItemPhoto,
  onClearItemPhoto,
  onAddContact,
  onRemoveContact,
  onClose,
  onSignOut,
}: AdminScreenProps) {
  const itemsByCategory = useAppStore((state) => state.itemsByCategory);
  const emergencyContacts = useAppStore((state) => state.emergencyContacts);
  const events = useAppStore((state) => state.events);
  const fontScale = useAppStore((state) => state.fontScale);
  const setFontScale = useAppStore((state) => state.setFontScale);
  const [tab, setTab] = useState<AdminTab>('perfil');

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={onClose}>
          <Text style={styles.backButtonLabel}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Área da família</Text>
      </View>
      <View style={styles.tabs}>
        <Pressable
          style={[styles.tabButton, tab === 'perfil' && styles.tabButtonActive]}
          onPress={() => setTab('perfil')}
        >
          <Text style={[styles.tabButtonLabel, tab === 'perfil' && styles.tabButtonLabelActive]}>
            Perfil
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tabButton, tab === 'emergencia' && styles.tabButtonActive]}
          onPress={() => setTab('emergencia')}
        >
          <Text
            style={[styles.tabButtonLabel, tab === 'emergencia' && styles.tabButtonLabelActive]}
          >
            Emergência
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tabButton, tab === 'evolucao' && styles.tabButtonActive]}
          onPress={() => setTab('evolucao')}
        >
          <Text style={[styles.tabButtonLabel, tab === 'evolucao' && styles.tabButtonLabelActive]}>
            Evolução
          </Text>
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={styles.body}>
        {tab === 'perfil' ? (
          <>
            <Text style={styles.sectionLabel}>Acessibilidade</Text>
            <AccessibilityBlock fontScale={fontScale} onChangeFontScale={setFontScale} />
            <Text style={styles.sectionLabel}>Personalize as categorias que o paciente usa</Text>
            {CATEGORIES.map((category) => (
              <CategoryBlock
                key={category.key}
                category={category}
                items={itemsByCategory[category.key] ?? []}
                onAddItem={onAddItem}
                onRemoveItem={onRemoveItem}
                onSetItemPhoto={onSetItemPhoto}
                onClearItemPhoto={onClearItemPhoto}
              />
            ))}
          </>
        ) : tab === 'emergencia' ? (
          <EmergenciaTab
            contacts={emergencyContacts}
            onAddContact={onAddContact}
            onRemoveContact={onRemoveContact}
          />
        ) : (
          <EvolucaoTab patientName={patientName} events={events} />
        )}
        <Pressable style={styles.signOutButton} onPress={onSignOut}>
          <Text style={styles.signOutLabel}>Sair da conta</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const FONT_SCALE_OPTIONS: { value: FontScale; label: string }[] = [
  { value: 1, label: 'Normal' },
  { value: 1.25, label: 'Grande' },
  { value: 1.5, label: 'Extra grande' },
];

interface AccessibilityBlockProps {
  fontScale: FontScale;
  onChangeFontScale: (scale: FontScale) => void;
}

function AccessibilityBlock({ fontScale, onChangeFontScale }: AccessibilityBlockProps) {
  return (
    <View style={styles.block}>
      <Text style={styles.blockTitle}>Tamanho da letra e dos botões</Text>
      <View style={styles.fontScaleRow}>
        {FONT_SCALE_OPTIONS.map((option) => (
          <Pressable
            key={option.value}
            style={[
              styles.fontScaleButton,
              fontScale === option.value && styles.fontScaleButtonActive,
            ]}
            onPress={() => onChangeFontScale(option.value)}
          >
            <Text
              style={[
                styles.fontScaleButtonLabel,
                fontScale === option.value && styles.fontScaleButtonLabelActive,
              ]}
            >
              {option.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

async function pickPhoto(): Promise<string | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    Alert.alert(
      'Permissão necessária',
      'Precisamos de acesso às suas fotos para escolher uma imagem para o item.',
    );
    return null;
  }
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    quality: 0.8,
    allowsEditing: true,
    aspect: [1, 1],
  });
  if (result.canceled) return null;
  return result.assets[0]?.uri ?? null;
}

interface CategoryBlockProps {
  category: CommunicationCategory;
  items: CommunicationItem[];
  onAddItem: (category: string, name: string, emoji: string, photoUri?: string) => void;
  onRemoveItem: (itemId: string) => void;
  onSetItemPhoto: (itemId: string, photoUri: string) => void;
  onClearItemPhoto: (itemId: string) => void;
}

function CategoryBlock({
  category,
  items,
  onAddItem,
  onRemoveItem,
  onSetItemPhoto,
  onClearItemPhoto,
}: CategoryBlockProps) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ItemFormValues>({
    resolver: zodResolver(itemFormSchema),
    defaultValues: { name: '', emoji: EMOJI_CHOICES[0] },
  });
  const [pendingPhotoUri, setPendingPhotoUri] = useState<string | null>(null);

  async function handlePickPhotoForNew() {
    const uri = await pickPhoto();
    if (uri) setPendingPhotoUri(uri);
  }

  async function handlePickPhotoForExisting(itemId: string) {
    const uri = await pickPhoto();
    if (uri) onSetItemPhoto(itemId, uri);
  }

  function onSubmit(values: ItemFormValues) {
    onAddItem(category.key, values.name.trim(), values.emoji, pendingPhotoUri ?? undefined);
    reset({ name: '', emoji: values.emoji });
    setPendingPhotoUri(null);
  }

  return (
    <View style={styles.block}>
      <Text style={styles.blockTitle}>
        {category.emoji} {category.label}
      </Text>
      {items.length > 0 ? (
        items.map((item) => (
          <View key={item.id} style={styles.itemRow}>
            {item.photoUrl ? (
              <Image
                source={{ uri: item.photoUrl }}
                style={styles.itemPhotoThumb}
                contentFit="cover"
              />
            ) : (
              <Text style={styles.itemEmoji}>{item.emoji}</Text>
            )}
            <Text style={styles.itemName}>{item.name}</Text>
            <Pressable
              style={styles.photoButton}
              onPress={() => handlePickPhotoForExisting(item.id)}
            >
              <Text style={styles.photoButtonLabel}>{item.photoUrl ? '🔄' : '📷'}</Text>
            </Pressable>
            {item.photoUrl ? (
              <Pressable onPress={() => onClearItemPhoto(item.id)}>
                <Text style={styles.deleteLabel}>🗑️</Text>
              </Pressable>
            ) : null}
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
        <Pressable style={styles.photoButton} onPress={handlePickPhotoForNew}>
          <Text style={styles.photoButtonLabel}>📷</Text>
        </Pressable>
        <Pressable style={styles.addButton} onPress={handleSubmit(onSubmit)}>
          <Text style={styles.addButtonLabel}>Adicionar</Text>
        </Pressable>
      </View>
      {errors.name ? <Text style={styles.errorText}>{errors.name.message}</Text> : null}
      {pendingPhotoUri ? (
        <View style={styles.pendingPhotoRow}>
          <Image
            source={{ uri: pendingPhotoUri }}
            style={styles.pendingPhotoThumb}
            contentFit="cover"
          />
          <Text style={styles.pendingPhotoLabel}>Foto pronta para o próximo item</Text>
          <Pressable onPress={() => setPendingPhotoUri(null)}>
            <Text style={styles.deleteLabel}>✕</Text>
          </Pressable>
        </View>
      ) : (
        <Text style={styles.pendingPhotoLabel}>
          Foto é opcional — sem foto, o item usa o símbolo escolhido.
        </Text>
      )}
    </View>
  );
}

interface EmergenciaTabProps {
  contacts: EmergencyContact[];
  onAddContact: (name: string, relation: string, phone: string, emoji: string) => void;
  onRemoveContact: (contactId: string) => void;
}

function EmergenciaTab({ contacts, onAddContact, onRemoveContact }: EmergenciaTabProps) {
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

interface EvolucaoTabProps {
  patientName: string;
  events: CommunicationEvent[];
}

function EvolucaoTab({ patientName, events }: EvolucaoTabProps) {
  const total = events.length;
  const topCategory = getTopCategory(events);
  const last7Days = getLast7DaysCounts(events);
  const maxCount = Math.max(1, ...last7Days.map((day) => day.count));
  const recent = getRecentEvents(events, 8);
  const report = buildTherapistReport(patientName, events);

  return (
    <View>
      <Text style={styles.sectionLabel}>Resumo</Text>
      <View style={styles.statRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNum}>{total}</Text>
          <Text style={styles.statLabel}>comunicações no total</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNum}>{topCategory.count}</Text>
          <Text style={styles.statLabel}>{topCategory.label}</Text>
        </View>
      </View>

      <Text style={styles.sectionLabel}>Últimos 7 dias</Text>
      <View style={styles.block}>
        {last7Days.map((day, index) => (
          <View key={index} style={styles.barRow}>
            <Text style={styles.barDay}>{day.label}</Text>
            <View style={styles.barTrack}>
              <View style={[styles.barFill, { width: `${(day.count / maxCount) * 100}%` }]} />
            </View>
            <Text style={styles.barCount}>{day.count}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.sectionLabel}>Levar para a fono</Text>
      <View style={styles.block}>
        <Text style={styles.reportText} selectable>
          {report}
        </Text>
        <View style={styles.recentList}>
          {recent.length > 0 ? (
            recent.map((event) => (
              <View key={event.id} style={styles.recentItem}>
                <Text style={styles.recentItemLabel}>{event.itemName}</Text>
                <Text style={styles.recentItemDate}>
                  {new Date(event.timestamp).toLocaleString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyLabel}>Nenhuma comunicação registrada ainda.</Text>
          )}
        </View>
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
  tabs: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 18,
    paddingTop: 14,
  },
  tabButton: {
    flex: 1,
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tabButtonLabel: {
    fontFamily: fonts.headingMedium,
    fontSize: fontSizes.bodySmall,
    color: colors.muted,
  },
  tabButtonLabelActive: {
    color: '#fff',
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
  itemPhotoThumb: {
    width: 34,
    height: 34,
    borderRadius: 10,
  },
  itemName: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: fontSizes.body,
    color: colors.ink,
  },
  photoButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoButtonLabel: {
    fontSize: 15,
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
  errorText: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.danger,
    marginTop: 6,
  },
  contactInfo: {
    flex: 1,
  },
  contactRelation: {
    fontFamily: fonts.body,
    fontWeight: '400',
    color: colors.muted,
  },
  contactPhone: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.muted,
  },
  contactFormRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  contactPhoneInput: {
    marginTop: 10,
  },
  addContactButton: {
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 12,
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
  pendingPhotoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
  },
  pendingPhotoThumb: {
    width: 32,
    height: 32,
    borderRadius: 8,
  },
  pendingPhotoLabel: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.muted,
    marginTop: 10,
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
  statRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    padding: 16,
    alignItems: 'center',
  },
  statNum: {
    fontFamily: fonts.headingBold,
    fontSize: 28,
    color: colors.primaryDark,
  },
  statLabel: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.muted,
    marginTop: 2,
    textAlign: 'center',
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  barDay: {
    width: 34,
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.muted,
  },
  barTrack: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 8,
    height: 16,
    overflow: 'hidden',
  },
  barFill: {
    backgroundColor: colors.primary,
    height: '100%',
    borderRadius: 8,
  },
  barCount: {
    width: 20,
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.muted,
    textAlign: 'right',
  },
  reportText: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.ink,
    lineHeight: 21,
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 12,
  },
  recentList: {
    marginTop: 14,
  },
  recentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  recentItemLabel: {
    fontFamily: fonts.body,
    fontSize: fontSizes.bodySmall,
    color: colors.ink,
  },
  recentItemDate: {
    fontFamily: fonts.body,
    fontSize: fontSizes.bodySmall,
    color: colors.muted,
  },
  fontScaleRow: {
    flexDirection: 'row',
    gap: 8,
  },
  fontScaleButton: {
    flex: 1,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  fontScaleButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  fontScaleButtonLabel: {
    fontFamily: fonts.headingMedium,
    fontSize: fontSizes.bodySmall,
    color: colors.ink,
  },
  fontScaleButtonLabelActive: {
    color: '#fff',
  },
});
