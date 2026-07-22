import { Pressable, Share, Text, View } from 'react-native';

import type { CommunicationEvent } from '../../types/evolution';
import {
  buildTherapistReport,
  getLast7DaysCounts,
  getRecentEvents,
  getTopCategory,
} from '../../utils/evolutionStats';
import { styles } from './adminStyles';

interface EvolucaoTabProps {
  patientName: string;
  events: CommunicationEvent[];
}

export function EvolucaoTab({ patientName, events }: EvolucaoTabProps) {
  const total = events.length;
  const topCategory = getTopCategory(events);
  const last7Days = getLast7DaysCounts(events);
  const maxCount = Math.max(1, ...last7Days.map((day) => day.count));
  const recent = getRecentEvents(events, 8);
  const report = buildTherapistReport(patientName, events);

  function handleShareReport() {
    Share.share({ message: report }).catch((error: unknown) => {
      console.error('Falha ao compartilhar resumo:', error);
    });
  }

  return (
    <View>
      <Text style={styles.sectionLabel}>Resumo</Text>
      <View style={styles.statRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNum}>{total}</Text>
          <Text style={styles.statLabel}>comunicações no total</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNum}>{topCategory.count}</Text>
          <Text style={styles.statLabel}>{topCategory.label}</Text>
        </View>
      </View>

      <Text style={styles.sectionLabel}>Últimos 7 dias</Text>
      <View style={styles.block}>
        {last7Days.map((day, index) => (
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
          {recent.length > 0 ? (
            recent.map((event) => (
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
