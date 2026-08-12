import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { useAppStore } from '../../store/useAppStore';
import { AjustesTab } from './AjustesTab';
import { styles } from './adminStyles';
import { EmergenciaTab } from './EmergenciaTab';
import { PalavrasTab } from './PalavrasTab';

type AdminTab = 'contatos' | 'palavras' | 'ajustes';

const TABS: { key: AdminTab; emoji: string; label: string }[] = [
  { key: 'contatos', emoji: '🆘', label: 'Contatos' },
  { key: 'palavras', emoji: '💬', label: 'Palavras' },
  { key: 'ajustes', emoji: '⚙️', label: 'Ajustes' },
];

interface AdminScreenProps {
  uid: string;
  patientName: string;
  onUpdatePatientName: (name: string) => void;
  onAddItem: (category: string, name: string, emoji: string) => void;
  onRemoveItem: (itemId: string) => void;
  onAddCategory: (label: string, emoji: string) => void;
  onRemoveCategory: (categoryKey: string) => void;
  onAddContact: (name: string, relation: string, phone: string, emoji: string) => void;
  onRemoveContact: (contactId: string) => void;
  onClose: () => void;
  onSignOut: () => void;
}

export function AdminScreen({
  uid,
  patientName,
  onUpdatePatientName,
  onAddItem,
  onRemoveItem,
  onAddCategory,
  onRemoveCategory,
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
  const lowLiteracyMode = useAppStore((state) => state.lowLiteracyMode);
  const setLowLiteracyMode = useAppStore((state) => state.setLowLiteracyMode);
  const [tab, setTab] = useState<AdminTab>('contatos');

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={onClose} accessibilityLabel="Voltar">
          <Text style={styles.backButtonLabel}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Área da família</Text>
      </View>
      <View style={styles.tabs}>
        {TABS.map(({ key, emoji, label }) => (
          <Pressable
            key={key}
            style={[styles.tabButton, tab === key && styles.tabButtonActive]}
            onPress={() => setTab(key)}
            accessibilityRole="tab"
            accessibilityState={{ selected: tab === key }}
          >
            <Text
              style={[styles.tabButtonLabel, tab === key && styles.tabButtonLabelActive]}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.8}
            >
              {emoji} {label}
            </Text>
          </Pressable>
        ))}
      </View>
      <ScrollView contentContainerStyle={styles.body}>
        {tab === 'contatos' ? (
          <EmergenciaTab
            contacts={emergencyContacts}
            onAddContact={onAddContact}
            onRemoveContact={onRemoveContact}
          />
        ) : tab === 'palavras' ? (
          <PalavrasTab
            itemsByCategory={itemsByCategory}
            onAddCategory={onAddCategory}
            onRemoveCategory={onRemoveCategory}
            onAddItem={onAddItem}
            onRemoveItem={onRemoveItem}
          />
        ) : (
          <AjustesTab
            uid={uid}
            patientName={patientName}
            onUpdatePatientName={onUpdatePatientName}
            events={events}
            fontScale={fontScale}
            onChangeFontScale={setFontScale}
            lowLiteracyMode={lowLiteracyMode}
            onChangeLowLiteracyMode={setLowLiteracyMode}
            onSignOut={onSignOut}
          />
        )}
      </ScrollView>
    </View>
  );
}
