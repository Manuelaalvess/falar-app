import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { useAppStore } from '../../store/useAppStore';
import { styles } from './adminStyles';
import { EmergenciaTab } from './EmergenciaTab';
import { EvolucaoTab } from './EvolucaoTab';
import { PerfilTab } from './PerfilTab';

type AdminTab = 'perfil' | 'emergencia' | 'evolucao';

interface AdminScreenProps {
  uid: string;
  patientName: string;
  onUpdatePatientName: (name: string) => void;
  onAddItem: (category: string, name: string, emoji: string) => void;
  onRemoveItem: (itemId: string) => void;
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
  const switchScanningEnabled = useAppStore((state) => state.switchScanningEnabled);
  const setSwitchScanningEnabled = useAppStore((state) => state.setSwitchScanningEnabled);
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
          <PerfilTab
            uid={uid}
            patientName={patientName}
            onUpdatePatientName={onUpdatePatientName}
            itemsByCategory={itemsByCategory}
            onAddItem={onAddItem}
            onRemoveItem={onRemoveItem}
            fontScale={fontScale}
            onChangeFontScale={setFontScale}
            switchScanningEnabled={switchScanningEnabled}
            onChangeSwitchScanning={setSwitchScanningEnabled}
          />
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
