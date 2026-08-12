import { useEffect, useMemo, useState } from 'react';
import { Pressable, Share, Text, TextInput, View } from 'react-native';

import { AdminGateModal } from '../../components/AdminGateModal';
import {
  getBiometricPreference,
  isBiometricAvailable,
  setBiometricPreference,
} from '../../services/adminSecurity';
import { type FontScale } from '../../store/useAppStore';
import { colors } from '../../theme/colors';
import type { CommunicationEvent } from '../../types/evolution';
import { buildTherapistReport, getEvolutionSummary } from '../../utils/evolutionStats';
import { logError } from '../../utils/logError';
import { AccessibilityBlock } from './AccessibilityBlock';
import { AdminChoiceButton } from './AdminChoiceButton';
import { styles } from './adminStyles';

interface AjustesTabProps {
  uid: string;
  patientName: string;
  onUpdatePatientName: (name: string) => void;
  events: CommunicationEvent[];
  fontScale: FontScale;
  onChangeFontScale: (scale: FontScale) => void;
  lowLiteracyMode: boolean;
  onChangeLowLiteracyMode: (enabled: boolean) => void;
  onSignOut: () => void;
}

export function AjustesTab({
  uid,
  patientName,
  onUpdatePatientName,
  events,
  fontScale,
  onChangeFontScale,
  lowLiteracyMode,
  onChangeLowLiteracyMode,
  onSignOut,
}: AjustesTabProps) {
  const [name, setName] = useState(patientName);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [showChangePin, setShowChangePin] = useState(false);

  const summary = useMemo(() => getEvolutionSummary(events), [events]);
  const report = useMemo(() => buildTherapistReport(patientName, summary), [patientName, summary]);

  useEffect(() => {
    isBiometricAvailable().then(setBiometricAvailable);
    getBiometricPreference(uid).then(setBiometricEnabled);
  }, [uid]);

  function handleToggleBiometric(enabled: boolean) {
    setBiometricEnabled(enabled);
    setBiometricPreference(uid, enabled);
  }

  function handleShareReport() {
    Share.share({ message: report }).catch((error: unknown) => {
      logError('Compartilhar resumo', error);
    });
  }

  return (
    <View>
      <Text style={styles.sectionLabel}>Nome do paciente</Text>
      <View style={styles.block}>
        <View style={styles.addRow}>
          <TextInput
            style={styles.input}
            placeholder="Como chamar na tela"
            placeholderTextColor={colors.muted}
            value={name}
            onChangeText={setName}
          />
          <Pressable style={styles.addButton} onPress={() => onUpdatePatientName(name)}>
            <Text style={styles.addButtonLabel}>Salvar</Text>
          </Pressable>
        </View>
      </View>

      <Text style={styles.sectionLabel}>Tela do paciente</Text>
      <AccessibilityBlock
        fontScale={fontScale}
        onChangeFontScale={onChangeFontScale}
        lowLiteracyMode={lowLiteracyMode}
        onChangeLowLiteracyMode={onChangeLowLiteracyMode}
      />

      <Text style={styles.sectionLabel}>Proteção desta área</Text>
      <View style={styles.block}>
        <Pressable style={styles.addContactButton} onPress={() => setShowChangePin(true)}>
          <Text style={styles.addButtonLabel}>Alterar PIN</Text>
        </Pressable>
        {biometricAvailable ? (
          <View style={[styles.choiceRow, styles.blockSpacingTop]}>
            <AdminChoiceButton
              label="Só PIN"
              selected={!biometricEnabled}
              onPress={() => handleToggleBiometric(false)}
              style={styles.choiceButtonHalf}
            />
            <AdminChoiceButton
              label="Biometria"
              selected={biometricEnabled}
              onPress={() => handleToggleBiometric(true)}
              style={styles.choiceButtonHalf}
            />
          </View>
        ) : null}
      </View>

      <Text style={styles.sectionLabel}>Evolução</Text>
      <View style={styles.block}>
        <Text style={styles.evolutionSummary}>
          {summary.total} comunicações · mais usado: {summary.topCategory.label}
        </Text>
        <Text style={styles.reportText} selectable>
          {report}
        </Text>
        <Pressable style={styles.addContactButton} onPress={handleShareReport}>
          <Text style={styles.addButtonLabel}>Compartilhar resumo</Text>
        </Pressable>
      </View>

      <Pressable style={styles.signOutButton} onPress={onSignOut}>
        <Text style={styles.signOutLabel}>Sair da conta</Text>
      </Pressable>

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
