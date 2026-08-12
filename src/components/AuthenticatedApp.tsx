import type { User } from 'firebase/auth';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { AdminScreen } from '../screens/admin/AdminScreen';
import { ComunicarScreen } from '../screens/ComunicarScreen';
import { useSosDoublePress } from '../hooks/useSosDoublePress';
import { useAppStore } from '../store/useAppStore';
import { colors } from '../theme/colors';
import { AdminGateModal } from './AdminGateModal';
import { AppHeader } from './AppHeader';
import { EmergencySheet } from './EmergencySheet';
import { SosBar } from './SosBar';

interface AuthenticatedAppProps {
  user: User;
  patientName: string;
  comunicarReady: boolean;
  onUpdatePatientName: (name: string) => Promise<void>;
  onAddItem: (category: string, name: string, emoji: string) => Promise<void>;
  onRemoveItem: (itemId: string) => Promise<void>;
  onAddCategory: (label: string, emoji: string) => Promise<void>;
  onRemoveCategory: (categoryKey: string) => Promise<void>;
  onAddContact: (name: string, relation: string, phone: string, emoji: string) => Promise<void>;
  onRemoveContact: (contactId: string) => Promise<void>;
  onSignOut: () => Promise<void>;
}

export function AuthenticatedApp({
  user,
  patientName,
  comunicarReady,
  onUpdatePatientName,
  onAddItem,
  onRemoveItem,
  onAddCategory,
  onRemoveCategory,
  onAddContact,
  onRemoveContact,
  onSignOut,
}: AuthenticatedAppProps) {
  const showAdmin = useAppStore((state) => state.showAdmin);
  const setShowAdmin = useAppStore((state) => state.setShowAdmin);
  const emergencyContacts = useAppStore((state) => state.emergencyContacts);
  const [showAdminGate, setShowAdminGate] = useState(false);
  const [showSOS, setShowSOS] = useState(false);
  const { busy: sosBusy, handleDoublePress } = useSosDoublePress(user.uid, emergencyContacts);

  if (!comunicarReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (showAdmin) {
    return (
      <AdminScreen
        uid={user.uid}
        patientName={patientName}
        onUpdatePatientName={onUpdatePatientName}
        onAddItem={onAddItem}
        onRemoveItem={onRemoveItem}
        onAddCategory={onAddCategory}
        onRemoveCategory={onRemoveCategory}
        onAddContact={onAddContact}
        onRemoveContact={onRemoveContact}
        onClose={() => setShowAdmin(false)}
        onSignOut={onSignOut}
      />
    );
  }

  return (
    <>
      <AppHeader
        rightLabel="⚙️ Família"
        onRightPress={() => setShowAdminGate(true)}
        sosButton={
          <SosBar
            inline
            busy={sosBusy}
            onSinglePress={() => setShowSOS(true)}
            onDoublePress={() => void handleDoublePress()}
          />
        }
      />
      <ComunicarScreen uid={user.uid} />
      <EmergencySheet
        visible={showSOS}
        contacts={emergencyContacts}
        onClose={() => setShowSOS(false)}
      />
      <AdminGateModal
        visible={showAdminGate}
        uid={user.uid}
        onSuccess={() => {
          setShowAdminGate(false);
          setShowAdmin(true);
        }}
        onCancel={() => setShowAdminGate(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
