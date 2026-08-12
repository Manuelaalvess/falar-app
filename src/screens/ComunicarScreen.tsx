import { useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useShallow } from 'zustand/react/shallow';

import { CategoryGrid } from '../components/comunicar/CategoryGrid';
import { ItemConfirmOverlay } from '../components/comunicar/ItemConfirmOverlay';
import { ItemGrid } from '../components/comunicar/ItemGrid';
import { SimNaoBar } from '../components/comunicar/SimNaoBar';
import { comunicarStyles as styles } from '../components/comunicar/comunicarStyles';
import { CORE_NAO_ITEM, CORE_SIM_ITEM, withoutCoreResponseItems } from '../constants/communication';
import { useCommunicationCategories, usePrecisoCategory } from '../hooks/useCommunicationCategories';
import { useSpeakItem } from '../hooks/useSpeakItem';
import { useAppStore } from '../store/useAppStore';
import { sortItemsByUsage } from '../utils/personalization';

interface ComunicarScreenProps {
  uid: string;
}

export function ComunicarScreen({ uid }: ComunicarScreenProps) {
  const { itemsByCategory, events, fontScale, lowLiteracyMode } = useAppStore(
    useShallow((state) => ({
      itemsByCategory: state.itemsByCategory,
      events: state.events,
      fontScale: state.fontScale,
      lowLiteracyMode: state.lowLiteracyMode,
    })),
  );

  const [openCategoryKey, setOpenCategoryKey] = useState<string | null>(null);
  const categories = useCommunicationCategories();
  const precisoCategory = usePrecisoCategory();

  const { confirmedItem, chooseItem } = useSpeakItem(uid);

  const openCategory = categories.find((category) => category.key === openCategoryKey);

  const items = useMemo(() => {
    if (!openCategoryKey) return [];
    const raw = withoutCoreResponseItems(itemsByCategory[openCategoryKey] ?? []);
    return sortItemsByUsage(raw, events, openCategoryKey);
  }, [itemsByCategory, openCategoryKey, events]);

  return (
    <View style={styles.container}>
      {!openCategory ? (
        <View style={styles.homeContent}>
          <SimNaoBar
            simItem={CORE_SIM_ITEM}
            naoItem={CORE_NAO_ITEM}
            category={precisoCategory}
            fontScale={fontScale}
            onChoose={chooseItem}
          />
          <CategoryGrid
            categories={categories}
            fontScale={fontScale}
            lowLiteracyMode={lowLiteracyMode}
            onOpenCategory={setOpenCategoryKey}
            compact
          />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <SimNaoBar
            simItem={CORE_SIM_ITEM}
            naoItem={CORE_NAO_ITEM}
            category={precisoCategory}
            fontScale={fontScale}
            onChoose={chooseItem}
          />
          <ItemGrid
            category={openCategory}
            items={items}
            fontScale={fontScale}
            lowLiteracyMode={lowLiteracyMode}
            onBack={() => setOpenCategoryKey(null)}
            onChooseItem={(item) => chooseItem(item, openCategory)}
          />
        </ScrollView>
      )}

      {confirmedItem ? <ItemConfirmOverlay item={confirmedItem} fontScale={fontScale} /> : null}
    </View>
  );
}
