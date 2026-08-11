import { useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useShallow } from 'zustand/react/shallow';

import { CategoryGrid } from '../components/comunicar/CategoryGrid';
import { ItemConfirmOverlay } from '../components/comunicar/ItemConfirmOverlay';
import { ItemGrid } from '../components/comunicar/ItemGrid';
import { SimNaoBar } from '../components/comunicar/SimNaoBar';
import { comunicarStyles as styles } from '../components/comunicar/comunicarStyles';
import { EmergencySheet } from '../components/EmergencySheet';
import { SosBar } from '../components/SosBar';
import { CATEGORIES } from '../constants/communication';
import { useSosDoublePress } from '../hooks/useSosDoublePress';
import { useSpeakItem } from '../hooks/useSpeakItem';
import { useAppStore } from '../store/useAppStore';
import { sortItemsByUsage } from '../utils/personalization';

interface ComunicarScreenProps {
  uid: string;
}

export function ComunicarScreen({ uid }: ComunicarScreenProps) {
  const { itemsByCategory, emergencyContacts, events, fontScale, lowLiteracyMode } = useAppStore(
    useShallow((state) => ({
      itemsByCategory: state.itemsByCategory,
      emergencyContacts: state.emergencyContacts,
      events: state.events,
      fontScale: state.fontScale,
      lowLiteracyMode: state.lowLiteracyMode,
    })),
  );

  const [openCategoryKey, setOpenCategoryKey] = useState<string | null>(null);
  const [showSOS, setShowSOS] = useState(false);

  const { confirmedItem, chooseItem } = useSpeakItem(uid);
  const { busy: sosBusy, handleDoublePress } = useSosDoublePress(uid, emergencyContacts);

  const openCategory = CATEGORIES.find((category) => category.key === openCategoryKey);
  const precisoCategory = CATEGORIES.find((category) => category.key === 'preciso');
  const precisoItems = itemsByCategory.preciso ?? [];
  const simItem = precisoItems.find((item) => item.name === 'Sim');
  const naoItem = precisoItems.find((item) => item.name === 'Não');

  const items = useMemo(() => {
    if (!openCategoryKey) return [];
    const raw = itemsByCategory[openCategoryKey] ?? [];
    return sortItemsByUsage(raw, events, openCategoryKey);
  }, [itemsByCategory, openCategoryKey, events]);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <SosBar
          busy={sosBusy}
          onSinglePress={() => setShowSOS(true)}
          onDoublePress={() => void handleDoublePress()}
        />

        {lowLiteracyMode && simItem && naoItem ? (
          <SimNaoBar
            simItem={simItem}
            naoItem={naoItem}
            category={precisoCategory}
            fontScale={fontScale}
            onChoose={chooseItem}
          />
        ) : null}

        {!openCategory ? (
          <CategoryGrid
            categories={CATEGORIES}
            fontScale={fontScale}
            lowLiteracyMode={lowLiteracyMode}
            onOpenCategory={setOpenCategoryKey}
          />
        ) : (
          <ItemGrid
            category={openCategory}
            items={items}
            fontScale={fontScale}
            lowLiteracyMode={lowLiteracyMode}
            onBack={() => setOpenCategoryKey(null)}
            onChooseItem={(item) => chooseItem(item, openCategory)}
          />
        )}
      </ScrollView>

      {confirmedItem ? <ItemConfirmOverlay item={confirmedItem} fontScale={fontScale} /> : null}

      <EmergencySheet
        visible={showSOS}
        contacts={emergencyContacts}
        onClose={() => setShowSOS(false)}
      />
    </View>
  );
}
