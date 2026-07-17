import { Linking, Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/colors';
import { fonts, fontSizes } from '../theme/typography';
import type { EmergencyContact } from '../types/emergency';

interface EmergencySheetProps {
  visible: boolean;
  contacts: EmergencyContact[];
  onClose: () => void;
}

export function EmergencySheet({ visible, contacts, onClose }: EmergencySheetProps) {
  const callable = contacts.filter((contact) => contact.phone.trim().length > 0);

  function handleCall(phone: string) {
    const digits = phone.replace(/\D/g, '');
    Linking.openURL(`tel:${digits}`);
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(event) => event.stopPropagation()}>
          <Text style={styles.title}>🆘 Quem devo chamar?</Text>
          {callable.length > 0 ? (
            callable.map((contact) => (
              <View key={contact.id} style={styles.contactRow}>
                <Text style={styles.contactEmoji}>{contact.emoji}</Text>
                <View style={styles.contactInfo}>
                  <Text style={styles.contactName}>{contact.name}</Text>
                  <Text style={styles.contactRelation}>{contact.relation}</Text>
                </View>
                <Pressable style={styles.callButton} onPress={() => handleCall(contact.phone)}>
                  <Text style={styles.callButtonLabel}>📞 Ligar</Text>
                </Pressable>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>
              Nenhum contato com telefone cadastrado ainda.{'\n'}Peça para a família cadastrar na
              Área da família.
            </Text>
          )}
          <Pressable style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonLabel}>Fechar</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(38, 42, 46, 0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    padding: 20,
    paddingBottom: 30,
    maxHeight: '80%',
  },
  title: {
    fontFamily: fonts.headingBold,
    fontSize: 20,
    color: colors.dangerDark,
    marginBottom: 16,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },
  contactEmoji: {
    fontSize: 32,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontFamily: fonts.headingBold,
    fontSize: 17,
    color: colors.ink,
  },
  contactRelation: {
    fontFamily: fonts.body,
    fontSize: fontSizes.bodySmall,
    color: colors.muted,
  },
  callButton: {
    backgroundColor: colors.success,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  callButtonLabel: {
    fontFamily: fonts.headingMedium,
    fontSize: 15,
    color: '#fff',
  },
  emptyText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.body,
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 22,
    paddingVertical: 20,
  },
  closeButton: {
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  closeButtonLabel: {
    fontFamily: fonts.headingMedium,
    fontSize: fontSizes.body,
    color: colors.muted,
  },
});
