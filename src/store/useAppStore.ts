import { create } from 'zustand';

import { writeCache } from '../services/localCache';
import type { CommunicationItem } from '../types/communication';
import type { EmergencyContact, EmergencySosAlert } from '../types/emergency';
import type { CommunicationEvent } from '../types/evolution';

export type FontScale = 1 | 1.25 | 1.5;

export const FONT_SCALE_CACHE_KEY = 'falar:fontScale';
export const LOW_LITERACY_MODE_CACHE_KEY = 'falar:lowLiteracyMode';

interface AppState {
  itemsByCategory: Record<string, CommunicationItem[]>;
  emergencyContacts: EmergencyContact[];
  lastSosAlert: EmergencySosAlert | null;
  events: CommunicationEvent[];
  showAdmin: boolean;
  fontScale: FontScale;
  lowLiteracyMode: boolean;
  setItemsByCategory: (itemsByCategory: Record<string, CommunicationItem[]>) => void;
  setEmergencyContacts: (emergencyContacts: EmergencyContact[]) => void;
  setLastSosAlert: (lastSosAlert: EmergencySosAlert | null) => void;
  setEvents: (events: CommunicationEvent[]) => void;
  setShowAdmin: (showAdmin: boolean) => void;
  setFontScale: (fontScale: FontScale) => void;
  setLowLiteracyMode: (enabled: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  itemsByCategory: {},
  emergencyContacts: [],
  lastSosAlert: null,
  events: [],
  showAdmin: false,
  fontScale: 1,
  lowLiteracyMode: false,
  setItemsByCategory: (itemsByCategory) => set({ itemsByCategory }),
  setEmergencyContacts: (emergencyContacts) => set({ emergencyContacts }),
  setLastSosAlert: (lastSosAlert) => set({ lastSosAlert }),
  setEvents: (events) => set({ events }),
  setShowAdmin: (showAdmin) => set({ showAdmin }),
  setFontScale: (fontScale) => {
    set({ fontScale });
    writeCache(FONT_SCALE_CACHE_KEY, fontScale);
  },
  setLowLiteracyMode: (lowLiteracyMode) => {
    set({ lowLiteracyMode });
    writeCache(LOW_LITERACY_MODE_CACHE_KEY, lowLiteracyMode);
  },
}));
