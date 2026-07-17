import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { CATEGORIES, EMOJI_CHOICES } from '../constants/communication';
import { colors } from '../theme/colors';
import { fonts, fontSizes } from '../theme/typography';
import type { CommunicationCategory, CommunicationItem } from '../types/communication';

interface AdminScreenProps {
  itemsByCategory: Record<string, CommunicationItem[]>;
  onAddItem: (category: string, name: string, emoji: string, photoUri?: string) => void;
  onRemoveItem: (itemId: string) => void;
  onSetItemPhoto: (itemId: string, photoUri: string) => void;
  onClearItemPhoto: (itemId: string) => void;
  onClose: () => void;
  onSignOut: () => void;
}

export function AdminScreen({
  itemsByCategory,
  onAddItem,
  onRemoveItem,
  onSetItemPhoto,
  onClearItemPhoto,
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
            onSetItemPhoto={onSetItemPhoto}
            onClearItemPhoto={onClearItemPhoto}
          />
        ))}
        <Pressable style={styles.signOutButton} onPress={onSignOut}>
          <Text style={styles.signOutLabel}>Sair da conta</Text>
        </Pressable>
      </ScrollView>
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
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState(EMOJI_CHOICES[0]);
  const [pendingPhotoUri, setPendingPhotoUri] = useState<string | null>(null);

  async function handlePickPhotoForNew() {
    const uri = await pickPhoto();
    if (uri) setPendingPhotoUri(uri);
  }

  async function handlePickPhotoForExisting(itemId: string) {
    const uri = await pickPhoto();
    if (uri) onSetItemPhoto(itemId, uri);
  }

  function handleAdd() {
    const trimmed = name.trim();
    if (!trimmed) return;
    onAddItem(category.key, trimmed, emoji, pendingPhotoUri ?? undefined);
    setName('');
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
        <Pressable style={styles.photoButton} onPress={handlePickPhotoForNew}>
          <Text style={styles.photoButtonLabel}>📷</Text>
        </Pressable>
        <Pressable style={styles.addButton} onPress={handleAdd}>
          <Text style={styles.addButtonLabel}>Adicionar</Text>
        </Pressable>
      </View>
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
});
