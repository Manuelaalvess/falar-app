import { create } from 'zustand';

import type { CommunicationItem } from '../types/communication';
import type { EmergencyContact } from '../types/emergency';
import type { CommunicationEvent } from '../types/evolution';

interface AppState {
  itemsByCategory: Record<string, CommunicationItem[]>;
  emergencyContacts: EmergencyContact[];
  events: CommunicationEvent[];
  showAdmin: boolean;
  setItemsByCategory: (itemsByCategory: Record<string, CommunicationItem[]>) => void;
  setEmergencyContacts: (emergencyContacts: EmergencyContact[]) => void;
  setEvents: (events: CommunicationEvent[]) => void;
  setShowAdmin: (showAdmin: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  itemsByCategory: {},
  emergencyContacts: [],
  events: [],
  showAdmin: false,
  setItemsByCategory: (itemsByCategory) => set({ itemsByCategory }),
  setEmergencyContacts: (emergencyContacts) => set({ emergencyContacts }),
  setEvents: (events) => set({ events }),
  setShowAdmin: (showAdmin) => set({ showAdmin }),
}));
