import { useEffect, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import { AdminGateModal } from '../../components/AdminGateModal';
import { CATEGORIES } from '../../constants/communication';
import {
  getBiometricPreference,
  isBiometricAvailable,
  setBiometricPreference,
} from '../../services/adminSecurity';
import { type FontScale } from '../../store/useAppStore';
import { colors } from '../../theme/colors';
import type { CommunicationItem } from '../../types/communication';
import { AccessibilityBlock } from './AccessibilityBlock';
import { styles } from './adminStyles';
import { CategoryBlock } from './CategoryBlock';

interface PatientNameBlockProps {
  patientName: string;
  onUpdatePatientName: (name: string) => void;
}

function PatientNameBlock({ patientName, onUpdatePatientName }: PatientNameBlockProps) {
  const [name, setName] = useState(patientName);

  return (
    <View style={styles.block}>
      <View style={styles.addRow}>
        <TextInput
          style={styles.input}
          placeholder="Nome do paciente"
          placeholderTextColor={colors.muted}
          value={name}
          onChangeText={setName}
        />
        <Pressable style={styles.addButton} onPress={() => onUpdatePatientName(name)}>
          <Text style={styles.addButtonLabel}>Salvar</Text>
        </Pressable>
      </View>
    </View>
  );
}

interface SecurityBlockProps {
  uid: string;
}

function SecurityBlock({ uid }: SecurityBlockProps) {
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [showChangePin, setShowChangePin] = useState(false);

  useEffect(() => {
    isBiometricAvailable().then(setBiometricAvailable);
    getBiometricPreference(uid).then(setBiometricEnabled);
  }, [uid]);

  function handleToggleBiometric(enabled: boolean) {
    setBiometricEnabled(enabled);
    setBiometricPreference(uid, enabled);
  }

  return (
    <View style={styles.block}>
      <Text style={styles.blockTitle}>PIN de acesso</Text>
      <Text style={styles.switchScanningDescription}>
        Protege a Área da família para o paciente não entrar por engano.
      </Text>
      <Pressable style={styles.addContactButton} onPress={() => setShowChangePin(true)}>
        <Text style={styles.addButtonLabel}>Alterar PIN</Text>
      </Pressable>

      {biometricAvailable ? (
        <>
          <Text style={styles.switchScanningTitle}>Usar biometria</Text>
          <View style={styles.fontScaleRow}>
            <Pressable
              style={[styles.fontScaleButton, !biometricEnabled && styles.fontScaleButtonActive]}
              onPress={() => handleToggleBiometric(false)}
            >
              <Text
                style={[
                  styles.fontScaleButtonLabel,
                  !biometricEnabled && styles.fontScaleButtonLabelActive,
                ]}
              >
                Desligada
              </Text>
            </Pressable>
            <Pressable
              style={[styles.fontScaleButton, biometricEnabled && styles.fontScaleButtonActive]}
              onPress={() => handleToggleBiometric(true)}
            >
              <Text
                style={[
                  styles.fontScaleButtonLabel,
                  biometricEnabled && styles.fontScaleButtonLabelActive,
                ]}
              >
                Ligada
              </Text>
            </Pressable>
          </View>
        </>
      ) : null}

      <AdminGateModal
        visible={showChangePin}
        uid={uid}
        mode="change"
        onSuccess={() => setShowChangePin(false)}
        onCancel={() => setShowChangePin(false)}
      />
    </View>
  );
}

interface PerfilTabProps {
  uid: string;
  patientName: string;
  onUpdatePatientName: (name: string) => void;
  itemsByCategory: Record<string, CommunicationItem[]>;
  onAddItem: (category: string, name: string, emoji: string) => void;
  onRemoveItem: (itemId: string) => void;
  fontScale: FontScale;
  onChangeFontScale: (scale: FontScale) => void;
  switchScanningEnabled: boolean;
  onChangeSwitchScanning: (enabled: boolean) => void;
}

export function PerfilTab({
  uid,
  patientName,
  onUpdatePatientName,
  itemsByCategory,
  onAddItem,
  onRemoveItem,
  fontScale,
  onChangeFontScale,
  switchScanningEnabled,
  onChangeSwitchScanning,
}: PerfilTabProps) {
  return (
    <>
      <Text style={styles.sectionLabel}>Nome do paciente</Text>
      <PatientNameBlock patientName={patientName} onUpdatePatientName={onUpdatePatientName} />
      <Text style={styles.sectionLabel}>Segurança</Text>
      <SecurityBlock uid={uid} />
      <Text style={styles.sectionLabel}>Acessibilidade</Text>
      <AccessibilityBlock
        fontScale={fontScale}
        onChangeFontScale={onChangeFontScale}
        switchScanningEnabled={switchScanningEnabled}
        onChangeSwitchScanning={onChangeSwitchScanning}
      />
      <Text style={styles.sectionLabel}>Personalize as categorias que o paciente usa</Text>
      {CATEGORIES.map((category) => (
        <CategoryBlock
          key={category.key}
          category={category}
          items={itemsByCategory[category.key] ?? []}
          onAddItem={onAddItem}
          onRemoveItem={onRemoveItem}
        />
      ))}
    </>
  );
}
