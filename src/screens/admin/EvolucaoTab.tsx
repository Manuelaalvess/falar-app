import { useMemo } from 'react';
import { Pressable, Share, Text, View } from 'react-native';

import type { CommunicationEvent } from '../../types/evolution';
import { buildTherapistReport, getEvolutionSummary } from '../../utils/evolutionStats';
import { logError } from '../../utils/logError';
import { styles } from './adminStyles';

interface EvolucaoTabProps {
  patientName: string;
  events: CommunicationEvent[];
}

export function EvolucaoTab({ patientName, events }: EvolucaoTabProps) {
  const summary = useMemo(() => getEvolutionSummary(events), [events]);
  const report = useMemo(() => buildTherapistReport(patientName, summary), [patientName, summary]);
  const maxCount = Math.max(1, ...summary.last7Days.map((day) => day.count));

  function handleShareReport() {
    Share.share({ message: report }).catch((error: unknown) => {
      logError('Compartilhar resumo', error);
    });
  }

  return (
    <View>
      <Text style={styles.sectionLabel}>Resumo</Text>
      <View style={styles.statRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNum}>{summary.total}</Text>
          <Text style={styles.statLabel}>comunicações no total</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNum}>{summary.topCategory.count}</Text>
          <Text style={styles.statLabel}>{summary.topCategory.label}</Text>
        </View>
      </View>

      <Text style={styles.sectionLabel}>Últimos 7 dias</Text>
      <View style={styles.block}>
        {summary.last7Days.map((day, index) => (
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
        <Pressable style={styles.addContactButton} onPress={handleShareReport}>
          <Text style={styles.addButtonLabel}>Compartilhar resumo</Text>
        </Pressable>
        <View style={styles.recentList}>
          {summary.recent.length > 0 ? (
            summary.recent.map((event) => (
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
