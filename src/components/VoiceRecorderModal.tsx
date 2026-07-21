import type { Audio } from 'expo-av';
import { useState } from 'react';
import { Alert, Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import {
  playSound,
  requestRecordingPermission,
  startRecording,
  stopRecording,
} from '../services/recording';
import { colors } from '../theme/colors';
import { fonts, fontSizes } from '../theme/typography';

interface VoiceRecorderModalProps {
  visible: boolean;
  itemName: string;
  hasExistingRecording: boolean;
  onClose: () => void;
  onSave: (temporaryUri: string) => void;
  onDeleteRecording: () => void;
}

export function VoiceRecorderModal({
  visible,
  itemName,
  hasExistingRecording,
  onClose,
  onSave,
  onDeleteRecording,
}: VoiceRecorderModalProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [activeRecording, setActiveRecording] = useState<Audio.Recording | null>(null);
  const [previewUri, setPreviewUri] = useState<string | null>(null);

  function reset() {
    setIsRecording(false);
    setActiveRecording(null);
    setPreviewUri(null);
  }

  function handleClose() {
    reset();
    onClose();
  }

  async function handleStartRecording() {
    const granted = await requestRecordingPermission();
    if (!granted) {
      Alert.alert(
        'Permissão necessária',
        'Precisamos de acesso ao microfone para gravar a voz da família.',
      );
      return;
    }
    try {
      const recording = await startRecording();
      setActiveRecording(recording);
      setIsRecording(true);
    } catch (error) {
      console.error('Falha ao iniciar gravacao:', error);
      Alert.alert('Não foi possível gravar', 'Tente novamente.');
    }
  }

  async function handleStopRecording() {
    if (!activeRecording) return;
    try {
      const uri = await stopRecording(activeRecording);
      setPreviewUri(uri);
    } catch (error) {
      console.error('Falha ao parar gravacao:', error);
      Alert.alert('Não foi possível concluir a gravação', 'Tente novamente.');
    } finally {
      setIsRecording(false);
      setActiveRecording(null);
    }
  }

  async function handlePlayPreview() {
    if (!previewUri) return;
    try {
      await playSound(previewUri);
    } catch (error) {
      console.error('Falha ao reproduzir gravacao:', error);
    }
  }

  function handleSave() {
    if (!previewUri) return;
    onSave(previewUri);
    reset();
    onClose();
  }

  function handleDelete() {
    onDeleteRecording();
    reset();
    onClose();
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <Text style={styles.title}>🎤 Voz para &ldquo;{itemName}&rdquo;</Text>

          {previewUri ? (
            <>
              <Text style={styles.description}>Gravação pronta. Ouça antes de salvar.</Text>
              <Pressable style={styles.primaryButton} onPress={handlePlayPreview}>
                <Text style={styles.primaryButtonLabel}>▶️ Ouvir gravação</Text>
              </Pressable>
              <Pressable style={styles.primaryButton} onPress={handleSave}>
                <Text style={styles.primaryButtonLabel}>✅ Salvar</Text>
              </Pressable>
              <Pressable style={styles.secondaryButton} onPress={() => setPreviewUri(null)}>
                <Text style={styles.secondaryButtonLabel}>🔁 Regravar</Text>
              </Pressable>
            </>
          ) : isRecording ? (
            <>
              <Text style={styles.description}>Gravando… toque para parar.</Text>
              <Pressable style={styles.recordingButton} onPress={handleStopRecording}>
                <Text style={styles.primaryButtonLabel}>⏹ Parar</Text>
              </Pressable>
            </>
          ) : (
            <>
              <Text style={styles.description}>
                Grave a voz de um familiar dizendo &ldquo;{itemName}&rdquo; para tocar no lugar da
                voz sintética.
              </Text>
              <Pressable style={styles.primaryButton} onPress={handleStartRecording}>
                <Text style={styles.primaryButtonLabel}>🎤 Gravar</Text>
              </Pressable>
              {hasExistingRecording ? (
                <Pressable style={styles.secondaryButton} onPress={handleDelete}>
                  <Text style={styles.secondaryButtonLabel}>🗑️ Remover gravação atual</Text>
                </Pressable>
              ) : null}
            </>
          )}

          <Pressable style={styles.closeButton} onPress={handleClose}>
            <Text style={styles.closeButtonLabel}>Fechar</Text>
          </Pressable>
        </View>
      </View>
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
    gap: 12,
  },
  title: {
    fontFamily: fonts.headingBold,
    fontSize: 20,
    color: colors.primaryDark,
  },
  description: {
    fontFamily: fonts.body,
    fontSize: fontSizes.bodySmall,
    color: colors.muted,
    lineHeight: 21,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  recordingButton: {
    backgroundColor: colors.danger,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryButtonLabel: {
    fontFamily: fonts.headingBold,
    fontSize: 17,
    color: '#fff',
  },
  secondaryButton: {
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  secondaryButtonLabel: {
    fontFamily: fonts.headingMedium,
    fontSize: fontSizes.body,
    color: colors.muted,
  },
  closeButton: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  closeButtonLabel: {
    fontFamily: fonts.body,
    fontSize: fontSizes.bodySmall,
    color: colors.muted,
    textDecorationLine: 'underline',
  },
});
