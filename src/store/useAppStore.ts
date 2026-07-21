import { create } from 'zustand';

import type { CommunicationItem } from '../types/communication';
import type { EmergencyContact } from '../types/emergency';

interface AppState {
  itemsByCategory: Record<string, CommunicationItem[]>;
  emergencyContacts: EmergencyContact[];
  showAdmin: boolean;
  setItemsByCategory: (itemsByCategory: Record<string, CommunicationItem[]>) => void;
  setEmergencyContacts: (emergencyContacts: EmergencyContact[]) => void;
  setShowAdmin: (showAdmin: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  itemsByCategory: {},
  emergencyContacts: [],
  showAdmin: false,
  setItemsByCategory: (itemsByCategory) => set({ itemsByCategory }),
  setEmergencyContacts: (emergencyContacts) => set({ emergencyContacts }),
  setShowAdmin: (showAdmin) => set({ showAdmin }),
}));
