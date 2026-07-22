import { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { EmergencySheet } from '../components/EmergencySheet';
import { SosBar } from '../components/SosBar';
import { CATEGORIES, CATEGORY_COLORS } from '../constants/communication';
import { getRecordingUri } from '../services/audioRecordings';
import {
  getPrimaryEmergencyContact,
  triggerDoubleTapEmergency,
} from '../services/emergencyActions';
import { logEvent } from '../services/evolution';
import { playSound } from '../services/recording';
import { speak } from '../services/speech';
import { useAppStore } from '../store/useAppStore';
import { colors } from '../theme/colors';
import { fonts, fontSizes, scaledSize } from '../theme/typography';
import type { CommunicationItem } from '../types/communication';
import { getSuggestedCategory, sortItemsByUsage } from '../utils/personalization';

const SCAN_INTERVAL_MS = 2200;

interface ComunicarScreenProps {
  uid: string;
}

export function ComunicarScreen({ uid }: ComunicarScreenProps) {
  const itemsByCategory = useAppStore((state) => state.itemsByCategory);
  const emergencyContacts = useAppStore((state) => state.emergencyContacts);
  const events = useAppStore((state) => state.events);
  const fontScale = useAppStore((state) => state.fontScale);
  const switchScanningEnabled = useAppStore((state) => state.switchScanningEnabled);
  const lowLiteracyMode = useAppStore((state) => state.lowLiteracyMode);
  const [openCategoryKey, setOpenCategoryKey] = useState<string | null>(null);
  const [confirmedItem, setConfirmedItem] = useState<CommunicationItem | null>(null);
  const [showSOS, setShowSOS] = useState(false);
  const [sosBusy, setSosBusy] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  useEffect(() => {
    if (!confirmedItem) return;
    const timeout = setTimeout(() => setConfirmedItem(null), 1600);
    return () => clearTimeout(timeout);
  }, [confirmedItem]);

  const openCategory = CATEGORIES.find((category) => category.key === openCategoryKey);
  const precisoCategory = CATEGORIES.find((category) => category.key === 'preciso');
  const precisoItems = itemsByCategory['preciso'] ?? [];
  const simItem = precisoItems.find((item) => item.name === 'Sim');
  const naoItem = precisoItems.find((item) => item.name === 'Não');

  function handleChooseItem(item: CommunicationItem, category = openCategory) {
    const recordingUri = getRecordingUri(item.id);
    if (recordingUri) {
      playSound(recordingUri).catch((error: unknown) => {
        console.error('Falha ao tocar gravacao, usando voz sintetica:', error);
        speak(item.name);
      });
    } else {
      speak(item.name);
    }
    setConfirmedItem(item);
    if (category) {
      logEvent(uid, category.key, category.label, item.name).catch((error: unknown) => {
        console.error('Falha ao registrar evento de comunicacao:', error);
      });
    }
  }

  const items = useMemo(() => {
    if (!openCategoryKey) return [];
    const raw = itemsByCategory[openCategoryKey] ?? [];
    return sortItemsByUsage(raw, events, openCategoryKey);
  }, [itemsByCategory, openCategoryKey, events]);

  const suggestedCategory = useMemo(() => getSuggestedCategory(events), [events]);

  const scanList = openCategory ? items : CATEGORIES;

  useEffect(() => {
    setHighlightedIndex(0);
  }, [openCategoryKey]);

  useEffect(() => {
    if (!switchScanningEnabled || confirmedItem || showSOS || scanList.length === 0) return;
    const interval = setInterval(() => {
      setHighlightedIndex((previous) => (previous + 1) % scanList.length);
    }, SCAN_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [switchScanningEnabled, confirmedItem, showSOS, scanList.length]);

  useEffect(() => {
    if (!switchScanningEnabled || confirmedItem || showSOS) return;
    const highlighted = scanList[highlightedIndex];
    if (!highlighted) return;
    const label = openCategory
      ? (highlighted as CommunicationItem).name
      : (highlighted as (typeof CATEGORIES)[number]).label;
    speak(label);
  }, [highlightedIndex, switchScanningEnabled, confirmedItem, showSOS, scanList, openCategory]);

  function handleScanSelect() {
    const highlighted = scanList[highlightedIndex];
    if (!highlighted) return;
    if (openCategory) {
      handleChooseItem(highlighted as CommunicationItem);
    } else {
      setOpenCategoryKey((highlighted as (typeof CATEGORIES)[number]).key);
    }
  }

  async function handleSosDoublePress() {
    const primary = getPrimaryEmergencyContact(emergencyContacts);
    if (!primary) {
      Alert.alert(
        'Nenhum telefone cadastrado',
        'Peça para a família adicionar um contato com telefone na Área da família (aba Emergência).',
      );
      return;
    }

    setSosBusy(true);
    try {
      speak('Ligando para ajuda');
      await triggerDoubleTapEmergency(uid, primary);
    } catch (error) {
      console.error('Falha ao acionar emergencia por duplo toque:', error);
      Alert.alert(
        'Não foi possível acionar',
        'Tente de novo ou use 1 toque no botão vermelho para escolher um contato.',
      );
    } finally {
      setSosBusy(false);
    }
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <SosBar
          busy={sosBusy}
          onSinglePress={() => setShowSOS(true)}
          onDoublePress={() => {
            handleSosDoublePress().catch((error: unknown) => {
              console.error('Emergencia duplo toque:', error);
            });
          }}
        />
        {lowLiteracyMode && simItem && naoItem ? (
          <View style={styles.simNaoRow}>
            <Pressable
              style={[styles.simNaoButton, styles.simButton]}
              onPress={() => handleChooseItem(simItem, precisoCategory)}
              accessibilityRole="button"
              accessibilityLabel="Sim"
            >
              <Text style={[styles.simNaoEmoji, { fontSize: scaledSize(40, fontScale) }]}>
                {simItem.emoji}
              </Text>
              <Text style={[styles.simNaoLabel, { fontSize: scaledSize(18, fontScale) }]}>Sim</Text>
            </Pressable>
            <Pressable
              style={[styles.simNaoButton, styles.naoButton]}
              onPress={() => handleChooseItem(naoItem, precisoCategory)}
              accessibilityRole="button"
              accessibilityLabel="Não"
            >
              <Text style={[styles.simNaoEmoji, { fontSize: scaledSize(40, fontScale) }]}>
                {naoItem.emoji}
              </Text>
              <Text style={[styles.simNaoLabel, { fontSize: scaledSize(18, fontScale) }]}>Não</Text>
            </Pressable>
          </View>
        ) : null}
        {!openCategory ? (
          <>
            {!lowLiteracyMode ? (
              <Text
                style={[styles.sectionLabel, { fontSize: scaledSize(fontSizes.label, fontScale) }]}
              >
                O que você quer dizer?
              </Text>
            ) : null}
            <View style={styles.grid}>
              {CATEGORIES.map((category, index) => {
                const categoryColors = CATEGORY_COLORS[category.key];
                const isSuggested = category.key === suggestedCategory;
                const isHighlighted = switchScanningEnabled && index === highlightedIndex;
                return (
                  <Pressable
                    key={category.key}
                    style={[
                      styles.categoryTile,
                      { backgroundColor: categoryColors.background, minHeight: 120 * fontScale },
                      isHighlighted && styles.scanHighlight,
                    ]}
                    onPress={() => setOpenCategoryKey(category.key)}
                    accessibilityRole="button"
                    accessibilityLabel={category.label}
                  >
                    {isSuggested ? (
                      <View style={styles.suggestedBadge}>
                        <Text style={styles.suggestedBadgeLabel}>⭐ Sugestão</Text>
                      </View>
                    ) : null}
                    <Text style={[styles.tileEmoji, { fontSize: 34 * fontScale }]}>
                      {category.emoji}
                    </Text>
                    {!lowLiteracyMode ? (
                      <Text
                        style={[
                          styles.tileLabel,
                          { color: categoryColors.foreground, fontSize: 17 * fontScale },
                        ]}
                      >
                        {category.label}
                      </Text>
                    ) : null}
                  </Pressable>
                );
              })}
            </View>
          </>
        ) : (
          <>
            <View style={styles.backRow}>
              <Pressable
                style={[styles.backButton, { width: 48 * fontScale, height: 48 * fontScale }]}
                onPress={() => setOpenCategoryKey(null)}
                accessibilityRole="button"
                accessibilityLabel="Voltar"
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
                  {openCategory.emoji} {openCategory.label}
                </Text>
              ) : null}
            </View>
            {items.length > 0 ? (
              <View style={styles.grid}>
                {items.map((item, index) => {
                  const isHighlighted = switchScanningEnabled && index === highlightedIndex;
                  return (
                    <Pressable
                      key={item.id}
                      style={[
                        styles.itemTile,
                        { minHeight: 110 * fontScale },
                        isHighlighted && styles.scanHighlight,
                      ]}
                      onPress={() => handleChooseItem(item)}
                      accessibilityRole="button"
                      accessibilityLabel={item.name}
                    >
                      <Text style={[styles.tileEmoji, { fontSize: 34 * fontScale }]}>
                        {item.emoji}
                      </Text>
                      {!lowLiteracyMode ? (
                        <Text style={[styles.itemLabel, { fontSize: 16 * fontScale }]}>
                          {item.name}
                        </Text>
                      ) : null}
                    </Pressable>
                  );
                })}
              </View>
            ) : (
              <Text
                style={[styles.emptyText, { fontSize: scaledSize(fontSizes.bodyLarge, fontScale) }]}
              >
                Nenhum item ainda aqui.{'\n'}Peça para a família adicionar na Área da família.
              </Text>
            )}
          </>
        )}
      </ScrollView>

      {switchScanningEnabled ? (
        <Pressable
          style={styles.scanSelectButton}
          onPress={handleScanSelect}
          accessibilityRole="button"
          accessibilityLabel="Selecionar"
        >
          <Text style={[styles.scanSelectButtonLabel, { fontSize: scaledSize(20, fontScale) }]}>
            ✅ Selecionar
          </Text>
        </Pressable>
      ) : null}

      {confirmedItem ? (
        <View style={styles.confirmOverlay}>
          <View style={styles.confirmCard}>
            <Text style={[styles.confirmEmoji, { fontSize: 64 * fontScale }]}>
              {confirmedItem.emoji}
            </Text>
            <Text style={[styles.confirmLabel, { fontSize: 24 * fontScale }]}>
              {confirmedItem.name}
            </Text>
          </View>
        </View>
      ) : null}

      <EmergencySheet
        visible={showSOS}
        contacts={emergencyContacts}
        onClose={() => setShowSOS(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 18,
    flexGrow: 1,
  },
  sectionLabel: {
    fontFamily: fonts.headingBold,
    fontSize: fontSizes.label,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    color: colors.muted,
    marginBottom: 12,
  },
  simNaoRow: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 18,
  },
  simNaoButton: {
    flex: 1,
    minHeight: 88,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderWidth: 2,
  },
  simButton: {
    backgroundColor: colors.categories.need.background,
    borderColor: colors.success,
  },
  naoButton: {
    backgroundColor: colors.categories.food.background,
    borderColor: colors.danger,
  },
  simNaoEmoji: {
    fontSize: 40,
  },
  simNaoLabel: {
    fontFamily: fonts.headingBold,
    fontSize: 18,
    color: colors.ink,
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
    position: 'relative',
  },
  suggestedBadge: {
    position: 'absolute',
    top: 10,
    alignSelf: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  suggestedBadgeLabel: {
    fontFamily: fonts.headingMedium,
    fontSize: 11,
    color: colors.ink,
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
  scanHighlight: {
    borderWidth: 4,
    borderColor: colors.accent,
  },
  scanSelectButton: {
    backgroundColor: colors.accent,
    marginHorizontal: 18,
    marginBottom: 14,
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: 'center',
  },
  scanSelectButtonLabel: {
    fontFamily: fonts.headingBold,
    fontSize: 20,
    color: '#fff',
  },
});
