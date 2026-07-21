import { create } from 'zustand';

import { writeCache } from '../services/localCache';
import type { CommunicationItem } from '../types/communication';
import type { EmergencyContact } from '../types/emergency';
import type { CommunicationEvent } from '../types/evolution';

export type FontScale = 1 | 1.25 | 1.5;

export const FONT_SCALE_CACHE_KEY = 'falar:fontScale';

interface AppState {
  itemsByCategory: Record<string, CommunicationItem[]>;
  emergencyContacts: EmergencyContact[];
  events: CommunicationEvent[];
  showAdmin: boolean;
  fontScale: FontScale;
  setItemsByCategory: (itemsByCategory: Record<string, CommunicationItem[]>) => void;
  setEmergencyContacts: (emergencyContacts: EmergencyContact[]) => void;
  setEvents: (events: CommunicationEvent[]) => void;
  setShowAdmin: (showAdmin: boolean) => void;
  setFontScale: (fontScale: FontScale) => void;
}

export const useAppStore = create<AppState>((set) => ({
  itemsByCategory: {},
  emergencyContacts: [],
  events: [],
  showAdmin: false,
  fontScale: 1,
  setItemsByCategory: (itemsByCategory) => set({ itemsByCategory }),
  setEmergencyContacts: (emergencyContacts) => set({ emergencyContacts }),
  setEvents: (events) => set({ events }),
  setShowAdmin: (showAdmin) => set({ showAdmin }),
  setFontScale: (fontScale) => {
    set({ fontScale });
    writeCache(FONT_SCALE_CACHE_KEY, fontScale);
  },
}));
