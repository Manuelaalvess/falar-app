import { create } from 'zustand';

import { writeCache } from '../services/localCache';
import type { CommunicationItem } from '../types/communication';
import type { EmergencyContact, EmergencySosAlert } from '../types/emergency';
import type { CommunicationEvent } from '../types/evolution';

export type FontScale = 1 | 1.25 | 1.5;

export const FONT_SCALE_CACHE_KEY = 'falar:fontScale';
export const SWITCH_SCANNING_CACHE_KEY = 'falar:switchScanning';

interface AppState {
  itemsByCategory: Record<string, CommunicationItem[]>;
  emergencyContacts: EmergencyContact[];
  lastSosAlert: EmergencySosAlert | null;
  events: CommunicationEvent[];
  showAdmin: boolean;
  fontScale: FontScale;
  switchScanningEnabled: boolean;
  setItemsByCategory: (itemsByCategory: Record<string, CommunicationItem[]>) => void;
  setEmergencyContacts: (emergencyContacts: EmergencyContact[]) => void;
  setLastSosAlert: (lastSosAlert: EmergencySosAlert | null) => void;
  setEvents: (events: CommunicationEvent[]) => void;
  setShowAdmin: (showAdmin: boolean) => void;
  setFontScale: (fontScale: FontScale) => void;
  setSwitchScanningEnabled: (enabled: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  itemsByCategory: {},
  emergencyContacts: [],
  lastSosAlert: null,
  events: [],
  showAdmin: false,
  fontScale: 1,
  switchScanningEnabled: false,
  setItemsByCategory: (itemsByCategory) => set({ itemsByCategory }),
  setEmergencyContacts: (emergencyContacts) => set({ emergencyContacts }),
  setLastSosAlert: (lastSosAlert) => set({ lastSosAlert }),
  setEvents: (events) => set({ events }),
  setShowAdmin: (showAdmin) => set({ showAdmin }),
  setFontScale: (fontScale) => {
    set({ fontScale });
    writeCache(FONT_SCALE_CACHE_KEY, fontScale);
  },
  setSwitchScanningEnabled: (switchScanningEnabled) => {
    set({ switchScanningEnabled });
    writeCache(SWITCH_SCANNING_CACHE_KEY, switchScanningEnabled);
  },
}));
